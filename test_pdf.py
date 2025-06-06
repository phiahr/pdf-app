import fitz  # pip install pymupdf

# ------------------------------------------------------------
# helper: pull and stringify the raw PDF dictionary of a widget
# ------------------------------------------------------------
def raw_obj(doc, widget):
    try:
        # xref_object returns the object as bytes (uncompressed if requested)
        return doc.xref_object(widget.xref, compressed=False).decode("latin1")
    except Exception as exc:
        return f"<error reading object: {exc}>"

# ------------------------------------------------------------
# extract a mapping  field-name  ->  {info + raw-pdf-dict}
# ------------------------------------------------------------
def extract_raw_form_fields(pdf_path):
    doc = fitz.open(pdf_path)
    raw_fields = {}

    for page_num, page in enumerate(doc, start=1):
        for widget in page.widgets() or []:
            name = widget.field_name or f"Unnamed_p{page_num}_{widget.xref}"
            raw_fields[name] = {
                "page": page_num,
                "rect": list(widget.rect),
                "type": widget.field_type,      # 'btn', 'text', …
                "value": widget.field_value,    # current value
                "flags": widget.field_flags,
                # "widget_type": widget.widget_type,  # 'checkbox', 'radio', …
                "raw": raw_obj(doc, widget),    # the full PDF object
            }
    return raw_fields

# ------------------------------------------------------------
# side-by-side comparison of two PDFs
# ------------------------------------------------------------
def compare_raw_fields(path_web, path_app):
    web   = extract_raw_form_fields(path_web)
    app   = extract_raw_form_fields(path_app)
    names = sorted(set(web) | set(app))

    print(f"\n🔍  Comparing form dictionaries\n    • {path_web}\n    • {path_app}\n")

    for name in names:
        if name not in web:
            print(f"❌ '{name}' only in APP")
            continue
        if name not in app:
            print(f"❌ '{name}' only in WEB")
            continue

        w, a = web[name], app[name]
        # quick field-level diff first
        quick_diffs = [
            f"type   {w['type']}  ≠  {a['type']}"      if w['type']  != a['type']  else "",
            f"value  {w['value']} ≠  {a['value']}"     if w['value'] != a['value'] else "",
            f"flags  {w['flags']} ≠  {a['flags']}"     if w['flags'] != a['flags'] else "",
        ]
        quick_diffs = [d for d in quick_diffs if d]

        header = f"📌 {name}  (page {w['page']})"
        if quick_diffs:
            print(header + " — FIELD META DIFFERS")
            for d in quick_diffs:
                print("   •", d)
        else:
            print(header + " — field meta identical")

        # in any case, show low-level differences line-by-line
        raw_w = w["raw"].splitlines()
        raw_a = a["raw"].splitlines()
        if raw_w != raw_a:
            print("   ⇢ raw PDF objects differ; first few differing lines:")
            for i, (lw, la) in enumerate(zip(raw_w, raw_a)):
                if lw != la:
                    print(f"     - WEB: {lw[:120]}")
                    print(f"     - APP: {la[:120]}")
                    if i > 10:
                        print("     … (truncated)")
                        break
            print()

# ------------------------------------------------------------
# call the function with your two files
# ------------------------------------------------------------
compare_raw_fields("web_version.pdf", "app_version.pdf")
