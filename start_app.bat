@echo off
start cmd /k "call .venv\Scripts\activate && uvicorn src.api:app --reload"
start cmd /k "cd frontend && npm run dev"

