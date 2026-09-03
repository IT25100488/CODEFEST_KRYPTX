import json
import re

from src.llm.client import ask_llm


MAX_FOLLOW_UP_QUERIES = 3


def build_evidence_text(evidence):
    """
    Convert retrieved evidence into a readable format
    for the query-planning LLM.
    """

    parts = []

    for index, item in enumerate(evidence, start=1):

        filename = item.get(
            "filename",
            "Unknown document"
        )

        chunk_id = item.get(
            "chunk_id",
            "Unknown chunk"
        )

        text = item.get(
            "text",
            ""
        )

        parts.append(
            f"""
--- EVIDENCE {index} ---

Document: {filename}
Chunk: {chunk_id}

{text}
"""
        )

    return "\n".join(parts)


def create_planner_prompt(question, evidence):
    """
    Create the prompt that asks the LLM to identify
    useful follow-up searches.
    """

    evidence_text = build_evidence_text(
        evidence
    )

    prompt = f"""
You are the query planning component of an
Intelligent Document Assistant for the Ashen Era Archive.

The user asked:

{question}

The system has already retrieved this evidence:

{evidence_text}

Your task is to decide what information is still missing
to answer the user's question.

This is a MULTI-HOP retrieval system.

A question may require connecting several facts, such as:

person -> person
person -> organization
person -> location
person -> event
organization -> event
location -> event
object -> person
or other relationships.

Study the retrieved evidence carefully.

If additional evidence is needed, create between 1 and 3
specific follow-up search queries.

The queries should contain useful entities or concepts
from the evidence.

For example, if the question is:

How is Corvus Hollowmere connected to the Silent Choir,
and how does that relate to Hesper Wrenfield?

Useful searches could be:

[
  "Corvus Hollowmere Silent Choir",
  "Hesper Wrenfield Corvus Hollowmere",
  "Hesper Wrenfield Silent Choir"
]

Do NOT create vague queries such as:

"find more information"
"search again"
"explain this"

IMPORTANT RULES:

1. Return ONLY a JSON array.
2. Every item must be a string.
3. Maximum 3 queries.
4. Do not repeat the original question.
5. Do not invent entities.
6. Use entities actually supported by the evidence.
7. Queries must be useful for archive retrieval.
8. If no additional search is necessary, return [].
9. Do not include markdown.
10. Do not include explanations.

Return ONLY something like:

["query one", "query two"]
"""

    return prompt


def extract_json_array(text):
    """
    Safely extract a JSON array from the LLM response.
    """

    if not text:
        return []

    text = text.strip()

    # Remove markdown fences if the LLM accidentally adds them.
    text = text.replace(
        "```json",
        ""
    )

    text = text.replace(
        "```",
        ""
    )

    text = text.strip()

    # ---------------------------------------------
    # Try direct JSON
    # ---------------------------------------------

    try:

        result = json.loads(text)

        if isinstance(result, list):
            return result

    except json.JSONDecodeError:
        pass

    # ---------------------------------------------
    # Try finding JSON array inside response
    # ---------------------------------------------

    match = re.search(
        r"\[[\s\S]*\]",
        text
    )

    if match:

        try:

            result = json.loads(
                match.group(0)
            )

            if isinstance(result, list):
                return result

        except json.JSONDecodeError:
            pass

    # ---------------------------------------------
    # Try extracting quoted strings
    # ---------------------------------------------

    matches = re.findall(
        r'"([^"]+)"',
        text
    )

    if matches:
        return matches

    return []


def clean_queries(
    queries,
    original_question
):
    """
    Clean and remove duplicate queries.
    """

    cleaned = []

    original_lower = (
        original_question
        .strip()
        .lower()
    )

    for query in queries:

        if not isinstance(
            query,
            str
        ):
            continue

        query = re.sub(
            r"\s+",
            " ",
            query.strip()
        )

        if not query:
            continue

        # Don't search the exact original question again.
        if query.lower() == original_lower:
            continue

        # Remove duplicates.
        if query.lower() in [
            existing.lower()
            for existing in cleaned
        ]:
            continue

        cleaned.append(query)

    return cleaned[
        :MAX_FOLLOW_UP_QUERIES
    ]


def deterministic_fallback(
    question,
    evidence
):
    """
    Backup strategy if the LLM returns no usable
    follow-up queries.

    Extract likely named entities from retrieved
    evidence and create additional searches.
    """

    question_lower = (
        question.lower()
    )

    entities = []

    for item in evidence:

        text = item.get(
            "text",
            ""
        )

        # Find capitalized multi-word names.
        matches = re.findall(
            r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}\b",
            text
        )

        for entity in matches:

            entity = entity.strip()

            if len(entity) < 4:
                continue

            # Ignore entities already explicitly
            # present in the question.
            if entity.lower() in question_lower:
                continue

            if entity not in entities:
                entities.append(entity)

    queries = []

    # Create searches around discovered entities.
    for entity in entities:

        query = entity

        if query.lower() not in [
            existing.lower()
            for existing in queries
        ]:

            queries.append(query)

        if len(queries) >= MAX_FOLLOW_UP_QUERIES:
            break

    return queries


def plan_follow_up_queries(
    question,
    evidence
):
    """
    Main query-planning function.

    1. Ask LLM.
    2. Parse response.
    3. Clean queries.
    4. If LLM fails, use fallback.
    """

    if not evidence:
        return []

    prompt = create_planner_prompt(
        question,
        evidence
    )

    print(
        "\nSending evidence to query planner..."
    )

    try:

        response = ask_llm(
            prompt,
            temperature=0.0
        )

        print(
            "\nQuery planner raw response:"
        )

        print(response)

        queries = extract_json_array(
            response
        )

        queries = clean_queries(
            queries,
            question
        )

        if queries:

            print(
                "\nParsed follow-up queries:"
            )

            for query in queries:
                print(
                    f"  -> {query}"
                )

            return queries

    except Exception as error:

        print(
            "\nQuery planner error:"
        )

        print(error)

    # ---------------------------------------------
    # Fallback
    # ---------------------------------------------

    print(
        "\nLLM planner returned no usable queries."
    )

    print(
        "Using deterministic entity fallback..."
    )

    fallback_queries = deterministic_fallback(
        question,
        evidence
    )

    if fallback_queries:

        print(
            "\nFallback follow-up queries:"
        )

        for query in fallback_queries:
            print(
                f"  -> {query}"
            )

    else:

        print(
            "\nFallback could not find new entities."
        )

    return fallback_queries


if __name__ == "__main__":

    print("\n")
    print("=" * 60)
    print(
        "             QUERY PLANNER TEST"
    )
    print("=" * 60)

    question = (
        "What connection exists between "
        "Corvus Hollowmere and Hesper Wrenfield?"
    )

    test_evidence = [
        {
            "filename":
                "corvus_hollowmere_the_pale.md",

            "chunk_id":
                "TEST_001",

            "text":
                """
                Corvus Hollowmere the Pale is the mentor
                of Hesper Wrenfield. Corvus is also associated
                with the Silent Choir.
                """
        }
    ]

    print(
        "\nTest question:"
    )

    print(
        question
    )

    queries = plan_follow_up_queries(
        question,
        test_evidence
    )

    print("\n")
    print("=" * 60)
    print(
        "             FOLLOW-UP QUERIES"
    )
    print("=" * 60)

    if queries:

        for query in queries:
            print(
                f"- {query}"
            )

    else:

        print(
            "No follow-up queries generated."
        )

    print("\n")
    print("=" * 60)