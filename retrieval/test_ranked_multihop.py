import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from retrieval.multi_hop import multi_hop_retrieve
    from retrieval.evidence_ranker import (
        rank_evidence,
        print_ranked_evidence
    )
except ImportError:
    from multi_hop import multi_hop_retrieve
    from evidence_ranker import (
        rank_evidence,
        print_ranked_evidence
    )


def main():

    question = input(
        "\nEnter your question: "
    )

    print(
        "\nRunning multi-hop retrieval..."
    )

    all_results = multi_hop_retrieve(
        question
    )

    print(
        "\nTotal retrieved evidence:",
        len(all_results)
    )

    print(
        "\nRanking the evidence..."
    )

    ranked_results = rank_evidence(
        question,
        all_results,
        max_evidence=8
    )

    print(
        "\nFinal evidence selected:",
        len(ranked_results)
    )

    print_ranked_evidence(
        ranked_results
    )


if __name__ == "__main__":
    main()