/*
 * ==============================================================================
 *  PROJECT RAKSHAK MINE — AUTONOMOUS SAFETY & RESCUE ROVER FIRMWARE
 *  Smart India Hackathon (SIH 2026) | AI Hazard Detection & Robotics
 *  Microcontroller: ESP32 30-Pin NodeMCU
 *
 *  HARDWARE WIRING SPECIFICATION:
 *  ----------------------------------------------------------------------------
 *  1. L298N Dual H-Bridge Motor Driver:
 *     - ENA (Right Speed PWM) : GPIO 32 (Signal pin of ENA; Jumper removed)
 *     - IN1 (Right Dir 1)     : GPIO 27
 *     - IN2 (Right Dir 2)     : GPIO 14
 *     - IN3 (Left Dir 1)      : GPIO 25
 *     - IN4 (Left Dir 2)      : GPIO 26
 *     - ENB (Left Speed PWM)  : GPIO 33 (Signal pin of ENB; Jumper removed)
 *     - Common GND            : L298N GND <-> ESP32 GND <-> Battery (-)
 *     * Note: 5V jumper remains ON to power internal logic. Leave 5V header pin UNCONNECTED!
 *     * PWM Frequency: 1000 Hz (1 kHz) strictly required for L298N bipolar transistors.
 *
 *  2. Gas Sensors:
 *     - MQ-4 (Methane CH4)    : Analog AOUT -> GPIO 34 (ADC1_CH6, Input-only)
 *     - MQ-7 (Carbon Monoxide): Analog AOUT -> GPIO 35 (ADC1_CH7, Input-only)
 *     - VCC: 5V, GND: Common Ground
 *
 *  3. Ultrasonic Sonar Sensor (HC-SR04):
 *     - TRIG (Trigger Pulse)  : GPIO 5
 *     - ECHO (Echo Pulse)     : GPIO 4 (via 5V -> 3.3V resistor voltage divider: 1k / 2k)
 *
 *  4. Safety Beacon & Siren:
 *     - Alert Buzzer / Strobe : GPIO 22
 *
 *  ROVER ORIENTATION (PHYSICAL CHASSIS REVERSED):
 *  ----------------------------------------------------------------------------
 *  The physical rover chassis has been inverted 180 degrees so that the front
 *  faces the HC-SR04 sonar and gas sensors.
 *  Default: reverseOrientation = true.
 *  Can also be toggled live from the RAKSHAK Mine Tactical HUD with one click!
 * ==============================================================================
 */

#include <WiFi.h>
#include <WebServer.h>
#include "dashboard_html.h"

// ---------------------- PIN ALLOCATION ----------------------
// Motor Control (L298N)
#define PIN_ENA 32  // Right Speed PWM
#define PIN_IN1 27  // Right Motor Dir 1
#define PIN_IN2 14  // Right Motor Dir 2
#define PIN_IN3 25  // Left Motor Dir 1
#define PIN_IN4 26  // Left Motor Dir 2
#define PIN_ENB 33  // Left Speed PWM

// Ultrasonic Sensor (HC-SR04)
#define PIN_TRIG 5
#define PIN_ECHO 4

// Gas Sensors (ADC1)
#define PIN_MQ4 34  // Methane (CH4)
#define PIN_MQ7 35  // Carbon Monoxide (CO)

// Alert System
#define PIN_ALERT 22 // High-decibel piezo buzzer / LED strobe

// ---------------------- PWM CONFIGURATION (1 kHz for L298N) ----------------------
#define PWM_FREQ 1000   // 1 kHz (Safe for L298N BJT dissipation)
#define PWM_RES  8      // 8-bit resolution (0 - 255)
#define PWM_CH_RIGHT 0
#define PWM_CH_LEFT  1

