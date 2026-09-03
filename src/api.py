import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

# Initialize the FastAPI app
app = FastAPI(title="Ashen Era AI Assistant API")

llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name="google/gemma-4-31b-it:free", 
    max_retries=10, # <--- ADD THIS LINE! This tells it to wait and try again automatically if it fails.
)

# Allow the frontend to connect without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data structure we expect from the frontend
class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]

# The main chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    print(f"Received question from frontend: {request.question}")
    
    try:
        messages = [HumanMessage(content=request.question)]
        ai_response = llm.invoke(messages)
        real_answer = ai_response.content
        dummy_sources = ["Waiting for Database..."]
        return ChatResponse(answer=real_answer, sources=dummy_sources)
        
    except Exception as e:
        # If OpenRouter is rate-limited or the model is down, we catch the error!
        error_message = f"OpenRouter API Error: {str(e)}"
        print(error_message)
        return ChatResponse(answer=error_message, sources=["Error Log"])