import asyncio
import time
import json
import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    ESP32Telemetry, PiTelemetry, RoverControlCommand, IncidentAlert, RoverCombinedStatus
)
from .database import init_db, log_telemetry, log_alert, get_recent_telemetry, get_recent_alerts
from .dgms_standards import evaluate_telemetry_against_dgms, classify_survivor_triage, DGMSPreset
from .pdf_exporter import generate_incident_briefing_pdf

app = FastAPI(
    title="AI-Powered Mine Safety & Rescue Rover — Mission Control Backend",
    description="FastAPI telemetry ingestion, real-time safety evaluation, DGMS compliance, and WebSocket dispatch.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory State Cache ---
current_esp32_state: Dict[str, Any] = {
    "rover_id": "MINER-ROVER-01",
    "battery_voltage": 11.85,
    "battery_percent": 74.0,
    "obstacle_distance_cm": 125.0,
    "obstacle_detected": False,
    "motor_state": "STOPPED",
    "motor_speed": 200,
    "buzzer_active": False,
    "searchlight_active": False,
    "wifi_rssi": -52,
    "last_seen": time.time()
}

current_pi_state: Dict[str, Any] = {
    "temperature_c": 27.8,
    "humidity_pct": 68.5,
    "pressure_hpa": 1011.2,
    "mq135_ppm": 185.0,
    "mq7_ppm": 12.0,
    "audio_ambient_db": 44.0,
    "acoustic_tapping_detected": False,
    "thermal_hotspots_count": 0,
    "thermal_max_temp_c": 26.4,
    "ai_detected_survivors": 0,
    "ai_detections": [],
    "camera_online": True,
    "last_seen": time.time()
}

pending_rover_command: Optional[Dict[str, Any]] = None
active_dgms_preset = DGMSPreset.STANDARD
active_websocket_clients: List[WebSocket] = []
simulation_enabled = False

@app.on_event("startup")
async def startup_event():
    init_db()
    # Start background loop to check timeouts, log data, and run simulator if active
    asyncio.create_task(background_system_loop())

async def background_system_loop():
    global simulation_enabled
    while True:
        now = time.time()
        # If simulator is on, synthesize realistic mine telemetry
        if simulation_enabled:
            synthesize_simulated_telemetry()

        combined = compile_combined_status()
        log_telemetry(combined)

        # Broadcast via WebSockets
        if active_websocket_clients:
            msg = json.dumps(combined)
            disconnected = []
            for ws in active_websocket_clients:
                try:
                    await ws.send_text(msg)
                except Exception:
                    disconnected.append(ws)
            for ws in disconnected:
                if ws in active_websocket_clients:
                    active_websocket_clients.remove(ws)

        await asyncio.sleep(1.0)

def synthesize_simulated_telemetry():
    # Subtle realistic random walks
    current_esp32_state["battery_voltage"] = max(9.6, current_esp32_state["battery_voltage"] - 0.002)
    # Map to percent
    bv = current_esp32_state["battery_voltage"]
    current_esp32_state["battery_percent"] = max(0.0, min(100.0, (bv - 9.9) / (12.6 - 9.9) * 100.0))
    current_esp32_state["obstacle_distance_cm"] = round(random.uniform(40.0, 180.0), 1)
    current_esp32_state["last_seen"] = time.time()

    current_pi_state["temperature_c"] = round(28.0 + random.uniform(-0.5, 0.8), 1)
    current_pi_state["humidity_pct"] = round(68.0 + random.uniform(-1.0, 1.5), 1)
    current_pi_state["pressure_hpa"] = round(1011.0 + random.uniform(-0.4, 0.4), 1)
    current_pi_state["mq135_ppm"] = round(180.0 + random.uniform(-10.0, 15.0), 1)
    current_pi_state["mq7_ppm"] = round(max(0.0, current_pi_state["mq7_ppm"] + random.uniform(-0.5, 0.5)), 1)
    current_pi_state["audio_ambient_db"] = round(42.0 + random.uniform(-2.0, 4.0), 1)
    current_pi_state["last_seen"] = time.time()

def compile_combined_status() -> Dict[str, Any]:
    now = time.time()
    esp32_alive = (now - current_esp32_state.get("last_seen", 0)) < 4.0
    pi_alive = (now - current_pi_state.get("last_seen", 0)) < 5.0

    combined = {
        "rover_id": current_esp32_state.get("rover_id", "MINER-ROVER-01"),
        "timestamp": datetime.now().isoformat(),
        "esp32_online": esp32_alive,
        "pi_online": pi_alive,
        "battery_voltage": round(current_esp32_state.get("battery_voltage", 0.0), 2),
        "battery_percent": round(current_esp32_state.get("battery_percent", 0.0), 1),
        "obstacle_distance_cm": current_esp32_state.get("obstacle_distance_cm", 100.0),
        "obstacle_detected": current_esp32_state.get("obstacle_detected", False),
        "motor_state": current_esp32_state.get("motor_state", "STOPPED"),
        "motor_speed": current_esp32_state.get("motor_speed", 200),
        "buzzer_active": current_esp32_state.get("buzzer_active", False),
        "searchlight_active": current_esp32_state.get("searchlight_active", False),
        "temperature_c": current_pi_state.get("temperature_c", 25.0),
        "humidity_pct": current_pi_state.get("humidity_pct", 55.0),
        "pressure_hpa": current_pi_state.get("pressure_hpa", 1013.25),
        "mq135_ppm": current_pi_state.get("mq135_ppm", 100.0),
        "mq7_ppm": current_pi_state.get("mq7_ppm", 5.0),
        "audio_ambient_db": current_pi_state.get("audio_ambient_db", 40.0),
        "acoustic_tapping_detected": current_pi_state.get("acoustic_tapping_detected", False),
        "thermal_hotspots_count": current_pi_state.get("thermal_hotspots_count", 0),
        "thermal_max_temp_c": current_pi_state.get("thermal_max_temp_c", 25.0),
        "ai_detected_survivors": current_pi_state.get("ai_detected_survivors", 0),
    }

    # Battery Health Classification
    bv = combined["battery_voltage"]
    if bv <= 9.9 and bv > 1.0:
        combined["battery_status"] = "CRITICAL"
    elif bv <= 10.5 and bv > 1.0:
        combined["battery_status"] = "LOW"
    else:
        combined["battery_status"] = "NORMAL"

    # DGMS Compliance Check
    eval_result = evaluate_telemetry_against_dgms(combined, active_dgms_preset)
    combined["dgms_compliance_status"] = eval_result["compliance_status"]
    combined["active_alerts"] = eval_result["alerts"]

    # AI Survivor Triage Classification
    combined["survivor_triage_priority"] = classify_survivor_triage(
        combined["thermal_max_temp_c"],
        combined["acoustic_tapping_detected"],
        combined["ai_detected_survivors"],
        combined["mq7_ppm"]
    )

    # Overarching System Status
    if eval_result["compliance_status"] == "NON_COMPLIANT":
        combined["system_status"] = "EMERGENCY"
    elif eval_result["compliance_status"] == "WARNING" or combined["battery_status"] == "LOW":
        combined["system_status"] = "CAUTION"
    else:
        combined["system_status"] = "OPERATIONAL"

    return combined

@app.get("/")
def root():
    return {
        "project": "AI-Powered Underground Mine Safety & Rescue Rover",
        "scope": "Internal Hackathon Tier 3 Prototype",
        "status": "ONLINE",
        "dgms_preset": active_dgms_preset,
        "simulation_mode": simulation_enabled
    }

@app.post("/api/telemetry/esp32")
def ingest_esp32_telemetry(payload: ESP32Telemetry):
    global current_esp32_state
    current_esp32_state.update(payload.dict())
    current_esp32_state["last_seen"] = time.time()
    return {"status": "ACK", "received_at": datetime.now().isoformat()}

@app.post("/api/telemetry/pi")
def ingest_pi_telemetry(payload: PiTelemetry):
    global current_pi_state
    current_pi_state.update(payload.dict())
    current_pi_state["last_seen"] = time.time()
    return {"status": "ACK", "received_at": datetime.now().isoformat()}

@app.get("/api/status")
def get_rover_status():
    return compile_combined_status()

@app.get("/api/telemetry/history")
def get_telemetry_history(limit: int = Query(60, ge=10, le=500)):
    return get_recent_telemetry(limit)

@app.get("/api/alerts")
def get_alerts_history(limit: int = Query(20, ge=5, le=100)):
    return get_recent_alerts(limit)

@app.post("/api/rover/control")
def issue_rover_command(cmd: RoverControlCommand):
    global pending_rover_command, current_esp32_state
    pending_rover_command = cmd.dict()
    # Also update state optimistically
    if cmd.command in ["FORWARD", "BACKWARD", "LEFT", "RIGHT", "STOP"]:
        current_esp32_state["motor_state"] = cmd.command
        current_esp32_state["motor_speed"] = cmd.speed
    elif cmd.command == "BUZZER_ON":
        current_esp32_state["buzzer_active"] = True
    elif cmd.command == "BUZZER_OFF":
        current_esp32_state["buzzer_active"] = False
    elif cmd.command == "LIGHT_ON":
        current_esp32_state["searchlight_active"] = True
    elif cmd.command == "LIGHT_OFF":
        current_esp32_state["searchlight_active"] = False

    return {"status": "DISPATCHED", "command": cmd.command}

@app.get("/api/rover/command")
def poll_rover_command():
    global pending_rover_command
    cmd = pending_rover_command
    pending_rover_command = None
    return {"command": cmd} if cmd else {"command": None}

@app.post("/api/dgms/preset")
def set_dgms_preset(preset: str = Query(..., description="Preset name")):
    global active_dgms_preset
    if preset in [DGMSPreset.STANDARD, DGMSPreset.FIRE_SMOLDERING, DGMSPreset.FLOOD_INUNDATION]:
        active_dgms_preset = preset
        return {"status": "UPDATED", "preset": active_dgms_preset}
    raise HTTPException(status_code=400, detail="Invalid DGMS Preset")

@app.post("/api/sim/toggle")
def toggle_simulation(enable: bool = Query(...)):
    global simulation_enabled
    simulation_enabled = enable
    return {"simulation_mode": simulation_enabled}

@app.post("/api/export/pdf")
def export_pdf_report():
    status = compile_combined_status()
    history = get_recent_telemetry(limit=30)
    alerts = get_recent_alerts(limit=15)
    pdf_bytes = generate_incident_briefing_pdf(status, history, alerts)
    filename = f"DGMS_MineRescue_Briefing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websocket_clients.append(websocket)
    try:
        while True:
            # Keep socket alive and allow client to send commands
            data = await websocket.receive_text()
            try:
                cmd_json = json.loads(data)
                if "command" in cmd_json:
                    issue_rover_command(RoverControlCommand(
                        command=cmd_json["command"],
                        speed=cmd_json.get("speed", 200)
                    ))
            except Exception:
                pass
    except WebSocketDisconnect:
        if websocket in active_websocket_clients:
            active_websocket_clients.remove(websocket)
