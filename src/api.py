import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# LangChain Imports
from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_voyageai import VoyageAIEmbeddings
from langchain_core.tools import tool
from langchain.agents import create_agent

load_dotenv()

app = FastAPI(title="Ashen Era AI Assistant API")

llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name="liquid/lfm-2.5-2.6b:free", 
    max_retries=10,
)

embeddings = VoyageAIEmbeddings(
    voyage_api_key=os.getenv("VOYAGE_API_KEY"), 
    model="voyage-3"
)
vector_db = Chroma(
    persist_directory="data/vector_db", 
    embedding_function=embeddings,
    collection_name="ashen_era_archive"
)
retriever = vector_db.as_retriever(search_kwargs={"k": 3})

# --- NEW: Intercept Sources for the UI ---
current_request_sources = []

@tool
def search_ashen_era_archive(query: str) -> str:
    """Searches the Ashen Era database for facts. Use this to find clues to answer questions."""
    global current_request_sources
    docs = retriever.invoke(query)
    
    formatted_results = []
    for i, d in enumerate(docs):
        # Extract the actual file name from the metadata (e.g. data/Ashen_Era_Archive/codex/book.pdf)
        file_path = d.metadata.get("source", "Unknown Document")
        file_name = os.path.basename(file_path)
        
        # Save for the React Frontend
        current_request_sources.append({
            "document": file_name,
            "chunk": f"chunk-{i}",
            "text": d.page_content[:500] + "..." # Send a preview to the UI
        })
        
        # Send full text to the AI Agent
        formatted_results.append(f"Document: {file_name}\nContent: {d.page_content}")
        
    return "\n\n---\n\n".join(formatted_results)

tools = [search_ashen_era_archive]

system_prompt = """You are an elite detective for the Ashen Era Archive. 
You MUST use the 'search_ashen_era_archive' tool to find facts before answering. 
CRITICAL RULE: If your first search does not return the EXACT answer to the user's question, YOU ARE NOT ALLOWED to ask the user for permission to search again. You MUST autonomously use the search tool again and again with different, highly specific keywords until you find the exact clues needed to formulate a complete answer."""

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt=system_prompt,
    debug=True 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEW: Match the Frontend's Types ---
class SourceEvidence(BaseModel):
    document: str
    chunk: str
    text: str

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceEvidence]

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global current_request_sources
    current_request_sources = [] # Clear sources for the new question
    print(f"\n--- NEW QUESTION: {request.question} ---")
    
    try:
        inputs = {"messages": [{"role": "user", "content": request.question}]}
        response = agent.invoke(inputs)
        
        final_answer = response["messages"][-1].content
        
        # Return the exact documents intercepted
        return ChatResponse(answer=final_answer, sources=current_request_sources)
        
    except Exception as e:
        return ChatResponse(answer=f"Error: {str(e)}", sources=[])

@app.get("/api/health")
async def health_check():
    return {"status": "online"}