import re
from collections import defaultdict


# ============================================================
# CONFIGURATION
# ============================================================

MAX_EVIDENCE = 8

# Maximum number of chunks from the exact same document
MAX_CHUNKS_PER_DOCUMENT = 2


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text):
    """
    Convert text into a simple normalized form.

    Example:

        "Ravena Stormwell is a member of The Silent Choir."

    becomes:

        "ravena stormwell is a member of the silent choir"
    """

    if not text:
        return ""

    text = text.lower()

    # Remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ============================================================
# QUESTION TERMS
# ============================================================

def get_query_terms(question):
    """
    Extract useful words from the question.

    Common words are ignored.
    """

    stop_words = {
        "what",
        "who",
        "where",
        "when",
        "why",
        "how",
        "is",
        "are",
        "was",
        "were",
        "the",
        "a",
        "an",
        "and",
        "or",
        "of",
        "to",
        "in",
        "on",
        "for",
        "with",
        "between",
        "does",
        "did",
        "do",
        "their",
        "they",
        "them",
        "this",
        "that",
        "which",
        "connection",
        "exists",
        "own",
        "ultimately",
        "ultimately",
        "won",
        "wins",
        "victor",
        "victors",
    }

    words = normalize_text(question).split()

    useful_terms = [
        word
        for word in words
        if word not in stop_words and len(word) > 2
    ]

    return set(useful_terms)


# ============================================================
# KEYWORD SCORE
# ============================================================

def calculate_keyword_score(question, text):
    """
    Calculate how many important question words
    appear in the evidence.
    """

    query_terms = get_query_terms(question)

    if not query_terms:
        return 0

    normalized_text = normalize_text(text)

    text_words = set(
        normalized_text.split()
    )

    matched_terms = query_terms.intersection(
        text_words
    )

    return len(matched_terms)


# ============================================================
# ENTITY EXTRACTION
# ============================================================

def extract_entities(text):
    """
    Extract likely named entities.

    We mainly look for multi-word capitalized names.

    Examples:

        Ravena Stormwell
        The Silent Choir
        War of Drowned Light
        Iron-Ring Cartel
    """

    if not text:
        return []

    # Preserve original text because capitalization matters here.
    entities = re.findall(
        r"\b(?:The\s+)?[A-Z][A-Za-z-]+"
        r"(?:\s+(?:of|the|and|[A-Z][A-Za-z-]+))+",
        text
    )

    cleaned = []

    for entity in entities:

        entity = entity.strip()

        if len(entity) < 4:
            continue

        if entity not in cleaned:
            cleaned.append(entity)

    return cleaned


def get_question_entities(question):
    """
    Extract named entities from the original question.
    """

    return extract_entities(question)


# ============================================================
# ENTITY SCORE
# ============================================================

def calculate_entity_score(question, text):
    """
    Give extra importance to named entities from
    the question appearing in the evidence.
    """

    question_entities = get_question_entities(
        question
    )

    normalized_text = normalize_text(text)

    score = 0

    for entity in question_entities:

        normalized_entity = normalize_text(
            entity
        )

        if normalized_entity in normalized_text:
            score += 5

    return score


# ============================================================
# SEMANTIC DISTANCE SCORE
# ============================================================

def calculate_distance_score(distance):
    """
    Convert ChromaDB distance into a higher-is-better score.
    """

    if distance is None:
        return 0

    try:
        distance = float(distance)
    except (TypeError, ValueError):
        return 0

    distance = max(
        0,
        distance
    )

    return 1 / (1 + distance)


# ============================================================
# RELATIONSHIP DETECTION
# ============================================================

RELATIONSHIP_TERMS = {
    "member",
    "members",
    "member of",
    "affiliation",
    "affiliated",
    "faction",
    "organization",
    "victor",
    "victors",
    "victory",
    "won",
    "win",
    "winner",
    "defeated",
    "belligerent",
    "allegiance",
    "belongs",
    "belonged",
    "served",
    "serves",
    "connected",
    "connection",
    "ruled",
    "rules",
    "dominion",
    "lair",
    "associated",
    "association",
    "included",
    "included as",
}


def calculate_relationship_score(text):
    """
    Detect relationship language.

    This is especially important for Track 1B because
    many questions require:

        Entity A
            ↓
        relationship
            ↓
        Entity B
            ↓
        relationship
            ↓
        answer
    """

    normalized_text = normalize_text(
        text
    )

    score = 0

    for term in RELATIONSHIP_TERMS:

        normalized_term = normalize_text(
            term
        )

        if normalized_term in normalized_text:
            score += 1

    return score


# ============================================================
# INTERMEDIATE ENTITY DETECTION
# ============================================================

