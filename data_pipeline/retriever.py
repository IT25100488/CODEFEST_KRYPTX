import os
import chromadb
import voyageai
from dotenv import load_dotenv


# ============================================================
# CONFIGURATION
# ============================================================

VECTOR_DB_PATH = "data/vector_db"

COLLECTION_NAME = "ashen_era_archive"

EMBEDDING_MODEL = "voyage-3"

DEFAULT_TOP_K = 5

# We search for more candidates first.
# Then we select the best useful results.
CANDIDATE_K = 15

# Avoid returning too many chunks from exactly the same document.
MAX_CHUNKS_PER_DOCUMENT = 2


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

api_key = os.getenv("VOYAGE_API_KEY")

if not api_key:
    raise ValueError(
        "VOYAGE_API_KEY was not found in the .env file."
    )


# ============================================================
# CREATE VOYAGE CLIENT
# ============================================================

voyage_client = voyageai.Client(
    api_key=api_key
)


# ============================================================
# CONNECT TO CHROMADB
# ============================================================

chroma_client = chromadb.PersistentClient(
    path=VECTOR_DB_PATH
)

collection = chroma_client.get_collection(
    name=COLLECTION_NAME
)


# ============================================================
# RETRIEVAL FUNCTION
# ============================================================

def retrieve(
    question,
    top_k=DEFAULT_TOP_K,
    candidate_k=CANDIDATE_K,
    max_chunks_per_document=MAX_CHUNKS_PER_DOCUMENT
):
    """
    Search the Ashen Era Archive and return
    the most relevant chunks.

    Parameters:
        question:
            User's question.

        top_k:
            Number of final results to return.

        candidate_k:
            Number of results to initially retrieve.

        max_chunks_per_document:
            Maximum number of chunks allowed
            from the same document.

    Returns:
        List of dictionaries containing
        text and source information.
    """

    # --------------------------------------------------------
    # STEP 1
    # Convert the user's question into an embedding
    # --------------------------------------------------------

    embedding_result = voyage_client.embed(
        [question],
        model=EMBEDDING_MODEL,
        input_type="query"
    )

    question_embedding = embedding_result.embeddings[0]


    # --------------------------------------------------------
    # STEP 2
    # Search ChromaDB
    # --------------------------------------------------------

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=candidate_k
    )


    # --------------------------------------------------------
    # STEP 3
    # Extract returned information
    # --------------------------------------------------------

    documents = results["documents"][0]

    metadatas = results["metadatas"][0]

    distances = results["distances"][0]

    ids = results["ids"][0]


    # --------------------------------------------------------
    # STEP 4
    # Convert results into clean dictionaries
    # --------------------------------------------------------

    candidates = []

    for i in range(len(documents)):

        metadata = metadatas[i]

        candidate = {

            "chunk_id": ids[i],

            "document_id": metadata.get(
                "document_id"
            ),

            "filename": metadata.get(
                "filename"
            ),

            "source_folder": metadata.get(
                "source_folder"
            ),

            "relative_path": metadata.get(
                "relative_path"
            ),

            "chunk_index": metadata.get(
                "chunk_index"
            ),

            "distance": distances[i],

            "text": documents[i]
        }

        candidates.append(candidate)


    # --------------------------------------------------------
    # STEP 5
    # Limit chunks from the same document
    # --------------------------------------------------------

    document_counts = {}

    filtered_results = []


    for candidate in candidates:

        document_id = candidate["document_id"]


        if document_id not in document_counts:

            document_counts[document_id] = 0


        if (
            document_counts[document_id]
            < max_chunks_per_document
        ):

            filtered_results.append(
                candidate
            )

            document_counts[document_id] += 1


        if len(filtered_results) >= top_k:

            break


    return filtered_results


# ============================================================
# DISPLAY RESULTS
# ============================================================

def print_results(results):

    print("\n==============================================")

    print("              RETRIEVAL RESULTS")

    print("==============================================")


    if not results:

        print("No relevant results found.")

        return


    for index, result in enumerate(
        results,
        start=1
    ):

        print(
            f"\n---------- RESULT {index} ----------"
        )

        print(
            "Chunk ID:",
            result["chunk_id"]
        )

        print(
            "Document ID:",
            result["document_id"]
        )

        print(
            "Document:",
            result["filename"]
        )

        print(
            "Source folder:",
            result["source_folder"]
        )

        print(
            "Relative path:",
            result["relative_path"]
        )

        print(
            "Chunk index:",
            result["chunk_index"]
        )

        print(
            "Distance:",
            result["distance"]
        )

        print("\nText:")

        print(result["text"])


    print("\n==============================================")


# ============================================================
# TEST PROGRAM
# ============================================================

def main():

    print("\n==============================================")

    print("          ASHEN ERA RETRIEVER")

    print("==============================================")


    print(
        "\nChromaDB connected successfully!"
    )

    print(
        "Records in database:",
        collection.count()
    )


    question = input(
        "\nEnter your question: "
    )


    print(
        "\nSearching the Ashen Era Archive..."
    )


    results = retrieve(question)


    print_results(results)


# ============================================================
# PROGRAM ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()