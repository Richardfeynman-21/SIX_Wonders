export type SystemStatus = "OPERATIONAL" | "CAUTION" | "EMERGENCY";
export type BatteryStatus = "NORMAL" | "LOW" | "CRITICAL";
export type DGMSComplianceStatus = "COMPLIANT" | "WARNING" | "NON_COMPLIANT";

export interface IncidentAlert {
  id?: number;
  timestamp?: string;
  time?: string;
  alert_type?: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  message: string;
  value?: number;
  threshold?: number;
}
export type AlertItem = IncidentAlert;


export interface RoverCombinedStatus {
  rover_id: string; // Default: "RAKSHAK-Mine"
  timestamp?: string;
  last_update?: string;
  system_status: SystemStatus;
  esp32_online: boolean;
  pi_online: boolean;
  battery_voltage: number;
  battery_percent: number;
  battery_status: BatteryStatus;
  temperature_c: number;
  humidity_pct: number;
  pressure_hpa: number;
  mq135_ppm: number;
  mq7_ppm: number;
  audio_ambient_db: number;
  acoustic_tapping_detected: boolean;
  obstacle_distance_cm: number;
  obstacle_detected: boolean;
  motor_state: string;
  motor_speed: number;
  buzzer_active: boolean;
  searchlight_active: boolean;
  thermal_hotspots_count: number;
  thermal_max_temp_c: number;
  ai_detected_survivors: number;
  survivor_triage_priority: string;
  dgms_compliance_status: DGMSComplianceStatus;
  active_alerts: IncidentAlert[];
}

export type MotorCommand =
  | "FORWARD"
  | "BACKWARD"
  | "LEFT"
  | "RIGHT"
  | "STOP"
  | "BUZZER_ON"
  | "BUZZER_OFF"
  | "LIGHT_ON"
  | "LIGHT_OFF";

export interface RoverControlCommand {
  command: MotorCommand;
  speed: number;
}

export const DGMS_PRESETS = {
  STANDARD: "DGMS Coal Mines Regulations 2017 (Standard)",
  FIRE_SMOLDERING: "Active Coal Mine Fire / Smoldering Zone",
  FLOOD_INUNDATION: "Inundation & Flash Flooding Risk Zone",
} as const;

export type DGMSPresetType = (typeof DGMS_PRESETS)[keyof typeof DGMS_PRESETS];

export interface ChatMessage {
  id: string;
  timestamp: string;
  sender: string;
  recipient: string;
  message: string;
  type: "text" | "voice";
  status?: string;
}

export interface EventLogItem {
  id: string;
  time: string;
  message: string;
  severity: "High" | "Medium" | "Low" | "Critical";
  category: "voice" | "gas" | "obstacle" | "power" | "strata";
}

export interface MapMarker {
  id: string;
  name: string;
  type: "rover" | "path" | "hazard" | "checkpoint" | "exit" | "obstacle";
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  depth?: string;
  status?: string;
  details?: string;
}
