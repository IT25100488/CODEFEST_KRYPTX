# Key Technical Decisions (ADRs)

## 1. Multi-Hop Retrieval Instead of Single-Pass Vector Retrieval

- **Context**: Track 1B questions ("Connecting Facts Across Thousands of Pages") require connecting disparate facts that span multiple documents (e.g., *Character A → Member of Faction B → Victor of Conflict C*).
- **Decision**: Implemented an iterative agentic multi-hop retrieval architecture instead of standard single top-k search.
- **Why**: In baseline evaluations, single-pass retrieval achieved only a **14.29%** complete-chain retrieval rate because documents answering later hops share little semantic similarity with the initial user prompt. Multi-hop retrieval uses an LLM query planner between hops to generate entity-focused follow-up queries, boosting complete chain retrieval significantly.
- **Trade-offs**: Introduces additional latency per hop (LLM call + vector embedding). Mitigated by query deduplication, top-k candidate pruning, and strict hop limits (max 3 hops).

---

## 2. Voyage AI (`voyage-3` / `voyage-4`) for Domain Embeddings

- **Context**: The Ashen Era corpus is an invented fantasy universe with unique naming conventions, organizations, and esoteric terminology not present in general web pretraining data.
- **Decision**: Selected Voyage AI as the primary embedding provider.
- **Why**: Voyage AI embeddings offer superior dense semantic clustering for specialized domain terminology, long document contexts, and asymmetric query-to-passage retrieval. Furthermore, Voyage AI offers an extensive 200M token free tier for competition participants.
- **Trade-offs**: Remote API dependency requires network connectivity and rate-limit handling. Mitigated by wrapping embedding calls in exponential backoff retry logic (`1s, 2s, 4s, 8s`).

---

## 3. ChromaDB as Local Persistent Vector Store

- **Context**: The competition evaluation requires an easily reproducible local environment that judges can clone and run without hosting cloud databases (e.g., Pinecone, Milvus, or Qdrant cluster).
- **Decision**: Embedded ChromaDB (`chromadb.PersistentClient`) with a pre-indexed vector store in `data/vector_db/`.
- **Why**: Zero external infrastructure requirements, fast local cosine/L2 distance search, native metadata filtering, and straightforward portability.
- **Trade-offs**: Limited horizontal scaling compared to distributed vector databases, but ideal for the 415-document, 1,277-page Ashen Era corpus.

---

## 4. Query Planner with Explicit Entity Linking

- **Context**: Naive query expansion often generates generic, repetitive queries (e.g., "tell me more about this event").
- **Decision**: Implemented a specialized prompt with strict few-shot patterns instructing the planner to extract concrete named entities (people, factions, locations, artifacts) identified in Hop 1 and use them as targeted pivots for Hop 2.
- **Why**: Guarantees that subsequent vector searches zero in on the exact missing relationship in the multi-hop chain without drifting into irrelevant lore.
- **Trade-offs**: Sensitive to intermediate hallucination if not properly grounded. Guarded by strict negative constraints ("Do NOT invent entities; use ONLY entities explicitly mentioned in evidence").

---

## 5. Deterministic Source Attribution & Evidence Ranking

- **Context**: Generative models frequently hallucinate document filenames, citation titles, or combine passages that do not belong together.
- **Decision**: Built an independent `evidence_ranker` that calculates a composite score based on vector distance, entity overlap, and cross-reference density. Document filenames, chunk IDs, and source paths are attached deterministically via python metadata structures rather than asking the LLM to invent citations.
- **Why**: 100% precision in source citations. Eliminates phantom document citations and allows judges to click directly into the raw source passage in the UI.

---

## 6. Full-Stack Separation (FastAPI + Next.js 16)

- **Context**: A clean separation of concerns was required between core AI pipeline execution and user-facing presentation.
- **Decision**: Decoupled the project into a high-performance Python FastAPI backend (`api/main.py`) and a modern Next.js 16 App Router frontend (`frontend/`).
- **Why**: FastAPI provides native async Python support, Pydantic validation, and clean Swagger/OpenAPI documentation. Next.js Turbopack offers responsive UI rendering, dynamic drawer navigation for citations, thinking indicators, and benchmark question sidebars.