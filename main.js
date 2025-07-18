// main.js: Refactored PDF generation with signature and merging
import { getPdfDefinitions } from "./pdfConfig.js";
import { getProductDefinitions } from "./productConfig.js";


// CONSTANTS
const DEBUG_MODE = false;
if (DEBUG_MODE) {
    const tag = document.createElement("div");
    tag.textContent = "DEBUG MODE: Validation Disabled";
    tag.style.color = "red";
    tag.style.fontSize = "0.9rem";
    tag.style.fontWeight = "bold";
    tag.style.marginBottom = "1rem";
    document.body.prepend(tag);
    window.addEventListener("DOMContentLoaded", () => {
        const requiredElements = document.querySelectorAll("[required]");
        requiredElements.forEach(el => el.removeAttribute("required"));
        console.log("DEBUG_MODE is ON — all required attributes removed.");
    });
}

const COSTS = "bis 4180.00"; // Default costs for the product

const EXTRA_DEFAULT_CHECKS = ["ease_care", "enable_care", "self_sufficiency"];

// deprecated
const PRICE_LIST = {
    grab_bars: 50,
    railings: 75,
    raised_toilet: 300,
    angle_valve: 100,
    shower_toilet: 1200,
    threshold_removal: 80,
    ramps: 200,
    door_widening: 400,
    sliding_door: 500,
    bathroom_door_slant: 150,
    wheelchair_sink: 250,
    sink_faucet: 100,
    bathtub_to_shower: 4179.28,
    shower_to_shower: 4179.28,
    floor_drain: 0,
    side_drain: 0,
    platform_requested: 300,
    pumping_system: 600,
    bathtub_with_entry: 4179.28,
    shower_curtain: 50,
    glass_partition: 800,
    non_slip_floor: 250,
    floor_complete: 1000,
    floor_shower_only: 400,
    floor_pvc: 300,
    tiles_complete: 1500,
    tiles_bath_area: 800,
    tiles_faucet: 200
};

const DUMMY_DATA = {
    // Basic Info
    first_name: "Max",
    last_name: "Mustermann",
    birthdate: "1990-01-01",
    insurance_number: "0123456789",
    insurance_provider: "tk",
    insurance_provider_other: "",
    street: "Musterstraße 1",
    zip_code: "12345",
    city: "Musterstadt",
    email: "max.mustermann@gmail.com",
    phone_number: "0123456789",
    reference: "Dr. Beispiel",
    signatureDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format

    // Gender
    male: true,
    female: false,

    // Care Level & Floor
    care_level: "2",
    aid_fund: false,
    floor: "2",
    elevator: true,

    // Diagnosis
    // diagnosis: {
    bed: false,
    walk: true,
    walker: false,
    wheelchair: true,
    always: true,
    other_diagnosis: "Diabetes Typ 2",
    // },

    // Care Taker
    care_taker_enabled: true,
    // care_taker: {
    care_taker_first_name: "Anna",
    care_taker_last_name: "Musterfrau",
    care_taker_street: "Betreuerweg 5",
    care_taker_zip_city: "54321 Betreuerstadt",
    care_taker_phone_number: "0987654321",
    care_taker_mail: "anna.musterfrau@example.com",
    care_taker_fax: "0987654322",
    // },

    // Landlord
    landlord_enabled: true,
    // landlord: {
    landlord_full_name: "Herr Vermieter",
    landlord_street: "Vermieterstraße 10",
    landlord_zip_city: "11111 Mietstadt",
    landlord_phone_number: "030123456",
    landlord_fax: "030123457"
    // }
};

['bed', 'walk', 'walker', 'wheelchair', 'always', 'elevator', 'aid_fund'].forEach((key) => {
    console.log(`Adding boolean fields for ${key} set to ${DUMMY_DATA[key]}`);
    DUMMY_DATA[`${key}_yes`] = DUMMY_DATA[key] === true;
    DUMMY_DATA[`${key}_no`] = DUMMY_DATA[key] === false;
});

