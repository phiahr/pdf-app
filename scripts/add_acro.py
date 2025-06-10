import sys
import pikepdf
from pikepdf import Dictionary, Name, Array, Object

def add_acroform_to_pdf(path):
    # Open the PDF
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        root = pdf.Root

        # Check if AcroForm already exists (it doesn't in your case)
        # if "/AcroForm" not in root:
            # Collect all widgets
        fields = []
        for page in pdf.pages:
            annots = page.get("/Annots", [])
            for annot in annots:
                # annot_obj = annot.get_object()
                if annot.get("/Subtype") == Name("/Widget"):
                    fields.append(annot)

        # Create the AcroForm dictionary
        acroform = Dictionary({
            "/Fields": Array(fields),
            "/NeedAppearances": True  # Hint for renderers to regenerate appearances
        })

        # Attach it to the root
        root["/AcroForm"] = pdf.make_indirect(acroform)
        print(f"Created AcroForm with {len(fields)} fields.")

        # Save the updated PDF
        pdf.save(path)

def repair_acroform_fields(path, output_path):
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        root = pdf.Root
        if '/AcroForm' not in root:
            print("No AcroForm present, creating a new one.")
            root['/AcroForm'] = pdf.make_indirect(pikepdf.Dictionary({
                '/Fields': pdf.make_indirect([]),
                '/NeedAppearances': pikepdf.Boolean(True)
            }))

        acroform = root['/AcroForm']
        all_fields = {}
        widgets_by_name = {}

        # First pass: collect all widgets and group by /T name
        for page in pdf.pages:
            annots = page.get('/Annots', [])
            for annot in annots:
                # annot_obj = annot.get_object()
                if annot.get('/Subtype') == Name('/Widget') and '/T' in annot:
                    name = str(annot['/T'])
                    widgets_by_name.setdefault(name, []).append(annot)

        # Build new deduplicated field objects
        field_refs = []
        for name, widget_refs in widgets_by_name.items():
            field_dict = Dictionary({
                '/T': name,
                '/FT': Name('/Tx'),  # Default to text field; customize as needed
                '/Kids': Array(widget_refs),
            })
            field_ref = pdf.make_indirect(field_dict)
            field_refs.append(field_ref)

            # Set /Parent on all widgets to link them to this field
            for widget in widget_refs:
                # widget_obj = widget.get_object()
                widget['/Parent'] = field_ref
                # if '/T' in widget:
                    # del widget['/T']  # Remove name from widget to prevent name.name


        acroform['/Fields'] = pdf.make_indirect(Array(field_refs))
        print(f"Repaired {len(field_refs)} fields and linked all widgets.")
        pdf.save(output_path)
        print(f"Saved repaired PDF to: {output_path}")


# def repair_acroform_fields(path, output_path):
#     with pikepdf.open(path, allow_overwriting_input=True) as pdf:
#         root = pdf.Root
#         if '/AcroForm' not in root:
#             print("No AcroForm present, creating a new one.")
#             root['/AcroForm'] = pdf.make_indirect(pikepdf.Dictionary({
#                 '/Fields': pdf.make_indirect([]),
#                 '/NeedAppearances': pikepdf.Boolean(True)
#             }))

#         acroform = root['/AcroForm']
#         fields_array = acroform.get('/Fields', [])

#         # Get names of existing fields (some might not have /T, so check)
#         existing_names = set()
#         for f in fields_array:
#             try:
#                 obj = f.get_object()
#                 name = obj.get('/T')
#                 if name is not None:
#                     existing_names.add(str(name))
#             except Exception as e:
#                 print(f"Warning: Could not read field {f}: {e}")

#         new_fields = []

#         for page in pdf.pages:
#             annots = page.get('/Annots', [])
#             for annot in annots:
#                 try:
#                     # annot_obj = annot.get_object()
#                     if annot.get('/Subtype') == '/Widget':
#                         name = annot.get('/T')
#                         if name and str(name) not in existing_names:
#                             new_fields.append(annot)
#                             existing_names.add(str(name))  # avoid future dups
#                 except Exception as e:
#                     print(f"Warning: Could not process annot {annot}: {e}")

#         if new_fields:
#             print(f"Adding {len(new_fields)} new fields to AcroForm.")
#             fields_array.extend(new_fields)
#             acroform['/Fields'] = pdf.make_indirect(fields_array)
#         else:
#             print("No new fields to add.")
#         pdf.save(output_path)

# def repair_acroform_fields(path, output_path):
    
    # with pikepdf.open(path, allow_overwriting_input=True) as pdf:
    #     root = pdf.Root
    #     if '/AcroForm' not in root:
    #         print("No /AcroForm dictionary present. Creating one.")
    #         root['/AcroForm'] = pdf.make_indirect(pikepdf.Dictionary({
    #             '/Fields': pdf.make_indirect([]),
    #         }))

    #     acroform = root['/AcroForm']
    #     fields = acroform.get('/Fields', [])

    #     # Collect all existing field object references
    #     existing_refs = set(f.objgen for f in fields)
    #     new_fields = []

    #     for page in pdf.pages:
    #         annots = page.get('/Annots', [])
    #         for annot in annots:
    #             # annot_obj = annot.get_object()
    #             if annot.get('/Subtype') == '/Widget':
    #                 if annot.objgen not in existing_refs:
    #                     new_fields.append(annot)

    #     if new_fields:
    #         print(f"Adding {len(new_fields)} missing widgets to AcroForm fields")
    #         fields.extend(new_fields)
    #         acroform['/Fields'] = pdf.make_indirect(fields)
    #     else:
    #         print("No missing widgets found.")

    #     pdf.save(output_path)
    #     print(f"Saved updated PDF to: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python inspect_pdf.py path/to/your.pdf")
    else:
        # add_acroform_to_pdf(sys.argv[1])
        repair_acroform_fields(sys.argv[1], sys.argv[1] + ".repaired.pdf")
