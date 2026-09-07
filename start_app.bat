@echo off
start cmd /k "uvicorn src.api:app --reload"
start cmd /k "cd frontend && npm run dev"
