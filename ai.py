from google import genai

client = genai.Client(api_key="AIzaSyDvRsAzTW2M2lAxMc5FQhZbKRRLeFzvYRM")

def chat_with_gemini(user_input: str) -> str:
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_input + " You are a python code optimizer. For any code given to you, first calculate its complexity and then write another code with efficient complexity. Only provide Optimized Code without '''."
    )
    
    # ✅ Extract text from response (instead of returning raw object)
    try:
        return response.text  # shortcut (Google Gemini SDK exposes .text)
    except AttributeError:
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text
        return "⚠️ No response from Gemini."
    
    # cleaned = re.sub(r"```(?:python)?\n?|```", "", text).strip()
    # return cleaned

# res = chat_with_gemini("code for febo")
# print(res)