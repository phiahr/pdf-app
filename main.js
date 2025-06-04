// main.js: Refactored PDF generation with signature and merging
import { getPdfDefinitions } from "./pdfConfig.js";

const form = document.getElementById("data-form");
const saveBtn = document.getElementById("save-pdf");
const canvas = document.getElementById("signature-pad");
const clearBtn = document.getElementById("clear-signature");
const signaturePad = new SignaturePad(canvas);

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

  const availableFields = form.getFields().map(f => f.getName());

  for (const [key, value] of Object.entries(fields)) {
    if (availableFields.includes(key)) {
      form.getTextField(key).setText(value);
    }
  }

  return pdfDoc;
}

async function applySignatureToPdf(pdfDoc, fieldName) {
  if (signaturePad.isEmpty()) return;
  const form = pdfDoc.getForm();
  const signatureField = form.getTextField(fieldName);
  signatureField.setText("");
  signatureField.enableReadOnly();

  const rect = getRectsFromField(signatureField, pdfDoc)[0];
  const signatureDataURL = signaturePad.toDataURL();
  const signatureImage = await pdfDoc.embedPng(signatureDataURL);
  const signatureImageDims = signatureImage.scale(0.25);
  const page = pdfDoc.getPage(rect.pageNumber)+1; // For some reason I get -1 probably due to the fields not being assigned to a page
  page.drawImage(signatureImage, {
    x: rect.x,
    y: rect.y,
    width: signatureImageDims.width,
    height: signatureImageDims.height
  });
}

async function generatePdf() {
  const formData = {
    first_name: document.getElementById("first_name").value,
    last_name: document.getElementById("last_name").value,
    birthdate: document.getElementById("birthdate").value,
    insurance_number: document.getElementById("insurance_number").value,
    insurance_provider: document.getElementById("insurance_provider").value,
    street: document.getElementById("street").value,
    zip_code: document.getElementById("zip").value,
    city: document.getElementById("city").value,
    email: document.getElementById("email").value,
    phone_number: document.getElementById("phone").value,
  };

  const full_name = `${formData.first_name} ${formData.last_name}`;
  const address = `${formData.street}, ${formData.zip_code} ${formData.city}`;
  const formattedDate = new Date().toLocaleDateString('de-DE', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const pdfDefinitions = getPdfDefinitions(formData, full_name, address, formattedDate);

  latestPDFBytesArray = [];

  for (const def of pdfDefinitions) {
    const pdfDoc = await loadAndFillForm(def.path, def.fields(formData, formattedDate));
    if (def.applySignature) {
      await applySignatureToPdf(pdfDoc, "signature");
    }
    latestPDFBytesArray.push(await pdfDoc.save());
  }

  saveBtn.disabled = false;
}

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