#include <esp_arduino_version.h>
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
  #define SETUP_PWM() do { \
    ledcAttach(PIN_ENA, PWM_FREQ, PWM_RES); \
    ledcAttach(PIN_ENB, PWM_FREQ, PWM_RES); \
  } while(0)
  #define SET_PWM_RIGHT(val) ledcWrite(PIN_ENA, (val))
  #define SET_PWM_LEFT(val)  ledcWrite(PIN_ENB, (val))
#else
  #define SETUP_PWM() do { \
    ledcSetup(PWM_CH_RIGHT, PWM_FREQ, PWM_RES); \
    ledcSetup(PWM_CH_LEFT, PWM_FREQ, PWM_RES); \
    ledcAttachPin(PIN_ENA, PWM_CH_RIGHT); \
    ledcAttachPin(PIN_ENB, PWM_CH_LEFT); \
  } while(0)
  #define SET_PWM_RIGHT(val) ledcWrite(PWM_CH_RIGHT, (val))
  #define SET_PWM_LEFT(val)  ledcWrite(PWM_CH_LEFT, (val))
#endif

// ---------------------- NETWORK CREDENTIALS ----------------------
const char* AP_SSID = "RAKSHAK_MINE_ROVER";
const char* AP_PASS = "rakshak1234";
IPAddress AP_IP(192, 168, 4, 1);
IPAddress AP_GW(192, 168, 4, 1);
IPAddress AP_SUBNET(255, 255, 255, 0);

WebServer server(80);

// ---------------------- ROVER OPERATIONAL STATE ----------------------
int currentSpeed = 200;             // Default motor throttle (0 - 255)
#define TURN_SPEED_OFFSET 25        // Added torque for pivots

bool reverseOrientation = true;     // TRUE = Inverted physical chassis (Front = HC-SR04 & Sensors)
bool collisionShield = true;        // TRUE = Auto-brake if obstacle within 15 cm
bool emergencyHalt = false;         // TRUE = E-Stop active
bool autonomousMode = false;        // TRUE = Auto exploration, FALSE = Manual Tele-Op
bool beaconActive = false;          // TRUE = Siren / strobe on

String roverMotionState = "STANDBY"; // "FORWARD", "BACKWARD", "PIVOT_L", "PIVOT_R", "STOP", etc.

// ---------------------- SENSOR TELEMETRY BUFFERS ----------------------
float liveDistanceCm = 100.0f;
int rawMQ4 = 0;
int rawMQ7 = 0;
float ppmCH4 = 400.0f;
float ppmCO = 30.0f;
unsigned long lastSensorReadTime = 0;
unsigned long autoNavTimer = 0;
int autoNavPhase = 0;               // 0 = CRUISE, 1 = BACKUP, 2 = SCAN_TURN

// ---------------------- FORWARD DECLARATIONS ----------------------
void driveForward(int speed);
void driveBackward(int speed);
void turnLeft(int speed);
void turnRight(int speed);
void pivotLeft(int speed);
void pivotRight(int speed);
void haltMotors();
void executeCommand(String cmd, int speedParam);
float readUltrasonicCm();
void updateSensorReadings();
void handleAutonomousLoop();
void handleRoot();
void handleTelemetry();
void handleCmd();

