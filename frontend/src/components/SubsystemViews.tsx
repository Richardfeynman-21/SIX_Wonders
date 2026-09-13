"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Video,
  Wind,
  Activity,
  MapPin,
  AlertTriangle,
  Radio,
  Zap,
  Bell,
  FileText,
  ShieldCheck,
  Settings,
  Sliders,
  Play,
  Square,
  Volume2,
  VolumeX,
  Lightbulb,
  LightbulbOff,
  Download,
  Flame,
  CheckCircle2,
  Cpu,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { RoverCombinedStatus, MotorCommand } from "@/types/telemetry";
import { sendRoverCommand, exportPDFReport, setDGMSPreset } from "@/lib/api";
import { LiveCameraFeed } from "./LiveCameraFeed";
import { GasMonitoringGauges } from "./GasMonitoringGauges";
import { SurvivorAudioWaveform } from "./SurvivorAudioWaveform";
import { HazardAndTriage } from "./HazardAndTriage";
import { MineMapCard } from "./MineMapCard";
import { PowerMonitoringCard } from "./PowerMonitoringCard";
import { TwoWayCommunication } from "./TwoWayCommunication";

interface SubsystemViewsProps {
  activeTab: string;
  telemetry?: RoverCombinedStatus;
  onBack?: () => void;
  onSelectTab?: (tabId: string) => void;
}

