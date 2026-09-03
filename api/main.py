from fastapi import FastAPI
from pydantic import BaseModel

from src.rag.pipeline import run_rag_pipeline


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="Ashen Era Intelligent Document Assistant",
    description="AI-powered multi-hop RAG API for the Ashen Era Archive",
    version="1.0.0"
)


# ---------------------------------------------------------
# Request model
# ---------------------------------------------------------

class ChatRequest(BaseModel):
    question: str


# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Ashen Era Intelligent Document Assistant"
    }


# ---------------------------------------------------------
# Chat endpoint
# ---------------------------------------------------------

@app.post("/api/chat")
def chat(request: ChatRequest):

    question = request.question.strip()

    # Check for empty question
    if not question:
        return {
            "question": "",
            "answer": "Please enter a question.",
            "reasoning": "",
            "sources": []
        }

    # Run the existing RAG pipeline
    result = run_rag_pipeline(question)

    # -----------------------------------------------------
    # Convert RAG evidence into API sources
    # -----------------------------------------------------

    sources = []

    for item in result.get("evidence", []):

        sources.append({
            "document": item.get("filename", ""),
            "chunk": item.get("chunk_id", ""),
            "source_folder": item.get("source_folder", ""),
            "relative_path": item.get("relative_path", "")
        })

    return {
        "question": question,
        "answer": result.get(
            "answer",
            "I could not find an answer in the archive."
        ),
        "reasoning": result.get("reasoning", ""),
        "sources": sources
    }