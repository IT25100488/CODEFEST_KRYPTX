import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# NEW IMPORTS FOR DATABASE
from langchain_chroma import Chroma
from langchain_voyageai import VoyageAIEmbeddings

load_dotenv()

app = FastAPI(title="Ashen Era AI Assistant API")

# 1. Connect to the LLM (The Brain)
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name="liquid/lfm-2.5-2.6b:free", 
    max_retries=10,
)

# 2. Connect to the Database (The Memory)
embeddings = VoyageAIEmbeddings(
    voyage_api_key=os.getenv("VOYAGE_API_KEY"), 
    model="voyage-3"
)
vector_db = Chroma(
    persist_directory="data/vector_db", 
    embedding_function=embeddings,
    collection_name="ashen_era_archive"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    print(f"Received question: {request.question}")
    
    try:
        #  Search the database for the 3 most relevant paragraphs!
        results = vector_db.similarity_search(request.question, k=3)
        
        #  Combine the facts into a giant string
        context = ""
        sources = []
        for doc in results:
            context += doc.page_content + "\n\n"
            sources.append(doc.metadata.get("filename", "Unknown file"))
            
        #  Tell the AI to use ONLY these facts to answer
        prompt = f"""You are the Ashen Era Assistant. Answer the question using ONLY the facts below.
        
        FACTS:
        {context}
        
        QUESTION: {request.question}"""
        
        messages = [HumanMessage(content=prompt)]
        ai_response = llm.invoke(messages)
        
         #Return the answer AND the source files we found!
        return ChatResponse(answer=ai_response.content, sources=sources)
        
    except Exception as e:
        return ChatResponse(answer=f"Error: {str(e)}", sources=["Error Log"])