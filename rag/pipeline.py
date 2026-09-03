from src.retrieval.agentic_multi_hop import (
    agentic_multi_hop_retrieve
)

from src.retrieval.evidence_ranker import (
    rank_evidence
)

from src.rag.answer_generator import (
    generate_answer,
    print_answer
)


MAX_FINAL_EVIDENCE = 8


def run_rag_pipeline(question):
    """
    Complete Ashen Era RAG pipeline.

    Question
        ↓
    Agentic multi-hop retrieval
        ↓
    Evidence ranking
        ↓
    Answer generation
    """

    print("\n")
    print("=" * 70)
    print(
        "       ASHEN ERA INTELLIGENT DOCUMENT ASSISTANT"
    )
    print("=" * 70)

    print("\nQuestion:")
    print(question)

    # --------------------------------------------------
    # STEP 1
    # --------------------------------------------------

    print("\n")
    print("=" * 70)
    print(
        "STEP 1 - MULTI-HOP RETRIEVAL"
    )
    print("=" * 70)

    all_evidence = agentic_multi_hop_retrieve(
        question
    )

    print("\n")
    print(
        "Total retrieved evidence:",
        len(all_evidence)
    )

    if not all_evidence:

        return {
            "answer": (
                "I could not find relevant evidence "
                "in the Ashen Era Archive."
            ),
            "evidence": []
        }

    # --------------------------------------------------
    # STEP 2
    # --------------------------------------------------

    print("\n")
    print("=" * 70)
    print(
        "STEP 2 - EVIDENCE RANKING"
    )
    print("=" * 70)

    ranked_evidence = rank_evidence(
        question,
        all_evidence,
        max_evidence=MAX_FINAL_EVIDENCE
    )

    print("\n")
    print(
        "Final evidence selected:",
        len(ranked_evidence)
    )

    # --------------------------------------------------
    # STEP 3
    # --------------------------------------------------

    print("\n")
    print("=" * 70)
    print(
        "STEP 3 - ANSWER GENERATION"
    )
    print("=" * 70)

    result = generate_answer(
        question,
        ranked_evidence
    )

    return result


def main():

    question = input(
        "\nAsk the Ashen Era Archive: "
    )

    result = run_rag_pipeline(
        question
    )

    print_answer(
        result
    )


if __name__ == "__main__":

    main()