def extract_intermediate_entities(question, results):
    """
    Try to identify entities that can act as intermediate
    nodes in a multi-hop relationship chain.

    Example:

        Question:
            Which war did Ravena Stormwell's own faction win?

        Evidence:
            Ravena Stormwell is a member of The Silent Choir.

        Intermediate entity:
            The Silent Choir
    """

    question_entities = {
        normalize_text(entity)
        for entity in get_question_entities(question)
    }

    candidate_entities = defaultdict(int)

    for result in results:

        text = result.get(
            "text",
            ""
        )

        entities = extract_entities(
            text
        )

        for entity in entities:

            normalized_entity = normalize_text(
                entity
            )

            if not normalized_entity:
                continue

            # Do not treat the original question entity
            # as an intermediate entity.
            if normalized_entity in question_entities:
                continue

            candidate_entities[
                normalized_entity
            ] += 1

    # Entities appearing in multiple retrieved chunks
    # are more likely to be important.
    candidates = sorted(
        candidate_entities.items(),
        key=lambda item: item[1],
        reverse=True
    )

    return [
        entity
        for entity, count in candidates
        if count >= 1
    ]


# ============================================================
# CHAIN SCORE
# ============================================================

def calculate_chain_score(
    question,
    text,
    intermediate_entities
):
    """
    Reward evidence that helps complete a multi-hop chain.

    Example:

        Ravena Stormwell
                ↓
        The Silent Choir
                ↓
        War of Drowned Light

    A chunk containing:

        "Ravena Stormwell is a member of The Silent Choir"

    should receive a strong score.

    A chunk containing:

        "The Silent Choir was victor of The War of Drowned Light"

    should also receive a strong score.
    """

    normalized_text = normalize_text(
        text
    )

    question_entities = get_question_entities(
        question
    )

    score = 0

    # --------------------------------------------------------
    # Question entity + intermediate entity
    # --------------------------------------------------------

    for question_entity in question_entities:

        normalized_question_entity = normalize_text(
            question_entity
        )

        if normalized_question_entity not in normalized_text:
            continue

        for intermediate in intermediate_entities:

            if intermediate in normalized_text:

                # Very strong signal:
                #
                # Question entity
                # +
                # Intermediate entity
                #
                score += 12

    # --------------------------------------------------------
    # Intermediate entity + relationship
    # --------------------------------------------------------

    for intermediate in intermediate_entities:

        if intermediate in normalized_text:

            relationship_hits = 0

            for term in RELATIONSHIP_TERMS:

                normalized_term = normalize_text(
                    term
                )

                if normalized_term in normalized_text:
                    relationship_hits += 1

            score += min(
                relationship_hits * 3,
                12
            )

    return score


# ============================================================
# DOCUMENT DIVERSITY
# ============================================================

def get_document_key(result):
    """
    Get a stable document identifier.

    We prefer document_id, then filename.
    """

    document_id = result.get(
        "document_id"
    )

    if document_id:
        return document_id

    return result.get(
        "filename",
        "unknown"
    )


# ============================================================
# FINAL SCORE
# ============================================================

def calculate_final_score(
    question,
    result,
    intermediate_entities=None
):
    """
    Combine multiple signals.

    Signals:

    1. Semantic similarity
    2. Keyword overlap
    3. Question entity overlap
    4. Relationship language
    5. Multi-hop chain relevance
    """

    if intermediate_entities is None:
        intermediate_entities = []

    text = result.get(
        "text",
        ""
    )

    distance = result.get(
        "distance",
        None
    )

    # --------------------------------------------------------
    # Semantic similarity
    # --------------------------------------------------------

    semantic_score = calculate_distance_score(
        distance
    )

    # --------------------------------------------------------
    # Keyword overlap
    # --------------------------------------------------------

    keyword_score = calculate_keyword_score(
        question,
        text
    )

    # --------------------------------------------------------
    # Entity overlap
    # --------------------------------------------------------

    entity_score = calculate_entity_score(
        question,
        text
    )

    # --------------------------------------------------------
    # Relationship score
    # --------------------------------------------------------

    relationship_score = calculate_relationship_score(
        text
    )

    # --------------------------------------------------------
    # Chain score
    # --------------------------------------------------------

    chain_score = calculate_chain_score(
        question,
        text,
        intermediate_entities
    )

    # --------------------------------------------------------
    # Weighted final score
    # --------------------------------------------------------

    final_score = (
        semantic_score * 5
        + keyword_score * 2
        + entity_score
        + relationship_score * 0.75
        + chain_score
    )

    return final_score