const angle_valve_type = "outside"; // "inside" or "outside"
const raised_toilet_type = "wall"; // "stand" or "wall"
const raised_toilet_dummy = false; // Whether raised toilet is requested
const angle_valve_dummy = true; // Whether angle valve is requested

const DUMMY_PRODUCT_DATA = {
    grab_bars: "true",
    grab_bars_count: "2",
    railings: true,
    railings_count: "1",
    raised_toilet: raised_toilet_dummy,
    raised_toilet_stand: raised_toilet_type === "stand" && raised_toilet_dummy,
    raised_toilet_wall: raised_toilet_type === "wall" && raised_toilet_dummy,
    angle_valve: angle_valve_dummy,
    angle_valve_outside: angle_valve_type === "outside" && angle_valve_dummy,
    angle_valve_inside: angle_valve_type === "inside" && angle_valve_dummy,
    shower_toilet: false,
    threshold_removal: true,
    threshold_removal_count: "1",
    ramps: true,
    ramps_count: "1",
    door_widening: false,
    door_widening_count: "0",
    sliding_door: true,
    sliding_door_count: "1",
    bathroom_door_slant: false,
    wheelchair_sink: true,
    sink_faucet: true,
    bathtub_to_shower: false,
    shower_to_shower: true,
    floor_drain: true,
    side_drain: false,
    platform_requested: false,
    pumping_system: false,
    bathtub_with_entry: false,
    shower_curtain: true,
    glass_partition: false,
    non_slip_floor: true,
    floor_complete: false,
    floor_shower_only: true,
    floor_pvc: false,
    tiles_complete: false,
    tiles_bath_area: true,
    tiles_faucet: false,
    costs: "bis 4180.00"
};


const form = document.getElementById("data-form");
const saveBtn = document.getElementById("save-pdf");
const canvas = document.getElementById("signature-pad");
const clearBtn = document.getElementById("clear-signature");
const openBtn = document.getElementById("open-pdf");
const insuranceSelect = document.getElementById('insurance_provider');
const otherInsuranceInput = document.getElementById('insurance_provider_other');
const careTakerSelect = document.getElementById('toggle_care_taker');
const landlordSelect = document.getElementById('toggle_landlord');

const loadingOverlay = document.getElementById("loading-overlay");


document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("signing-date");
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    dateInput.value = today;
});


// deprecated
// const costsInput = form.querySelector("input[name='costs']");

let latestPDFBytesArray = [];

let mergedBytes = null;


const signaturePad = new SignaturePad(canvas);


// Resize canvas to match display size
function resizeCanvasToDisplaySize() {
    if (!signaturePad) return;

    // Save the current signature data
    const data = signaturePad.toData();

    // Resize the canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Reapply the signature data
    signaturePad.clear(); // Clear first
    signaturePad.fromData(data);
}
resizeCanvasToDisplaySize();

window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize();
});

// Register Service Worker if available
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js")
            .then(registration => {
                console.log("Service Worker registered:", registration);
            })
            .catch(error => {
                console.error("Service Worker registration failed:", error);
            });
    });
}

// Check if caches are available and log them
if ('caches' in window) {
    caches.keys().then(keys => {
        console.log('Available caches:', keys);
        return caches.open(keys[0]);
    }).then(cache => {
        return cache.keys();
    }).then(requests => {
        console.log('Cached files:');
        requests.forEach(req => console.log(req.url));
    });
}



// deprecated
function calculateCosts() {
    const productData = getProductData();
    let totalCost = 0;

    let total = 0;

    // Calculate costs based on productData
    for (const [key, value] of Object.entries(productData)) {
        if (value === true || value === "true") {
            const count = parseInt(productData[`${key}_count`] || '1', 10);
            const price = PRICE_LIST[key] || 0;
            total += price * count;
        }
    }
    // Add the total to the costs input field
    totalCost += total;
    // Add the costs from the form input field

    console.log("Total Cost:", totalCost);
    // Update the UI with the total cost if needed
    costsInput.value = totalCost.toFixed(2); // Assuming costsInput is a number input field
    costsInput.dispatchEvent(new Event('input')); // Trigger input event to update any listeners

}

