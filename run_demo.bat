@echo off
echo ========================================================
echo         FINSTUDENT AI - 1-CLICK LAUNCH SCRIPT
echo   AI-Based Personal Finance Tracker for Students (IDP)
echo ========================================================
echo.

:: 1. Initialize and Seed Database if needed
echo [1/3] Checking database and seeding demo data...
python backend\scripts\seed_demo_data.py
if %ERRORLEVEL% NEQ 0 (
    echo Error seeding database. Ensure Python is installed and requirements are installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Launching FastAPI Backend on http://127.0.0.1:8000...
start "FinStudent AI Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Launching Vite React Frontend on http://localhost:5173...
cd frontend
start "FinStudent AI Frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo FinStudent AI is now running!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Demo Credentials: alex@finstudent.ai / password123
echo ========================================================
echo.
pause