# ============================================================
# CHAIN-AWARE EVIDENCE SELECTION
# ============================================================

def rank_evidence(
    question,
    results,
    max_evidence=MAX_EVIDENCE
):
    """
    Rank and select evidence for the final LLM.

    Unlike the old ranker, this version does not simply
    take the highest scoring chunks.

    It tries to preserve evidence forming a relationship chain.

    Example:

        Ravena Stormwell
                ↓
        The Silent Choir
                ↓
        War of Drowned Light

    We want evidence for both links.
    """

    if not results:
        return []

    # ========================================================
    # STEP 1
    # Remove exact duplicate chunks
    # ========================================================

    unique_results = []

    seen = set()

    for result in results:

        chunk_id = result.get(
            "chunk_id"
        )

        text = result.get(
            "text",
            ""
        )

        unique_key = (
            chunk_id,
            text[:200]
        )

        if unique_key in seen:
            continue

        seen.add(
            unique_key
        )

        unique_results.append(
            result
        )

    # ========================================================
    # STEP 2
    # Find possible intermediate entities
    # ========================================================

    intermediate_entities = extract_intermediate_entities(
        question,
        unique_results
    )

    # Keep only the most common candidate entities.
    intermediate_entities = intermediate_entities[:10]

    # ========================================================
    # STEP 3
    # Score every result
    # ========================================================

    scored_results = []

    for result in unique_results:

        score = calculate_final_score(
            question,
            result,
            intermediate_entities
        )

        result_copy = result.copy()

        result_copy[
            "evidence_score"
        ] = round(
            score,
            4
        )

        scored_results.append(
            result_copy
        )

    # ========================================================
    # STEP 4
    # Sort by score
    # ========================================================

    scored_results.sort(
        key=lambda item: item[
            "evidence_score"
        ],
        reverse=True
    )

    # ========================================================
    # STEP 5
    # Select evidence
    # ========================================================

    document_counts = defaultdict(
        int
    )

    selected_results = []

    # --------------------------------------------------------
    # First pass:
    #
    # Select strong chain evidence.
    # --------------------------------------------------------

    chain_candidates = [
        result
        for result in scored_results
        if calculate_chain_score(
            question,
            result.get(
                "text",
                ""
            ),
            intermediate_entities
        ) > 0
    ]

    for result in chain_candidates:

        document_key = get_document_key(
            result
        )

        if document_counts[
            document_key
        ] >= MAX_CHUNKS_PER_DOCUMENT:
            continue

        selected_results.append(
            result
        )

        document_counts[
            document_key
        ] += 1

        if len(selected_results) >= max_evidence:
            break

    # --------------------------------------------------------
    # Second pass:
    #
    # Fill remaining slots with highest-scoring evidence.
    # --------------------------------------------------------

    if len(selected_results) < max_evidence:

        selected_ids = {
            result.get(
                "chunk_id"
            )
            for result in selected_results
        }

        for result in scored_results:

            chunk_id = result.get(
                "chunk_id"
            )

            if chunk_id in selected_ids:
                continue

            document_key = get_document_key(
                result
            )

            if document_counts[
                document_key
            ] >= MAX_CHUNKS_PER_DOCUMENT:
                continue

            selected_results.append(
                result
            )

            document_counts[
                document_key
            ] += 1

            if len(selected_results) >= max_evidence:
                break

    # ========================================================
    # STEP 6
    # Final ordering
    # ========================================================

    selected_results.sort(
        key=lambda item: item[
            "evidence_score"
        ],
        reverse=True
    )

    return selected_results


# ============================================================
# PRINT RESULTS
# ============================================================

def print_ranked_evidence(results):

    print("\n")
    print("=" * 70)
    print("                 RANKED EVIDENCE")
    print("=" * 70)

    if not results:

        print("\nNo evidence found.")

        return

    for index, result in enumerate(
        results,
        start=1
    ):

        print(
            f"\n---------- EVIDENCE {index} ----------"
        )

        print(
            "Score:",
            result.get(
                "evidence_score"
            )
        )

        print(
            "Document:",
            result.get(
                "filename"
            )
        )

        print(
            "Source folder:",
            result.get(
                "source_folder"
            )
        )

        print(
            "Chunk:",
            result.get(
                "chunk_index"
            )
        )

        print(
            "Distance:",
            result.get(
                "distance"
            )
        )

        print("\nText:")

        print(
            result.get(
                "text",
                ""
            )[:1500]
        )

    print(
        "\n" + "=" * 70
    )


# ============================================================
# MODULE TEST
# ============================================================

if __name__ == "__main__":

    print(
        "Relationship-aware Evidence Ranker "
        "module loaded successfully."
    )