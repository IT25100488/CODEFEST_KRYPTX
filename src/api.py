from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI app
app = FastAPI(title="Ashen Era AI Assistant API")

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
    """
    This is the backend endpoint the frontend will call.
    Right now, it returns dummy data so the Frontend developer can start working.
    Later, we will replace this dummy logic with the real LangChain RAG pipeline!
    """
    print(f"Received question from frontend: {request.question}")
    
    # TODO: Connect to Member 1's Vector Database
    # TODO: Implement Multi-hop retrieval for Track 1B
    # TODO: Send facts to OpenRouter LLM
    
    # DUMMY RESPONSE (To unblock Frontend Developer)
    dummy_answer = f"This is a placeholder answer for your question: '{request.question}'. The real AI logic is under construction!"
    dummy_sources = ["chronicles_vol1.pdf", "wiki_factions.md"]
    
    return ChatResponse(answer=dummy_answer, sources=dummy_sources)

# To run this server, use the command:
# uvicorn src.api:app --reload
