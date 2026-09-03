from pathlib import Path
import json

from pypdf import PdfReader
from docx import Document


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_PATH = Path(
    "data/Ashen_Era_Archive/Ashen_Era_Archive"
)

OUTPUT_PATH = Path(
    "data/processed/extracted_documents.json"
)

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".md",
    ".txt"
}


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_pdf_text(file_path):
    """
    Extract text from a PDF file.
    """

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


# ============================================================
# DOCX TEXT EXTRACTION
# ============================================================

def extract_docx_text(file_path):
    """
    Extract text from a DOCX file.
    """

    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:

        if paragraph.text.strip():
            text += paragraph.text + "\n"

    return text


# ============================================================
# MARKDOWN TEXT EXTRACTION
# ============================================================

def extract_markdown_text(file_path):
    """
    Extract text from a Markdown file.
    """

    with open(file_path, "r", encoding="utf-8") as file:

        text = file.read()

    return text


# ============================================================
# TXT TEXT EXTRACTION
# ============================================================

def extract_txt_text(file_path):
    """
    Extract text from a TXT file.
    """

    with open(file_path, "r", encoding="utf-8") as file:

        text = file.read()

    return text


# ============================================================
# SELECT THE CORRECT EXTRACTOR
# ============================================================

def extract_text(file_path):
    """
    Select the correct extraction method based
    on the file extension.
    """

    extension = file_path.suffix.lower()

    if extension == ".pdf":

        return extract_pdf_text(file_path)

    elif extension == ".docx":

        return extract_docx_text(file_path)

    elif extension == ".md":

        return extract_markdown_text(file_path)

    elif extension == ".txt":

        return extract_txt_text(file_path)

    else:

        return ""


# ============================================================
# DOCUMENT DISCOVERY
# ============================================================

def find_documents():
    """
    Find all supported documents inside the dataset.
    """

    document_files = []

    for file_path in DATASET_PATH.rglob("*"):

        if (
            file_path.is_file()
            and file_path.suffix.lower() in SUPPORTED_EXTENSIONS
        ):

            document_files.append(file_path)

    return document_files


# ============================================================
# MAIN PIPELINE
# ============================================================

def main():

    print("\n==============================================")
    print("       ASHEN ERA DOCUMENT EXTRACTION")
    print("==============================================")

    print("\nDataset:", DATASET_PATH)

    if not DATASET_PATH.exists():

        print("ERROR: Dataset path does not exist.")

        return

    # Find all supported documents

    document_files = find_documents()

    print(
        "\nSupported documents found:",
        len(document_files)
    )

    # Create output directory

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    documents = []

    # Process every document

    for index, file_path in enumerate(
        document_files,
        start=1
    ):

        print(
            f"\n[{index}/{len(document_files)}] "
            f"Processing: {file_path.name}"
        )

        try:

            text = extract_text(file_path)

            relative_path = file_path.relative_to(
                DATASET_PATH
            )

            source_folder = (
                relative_path.parts[0]
                if len(relative_path.parts) > 1
                else "root"
            )

            document = {

                "document_id":
                    f"DOC_{index:06d}",

                "filename":
                    file_path.name,

                "file_type":
                    file_path.suffix.lower(),

                "source_folder":
                    source_folder,

                "relative_path":
                    str(relative_path),

                "character_count":
                    len(text),

                "text":
                    text
            }

            documents.append(document)

        except Exception as error:

            print(
                "ERROR processing file:",
                error
            )


    # Save extracted documents

    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            documents,
            file,
            ensure_ascii=False,
            indent=2
        )


    # Final summary

    print("\n==============================================")
    print("       EXTRACTION COMPLETED")
    print("==============================================")

    print(
        "Documents processed:",
        len(documents)
    )

    print(
        "Output file:",
        OUTPUT_PATH
    )


if __name__ == "__main__":

    main()