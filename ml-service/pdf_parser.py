import pymupdf4llm
import tempfile
import os

def parse_pdf(file_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    
    try:
        return pymupdf4llm.to_markdown(tmp_path, header = False, footer = False)
    finally:
        os.unlink(tmp_path)