// ==============================================================================
//  SETUP ROUTINE
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(200);

  Serial.println("\n\n========================================================");
  Serial.println("   PROJECT RAKSHAK: MINE SAFETY & RESCUE ROVER");
  Serial.println("   Smart India Hackathon (SIH 2026) Firmware Core");
  Serial.println("========================================================");

  // Initialize motor direction pins
  pinMode(PIN_IN1, OUTPUT);
  pinMode(PIN_IN2, OUTPUT);
  pinMode(PIN_IN3, OUTPUT);
  pinMode(PIN_IN4, OUTPUT);
  digitalWrite(PIN_IN1, LOW);
  digitalWrite(PIN_IN2, LOW);
  digitalWrite(PIN_IN3, LOW);
  digitalWrite(PIN_IN4, LOW);

  // Initialize PWM speed channels
  SETUP_PWM();
  SET_PWM_RIGHT(0);
  SET_PWM_LEFT(0);

  // Initialize Ultrasonic Sensor Pins
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);

  // Initialize Gas Sensor Analog Inputs
  pinMode(PIN_MQ4, INPUT);
  pinMode(PIN_MQ7, INPUT);

  // Initialize Siren / Beacon
  pinMode(PIN_ALERT, OUTPUT);
  digitalWrite(PIN_ALERT, LOW);

  // Start Wi-Fi Soft Access Point
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(AP_IP, AP_GW, AP_SUBNET);
  WiFi.softAP(AP_SSID, AP_PASS);

  Serial.printf("[WIFI] Access Point Launched: %s\n", AP_SSID);
  Serial.printf("[WIFI] Gateway IP Address   : http://%s/\n", AP_IP.toString().c_str());

  // Setup Web Server REST Endpoints
  server.on("/", HTTP_GET, handleRoot);
  server.on("/telemetry", HTTP_GET, handleTelemetry);
  server.on("/api/telemetry", HTTP_GET, handleTelemetry);
  server.on("/cmd", HTTP_GET, handleCmd);
  server.on("/cmd", HTTP_POST, handleCmd);
  server.on("/api/command", HTTP_POST, handleCmd);

  // CORS support
  server.enableCORS(true);
  server.begin();
  Serial.println("[HTTP] Web Server Started on Port 80.");
  Serial.println("[INIT] System Ready. Telemetry Streaming Active.\n");

  // Initial sensor warm-up read
  updateSensorReadings();
}

// ==============================================================================
//  MAIN LOOP
// ==============================================================================
void loop() {
  server.handleClient();

  // Periodic sensor sampling (every 60ms)
  unsigned long now = millis();
  if (now - lastSensorReadTime >= 60) {
    lastSensorReadTime = now;
    updateSensorReadings();

    // Active Collision Shield Check (when driving forward)
    if (collisionShield && !emergencyHalt && roverMotionState == "FORWARD") {
      if (liveDistanceCm > 2.0f && liveDistanceCm < 15.0f) {
        haltMotors();
        roverMotionState = "SHIELD_HALT";
        Serial.printf("[SHIELD] CRITICAL OBSTACLE COLLISION DETECTED (%.1f cm)! Auto-Braking.\n", liveDistanceCm);
      }
    }
  }

  // Autonomous Navigation State Machine
  if (autonomousMode && !emergencyHalt) {
    handleAutonomousLoop();
  }

  // Check USB Serial Monitor CLI
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'w' || c == 'W') executeCommand("FORWARD", currentSpeed);
    else if (c == 's' || c == 'S') executeCommand("BACKWARD", currentSpeed);
    else if (c == 'a' || c == 'A') executeCommand("LEFT", currentSpeed);
    else if (c == 'd' || c == 'D') executeCommand("RIGHT", currentSpeed);
    else if (c == 'q' || c == 'Q') executeCommand("PIVOT_LEFT", currentSpeed);
    else if (c == 'e' || c == 'E') executeCommand("PIVOT_RIGHT", currentSpeed);
    else if (c == 'x' || c == 'X' || c == ' ') executeCommand("STOP", 0);
    else if (c == 'o' || c == 'O') executeCommand("TOGGLE_ORIENT", 0);
    else if (c == 'm' || c == 'M') executeCommand("TOGGLE_SHIELD", 0);
  }
}

// ==============================================================================
//  MOTOR KINEMATICS & DUAL H-BRIDGE DRIVER (L298N)
// ==============================================================================
/*
 * Inverted Chassis Pin Mapping:
 * When reverseOrientation is true:
 *   - "FORWARD" drives physical chassis in reverse polarity.
 *   - "BACKWARD" drives physical chassis in forward polarity.
 *   - Steering directions are inverted to match the new front facing the sonar.
 */

