export interface IncidentAlert {
  id?: number;
  timestamp?: string;
  time?: string;
  alert_type?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  message: string;
  value?: number;
  threshold?: number;
}

export interface ObstacleItem {
  id?: string;
  name: string;
  distance: string | number;
  type?: 'rock' | 'debris' | 'pipe' | 'wall' | string;
}

export interface HazardItem {
  id: string;
  label: string;
  level: 'High' | 'Moderate' | 'Low' | 'None';
  icon?: string;
}

export interface RoverCombinedStatus {
  rover_id?: string; // Default: "RAKSHAK-Mine"
  system_status?: 'OPERATIONAL' | 'CAUTION' | 'EMERGENCY' | string;
  last_update?: string;
  timestamp?: string;
  esp32_online?: boolean;
  pi_online?: boolean;
  
  // Power
  battery_voltage?: number;
  battery_percent?: number;
  battery_status?: 'NORMAL' | 'LOW' | 'CRITICAL' | string;

  // Environment & Atmospheric
  temperature_c?: number;
  humidity_pct?: number;
  pressure_hpa?: number;
  light_lux?: number;

  // Gas Monitoring
  ch4_pct?: number; // Methane (0-5%)
  co_ppm?: number;  // Carbon Monoxide (0-50 ppm)
  co2_ppm?: number; // Carbon Dioxide (0-5000 ppm)
  o2_pct?: number;  // Oxygen (19.5-23.5%)
  mq135_ppm?: number;
  mq7_ppm?: number;

  // Audio & Triage
  audio_ambient_db?: number;
  acoustic_tapping_detected?: boolean;
  voice_detected?: boolean;
  audio_confidence?: number;
  ai_detected_survivors?: number;
  survivor_triage_priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'PRIORITY_1_RED' | 'PRIORITY_2_YELLOW' | 'PRIORITY_3_GREEN' | string;
  survivor_condition?: string;
  thermal_hotspots_count?: number;
  thermal_max_temp_c?: number;

  // Obstacle & Proximity
  obstacle_distance_cm?: number;
  obstacle_detected?: boolean;
  obstacles_list?: ObstacleItem[];
  auto_brake_armed?: boolean;

  // Rover Motion & Teleoperation
  motor_state?: string;
  motor_speed?: number;
  buzzer_active?: boolean;
  searchlight_active?: boolean;
  depth_m?: number;
  distance_m?: number;
  distance_traveled_m?: number;
  mode?: string;

  // Compliance & Alerts
  dgms_compliance_status?: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | string;
  active_alerts?: IncidentAlert[];
}
