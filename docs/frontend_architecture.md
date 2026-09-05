# KRYPTX Frontend Documentation (Track 1B)

## Overview
This document outlines the architecture, design choices, and API integration for the **KRYPTX Intelligent Document Assistant** built for SLIIT Codefest 2026 (Track 1B — Connecting Facts Across Thousands of Pages).

## Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: TypeScript

## Components
1. **`Header`**: Displays the KRYPTX brand, live/demo connection status indicator, and a new chat button.
2. **`ChatMessageBubble`**: Renders user queries and assistant responses with an expandable multi-hop reasoning trace and clickable citation badges.
3. **`EvidenceDrawer`**: Slide-over panel that opens when a citation badge is clicked, displaying raw document excerpts, chunk IDs, and folder categories.
4. **`ThinkingIndicator`**: Step-by-step animation demonstrating query deconstruction, vector space search, cross-referencing, and synthesis.
5. **`Sidebar`**: On-demand slide-over drawer containing preset benchmark queries from the evaluation dataset.
6. **`api/ask/route.ts`**: Reverse proxy forwarding frontend requests to FastAPI (`http://127.0.0.1:8000/api/chat`) to prevent CORS issues.