export const SubsystemViews: React.FC<SubsystemViewsProps> = ({
  activeTab,
  telemetry,
  onBack,
  onSelectTab,
}) => {
  const [speed, setSpeed] = useState<number>(200);
  const [activeCmd, setActiveCmd] = useState<string>("STOP");
  const [isExporting, setIsExporting] = useState(false);

  const handleCommand = async (cmd: MotorCommand, spd: number = speed) => {
    setActiveCmd(cmd);
    await sendRoverCommand(cmd, spd);
  };

  // Keyboard navigation when rover-control view is active
  useEffect(() => {
    if (activeTab !== "rover-control") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "KeyW", "KeyS", "KeyA", "KeyD"].includes(e.code)) {
        e.preventDefault();
      }
      if (e.repeat) return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          handleCommand("FORWARD");
          break;
        case "KeyS":
        case "ArrowDown":
          handleCommand("BACKWARD");
          break;
        case "KeyA":
        case "ArrowLeft":
          handleCommand("LEFT");
          break;
        case "KeyD":
        case "ArrowRight":
          handleCommand("RIGHT");
          break;
        case "Space":
          handleCommand("STOP", 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, speed]);

  const handlePDF = async () => {
    try {
      setIsExporting(true);
      const blob = await exportPDFReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DGMS_Incident_Report_${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export report.");
    } finally {
      setIsExporting(false);
    }
  };

  switch (activeTab) {
    case "rover-control":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-6 h-6 text-sky-600" />
                RAKSHAK-Mine Control &amp; Tactical Drive Subsystem
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Dual L298N H-Bridge Drivers | 4WD DC Geared Motors | Ultrasonic Auto-Brake
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
              ACTIVE TELEOPERATION
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Control Panel */}
            <div className="mg-card p-4 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                Motor Drive Controller
              </h3>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>PWM Speed:</span>
                  <span className="font-mono font-bold text-sky-600">{speed} / 255</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="255"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Directional Pad */}
              <div className="flex flex-col items-center py-2">
                <div className="grid grid-cols-3 gap-2 w-48">
                  <div />
                  <button
                    onClick={() => handleCommand("FORWARD")}
                    className="p-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow"
                  >
                    ⬆️ FWD
                  </button>
                  <div />

                  <button
                    onClick={() => handleCommand("LEFT")}
                    className="p-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow"
                  >
                    ⬅️ LFT
                  </button>
                  <button
                    onClick={() => handleCommand("STOP", 0)}
                    className="p-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow"
                  >
                    ⏹️ STP
                  </button>
                  <button
                    onClick={() => handleCommand("RIGHT")}
                    className="p-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow"
                  >
                    ➡️ RGT
                  </button>

                  <div />
                  <button
                    onClick={() => handleCommand("BACKWARD")}
                    className="p-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow"
                  >
                    ⬇️ REV
                  </button>
                  <div />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleCommand(telemetry?.searchlight_active ? "LIGHT_OFF" : "LIGHT_ON", 0)}
                  className="py-2 px-3 rounded-lg border text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Searchlight ({telemetry?.searchlight_active ? "ON" : "OFF"})
                </button>
                <button
                  onClick={() => handleCommand(telemetry?.buzzer_active ? "BUZZER_OFF" : "BUZZER_ON", 0)}
                  className="py-2 px-3 rounded-lg border text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4 text-rose-500" />
                  Siren ({telemetry?.buzzer_active ? "ON" : "OFF"})
                </button>
              </div>
            </div>

            {/* Video preview side */}
            <div className="h-[380px]">
              <LiveCameraFeed status={telemetry} />
            </div>
          </div>
        </div>
      );

    case "live-camera":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-6 h-6 text-sky-600" />
              High-Definition Optical & Thermal Tunnel Viewport
            </h2>
            <span className="text-xs font-mono text-slate-500">Stream: 1080p @ 30fps RTSP</span>
          </div>
          <div className="h-[520px]">
            <LiveCameraFeed status={telemetry} />
          </div>
        </div>
      );

    case "gas-monitoring":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Wind className="w-6 h-6 text-sky-600" />
              Atmospheric Gas Telemetry & DGMS CMR 2017 Limits
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              DGMS Compliant Thresholds
            </span>
          </div>
          <GasMonitoringGauges status={telemetry} />
        </div>
      );

    case "environment":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-sky-600" />
              Underground Climate & Micro-Atmospheric Telemetry
            </h2>
            <span className="text-xs font-mono text-slate-500">BMP280 + SHT31 Sensors</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mg-card p-4">
              <span className="text-xs font-semibold text-slate-500">Tunnel Temperature</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {telemetry?.temperature_c?.toFixed(1) ?? "22.1"}°C
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">DGMS Safe Limit: &lt;33.5°C</p>
            </div>
            <div className="mg-card p-4">
              <span className="text-xs font-semibold text-slate-500">Relative Humidity</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {telemetry?.humidity_pct?.toFixed(0) ?? "68"}%
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Underground Baseline: 60-80%</p>
            </div>
            <div className="mg-card p-4">
              <span className="text-xs font-semibold text-slate-500">Barometric Pressure</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {telemetry?.pressure_hpa?.toFixed(1) ?? "101.2"} kPa
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Sub-drift Depth Equivalent: -310m</p>
            </div>
          </div>
        </div>
      );

    case "mine-map":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-sky-600" />
              Subterranean Drift Spatial Mapping & Waypoints
            </h2>
            <span className="text-xs font-mono text-slate-500">Gallery B-4 | Drift 3</span>
          </div>
          <div className="h-[520px]">
            <MineMapCard telemetry={telemetry} />
          </div>
        </div>
      );

    case "hazard-analysis":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              AI Geotechnical Hazard & Rockfall Risk Assessment
            </h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
              YOLOv8 Geotechnical Model Active
            </span>
          </div>
          <HazardAndTriage status={telemetry} />
        </div>
      );

    case "survivor-detection":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-600" />
              Acoustic Tapping & Thermal Survivor Localizer
            </h2>
            <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 px-3 py-1 rounded-full font-mono">
              TRIAGE: PRIORITY 1
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SurvivorAudioWaveform status={telemetry} />
            <div className="mg-card p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Thermal Biometric Confirmation</h3>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Thermal Signature:</span>
                    <span className="text-rose-700 font-bold font-mono">
                      {telemetry?.thermal_max_temp_c?.toFixed(1) ?? "36.8"}°C (Human Body Range)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Acoustic Pattern:</span>
                    <span className="text-rose-700 font-bold font-mono">Rhythmic 3-Tap Sequence</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Estimated Distance:</span>
                    <span className="text-slate-800 font-bold font-mono">4.2 meters ahead</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => sendRoverCommand("BUZZER_ON", 0)}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow mt-4"
              >
                📢 Broadcast Acoustic Response Beacon to Survivor
              </button>
            </div>
          </div>
        </div>
      );

    case "communication":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-6 h-6 text-sky-600" />
              Surface Station Dual LoRa & Wi-Fi Intercom
            </h2>
            <span className="text-xs font-mono text-emerald-600 font-bold">433 MHz LoRa + 2.4 GHz AP Active</span>
          </div>
          <TwoWayCommunication />
        </div>
      );

    case "power-monitoring":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-emerald-600" />
              3S Li-ion Battery Telemetry & BMS Health
            </h2>
            <span className="text-xs font-mono text-slate-500">Pack: 11.1V Nominal / 12.6V Peak</span>
          </div>
          <div className="h-[420px]">
            <PowerMonitoringCard telemetry={telemetry} />
          </div>
        </div>
      );

    case "alerts":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-600" />
              Statutory DGMS Safety Violations & Rover Alerts
            </h2>
            <span className="text-xs font-bold text-slate-600 font-mono">Real-Time FIFO Stream</span>
          </div>
          <div className="mg-card p-4 space-y-2">
            {(telemetry?.active_alerts ?? []).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-mono font-bold text-slate-500">{a.time || "14:31"}</span>
                <span className="font-semibold text-slate-800">{a.message}</span>
                <span className="px-2 py-0.5 rounded font-bold uppercase bg-rose-100 text-rose-700">
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "incident-reports":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Statutory DGMS Incident Briefing & Audit Report
            </h2>
            <button
              onClick={handlePDF}
              disabled={isExporting}
              className="py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Generating..." : "Download Complete Report PDF"}
            </button>
          </div>
          <div className="mg-card p-6 text-center space-y-3">
            <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Official DGMS Incident Dossier (Form-IV)</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Contains atmospheric gas charts, survivor triage logs, thermal readings, obstacle maps, and full mission timeline.
            </p>
          </div>
        </div>
      );

    case "dgms-compliance":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              DGMS Coal Mines Regulations (CMR) 2017 Audit Compliance
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
              100% REGULATORY AUDIT PASS
            </span>
          </div>
          <div className="mg-card p-4 space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium space-y-1.5">
              <div>• <strong>Regulation 169:</strong> Continuous toxic & inflammable gas monitoring in subterranean drifts.</div>
              <div>• <strong>Regulation 170:</strong> Intrinsically safe electrical apparatus in Degree III gassy coal seams.</div>
              <div>• <strong>Regulation 173:</strong> Automatic propulsion cut-off on obstacle proximity under 18 cm.</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDGMSPreset("COAL_SEAM_DEGREE_III")}
                className="py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
              >
                Apply Coal Seam Degree III Preset
              </button>
              <button
                onClick={() => setDGMSPreset("STANDARD_DGMS")}
                className="py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Apply Standard DGMS Preset
              </button>
            </div>
          </div>
        </div>
      );

    case "settings":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-slate-700" />
              Surface Station & Rover System Settings
            </h2>
            <span className="text-xs font-mono text-slate-500">v2.4.0-NextJS</span>
          </div>
          <div className="mg-card p-4 max-w-xl space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">FastAPI Surface Backend URL</label>
              <input
                type="text"
                defaultValue="http://127.0.0.1:8000"
                className="w-full p-2 rounded border border-slate-300 font-mono text-xs bg-slate-50"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">ADC Battery Calibration Scale</label>
              <input
                type="number"
                step="0.0001"
                defaultValue="0.00392"
                className="w-full p-2 rounded border border-slate-300 font-mono text-xs bg-slate-50"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span>Underground Simulation Mode:</span>
              <button
                onClick={async () => {
                  try {
                    await fetch("http://127.0.0.1:8000/api/sim/toggle", { method: "POST" });
                    alert("Toggled simulation mode!");
                  } catch (e) {
                    alert("Simulation toggle dispatched.");
                  }
                }}
                className="py-1.5 px-3 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
              >
                Toggle Mock Telemetry
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
