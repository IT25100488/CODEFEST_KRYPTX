# CODEFEST KRYPTX – Ashen Era Intelligent Document Assistant

An AI-powered multi-document question answering system developed for the
SLIIT Codefest 2026 AI Innovation Challenge – Sub-track 1B:
**Connecting Facts Across Thousands of Pages**.

The system performs multi-hop retrieval across the Ashen Era Archive and
generates evidence-grounded answers with supporting source documents.

## Team KRYPTX

- Data Engineering – document extraction, chunking, embeddings, vector database
- Backend – multi-hop RAG, LLM integration, FastAPI
- Frontend – chat interface and source display
- DevOps / QA – evaluation, Git workflow, documentation, testing

## Main Features

- Multi-document retrieval using ChromaDB
- Voyage AI embeddings
- Multi-hop query planning
- Evidence ranking
- Grounded answer generation
- Source attribution
- FastAPI backend
- Track 1B evaluation suite

## Project Structure

```text
CODEFEST_KRYPTX/
├── api/
├── data/
├── data_pipeline/
├── evaluation/
├── frontend/
├── llm/
├── rag/
├── retrieval/
└── README.md