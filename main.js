// main.js: PDF erzeugen und speichern mit Unterschrift

const form = document.getElementById("data-form");
const saveBtn = document.getElementById("save-pdf");
const canvas = document.getElementById("signature-pad");
const clearBtn = document.getElementById("clear-signature");
const signaturePad = new SignaturePad(canvas);


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


let latestPDFBytes = null;
let latestPDFBytes2 = null;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const full_name = `${first_name} ${last_name}`;
    const birthdate = document.getElementById("birthdate").value;
    const insurance_number = document.getElementById("insurance_number").value;
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
    form2.getTextField("address").setText(address);
    
        const fields2 = form2.getFields();

    fields2.forEach(field => {
    const name = field.getName();
    console.log("Field name:", name);
    });


    form2.getTextField("date_cost_offer").setText(formattedDate);


    // Unterschrift ggf. als Bild in Formularfeld oder frei einfügen wie bisher
    // Unterschrift einfügen

    if (!signaturePad.isEmpty()) {
        console.log("Adding signature to PDF");
        const signatureDataURL = signaturePad.toDataURL();
        const signatureImage = await pdfDoc2.embedPng(signatureDataURL);
        
        const signatureField = form2.getField("signature");
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
    latestPDFBytes = await pdfDoc.save();
    latestPDFBytes2 = await pdfDoc2.save();


    
    // Optional: show PDF in new Tab, or popup in PWA, good option for mobile devices to show PDF before signing
    
    
    const pdfBlob = new Blob([latestPDFBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfWindow = window.open(pdfUrl);
    if (pdfWindow) {
        pdfWindow.focus();
    } else {
        console.error("Failed to open PDF in new tab. Please allow pop-ups for this site.");
    }

    saveBtn.disabled = false;



});

clearBtn.addEventListener("click", () => {
    signaturePad.clear();
});

saveBtn.addEventListener("click", () => {
    console.log("Saving PDF...");
    if (latestPDFBytes) {
        console.log("Saving PDF with signature...");
        // const blob = new Blob([latestPDFBytes], { type: "application/pdf" });
        // // // saveAs(blob, "Vorabgespraech.pdf");
        // const pdfUrl = URL.createObjectURL(blob);
        // const pdfWindow = window.open(pdfUrl);
        const blob2 = new Blob([latestPDFBytes2], { type: "application/pdf" });
        const pdfUrl2 = URL.createObjectURL(blob2);
        const pdfWindow2 = window.open(pdfUrl2);
    }
});
