from google import genai

# Test with standard sync execution
client = genai.Client(api_key="AQ.Ab8RN6IIG7iqOmwQYaXEpMReiaVchy17eSAAywrPP60NLtfYag")

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="Say hello"
    )
    print("\n--- SYNC TEST SUCCESSFUL ---")
    print(f"Gemini Responded: {response.text}\n")
except Exception as e:
    print("\n--- SYNC TEST FAILED ---")
    print(f"Error details: {e}\n")
