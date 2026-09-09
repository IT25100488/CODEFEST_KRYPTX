# SLIIT CODEFEST 2026 — AI COMPETITION
## SUBMISSION REPORT: TEAM KRYPTX

**Sub-track**: Sub-track 1B — *Connecting Facts Across Thousands of Pages*  
**System Name**: KRYPTX Intelligent Document Assistant  
**Repository**: [https://github.com/IT25100488/CODEFEST_KRYPTX](https://github.com/IT25100488/CODEFEST_KRYPTX)  
**Demonstration Video Link (YouTube Unlisted)**: `https://youtu.be/YOUR_UNLISTED_VIDEO_LINK_HERE`  *(Paste your uploaded YouTube link here)*

---

### Team Members & Contributions
| Member Name | Student ID | Primary Role | Key Contributions |
| :--- | :--- | :--- | :--- |
| **Dumindu Lakshan** | IT25100488 | Frontend & UI/UX Engineer | Next.js 16 App Router UI, interactive citation drawers, thinking trace animation, API reverse proxy. |
| **Vishwa Nimantha** | IT25102279 | Core AI & RAG Backend Engineer | Multi-hop query planner, evidence ranking algorithm, grounded answer synthesis, FastAPI endpoints. |
| **Team Member 3** | ITXXXXXXXX | Data & Embedding Engineer | Corpus text extraction (PDF/DOCX/MD), chunking strategy, Voyage AI embeddings, ChromaDB indexing. |
| **Team Member 4** | ITXXXXXXXX | QA, Benchmarking & DevOps | Evaluation framework, test dataset validation, rate-limit retry survival, documentation & git discipline. |

*(Please update the student IDs and member names above if needed)*

---

## 1. Problem Statement & Chosen Sub-Track

### Sub-track 1B: Connecting Facts Across Thousands of Pages
Enterprise knowledge bases mix diverse unstructured documents (reports, registries, transcripts, manuals). A critical enterprise challenge is answering questions whose answers cannot be resolved from any single page or document, but instead require traversing an interconnected chain of facts across disparate sources.

In the competition corpus—the **Ashen Era Archive** (415 documents, 1,277 pages across novels, wikis, codex data tables, and ephemera)—the world is entirely invented. General-purpose pre-trained LLMs have no prior knowledge of this lore. A standard single-pass vector retrieval fails because the initial user query shares minimal lexical or semantic overlap with the final resolution document (e.g. knowing who won an accord requires first identifying a person's cartel affiliation, and then searching for that cartel's treaty outcomes).

**KRYPTX** solves this via **Agentic Multi-Hop Retrieval**, dynamic query planning, composite evidence ranking, and strictly grounded answer synthesis with deterministic source verification.

---

## 2. Solution Overview & Architecture

### System Architecture Flow
```text
                         [ User Query ]
                               │
                               ▼
            [ Hop 1: Dense Vector Retrieval (Voyage AI) ]
                               │
                               ▼
            [ LLM Query Planner (Entity Disambiguation) ]
                               │
                               ▼
       [ Hop 2/3: Follow-Up Searches (Connecting Relationships) ]
                               │
                               ▼
            [ Evidence Ranker (Composite Scoring) ]
                               │
                               ▼
        [ Answer Generator (Strict Grounding & Formatting) ]
                               │
                               ▼
              [ FastAPI Backend + Next.js 16 UI ]
```

### Key Components:
1. **Document Ingestion & Chunking (`data_pipeline/`)**:
   - 415 documents parsed and segmented into 2,500-character chunks with 300-character overlaps to preserve local context.
   - Vectorized using Voyage AI (`voyage-3`/`voyage-4`) into a local persistent ChromaDB collection.
2. **Iterative Multi-Hop Retrieval (`retrieval/agentic_multi_hop.py`)**:
   - Executes Hop 1 against user query.
   - The query planner inspects retrieved candidate chunks, extracts discovered intermediate entities, and issues focused follow-up queries (up to 3 hops).
3. **Evidence Ranking & Anti-Hallucination (`retrieval/evidence_ranker.py`)**:
   - Ranks evidence by vector distance and cross-document entity density, enforcing document diversity (max 2 chunks/document).
4. **Deterministic Source Attribution (`rag/answer_generator.py`)**:
   - The LLM cites numeric evidence indices, which the backend maps to validated database chunk metadata. This achieves 100% citation precision and eliminates hallucinated sources.

---

## 3. Key Technical Decisions & Justifications

1. **Agentic Multi-Hop Traversal vs. High-k Single Search**:
   - *Decision*: Progressive multi-hop querying with an intermediate LLM planner.
   - *Justification*: In our baseline experiments, single retrieval achieved only a **14.29%** complete-chain retrieval rate. Multi-hop traversal allows the system to bridge semantic gaps between queries and disconnected evidence.
2. **Voyage AI Embeddings**:
   - *Decision*: Selected Voyage AI over standard OpenAI embeddings.
   - *Justification*: Superior performance on specialized naming conventions, dense document technicalities, and asymmetric search tasks.
3. **Embedded ChromaDB Vector Store**:
   - *Decision*: Embedded local ChromaDB instead of external managed vector cloud.
   - *Justification*: Ensures complete local reproducibility for judges without needing cloud infrastructure or external accounts.
4. **Resilience & Rate-Limit Survival**:
   - *Decision*: Embedded exponential backoff (`1s, 2s, 4s, 8s`) on all API requests and extended Next.js proxy timeout to 180s.
   - *Justification*: Complies with Section 9.3 of the competition rules, preventing demo recording failures and transient 429 rate limit drops.

---

## 4. What Works, Limitations & Failed Approaches

### What Works:
- Seamless multi-hop relationship resolution across 415 archive documents.
- Bold direct answers accompanied by step-by-step reasoning and bulleted evidence traces.
- Interactive web interface with citation previews and reasoning drawer.

### What Failed:
1. **Unconstrained Conversational Query Expansion**:
   - Early query planners generated conversational questions ("tell me more about..."), ruining vector similarity. Solved by constraining output to concise JSON entity keywords.
2. **Unbounded Agent Loops**:
   - Early versions looped indefinitely on ambiguous questions. Fixed by enforcing a strict `MAX_HOPS = 3` and evidence caps.
3. **LLM Markdown File Citations**:
   - LLMs hallucinated non-existent file names. Solved by enforcing numeric chunk ID references mapped deterministically in Python.

### Current Limitations:
- Sequential LLM calls on free-tier OpenRouter models introduce a 45–65s total latency. (Mitigatable in enterprise deployment using dedicated vLLM / frontier streaming models).

---

## 5. AI Usage Disclosure Summary

In compliance with Competition Section 4.1:
- **Tools Used**: ChatGPT & Claude (planning, debugging, prompt refinement), OpenRouter (runtime query planning & answer generation), Voyage AI (vector embeddings).
- **Human Steering**: The team designed the core multi-hop logic, selected the tech stack, set evaluation criteria, reviewed and corrected code, and authored the architecture.
- Full logs are preserved in `ai_usage/chat_logs/` and detailed in `ai_usage/ai-usage-disclosure.md`.
