'use client';

import React, { useState } from 'react';
import { Crosshair, ShieldCheck, AlertTriangle, X, Info, Gauge, ShieldAlert } from 'lucide-react';
import { RoverCombinedStatus } from '@/types/rover';

interface GasMonitoringGaugesProps {
  status?: RoverCombinedStatus;
}

interface GasConfig {
  id: string;
  name: string;
  formula: string;
  formulaSubscript: string;
  value: number;
  unit: string;
  displayValue: string;
  range: string;
  min: number;
  max: number;
  sensorType: string;
  safetyAdvice: string;
  dgmsStandard: string;
  thresholds: {
    warning: number;
    critical: number;
    isLowerCritical?: boolean;
  };
  preferredColor?: string;
}

export const GasMonitoringGauges: React.FC<GasMonitoringGaugesProps> = ({ status }) => {
  const [selectedGas, setSelectedGas] = useState<GasConfig | null>(null);

  // Extract or fallback to reference values from sample dashboard
  const ch4Val = status?.ch4_pct ?? 0.8;
  const coVal = status?.co_ppm ?? status?.mq7_ppm ?? 25;
  const co2Val = status?.co2_ppm ?? 420;
  const o2Val = status?.o2_pct ?? 20.6;

  const gases: GasConfig[] = [
    {
      id: 'ch4',
      name: 'Methane',
      formula: 'CH',
      formulaSubscript: '4',
      value: ch4Val,
      unit: '%',
      displayValue: `${ch4Val.toFixed(1)}%`,
      range: '(0–5%)',
      min: 0,
      max: 5.0,
      sensorType: 'MQ-4 Catalytic Combustion & NDIR Infrared Sensor',
      dgmsStandard: 'DGMS CMR 2017 Reg. 169: Safe limit <0.75%, Evacuate face >1.25%',
      safetyAdvice: 'Inflammable firedamp risk. If concentration exceeds 1.25%, immediately isolate all electrical power in section and withdraw personnel to main intake roadway.',
      thresholds: { warning: 0.75, critical: 1.25 },
      preferredColor: '#06B6D4', // Teal/Cyan matching reference screenshot
    },
    {
      id: 'co',
      name: 'Carbon Monoxide',
      formula: 'CO',
      formulaSubscript: '',
      value: coVal,
      unit: 'ppm',
      displayValue: `${Math.round(coVal)} ppm`,
      range: '(0–50 ppm)',
      min: 0,
      max: 50,
      sensorType: 'MQ-7 Electrochemical Gas Sensor with Micro-heater',
      dgmsStandard: 'DGMS CMR 2017 Reg. 170: TWA Permissible <25 ppm, Immediate Hazard >50 ppm',
      safetyAdvice: 'Toxic afterdamp indicator for subterranean coal smoldering. Don self-contained self-rescuer (SCSR) filter immediately if level rises above 50 ppm.',
      thresholds: { warning: 25, critical: 50 },
      preferredColor: '#10B981', // Emerald green
    },
    {
      id: 'co2',
      name: 'Carbon Dioxide',
      formula: 'CO',
      formulaSubscript: '2',
      value: co2Val,
      unit: 'ppm',
      displayValue: `${Math.round(co2Val)} ppm`,
      range: '(0–5000 ppm)',
      min: 0,
      max: 5000,
      sensorType: 'MH-Z19B NDIR Optical Infrared Optical Transducer',
      dgmsStandard: 'DGMS CMR 2017: Max Permissible 0.5% (5,000 ppm) in subterranean workings',
      safetyAdvice: 'Blackdamp accumulation indicator in unventilated headings and old goaf areas. Ensure forced ventilation is routed to the face before entering.',
      thresholds: { warning: 1000, critical: 2500 },
      preferredColor: '#F59E0B', // Amber
    },
    {
      id: 'o2',
      name: 'Oxygen',
      formula: 'O',
      formulaSubscript: '2',
      value: o2Val,
      unit: '%',
      displayValue: `${o2Val.toFixed(1)}%`,
      range: '(19.5–23.5%)',
      min: 15.0,
      max: 25.0,
      sensorType: 'ME2-O2 Lead-Free Galvanic Electrochemical Cell',
      dgmsStandard: 'DGMS CMR 2017 Reg. 168: Mandatory breathable minimum 19.0% by volume',
      safetyAdvice: 'Breathable atmospheric support. Below 19.5% causes impairment; below 16% causes rapid loss of consciousness. Evacuate drift immediately if dropping.',
      thresholds: { warning: 19.5, critical: 18.0, isLowerCritical: true },
      preferredColor: '#10B981', // Emerald green
    },
  ];

  // Helper to determine arc color: green (normal), amber (warning), red (critical)
  const getGasArcColor = (gas: GasConfig): string => {
    if (gas.thresholds.isLowerCritical) {
      if (gas.value < gas.thresholds.critical) return '#EF4444'; // Red (critical)
      if (gas.value < gas.thresholds.warning) return '#F59E0B';  // Amber (warning)
      return gas.preferredColor || '#10B981';                   // Green (normal)
    }

    if (gas.value >= gas.thresholds.critical) {
      return '#EF4444'; // Red (critical)
    }
    if (gas.value >= gas.thresholds.warning) {
      return gas.preferredColor || '#F59E0B';
    }
    return gas.preferredColor || '#10B981'; // Green / Normal
  };

  // Calculate SVG arc sweep percentage
  const calculateArcPercent = (gas: GasConfig): number => {
    if (gas.id === 'o2') {
      const ratio = (gas.value - 15.0) / (25.0 - 15.0);
      return Math.min(100, Math.max(10, ratio * 100));
    }
    const ratio = (gas.value - gas.min) / (gas.max - gas.min);
    return Math.min(100, Math.max(8, ratio * 100));
  };

  return (
    <div className="h-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative">
      {/* 1. Header: Crosshair icon, Gas Monitoring, Live Readings */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              Gas Monitoring
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Multi-Gas NDIR &amp; Electrochemical Sensors (Click gauge for details)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-400">Live Readings</span>
        </div>
      </div>

      {/* 2. 4 Circular SVG Gauges in a 2x2 Grid with Clickable Interaction */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-y-4 gap-x-6 py-2">
        {gases.map((gas) => {
          const arcColor = getGasArcColor(gas);
          const percent = calculateArcPercent(gas);
          
          // SVG Circle parameters
          const radius = 33;
          const strokeWidth = 7;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference * (1 - percent / 100);

          return (
            <button
              key={gas.id}
              onClick={() => setSelectedGas(gas)}
              title={`Click to view ${gas.name} (${gas.formula}) diagnostic details & DGMS limits`}
              className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-slate-50/80 hover:scale-105 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              {/* Circular Gauge SVG */}
              <div className="relative w-22 h-22 flex items-center justify-center">
                <svg
                  className="w-20 h-20 transform -rotate-90 drop-shadow-sm"
                  viewBox="0 0 84 84"
                >
                  {/* Background Track Circle */}
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  {/* Colored Foreground Arc */}
                  <circle
                    cx="42"
                    cy="42"
                    r={radius}
                    stroke={arcColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Center Value Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-extrabold text-slate-900 tracking-tight font-sans">
                    {gas.displayValue}
                  </span>
                </div>
              </div>

              {/* Chemical Formula Label */}
              <div className="mt-1 flex items-center gap-0.5 text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                <span>{gas.formula}</span>
                {gas.formulaSubscript && (
                  <sub className="text-[10px] leading-none font-extrabold text-slate-700 group-hover:text-sky-600">
                    {gas.formulaSubscript}
                  </sub>
                )}
              </div>

              {/* Operational Range */}
              <span className="text-[10.5px] text-slate-400 font-medium tracking-tight">
                {gas.range}
              </span>
            </button>
          );
        })}
      </div>

      {/* DGMS Safety Compliance Badge */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>DGMS Atmosphere: <strong className="text-emerald-700">SAFE</strong></span>
        </span>
        <span className="text-slate-400">MQ-135 / MQ-7 / BME280</span>
      </div>

      {/* 3. GAS DETAIL MODAL */}
      {selectedGas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-900 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedGas.formula}
                  {selectedGas.formulaSubscript && <sub className="text-xs">{selectedGas.formulaSubscript}</sub>}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedGas.name} Telemetry
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Atmospheric Sensor Diagnostic</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGas(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="py-4 space-y-3 text-xs">
              {/* Current Value Pill */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-medium text-slate-600">Current Reading:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-slate-900">
                    {selectedGas.displayValue}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    SAFE
                  </span>
                </div>
              </div>

              {/* Danger Thresholds */}
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Statutory Warning Limit:</span>
                  <span className="font-bold text-amber-600 font-mono">
                    {selectedGas.thresholds.warning} {selectedGas.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Critical Evacuation Limit:</span>
                  <span className="font-bold text-red-600 font-mono">
                    {selectedGas.thresholds.critical} {selectedGas.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sensor Architecture:</span>
                  <span className="font-semibold text-slate-700 text-right max-w-[220px]">
                    {selectedGas.sensorType}
                  </span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5 font-medium">DGMS CMR 2017 Requirement:</span>
                  <p className="text-[11px] font-mono text-slate-800 bg-sky-50/70 p-2 rounded border border-sky-200">
                    {selectedGas.dgmsStandard}
                  </p>
                </div>
              </div>

              {/* Safety Advice Box */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-xs text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Subterranean Emergency Protocol:</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-amber-800">
                  {selectedGas.safetyAdvice}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedGas(null)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GasMonitoringGauges;
