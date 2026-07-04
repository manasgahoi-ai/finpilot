from datetime import datetime
import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types
import asyncio

load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

PROMPT_TEMPLATE = """
Extract transactions from this bank statement. Return ONLY a valid JSON array.

Each transaction must have exactly:
- "date": YYYY-MM-DD format
- "description": string
- "amount": positive number, no symbols
- "type": "DEBIT" or "CREDIT"

DEBIT = money out, CREDIT = money in. If unclear, use DEBIT.

Output ONLY the JSON array, no other text.
EXAMPLE OUTPUT:
  "date": "2026-06-01", "description": "Swiggy Payment", "amount": 182.50, "type": "DEBIT"
  "date": "2026-06-02", "description": "Salary Credit", "amount": 50000, "type": "CREDIT"

STATEMENT:
{{STATEMENT}}

"""

async def retry(t: dict, error: list):
    template = """Transaction {{t}} is having issues: {{error}}

   Fix the transaction JSON based on the issue:
- key_missing: Add missing keys from ["date", "description", "amount", "type"].
- invalid_type/missing_type: Set "type" to "DEBIT" or "CREDIT".
- amount_not_number/invalid_amount: Convert "amount" to a clean number (no symbols/commas).
- invalid_date_format: Format "date" as YYYY-MM-DD.

Return ONLY a single valid JSON object. No array, no markdown wrapper, no extra text.
    """
    prompt = template.replace("{{t}}", json.dumps(t)).replace("{{error}}", ", ".join(error))
    fixed_tx = await call_llm_single_async(prompt)

    if validate_transaction(fixed_tx)[0]:
        return fixed_tx
    else:
        print(f"invalid transaction, dropped after retry: {t}")


def validate_transaction(t: dict) ->tuple[bool, dict]:
    error = []

    required = {"date", "description", "amount", "type"}
    if not required.issubset(t.keys()):
        return False, ["key_missing"]

    if t["type"] not in ("DEBIT", "CREDIT"):
        error.append('invalid_type/missing_type')
    
    if not isinstance(t["amount"], (int, float)):
        try:
            float(str(t["amount"]).replace("₹", "").replace(",", ""))
        except ValueError:
            error.append('amount_not_number/invalid_amount')
    
    original_date = t.get("date", "")
    if not re.match(r'\d{4}-\d{2}-\d{2}', original_date):
        for fmt in ("%b %d, %Y", "%d/%m/%Y", "%d-%m-%Y", "%d%b%Y"):
            try:
                t["date"] = datetime.strptime(original_date, fmt).strftime("%Y-%m-%d")
                break
            except ValueError:
                continue
        else:
            error.append('invalid_date_format')
    
    if error:
        return False, error
    return True, t

async def call_llm_async(prompt: str) -> list:
    response = await client.aio.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json"
        ),
    )
    content = response.text
    try:
        start = content.find("[")
        end = content.rfind("]") + 1
        return json.loads(content[start:end])
    except (json.JSONDecodeError, ValueError) as e:
        print(f"LLM returned invalid JSON: {e}\nContent: {content}")
        return []


async def call_llm_single_async(prompt: str) -> dict:
    response = await client.aio.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json"
        ),
    )
    content = response.text
    try:
        start = content.find("{")
        end = content.rfind("}") + 1
        return json.loads(content[start:end])
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Retry LLM returned invalid JSON: {e}")
        return {}

def chunk_rows(rows: list[str], max_rows: int = 60) -> list[list[str]]:
    chunks = []
    for i in range(0, len(rows), max_rows):
        chunks.append(rows[i:i + max_rows])
    return chunks

async def llm_extract(clean_text: str) -> list:
    prompt = PROMPT_TEMPLATE.replace("{{STATEMENT}}", clean_text)
    transactions = await call_llm_async(prompt)

    result = []

    for t in transactions:
        is_valid, outcome = validate_transaction(t)
        if is_valid:
            result.append(outcome)
        else:
            print(f"Transaction {t} invalid: {outcome}. Retrying...")
            fixed = await retry(t, outcome)
            result.append(fixed)

    final = [t for t in result if t is not None]

    dropped = len(transactions) - len(final)
    if dropped:
        print(f"WARNING: {dropped} transactions dropped after retry")

    return final