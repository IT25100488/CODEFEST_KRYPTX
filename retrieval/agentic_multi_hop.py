from src.data_pipeline.retriever import retrieve
from src.llm.query_planner import plan_follow_up_queries


MAX_HOPS = 3
RESULTS_PER_QUERY = 5
MAX_TOTAL_EVIDENCE = 20


def remove_duplicate_results(results):
    """
    Remove duplicate chunks.
    """

    unique_results = []
    seen_chunk_ids = set()

    for result in results:

        chunk_id = result.get("chunk_id")

        if not chunk_id:
            continue

        if chunk_id in seen_chunk_ids:
            continue

        seen_chunk_ids.add(chunk_id)

        unique_results.append(result)

    return unique_results


def search_queries(
    queries,
    searched_queries
):
    """
    Run vector retrieval for every query.
    """

    results = []

    for query in queries:

        normalized_query = (
            query.lower()
            .strip()
        )

        if not normalized_query:
            continue

        if normalized_query in searched_queries:
            continue

        searched_queries.add(
            normalized_query
        )

        print("\nSearching:")
        print(query)

        try:

            query_results = retrieve(
                query,
                top_k=RESULTS_PER_QUERY
            )

            print(
                f"Retrieved {len(query_results)} chunks."
            )

            results.extend(
                query_results
            )

        except Exception as error:

            print(
                "\nRetrieval error:",
                error
            )

    return results


def agentic_multi_hop_retrieve(question):
    """
    Perform agentic multi-hop retrieval.

    Hop 1:
        Search original question.

    Hop 2+:
        Ask the LLM query planner what additional
        searches should be performed.
    """

    all_evidence = []

    searched_queries = set()

    current_queries = [
        question
    ]

    for hop in range(
        1,
        MAX_HOPS + 1
    ):

        print("\n")
        print("=" * 60)
        print(
            f"                    HOP {hop}"
        )
        print("=" * 60)

        hop_results = search_queries(
            current_queries,
            searched_queries
        )

        if not hop_results:

            print(
                "\nNo new evidence found."
            )

            break

        all_evidence.extend(
            hop_results
        )

        all_evidence = remove_duplicate_results(
            all_evidence
        )

        # Prevent unlimited evidence growth.
        all_evidence = all_evidence[
            :MAX_TOTAL_EVIDENCE
        ]

        print(
            f"\nTotal unique evidence so far: "
            f"{len(all_evidence)}"
        )

        # Stop after the final allowed hop.
        if hop >= MAX_HOPS:

            print(
                "\nMaximum number of hops reached."
            )

            break

        print(
            "\nAsking LLM query planner "
            "for follow-up searches..."
        )

        next_queries = plan_follow_up_queries(
            question,
            all_evidence
        )

        # Remove queries already searched.
        next_queries = [
            query
            for query in next_queries
            if query.lower().strip()
            not in searched_queries
        ]

        if not next_queries:

            print(
                "\nQuery planner found "
                "no additional searches."
            )

            break

        print(
            "\nFollow-up searches selected:"
        )

        for query in next_queries:

            print(
                f"  -> {query}"
            )

        current_queries = next_queries

    return remove_duplicate_results(
        all_evidence
    )


def print_evidence(results):

    print("\n")
    print("=" * 65)
    print(
        "              FINAL MULTI-HOP EVIDENCE"
    )
    print("=" * 65)

    for index, result in enumerate(
        results,
        start=1
    ):

        print(
            f"\n---------- EVIDENCE {index} ----------"
        )

        print(
            "Document:",
            result.get("filename")
        )

        print(
            "Source folder:",
            result.get("source_folder")
        )

        print(
            "Chunk ID:",
            result.get("chunk_id")
        )

        print(
            "Distance:",
            result.get("distance")
        )

        print("\nText:")

        print(
            result.get("text", "")
        )

    print("\n")
    print("=" * 65)

    print(
        "Total unique evidence chunks:",
        len(results)
    )


if __name__ == "__main__":

    print("\n")
    print("=" * 65)
    print(
        "           AGENTIC MULTI-HOP RETRIEVAL"
    )
    print("=" * 65)

    question = input(
        "\nEnter your question: "
    )

    results = agentic_multi_hop_retrieve(
        question
    )

    print_evidence(
        results
    )