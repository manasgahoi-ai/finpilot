from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdf_parser import parse_pdf
from rule_classifier import classify
from strip_pii import strip_pii
from llm_extracter import llm_extract

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClassifyRequest(BaseModel):
    description: str

@app.get("/")
def root():
    return {"status": "ml-service running"}

@app.post("/parse")
async def parse_statement(file: UploadFile = File(...)):
    contents = await file.read()
    raw_text = parse_pdf(contents)
    return {
        "filename": file.filename,
        "raw_text_length": len(raw_text),
        "raw_text_preview": raw_text
    }

@app.post("/classify")
async def classify_text(request: ClassifyRequest):
    category = classify(request.description)
    return {"category": category}

@app.post("/debug/clean-text")
async def debug_clean_text(file: UploadFile = File(...)):
    contents = await file.read()
    raw_text = parse_pdf(contents)
    clean_text = strip_pii(raw_text)
    return {
        "filename": file.filename,
        "raw_length": len(raw_text),
        "clean_length": len(clean_text),
        "clean_text": clean_text
    }

@app.post("/parse-transactions")
async def parse_transactions(file: UploadFile = File(...)):
    contents = await file.read()
    text = parse_pdf(contents)
    clean_text = strip_pii(text)
    
    transactions = await llm_extract(clean_text)

    for tx in transactions:
        tx["category"] = classify(tx.get("description", ""))

    return {
        "count": len(transactions),
        "transactions": transactions
    }