# 🤖 RAKSHAK-MINE ESP32 Rover Firmware

Autonomous Safety & Rescue Rover Microcontroller Firmware for **ESP32 30-Pin NodeMCU**, written in C++ (Arduino Framework).

---

## 📌 Features

* **4WD Skid-Steering Motor Control**:
  - Driven by Dual L298N H-Bridge Modules.
  - 1000 Hz (1 kHz) hardware PWM via ESP32 `ledc` timers.
  - Independent left and right wheel speed regulation.
* **Chassis Orientation Compensation**:
  - Built-in `reverseOrientation` flag (default `true`) allowing the physical chassis to be mounted reversed without changing wiring.
* **Ultrasonic Sonar Auto-Brake (DGMS CMR 173)**:
  - HC-SR04 sonar continuously monitors distance.
  - Automatically cuts propulsion if an obstacle is within **18 cm**, preventing crashes.
* **Atmospheric Gas Telemetry**:
  - MQ-4 (Methane $CH_4$) analog sampling on GPIO 34.
  - MQ-7 (Carbon Monoxide $CO$) analog sampling on GPIO 35.
* **Standalone Embedded Web HUD**:
  - Served directly from ESP32 flash memory via [`dashboard_html.h`](dashboard_html.h) on port 80.
  - Operates independently of external internet over Wi-Fi SoftAP:
    - **SSID**: `RAKSHAK-ROVER-AP`
    - **Password**: `mineguard123`
    - **URL**: `http://192.168.4.1`

---

## ⚡ Hardware Wiring & Pin Mapping

| ESP32 Pin | Function | Peripheral | Logic / Notes |
| :--- | :--- | :--- | :--- |
| **GPIO 32** | ENA | L298N Right Motor PWM | Remove jumper; 1 kHz PWM |
| **GPIO 27** | IN1 | L298N Right Motor Dir 1 | Digital Output |
| **GPIO 14** | IN2 | L298N Right Motor Dir 2 | Digital Output |
| **GPIO 25** | IN3 | L298N Left Motor Dir 1 | Digital Output |
| **GPIO 26** | IN4 | L298N Left Motor Dir 2 | Digital Output |
| **GPIO 33** | ENB | L298N Left Motor PWM | Remove jumper; 1 kHz PWM |
| **GPIO 5** | TRIG | HC-SR04 Trigger | 10µs trigger pulse |
| **GPIO 4** | ECHO | HC-SR04 Echo | **Use 1kΩ / 2kΩ voltage divider (5V to 3.3V)** |
| **GPIO 34** | AOUT | MQ-4 (Methane CH4) | ADC1_CH6 |
| **GPIO 35** | AOUT | MQ-7 (Carbon Monoxide) | ADC1_CH7 |
| **GPIO 22** | Output | Alert Siren / Searchlight | Active High |
| **GPIO 36 (VP)**| Analog | 3S Li-ion Battery Voltage | 100kΩ / 10kΩ divider (0.00392 factor) |

---

## 🚀 Flashing Instructions

1. Open **Arduino IDE** (or VS Code with PlatformIO).
2. Install **ESP32 by Espressif Systems** via Boards Manager.
3. Open [`esp32_rover_firmware.ino`](esp32_rover_firmware.ino).
4. Board Settings:
   - **Board**: `ESP32 Dev Module`
   - **Upload Speed**: `921600`
   - **Flash Frequency**: `80MHz`
   - **Partition Scheme**: `Default 4MB with spiffs`
5. Connect your ESP32 via USB and click **Upload**.
6. Open the Serial Monitor at **115200 baud** to view real-time initialization diagnostics and IP allocation.
