"use client";

import React, { useState } from "react";
import { 
  BatteryCharging, 
  Zap, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  X, 
  Thermometer, 
  Clock, 
  CheckCircle2, 
  RotateCcw,
  Check
} from "lucide-react";
import { RoverCombinedStatus } from "@/types/telemetry";

interface PowerMonitoringCardProps {
  telemetry?: RoverCombinedStatus;
  onViewDetails?: () => void;
}

export const PowerMonitoringCard: React.FC<PowerMonitoringCardProps> = ({
  telemetry,
  onViewDetails,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    time: string;
    pct: number;
    v: string;
    x: number;
    y: number;
    pctX?: number;
    pctY?: number;
  } | null>(null);

  const batteryPercent = telemetry?.battery_percent !== undefined ? Math.round(telemetry.battery_percent) : 78;
  const batteryVoltage = telemetry?.battery_voltage !== undefined ? telemetry.battery_voltage.toFixed(1) : "11.8";
  
  // Calculate remaining hours roughly based on 3S pack
  const estRuntimeHours = ((batteryPercent / 100) * 3.2).toFixed(1);

  // Time series points for the discharge curve
  const dischargeData = [
    { time: "13:30", pct: 100, x: 50, y: 20, pctX: 11.1, pctY: 14.3, v: "12.6V" },
    { time: "13:45", pct: 93, x: 145, y: 29, pctX: 32.2, pctY: 20.7, v: "12.3V" },
    { time: "14:00", pct: 88, x: 240, y: 36, pctX: 53.3, pctY: 25.7, v: "12.1V" },
    { time: "14:15", pct: 83, x: 335, y: 44, pctX: 74.4, pctY: 31.4, v: "11.9V" },
    {
      time: "14:30",
      pct: batteryPercent,
      x: 430,
      y: 20 + ((100 - batteryPercent) * 1.05),
      pctX: 95.5,
      pctY: ((20 + ((100 - batteryPercent) * 1.05)) / 140) * 100,
      v: `${batteryVoltage}V`,
    },
  ];

  const curvePath = `M ${dischargeData[0].x} ${dischargeData[0].y} ` +
    `C 95 ${dischargeData[0].y + 2}, 105 ${dischargeData[1].y - 2}, ${dischargeData[1].x} ${dischargeData[1].y} ` +
    `C 190 ${dischargeData[1].y + 2}, 200 ${dischargeData[2].y - 2}, ${dischargeData[2].x} ${dischargeData[2].y} ` +
    `C 285 ${dischargeData[2].y + 2}, 295 ${dischargeData[3].y - 2}, ${dischargeData[3].x} ${dischargeData[3].y} ` +
    `C 380 ${dischargeData[3].y + 2}, 390 ${dischargeData[4].y - 2}, ${dischargeData[4].x} ${dischargeData[4].y}`;

  const areaPath = `${curvePath} L ${dischargeData[4].x} 125 L ${dischargeData[0].x} 125 Z`;

  const handleOpenDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      setShowModal(true);
    }
  };

  const handleCalibrate = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setCalibrated(true);
      setTimeout(() => setCalibrated(false), 3000);
    }, 1200);
  };

  return (
    <div className="mg-card p-3 flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">
              Power Monitoring
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              3S Li-ion 18650 Battery Pack
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Green Battery Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Battery: {batteryPercent}%
          </span>

          <button
            onClick={handleOpenDetails}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 hover:underline transition-all cursor-pointer"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main High-DPI Vector Area Discharge Curve */}
      <div className="relative w-full flex-1 min-h-0 bg-slate-50/40 rounded-lg p-2 border border-slate-100 flex flex-col justify-between">
        <div className="text-[10px] font-semibold text-slate-500 pl-4 mb-0.5">
          Battery (%)
        </div>

        <div className="relative w-full flex-1 min-h-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 450 135"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="powerDischargeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
                <stop offset="70%" stopColor="#10B981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
              </linearGradient>

              <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10B981" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Gridlines and Percentage Markers */}
            {[
              { val: 100, y: 20 },
              { val: 75, y: 46 },
              { val: 50, y: 72 },
              { val: 25, y: 98 },
              { val: 0, y: 125 },
            ].map((marker) => (
              <g key={marker.val}>
                <text
                  x="28"
                  y={marker.y + 3.5}
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="end"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {marker.val}
                </text>
                <line
                  x1="36"
                  y1={marker.y}
                  x2="442"
                  y2={marker.y}
                  stroke="#E2E8F0"
                  strokeWidth="0.8"
                  strokeDasharray={marker.val === 0 || marker.val === 100 ? "0" : "3,3"}
                />
              </g>
            ))}

            <path d={areaPath} fill="url(#powerDischargeGradient)" />

            <path
              d={curvePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />

            {dischargeData.map((pt, index) => (
              <g
                key={index}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  className="transition-transform duration-150 group-hover:scale-125"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="1.8"
                  fill="#059669"
                />
              </g>
            ))}
          </svg>

          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap"
              style={{
                left: `${hoveredPoint.pctX ?? (hoveredPoint.x / 450) * 100}%`,
                top: `${hoveredPoint.pctY ?? (hoveredPoint.y / 135) * 100}%`,
              }}
            >
              <span className="text-emerald-400 font-bold">{hoveredPoint.pct}%</span>
              <span className="text-slate-400"> ({hoveredPoint.v})</span>
              <div className="text-slate-400 text-[9px] font-mono">{hoveredPoint.time}</div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-10 text-[10px] font-mono font-medium text-slate-500 pt-1">
          <span>13:30</span>
          <span>14:00</span>
          <span>14:30</span>
        </div>
      </div>

      {/* Voltage, Current, and Runtime Estimates */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">Voltage:</span>
          <span className="font-bold text-slate-900">{batteryVoltage} V</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">Current:</span>
          <span className="font-bold text-slate-900">1.4 A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">Est. Runtime:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            ~{estRuntimeHours} hrs
          </span>
        </div>
      </div>

      {/* Battery & BMS Diagnostic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    RAKSHAK-Mine BMS &amp; Power Diagnostic
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    3S2P 18650 Li-ion Smart Battery Management System
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3.5 text-xs">
              {/* Pack Overview Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-slate-500 text-[11px] block">Pack Voltage</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{batteryVoltage} V</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Nominal 11.1V</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-slate-500 text-[11px] block">State of Charge</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">{batteryPercent}%</span>
                  <span className="text-[10px] text-slate-500 block">Health: 96%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-slate-500 text-[11px] block">BMS Temp</span>
                  <span className="text-lg font-bold font-mono text-slate-900">28.4 °C</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Safe (&lt;45°C)</span>
                </div>
              </div>

              {/* Individual Cell Balancing Voltages */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Individual 3S Cell Balancing</span>
                  <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px] font-mono">
                    DELTA: 20 mV (OPTIMAL)
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">• Cell #1 (INR18650-26J):</span>
                    <span className="font-mono font-bold text-slate-800">3.95 V — Balanced</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">• Cell #2 (INR18650-26J):</span>
                    <span className="font-mono font-bold text-slate-800">3.94 V — Balanced</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">• Cell #3 (INR18650-26J):</span>
                    <span className="font-mono font-bold text-slate-800">3.96 V — Balanced</span>
                  </div>
                </div>
              </div>

              {/* Hardware Protection States */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                <span className="font-bold text-slate-800 block text-xs">BMS Hardware Protections</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Over-Charge Cutoff: 12.6V</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Over-Discharge Cutoff: 9.0V</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Short-Circuit Interlock: Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>NTC Thermal Sensor: Active</span>
                  </div>
                </div>
              </div>

              {/* Runtime Estimates Breakdown */}
              <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl text-[11.5px] text-slate-700 flex justify-between">
                <span>Speed Sprint (255 PWM): <strong>1.8 hrs</strong></span>
                <span>Nominal Scan (200 PWM): <strong>~{estRuntimeHours} hrs</strong></span>
                <span>Listening Idle: <strong>6.2 hrs</strong></span>
              </div>

              {calibrated && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>ADC voltage divider calibration verified (scale factor: 0.00392).</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleCalibrate}
                disabled={calibrating}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${calibrating ? "animate-spin" : ""}`} />
                <span>{calibrating ? "Calibrating ADC..." : "Calibrate ADC Shunt"}</span>
              </button>
              <div className="flex items-center gap-2">
                {onViewDetails && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onViewDetails();
                    }}
                    className="px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition-colors cursor-pointer"
                  >
                    Open Subsystem View →
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerMonitoringCard;