async function mergePDFs(pdfBytesArray) {
    const mergedPdf = await PDFLib.PDFDocument.create();
    for (const pdfBytes of pdfBytesArray) {
        const pdf = await PDFLib.PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
}

function splitTextIntoChunks(text, count) {
    const words = text.split(/\s+/);
    const chunks = Array.from({ length: count }, () => "");

    let currentChunk = 0;
    for (const word of words) {
        if ((chunks[currentChunk] + " " + word).trim().length > 110 && currentChunk < count - 1) {
            currentChunk++;
        }
        chunks[currentChunk] += (chunks[currentChunk] ? " " : "") + word;
    }

    return chunks;
}

function fillMultiFieldGroup(baseFieldName, fullText, form, pdfFields) {
    console.log(`Fill Multi Group "${baseFieldName}" (text: ${fullText})`);
    const singleField = pdfFields.find(f => f.getName() === baseFieldName);

    if (singleField) {
        console.log(`Using single multiline field: ${baseFieldName}`);
        form.getTextField(baseFieldName).setText(fullText);
        return;
    }
    // Detect existing fields like 'product_1', 'product_2', etc.
    const matchingFields = pdfFields
        .map(f => f.getName())
        .filter(name => name.startsWith(baseFieldName + "_"))
        .sort((a, b) => {
            const numA = parseInt(a.split("_")[1], 10);
            const numB = parseInt(b.split("_")[1], 10);
            return numA - numB;
        });

    const count = matchingFields.length;
    const chunks = splitTextIntoChunks(fullText, count);

    console.log(`Found ${count} fields for "${baseFieldName}":`, matchingFields);

    for (let i = 0; i < count; i++) {
        const fieldName = `${baseFieldName}_${i + 1}`;
        try {
            form.getTextField(fieldName).setText(chunks[i] || "");
            form.getTextField(fieldName).setFontSize(9);
        } catch (e) {
            console.warn(`Could not set field: ${fieldName}`, e);
        }
    }
}

async function loadAndFillForm(path, fields) {
    const existingPdfBytes = await fetch(path).then(res => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    const pdfFields = form.getFields();

    const processedFieldGroups = new Set();

    for (const pdfField of pdfFields) {
        const name = pdfField.getName();
        const type = pdfField.constructor.name; // Detect type: PDFTextField, PDFCheckBox, etc.

        let baseFieldName = null;

        if (name.includes("product")) baseFieldName = "product";
        else if (name.includes("living_conditions")) baseFieldName = "living_conditions";

        if (baseFieldName && !processedFieldGroups.has(baseFieldName)) {

            const baseFieldName = name.includes("product") ? "product" : "living_conditions";
            const productData = DEBUG_MODE ? DUMMY_PRODUCT_DATA : getProductData();

            let productType = null;

            const productDefinitions = getProductDefinitions([productData]);


            const fullText = baseFieldName === "product"
                ? (productDefinitions?.description ?? "")
                : (productDefinitions?.reason ?? "");

            console.log(fullText);

            fillMultiFieldGroup(baseFieldName, fullText, form, pdfFields);
            processedFieldGroups.add(baseFieldName);
            continue;
        }

        if (name.includes("default_check") || EXTRA_DEFAULT_CHECKS.includes(name)) {
            form.getCheckBox(name).check();
        }

        if (!(name in fields)) continue; // Skip if not in provided data

        const value = fields[name];
        console.log(`Setting field ${name} (type: ${type}) to value: ${value}`);

        console.log(`constructor name: ${pdfField.constructor.name}, type: ${type}`)
        if (type === 'r') {
            form.getTextField(name).setText(value);
            // if count in name, set the alignment to right
            if (name.includes('count')) {
                form.getTextField(name).setAlignment(PDFLib.TextAlignment.Right);
                // form.getTextField(name).setFontSize(10); // Adjust font size if needed
            }

        } else if (type === 'e') {
            // Use value truthiness or check for a specific string like "on", "yes", etc.
            if (value === true) {
                form.getCheckBox(name).check();
            } else {
                form.getCheckBox(name).uncheck();
            }
        }
        // You can add support for dropdowns or radio buttons here if needed
    }

    return pdfDoc;
}


async function applySignatureToPdf(pdfDoc, fieldName, signaturePage) {
    if (signaturePad.isEmpty()) return;
    const form = pdfDoc.getForm();
    const pdfFields = form.getFields();
    if (!pdfFields.some(field => field.getName() === fieldName)) {
        console.log(`Signature field "${fieldName}" not found in the PDF.`);
        return;
    }
    const signatureField = form.getTextField(fieldName);
    console.log("Signature Field:", signatureField);
    if (!signatureField) {
        // console.error(`Signature field "${fieldName}" not found in the PDF.`);
        return;
    }
    signatureField.setText("");
    signatureField.enableReadOnly();

    const signatureDataURL = signaturePad.toDataURL();
    const signatureImage = await pdfDoc.embedPng(signatureDataURL);



    signatureField.setImage(signatureImage)
}

function getProductData() {
    // return the productData object
    const raised_toilet = document.querySelector('input[name="raised_toilet"]').checked;
    const raised_toilet_type = document.querySelector('input[name="raised_toilet_type"]:checked')?.value || "";

    const angle_valve = document.querySelector('input[name="angle_valve"]').checked
    const angle_valve_type = document.querySelector('input[name="angle_valve_type"]:checked')?.value || "";

    console.log("raisedToiletType:", raised_toilet_type);
    console.log("angle_valve_type:", angle_valve_type);


    const productData = {
        // Grab bars and railings
        grab_bars: document.querySelector('input[name="grab_bars"]').checked,
        grab_bars_count: document.querySelector('input[name="grab_bars_count"]').value || '0',

        railings: document.querySelector('input[name="railings"]').checked,
        railings_count: document.querySelector('input[name="railings_count"]').value || '0',

        // Raised toilet
        raised_toilet: raised_toilet,
        // raised_toilet_type: document.querySelector('input[name="raised_toilet_type"]:checked')?.value || "",
        raised_toilet_stand: raised_toilet_type === "stand" && raised_toilet,
        raised_toilet_wall: raised_toilet_type === "wall" && raised_toilet,

        // Angle valve
        angle_valve: document.querySelector('input[name="angle_valve"]').checked,
        // angle_valve_type: document.querySelector('input[name="angle_valve_type"]:checked')?.value || "",
        angle_valve_inside: angle_valve_type === "inside" && angle_valve,
        angle_valve_outside: angle_valve_type === "outside" && angle_valve,

        // Other checkboxes with optional counts
        shower_toilet: document.querySelector('input[name="shower_toilet"]').checked,
        threshold_removal: document.querySelector('input[name="threshold_removal"]').checked,
        threshold_removal_count: document.querySelector('input[name="threshold_removal_count"]').value || '0',

        ramps: document.querySelector('input[name="ramps"]').checked,
        ramps_count: document.querySelector('input[name="ramps_count"]').value || '0',

        door_widening: document.querySelector('input[name="door_widening"]').checked,
        door_widening_count: document.querySelector('input[name="door_widening_count"]').value || '0',

        sliding_door: document.querySelector('input[name="sliding_door"]').checked,
        sliding_door_count: document.querySelector('input[name="sliding_door_count"]').value || '0',

        bathroom_door_slant: document.querySelector('input[name="bathroom_door_slant"]').checked,

        // Waschbereich
        wheelchair_sink: document.querySelector('input[name="wheelchair_sink"]').checked,
        sink_faucet: document.querySelector('input[name="sink_faucet"]').checked,

        // Dusche & Bad
        bathtub_to_shower: document.querySelector('input[name="bathtub_to_shower"]').checked,
        shower_to_shower: document.querySelector('input[name="shower_to_shower"]').checked,
        floor_drain: document.querySelector('input[name="floor_drain"]').checked,
        side_drain: document.querySelector('input[name="side_drain"]').checked,
        platform_requested: document.querySelector('input[name="platform_requested"]').checked,
        pumping_system: document.querySelector('input[name="pumping_system"]').checked,
        bathtub_with_entry: document.querySelector('input[name="bathtub_with_entry"]').checked,
        shower_curtain: document.querySelector('input[name="shower_curtain"]').checked,
        glass_partition: document.querySelector('input[name="glass_partition"]').checked,
        non_slip_floor: document.querySelector('input[name="non_slip_floor"]').checked,

        // Bodenbelag
        floor_complete: document.querySelector('input[name="floor_complete"]').checked,
        floor_shower_only: document.querySelector('input[name="floor_shower_only"]').checked,
        floor_pvc: document.querySelector('input[name="floor_pvc"]').checked,

        // Wandfliesen
        tiles_complete: document.querySelector('input[name="tiles_complete"]').checked,
        tiles_bath_area: document.querySelector('input[name="tiles_bath_area"]').checked,
        tiles_faucet: document.querySelector('input[name="tiles_faucet"]').checked,

        // Extras 
        // other_services: document.querySelector('input[name="other_products"]').checked,
        other_products: document.querySelector('input[name="other_products_details"]').value || "",

        // Costs
        // costs: document.querySelector('input[name="costs"]').value || "0"
        costs: COSTS // Use the constant COSTS for default value
    };

    return productData;
}

function getFormData() {
    const formData = {
        // Basic Info
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        birthdate: document.getElementById("birthdate").value,
        insurance_number: document.getElementById("insurance_number").value,
        insurance_provider: document.getElementById("insurance_provider").value,
        insurance_provider_other: document.getElementById("insurance_provider_other").value,
        street: document.getElementById("street").value,
        zip_code: document.getElementById("zip").value,
        city: document.getElementById("city").value,
        email: document.getElementById("email").value,
        phone_number: document.getElementById("phone").value,
        reference: document.getElementById("reference").value,
        signatureDate: document.getElementById("signing-date").value,

        // Gender
        male: document.getElementById("gender_male").checked,
        female: document.getElementById("gender_female").checked,

        // Care Level & Floor
        aid_fund: document.getElementById("aid_fund").checked,
        care_level: document.getElementById("care_level").value.split("_")[1] || "",

        floor: document.getElementById("floor").value,
        elevator: document.getElementById("elevator").checked,
        // Diagnosis
        // diagnosis: {
        bed: document.getElementById('bed').checked,
        walk: document.getElementById('walk').checked,
        walker: document.getElementById('walker').checked,
        wheelchair: document.getElementById('wheelchair').checked,
        always: document.getElementById('always').checked,
        other_diagnosis: document.getElementById("other_diagnosis").value,
        // },

        // Care Taker
        // care_taker_enabled: document.getElementById("toggle_care_taker").checked,
        // care_taker: document.getElementById("toggle_care_taker").checked ? {
        care_taker_first_name: document.getElementById('care_taker_first_name').value,
        care_taker_last_name: document.getElementById('care_taker_last_name').value,
        care_taker_street: document.getElementById('care_taker_street').value,
        care_taker_zip_city: document.getElementById('care_taker_zip_city').value,
        care_taker_phone: document.getElementById('care_taker_phone').value,
        care_taker_email: document.getElementById('care_taker_email').value,
        care_taker_fax: document.getElementById('care_taker_fax').value,
        // } : null,

        // Landlord
        // landlord_enabled: document.getElementById("toggle_landlord").checked,
        // landlord: document.getElementById("toggle_landlord").checked ? {
        landlord_full_name: document.getElementById('landlord_full_name').value,
        landlord_street: document.getElementById('landlord_street').value,
        landlord_zip_city: document.getElementById('landlord_zip_city').value,
        landlord_phone: document.getElementById('landlord_phone').value,
        landlord_fax: document.getElementById('landlord_fax').value
        // } : null
    };

    // Convert boolean fields to yes/no fields
    ['bed', 'walk', 'walker', 'wheelchair', 'always', 'elevator', 'aid_fund'].forEach((key) => {
        console.log('AID_FUND', formData[key])
        formData[`${key}_yes`] = formData[key] === true;
        formData[`${key}_no`] = formData[key] === false;
    });

    return formData;
}


async function generatePdf() {
    let formData = DEBUG_MODE ? DUMMY_DATA : getFormData();

    let productData = DEBUG_MODE ? DUMMY_PRODUCT_DATA : getProductData();

    if (formData.insurance_provider === 'Andere') {
        formData.insurance_provider = document.getElementById("insurance_provider_other").value;
    }

    const pdfDefinitions = getPdfDefinitions(formData, productData);

    // if other insurance is selected, add the text to the insurance_provider field
    if (formData.insurance_provider === 'Andere') {
        formData.insurance_provider = document.getElementById("insurance_provider_other").value;
    }

    latestPDFBytesArray = [];

    for (const def of pdfDefinitions) {
        const pdfDoc = await loadAndFillForm(def.path, def.fields(formData, productData));
        await applySignatureToPdf(pdfDoc, "signature", def.signaturePage);
        latestPDFBytesArray.push(await pdfDoc.save());
    }

    saveBtn.disabled = false;
    openBtn.disabled = false;
}

insuranceSelect.addEventListener('change', function () {
    if (insuranceSelect.value === 'Andere') {
        otherInsuranceInput.style.display = 'block';
        otherInsuranceInput.required = true;
    } else {
        otherInsuranceInput.style.display = 'none';
        otherInsuranceInput.required = false;
        otherInsuranceInput.value = '';
    }
});

careTakerSelect.addEventListener('change', function () {
    document.querySelector(".care_taker-info").style.display = this.checked ? "flex" : "none";
});

landlordSelect.addEventListener('change', function () {
    document.querySelector(".landlord-info").style.display = this.checked ? "flex" : "none";
}
);

function isIos() {
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isInStandaloneMode() {
    return ('standalone' in window.navigator) && (window.navigator.standalone);
}

form.addEventListener("reset", () => {
    form.reset();
    signaturePad.clear();
    form.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
    saveBtn.disabled = true;
    latestPDFBytesArray = [];
});

// Reset diagnosis validation dynamically
function setupDiagnosisValidationListeners() {
    const checkboxes = [
        document.getElementById("bed"),
        document.getElementById("walk"),
        document.getElementById("walker"),
        document.getElementById("wheelchair"),
        document.getElementById("always"),
    ];
    const otherDiagnosis = document.getElementById("other_diagnosis");

    // When typing into the text field
    otherDiagnosis.addEventListener("input", () => {
        otherDiagnosis.setCustomValidity("");
    });

    // When any checkbox is toggled
    checkboxes.forEach(cb =>
        cb.addEventListener("change", () => {
            otherDiagnosis.setCustomValidity("");
        })
    );
}

setupDiagnosisValidationListeners(); // Call once at the start

function validateDiagnosis(e) {
    const checkboxes = [
        document.getElementById("bed"),
        document.getElementById("walk"),
        document.getElementById("walker"),
        document.getElementById("wheelchair"),
        document.getElementById("always"),
    ];
    const otherDiagnosis = document.getElementById("other_diagnosis");
    const isAnyChecked = checkboxes.some(cb => cb.checked);
    const isTextFilled = otherDiagnosis.value.trim() !== "";

    console.log('aefe', isAnyChecked, isTextFilled);

    if (!isAnyChecked && !isTextFilled) {
        e.preventDefault();

        // Show native-like warning near the visible text field
        otherDiagnosis.setCustomValidity("Bitte mindestens eine Diagnose auswählen oder etwas eingeben.");
        otherDiagnosis.reportValidity();
        return false;
    } else {
        // Clear any previous custom message
        otherDiagnosis.setCustomValidity("");
        return true;
    }

}

function validateProducts(e) {
    const productSection = document.getElementById("product-options");
    const checkboxes = productSection.querySelectorAll('input[type="checkbox"]');
    const isChecked = Array.from(checkboxes).some(cb => cb.checked);

    if (!isChecked) {
        e.preventDefault();

        checkboxes.forEach(cb => {
            cb.setCustomValidity("Bitte mindestens eine Leistung auswählen.");
        });

        // Show validity message on the first checkbox so the user sees it
        checkboxes[0].reportValidity();
        return false;
    } else {
        // Clear custom validity on all checkboxes
        checkboxes.forEach(cb => cb.setCustomValidity(""));
        return true;
    }
}

function setupProductValidationListeners() {
    const checkboxes = document.querySelectorAll('#product-options input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            checkboxes.forEach(c => c.setCustomValidity(""));
        });
    });
}
setupProductValidationListeners();

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!DEBUG_MODE && !validateDiagnosis(e)) return;
    if (!DEBUG_MODE && !validateProducts(e)) return;

    loadingOverlay.style.display = "flex"; // Show spinner

    try {
        await generatePdf();
        mergedBytes = await mergePDFs(latestPDFBytesArray);

        const formData = getFormData();
        // let fileName = `${formData.last_name}_${formData.first_name}`;
        // const blob = new Blob([mergedBytes], { type: "application/pdf" });
        // const url = URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        loadingOverlay.style.display = "none"; // Hide spinner
    }

});

