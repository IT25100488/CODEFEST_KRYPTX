from pathlib import Path
import json
import re


# --------------------------------------------------
# PATHS
# --------------------------------------------------

INPUT_PATH = Path(
    "data/processed/extracted_documents.json"
)

OUTPUT_PATH = Path(
    "data/processed/chunks.json"
)


# --------------------------------------------------
# CHUNK SETTINGS
# --------------------------------------------------

CHUNK_SIZE = 2500
CHUNK_OVERLAP = 300


# --------------------------------------------------
# CLEAN TEXT
# --------------------------------------------------

def clean_text(text):
    """
    Clean unnecessary whitespace while keeping
    the actual document content.
    """

    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


# --------------------------------------------------
# SPLIT TEXT INTO CHUNKS
# --------------------------------------------------

def split_text(text):
    """
    Split text into overlapping chunks.

    CHUNK_SIZE = 2500 characters
    CHUNK_OVERLAP = 300 characters
    """

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = start + CHUNK_SIZE

        chunk = text[start:end]

        # Try to end at a natural boundary
        if end < text_length:

            last_newline = chunk.rfind("\n")

            last_sentence = chunk.rfind(". ")

            best_position = max(
                last_newline,
                last_sentence
            )

            if best_position > CHUNK_SIZE * 0.6:
                end = start + best_position + 1
                chunk = text[start:end]

        chunk = chunk.strip()

        if chunk:
            chunks.append(chunk)

        # Move forward while keeping overlap
        next_start = end - CHUNK_OVERLAP

        if next_start <= start:
            next_start = start + CHUNK_SIZE

        start = next_start

    return chunks


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    print("\n==============================================")
    print("          ASHEN ERA DOCUMENT CHUNKING")
    print("==============================================")

    # Check input file
    if not INPUT_PATH.exists():

        print("\nERROR:")
        print("Input file not found:")
        print(INPUT_PATH)

        return

    # Load extracted documents
    print("\nLoading extracted documents...")

    with open(
        INPUT_PATH,
        "r",
        encoding="utf-8"
    ) as file:

        documents = json.load(file)

    print("Documents loaded:", len(documents))

    # Create output directory
    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    all_chunks = []

    total_chunks = 0

    # --------------------------------------------------
    # PROCESS EACH DOCUMENT
    # --------------------------------------------------

    for document_number, document in enumerate(
        documents,
        start=1
    ):

        text = document.get("text", "")

        text = clean_text(text)

        if not text:
            print(
                f"\n[{document_number}/{len(documents)}] "
                f"Skipped empty document: "
                f"{document.get('filename')}"
            )

            continue

        chunks = split_text(text)

        print(
            f"\n[{document_number}/{len(documents)}] "
            f"{document.get('filename')}"
        )

        print(
            "Chunks created:",
            len(chunks)
        )

        # --------------------------------------------------
        # CREATE CHUNK RECORDS
        # --------------------------------------------------

        for chunk_index, chunk_text in enumerate(
            chunks,
            start=1
        ):

            chunk_id = (
                f"{document['document_id']}"
                f"_CHUNK_{chunk_index:04d}"
            )

            chunk = {

                "chunk_id": chunk_id,

                "document_id":
                    document.get("document_id"),

                "filename":
                    document.get("filename"),

                "file_type":
                    document.get("file_type"),

                "source_folder":
                    document.get("source_folder"),

                "relative_path":
                    document.get("relative_path"),

                "chunk_index":
                    chunk_index,

                "character_count":
                    len(chunk_text),

                "text":
                    chunk_text
            }

            all_chunks.append(chunk)

            total_chunks += 1

    # --------------------------------------------------
    # SAVE CHUNKS
    # --------------------------------------------------

    print("\nSaving chunks...")

    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            all_chunks,
            file,
            ensure_ascii=False,
            indent=2
        )

    # --------------------------------------------------
    # FINAL SUMMARY
    # --------------------------------------------------

    print("\n==============================================")
    print("          CHUNKING COMPLETED")
    print("==============================================")

    print(
        "Documents processed:",
        len(documents)
    )

    print(
        "Total chunks created:",
        total_chunks
    )

    print(
        "Output file:",
        OUTPUT_PATH
    )

    print("==============================================\n")


# --------------------------------------------------
# RUN PROGRAM
# --------------------------------------------------

if __name__ == "__main__":
    main()