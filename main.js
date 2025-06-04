// main.js: PDF erzeugen und speichern mit Unterschrift

const form = document.getElementById("data-form");
const saveBtn = document.getElementById("save-pdf");
const canvas = document.getElementById("signature-pad");
const clearBtn = document.getElementById("clear-signature");
const signaturePad = new SignaturePad(canvas);

let latestPDFBytes = null;
let latestPDFBytes2 = null;
let latestPDFBytes3 = null;

function getRectsFromField(field,doc) {
	var widgets = (
		field
		.acroField.getWidgets()
   		
	)
	
	if(doc) {
		return widgets.map(q=>{
			var rect = q.getRectangle()
			var pageNumber = doc
				.getPages()
				.findIndex(x => x.ref == q.P())
			rect.pageNumber = pageNumber;
			return rect;
		})
		
	} else 
		return widgets.map(q=>q.getRectangle());
}

async function mergePDFs(pdfBytesArray) {
  // Create a new PDF document
  const mergedPdf = await PDFLib.PDFDocument.create();
    console.log("Merging PDFs...");
  for (const pdfBytes of pdfBytesArray) {
    // Load each PDF
    const pdf = await PDFLib.PDFDocument.load(pdfBytes);

    // get text fields from the PDF
    const form = pdf.getForm();
    const fields = form.getFields();
    fields.forEach(field => {
        const name = field.getName();
        // if text field, log the name and value
        if (field instanceof PDFLib.PDFTextField) {
            // Log the field name and value
            console.log("Text field name:", name, "value:", field.getText() || "N/A");
        }
        }
    );

    // Copy all pages from this pdf to the mergedPdf
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  // Save the merged PDF as bytes
  const mergedPdfBytes = await mergedPdf.save();
  return mergedPdfBytes;
}

async function generatePdf() {
    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const full_name = `${first_name} ${last_name}`;
    const birthdate = document.getElementById("birthdate").value;
    const insurance_number = document.getElementById("insurance_number").value;
    const insurance_provider = document.getElementById("insurance_provider").value;
    const street = document.getElementById("street").value;
    const zip = document.getElementById("zip").value;
    const city = document.getElementById("city").value;
    const address = `${street}, ${zip} ${city}`;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // const product = document.getElementById("product").value;

    const doc1 = "assets/Stammblatt.pdf";
    console.log("Loading PDF template");
    const existingPdfBytes = await fetch(doc1).then((res) => res.arrayBuffer());
    console.log("PDF loaded");    
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();


    form.getTextField("first_name").setText(first_name);
    form.getTextField("last_name").setText(last_name);
    form.getTextField("birthdate").setText(birthdate);
    form.getTextField("insurance_number").setText(insurance_number);
    // form.getTextField("street").setText();


    // TODO: overlay address over the field if it is too long
    // split street at whitespace to separate street and house number
    const streetParts = street.split(" ");
    if (streetParts.length > 1) {
        form.getTextField("street").setText(streetParts.slice(0, -1).join(" ")); // all but last part
        // decrease font if too long
        if (form.getTextField("street").getText().length > 30) {
            form.getTextField("street").setFontSize(2);
        }
        else {
            form.getTextField("street").setFontSize(10);
        }
        form.getTextField("street_nr").setText(streetParts[streetParts.length - 1]); // last part
    }
    else {
        form.getTextField("street").setText(street);
        form.getTextField("street_nr").setText(""); // no house number
    }
    form.getTextField("city").setText(city);
    form.getTextField("zip_code").setText(zip);
    form.getTextField("email").setText(email);
    form.getTextField("phone_number").setText(phone);
    form.getTextField("current_date").setText(formattedDate);

    // form.getTextField("product").setText(product);
    const fields = form.getFields();

    fields.forEach(field => {
    const name = field.getName();
    console.log("Field name:", name);
    });

    const doc2 = "assets/Auftragsbestätigung.pdf";
    console.log("Loading second PDF template");
    const existingPdfBytes2 = await fetch(doc2).then((res) => res.arrayBuffer());
    console.log("Second PDF loaded");
    const pdfDoc2 = await PDFLib.PDFDocument.load(existingPdfBytes2);
    const form2 = pdfDoc2.getForm();
    // Hier können weitere Felder aus dem zweiten PDF gesetzt werden, falls benötigt
    form2.getTextField("full_name").setText(full_name);
    // form2.getTextField("full_name").setText(first_name);
    form2.getTextField("address").setText(address);
    
        const fields2 = form2.getFields();

    fields2.forEach(field => {
    const name = field.getName();
    console.log("Field name:", name);
    });


    form2.getTextField("current_date").setText(formattedDate);


    // Unterschrift ggf. als Bild in Formularfeld oder frei einfügen wie bisher
    // Unterschrift einfügen

    if (!signaturePad.isEmpty()) {
        console.log("Adding signature to PDF");
        const signatureDataURL = signaturePad.toDataURL();
        const signatureImage = await pdfDoc2.embedPng(signatureDataURL);
        
        // const signatureField = form2.getField("signature");
        const signatureField = form2.getTextField("signature");
        signatureField.setText(""); // Clear the text field if it exists
        // readonly
        signatureField.enableReadOnly(); // Make the field read-only if you want to prevent editing
        // get coordinates of the signature field
        const signatureFieldRect = getRectsFromField(signatureField, pdfDoc2)[0];
        console.log("Signature field page number:", signatureFieldRect.pageNumber);
        // If you want to draw the signature image over the signature field, you can use the following code
        const signatureImageDims = signatureImage.scale(0.25); // Scale to 50% of original size
        const page = pdfDoc2.getPage(signatureFieldRect.pageNumber+1);
        page.drawImage(signatureImage, {
            x: signatureFieldRect.x,
            y: signatureFieldRect.y,
            width: signatureImageDims.width,
            height: signatureImageDims.height,
        });

    }

    const doc3 = "assets/Annahme.pdf";
    console.log("Loading third PDF template");
    const existingPdfBytes3 = await fetch(doc3).then((res) => res.arrayBuffer());
    console.log("Third PDF loaded");
    // Create a new PDF document for the third PDF

    const pdfDoc3 = await PDFLib.PDFDocument.load(existingPdfBytes3);
    const form3 = pdfDoc3.getForm();
    // Hier können weitere Felder aus dem dritten PDF gesetzt werden, falls benötigt
    form3.getTextField("full_name").setText(full_name);
    form3.getTextField("current_location").setText("Berlin");
    form3.getTextField("current_date").setText(formattedDate);

    if (!signaturePad.isEmpty()) {
        console.log("Adding signature to PDF");
        const signatureDataURL = signaturePad.toDataURL();
        const signatureImage = await pdfDoc3.embedPng(signatureDataURL);
        
        // const signatureField = form2.getField("signature");
        const signatureField = form3.getTextField("signature");
        signatureField.setText(""); // Clear the text field if it exists
        // readonly
        signatureField.enableReadOnly(); // Make the field read-only if you want to prevent editing
        // get coordinates of the signature field
        const signatureFieldRect = getRectsFromField(signatureField, pdfDoc3)[0];
        console.log("Signature field page number:", signatureFieldRect.pageNumber);
        // If you want to draw the signature image over the signature field, you can use the following code
        const signatureImageDims = signatureImage.scale(0.25); // Scale to 50% of original size
        const page = pdfDoc3.getPage(signatureFieldRect.pageNumber+1);
        page.drawImage(signatureImage, {
            x: signatureFieldRect.x,
            y: signatureFieldRect.y,
            width: signatureImageDims.width,
            height: signatureImageDims.height,
        });

    }



    latestPDFBytes = await pdfDoc.save();
    latestPDFBytes2 = await pdfDoc2.save();
    latestPDFBytes3 = await pdfDoc3.save();

    saveBtn.disabled = false;

}

// Reset the form input
form.addEventListener("reset", () => {
    const form = document.getElementById("data-form");
    form.reset();

    // Manually reset canvas (signature)
    const canvas = document.getElementById("signature-pad");
    const signaturePad = new SignaturePad(canvas);
    signaturePad.clear();

    // Optional: Clear number inputs explicitly (in case values persist visually)
    form.querySelectorAll('input[type="number"]').forEach(input => input.value = '');

    // Optional: If you dynamically populate checkboxes/radios or handle custom UI resets
    console.log("Form and signature pad have been reset.");
    saveBtn.disabled = true; // Disable save button after reset
    latestPDFBytes = null; // Reset the latest PDF bytes
    latestPDFBytes2 = null; // Reset the second PDF bytes
    latestPDFBytes3 = null; // Reset the third PDF bytes

});


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    generatePdf().then(() => {
        console.log("PDF generated successfully.");
            const pdf1Bytes = latestPDFBytes; // your first PDF Uint8Array/ArrayBuffer
    const pdf2Bytes = latestPDFBytes2; // your second PDF Uint8Array/ArrayBuffer
    const pdf3Bytes = latestPDFBytes3; // your second PDF Uint8Array/ArrayBuffer

    
        mergePDFs([pdf1Bytes, pdf2Bytes, pdf3Bytes]).then((mergedBytes) => {
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // or saveAs(blob, "merged.pdf");
        });
    }
    ).catch((error) => {
        console.error("Error generating PDF:", error);
    });

    
});

clearBtn.addEventListener("click", () => {
    signaturePad.clear();
});

saveBtn.addEventListener("click", () => {
    console.log("Saving PDF...");
    if (latestPDFBytes) {
        console.log("Saving PDF with signature...");
        generatePdf().then(() => {
        console.log("PDF generated successfully with signature.");
        const pdf1Bytes = latestPDFBytes; // your first PDF Uint8Array/ArrayBuffer
        const pdf2Bytes = latestPDFBytes2; // your second PDF Uint8Array/ArrayBuffer
    const pdf3Bytes = latestPDFBytes3; // your second PDF Uint8Array/ArrayBuffer
        

        mergePDFs([pdf1Bytes, pdf2Bytes, pdf3Bytes]).then((mergedBytes) => {
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        // window.open(url, "_blank");
        saveAs(blob, "merged.pdf"); // Use FileSaver.js to save the merged PDF
        // or saveAs(blob, "merged.pdf");
        });
    }).catch((error) => {
        console.error("Error generating PDF with signature:", error);
    });
    }
});
