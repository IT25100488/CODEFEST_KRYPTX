import os
import chromadb
import voyageai
from dotenv import load_dotenv


# ==================================================
# SETTINGS
# ==================================================

VECTOR_DB_PATH = "data/vector_db"
COLLECTION_NAME = "ashen_era_archive"

EMBEDDING_MODEL = "voyage-3"

TOP_K = 5


# ==================================================
# LOAD API KEY
# ==================================================

load_dotenv()

api_key = os.getenv("VOYAGE_API_KEY")

if not api_key:
    raise ValueError(
        "VOYAGE_API_KEY not found in .env"
    )


# ==================================================
# CREATE VOYAGE CLIENT
# ==================================================

voyage_client = voyageai.Client(
    api_key=api_key
)


# ==================================================
# CONNECT TO CHROMADB
# ==================================================

print("\nConnecting to ChromaDB...")

chroma_client = chromadb.PersistentClient(
    path=VECTOR_DB_PATH
)

collection = chroma_client.get_collection(
    name=COLLECTION_NAME
)

print(
    "Database connected successfully!"
)

print(
    "Records in database:",
    collection.count()
)


# ==================================================
# GET QUESTION
# ==================================================

question = input(
    "\nEnter your question: "
)


# ==================================================
# CREATE QUESTION EMBEDDING
# ==================================================

print(
    "\nCreating question embedding..."
)

result = voyage_client.embed(
    [question],
    model=EMBEDDING_MODEL,
    input_type="query"
)

question_embedding = result.embeddings[0]


# ==================================================
# SEARCH CHROMADB
# ==================================================

print(
    "Searching ChromaDB..."
)

results = collection.query(
    query_embeddings=[question_embedding],
    n_results=TOP_K
)


# ==================================================
# DISPLAY RESULTS
# ==================================================

print("\n==============================================")
print("             RETRIEVAL RESULTS")
print("==============================================")


documents = results["documents"][0]
metadatas = results["metadatas"][0]
distances = results["distances"][0]
ids = results["ids"][0]


for index in range(len(documents)):

    print(
        f"\n---------- RESULT {index + 1} ----------"
    )

    print(
        "Chunk ID:",
        ids[index]
    )

    print(
        "Document:",
        metadatas[index]["filename"]
    )

    print(
        "Source folder:",
        metadatas[index]["source_folder"]
    )

    print(
        "Chunk index:",
        metadatas[index]["chunk_index"]
    )

    print(
        "Distance:",
        distances[index]
    )

    print("\nText:")

    print(documents[index])


print("\n==============================================")