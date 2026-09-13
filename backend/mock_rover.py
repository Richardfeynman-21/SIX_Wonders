#!/usr/bin/env python3
"""
Mock Hardware Telemetry Simulator
Sends realistic synthetic telemetry to the FastAPI backend at 2 Hz
Use this to demonstrate the complete dashboard without needing physical hardware!
"""

import time
import math
import random
import requests

BACKEND_URL = "http://127.0.0.1:8000"

def run_mock_rover():
    print("================================================================")
    print(" AI Mine Safety Rover — Hardware Mock Telemetry Generator")
    print(f" Target Backend: {BACKEND_URL}")
    print(" Press Ctrl+C to stop.")
    print("================================================================")

    step = 0
    bat_v = 12.4
    
    while True:
        step += 1
        t = time.time()

        # 1. Simulate ESP32 Telemetry
        # 1. Simulate ESP32 Telemetry (Nominal 3S Li-ion ~11.85V / 78%)
        bat_v = 11.85 + 0.05 * math.sin(step * 0.02)
        bat_pct = 78.0 + 2.0 * math.sin(step * 0.02)
        dist = 120.0 + 30.0 * math.sin(step * 0.1) + random.uniform(-3.0, 3.0)

        esp_payload = {
            "rover_id": "MINER-ROVER-01",
            "battery_voltage": round(bat_v, 2),
            "battery_percent": round(bat_pct, 1),
            "obstacle_distance_cm": round(dist, 1),
            "obstacle_detected": dist < 18.0,
            "motor_state": "MANUAL",
            "motor_speed": 200,
            "buzzer_active": dist < 18.0,
            "searchlight_active": True,
            "wifi_rssi": -72 + random.randint(-2, 2),
            "uptime_ms": step * 500
        }

        # 2. Simulate Pi Edge Telemetry
        # Occasional methane/CO puff or trapped survivor simulation
        is_hazard_event = (step % 40 > 28)
        co_val = round(38.0 + 15.0 * math.sin(step * 0.2) + random.uniform(-2, 2), 1) if is_hazard_event else round(8.0 + random.uniform(-1, 2), 1)
        air_val = round(420.0 + random.uniform(-20, 30), 1) if is_hazard_event else round(140.0 + random.uniform(-10, 15), 1)
        temp_val = round(28.5 + 2.0 * math.sin(step * 0.05) + random.uniform(-0.3, 0.3), 1)
        hum_val = round(72.0 + random.uniform(-1.5, 1.5), 1)
        press_val = round(1011.5 + random.uniform(-0.5, 0.5), 1)
        
        # Survivor acoustic signal simulated around step 20-30
        tapping = (20 <= (step % 50) <= 30)
        audio_db = 72.0 if tapping else round(42.0 + random.uniform(-2, 3), 1)
        survivors = 1 if tapping else 0
        thermal_hot = 1 if tapping else 0
        thermal_max = 37.2 if tapping else 26.5

        pi_payload = {
            "rover_id": "MINER-ROVER-01",
            "temperature_c": temp_val,
            "humidity_pct": hum_val,
            "pressure_hpa": press_val,
            "mq135_ppm": air_val,
            "mq7_ppm": co_val,
            "audio_ambient_db": audio_db,
            "acoustic_tapping_detected": tapping,
            "thermal_hotspots_count": thermal_hot,
            "thermal_max_temp_c": thermal_max,
            "ai_detected_survivors": survivors,
            "ai_detections": [{"class": "person", "confidence": 0.88, "box": [120, 80, 240, 300]}] if survivors else [],
            "camera_online": True
        }

        try:
            requests.post(f"{BACKEND_URL}/api/telemetry/esp32", json=esp_payload, timeout=0.8)
            requests.post(f"{BACKEND_URL}/api/telemetry/pi", json=pi_payload, timeout=0.8)
            print(f"[{time.strftime('%H:%M:%S')}] Pushed Telemetry | Bat: {bat_v:.2f}V ({bat_pct:.0f}%) | CO: {co_val} ppm | Dist: {dist:.1f} cm | Tapping: {tapping}")
        except Exception as e:
            print(f"[WARN] Backend not reachable: {e}")

        time.sleep(0.5)

if __name__ == "__main__":
    run_mock_rover()
