# System Architecture

## Overview

KRYPTX is an Intelligent Document Assistant designed for SLIIT Codefest 2026 Sub-track 1B: Connecting Facts Across Thousands of Pages.

The system uses a Retrieval-Augmented Generation architecture with multi-hop retrieval. Instead of performing only one vector search, the system can use previously retrieved evidence to generate follow-up queries and continue searching for missing relationships.

## Architecture Flow

```text
Ashen Era Documents
        ↓
Document Extraction
        ↓
Chunking
        ↓
Voyage AI Embeddings
        ↓
ChromaDB Vector Database
        ↓
User Question
        ↓
Initial Vector Retrieval
        ↓
LLM Query Planner
        ↓
Follow-up Multi-Hop Retrieval
        ↓
Evidence Aggregation and Deduplication
        ↓
Evidence Ranking
        ↓
Grounded Answer Generator
        ↓
Answer + Reasoning + Source Metadata
        ↓
FastAPI Backend
        ↓
Frontend