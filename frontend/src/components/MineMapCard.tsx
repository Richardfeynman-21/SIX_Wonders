"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Navigation, 
  ShieldAlert, 
  Sparkles,
  X,
  Radio,
  Send,
  Check,
  Maximize2
} from "lucide-react";
import { RoverCombinedStatus } from "@/types/telemetry";

interface MineMapCardProps {
  telemetry?: RoverCombinedStatus;
  onOpenModal?: () => void;
}

interface MapLayerState {
  path: boolean;
  hazards: boolean;
  checkpoints: boolean;
  obstacles: boolean;
  grid: boolean;
}

export const MineMapCard: React.FC<MineMapCardProps> = ({ telemetry, onOpenModal }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [layersOpen, setLayersOpen] = useState<boolean>(false);
  const [layers, setLayers] = useState<MapLayerState>({
    path: true,
    hazards: true,
    checkpoints: true,
    obstacles: true,
    grid: true,
  });
  const [selectedPin, setSelectedPin] = useState<string | null>("rakshak-mine");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(Math.round((prev + 0.25) * 100) / 100, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(Math.round((prev - 0.25) * 100) / 100, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  // Traversed Path coordinates
  const pathPoints = [
    { x: 30, y: 72 },
    { x: 34, y: 70 },
    { x: 38, y: 64 },
    { x: 44, y: 56 },
    { x: 50, y: 48 },
    { x: 58, y: 44 },
    { x: 67, y: 46 },
    { x: 73, y: 40 },
    { x: 81, y: 38 },
  ];

  const svgPathData = pathPoints.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  // Key map markers
  const markers = [
    {
      id: "rakshak-mine",
      type: "rover",
      name: "RAKSHAK-Mine (Current)",
      x: 34,
      y: 70,
      depth: "-310 m",
      status: telemetry?.motor_state || "MANUAL",
      distanceFromRover: "0.0 m (Origin)",
      details: "RAKSHAK-Mine surface rescue rover scanning Incline Drift 4B. Ultrasonic clear at 1.2m.",
    },
    {
      id: "hazard-01",
      type: "hazard",
      name: "Hazard: High Strata Stress",
      x: 48,
      y: 35,
      depth: "-325 m",
      status: "CRITICAL RISK",
      distanceFromRover: "28.4 m North-East",
      details: "Rockfall alert. Micro-fissures and acoustic strata stress detected via YOLOv8 inspection.",
    },
    {
      id: "checkpoint-01",
      type: "checkpoint",
      name: "Shaft Checkpoint Charlie",
      x: 28,
      y: 32,
      depth: "-290 m",
      status: "SECURED & SAFE",
      distanceFromRover: "19.2 m North-West",
      details: "Auxiliary ventilation shaft #3. Airflow nominal at 1.8 m/s with fresh air intake.",
    },
    {
      id: "checkpoint-02",
      type: "checkpoint",
      name: "Substation Relay Alpha",
      x: 65,
      y: 45,
      depth: "-312 m",
      status: "LORA CONNECTED",
      distanceFromRover: "36.8 m East",
      details: "Subterranean LoRa sub-repeater node online with -68 dBm signal strength.",
    },
    {
      id: "obstacle-01",
      type: "obstacle",
      name: "Debris Obstacle #1",
      x: 76,
      y: 41,
      depth: "-315 m",
      status: "BLOCKED ROUTE",
      distanceFromRover: "44.5 m East",
      details: "Collapsed timber support beam and aggregate pile (1.2m width). Auto-brake armed.",
    },
    {
      id: "exit-01",
      type: "exit",
      name: "Main Incline Drift Portal",
      x: 88,
      y: 36,
      depth: "-240 m",
      status: "EVACUATION ROUTE",
      distanceFromRover: "58.1 m North-East",
      details: "Primary egress portal leading to Surface Command Station and fresh air base.",
    },
  ];

  const activeMarker = markers.find((m) => m.id === selectedPin) || markers[0];

  return (
    <div className="mg-card p-3 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
            <Navigation className="w-4 h-4 transform -rotate-45" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">
              Mine Map &amp; RAKSHAK Location
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Sector 4B Subterranean Drift | Interactive Spatial Grid
            </p>
          </div>
        </div>

        {/* Live status badge & Full View button */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Grid
          </span>
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              title="Expand Full Mine Map"
              className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative w-full flex-1 min-h-[220px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 select-none">
        {/* Transform container for smooth zoom */}
        <div
          className="w-full h-full relative transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subterranean Vector Drift Blueprint */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="mineRockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B132B" />
                <stop offset="50%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#0B1120" />
              </linearGradient>

              <linearGradient id="glowingPath" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>

              <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#38BDF8" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Subterranean Background */}
            <rect width="100" height="100" fill="url(#mineRockGrad)" />

            {/* Geotechnical Survey Coordinate Grid */}
            {layers.grid && (
              <g stroke="rgba(148, 163, 184, 0.09)" strokeWidth="0.3" strokeDasharray="1,2">
                <line x1="15" y1="0" x2="15" y2="100" />
                <line x1="30" y1="0" x2="30" y2="100" />
                <line x1="45" y1="0" x2="45" y2="100" />
                <line x1="60" y1="0" x2="60" y2="100" />
                <line x1="75" y1="0" x2="75" y2="100" />
                <line x1="90" y1="0" x2="90" y2="100" />
                <line x1="0" y1="20" x2="100" y2="20" />
                <line x1="0" y1="40" x2="100" y2="40" />
                <line x1="0" y1="60" x2="100" y2="60" />
                <line x1="0" y1="80" x2="100" y2="80" />
              </g>
            )}

            {/* Underground Gallery Corridors */}
            <g stroke="#1E293B" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 12 18 L 32 30 L 46 36 L 62 44 L 78 40 L 92 34" />
              <path d="M 32 30 L 26 48 L 30 72 L 40 82" />
              <path d="M 46 36 L 48 58 L 38 68" />
              <path d="M 62 44 L 66 66 L 80 72" />
              <path d="M 78 40 L 84 20 L 72 16" />
            </g>

            {/* Inner Tunnel Track Clearance */}
            <g stroke="#0F172A" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 12 18 L 32 30 L 46 36 L 62 44 L 78 40 L 92 34" />
              <path d="M 32 30 L 26 48 L 30 72 L 40 82" />
              <path d="M 46 36 L 48 58 L 38 68" />
              <path d="M 62 44 L 66 66 L 80 72" />
              <path d="M 78 40 L 84 20 L 72 16" />
            </g>

            {/* Railway Track Dotted Centerline */}
            <g stroke="#334155" strokeWidth="0.7" strokeDasharray="1.5,1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 12 18 L 32 30 L 46 36 L 62 44 L 78 40 L 92 34" />
              <path d="M 32 30 L 26 48 L 30 72 L 40 82" />
              <path d="M 46 36 L 48 58 L 38 68" />
              <path d="M 62 44 L 66 66 L 80 72" />
            </g>

            {/* Drift Intersection Hub Circles */}
            {[
              { x: 32, y: 30 },
              { x: 46, y: 36 },
              { x: 62, y: 44 },
              { x: 78, y: 40 },
              { x: 26, y: 48 },
              { x: 48, y: 58 },
              { x: 66, y: 66 },
            ].map((hub, i) => (
              <circle key={i} cx={hub.x} cy={hub.y} r="2.2" fill="#1E293B" stroke="#334155" strokeWidth="0.5" />
            ))}

            {/* Traversed Path Layer */}
            {layers.path && (
              <g>
                <path
                  d={svgPathData}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.35"
                  filter="url(#vectorGlow)"
                />
                <path
                  d={svgPathData}
                  fill="none"
                  stroke="url(#glowingPath)"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pathPoints.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="1.2"
                    fill="#38BDF8"
                    stroke="#0369A1"
                    strokeWidth="0.5"
                  />
                ))}
              </g>
            )}
          </svg>

          {/* HTML Overlay for Interactive Pins */}
          <div className="absolute inset-0 pointer-events-auto">
            {/* RAKSHAK-Mine Pin (Animated Pulsing) */}
            {layers.path && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                style={{ left: `34%`, top: `70%` }}
                onClick={() => setSelectedPin(selectedPin === "rakshak-mine" ? null : "rakshak-mine")}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-sky-500/35 animate-ping" />
                  <div className="absolute w-5 h-5 rounded-full bg-sky-400/50 animate-pulse" />
                  <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                  <div className="bg-slate-900/95 text-white text-[10px] rounded px-2.5 py-1 shadow-xl border border-sky-500 whitespace-nowrap">
                    <p className="font-bold text-sky-400">● RAKSHAK-Mine (Current)</p>
                    <p className="text-slate-300">Depth: -310 m | 420m traveled</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hazard Pin */}
            {layers.hazards && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ left: `48%`, top: `35%` }}
                onClick={() => setSelectedPin(selectedPin === "hazard-01" ? null : "hazard-01")}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-5 h-5 rounded-full bg-red-500/40 animate-ping" />
                  <div className="w-4 h-4 rounded-full bg-red-600 border border-white text-white flex items-center justify-center shadow-md">
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                  <div className="bg-slate-900/95 text-white text-[10px] rounded px-2.5 py-1 shadow-xl border border-red-500 whitespace-nowrap">
                    <p className="font-bold text-red-400">⚠️ Hazard: Rockfall Risk</p>
                    <p className="text-slate-300">Strata shift detected at -325 m</p>
                  </div>
                </div>
              </div>
            )}

            {/* Checkpoint Pin 1 */}
            {layers.checkpoints && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ left: `28%`, top: `32%` }}
                onClick={() => setSelectedPin(selectedPin === "checkpoint-01" ? null : "checkpoint-01")}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-600 border border-white text-white flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-2.5 h-2.5" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                  <div className="bg-slate-900/95 text-white text-[10px] rounded px-2.5 py-1 shadow-xl border border-emerald-500 whitespace-nowrap">
                    <p className="font-bold text-emerald-400">■ Checkpoint Charlie</p>
                    <p className="text-slate-300">Shaft 3 Secured</p>
                  </div>
                </div>
              </div>
            )}

            {/* Checkpoint Pin 2 */}
            {layers.checkpoints && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ left: `65%`, top: `45%` }}
                onClick={() => setSelectedPin(selectedPin === "checkpoint-02" ? null : "checkpoint-02")}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-2.5 h-2.5" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                  <div className="bg-slate-900/95 text-white text-[10px] rounded px-2 py-1 shadow-xl border border-emerald-400 whitespace-nowrap">
                    <p className="font-bold text-emerald-300">● Substation Relay Alpha</p>
                    <p className="text-slate-300">LoRa Node Active</p>
                  </div>
                </div>
              </div>
            )}

            {/* Obstacle Pin */}
            {layers.obstacles && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ left: `76%`, top: `41%` }}
                onClick={() => setSelectedPin(selectedPin === "obstacle-01" ? null : "obstacle-01")}
              >
                <div className="w-4 h-4 rounded-full bg-amber-500 border border-white text-white flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-black leading-none">!</span>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                  <div className="bg-slate-900/95 text-white text-[10px] rounded px-2.5 py-1 shadow-xl border border-amber-500 whitespace-nowrap">
                    <p className="font-bold text-amber-400">✖ Obstacle: Debris (1.2m)</p>
                    <p className="text-slate-300">Auto-brake standby</p>
                  </div>
                </div>
              </div>
            )}

            {/* Exit Pin */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              style={{ left: `88%`, top: `36%` }}
              onClick={() => setSelectedPin(selectedPin === "exit-01" ? null : "exit-01")}
            >
              <div className="w-4 h-4 bg-indigo-600 border border-white text-white flex items-center justify-center rounded-sm shadow-sm rotate-45">
                <span className="text-[8px] font-bold -rotate-45 leading-none">E</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-slate-900/95 text-white text-[10px] rounded px-2.5 py-1 shadow-xl border border-indigo-400 whitespace-nowrap">
                  <p className="font-bold text-indigo-300">▲ Incline Drift Exit</p>
                  <p className="text-slate-300">Surface Egress Portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP-LEFT OVERLAY: Semi-transparent dark HUD Legend */}
        <div className="absolute top-2 left-2 z-30 bg-slate-900/85 backdrop-blur-md rounded-md p-1.5 border border-slate-700/60 text-[10px] text-slate-200 shadow-md pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>RAKSHAK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-500" />
              <span>Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
              <span>Hazard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Checkpoint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-indigo-400 rotate-45" />
              <span>Exit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Obstacle</span>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT OVERLAY: Interactive Zoom (+, -, Reset) & Layer Toggle */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-1.5">
          {/* Zoom Controls Bar */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/80 p-0.5 flex items-center shadow-lg">
            <button
              onClick={handleZoomIn}
              title="Zoom In (+25%)"
              className="p-1.5 rounded hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-25%)"
              className="p-1.5 rounded hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom to 100%"
              className="px-1.5 py-1 rounded hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors font-mono text-[10px] font-bold border-l border-slate-700 flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{Math.round(zoomLevel * 100)}%</span>
            </button>
          </div>

          {/* Layer Toggle Button & Dropdown */}
          <div className="relative self-end">
            <button
              onClick={() => setLayersOpen(!layersOpen)}
              title="Toggle Subterranean Map Layers"
              className={`p-1.5 rounded-lg border shadow-lg backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer text-xs ${
                layersOpen
                  ? "bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/30"
                  : "bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold pr-0.5">Layers</span>
            </button>

            {/* Layer toggles dropdown checklist */}
            {layersOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 p-2.5 shadow-2xl z-50 text-xs text-slate-200 flex flex-col gap-2 animate-in fade-in zoom-in-95">
                <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800 pb-1 flex justify-between items-center">
                  <span>Toggle Map Layers</span>
                  <button onClick={() => setLayersOpen(false)} className="text-slate-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={layers.path}
                    onChange={(e) => setLayers({ ...layers, path: e.target.checked })}
                    className="rounded text-sky-500 focus:ring-0 w-3.5 h-3.5 bg-slate-800 border-slate-600"
                  />
                  <span>Traversed Path</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={layers.hazards}
                    onChange={(e) => setLayers({ ...layers, hazards: e.target.checked })}
                    className="rounded text-red-500 focus:ring-0 w-3.5 h-3.5 bg-slate-800 border-slate-600"
                  />
                  <span>Hazard Zones</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={layers.checkpoints}
                    onChange={(e) => setLayers({ ...layers, checkpoints: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0 w-3.5 h-3.5 bg-slate-800 border-slate-600"
                  />
                  <span>Checkpoints</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={layers.obstacles}
                    onChange={(e) => setLayers({ ...layers, obstacles: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0 w-3.5 h-3.5 bg-slate-800 border-slate-600"
                  />
                  <span>Obstacles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={layers.grid}
                    onChange={(e) => setLayers({ ...layers, grid: e.target.checked })}
                    className="rounded text-slate-400 focus:ring-0 w-3.5 h-3.5 bg-slate-800 border-slate-600"
                  />
                  <span>Cartesian Grid</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM-LEFT OVERLAY: Depth View Indicator */}
        <div className="absolute bottom-2 left-2 z-30 bg-slate-900/85 backdrop-blur-md rounded px-2 py-0.5 border border-slate-700/60 text-[11px] font-medium text-slate-300 shadow-md pointer-events-none">
          <span>Depth View: </span>
          <span className="font-bold text-white">-310 m</span>
        </div>

        {/* BOTTOM-RIGHT OVERLAY: Scale Indicator */}
        <div className="absolute bottom-2 right-2 z-30 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md rounded px-2 py-0.5 border border-slate-700/60 shadow-md text-[10px] text-slate-300 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="leading-none text-[9px] font-mono">50 m</span>
            <div className="w-8 h-1 border-b-2 border-l-2 border-r-2 border-white/80 mt-0.5" />
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE WAYPOINT DETAILS CARD */}
      {selectedPin && activeMarker && (
        <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col gap-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {activeMarker.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                {activeMarker.depth}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                {activeMarker.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-600 text-[11px] leading-snug">
            {activeMarker.details}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10.5px]">
            <span className="text-slate-500 font-mono">
              Distance: <strong className="text-slate-800">{activeMarker.distanceFromRover}</strong>
            </span>

            {actionFeedback ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {actionFeedback}
              </span>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActionFeedback(`Waypoint ${activeMarker.name} set as navigation target`);
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] shadow-sm cursor-pointer"
                >
                  Navigate Here
                </button>
                <button
                  onClick={() => {
                    setActionFeedback(`Acoustic transponder pinged at ${activeMarker.depth}`);
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[10px] cursor-pointer"
                >
                  Ping Transponder
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MineMapCard;
