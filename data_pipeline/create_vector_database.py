from pathlib import Path
import json
import os
import time

import chromadb
import voyageai
from dotenv import load_dotenv


# ==================================================
# PATHS
# ==================================================

INPUT_PATH = Path(
    "data/processed/chunks.json"
)

VECTOR_DB_PATH = Path(
    "data/vector_db"
)


# ==================================================
# SETTINGS
# ==================================================

COLLECTION_NAME = "ashen_era_archive"

EMBEDDING_MODEL = "voyage-3"

BATCH_SIZE = 64


# ==================================================
# LOAD ENVIRONMENT VARIABLES
# ==================================================

load_dotenv()

API_KEY = os.getenv("VOYAGE_API_KEY")


# ==================================================
# CHECK API KEY
# ==================================================

if not API_KEY:

    raise ValueError(
        "VOYAGE_API_KEY not found. "
        "Make sure it is inside your .env file."
    )


# ==================================================
# CREATE VOYAGE CLIENT
# ==================================================

client = voyageai.Client(
    api_key=API_KEY
)


# ==================================================
# MAIN FUNCTION
# ==================================================

def main():

    print("\n==============================================")
    print("       ASHEN ERA VECTOR DATABASE")
    print("==============================================")

    # ------------------------------------------------
    # Check chunks file
    # ------------------------------------------------

    if not INPUT_PATH.exists():

        print("\nERROR: chunks.json was not found.")

        print(
            "Expected:",
            INPUT_PATH
        )

        return

    # ------------------------------------------------
    # Load chunks
    # ------------------------------------------------

    print("\nLoading chunks...")

    with open(
        INPUT_PATH,
        "r",
        encoding="utf-8"
    ) as file:

        chunks = json.load(file)

    print(
        "Chunks loaded:",
        len(chunks)
    )

    # ------------------------------------------------
    # Create vector database directory
    # ------------------------------------------------

    VECTOR_DB_PATH.mkdir(
        parents=True,
        exist_ok=True
    )

    # ------------------------------------------------
    # Create ChromaDB client
    # ------------------------------------------------

    print("\nCreating ChromaDB...")

    chroma_client = chromadb.PersistentClient(
        path=str(VECTOR_DB_PATH)
    )

    # ------------------------------------------------
    # Create collection
    # ------------------------------------------------

    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={
            "description":
                "Ashen Era Archive vector database"
        }
    )

    print(
        "Collection:",
        COLLECTION_NAME
    )

    # ------------------------------------------------
    # Process chunks in batches
    # ------------------------------------------------

    total = len(chunks)

    for start in range(
        0,
        total,
        BATCH_SIZE
    ):

        end = min(
            start + BATCH_SIZE,
            total
        )

        batch = chunks[start:end]

        print(
            f"\nEmbedding chunks "
            f"{start + 1}-{end} "
            f"of {total}"
        )

        texts = [
            chunk["text"]
            for chunk in batch
        ]

        # ------------------------------------------------
        # Generate embeddings
        # ------------------------------------------------

        try:

            result = client.embed(
                texts,
                model=EMBEDDING_MODEL,
                input_type="document"
            )

            embeddings = result.embeddings

        except Exception as error:

            print(
                "\nEmbedding error:",
                error
            )

            print(
                "Waiting 5 seconds before retry..."
            )

            time.sleep(5)

            try:

                result = client.embed(
                    texts,
                    model=EMBEDDING_MODEL,
                    input_type="document"
                )

                embeddings = result.embeddings

            except Exception as retry_error:

                print(
                    "\nRetry failed:",
                    retry_error
                )

                return

        # ------------------------------------------------
        # Prepare ChromaDB data
        # ------------------------------------------------

        ids = [
            chunk["chunk_id"]
            for chunk in batch
        ]

        documents = [
            chunk["text"]
            for chunk in batch
        ]

        metadatas = []

        for chunk in batch:

            metadata = {
                "document_id":
                    str(chunk["document_id"]),

                "filename":
                    str(chunk["filename"]),

                "file_type":
                    str(chunk["file_type"]),

                "source_folder":
                    str(chunk["source_folder"]),

                "relative_path":
                    str(chunk["relative_path"]),

                "chunk_index":
                    int(chunk["chunk_index"])
            }

            metadatas.append(metadata)

        # ------------------------------------------------
        # Store in ChromaDB
        # ------------------------------------------------

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

        print(
            f"Stored {end} / {total} chunks"
        )

    # ------------------------------------------------
    # Final information
    # ------------------------------------------------

    print("\n==============================================")
    print("       VECTOR DATABASE COMPLETED")
    print("==============================================")

    print(
        "Total chunks:",
        len(chunks)
    )

    print(
        "Database location:",
        VECTOR_DB_PATH
    )

    print(
        "Collection:",
        COLLECTION_NAME
    )

    print(
        "Stored records:",
        collection.count()
    )

    print("==============================================\n")


# ==================================================
# RUN
# ==================================================

if __name__ == "__main__":
    main()