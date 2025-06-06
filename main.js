// main.js: Refactored PDF generation with signature and merging
import { getPdfDefinitions } from "./pdfConfig.js";

const form = document.getElementById("data-form");
const saveBtn = document.getElementById("save-pdf");
const canvas = document.getElementById("signature-pad");
const clearBtn = document.getElementById("clear-signature");
const signaturePad = new SignaturePad(canvas);

const DEBUG_MODE = true;
const dummyData = {
    first_name: "Max",
    last_name: "Mustermann",
    birthdate: "1990-01-01",
    insurance_number: "123456789",
    insurance_provider: "Muster Versicherung",
    street: "Musterstraße 1",
    zip_code: "12345",
    city: "Musterstadt",
    email: "max.mustermann@gmail.com",
    phone_number: "0123456789",
    male: true,
    female: false,
};

const dummyProductData = {
    grab_bars: "true",
    grab_bars_count: "2",
    railings: true,
    railings_count: "1",
    raised_toilet: true,
    raised_toilet_type: "Standard",
    angle_valve: true,
    angle_valve_type: "Standard",
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
    tiles_faucet: false
};


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
const insuranceSelect = document.getElementById('insurance_provider');
const otherInsuranceInput = document.getElementById('insurance_provider_other');


let latestPDFBytesArray = [];

function getRectsFromField(field, doc) {
    return field.acroField.getWidgets().map(widget => {
        const rect = widget.getRectangle();
        rect.pageNumber = doc.getPages().findIndex(x => x.ref === widget.P());
        return rect;
    });
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

async function loadAndFillForm(path, fields) {
    const existingPdfBytes = await fetch(path).then(res => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    const pdfFields = form.getFields();

    for (const pdfField of pdfFields) {
        const name = pdfField.getName();
        const type = pdfField.constructor.name; // Detect type: PDFTextField, PDFCheckBox, etc.

        if (!(name in fields)) continue; // Skip if not in provided data

        const value = fields[name];
        // console.log(`Setting field "${name}" (type: ${type}) to value: ${value}`);

        if (type === 'r') {
            form.getTextField(name).setText(value);
            // if count in name, set the alignment to right
            if (name.includes('count')) {
                form.getTextField(name).setAlignment(PDFLib.TextAlignment.Right);
                // form.getTextField(name).setFontSize(10); // Adjust font size if needed
            }
            
        } else if (type === 'e') {
            // Use value truthiness or check for a specific string like "on", "yes", etc.
            if (value === true || value === "true" || value === "on" || value === "yes") {
                form.getCheckBox(name).check();
                form.getCheckBox(name).updateAppearances();
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
    const signatureField = form.getTextField(fieldName);
    signatureField.setText("");
    signatureField.enableReadOnly();

    const rect = getRectsFromField(signatureField, pdfDoc)[0];
    const signatureDataURL = signaturePad.toDataURL();
    const signatureImage = await pdfDoc.embedPng(signatureDataURL);
    const signatureImageDims = signatureImage.scale(0.25);
    // const page = pdfDoc.getPage(rect.pageNumber + 1); // For some reason I get -1 probably due to the fields not being assigned to a page
    const page = pdfDoc.getPage(signaturePage); // For some reason I get -1 probably due to the fields not being assigned to a page
    page.drawImage(signatureImage, {
        x: rect.x,
        y: rect.y,
        width: signatureImageDims.width,
        height: signatureImageDims.height
    });
}

function getProductData() {
    // return the productData object

    const productData = {
        // Grab bars and railings
        grab_bars: document.querySelector('input[name="grab_bars"]').checked,
        grab_bars_count: document.querySelector('input[name="grab_bars_count"]').value || '0',

        railings: document.querySelector('input[name="railings"]').checked,
        railings_count: document.querySelector('input[name="railings_count"]').value || '0',

        // Raised toilet
        raised_toilet: document.querySelector('input[name="raised_toilet"]').checked,
        raised_toilet_type: document.querySelector('input[name="raised_toilet_type"]:checked')?.value || "",

        // Angle valve
        angle_valve: document.querySelector('input[name="angle_valve"]').checked,
        angle_valve_type: document.querySelector('input[name="angle_valve_type"]:checked')?.value || "",

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
        tiles_faucet: document.querySelector('input[name="tiles_faucet"]').checked
    };

    return productData;
}

function getFormData() {
    const formData = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        // gender: document.querySelector('input[name="gender"]:checked')?.value || "",
        birthdate: document.getElementById("birthdate").value,
        insurance_number: document.getElementById("insurance_number").value,
        insurance_provider: document.getElementById("insurance_provider").value,
        street: document.getElementById("street").value,
        zip_code: document.getElementById("zip").value,
        city: document.getElementById("city").value,
        email: document.getElementById("email").value,
        phone_number: document.getElementById("phone").value,
        male: document.getElementById("gender_male").checked,
        female: document.getElementById("gender_female").checked,
    };

    return formData;
}


async function generatePdf() {
    // const formData = {
    let formData = DEBUG_MODE ? dummyData : getFormData();

    let productData = DEBUG_MODE ? dummyProductData : getProductData();

    
    // if (DEBUG_MODE) {
    //     console.log("Form Data:", formData);
    //     formData = dummyData; // Use dummy data in debug mode
    // }

    // const full_name = `${formData.first_name} ${formData.last_name}`;
    // const address = `${formData.street}, ${formData.zip_code} ${formData.city}`;
    const formattedDate = new Date().toLocaleDateString('de-DE', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    // const zip_city = `${formData.zip_code} ${formData.city}`;

    // const pdfDefinitions = getPdfDefinitions(formData, full_name, address, formattedDate, zip_city);
    const pdfDefinitions = getPdfDefinitions(formData, formattedDate, productData);

    // if other insurance is selected, add the text to the insurance_provider field
    if (formData.insurance_provider === 'Andere') {
        formData.insurance_provider = document.getElementById("insurance_provider_other").value;
    }

    latestPDFBytesArray = [];

    for (const def of pdfDefinitions) {
        const pdfDoc = await loadAndFillForm(def.path, def.fields(formData, formattedDate, productData));
        if (def.applySignature) {
            await applySignatureToPdf(pdfDoc, "signature", def.signaturePage);
        }
        latestPDFBytesArray.push(await pdfDoc.save());
    }

    saveBtn.disabled = false;
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


form.addEventListener("reset", () => {
    form.reset();
    signaturePad.clear();
    form.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
    saveBtn.disabled = true;
    latestPDFBytesArray = [];
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await generatePdf();
        const mergedBytes = await mergePDFs(latestPDFBytesArray);
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
});

clearBtn.addEventListener("click", () => {
    signaturePad.clear();
});

saveBtn.addEventListener("click", async () => {
    try {
        await generatePdf();
        const mergedBytes = await mergePDFs(latestPDFBytesArray);
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        saveAs(blob, "merged.pdf");
    } catch (error) {
        console.error("Error saving PDF:", error);
    }
});
