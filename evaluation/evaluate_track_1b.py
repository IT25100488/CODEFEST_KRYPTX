import json
from pathlib import Path

from src.rag.pipeline import run_rag_pipeline


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

QUESTIONS_FILE = (
    PROJECT_ROOT
    / "data"
    / "Ashen_Era_Archive"
    / "Ashen_Era_Archive"
    / "sample_questions.json"
)

RESULTS_DIR = (
    PROJECT_ROOT
    / "src"
    / "evaluation"
    / "results"
)

RESULTS_FILE = RESULTS_DIR / "track_1b_results.json"


# ---------------------------------------------------------
# LOAD QUESTIONS
# ---------------------------------------------------------

def load_track_1b_questions():

    print("Loading official sample questions...")

    with open(
        QUESTIONS_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    questions = [
        item
        for item in data
        if item.get("track", "").upper().startswith("1B")
    ]

    print(
        f"Found {len(questions)} Track 1B questions."
    )

    return questions


# ---------------------------------------------------------
# RUN ONE QUESTION
# ---------------------------------------------------------

def evaluate_question(question_data, index, total):

    question_id = question_data.get(
        "id",
        f"question_{index}"
    )

    question = question_data.get(
        "question",
        ""
    )

    print("\n")
    print("=" * 70)
    print(
        f"QUESTION {index}/{total}"
    )
    print("=" * 70)

    print("ID:", question_id)

    print("\nQuestion:")
    print(question)

    print("\nRunning RAG pipeline...")

    try:

        result = run_rag_pipeline(
            question
        )

        answer = result.get(
            "answer",
            ""
        )

        evidence = result.get(
            "evidence",
            []
        )

        print("\nRAG pipeline completed.")

        print(
            "Answer length:",
            len(answer)
        )

        print(
            "Evidence returned:",
            len(evidence)
        )

        return {
            "id": question_id,
            "question": question,
            "answer": answer,
            "evidence": evidence,
            "status": "success"
        }

    except Exception as error:

        print("\nERROR while processing question:")
        print(error)

        return {
            "id": question_id,
            "question": question,
            "answer": "",
            "evidence": [],
            "status": "error",
            "error": str(error)
        }


# ---------------------------------------------------------
# SAVE RESULTS
# ---------------------------------------------------------

def save_results(results):

    RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        RESULTS_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            results,
            file,
            indent=2,
            ensure_ascii=False
        )

    print("\n")
    print("=" * 70)
    print("RESULTS SAVED")
    print("=" * 70)

    print(
        RESULTS_FILE
    )


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

def print_summary(results):

    total = len(results)

    successful = sum(
        1
        for result in results
        if result.get("status") == "success"
    )

    failed = total - successful

    total_evidence = sum(
        len(result.get("evidence", []))
        for result in results
    )

    print("\n")
    print("=" * 70)
    print("TRACK 1B EVALUATION SUMMARY")
    print("=" * 70)

    print(
        f"Questions tested : {total}"
    )

    print(
        f"Successful       : {successful}"
    )

    print(
        f"Failed           : {failed}"
    )

    print(
        f"Total evidence   : {total_evidence}"
    )

    if total > 0:

        print(
            f"Pipeline success : "
            f"{successful / total * 100:.1f}%"
        )

    print("\nQuestion status:")

    for result in results:

        status = result.get(
            "status",
            "unknown"
        )

        print(
            f"  {result['id']}: {status}"
        )


# ---------------------------------------------------------
# MAIN EVALUATION
# ---------------------------------------------------------

def main():

    questions = load_track_1b_questions()

    if not questions:

        print(
            "No Track 1B questions found."
        )

        return

    results = []

    total = len(questions)

    for index, question_data in enumerate(
        questions,
        start=1
    ):

        result = evaluate_question(
            question_data,
            index,
            total
        )

        results.append(
            result
        )

    save_results(
        results
    )

    print_summary(
        results
    )


# ---------------------------------------------------------
# ENTRY POINT
# ---------------------------------------------------------

if __name__ == "__main__":

    main()