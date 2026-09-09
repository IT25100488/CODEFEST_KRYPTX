@echo off
start cmd /k "call .venv\Scripts\activate && uvicorn api.main:app --reload"
start cmd /k "cd frontend && npm run dev"

