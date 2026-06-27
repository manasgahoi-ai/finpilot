import re

def strip_pii(text: str) -> str:
    # Structured patterns
    text = re.sub(r'\b\d{12,}\b', '[TXN_ID]', text)
    text = re.sub(r'[A-Z]{5}[0-9]{4}[A-Z]', '[PAN]', text)
    text = re.sub(r'[A-Z]{4}0[A-Z0-9]{6}', '[IFSC]', text)
    text = re.sub(r'(\+91)?[6-9]\d{9}', '[PHONE]', text)
    text = re.sub(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', '[EMAIL/UPI]', text)
    text = re.sub(r'X+\d{3,4}', '[ACCT]', text)
    
    # Label-based patterns
    text = re.sub(r'Address\s*:.*?(?=\n[A-Z]|\n\n|$)', '[ADDRESS]', text, flags=re.IGNORECASE|re.DOTALL)
    text = re.sub(r'CIF\s*(Id|No\.|No|Number|#)?\s*:?\s*\d+', '[CIF]', text, flags=re.IGNORECASE)
    text = re.sub(r'Customer\s*(ID|No\.|No|Number)\s*:?\s*\d+', '[CUST_ID]', text, flags=re.IGNORECASE)
    text = re.sub(r'A/?c\s*(No\.|No|Number)?\s*:?\s*[\dX]+', '[ACCT]', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(?:\w+\s*)?Code\s*:\s*\w+', '[BRANCH_CODE]', text, flags=re.IGNORECASE)
    
    # Digit patterns
    text = re.sub(r'\b\d{4}\s\d{4}\s\d{4}\b', '[AADHAAR]', text)
    text = re.sub(r'\b\d{14}\b', '[CKYC]', text)
    text = re.sub(r'\b\d{10,}\b', '[TXN_ID]', text)
    
    return text