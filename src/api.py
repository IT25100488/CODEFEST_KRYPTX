import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# LangChain Imports
from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_voyageai import VoyageAIEmbeddings
from langchain_core.tools import create_retriever_tool
from langchain.agents import create_agent

load_dotenv()

app = FastAPI(title="Ashen Era AI Assistant API")

# 1. Connect to the LLM
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name="liquid/lfm-2.5-2.6b:free", 
    max_retries=10,
)

# 2. Connect to the Database
embeddings = VoyageAIEmbeddings(
    voyage_api_key=os.getenv("VOYAGE_API_KEY"), 
    model="voyage-3"
)
vector_db = Chroma(
    persist_directory="data/vector_db", 
    embedding_function=embeddings,
    collection_name="ashen_era_archive"
)

# 3. Create the Search Tool for the Agent
retriever = vector_db.as_retriever(search_kwargs={"k": 3})
search_tool = create_retriever_tool(
    retriever,
    "search_ashen_era_archive",
    "Searches the Ashen Era database for facts. Use this to find clues to answer questions."
)
tools = [search_tool]

# 4. Build the Agent
system_prompt = "You are the Ashen Era Assistant. You must use the search tool to find facts before answering. If the first search doesn't give you the full answer, use the search tool again with different keywords until you connect the clues!"

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt=system_prompt,
    debug=True # This prints the agent's thoughts to the terminal!
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
    print(f"\n--- NEW QUESTION: {request.question} ---")
    
    try:
        # Ask the Agent to solve the problem
        inputs = {"messages": [{"role": "user", "content": request.question}]}
        response = agent.invoke(inputs)
        
        # Get the final answer message
        final_answer = response["messages"][-1].content
        
        return ChatResponse(answer=final_answer, sources=["Agent Search Results"])
        
    except Exception as e:
        return ChatResponse(answer=f"Error: {str(e)}", sources=["Error Log"])