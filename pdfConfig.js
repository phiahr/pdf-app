export function getPdfDefinitions() {
  return [
    {
      path: "assets/Stammblatt.pdf",
      fields: (formData, formattedDate, productData) => ({
        ...formData,
        // last_name: formData.last_name,
        // first_name: formData.first_name,
        // birthdate: formData.birthdate,
        // insurance_number: formData.insurance_number,
        // insurance_provider: formData.insurance_provider,
        // street: formData.street,
        // zip_code: formData.zip_code,
        // city: formData.city,
        // email: formData.email,
        // phone_number: formData.phone_number,        
        current_date: formattedDate,
        zip_city: `${formData.zip_code} ${formData.city}`,
        ...productData
      }),
      applySignature: false
    },
    {
      path: "assets/Auftragsbestaetigung.pdf",
      fields: (formData, formattedDate) => ({
        full_name: `${formData.first_name} ${formData.last_name}`,
        address: `${formData.street}, ${formData.zip_code} ${formData.city}`,
        current_date: formattedDate
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
      path: "assets/Annahme.pdf",
      fields: (formData, formattedDate) => ({
        full_name: `${formData.first_name} ${formData.last_name}`,
        current_location: "Berlin",
        current_date: formattedDate
      }),
      applySignature: true,
      signaturePage: 0
    },
    {
        path: "assets/Datenschutz.pdf",
        fields: (formData, formattedDate) => ({
            full_name: `${formData.first_name} ${formData.last_name}`,
            current_loc_and_date: `Berlin, ${formattedDate}`
        }),
        applySignature: true,
      signaturePage: 0
    },
    {
        path: "assets/AGB.pdf",
        fields: (formData, formattedDate) => ({
            full_name: `${formData.first_name} ${formData.last_name}`,
            current_date: formattedDate
        }),
        applySignature: true,
      signaturePage: 2
    },
    {
        path: "assets/Vollmacht.pdf",
        fields: (formData, formattedDate) => ({
            full_name: `${formData.first_name} ${formData.last_name}`,
            address: `${formData.street}, ${formData.zip_code} ${formData.city}`,
            birthdate: formData.birthdate,
            insurance_provider: formData.insurance_provider,
            insurance_number: formData.insurance_number,
            current_loc_and_date: `Berlin, ${formattedDate}`
        }),
        applySignature: true,
      signaturePage: 1
    }
  ];
}
