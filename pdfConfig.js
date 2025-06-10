// pdfConfig.js

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

export function getPdfDefinitions(formData, formattedDate, productData) {
  const full_name = (formData) => `${formData.first_name} ${formData.last_name}`;
  const full_name_rev = (formData) => `${formData.last_name}, ${formData.first_name} `;
  const address = (formData) => `${formData.street}, ${formData.zip_code} ${formData.city}`;
  const current_location = "Berlin";
  const current_loc_and_date = (formattedDate) => `Berlin, ${formattedDate}`;
  const zip_city = (formData) => `${formData.zip_code} ${formData.city}`;

  const birthdate = new DateFormatter(formData.birthdate);
  const birthdate_limited = `${birthdate.getDay()}${birthdate.getMonth()}${birthdate.getYear()}`;


  console.log("Formatted Date:", formattedDate);
  const date = new DateFormatter(formattedDate);


  const iban = "00000000000000000000";
  const bic = "0000000000"; // Placeholder for BIC
  const bank_name = "Bank Name"; // Placeholder for Bank Name
  const account_holder = "SBU GmbH"; // Assuming the account holder is the same as the applicant
  const account_holder_address = "SBU GmbH, Musterstraße 1, 12345 Musterstadt"; // Placeholder for account holder address

  const definitions = [
    {
      path: "assets/Stammblatt.pdf",
      fields: (formData, formattedDate, productData) => ({
        ...formData,
        current_date: formattedDate,
        zip_city: zip_city(formData),
        ...productData
      }),
      applySignature: false
    },
    {
      path: "assets/Auftragsbestaetigung.pdf",
      fields: (formData, formattedDate) => ({
        full_name: full_name(formData),
        address: address(formData),
        current_date: formattedDate
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/Annahme.pdf",
      fields: (formData, formattedDate) => ({
        full_name: full_name(formData),
        current_location: "Berlin",
        current_date: formattedDate
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/Datenschutz.pdf",
      fields: (formData, formattedDate) => ({
        full_name: full_name(formData),
        current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/AGB.pdf",
      fields: (formData, formattedDate) => ({
        full_name: full_name(formData),
        current_date: formattedDate
      }),
      applySignature: true,
      signaturePage: 2
    },
    {
      path: "assets/Vollmacht.pdf",
      fields: (formData, formattedDate) => ({
        full_name: full_name(formData),
        address: address(formData),
        birthdate: formData.birthdate,
        insurance_provider: formData.insurance_provider,
        insurance_number: formData.insurance_number,
        current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 1
    },
    //    {
    //   path: "assets/insurance_providers/aok.pdf",
    //   condition: (formData) => formData.insurance_provider === "DAK",
    //   fields: (formData, formattedDate) => ({})
    // },
  ];

  const sanitizedProvider = formData.insurance_provider?.toLowerCase();
  const knownProviders = ["aok", "tk", "barmer", "dak", "bkk", "ikk", "kkh", "hek", "knappschaft", "sbk"];

  const insurance_definitions = [
    {
      path: "assets/insurance_providers/aok.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name: full_name(formData),
        current_date: formattedDate,
        zip_city: zip_city(formData),
        // birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        // current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 1
    },
    {
      path: "assets/insurance_providers/tk.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        insurance_provider: "Techniker Krankenkasse",
        full_name_rev: full_name_rev(formData),
        current_date: formattedDate,

        // full_name: full_name(formData),
        // address: address(formData),
        // birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        // current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/insurance_providers/barmer.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name: full_name(formData),
        current_date: formattedDate,
        zip_city: zip_city(formData),
        iban: iban,
        bic: bic,
        bank_name: bank_name,
        account_holder: account_holder,
        account_holder_address: account_holder_address,
        // full_name: full_name(formData),
        // address: address(formData),
        // birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        // current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 1
    },
    {
      path: "assets/insurance_providers/dak.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name_rev: full_name_rev(formData),
        address: address(formData),
        birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/insurance_providers/bkk.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name_rev: full_name_rev(formData),
        address: address(formData),
        current_loc_and_date: current_loc_and_date(formattedDate),
        birthdate: birthdate_limited,
        // full_name: full_name(formData),
        // address: address(formData),
        // birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        // current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/insurance_providers/ikk.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name_rev: full_name_rev(formData),
        birthdate_day: birthDay,
        birthdate_month: birthMonth,
        birthdate_year: birthYear,
        zip_city: zip_city(formData),
        current_date_day: date.getDay(),
        current_date_month: date.getMonth(),
        current_date_year: date.getYear(),
        // full_name: full_name(formData),
        // address: address(formData),
        // birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        // current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/insurance_providers/kkh.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name: full_name(formData),
        current_loc_and_date: current_loc_and_date(formattedDate),
        zip_city: zip_city(formData),
        // full_name: full_name(formData),
        // address: address(formData),
        // birthdate: formData.birthdate,
        // insurance_provider: formData.insurance_provider,
        // insurance_number: formData.insurance_number,
        // current_loc_and_date: current_loc_and_date(formattedDate)
      }),
      applySignature: true,
      signaturePage: 2
    },



  ];
  if (knownProviders.includes(sanitizedProvider)) {
    const matchedDefinition = insurance_definitions.find(def => {
      const providerFromPath = def.path.split("/").pop().replace(".pdf", "").toLowerCase();
      return providerFromPath === sanitizedProvider;
    });

    if (matchedDefinition) {
      definitions.push(matchedDefinition);
      console.log("Selected definitions:", matchedDefinition);

      // OR: use it directly
      // processDefinition(matchedDefinition);
    } else {
      console.warn("No definition found for", sanitizedProvider);
    }
  }
  else{
    const otherDefinition = {
      path: "assets/insurance_providers/other.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        full_name: full_name(formData),
        current_date: formattedDate,
        zip_city: zip_city(formData),
        costs: productData.costs,
      }),
      applySignature: true,
      signaturePage: 1
    };
    definitions.push(otherDefinition);
    console.warn("Unknown insurance provider:", sanitizedProvider);
    console.log("Using default 'other' definition for unknown provider:", sanitizedProvider);

  }
  // if (knownProviders.includes(sanitizedProvider)) {
  //   definitions.push({
  //     // path: `assets/insurance_providers/${sanitizedProvider}.pdf`,
  //     // fields: (formData, formattedDate) => ({
  //     //   full_name_rev: full_name(formData),
  //     //   address: address(formData),
  //     //   insurance_number: formData.insurance_number,
  //     //   insurance_provider: formData.insurance_provider,
  //     //   current_date: formattedDate
  //     // }),
  //     // applySignature: false,
  //     // signaturePage: 0
  //       path: "assets/insurance_providers/aok.pdf",
  //       condition: (formData) => formData.insurance_provider === "AOK",
  //       fields: (formData, formattedDate) => ({})
  //       //   full_name: `${formData.first_name} ${formData.last_name}`,
  //       //   birth: formData.birthdate,
  //       //   vers_nr: formData.insurance_number,
  //       //   date: formattedDate,
  //       //   // other AOK-specific fields
  //       // }),
  //       // applySignature: true,
  //       // signaturePage: 0
  //     },
  //     {
  //       path: "assets/insurance_providers/dak.pdf",
  //       condition: (formData) => formData.insurance_provider === "DAK",
  //       fields: (formData, formattedDate) => ({
  //         full_name_rev: full_name_rev(formData),
  //         birthdate: formData.birthdate,
  //         insurance_number: formData.insurance_number,
  //         current_date: formattedDate,
  //         // other DAK-specific fields
  //       }),
  //       // applySignature: true,
  //       // signaturePage: 0
  //     },
  //   );
  // }

  return definitions;

}
