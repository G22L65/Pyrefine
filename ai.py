from google import genai
from dotenv import load_dotenv
import os
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def chat_with_gemini(user_input: str) -> str:
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_input 
    )
    
    # ✅ Extract text from response (instead of returning raw object)
    try:
        return response.text  # shortcut (Google Gemini SDK exposes .text)
    except AttributeError:
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text.strip()
        return "⚠️ No response from Gemini."
    
    # cleaned = re.sub(r"```(?:python)?\n?|```", "", text).strip()
    # return cleaned

# # res = chat_with_gemini("code for febo")
# # print(res)