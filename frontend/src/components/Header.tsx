"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Wifi,
  Bell,
  User,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  BadgeAlert,
  RotateCcw,
  Check,
  Headphones,
  Gamepad2,
} from "lucide-react";
import { sendRoverCommand } from "@/lib/api";

interface HeaderProps {
  isRoverOnline?: boolean;
  isLoRaConnected?: boolean;
  alertsCount?: number;
  onOpenAlerts?: () => void;
  onEmergencyStopTriggered?: () => void;
  onOpenControl?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRoverOnline = true,
  isLoRaConnected = true,
  alertsCount = 3,
  onOpenAlerts,
  onEmergencyStopTriggered,
  onOpenControl,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [eStopTriggered, setEStopTriggered] = useState<boolean>(false);
  const [eStopLoading, setEStopLoading] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isOperatorOpen, setIsOperatorOpen] = useState<boolean>(false);
  const [operatorMsg, setOperatorMsg] = useState<string | null>(null);

  const alertsRef = useRef<HTMLDivElement>(null);
  const operatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Mon, 8 Sep 2025 14:32:18
      const formatted =
        now.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        " " +
        now.toLocaleTimeString("en-GB", { hour12: false });
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (operatorRef.current && !operatorRef.current.contains(event.target as Node)) {
        setIsOperatorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmergencyStop = async () => {
    setEStopLoading(true);
    try {
      await sendRoverCommand("STOP", 0);
      setEStopTriggered(true);
      if (onEmergencyStopTriggered) onEmergencyStopTriggered();
    } catch (err) {
      console.error("Emergency Stop dispatch failed:", err);
      setEStopTriggered(true);
    } finally {
      setEStopLoading(false);
    }
  };

  const resetEmergencyStop = async () => {
    setEStopTriggered(false);
  };

  const sampleAlerts = [
    {
      id: 1,
      title: "Possible human voice detected",
      time: "14:31",
      severity: "HIGH",
      desc: "INMP441 Acoustic sensor detected 320Hz harmonic voice pattern in Drift B-4.",
    },
    {
      id: 2,
      title: "Methane level above threshold (0.8%)",
      time: "14:28",
      severity: "MEDIUM",
      desc: "MQ-4 sensor reading 0.82% CH4 near timber support #12.",
    },
    {
      id: 3,
      title: "Geotechnical Obstacle Ahead (1.2m)",
      time: "14:20",
      severity: "LOW",
      desc: "Ultrasonic rangefinder auto-brake standby active.",
    },
  ];

  return (
    <div className="sticky top-0 z-40">
      {/* 1. VISUAL EMERGENCY STOP BANNER (Active State) */}
      {eStopTriggered && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 fill-white text-red-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
              ⚠️ EMERGENCY STOP ACTIVE — RAKSHAK-Mine Propulsion Disarmed &amp; Motors Halted!
            </span>
          </div>
          <button
            onClick={resetEmergencyStop}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-red-700 rounded-md text-xs font-extrabold shadow active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Safety Interlock</span>
          </button>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Title & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-sky-600">RAKSHAK-Mine</span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-slate-800 text-sm sm:text-base font-bold">
              AI-Powered Underground Mine Safety, Monitoring &amp; Rescue
            </span>
          </h2>
          <div className="flex items-center gap-2">
            {/* RAKSHAK-Mine Online Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isRoverOnline
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRoverOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                }`}
              />
              {isRoverOnline ? "RAKSHAK-Mine Online" : "RAKSHAK-Mine Offline"}
            </div>

            {/* LoRa Connected Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isLoRaConnected
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>LoRa Connected</span>
            </div>

            {/* Quick Teleop Button */}
            {onOpenControl && (
              <button
                onClick={onOpenControl}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-sm transition-all cursor-pointer"
                title="Open Rover Teleoperation Cockpit"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Drive Cockpit</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Clock, Alerts, Profile & Emergency Stop */}
        <div className="flex items-center gap-3">
          {/* Real-time Clock */}
          <div className="text-xs font-medium text-slate-500 font-mono tracking-tight hidden md:block bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80">
            {currentTime || "Loading..."}
          </div>

          {/* Alerts Notification Bell with Interactive Dropdown Drawer */}
          <div className="relative" ref={alertsRef}>
            <button
              onClick={() => {
                setIsAlertsOpen(!isAlertsOpen);
                setIsOperatorOpen(false);
              }}
              className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                isAlertsOpen
                  ? "bg-sky-100 text-sky-700 ring-2 ring-sky-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Active Alerts"
            >
              <Bell className="w-5 h-5" />
              {alertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Drawer */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 text-red-500" />
                    <h3 className="font-bold text-slate-900 text-sm">Active Incident Alerts</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">
                    {alertsCount} UNRESOLVED
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {sampleAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setIsAlertsOpen(false);
                        if (onOpenAlerts) onOpenAlerts();
                      }}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 transition-colors text-xs cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{alert.title}</span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                            alert.severity === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : alert.severity === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{alert.desc}</p>
                      <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-mono">
                        <span>Time: {alert.time}</span>
                        <span className="text-emerald-600 font-medium">Click to view in Alerts →</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsAlertsOpen(false);
                      if (onOpenAlerts) onOpenAlerts();
                    }}
                    className="w-full py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition-colors text-center cursor-pointer"
                  >
                    Open Full Alerts &amp; Notifications View →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User / Operator Profile Button with Interactive Popup */}
          <div className="relative" ref={operatorRef}>
            <button
              onClick={() => {
                setIsOperatorOpen(!isOperatorOpen);
                setIsAlertsOpen(false);
              }}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity cursor-pointer group"
              title="Operator Profile"
            >
              <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:ring-2 group-hover:ring-sky-300">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden lg:inline">
                Operator
              </span>
            </button>

            {/* Operator Details Modal Popup */}
            {isOperatorOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                      RV
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        Cmdr. Rajesh Verma
                      </h3>
                      <p className="text-[11px] text-slate-500">Lead DGMS Rescue Specialist</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOperatorOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-2.5 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Callsign:</span>
                    <span className="font-bold text-slate-800 font-mono">SURFACE-CMD-ALPHA</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Station Node:</span>
                    <span className="font-semibold text-slate-800">DGMS Surface Hub #1</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Auth Level:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Level 4 Tactical E-Stop
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Radio Mesh:</span>
                    <span className="font-mono text-sky-600 font-semibold">868.4 MHz LoRa Ch-4</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Session Uptime:</span>
                    <span className="font-mono text-slate-700">05h 22m</span>
                  </div>
                </div>

                {operatorMsg && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{operatorMsg}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => {
                      setOperatorMsg("LoRa mesh beacon pinged (SNR +14dB)");
                      setTimeout(() => setOperatorMsg(null), 3000);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all text-center cursor-pointer"
                  >
                    Test Comm Link
                  </button>
                  <button
                    onClick={() => setIsOperatorOpen(false)}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Stop Button */}
          <button
            onClick={handleEmergencyStop}
            disabled={eStopLoading}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer ${
              eStopTriggered
                ? "bg-red-700 ring-4 ring-red-300 animate-pulse shadow-red-700/50"
                : "bg-red-600 hover:bg-red-700 shadow-red-500/25 hover:shadow-red-600/40"
            }`}
          >
            <AlertOctagon className="w-4 h-4 fill-white text-red-600 stroke-2" />
            <span>{eStopTriggered ? "STOP ENGAGED" : "EMERGENCY STOP"}</span>
          </button>
        </div>
      </header>
    </div>
  );
};
