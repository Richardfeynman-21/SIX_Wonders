#!/usr/bin/env bash
# =========================================================================================
# AI-Powered Underground Mine Rescue Rover — Surface Control Station Launcher
# Launches FastAPI Telemetry Backend, Java 21 Gateway Coordinator, and Next.js Surface Station

# =========================================================================================

set -e
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "======================================================================"
echo " ⛏️  SIH 2026: AI-POWERED UNDERGROUND MINE SAFETY & RESCUE ROVER"
echo " Launching Surface Command Station Services..."
echo "======================================================================"

# Start FastAPI Backend in background if not already running
if ! lsof -i:8000 >/dev/null 2>&1; then
    if [ "${USE_REAL_HARDWARE:-0}" = "1" ]; then
        echo "[1/3] Starting Production Hardware Telemetry Backend on http://0.0.0.0:8000..."
        uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
    else
        echo "[1/3] Starting RAKSHAK-Mine Telemetry & Control Simulator on http://0.0.0.0:8000..."
        python3 dummy_backend.py &
    fi
    BACKEND_PID=$!
    sleep 2
else
    echo "[1/3] Backend Telemetry Service is already active on port 8000."
fi

# Compile & Start Java 21 Surface Station Gateway in background
echo "[2/3] Starting Java 21 Gateway Coordinator on http://127.0.0.1:8088..."
javac SurfaceStationGateway.java
java SurfaceStationGateway &
GATEWAY_PID=$!
sleep 1

# Start Next.js Surface Station Dashboard on port 3000
echo "[3/3] Starting Next.js Mission Command Center on http://localhost:3000..."
echo "Press Ctrl+C to terminate all surface station services."

trap "echo 'Shutting down services...'; kill $BACKEND_PID $GATEWAY_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM

cd frontend && npm run dev

