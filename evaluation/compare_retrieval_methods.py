import json
from pathlib import Path


BASELINE_PATH = Path(
    "evaluation/baseline/baseline_summary.json"
)

AGENTIC_PATH = Path(
    "evaluation/agentic/agentic_summary.json"
)


def load_json(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def main():
    baseline = load_json(BASELINE_PATH)
    agentic = load_json(AGENTIC_PATH)

    baseline_rate = baseline[
        "complete_chain_retrieval_rate"
    ]

    agentic_rate = agentic[
        "complete_chain_retrieval_rate"
    ]

    improvement = round(
        agentic_rate - baseline_rate,
        2
    )

    comparison = {
        "track": "1B",
        "baseline_method": "single_query_top_5",
        "baseline_complete_chain_rate": baseline_rate,
        "agentic_method": "agentic_multi_hop",
        "agentic_complete_chain_rate": agentic_rate,
        "absolute_improvement_percentage_points": improvement
    }

    print("\n==============================================")
    print("     RETRIEVAL METHOD COMPARISON")
    print("==============================================")

    print(
        f"\nBaseline complete-chain rate: "
        f"{baseline_rate:.2f}%"
    )

    print(
        f"Agentic complete-chain rate: "
        f"{agentic_rate:.2f}%"
    )

    print(
        f"Absolute improvement: "
        f"+{improvement:.2f} percentage points"
    )

    output_path = Path(
        "evaluation/retrieval_comparison.json"
    )

    with open(
        output_path,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            comparison,
            file,
            indent=2
        )

    print(
        f"\nComparison saved to: "
        f"{output_path}"
    )

    print("\n==============================================")


if __name__ == "__main__":
    main()