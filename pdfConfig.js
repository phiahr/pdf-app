// pdfConfig.js


// CONSTANTS 
const GENERAL_FILES = [
  "v1_Stammblatt.pdf",
  "v2_Widerrufsbelehrung.pdf",
  "v3_Auskunft.pdf",
  "v4_Datenschutz.pdf",
  "v5_Vollmacht.pdf",
  "v6_Annahme.pdf",
  "v7_Auftragsbestaetigung.pdf",
  "v8_AGB.pdf",
]


const INSURANCE_PROVIDER_FILES = [
  "insurance_providers/aok.pdf",
  "insurance_providers/barmer.pdf",
  "insurance_providers/dak.pdf",
  "insurance_providers/ikk.pdf",
  "insurance_providers/kkh.pdf",
  "insurance_providers/knappschaft.pdf",
  "insurance_providers/other.pdf",
  "insurance_providers/tk.pdf",
]


const iban = "00000000000000000000";
const bic = "0000000000"; // Placeholder for BIC
const bank_name = "Bank Name"; // Placeholder for Bank Name
const account_holder = "SBU GmbH"; // Assuming the account holder is the same as the applicant
const account_holder_address = "SBU GmbH, Musterstraße 1, 12345 Musterstadt"; // Placeholder for account holder address

const current_location = "Berlin";


// class for date to get day, month, year
class DateFormatter {
  constructor(date) {
    this.date = new Date(date);
  }

  getDay() {
    return this.date.getDate().toString().padStart(2, '0');
  }

  getMonth() {
    return (this.date.getMonth() + 1).toString().padStart(2, '0');
  }

  getYear() {
    return this.date.getFullYear().toString();
  }
}

export function getPdfDefinitions(formData, productData) {
  
  const formattedDate = new Date(formData.signatureDate).toLocaleDateString('de-DE', {
    year: 'numeric', month: '2-digit', day: '2-digit'
});

  const full_name = `${formData.first_name} ${formData.last_name}`;
  const full_name_rev = `${formData.last_name}, ${formData.first_name}`;
  const address = `${formData.street}, ${formData.zip_code} ${formData.city}`;
  const current_loc_and_date = `${current_location}, ${formattedDate}`;
  const zip_city = `${formData.zip_code} ${formData.city}`;

  let birthdate = new DateFormatter(formData.birthdate);
  const birthdate_limited = `${birthdate.getDay()}${birthdate.getMonth()}${birthdate.getYear()}`;
  const date = new DateFormatter(Date());
  console.log("apefkepofpoeafkpoa", date.getDay());

  const care_taker_full_name = `${formData.care_taker_first_name} ${formData.care_taker_last_name}`;
  const care_taker_address = `${formData.care_taker_street}, ${formData.care_taker_zip_city}`;


  let fields = (formData, productData) => ({
    ...formData,
    ...productData,
    full_name: full_name,
    full_name_rev: full_name_rev,
    address: address,
    current_date: formattedDate,
    current_date_day: date.getDay(),
    current_date_month: date.getMonth(),
    current_date_year: date.getYear(),
    current_location: current_location,
    current_loc_and_date: current_loc_and_date,
    zip_city: zip_city,
    care_taker_full_name: care_taker_full_name,
    care_taker_address: care_taker_address,
    iban: iban,
    bic: bic,
    bank_name: bank_name,
    account_holder: account_holder,
    account_holder_address: account_holder_address,
    birthdate: formData.birthdate,
    birthdate_limited: birthdate_limited,
    birthDay: birthdate.getDay(),
    birthMonth: birthdate.getMonth(),
    birthYear: birthdate.getYear(),
  });

  const sanitizedProvider = formData.insurance_provider?.toLowerCase();

  const matchedInsuranceFile = `insurance_providers/${sanitizedProvider}.pdf`;


  const definitions = [];

  for (const file of GENERAL_FILES) {
    const path = `assets/${file}`;
    if (!path.endsWith(".pdf")) {
      console.warn(`Skipping non-PDF file: ${path}`);
      continue;
    }

    // Doesn't work <= Check if the file exists in the assets folder
    // try {
    //   require(path); // This will throw an error if the file does not exist
    // } catch (error) {
    //   console.error(`File not found: ${path}`);
    //   continue;
    // }
    definitions.push(
    {
      path: path,
      fields: fields
    });
  }

  console.log(matchedInsuranceFile, INSURANCE_PROVIDER_FILES);

  if (INSURANCE_PROVIDER_FILES.includes(matchedInsuranceFile)) {
    console.log("Matched insurance provider file:", matchedInsuranceFile);
    
    let providerName = formData.insurance_provider;

    // Doesn't work with the current setup, but could be used in the future
    if (sanitizedProvider === "tk" ){
      providerName = "Techniker Krankenkasse";
    }


    fields.insurance_provider = providerName;
    definitions.push({
      path: `assets/${matchedInsuranceFile}`,
      fields: fields,
    });
  }
  else {
    console.warn("No matching insurance provider file found for:", sanitizedProvider);
    definitions.push({
      path: "assets/insurance_providers/other.pdf",
      fields: fields,
    });
  }

  return definitions;

}
