export function getPdfDefinitions() {
  return [
    {
      path: "assets/Stammblatt.pdf",
      fields: (formData, formattedDate) => ({
        ...formData,
        current_date: formattedDate
      }),
      applySignature: false
    },
    {
      path: "assets/Auftragsbestätigung.pdf",
      fields: (formData, formattedDate) => ({
        full_name: `${formData.first_name} ${formData.last_name}`,
        address: `${formData.street}, ${formData.zip_code} ${formData.city}`,
        current_date: formattedDate
      }),
      applySignature: true
    },
    {
      path: "assets/Annahme.pdf",
      fields: (formData, formattedDate) => ({
        full_name: `${formData.first_name} ${formData.last_name}`,
        current_location: "Berlin",
        current_date: formattedDate
      }),
      applySignature: true
    }
  ];
}
