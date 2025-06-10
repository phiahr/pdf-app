import sys
from pikepdf import Pdf
import pikepdf
import json
from collections import defaultdict

def inspect_pdf(path):
    with Pdf.open(path) as pdf:
        catalog = pdf.Root
        # 1) AcroForm
        if '/AcroForm' in catalog:
            acro = catalog['/AcroForm']
            fields = acro.get('/Fields', [])
            print(f"Found AcroForm with {len(fields)} field(s):")
            for i, f in enumerate(fields, start=1):
                obj = pdf.get_object(f.objgen)  # f.objgen is (id, gen)
                name = obj.get('/T')
                print(f"  {i}. Name = {name!r}, object = {f}")
                # print(f"  {i}. Name = {name!r}")
        else:
            print("No AcroForm dictionary present.")

        # 2) XFA check
        if '/XFA' in catalog.get('/AcroForm', {}):
            print("WARNING: This PDF has an XFA form (unsupported by pdf-lib).")

        # 3) Page annotations
        widget_by_name = defaultdict(list)

        print("\nScanning page annotations for widget fields:")
        for i, page in enumerate(pdf.pages, start=1):
            annots = page.get('/Annots', [])
            widgets = []
            for a in annots:
                obj = pdf.get_object(a.objgen)  # a.objgen is (id, gen)
                subtype = obj.get('/Subtype')
                if subtype and subtype == '/Widget':
                    name = obj.get('/T')
                    widgets.append((a, name))
                    parent = obj.get('/Parent', a)  # fallback: widget is field
                    widget_by_name[str(name)].append((a, parent, i))  # store ref, parent, page

            print(f" Page {i}: {len(widgets)} widget(s)")
            for ref, t in widgets:
                # print(f"    • Annot {ref}: field name = {t!r}")
                print(f"    • Annot: field name = {t!r}")


        # 4) Analyze linking
        for name, widgets in widget_by_name.items():
            print(f"\nField name '{name}' has {len(widgets)} widget(s):")
            parent_ids = set()
            for ref, parent, page_num in widgets:
                parent_id = tuple(parent.objgen) if hasattr(parent, 'objgen') else ('inline',)
                parent_ids.add(parent_id)
                print(f"  • Page {page_num},  Parent object = {parent_id}")
            if len(parent_ids) == 1:
                print("  → All widgets are linked to the same field object ✅")
            else:
                print("  → WARNING: Multiple distinct field objects with same name ❌")

def inspect_pdf_fields(pdf_path):
    with pikepdf.open(pdf_path) as pdf:
        root = pdf.Root
        if '/AcroForm' not in root:
            print("No AcroForm found in PDF.")
            return

        acroform = root['/AcroForm']
        fields = acroform.get('/Fields', [])

        print(f"Found {len(fields)} form field(s):\n")
        for i, field in enumerate(fields, 1):
            # If it's an indirect object, dereference it
            if isinstance(field, pikepdf.Object):
                field_obj = pdf.get_object(field.objgen)  # field.objgen is (id, gen)
            else:
                field_obj = field  # Already a dict

            name = field_obj.get('/T', '(no name)')
            ftype = field_obj.get('/FT', '(no type)')
            print(f"{i}. Name: {name}, Type: {ftype}")
            try:
                print("   Raw:", json.dumps(dict(field_obj.items()), indent=2, default=str))
            except Exception as e:
                print("   Could not serialize field fully:", e)
            print()
# Replace with the path to your PDF

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python inspect_pdf.py path/to/your.pdf")
    else:
        inspect_pdf(sys.argv[1])
        # inspect_pdf_fields(sys.argv[1])