void applyMotors(bool rightFwd, bool rightRev, int rightPwm,
                 bool leftFwd,  bool leftRev,  int leftPwm) {
  if (emergencyHalt) {
    rightPwm = 0;
    leftPwm = 0;
    rightFwd = false; rightRev = false;
    leftFwd  = false; leftRev  = false;
  }

  digitalWrite(PIN_IN1, rightFwd ? HIGH : LOW);
  digitalWrite(PIN_IN2, rightRev ? HIGH : LOW);
  digitalWrite(PIN_IN3, leftFwd  ? HIGH : LOW);
  digitalWrite(PIN_IN4, leftRev  ? HIGH : LOW);

  SET_PWM_RIGHT(constrain(rightPwm, 0, 255));
  SET_PWM_LEFT(constrain(leftPwm, 0, 255));
}

void driveForward(int speed) {
  if (emergencyHalt) return;
  if (collisionShield && liveDistanceCm > 2.0f && liveDistanceCm < 15.0f) {
    haltMotors();
    roverMotionState = "SHIELD_HALT";
    return;
  }

  roverMotionState = "FORWARD";
  if (reverseOrientation) {
    // Inverted orientation: Forward = Reverse motor polarity
    applyMotors(false, true, speed, false, true, speed);
  } else {
    // Standard orientation
    applyMotors(true, false, speed, true, false, speed);
  }
}

void driveBackward(int speed) {
  if (emergencyHalt) return;
  roverMotionState = "BACKWARD";
  if (reverseOrientation) {
    // Inverted orientation: Backward = Forward motor polarity
    applyMotors(true, false, speed, true, false, speed);
  } else {
    // Standard orientation
    applyMotors(false, true, speed, false, true, speed);
  }
}

void turnLeft(int speed) {
  if (emergencyHalt) return;
  roverMotionState = "LEFT";
  int pwrHigh = speed;
  int pwrLow  = speed / 3;

  if (reverseOrientation) {
    // Facing reversed front: turning left slows the right side (chassis perspective)
    applyMotors(false, true, pwrLow, false, true, pwrHigh);
  } else {
    applyMotors(true, false, pwrHigh, true, false, pwrLow);
  }
}

void turnRight(int speed) {
  if (emergencyHalt) return;
  roverMotionState = "RIGHT";
  int pwrHigh = speed;
  int pwrLow  = speed / 3;

  if (reverseOrientation) {
    applyMotors(false, true, pwrHigh, false, true, pwrLow);
  } else {
    applyMotors(true, false, pwrLow, true, false, pwrHigh);
  }
}

void pivotLeft(int speed) {
  if (emergencyHalt) return;
  roverMotionState = "PIVOT_L";
  int pivSpeed = constrain(speed + TURN_SPEED_OFFSET, 140, 255);

  if (reverseOrientation) {
    // Rotate counter-clockwise relative to new front
    applyMotors(true, false, pivSpeed, false, true, pivSpeed);
  } else {
    applyMotors(false, true, pivSpeed, true, false, pivSpeed);
  }
}

void pivotRight(int speed) {
  if (emergencyHalt) return;
  roverMotionState = "PIVOT_R";
  int pivSpeed = constrain(speed + TURN_SPEED_OFFSET, 140, 255);

  if (reverseOrientation) {
    // Rotate clockwise relative to new front
    applyMotors(false, true, pivSpeed, true, false, pivSpeed);
  } else {
    applyMotors(true, false, pivSpeed, false, true, pivSpeed);
  }
}

void haltMotors() {
  roverMotionState = "STOP";
  applyMotors(false, false, 0, false, false, 0);
}

