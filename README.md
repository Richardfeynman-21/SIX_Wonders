# AI-Powered Underground Mine Safety, Monitoring & Rescue Rover
### Smart India Hackathon (SIH 2026) — Internal Hackathon Prototype (Tier 3 Scope)

---

## 1. Problem Context: Jharkhand Underground Coal Mines

Jharkhand's underground coalfields (Jharia, Raniganj, Dhanbad, Bokaro) face hazardous conditions that endanger mineworkers and rescue teams:
1. **Explosive & Toxic Gas Influx**: Accumulation of methane (CH4 / firedamp) and lethal carbon monoxide (CO / afterdamp) from spontaneous combustion and smoldering seams.
2. **Strata Instability & Tunnel Collapses**: Roof falls and air displacement.
3. **Inundation / Flooding**: Underground aquifer breaches resulting in rapid water buildup.
4. **Zero-Visibility Darkness & Particulate**: Thick coal dust and smoke obscuring vision.
5. **Trapped Survivor Localization**: Inability of surface teams to locate or communicate with trapped miners without sending human rescuers into toxic zones.

---

## 2. Dual-Tier System Architecture: Full Tier 3 vs. Internal Prototype

| Architecture Layer | Full Production Tier 3 (SIH Grand Finale) | Internal Hackathon Prototype (This Build) |
| :--- | :--- | :--- |
| **Compute Core** | Raspberry Pi Zero 2 W + ESP32 NodeMCU | Raspberry Pi Zero 2 W + ESP32 NodeMCU |
| **Locomotion** | 4x 12V 300RPM Metal Gearmotors (3.5 kg-cm) | 4x Standard 9V DC Motors (Bench Demo) |
| **Motor Drive** | Double BTS7960 43A High-Power H-Bridge | L298N Dual H-Bridge Driver Module |
| **Vision System** | 5MP OV5647 IR-CUT Night-Vision Camera | 5MP OV5647 IR-CUT Night-Vision Camera (CSI) |
| **Thermal Sensing** | Waveshare MLX90640 32x24 IR Array (768 px) | MLX90640 (Hardware / Software Integrated) |
| **Gas Detection** | MQ-4 (CH4), MQ-7 (CO), MQ-136 (H2S) | MQ-135 (Air Quality/Smoke) + MQ-7 (CO) |
| **Climate & Pressure** | GY-BME280 (Temp, Humidity, Barometer) | GY-BME280 (Temp, Humidity, Barometer) |
| **Survivor Audio** | INMP441 I2S Mic + PAM8403 3W Speaker | INMP441 I2S Mic + PAM8403 3W Speaker |
| **Obstacle Avoidance** | HC-SR04 Ultrasonic Distance Sensor | HC-SR04 Ultrasonic Distance Sensor |
| **Power Monitoring** | 3S2P 18650 Pack + BMS + INA219 | 3S Li-ion Battery via ESP32 ADC Resistor Divider |
| **Sub-GHz Comms** | SX1262 LoRa 868MHz (5km Subterranean) | Local Surface Wi-Fi (AP Hotspot Network) |
| **Total Hardware Cost** | **₹ 17,630.00 INR** | **~ ₹ 3,500.00 – ₹ 4,300.00 INR** |

---

## 3. Project Structure

```
SIH_Hackatho_Dashboard/
├── esp32-firmware/       # C++ ESP32 co-processor code (L298N, HC-SR04, battery ADC, buzzer/LED)
│   ├── platformio.ini    # PlatformIO configuration
│   ├── include/config.h  # Pin definitions, Wi-Fi credentials, ADC calibration
│   ├── src/main.cpp      # ESP32 main firmware logic & local web server
│   └── README.md
├── pi-edge/              # Python Edge AI service for Raspberry Pi Zero 2 W
│   ├── requirements.txt
│   ├── camera_streamer.py# MJPEG streaming server (port 8080) for OV5647 camera
│   ├── ai_detector.py    # Edge AI survivor detection
│   ├── thermal_imager.py # MLX90640 32x24 thermal array reader
│   ├── audio_survivor.py # INMP441 I2S microphone acoustic analyzer
│   ├── sensors_bme_mq.py # BME280 & MQ gas sensor ingestion
│   ├── main.py           # Pi edge orchestrator & telemetry dispatcher
│   └── README.md
├── backend/              # FastAPI mission control service
│   ├── requirements.txt
│   ├── main.py           # REST endpoints, WebSocket telemetry, command dispatcher
│   ├── models.py         # Pydantic schemas
│   ├── database.py       # SQLite telemetry logging & alert history
│   ├── dgms_standards.py # Directorate General of Mines Safety compliance rules & triage
│   ├── pdf_exporter.py   # ReportLab PDF briefing generator
│   ├── mock_rover.py     # Hardware mock telemetry simulator (for dry-run testing)
│   └── README.md
├── dashboard/            # Streamlit surface command station
│   ├── requirements.txt
│   ├── app.py            # Complete multi-tab tactical HUD dashboard
│   ├── styles.css        # High-contrast mine safety dark UI styling
│   └── README.md
└── AI_Mine_Safety_Rescue_Rover_Detailed_BOM_Architectures.xlsx # Master hardware BOM
```

---

## 4. Hardware Wiring & Pinout Guide

### ESP32 Pin Connections:
* **L298N Motor Driver**:
  - `ENA` $\rightarrow$ GPIO 32 (PWM)
  - `IN1` $\rightarrow$ GPIO 25, `IN2` $\rightarrow$ GPIO 26
  - `IN3` $\rightarrow$ GPIO 27, `IN4` $\rightarrow$ GPIO 14
  - `ENB` $\rightarrow$ GPIO 33 (PWM)
* **HC-SR04 Ultrasonic**:
  - `TRIG` $\rightarrow$ GPIO 12
  - `ECHO` $\rightarrow$ GPIO 13 *(via 1kΩ / 2kΩ voltage divider)*
* **Battery Resistor Divider**:
  - Battery (+) $\rightarrow$ $R_1 (30\text{k}\Omega)$ $\rightarrow$ GPIO 34 (ADC) $\rightarrow$ $R_2 (7.5\text{k}\Omega)$ $\rightarrow$ GND
* **Actuators**:
  - 5V Active Buzzer $\rightarrow$ GPIO 4
  - Searchlight LED $\rightarrow$ GPIO 2
* **Common Ground**:
  - All GND terminals (Battery, L298N, ESP32, Pi) **MUST** be tied together.

---

## 5. How to Run the System for Demo

### Step 1: Start the FastAPI Backend
```bash
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Start the Streamlit Dashboard
In a second terminal:
```bash
source .venv/bin/activate
streamlit run dashboard/app.py --server.port 8501
```
Open `http://localhost:8501`.

### Step 3: Run the Hardware Telemetry Feed
* **With Physical Rover**: Flash the ESP32 via `esp32-firmware/` and run `python3 pi-edge/main.py` on the Pi Zero 2 W.
* **Without Hardware (Dry-run / Presentation Demo)**:
  In a third terminal:
  ```bash
  source .venv/bin/activate
  python3 -m backend.mock_rover
  ```
  This immediately streams live synthetic underground coal mine data (gas peaks, survivor tapping, thermal body heat, battery discharge) directly onto your dashboard!
