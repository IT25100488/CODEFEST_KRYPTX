# AI Usage Disclosure

## Team KRYPTX

This project was developed with the assistance of AI tools, in accordance with the SLIIT Codefest 2026 AI Competition rules.

## AI Tools Used

### ChatGPT
ChatGPT was used as a development assistant for:

- understanding the competition requirements
- planning the multi-hop RAG architecture
- debugging Python errors and import-path issues
- improving query-planning logic
- designing evaluation scripts
- interpreting retrieval results
- improving answer-generation robustness
- reviewing API integration
- assisting with README and documentation
- helping identify limitations and failed approaches

### OpenRouter-hosted LLMs

OpenRouter was used inside the application as the LLM gateway for:

- follow-up query generation
- multi-hop query planning
- grounded final-answer generation

The application was configured to use an OpenRouter free-model route during development.

### Voyage AI

Voyage AI embeddings were used to represent document chunks and user queries for semantic retrieval.

## Human Decisions and Contributions

The AI tools did not independently design or submit the solution.

The team made the main engineering decisions, including:

- selecting Sub-track 1B
- choosing a Retrieval-Augmented Generation architecture
- selecting ChromaDB as the vector database
- selecting Voyage AI embeddings
- implementing a multi-hop retrieval strategy
- deciding retrieval limits and evidence limits
- creating the baseline evaluation methodology
- manually reviewing retrieval-chain successes and failures
- identifying weaknesses in the query planner
- deciding how fallback queries should be improved
- deciding to generate source metadata deterministically rather than allowing the LLM to invent source names
- adding retry handling for malformed LLM responses
- verifying the system through end-to-end tests
- reviewing and accepting or rejecting AI-generated code suggestions

AI-generated suggestions were tested, modified, and corrected by the team before being integrated into the repository.

## Examples of Iterative Human–AI Collaboration

During development, several AI suggestions required correction or refinement.

Examples include:

- incorrect `src.*` import paths were identified and corrected to match the actual repository structure
- malformed or weak fallback search queries were observed during testing and the fallback strategy was redesigned
- the first deterministic entity extraction logic mishandled hyphenated names such as `Iron-Ring Cartel`
- the query planner initially failed to continue from an intermediate entity to the next required relationship
- the answer generator initially allowed the LLM to reproduce source filenames, resulting in unreliable source attribution
- JSON responses wrapped in Markdown code fences caused parsing failures and required a more robust parser
- an LLM response of `User Safety: safe` caused an answer-generation failure, leading the team to add a one-time retry mechanism

These changes were made after observing actual system behavior rather than accepting one-shot AI-generated output.

## Evaluation

The team created a baseline single-query retrieval evaluation and compared it with the agentic multi-hop approach.

Measured development-set results included:

- Baseline complete-chain retrieval rate: 14.29%
- Agentic multi-hop complete-chain retrieval rate: 85.71%
- Absolute improvement: +71.42 percentage points
- Final Track 1B development-question result after fixes: 7/7 questions answered correctly

These results are based only on the provided development questions and do not represent guaranteed performance on the hidden judging set.

## AI Chat Logs

Full AI development conversation logs are included separately in:

```text
ai_usage/chat_logs/