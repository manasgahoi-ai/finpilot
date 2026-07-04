import pymupdf

def _cell_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return " ".join(value.split()).strip()
    if hasattr(value, "get_text"):
        return " ".join(value.get_text().split()).strip()
    if hasattr(value, "text"):
        return " ".join(value.text.split()).strip()
    return " ".join(str(value).split()).strip()


def _group_spans_into_blocks(page, y_gap: float = 6.0):
    """Cluster text spans by overlapping y-coordinate → one block per transaction."""
    spans = []
    data = page.get_text("dict")
    for block in data["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                bbox = span["bbox"]
                spans.append({
                    "text": span["text"],
                    "bbox": bbox,
                    "y0": bbox[1],
                    "y1": bbox[3],
                })

    spans.sort(key=lambda s: s["y0"])

    blocks: list[list] = []
    current: list = []
    cur_y0 = cur_y1 = 0.0

    for s in spans:
        if not current:
            current = [s]
            cur_y0, cur_y1 = s["y0"], s["y1"]
        elif s["y0"] <= cur_y1 + y_gap and s["y1"] >= cur_y0 - y_gap:
            current.append(s)
            cur_y0 = min(cur_y0, s["y0"])
            cur_y1 = max(cur_y1, s["y1"])
        else:
            blocks.append(current)
            current = [s]
            cur_y0, cur_y1 = s["y0"], s["y1"]

    if current:
        blocks.append(current)

    for b in blocks:
        b.sort(key=lambda s: s["bbox"][0])

    return blocks


def parse_pdf(file_bytes: bytes, password: str = None) -> list[str]:
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")

    if doc.is_encrypted:
        if not password:
            raise ValueError("PDF is password protected. Please provide a password.")
        if not doc.authenticate(password):
            raise ValueError("Incorrect password.")

    rows: list[str] = []
    for page in doc:
        tables = page.find_tables()

        if tables.tables:
            for table in tables:
                extracted = table.extract()
                if not extracted:
                    continue
                for row in extracted:
                    cells = [_cell_text(c) for c in row]
                    cells = [c for c in cells if c]
                    if cells:
                        rows.append(",".join(cells))
        else:
            for block in _group_spans_into_blocks(page):
                line_text = " ".join(
                    _cell_text(s["text"]) for s in block
                )
                if line_text:
                    rows.append(line_text)

    doc.close()
    return rows