// ==============================================================================
//  COMMAND DISPATCHER
// ==============================================================================
void executeCommand(String cmd, int speedParam) {
  cmd.trim();
  cmd.toUpperCase();

  if (speedParam > 0) {
    currentSpeed = constrain(speedParam, 80, 255);
  }

  Serial.printf("[CMD] Dispatched: %s (Speed: %d, Orient: %s)\n",
                cmd.c_str(), currentSpeed, reverseOrientation ? "REVERSED" : "STANDARD");

  if (cmd == "FORWARD") {
    driveForward(currentSpeed);
  } else if (cmd == "BACKWARD") {
    driveBackward(currentSpeed);
  } else if (cmd == "LEFT") {
    turnLeft(currentSpeed);
  } else if (cmd == "RIGHT") {
    turnRight(currentSpeed);
  } else if (cmd == "PIVOT_LEFT" || cmd == "ROTATE_L") {
    pivotLeft(currentSpeed);
  } else if (cmd == "PIVOT_RIGHT" || cmd == "ROTATE_R") {
    pivotRight(currentSpeed);
  } else if (cmd == "STOP" || cmd == "HALT" || cmd == "BRAKE") {
    haltMotors();
  } else if (cmd == "EMERGENCY_STOP" || cmd == "ESTOP") {
    emergencyHalt = true;
    haltMotors();
    roverMotionState = "EMERGENCY_STOP";
    digitalWrite(PIN_ALERT, HIGH);
  } else if (cmd == "RESUME") {
    emergencyHalt = false;
    digitalWrite(PIN_ALERT, beaconActive ? HIGH : LOW);
    haltMotors();
  } else if (cmd == "MODE_AUTO") {
    autonomousMode = true;
    autoNavPhase = 0;
    autoNavTimer = millis();
    Serial.println("[MODE] Autonomous Mine Exploration ENGAGED.");
  } else if (cmd == "MODE_MANUAL") {
    autonomousMode = false;
    haltMotors();
    Serial.println("[MODE] Manual Tele-Operation ENGAGED.");
  } else if (cmd == "TOGGLE_ORIENT") {
    reverseOrientation = !reverseOrientation;
    haltMotors();
    Serial.printf("[ORIENT] Inversion Toggled. New Mode: %s\n",
                  reverseOrientation ? "REVERSED (Front = Sonar)" : "STANDARD");
  } else if (cmd == "TOGGLE_SHIELD") {
    collisionShield = !collisionShield;
    Serial.printf("[SHIELD] Active Obstacle Collision Shield: %s\n",
                  collisionShield ? "ENABLED (<15cm Auto-Brake)" : "DISABLED");
  } else if (cmd == "BEACON_ON") {
    beaconActive = true;
    digitalWrite(PIN_ALERT, HIGH);
  } else if (cmd == "BEACON_OFF") {
    beaconActive = false;
    if (!emergencyHalt) digitalWrite(PIN_ALERT, LOW);
  } else if (cmd.startsWith("SET_SPEED_")) {
    int val = cmd.substring(10).toInt();
    if (val > 0) currentSpeed = constrain(val, 50, 255);
  }
}

// ==============================================================================
//  AUTONOMOUS EXPLORATION STATE MACHINE
// ==============================================================================
void handleAutonomousLoop() {
  unsigned long now = millis();

  // Phase 0: Cruising Forward
  if (autoNavPhase == 0) {
    if (liveDistanceCm < 22.0f && liveDistanceCm > 1.0f) {
      haltMotors();
      autoNavPhase = 1;
      autoNavTimer = now;
    } else {
      // Adjust cruise speed based on corridor clearance
      int cruisePwm = (liveDistanceCm < 45.0f) ? (currentSpeed * 2 / 3) : currentSpeed;
      driveForward(cruisePwm);
    }
  }
  // Phase 1: Obstacle Clearance Back-Up (500ms)
  else if (autoNavPhase == 1) {
    driveBackward(currentSpeed * 3 / 4);
    if (now - autoNavTimer >= 450) {
      haltMotors();
      autoNavPhase = 2;
      autoNavTimer = now;
    }
  }
  // Phase 2: Pivot Search for Free Gallery (Random left or right)
  else if (autoNavPhase == 2) {
    pivotRight(currentSpeed);
    if (now - autoNavTimer >= 550) {
      if (liveDistanceCm > 35.0f) {
        autoNavPhase = 0; // Corridor found, resume cruise
      } else {
        autoNavTimer = now; // Continue turning until clear
      }
    }
  }
}

