import asyncio

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdf_parser import parse_pdf
from rule_classifier import classify
from strip_pii import strip_pii
from llm_extracter import llm_extract, chunk_rows
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    global SEMAPHORE
    SEMAPHORE = asyncio.Semaphore(2)
    yield
    # cleanup on shutdown (nothing to clean here)

app = FastAPI(lifespan=lifespan)

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
async def parse_statement(file: UploadFile = File(...), password: str = Form(None)):
    contents = await file.read()
    raw_text = parse_pdf(contents, password=password)
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
async def debug_clean_text(file: UploadFile = File(...), password: str = Form(None)):
    contents = await file.read()
    rows = parse_pdf(contents, password=password)
    clean_text = (strip_pii(r) for r in rows)
    return {
        "filename": file.filename,
       ''' "raw_length": len(rows),
        "clean_length": len(clean_text),'''
        "clean_text": clean_text
    }



@app.post("/parse-transactions")
async def parse_transactions(file: UploadFile = File(...), password: str = Form(None)):
    async def extract_with_limit(chunks):
        async with SEMAPHORE:
            return await llm_extract(chunks)
        
    contents = await file.read()
    rows = parse_pdf(contents, password=password)
    clean_rows = (strip_pii(r) for r in rows)

    chunks = chunk_rows(list(clean_rows), max_rows=60)
    results = await asyncio.gather(*[extract_with_limit("\n".join(c)) for c in chunks])
    transactions = [tx for chunk_result in results for tx in chunk_result]

    for tx in transactions:
        tx["category"] = classify(tx.get("description", ""))

    return {
        "count": len(transactions),
        "transactions": transactions
    }