import json

from llm.client import ask_llm

def parse_llm_json(response):
    """
    Parse JSON returned by the LLM,
    including Markdown fenced JSON.
    """

    cleaned = response.strip()

    cleaned = cleaned.replace("```json", "")
    cleaned = cleaned.replace("```", "")
    cleaned = cleaned.strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1:
        raise json.JSONDecodeError(
            "No JSON object found",
            cleaned,
            0
        )

    cleaned = cleaned[start:end + 1]

    return json.loads(cleaned)


def build_evidence_context(evidence):
    """
    Convert retrieved evidence chunks into a clean context
    for the answer-generation LLM.
    """

    context_parts = []

    for index, item in enumerate(evidence, start=1):

        filename = item.get(
            "filename",
            "Unknown document"
        )

        source_folder = item.get(
            "source_folder",
            "Unknown"
        )

        chunk_id = item.get(
            "chunk_id",
            "Unknown"
        )

        text = item.get(
            "text",
            ""
        )

        context_parts.append(
            f"""
==============================
EVIDENCE {index}
==============================

Document:
{filename}

Source folder:
{source_folder}

Chunk ID:
{chunk_id}

Text:
{text}
"""
        )

    return "\n".join(context_parts)


def create_answer_prompt(question, evidence):
    """
    Create a strict evidence-grounded prompt.

    The prompt is specifically designed for Track 1B,
    where answers may require connecting relationships
    across multiple documents.
    """

    context = build_evidence_context(evidence)

    prompt = f"""
You are the final reasoning and answer-generation agent
for the Ashen Era Archive.

You must answer the user's question using ONLY the
retrieved evidence below.

You have NO permission to use outside knowledge.

==================================================
USER QUESTION
==================================================

{question}

==================================================
RETRIEVED EVIDENCE
==================================================

{context}

==================================================
REASONING REQUIREMENTS
==================================================

Many Ashen Era Archive questions require connecting
facts from multiple documents.

Before giving the final answer, internally determine
the relationship chain required to answer the question.

Use this reasoning pattern:

ENTITY A
    ↓
relationship
    ↓
ENTITY B
    ↓
relationship
    ↓
ENTITY C
    ↓
FINAL ANSWER

For example, if the evidence establishes:

Person A
→ member of
Faction B

and:

Faction B
→ victor of
War C

then the answer can be derived as:

Person A
→ member of
Faction B
→ victor of
War C

Do NOT skip a relationship step.

==================================================
STRICT GROUNDING RULES
==================================================

1. Every important claim must be supported by the
   retrieved evidence.

2. Do not invent entities, relationships, events,
   locations, organizations, dates, or objects.

3. Do not assume that two entities are connected just
   because they appear in the same document.

4. A mention of two entities in the same passage does
   NOT automatically prove a relationship between them.

5. If the question requires multiple hops, identify
   each hop from the evidence.

6. If one relationship in the required chain is missing,
   do NOT guess the missing relationship.

7. If the evidence is insufficient, explicitly say that
   the available archive evidence is insufficient.

8. If sources conflict, acknowledge the conflict instead
   of silently choosing an unsupported answer.

9. Prefer explicit statements over weak implications.

10. Prefer evidence that directly states the relationship
    required by the question.

==================================================
ANSWER REQUIREMENTS
==================================================

Return ONLY valid JSON in exactly this structure:

{{
    "answer": "<direct concise answer>",
    "reasoning": "<short evidence-grounded explanation>",
    "evidence_ids": [1, 2]
}}

Rules:

- "answer" must contain only the direct answer.
- "reasoning" must briefly explain the relationship chain.
- "evidence_ids" must contain the evidence numbers that
  directly support the answer.
- Only use evidence numbers that exist in the retrieved evidence.
- Do NOT write document filenames yourself.
- Do NOT create a Sources section.
- Do NOT include markdown code fences.
- Do NOT expose hidden chain-of-thought.

==================================================
FINAL CHECK BEFORE ANSWERING
==================================================

Before producing the final response, check:

[ ] Did I answer the actual question?
[ ] Is the answer explicitly supported?
[ ] Did I connect all required relationships?
[ ] Did I avoid unsupported assumptions?
[ ] Did I avoid outside knowledge?
[ ] Did I handle conflicting evidence honestly?
[ ] Did I identify the relevant source documents?

If any required relationship is unsupported,
say that the evidence is insufficient instead of guessing.

Now answer the user's question.
"""

    return prompt


