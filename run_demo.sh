#!/usr/bin/env bash
set -e

echo "========================================================"
echo "         FINSTUDENT AI - 1-CLICK LAUNCH SCRIPT"
echo "   AI-Based Personal Finance Tracker for Students (IDP)"
echo "========================================================"
echo ""

# 1. Initialize and Seed Database
echo "[1/3] Checking database and seeding demo data..."
python3 backend/scripts/seed_demo_data.py

# 2. Launch FastAPI Backend in background
echo "[2/3] Launching FastAPI Backend on http://127.0.0.1:8000..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# 3. Launch Vite Frontend
echo "[3/3] Launching Vite React Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo "FinStudent AI is now running!"
echo "Frontend: http://localhost:5173"
echo "Backend API Docs: http://127.0.0.1:8000/docs"
echo "Demo Credentials: alex@finstudent.ai / password123"
echo "========================================================"
echo "Press [Ctrl+C] to stop all servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
