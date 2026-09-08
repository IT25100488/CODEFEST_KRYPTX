
For `docs/decisions.md`:

```markdown
# Key Technical Decisions

## 1. Multi-Hop Retrieval Instead of Single Retrieval

A standard single top-k semantic search frequently returned only one part of the evidence chain required by Sub-track 1B questions.

For this reason, the team implemented agentic multi-hop retrieval.

The system first retrieves evidence using the original question and then generates follow-up queries based on the entities and relationships found in the retrieved evidence.

This allows the system to move through chains such as:

```text
Person → Faction → Conflict