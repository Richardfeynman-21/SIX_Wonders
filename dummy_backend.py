#!/usr/bin/env python3
"""
=============================================================================
RAKSHAK-Mine: AI-Powered Underground Mine Safety & Rescue Rover Simulator
-----------------------------------------------------------------------------
Standalone, self-contained dummy Python backend simulator.
Provides real-time 2 Hz telemetry streaming over WebSockets, REST APIs,
DGMS compliance checks, anomaly simulation, two-way comms, and PDF reporting.

Author: Backend Simulator Engineer
Rover ID: RAKSHAK-Mine
Port: 8000
=============================================================================
"""

import sys
import os
from pathlib import Path

# Auto-detect and link local virtual environment if running directly via system python
_script_dir = Path(__file__).resolve().parent
_venv_candidates = [
    _script_dir / ".venv",
    _script_dir.parent / ".venv",
]
for _v in _venv_candidates:
    if _v.is_dir():
        for _sp in _v.glob("lib/python*/site-packages"):
            if str(_sp) not in sys.path:
                sys.path.insert(0, str(_sp))

import asyncio
import io
import json
import math
import random
import time
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from fastapi import (
    Body,
    FastAPI,
    HTTPException,
    Query,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# ---------------------------------------------------------------------------
# ReportLab PDF Generation Helpers (Self-Contained)
# ---------------------------------------------------------------------------
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        HRFlowable,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


# ---------------------------------------------------------------------------
# Global State & Telemetry Parameters
# ---------------------------------------------------------------------------
ROVER_ID = "RAKSHAK-Mine"

# Telemetry state dictionary
telemetry_state: Dict[str, Any] = {
    "rover_id": ROVER_ID,
    "system_status": "OPERATIONAL",
    "esp32_online": True,
    "pi_online": True,
    "battery_voltage": 11.85,
    "battery_percent": 78.0,
    "battery_status": "NORMAL",
    "temperature_c": 22.1,
    "humidity_pct": 68.0,
    "pressure_hpa": 101.2,
    "mq135_ppm": 165.0,
    "mq7_ppm": 25.0,
    "gas_ch4": 0.8,
    "gas_co": 25.0,
    "gas_co2": 420.0,
    "gas_o2": 20.6,
    "audio_ambient_db": 42.0,
    "acoustic_tapping_detected": True,
    "obstacle_distance_cm": 120.0,
    "obstacle_detected": False,
    "motor_state": "STOPPED",
    "motor_speed": 200,
    "buzzer_active": False,
    "searchlight_active": True,
    "thermal_hotspots_count": 1,
    "thermal_max_temp_c": 36.8,
    "ai_detected_survivors": 1,
    "survivor_triage_priority": "HIGH",
    "dgms_compliance_status": "COMPLIANT",
    "active_alerts": [
        {
            "id": 1,
            "time": "14:31",
            "timestamp": datetime.now().isoformat(),
            "alert_type": "SURVIVOR",
            "message": "Possible human voice detected (RAKSHAK-Mine)",
            "severity": "HIGH",
            "value": 1.0,
            "threshold": 1.0,
        },
        {
            "id": 2,
            "time": "14:28",
            "timestamp": datetime.now().isoformat(),
            "alert_type": "GAS_CH4",
            "message": "Methane level above threshold (0.8%)",
            "severity": "MEDIUM",
            "value": 0.8,
            "threshold": 0.5,
        },
    ],
}

# Historical ring buffer for telemetry graphs (max 300 points)
telemetry_history: deque = deque(maxlen=300)

# Active connected WebSockets
active_websockets: Set[WebSocket] = set()

# Anomaly Simulation Mode
anomaly_mode: bool = False

# Active DGMS compliance preset
active_dgms_preset: str = "DGMS Coal Mines Regulations 2017 (Standard)"

# Discharge accumulator
discharge_step: float = 0.00015


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class RoverControlCommand(BaseModel):
    command: str = Field(..., description="FORWARD, BACKWARD, LEFT, RIGHT, STOP, BUZZER_ON, BUZZER_OFF, LIGHT_ON, LIGHT_OFF, E_STOP")
    speed: Optional[int] = Field(200, ge=0, le=255)

class DGMSPresetRequest(BaseModel):
    preset: Optional[str] = None

class SimToggleRequest(BaseModel):
    enable: Optional[bool] = None

class ChatMessageRequest(BaseModel):
    message: str
    recipient: Optional[str] = "RAKSHAK-Mine"


# ---------------------------------------------------------------------------
# Telemetry Generation Logic (2 Hz)
# ---------------------------------------------------------------------------
def update_telemetry_tick():
    """Calculates realistic dynamic values for RAKSHAK-Mine telemetry."""
    global anomaly_mode

    now = datetime.now()
    now_iso = now.isoformat()
    now_time = now.strftime("%H:%M")

    # 1. Realistic Slow Battery Discharge
    bv = telemetry_state["battery_voltage"] - discharge_step
    # Small jitter on voltage
    telemetry_state["battery_voltage"] = max(10.2, round(bv + random.uniform(-0.002, 0.002), 3))
    
    # Calculate battery percent around 78% with slight realistic noise
    pct_raw = 78.0 - ((11.85 - telemetry_state["battery_voltage"]) * 20.0)
    telemetry_state["battery_percent"] = max(5.0, min(100.0, round(pct_raw + random.uniform(-0.08, 0.08), 1)))

    if telemetry_state["battery_percent"] < 20.0:
        telemetry_state["battery_status"] = "CRITICAL"
    elif telemetry_state["battery_percent"] < 35.0:
        telemetry_state["battery_status"] = "LOW"
    else:
        telemetry_state["battery_status"] = "NORMAL"

    # 2. Obstacle Proximity dynamics based on motor movement
    if telemetry_state["motor_state"] == "FORWARD":
        dist = telemetry_state["obstacle_distance_cm"] - random.uniform(1.2, 3.5)
        telemetry_state["obstacle_distance_cm"] = max(15.0, round(dist, 1))
    elif telemetry_state["motor_state"] == "BACKWARD":
        dist = telemetry_state["obstacle_distance_cm"] + random.uniform(1.2, 3.0)
        telemetry_state["obstacle_distance_cm"] = min(250.0, round(dist, 1))
    else:
        telemetry_state["obstacle_distance_cm"] = round(120.0 + random.uniform(-1.5, 1.5), 1)

    telemetry_state["obstacle_detected"] = telemetry_state["obstacle_distance_cm"] < 40.0

    # 3. Normal Baseline vs Anomaly Injection
    if not anomaly_mode:
        # Realistic ambient micro-fluctuations
        telemetry_state["temperature_c"] = round(22.1 + random.uniform(-0.15, 0.15), 1)
        telemetry_state["humidity_pct"] = round(68.0 + random.uniform(-0.35, 0.35), 1)
        telemetry_state["pressure_hpa"] = round(101.2 + random.uniform(-0.04, 0.04), 1)
        telemetry_state["mq135_ppm"] = round(165.0 + random.uniform(-1.5, 1.5), 1)
        telemetry_state["mq7_ppm"] = round(25.0 + random.uniform(-0.3, 0.3), 1)
        telemetry_state["gas_ch4"] = round(0.8 + random.uniform(-0.015, 0.015), 2)
        telemetry_state["gas_co"] = round(25.0 + random.uniform(-0.4, 0.4), 1)
        telemetry_state["gas_co2"] = round(420.0 + random.uniform(-1.5, 1.5), 0)
        telemetry_state["gas_o2"] = round(20.6 + random.uniform(-0.04, 0.04), 1)
        telemetry_state["audio_ambient_db"] = round(42.0 + random.uniform(-1.2, 1.8), 1)
        telemetry_state["thermal_max_temp_c"] = round(36.8 + random.uniform(-0.08, 0.08), 1)
        telemetry_state["acoustic_tapping_detected"] = True
        telemetry_state["ai_detected_survivors"] = 1
        telemetry_state["survivor_triage_priority"] = "HIGH"
        telemetry_state["dgms_compliance_status"] = "COMPLIANT"
        telemetry_state["system_status"] = "OPERATIONAL"

        # Baseline alerts
        telemetry_state["active_alerts"] = [
            {
                "id": 1,
                "time": "14:31",
                "timestamp": now_iso,
                "alert_type": "SURVIVOR",
                "message": "Possible human voice detected (RAKSHAK-Mine)",
                "severity": "HIGH",
                "value": 1.0,
                "threshold": 1.0,
            },
            {
                "id": 2,
                "time": "14:28",
                "timestamp": now_iso,
                "alert_type": "GAS_CH4",
                "message": "Methane level above threshold (0.8%)",
                "severity": "MEDIUM",
                "value": round(telemetry_state["gas_ch4"], 2),
                "threshold": 0.5,
            },
        ]
    else:
        # Anomaly Injection active: Methane spike, temperature elevation, strata hazard
        telemetry_state["temperature_c"] = round(34.2 + random.uniform(-0.4, 0.8), 1)
        telemetry_state["humidity_pct"] = round(82.5 + random.uniform(-0.5, 0.5), 1)
        telemetry_state["pressure_hpa"] = round(98.4 + random.uniform(-0.2, 0.2), 1)
        telemetry_state["mq135_ppm"] = round(380.0 + random.uniform(-10.0, 15.0), 1)
        telemetry_state["mq7_ppm"] = round(74.0 + random.uniform(-2.0, 4.0), 1)
        telemetry_state["gas_ch4"] = round(2.35 + random.uniform(-0.08, 0.12), 2)
        telemetry_state["gas_co"] = round(68.0 + random.uniform(-1.5, 3.0), 1)
        telemetry_state["gas_co2"] = round(1250.0 + random.uniform(-20.0, 30.0), 0)
        telemetry_state["gas_o2"] = round(17.8 + random.uniform(-0.1, 0.1), 1)
        telemetry_state["audio_ambient_db"] = round(64.5 + random.uniform(-3.0, 4.0), 1)
        telemetry_state["thermal_max_temp_c"] = round(41.5 + random.uniform(-0.2, 0.4), 1)
        telemetry_state["acoustic_tapping_detected"] = True
        telemetry_state["ai_detected_survivors"] = 1
        telemetry_state["survivor_triage_priority"] = "HIGH"
        telemetry_state["dgms_compliance_status"] = "NON_COMPLIANT"
        telemetry_state["system_status"] = "EMERGENCY"

        telemetry_state["active_alerts"] = [
            {
                "id": 99,
                "time": now_time,
                "timestamp": now_iso,
                "alert_type": "GAS_CH4_CRITICAL",
                "message": f"CRITICAL: Methane spike ({telemetry_state['gas_ch4']}%) exceeds DGMS explosive lower threshold (1.25%)",
                "severity": "CRITICAL",
                "value": telemetry_state["gas_ch4"],
                "threshold": 1.25,
            },
            {
                "id": 98,
                "time": now_time,
                "timestamp": now_iso,
                "alert_type": "GAS_CO_HIGH",
                "message": f"WARNING: Carbon Monoxide ({telemetry_state['gas_co']} ppm) exceeding permissible exposure limit (50 ppm)",
                "severity": "CRITICAL",
                "value": telemetry_state["gas_co"],
                "threshold": 50.0,
            },
            {
                "id": 1,
                "time": "14:31",
                "timestamp": now_iso,
                "alert_type": "SURVIVOR",
                "message": "Possible human voice detected (RAKSHAK-Mine)",
                "severity": "HIGH",
                "value": 1.0,
                "threshold": 1.0,
            },
        ]

    # Mirror redundant aliases for various frontend chart components
    telemetry_state["ch4_pct"] = telemetry_state["gas_ch4"]
    telemetry_state["co_ppm"] = telemetry_state["gas_co"]
    telemetry_state["co2_ppm"] = telemetry_state["gas_co2"]
    telemetry_state["o2_pct"] = telemetry_state["gas_o2"]
    telemetry_state["pressure_kpa"] = telemetry_state["pressure_hpa"]
    telemetry_state["timestamp"] = now_iso
    telemetry_state["last_update"] = now.strftime("%H:%M:%S")

    # Push to history
    snapshot = dict(telemetry_state)
    telemetry_history.append(snapshot)
    return snapshot


# ---------------------------------------------------------------------------
# Background 2 Hz Async Worker Loop
# ---------------------------------------------------------------------------
async def telemetry_background_worker():
    """Runs at 2 Hz (500ms interval) to generate and broadcast telemetry."""
    print(" [RAKSHAK-Mine] Telemetry Generator active (500ms / 2 Hz loop started).")
    while True:
        try:
            snapshot = update_telemetry_tick()

            # Broadcast to all connected WebSocket clients
            if active_websockets:
                msg_text = json.dumps(snapshot)
                stale_clients = []
                for ws in list(active_websockets):
                    try:
                        await ws.send_text(msg_text)
                    except Exception:
                        stale_clients.append(ws)
                for dead_ws in stale_clients:
                    active_websockets.discard(dead_ws)

        except Exception as e:
            print(f"[RAKSHAK-Mine Error] Generator loop exception: {e}")

        await asyncio.sleep(0.5)


# ---------------------------------------------------------------------------
# PDF Report Generator
# ---------------------------------------------------------------------------
def generate_dgms_pdf_report(status: Dict[str, Any], history: List[Dict[str, Any]], alerts: List[Dict[str, Any]]) -> bytes:
    """Generates a professional DGMS Statutory Incident & Rescue Report PDF."""
    if not HAS_REPORTLAB:
        # Graceful bytecode fallback
        content = (
            f"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            f"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            f"3 0 obj<</Type/Page/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n"
            f"4 0 obj<</Length 120>>stream\nBT /F1 14 Tf 50 750 Td (DGMS Incident Report - RAKSHAK-Mine) Tj ET\nendstream\nendobj\n"
            f"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000190 00000 n \n"
            f"trailer<</Size 5/Root 1 0 R>>\nstartxref\n360\n%%EOF\n"
        )
        return content.encode("latin-1")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=17,
        leading=21,
        textColor=colors.HexColor("#0F172A"),
        alignment=1,
    )
    subtitle_style = ParagraphStyle(
        "DocSub",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        alignment=1,
    )
    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=8,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#334155"),
    )
    bold_style = ParagraphStyle(
        "Bold",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11.5,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0F172A"),
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("MINISTRY OF COAL & MINES • DIRECTORATE GENERAL OF MINES SAFETY", subtitle_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("STATUTORY MINE RESCUE MISSION INCIDENT REPORT", title_style))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph(
        f"Robotic Reconnaissance & Survivor Telemetry • Vehicle: <b>{ROVER_ID}</b> • Generated: {datetime.now().strftime('%d %b %Y, %H:%M:%S IST')}",
        subtitle_style,
    ))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=10))

    # Mission Metadata Table
    comp_status = status.get("dgms_compliance_status", "COMPLIANT")
    status_color = "#16A34A" if comp_status == "COMPLIANT" else ("#D97706" if comp_status == "WARNING" else "#DC2626")

    meta_rows = [
        [
            Paragraph("<b>Rover Identification:</b>", bold_style),
            Paragraph(f"<font color='#1D4ED8'><b>{ROVER_ID}</b></font>", bold_style),
            Paragraph("<b>DGMS Safety Status:</b>", bold_style),
            Paragraph(f"<font color='{status_color}'><b>{comp_status}</b></font>", bold_style),
        ],
        [
            Paragraph("<b>Operational Status:</b>", body_style),
            Paragraph(str(status.get("system_status", "OPERATIONAL")), body_style),
            Paragraph("<b>Survivor Triage Priority:</b>", bold_style),
            Paragraph(f"<font color='#DC2626'><b>{status.get('survivor_triage_priority', 'HIGH')}</b></font>", bold_style),
        ],
        [
            Paragraph("<b>Main Battery Level:</b>", body_style),
            Paragraph(f"{status.get('battery_voltage', 11.85):.2f} V ({status.get('battery_percent', 78.0):.1f}%)", body_style),
            Paragraph("<b>Survivors Detected:</b>", body_style),
            Paragraph(f"<b>{status.get('ai_detected_survivors', 1)} Survivor(s)</b>", bold_style),
        ],
        [
            Paragraph("<b>Acoustic Tapping:</b>", body_style),
            Paragraph("CONFIRMED (Positive Response)", bold_style if status.get("acoustic_tapping_detected") else body_style),
            Paragraph("<b>Thermal Hotspot:</b>", body_style),
            Paragraph(f"{status.get('thermal_max_temp_c', 36.8):.1f}°C (Normal Body Temp)", bold_style),
        ],
    ]
    meta_table = Table(meta_rows, colWidths=[125, 140, 135, 140])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))

    # Atmospheric & Gas Safety Table
    elements.append(Paragraph("1. ATMOSPHERIC & GAS MONITORING (DGMS CMR 2017 STANDARDS)", h2_style))
    gas_rows = [
        [
            Paragraph("<b>Atmospheric Parameter</b>", bold_style),
            Paragraph("<b>Current Reading</b>", bold_style),
            Paragraph("<b>DGMS Threshold</b>", bold_style),
            Paragraph("<b>Assessment Status</b>", bold_style),
        ],
        [
            Paragraph("Methane (CH4)", body_style),
            Paragraph(f"{status.get('gas_ch4', 0.8):.2f}%", bold_style),
            Paragraph("< 0.75% (General) / < 1.25% (Vent Return)", body_style),
            Paragraph("CAUTION (Elevated)" if status.get("gas_ch4", 0.8) >= 0.75 else "NORMAL", bold_style),
        ],
        [
            Paragraph("Carbon Monoxide (CO)", body_style),
            Paragraph(f"{status.get('gas_co', 25.0):.1f} ppm", bold_style),
            Paragraph("< 50.0 ppm (Permissible Ceiling)", body_style),
            Paragraph("WARNING (High)" if status.get("gas_co", 25.0) >= 50.0 else "PERMISSIBLE", bold_style),
        ],
        [
            Paragraph("Carbon Dioxide (CO2)", body_style),
            Paragraph(f"{status.get('gas_co2', 420.0):.0f} ppm", body_style),
            Paragraph("< 5000.0 ppm (8-hr TWA)", body_style),
            Paragraph("SAFE", body_style),
        ],
        [
            Paragraph("Oxygen (O2)", body_style),
            Paragraph(f"{status.get('gas_o2', 20.6):.1f}%", bold_style),
            Paragraph("> 19.5% Minimum Statutory", body_style),
            Paragraph("SAFE", body_style),
        ],
        [
            Paragraph("Ambient Temperature", body_style),
            Paragraph(f"{status.get('temperature_c', 22.1):.1f}°C", body_style),
            Paragraph("< 33.5°C Wet Bulb Max", body_style),
            Paragraph("NORMAL", body_style),
        ],
        [
            Paragraph("Relative Humidity", body_style),
            Paragraph(f"{status.get('humidity_pct', 68.0):.1f}%", body_style),
            Paragraph("General Mine Ventilation", body_style),
            Paragraph("NOMINAL", body_style),
        ],
        [
            Paragraph("Atmospheric Pressure", body_style),
            Paragraph(f"{status.get('pressure_hpa', 101.2):.1f} kPa", body_style),
            Paragraph("Underground Drift Strata", body_style),
            Paragraph("STABLE", body_style),
        ],
    ]
    gas_table = Table(gas_rows, colWidths=[160, 110, 160, 110])
    gas_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(gas_table)
    elements.append(Spacer(1, 10))

    # Active Incident Alerts Table
    elements.append(Paragraph("2. ACTIVE HAZARD & SURVIVOR DETECTION ALERTS", h2_style))
    alert_rows = [
        [
            Paragraph("<b>Alert ID</b>", bold_style),
            Paragraph("<b>Logged Time</b>", bold_style),
            Paragraph("<b>Severity</b>", bold_style),
            Paragraph("<b>Incident Description</b>", bold_style),
        ]
    ]
    cur_alerts = status.get("active_alerts", [])
    if not cur_alerts:
        alert_rows.append([
            Paragraph("—", body_style),
            Paragraph("—", body_style),
            Paragraph("INFO", body_style),
            Paragraph("No active safety violations detected in deployment drift.", body_style),
        ])
    else:
        for al in cur_alerts[:5]:
            sev = al.get("severity", "INFO")
            sev_color = "#DC2626" if sev in ("HIGH", "CRITICAL") else ("#D97706" if sev == "MEDIUM" else "#2563EB")
            alert_rows.append([
                Paragraph(str(al.get("id", "—")), body_style),
                Paragraph(str(al.get("time", "—")), body_style),
                Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", bold_style),
                Paragraph(str(al.get("message", "Incident recorded")), body_style),
            ])

    alert_table = Table(alert_rows, colWidths=[65, 80, 85, 310])
    alert_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FEF2F2")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#FCA5A5")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#FEE2E2")),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
    ]))
    elements.append(alert_table)
    elements.append(Spacer(1, 14))

    # Sign-off footer
    sign_rows = [
        [
            Paragraph("<b>Autonomous Rescue Robotic Pilot:</b><br/>RAKSHAK Mission AI v3.0", body_style),
            Paragraph("<b>Chief Safety Officer / Mines Inspector:</b><br/>Approved & Signed Digitally via DGMS Portal", body_style),
        ]
    ]
    sign_table = Table(sign_rows, colWidths=[270, 270])
    sign_table.setStyle(TableStyle([
        ("LINEBEFORE", (1, 0), (1, 0), 1, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(sign_table)

    doc.build(elements)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# FastAPI Application Configuration & Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def app_lifespan(app: FastAPI):
    # Initialize history with initial data
    for _ in range(30):
        update_telemetry_tick()

    # Start 2 Hz background loop
    worker_task = asyncio.create_task(telemetry_background_worker())
    yield
    # Shutdown
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="RAKSHAK-Mine Backend Simulator",
    description="Full-featured standalone backend simulator for the RAKSHAK-Mine underground rescue rover.",
    version="1.0.0",
    lifespan=app_lifespan,
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def get_root():
    """Root endpoint verifying RAKSHAK-Mine backend status."""
    return {
        "rover_id": ROVER_ID,
        "status": "ONLINE",
        "system": "RAKSHAK-Mine Autonomous Mine Rescue Rover Simulator",
        "version": "1.0.0",
        "rate": "2 Hz (500ms)",
        "anomaly_mode": anomaly_mode,
        "active_dgms_preset": active_dgms_preset,
    }


@app.get("/api/status")
def get_rover_status():
    """Returns the RoverCombinedStatus JSON payload."""
    return dict(telemetry_state)


@app.post("/api/rover/control")
async def post_rover_control(cmd: RoverControlCommand):
    """
    Accepts motor or accessory commands.
    Updates motor_state, buzzer_active, searchlight_active.
    Returns {"status": "ACK", "command": cmd}.
    """
    c = cmd.command.upper().strip()

    if c in ["FORWARD", "BACKWARD", "LEFT", "RIGHT"]:
        telemetry_state["motor_state"] = c
        telemetry_state["motor_speed"] = cmd.speed or 200
    elif c in ["STOP", "STOPPED"]:
        telemetry_state["motor_state"] = "STOPPED"
    elif c == "E_STOP":
        telemetry_state["motor_state"] = "STOPPED"
        telemetry_state["buzzer_active"] = True
    elif c == "BUZZER_ON":
        telemetry_state["buzzer_active"] = True
    elif c == "BUZZER_OFF":
        telemetry_state["buzzer_active"] = False
    elif c in ["LIGHT_ON", "SEARCHLIGHT_ON"]:
        telemetry_state["searchlight_active"] = True
    elif c in ["LIGHT_OFF", "SEARCHLIGHT_OFF"]:
        telemetry_state["searchlight_active"] = False

    return {
        "status": "ACK",
        "command": cmd.command,
        "motor_state": telemetry_state["motor_state"],
        "buzzer_active": telemetry_state["buzzer_active"],
        "searchlight_active": telemetry_state["searchlight_active"],
    }


@app.post("/api/dgms/preset")
async def set_dgms_preset(
    request: Request,
    preset: Optional[str] = Query(None, description="Preset name from query parameter"),
):
    """Updates the active DGMS compliance preset via query parameter or JSON body."""
    global active_dgms_preset

    chosen_preset = preset
    if not chosen_preset:
        try:
            body = await request.json()
            if isinstance(body, dict) and "preset" in body:
                chosen_preset = body["preset"]
        except Exception:
            pass

    if chosen_preset:
        active_dgms_preset = chosen_preset

    return {
        "status": "OK",
        "preset": active_dgms_preset,
    }


@app.post("/api/export/pdf")
def export_incident_report_pdf():
    """Generates and returns DGMS_Incident_Report_RAKSHAK_Mine.pdf."""
    pdf_bytes = generate_dgms_pdf_report(
        status=telemetry_state,
        history=list(telemetry_history),
        alerts=telemetry_state.get("active_alerts", []),
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="DGMS_Incident_Report_RAKSHAK_Mine.pdf"'
        },
    )


@app.get("/api/alerts")
def get_alerts(limit: int = Query(20, ge=1, le=100)):
    """Returns the list of active and recent incident alerts."""
    alerts = telemetry_state.get("active_alerts", [])
    return alerts[:limit]


@app.get("/api/telemetry/history")
def get_history(limit: int = Query(60, ge=5, le=300)):
    """Returns a list of historical telemetry points for plotting."""
    points = list(telemetry_history)
    return points[-limit:]


@app.post("/api/sim/toggle")
async def toggle_simulation(
    request: Request,
    enable: Optional[bool] = Query(None),
):
    """Toggles anomaly injection mode on RAKSHAK-Mine."""
    global anomaly_mode

    target_enable = enable
    if target_enable is None:
        try:
            body = await request.json()
            if isinstance(body, dict) and "enable" in body:
                target_enable = body["enable"]
        except Exception:
            pass

    if target_enable is None:
        anomaly_mode = not anomaly_mode
    else:
        anomaly_mode = bool(target_enable)

    # Immediately regenerate tick
    update_telemetry_tick()

    return {
        "status": "OK",
        "anomaly_mode": anomaly_mode,
        "system_status": telemetry_state["system_status"],
        "dgms_compliance_status": telemetry_state["dgms_compliance_status"],
    }


@app.post("/api/chat/send")
async def send_chat_message(payload: ChatMessageRequest):
    """Accepts chat message and returns simulated ACK response from RAKSHAK-Mine."""
    now_time = datetime.now().strftime("%H:%M")
    user_msg = payload.message.strip()
    rec = payload.recipient or ROVER_ID

    # Construct contextual rover response
    if "status" in user_msg.lower() or "report" in user_msg.lower():
        reply_msg = (
            f"RAKSHAK-Mine Status Report: Systems operational at {now_time}. "
            f"CH4: {telemetry_state['gas_ch4']}%, CO: {telemetry_state['gas_co']} ppm. "
            f"Survivor signature: {telemetry_state['thermal_max_temp_c']}°C at Sector B-4."
        )
    elif "light" in user_msg.lower():
        telemetry_state["searchlight_active"] = True
        reply_msg = f"{ROVER_ID}: Searchlight engaged at full intensity (1200 Lumens)."
    elif "siren" in user_msg.lower() or "buzzer" in user_msg.lower():
        telemetry_state["buzzer_active"] = True
        reply_msg = f"{ROVER_ID}: Acoustic beacon siren sounded to alert survivors."
    elif "halt" in user_msg.lower() or "stop" in user_msg.lower():
        telemetry_state["motor_state"] = "STOPPED"
        reply_msg = f"{ROVER_ID}: Rover stopped. Directional microphones listening for survivor tapping rhythms."
    else:
        reply_msg = (
            f"{ROVER_ID} ACK: Message '{user_msg}' received at {now_time}. "
            f"Autonomous link stable (Wi-Fi/LoRa). Continuing survivor scan."
        )

    return {
        "status": "ACK",
        "rover_id": ROVER_ID,
        "recipient": rec,
        "message": user_msg,
        "reply": reply_msg,
        "timestamp": now_time,
    }


# ---------------------------------------------------------------------------
# Streaming WebSocket Endpoint
# ---------------------------------------------------------------------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Real-time streaming WebSocket endpoint.
    Broadcasts RAKSHAK-Mine telemetry every 500ms (2 Hz).
    Also accepts inbound command JSON from the web interface.
    """
    await websocket.accept()
    active_websockets.add(websocket)

    # Immediately push current status upon connection
    try:
        await websocket.send_text(json.dumps(dict(telemetry_state)))
    except Exception:
        pass

    try:
        while True:
            # Allow clients to send teleoperation or ping frames
            text_data = await websocket.receive_text()
            try:
                data = json.loads(text_data)
                if "command" in data:
                    cmd_str = data["command"]
                    speed_val = data.get("speed", 200)
                    await post_rover_control(RoverControlCommand(command=cmd_str, speed=speed_val))
                    # Echo immediate status back
                    await websocket.send_text(json.dumps(dict(telemetry_state)))
            except Exception:
                pass
    except WebSocketDisconnect:
        active_websockets.discard(websocket)
    except Exception:
        active_websockets.discard(websocket)


# ---------------------------------------------------------------------------
# Main Runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print(f"===============================================================")
    print(f" Starting RAKSHAK-Mine Backend Simulator on port 8000")
    print(f" Rover ID: {ROVER_ID}")
    print(f" Telemetry Frequency: 2 Hz (500ms intervals)")
    print(f" WebSockets: ws://0.0.0.0:8000/ws/telemetry")
    print(f" Status API: http://0.0.0.0:8000/api/status")
    print(f"===============================================================")
    uvicorn.run(app, host="0.0.0.0", port=8000)