def generate_answer(question, evidence):
    """
    Generate the final grounded answer.
    """

    if not evidence:
        return {
            "answer": (
                "I could not find sufficient evidence in "
                "the Ashen Era Archive to answer this question."
            ),
            "reasoning": "",
            "evidence": []
        }

    prompt = create_answer_prompt(
        question,
        evidence
    )

    print("\n")
    print("=" * 55)
    print("                 GENERATING ANSWER")
    print("=" * 55)

    try:
        response = ask_llm(
            prompt,
            temperature=0.0
        )

    except Exception as error:

        print(
            "\nAnswer generation failed:",
            error
        )

        return {
            "answer": (
                "I was unable to generate an answer because "
                "the language model request failed."
            ),
            "reasoning": "",
            "evidence": evidence,
            "error": str(error)
        }

    if not response or not response.strip():

        return {
            "answer": "The language model returned an empty answer.",
            "reasoning": "",
            "evidence": evidence,
            "error": "Empty LLM response"
        }

    try:
        parsed = parse_llm_json(response)

        answer = parsed.get(
            "answer",
            "I could not determine an answer."
        )

        reasoning = parsed.get(
            "reasoning",
            ""
        )

        evidence_ids = parsed.get(
            "evidence_ids",
            []
        )

        cited_evidence = []

        for evidence_id in evidence_ids:

            if (
                isinstance(evidence_id, int)
                and 1 <= evidence_id <= len(evidence)
            ):
                cited_evidence.append(
                    evidence[evidence_id - 1]
                )

        return {
            "answer": answer,
            "reasoning": reasoning,
            "evidence": cited_evidence
        }

    except json.JSONDecodeError:

        print("\nInvalid JSON response. Retrying once...")

        try:
            retry_response = ask_llm(
                prompt,
                temperature=0.0
            )

            parsed = parse_llm_json(
                retry_response
            )

            answer = parsed.get(
                "answer",
                "I could not determine an answer."
            )

            reasoning = parsed.get(
                "reasoning",
                ""
            )

            evidence_ids = parsed.get(
                "evidence_ids",
                []
            )

            cited_evidence = []

            for evidence_id in evidence_ids:
                if (
                    isinstance(evidence_id, int)
                    and 1 <= evidence_id <= len(evidence)
                ):
                    cited_evidence.append(
                        evidence[evidence_id - 1]
                    )

            return {
                "answer": answer,
                "reasoning": reasoning,
                "evidence": cited_evidence
            }

        except Exception as retry_error:

            return {
                "answer": (
                    "I could not generate a reliable answer "
                    "from the available evidence."
                ),
                "reasoning": "",
                "evidence": evidence,
                "error": str(retry_error)
            }


def print_answer(result):
    """
    Print the generated answer, reasoning,
    and supporting evidence.
    """

    print("\n")
    print("=" * 60)
    print("                 FINAL ANSWER")
    print("=" * 60)

    print("\nAnswer:")
    print(
        result.get(
            "answer",
            ""
        )
    )

    reasoning = result.get(
        "reasoning",
        ""
    )

    if reasoning:
        print("\nReasoning:")
        print(reasoning)

    evidence = result.get(
        "evidence",
        []
    )

    print("\n")
    print("=" * 60)
    print("                 SOURCES USED")
    print("=" * 60)

    for index, item in enumerate(
        evidence,
        start=1
    ):
        print(f"\n[{index}]")

        print(
            "Document:",
            item.get("filename")
        )

        print(
            "Folder:",
            item.get("source_folder")
        )

        print(
            "Chunk:",
            item.get("chunk_id")
        )