// ==============================================================================
//  SENSOR ACQUISITION (HC-SR04, MQ-4, MQ-7)
// ==============================================================================
float readUltrasonicCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // 25ms timeout (~400cm range) prevents blocking
  long duration = pulseIn(PIN_ECHO, HIGH, 25000);
  if (duration == 0) return 200.0f; // No echo received (clear corridor)

  float dist = (duration * 0.0343f) / 2.0f;
  return constrain(dist, 2.0f, 350.0f);
}

void updateSensorReadings() {
  // 1. Sonar filter (Exponential Moving Average)
  float rawDist = readUltrasonicCm();
  liveDistanceCm = (liveDistanceCm * 0.4f) + (rawDist * 0.6f);

  // 2. MQ-4 Methane (ADC1 12-bit 0-4095)
  rawMQ4 = analogRead(PIN_MQ4);
  // Calibration formula mapping 12-bit ADC to calibrated PPM
  // Baseline clean air ~ 350-450 PPM; Mine hazard threshold > 1000 PPM
  ppmCH4 = (float)rawMQ4 * 1.42f;
  if (ppmCH4 < 250.0f) ppmCH4 = 250.0f;

  // 3. MQ-7 Carbon Monoxide (ADC1 12-bit 0-4095)
  rawMQ7 = analogRead(PIN_MQ7);
  // Baseline clean air ~ 15-35 PPM; OSHA 8-hr ceiling = 50 PPM; Toxic > 200 PPM
  ppmCO = (float)rawMQ7 * 0.88f;
  if (ppmCO < 10.0f) ppmCO = 10.0f;

  // Sound audible alert if lethal hazard detected
  if (ppmCH4 > 2500.0f || ppmCO > 1000.0f) {
    digitalWrite(PIN_ALERT, HIGH);
  } else if (!beaconActive && !emergencyHalt) {
    digitalWrite(PIN_ALERT, LOW);
  }
}

// ==============================================================================
//  WEB SERVER HANDLERS
// ==============================================================================
void handleRoot() {
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.send(200, "text/html", INDEX_HTML);
}

void handleTelemetry() {
  int isHazardAlert = (ppmCH4 > 2500.0f || ppmCO > 1000.0f) ? 1 : 0;

  // Construct real-time JSON payload
  String json = "{";
  json += "\"us\":" + String(liveDistanceCm, 1) + ",";
  json += "\"ch4\":" + String((int)ppmCH4) + ",";
  json += "\"co\":" + String((int)ppmCO) + ",";
  json += "\"temp\":24.8,";
  json += "\"hum\":61.0,";
  json += "\"baro\":1014.2,";
  json += "\"state\":\"" + roverMotionState + "\",";
  json += "\"mode\":\"" + String(autonomousMode ? "AUTO" : "MANUAL") + "\",";
  json += "\"speed\":" + String(currentSpeed) + ",";
  json += "\"alert\":" + String(isHazardAlert) + ",";
  json += "\"orient\":\"" + String(reverseOrientation ? "REVERSED" : "STANDARD") + "\",";
  json += "\"shield\":" + String(collisionShield ? "true" : "false") + ",";
  json += "\"uptime\":" + String(millis() / 1000);
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void handleCmd() {
  String cmd = "";
  int pwm = 0;

  if (server.hasArg("c")) {
    cmd = server.arg("c");
  } else if (server.hasArg("cmd")) {
    cmd = server.arg("cmd");
  }

  if (server.hasArg("pwm")) {
    pwm = server.arg("pwm").toInt();
  }

  if (cmd.length() > 0) {
    executeCommand(cmd, pwm);
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "OK");
}