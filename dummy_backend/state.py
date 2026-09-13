import asyncio
import json
import math
import random
from datetime import datetime
from typing import Dict, Any, List
from fastapi import WebSocket

connected_clients: List[WebSocket] = []

rover_state: Dict[str, Any] = {
    "rover_id": "RAKSHAK-Mine",
    "system_status": "OPERATIONAL",
    "esp32_online": True,
    "pi_online": True,
    "battery_voltage": 11.85,
    "battery_percent": 78.0,
    "battery_status": "NORMAL",
    "temperature_c": 22.1,
    "humidity_pct": 68.0,
    "pressure_hpa": 101.2,
    "pressure_kpa": 101.2,
    "mq135_ppm": 165.0,
    "mq7_ppm": 25.0,
    "gas_ch4": 0.8,
    "gas_co": 25.0,
    "gas_co2": 420.0,
    "gas_o2": 20.6,
    "ch4_pct": 0.8,
    "co_ppm": 25.0,
    "co2_ppm": 420.0,
    "o2_pct": 20.6,
    "audio_ambient_db": 42.0,
    "acoustic_tapping_detected": True,
    "voice_detected": True,
    "audio_confidence": 87.0,
    "obstacle_distance_cm": 120.0,
    "obstacle_detected": False,
    "motor_state": "MANUAL",
    "motor_speed": 200,
    "buzzer_active": False,
    "searchlight_active": True,
    "thermal_hotspots_count": 1,
    "thermal_max_temp_c": 36.8,
    "ai_detected_survivors": 1,
    "survivor_triage_priority": "HIGH",
    "dgms_compliance_status": "COMPLIANT",
    "active_preset": "COAL_SEAM_DEGREE_III",
    "active_alerts": [],
    "last_update": "Just now",
}

async def telemetry_synthesizer_loop():
    tick = 0
    while True:
        tick += 1
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        time_hm = datetime.now().strftime("%H:%M")

        rover_state["temperature_c"] = round(22.1 + math.sin(tick * 0.05) * 0.4 + random.uniform(-0.1, 0.1), 1)
        rover_state["humidity_pct"] = round(68.0 + math.cos(tick * 0.04) * 0.8, 1)
        rover_state["pressure_hpa"] = round(101.2 + math.sin(tick * 0.02) * 0.1, 1)
        rover_state["pressure_kpa"] = rover_state["pressure_hpa"]

        rover_state["gas_ch4"] = round(0.8 + math.sin(tick * 0.08) * 0.04, 2)
        rover_state["ch4_pct"] = rover_state["gas_ch4"]

        rover_state["gas_co"] = round(25.0 + math.cos(tick * 0.06) * 1.2, 1)
        rover_state["co_ppm"] = rover_state["gas_co"]

        rover_state["gas_co2"] = round(420.0 + math.sin(tick * 0.05) * 6.0, 0)
        rover_state["co2_ppm"] = rover_state["gas_co2"]

        rover_state["gas_o2"] = round(20.6 + math.sin(tick * 0.03) * 0.1, 1)
        rover_state["o2_pct"] = rover_state["gas_o2"]

        rover_state["mq135_ppm"] = round(165.0 + math.cos(tick * 0.07) * 3.0, 1)
        rover_state["mq7_ppm"] = round(25.0 + math.sin(tick * 0.06) * 1.0, 1)
        rover_state["audio_ambient_db"] = round(42.0 + random.uniform(-1.5, 2.0), 1)

        if tick % 2400 == 0 and rover_state["battery_percent"] > 10:
            rover_state["battery_percent"] -= 1
            rover_state["battery_voltage"] = round(11.0 + (rover_state["battery_percent"] / 100.0) * 1.6, 2)

        rover_state["timestamp"] = now_str
        rover_state["last_update"] = datetime.now().strftime("%H:%M:%S")

        rover_state["active_alerts"] = [
            {
                "id": 1,
                "time": time_hm,
                "message": "Possible human voice detected (RAKSHAK-Mine)",
                "severity": "HIGH",
                "alert_type": "SURVIVOR",
                "value": 1,
                "threshold": 1,
            },
            {
                "id": 2,
                "time": time_hm,
                "message": f"Methane level nominal ({rover_state['gas_ch4']}%)",
                "severity": "MEDIUM",
                "alert_type": "GAS_CH4",
                "value": rover_state["gas_ch4"],
                "threshold": 0.5,
            },
        ]

        if connected_clients:
            payload = json.dumps(rover_state)
            disconnected = []
            for ws in connected_clients:
                try:
                    await ws.send_text(payload)
                except Exception:
                    disconnected.append(ws)
            for ws in disconnected:
                if ws in connected_clients:
                    connected_clients.remove(ws)

        await asyncio.sleep(0.5)