openBtn.addEventListener("click", () => {
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    if (isIos() && isInStandaloneMode()) {
        // iOS PWA — trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.pdf`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("PDF download triggered in iOS PWA.");
    } else {
        // Regular browser — open in new tab
        try {
            // Try to open in new tab
            const newTab = window.open(url, "_blank");
            console.log("PDF loaded into previously opened tab.");
            if (!newTab) {
                throw new Error("Popup blocked or failed to open new tab.");
            }
        }
        catch (error) {
            // Fallback to download if new tab fails
            console.log("Failed to open PDF in new tab, falling back to download.", error);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName}.pdf`;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("PDF download triggered as fallback.");

        }
    }
});
// form.querySelectorAll("input[type='checkbox'], input[type='number']").forEach(input => {
//     input.addEventListener("change", calculateCosts);
// });


clearBtn.addEventListener("click", () => {
    signaturePad.clear();
});

saveBtn.addEventListener("click", async () => {
    loadingOverlay.style.display = "flex"; // Show spinner

    try {
        await generatePdf();
        mergedBytes = await mergePDFs(latestPDFBytesArray);
        const shortMergedBytes = await mergePDFs([latestPDFBytesArray[0], latestPDFBytesArray[latestPDFBytesArray.length - 1]]);
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        const blobShort = new Blob([shortMergedBytes], { type: "application/pdf" });

        const formData = getFormData();
        let fileName = `${formData.last_name}_${formData.first_name}`;
        const zip = new JSZip();
        zip.file(`${fileName}_VAG_SBU.pdf`, mergedBytes);
        zip.file(`${fileName}_Antrag.pdf`, shortMergedBytes);
        const zipBlob = await zip.generateAsync({ type: "blob" });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(zipBlob);
        a.download = `${fileName}_VAG.zip`;
        a.click();

        // saveAs(blob, "merged.pdf");
    } catch (error) {
        console.error("Error saving PDF:", error);
    } finally {
        loadingOverlay.style.display = "none"; // Hide spinner
    }
});
