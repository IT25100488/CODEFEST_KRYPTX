# System Architecture

## Overview

**KRYPTX** is an enterprise-grade Intelligent Document Assistant engineered for **SLIIT Codefest 2026 (Sub-track 1B: Connecting Facts Across Thousands of Pages)**. 

The system tackles the challenge of answering multi-hop queries across the 415-document **Ashen Era Archive** by iteratively uncovering relationships across novels, wiki entries, codex registers, and historical ephemera.

---

## Architecture Diagram

![System Architecture](diagrams/kryptx_codefest_system_architecture.png)

---

## End-to-End Execution Flow

```text
                           [ Ashen Era Corpus (415 docs) ]
                                          │
                                          ▼
                               [ Text Extraction & OCR ]
                                          │
                                          ▼
                            [ Chunking (2500c / 300o) ]
                                          │
                                          ▼
                              [ Voyage AI Embeddings ]
                                          │
                                          ▼
                            [ ChromaDB Vector Storage ]
                                          │
═════════════════════════════════════════════════════════════════════════════════
                                   RUNTIME RAG
═════════════════════════════════════════════════════════════════════════════════
                                 [ User Query ]
                                        │
                                        ▼
                             ┌───► [ Hop 1 Retrieval ]
                             │          │
                             │          ▼
                             │   [ Aggregate Evidence ]
                             │          │
                             │          ▼
                             │   [ LLM Query Planner ]
                             │          │
                     Hop < 3 └──────────┴──────────┐ Hop == 3 or No New Queries
                                                   ▼
                                        [ Evidence Ranker ]
                                        (Composite Scoring)
                                                   │
                                                   ▼
                                        [ Answer Generator ]
                                        (Strict Grounding)
                                                   │
                                                   ▼
                                         [ JSON Validation ]
                                                   │
                                                   ▼
                                       [ FastAPI Backend API ]
                                                   │
                                                   ▼
                                       [ Next.js 16 Web UI ]
```

---

## Core Components

### 1. Data Ingestion & Indexing Pipeline (`data_pipeline/`)
- **Document Parser (`extract_text.py`)**: Extracts structured content from PDF, DOCX, Markdown, and TXT files.
- **Chunker (`chunk_documents.py`)**: Implements semantic sliding-window chunking (2,500 characters with 300-character overlap), preserving header hierarchies.
- **Vector Database (`create_vector_database.py` & `retriever.py`)**: Generates 1024-dimensional embeddings via Voyage AI (`voyage-3`/`voyage-4`) and stores them in a persistent local ChromaDB collection (`data/vector_db`).

### 2. Agentic Multi-Hop Retrieval (`retrieval/agentic_multi_hop.py`)
- **Progressive Entity Discovery**: Rather than stopping at initial search results, the query planner analyzes extracted chunks for named entities (factions, characters, artifacts, treaties).
- **Dynamic Search Iteration**: Formulates targeted follow-up queries for missing links (up to 3 hops) while enforcing deduplication and preventing query loops.

### 3. Evidence Ranking & Attribution (`retrieval/evidence_ranker.py`)
- Combines vector distance, document diversity (max 2 chunks per document), and query keyword presence into a unified evidence score.
- Selects the top 8 most supportive passages to fit within the optimal context window.

### 4. Grounded Answer Synthesis (`rag/answer_generator.py`)
- Employs a strict evidence-grounded prompt:
  - Direct answer prominently stated in bold.
  - Multi-hop relationship trace in structured bullet points.
  - Deterministic source citations matched against chunk metadata.
- JSON output parsing with automated fallback retries.

### 5. API & Modern Interface (`api/` & `frontend/`)
- **FastAPI Backend (`api/main.py`)**: Exposes REST endpoints (`/api/health`, `/api/chat`) with Pydantic request validation and async handlers.
- **Next.js 16 Frontend (`frontend/`)**: Modern reactive interface built with React 19, Tailwind CSS v4, Lucide icons, expandable reasoning traces, and citation drawers.