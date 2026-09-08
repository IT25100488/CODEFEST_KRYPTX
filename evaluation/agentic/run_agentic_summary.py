import json
from pathlib import Path
from collections import Counter

RESULTS_DIR = Path("evaluation/agentic/results")


def load_results():
    results = []

    for file_path in sorted(RESULTS_DIR.glob("*.json")):
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            results.append(data)

    return results


def main():
    results = load_results()

    total = len(results)

    success_count = sum(
        1
        for result in results
        if result.get("complete_chain_found") is True
    )

    partial_count = sum(
        1
        for result in results
        if result.get("result") == "PARTIAL"
    )

    failure_categories = Counter(
        result.get("failure_category", "UNKNOWN")
        for result in results
    )

    if total > 0:
        complete_chain_rate = (
            success_count / total
        ) * 100
    else:
        complete_chain_rate = 0

    print("\n==============================================")
    print("        TRACK 1B AGENTIC RETRIEVAL")
    print("==============================================")

    print(f"\nTotal questions tested: {total}")
    print(f"Complete-chain successes: {success_count}")
    print(f"Partial retrievals: {partial_count}")
    print(
        f"Complete-chain retrieval rate: "
        f"{complete_chain_rate:.2f}%"
    )

    print("\nFailure categories:")

    for category, count in failure_categories.items():
        print(f"  {category}: {count}")

    print("\nPer-question results:")

    for result in results:
        qid = result.get("qid", "UNKNOWN")
        status = result.get("result", "UNKNOWN")
        category = result.get(
            "failure_category",
            "UNKNOWN"
        )

        print(
            f"  {qid}: "
            f"{status} ({category})"
        )

    summary = {
        "track": "1B",
        "retrieval_method": "agentic_multi_hop",
        "total_questions": total,
        "complete_chain_successes": success_count,
        "partial_retrievals": partial_count,
        "complete_chain_retrieval_rate": round(
            complete_chain_rate,
            2
        ),
        "failure_categories": dict(
            failure_categories
        )
    }

    output_path = Path(
        "evaluation/agentic/agentic_summary.json"
    )

    with open(
        output_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            summary,
            file,
            indent=2
        )

    print(
        f"\nSummary saved to: "
        f"{output_path}"
    )

    print("\n==============================================")


if __name__ == "__main__":
    main()