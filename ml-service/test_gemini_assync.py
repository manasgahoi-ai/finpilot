import asyncio
from google import genai

client = genai.Client(api_key="AQ.Ab8RN6IIG7iqOmwQYaXEpMReiaVchy17eSAAywrPP60NLtfYag")

async def test():
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash',
        contents="Say hello"
    )
    print(response.text)

asyncio.run(test())