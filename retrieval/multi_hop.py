import sys
from pathlib import Path


# ---------------------------------------------------------
# Add project root to Python path
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ---------------------------------------------------------
# Import our retriever
# ---------------------------------------------------------

from src.data_pipeline.retriever import retrieve


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

MAX_HOPS = 3
RESULTS_PER_HOP = 5


# ---------------------------------------------------------
# Remove duplicate chunks
# ---------------------------------------------------------

def remove_duplicate_results(results):

    unique_results = []
    seen_chunk_ids = set()

    for result in results:

        chunk_id = result.get("chunk_id")

        if chunk_id in seen_chunk_ids:
            continue

        seen_chunk_ids.add(chunk_id)
        unique_results.append(result)

    return unique_results


# ---------------------------------------------------------
# Create follow-up queries
# ---------------------------------------------------------

def create_follow_up_queries(question, results):

    queries = []

    combined_text = " ".join(
        result.get("text", "")
        for result in results
    )

    # Known entities in the Ashen Era corpus.
    #
    # This is our prototype version.
    # Later we will replace this with an LLM-based
    # entity/query planner.

    entities = [
        "Corvus Hollowmere",
        "Hesper Wrenfield",
        "The Silent Choir",
        "Palewell Abbey",
        "The Sceptre of Final Winter",
        "Hollowreach",
        "Cindermere Hold",
    ]

    for entity in entities:

        if entity.lower() in combined_text.lower():

            if entity.lower() not in question.lower():

                queries.append(entity)

    return queries[:2]


# ---------------------------------------------------------
# Multi-hop retrieval
# ---------------------------------------------------------

def multi_hop_retrieve(question):

    all_evidence = []

    current_queries = [question]

    searched_queries = set()

    for hop in range(1, MAX_HOPS + 1):

        print(
            f"\n{'=' * 16} HOP {hop} {'=' * 16}"
        )

        hop_results = []

        for query in current_queries:

            normalized_query = query.lower().strip()

            if normalized_query in searched_queries:
                continue

            searched_queries.add(normalized_query)

            print(
                f"\nSearching: {query}"
            )

            results = retrieve(
                query,
                top_k=RESULTS_PER_HOP
            )

            print(
                f"Found {len(results)} relevant chunks."
            )

            hop_results.extend(results)

        if not hop_results:

            print(
                "\nNo results found."
            )

            break

        # Add current hop results
        all_evidence.extend(hop_results)

        # Remove duplicates
        all_evidence = remove_duplicate_results(
            all_evidence
        )

        # Create queries for next hop
        next_queries = create_follow_up_queries(
            question,
            hop_results
        )

        # Remove queries that were already searched
        next_queries = [
            query
            for query in next_queries
            if query.lower().strip()
            not in searched_queries
        ]

        if not next_queries:

            print(
                "\nNo new information to search for."
            )

            break

        current_queries = next_queries

    return remove_duplicate_results(
        all_evidence
    )


# ---------------------------------------------------------
# Print final evidence
# ---------------------------------------------------------

def print_final_evidence(results):

    print("\n")
    print("=" * 50)
    print("          FINAL COMBINED EVIDENCE")
    print("=" * 50)

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
    print("=" * 50)

    print(
        "Total unique evidence chunks:",
        len(results)
    )


# ---------------------------------------------------------
# Main
# ---------------------------------------------------------

def main():

    print("\n")
    print("=" * 50)
    print("       ASHEN ERA MULTI-HOP RETRIEVAL")
    print("=" * 50)

    question = input(
        "\nEnter your question: "
    )

    print(
        "\nStarting multi-hop retrieval..."
    )

    results = multi_hop_retrieve(
        question
    )

    print_final_evidence(
        results
    )


if __name__ == "__main__":
    main()