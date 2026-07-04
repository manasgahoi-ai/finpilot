import pymupdf

def decrypt_file(file_bytes: bytes, password: str) -> pymupdf.Document:
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    
    if doc.is_encrypted:

        if password is None:
            raise ValueError("Password not provided")
        
        is_unlocked = doc.authenticate(password)

        if not is_unlocked:
            raise ValueError("Incorrect password.")
    
    return doc