"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Compass,
  Zap,
  Volume2,
  VolumeX,
  Lightbulb,
  LightbulbOff,
  AlertOctagon,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Radio,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { RoverCombinedStatus, MotorCommand } from "@/types/telemetry";
import { sendRoverCommand } from "@/lib/api";

interface RoverControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry?: RoverCombinedStatus;
}

export const RoverControlModal: React.FC<RoverControlModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [speed, setSpeed] = useState<number>(200);
  const [activeCommand, setActiveCommand] = useState<string>("STOP");
  const [buzzerActive, setBuzzerActive] = useState<boolean>(telemetry?.buzzer_active ?? false);
  const [lightActive, setLightActive] = useState<boolean>(telemetry?.searchlight_active ?? true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastAck, setLastAck] = useState<string>("IDLE");

  // Keep synced with telemetry
  useEffect(() => {
    if (telemetry?.buzzer_active !== undefined) setBuzzerActive(telemetry.buzzer_active);
    if (telemetry?.searchlight_active !== undefined) setLightActive(telemetry.searchlight_active);
  }, [telemetry?.buzzer_active, telemetry?.searchlight_active]);

  const dispatchCommand = useCallback(
    async (cmd: MotorCommand, spd: number = speed) => {
      setActiveCommand(cmd);
      setIsSending(true);
      try {
        const res = await sendRoverCommand(cmd, spd);
        setLastAck(`${cmd} (${res.status})`);
      } catch (err) {
        console.error("Command dispatch error:", err);
        setLastAck(`ERR: ${cmd}`);
      } finally {
        setIsSending(false);
      }
    },
    [speed]
  );

  const toggleBuzzer = async () => {
    const nextState = !buzzerActive;
    setBuzzerActive(nextState);
    await dispatchCommand(nextState ? "BUZZER_ON" : "BUZZER_OFF", 0);
  };

  const toggleLight = async () => {
    const nextState = !lightActive;
    setLightActive(nextState);
    await dispatchCommand(nextState ? "LIGHT_ON" : "LIGHT_OFF", 0);
  };

  const handleEStop = async () => {
    await dispatchCommand("STOP", 0);
  };

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "KeyW", "KeyS", "KeyA", "KeyD"].includes(e.code)) {
        e.preventDefault();
      }
      if (e.repeat) return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          dispatchCommand("FORWARD");
          break;
        case "KeyS":
        case "ArrowDown":
          dispatchCommand("BACKWARD");
          break;
        case "KeyA":
        case "ArrowLeft":
          dispatchCommand("LEFT");
          break;
        case "KeyD":
        case "ArrowRight":
          dispatchCommand("RIGHT");
          break;
        case "Space":
          dispatchCommand("STOP", 0);
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, dispatchCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                RAKSHAK-Mine Tactical Teleoperation Cockpit
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Online
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                RAKSHAK-Mine | Dual-Bridge L298N Drive | 9V DC Geared Motors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Propulsion Speed PWM
            </label>
            <span className="font-mono font-bold text-sky-400 text-sm">
              {speed} PWM ({Math.round((speed / 255) * 100)}%)
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="255"
            step="5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-sky-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>Crawl (100)</span>
            <span>Nominal (200)</span>
            <span>Sprint (255)</span>
          </div>
        </div>

        {/* Directional Keypad (3x3 Grid) */}
        <div className="flex flex-col items-center mb-6">
          <div className="grid grid-cols-3 gap-3 w-56">
            {/* Top Empty */}
            <div />
            {/* FORWARD */}
            <button
              onClick={() => dispatchCommand("FORWARD")}
              className={`flex flex-col items-center justify-center h-16 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                activeCommand === "FORWARD"
                  ? "bg-sky-500 text-white ring-2 ring-sky-300 shadow-sky-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-[10px] mt-0.5">FWD (W)</span>
            </button>
            <div />

            {/* LEFT */}
            <button
              onClick={() => dispatchCommand("LEFT")}
              className={`flex flex-col items-center justify-center h-16 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                activeCommand === "LEFT"
                  ? "bg-sky-500 text-white ring-2 ring-sky-300 shadow-sky-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-[10px] mt-0.5">LEFT (A)</span>
            </button>

            {/* STOP */}
            <button
              onClick={() => dispatchCommand("STOP", 0)}
              className={`flex flex-col items-center justify-center h-16 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                activeCommand === "STOP"
                  ? "bg-rose-600 text-white ring-2 ring-rose-400 shadow-rose-600/40"
                  : "bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/60"
              }`}
            >
              <Square className="w-6 h-6 fill-current" />
              <span className="text-[10px] mt-0.5">STOP (Space)</span>
            </button>

            {/* RIGHT */}
            <button
              onClick={() => dispatchCommand("RIGHT")}
              className={`flex flex-col items-center justify-center h-16 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                activeCommand === "RIGHT"
                  ? "bg-sky-500 text-white ring-2 ring-sky-300 shadow-sky-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <ArrowRight className="w-6 h-6" />
              <span className="text-[10px] mt-0.5">RIGHT (D)</span>
            </button>

            {/* Bottom Empty */}
            <div />
            {/* REVERSE */}
            <button
              onClick={() => dispatchCommand("BACKWARD")}
              className={`flex flex-col items-center justify-center h-16 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                activeCommand === "BACKWARD"
                  ? "bg-sky-500 text-white ring-2 ring-sky-300 shadow-sky-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-[10px] mt-0.5">REV (S)</span>
            </button>
            <div />
          </div>
        </div>

        {/* Tactical Subsystem Toggles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Searchlight Toggle */}
          <button
            onClick={toggleLight}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              lightActive
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20 shadow-md"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {lightActive ? <Lightbulb className="w-4 h-4" /> : <LightbulbOff className="w-4 h-4" />}
            Searchlight: {lightActive ? "ON" : "OFF"}
          </button>

          {/* Siren Beacon Toggle */}
          <button
            onClick={toggleBuzzer}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              buzzerActive
                ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20 shadow-md animate-pulse"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {buzzerActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Siren Beacon: {buzzerActive ? "ON" : "OFF"}
          </button>
        </div>

        {/* Emergency Stop Strip */}
        <button
          onClick={handleEStop}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-700/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <AlertOctagon className="w-5 h-5" />
          EMERGENCY BRAKE & MOTOR DISARM
        </button>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Status: {activeCommand} ({lastAck})
          </span>
          <span>Obstacle Stop: &lt;18 cm</span>
        </div>
      </div>
    </div>
  );
};
