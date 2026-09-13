import { RoverCombinedStatus, RoverControlCommand, MotorCommand, DGMS_PRESETS } from "@/types/telemetry";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || "ws://127.0.0.1:8000";

export const DEFAULT_STATUS: RoverCombinedStatus = {
  rover_id: "RAKSHAK-Mine",
  timestamp: new Date().toISOString(),
  last_update: "Just now",
  system_status: "OPERATIONAL",
  esp32_online: true,
  pi_online: true,
  battery_voltage: 11.85,
  battery_percent: 78.0,
  battery_status: "NORMAL",
  temperature_c: 22.1,
  humidity_pct: 68.0,
  pressure_hpa: 101.2,
  mq135_ppm: 165.0,
  mq7_ppm: 25.0,
  audio_ambient_db: 42.0,
  acoustic_tapping_detected: true,
  obstacle_distance_cm: 120.0,
  obstacle_detected: false,
  motor_state: "MANUAL",
  motor_speed: 200,
  buzzer_active: false,
  searchlight_active: true,
  thermal_hotspots_count: 1,
  thermal_max_temp_c: 36.8,
  ai_detected_survivors: 1,
  survivor_triage_priority: "HIGH",
  dgms_compliance_status: "COMPLIANT",
  active_alerts: [
    {
      id: 1,
      message: "Possible human voice detected",
      severity: "HIGH",
      time: "14:31",
      timestamp: new Date().toISOString(),
      alert_type: "SURVIVOR",
      value: 1,
      threshold: 1,
    },
    {
      id: 2,
      message: "Methane level above threshold (0.8%)",
      severity: "MEDIUM",
      time: "14:28",
      timestamp: new Date().toISOString(),
      alert_type: "GAS_CH4",
      value: 0.8,
      threshold: 0.5,
    },
  ],
};

export const api = {
  async getStatus(): Promise<RoverCombinedStatus> {
    try {
      const res = await fetch(`${API_BASE}/api/status`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return { ...DEFAULT_STATUS, ...data };
    } catch {
      return DEFAULT_STATUS;
    }
  },

  async sendRoverCommand(command: MotorCommand, speed: number = 200): Promise<{ status: string }> {
    try {
      const payload: RoverControlCommand = { command, speed };
      const res = await fetch(`${API_BASE}/api/rover/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("Failed to send command via HTTP REST, fallback simulation active:", e);
      return { status: "DISPATCHED_SIMULATED" };
    }
  },

  async setDGMSPreset(preset: string): Promise<{ status: string; preset: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/dgms/preset?preset=${encodeURIComponent(preset)}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("Using offline preset update:", e);
      return { status: "UPDATED_OFFLINE", preset };
    }
  },

  async getTelemetryHistory(limit: number = 60) {
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/history?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async getAlertsHistory(limit: number = 20) {
    try {
      const res = await fetch(`${API_BASE}/api/alerts?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return DEFAULT_STATUS.active_alerts;
    }
  },

  async exportPDFReport(): Promise<Blob> {
    const res = await fetch(`${API_BASE}/api/export/pdf`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to generate PDF from backend");
    return await res.blob();
  },

  connectTelemetryWebSocket(
    onMessage: (data: RoverCombinedStatus) => void,
    onError?: (err: Event) => void,
    onClose?: () => void
  ): () => void {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isClosed = false;

    function connect() {
      if (isClosed) return;
      try {
        ws = new WebSocket(`${WS_BASE}/ws/telemetry`);

        ws.onopen = () => {
          console.log("[RAKSHAK-Mine] Telemetry WebSocket connected.");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (err) {
            console.error("[RAKSHAK-Mine] Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (event) => {
          if (onError) onError(event);
        };

        ws.onclose = () => {
          if (onClose) onClose();
          if (!isClosed) {
            // Auto reconnect after 2.5s
            reconnectTimeout = setTimeout(connect, 2500);
          }
        };
      } catch (err) {
        console.warn("[RAKSHAK-Mine] WebSocket connection attempt failed, will retry:", err);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      isClosed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  },
};

export const {
  getStatus,
  sendRoverCommand,
  setDGMSPreset,
  getTelemetryHistory,
  getAlertsHistory,
  exportPDFReport,
  connectTelemetryWebSocket,
} = api;
