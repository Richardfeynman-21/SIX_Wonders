# FastAPI Mission Control Backend

The centralized surface station telemetry ingestion, safety evaluation, database logging, and control dispatch service.

---

## 1. Quickstart

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 2. Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/telemetry/esp32` | Ingests ESP32 telemetry (battery voltage, charge %, ultrasonic distance, motor state) |
| `POST` | `/api/telemetry/pi` | Ingests Pi Edge telemetry (BME280 temp/hum/press, MQ-135, MQ-7, AI survivor detection, mic audio) |
| `GET` | `/api/status` | Current combined rover status + DGMS compliance + survivor triage priority |
| `GET` | `/api/telemetry/history` | Historical time-series telemetry records for Streamlit sparklines |
| `POST` | `/api/rover/control` | Dispatches steering and actuator commands (`FORWARD`, `STOP`, `BUZZER_ON`, etc.) |
| `POST` | `/api/export/pdf` | Compiles and downloads the official DGMS Incident Briefing PDF Report |
| `POST` | `/api/sim/toggle` | Activates internal synthetic telemetry generator if hardware is not connected |
| `WS` | `/ws/telemetry` | Bi-directional WebSocket stream for real-time dashboard updates |

---

## 3. Running the Mock Hardware Generator

For testing or pitching when the physical rover is not running:
```bash
python3 -m backend.mock_rover
```
