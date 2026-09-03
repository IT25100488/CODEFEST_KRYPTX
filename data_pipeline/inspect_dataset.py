from pathlib import Path
from collections import Counter


# Location of the competition dataset
DATASET_PATH = Path("data/Ashen_Era_Archive")


# Check whether the dataset exists
if not DATASET_PATH.exists():
    print("Dataset folder was not found!")
    print("Expected location:")
    print(DATASET_PATH)
    exit()


print("=" * 50)
print("       ASHEN ERA DATASET INSPECTION")
print("=" * 50)


# Find every file inside the dataset
all_files = [
    file for file in DATASET_PATH.rglob("*")
    if file.is_file()
]


print(f"\nTotal files found: {len(all_files)}")


# --------------------------------------------------
# Count file types
# --------------------------------------------------

extension_counts = Counter(
    file.suffix.lower() if file.suffix else "[no extension]"
    for file in all_files
)


print("\n---------- FILE TYPES ----------")

for extension, count in sorted(extension_counts.items()):
    print(f"{extension:<15} : {count}")


# --------------------------------------------------
# Count files by folder
# --------------------------------------------------

folder_counts = Counter()

for file in all_files:

    relative_path = file.relative_to(DATASET_PATH)

    # Because our extracted ZIP contains another
    # Ashen_Era_Archive folder, use the second path part.
    if len(relative_path.parts) > 1:

        folder = relative_path.parts[1]

        folder_counts[folder] += 1

    else:

        folder_counts["root"] += 1


print("\n---------- FOLDERS ----------")

for folder, count in sorted(folder_counts.items()):
    print(f"{folder:<15} : {count}")


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
# TEST MARKDOWN
# ============================================================

markdown_path = Path(
    "data/Ashen_Era_Archive/Ashen_Era_Archive/wiki/"
    "corvus_hollowmere_the_pale.md"
)

if markdown_path.exists():

    markdown_text = extract_markdown_text(markdown_path)

    print("\n========== MARKDOWN TEST ==========")
    print("File:", markdown_path.name)
    print("Characters extracted:", len(markdown_text))

    print("\nFirst 1000 characters:\n")
    print(markdown_text[:1000])

else:

    print("Markdown file not found!")
    print("Expected location:")
    print(markdown_path)

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
# TEST TXT
# ============================================================

txt_path = Path(
    "data/Ashen_Era_Archive/Ashen_Era_Archive/"
    "README.txt"
)

if txt_path.exists():

    txt_text = extract_txt_text(txt_path)

    print("\n========== TXT TEST ==========")
    print("File:", txt_path.name)
    print("Characters extracted:", len(txt_text))

    print("\nFirst 1000 characters:\n")
    print(txt_text[:1000])

else:

    print("TXT file not found!")
    print("Expected location:")
    print(txt_path)

    # ============================================================
# FIND ALL SUPPORTED DOCUMENTS
# ============================================================

dataset_path = Path(
    "data/Ashen_Era_Archive/Ashen_Era_Archive"
)

supported_extensions = {
    ".pdf",
    ".docx",
    ".md",
    ".txt"
}

document_files = []

for file_path in dataset_path.rglob("*"):

    if file_path.is_file() and file_path.suffix.lower() in supported_extensions:

        document_files.append(file_path)


print("\n========== DOCUMENT DISCOVERY ==========")

print("Supported documents found:", len(document_files))

for file_path in document_files[:20]:

    print(file_path)


# ============================================================
# FIND ALL SUPPORTED DOCUMENTS
# ============================================================

dataset_path = Path(
    "data/Ashen_Era_Archive/Ashen_Era_Archive"
)

supported_extensions = {
    ".pdf",
    ".docx",
    ".md",
    ".txt"
}

document_files = []

for file_path in dataset_path.rglob("*"):

    if file_path.is_file() and file_path.suffix.lower() in supported_extensions:

        document_files.append(file_path)


print("\n========== DOCUMENT DISCOVERY ==========")

print("Supported documents found:", len(document_files))

print("\nFirst 20 documents found:\n")

for file_path in document_files[:20]:

    print(file_path)
print("DISCOVERY CODE REACHED!")

print("\n========== SIMPLE DISCOVERY TEST ==========")

dataset_path = Path(
    "data/Ashen_Era_Archive/Ashen_Era_Archive"
)

print("Dataset exists:", dataset_path.exists())
print("Dataset path:", dataset_path)

print("\n========== FINDING DOCUMENTS ==========")

document_files = []

for file_path in dataset_path.rglob("*"):

    if file_path.is_file():

        document_files.append(file_path)

print("Total files found:", len(document_files))

print("\nFirst 10 files:")

for file_path in document_files[:10]:

    print(file_path)