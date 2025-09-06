from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
#from mangum import Mangum
from ai import chat_with_gemini

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    bot_reply = chat_with_gemini(request.message)
    return {"response": bot_reply}

# Needed for Vercel serverless
# def handler(event, context):
#     asgi_handler = Mangum(app)
#     return asgi_handler(event, context)
