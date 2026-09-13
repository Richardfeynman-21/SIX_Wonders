from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ESP32Telemetry(BaseModel):
    rover_id: str = "MINER-ROVER-01"
    battery_voltage: float = Field(..., description="Battery voltage from ESP32 ADC resistor divider")
    battery_percent: float = Field(..., description="Estimated charge percentage (0-100%)")
    obstacle_distance_cm: float = Field(..., description="Distance in cm from HC-SR04")
    obstacle_detected: bool = Field(False, description="True if obstacle is within safety threshold")
    motor_state: str = Field("STOPPED", description="STOPPED, FORWARD, BACKWARD, LEFT, RIGHT")
    motor_speed: int = Field(200, description="PWM speed 0-255")
    buzzer_active: bool = False
    searchlight_active: bool = False
    wifi_rssi: Optional[int] = -55
    uptime_ms: Optional[int] = 0
    timestamp: Optional[str] = None

class PiTelemetry(BaseModel):
    rover_id: str = "MINER-ROVER-01"
    temperature_c: float = Field(..., description="Ambient temperature from BME280")
    humidity_pct: float = Field(..., description="Relative humidity % from BME280")
    pressure_hpa: float = Field(..., description="Barometric pressure in hPa from BME280")
    mq135_ppm: float = Field(..., description="Air quality / Smoke / CO2 in ppm")
    mq7_ppm: float = Field(..., description="Carbon Monoxide in ppm")
    audio_ambient_db: float = Field(42.0, description="Ambient sound decibels from INMP441 mic")
    acoustic_tapping_detected: bool = Field(False, description="Tapping rhythm detected from trapped survivor")
    thermal_hotspots_count: int = Field(0, description="Count of heat anomalies > 36.5C from MLX90640")
    thermal_max_temp_c: float = Field(25.0, description="Max temperature in thermal grid")
    ai_detected_survivors: int = Field(0, description="Persons detected by AI vision model")
    ai_detections: List[Dict[str, Any]] = Field(default_factory=list)
    camera_online: bool = True
    timestamp: Optional[str] = None

class RoverControlCommand(BaseModel):
    command: str = Field(..., description="FORWARD, BACKWARD, LEFT, RIGHT, STOP, BUZZER_ON, BUZZER_OFF, LIGHT_ON, LIGHT_OFF")
    speed: int = Field(200, ge=0, le=255)

class IncidentAlert(BaseModel):
    id: Optional[int] = None
    timestamp: str
    alert_type: str  # GAS_CO, GAS_AIR, HEAT_STRESS, PRESSURE_COLLAPSE, OBSTACLE, LOW_BATTERY, SURVIVOR
    severity: str    # INFO, WARNING, CRITICAL
    message: str
    value: float
    threshold: float

class RoverCombinedStatus(BaseModel):
    rover_id: str = "MINER-ROVER-01"
    system_status: str = "OPERATIONAL"  # OPERATIONAL, CAUTION, EMERGENCY
    last_update: str
    esp32_online: bool
    pi_online: bool
    battery_voltage: float
    battery_percent: float
    battery_status: str  # NORMAL, LOW, CRITICAL
    temperature_c: float
    humidity_pct: float
    pressure_hpa: float
    mq135_ppm: float
    mq7_ppm: float
    audio_ambient_db: float
    acoustic_tapping_detected: bool
    obstacle_distance_cm: float
    obstacle_detected: bool
    motor_state: str
    motor_speed: int
    buzzer_active: bool
    searchlight_active: bool
    thermal_hotspots_count: int
    thermal_max_temp_c: float
    ai_detected_survivors: int
    survivor_triage_priority: str  # NONE, PRIORITY_1_RED, PRIORITY_2_YELLOW, PRIORITY_3_GREEN
    dgms_compliance_status: str    # COMPLIANT, WARNING, NON_COMPLIANT
    active_alerts: List[IncidentAlert] = Field(default_factory=list)
