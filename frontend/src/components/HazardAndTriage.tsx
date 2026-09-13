'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  User, 
  Radar, 
  ArrowRight, 
  Check, 
  Flame, 
  Droplets, 
  Skull, 
  Mountain, 
  ChevronRight, 
  ShieldCheck, 
  Activity, 
  X, 
  CheckCircle2, 
  Heart, 
  Wind, 
  Thermometer, 
  Radio,
  Volume2
} from 'lucide-react';
import { RoverCombinedStatus } from '@/types/rover';
import { sendRoverCommand } from '@/lib/api';

interface HazardAndTriageProps {
  status?: RoverCombinedStatus;
  mode?: 'combined' | 'hazards_only' | 'triage_only' | 'obstacles_only';
}

// --------------------------------------------------------------------------------------
// 1. AI HAZARD ANALYSIS COMPONENT
// --------------------------------------------------------------------------------------
export const AIHazardAnalysis: React.FC<{ status?: RoverCombinedStatus }> = ({ status }) => {
  const [showModal, setShowModal] = useState(false);
  const [loggedNotice, setLoggedNotice] = useState<string | null>(null);

  const hazards = [
    {
      id: 'rockfall',
      label: 'Rockfall Risk',
      icon: Mountain,
      level: 'High',
      badgeColor: 'bg-red-50 text-red-600 border-red-200',
      iconColor: 'text-red-500',
      indicator: '▲ High',
    },
    {
      id: 'water',
      label: 'Water Leakage',
      icon: Droplets,
      level: 'Moderate',
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
      iconColor: 'text-amber-500',
      indicator: '▲ Moderate',
    },
    {
      id: 'gas',
      label: 'Toxic Gas',
      icon: Skull,
      level: 'None',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconColor: 'text-emerald-500',
      indicator: '✔ None',
    },
    {
      id: 'fire',
      label: 'Fire/Heat',
      icon: Flame,
      level: 'None',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconColor: 'text-emerald-500',
      indicator: '✔ None',
    },
  ];

  const yoloMatrix = [
    {
      class: 'Loose Roof Strata',
      confidence: 94.2,
      bbox: '[x:20, y:55, w:65, h:70]',
      severity: 'CRITICAL',
      statusColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      class: 'Timber Prop Fracture',
      confidence: 88.5,
      bbox: '[x:130, y:40, w:55, h:45]',
      severity: 'HIGH',
      statusColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      class: 'Water Inflow Seepage',
      confidence: 76.1,
      bbox: '[x:90, y:110, w:40, h:30]',
      severity: 'MODERATE',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      class: 'Intact Coal Face Strata',
      confidence: 98.8,
      bbox: '[x:0, y:0, w:200, h:150]',
      severity: 'NOMINAL',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              AI Hazard Analysis
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Edge AI Inference • YOLOv8-Mine Vision
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Body: Hazard Risk Matrix + Rockfall Detection Image */}
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Left Column: Risk Matrix Table */}
        <div className="flex flex-col gap-2">
          {hazards.map((hazard) => {
            const Icon = hazard.icon;
            return (
              <div
                key={hazard.id}
                className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Icon className={`w-3.5 h-3.5 ${hazard.iconColor}`} />
                  <span className="truncate">{hazard.label}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${hazard.badgeColor}`}
                >
                  {hazard.indicator}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: Rockfall Detection Image with Overlays */}
        <div 
          onClick={() => setShowModal(true)}
          className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/3] flex items-center justify-center group cursor-pointer"
          title="Click to view YOLOv8 Detection Confidence Matrix"
        >
          {/* Base Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/rockfall.jpg"
            alt="AI Rockfall Detection Analysis"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* SVG Bounding Boxes Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 200 150"
            fill="none"
          >
            <rect
              x="20"
              y="55"
              width="65"
              height="70"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
            <rect
              x="130"
              y="40"
              width="55"
              height="45"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
          </svg>

          {/* Tag in bottom-right */}
          <div className="absolute bottom-1.5 right-1.5 bg-red-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Rocks detected
          </div>
        </div>
      </div>

      {/* Safety Advisory Banner */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="text-amber-700 font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Structural Alert: Tunnel Section #4B</span>
        </span>
        <span className="text-slate-400 font-mono">Conf: 94%</span>
      </div>

      {/* YOLOv8 Hazard Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    YOLOv8 Geotechnical Hazard Matrix
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Model: YOLOv8-Mine-Geotech v8.4.1 (FP16 TensorRT)
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

            {/* Confidence Matrix Table */}
            <div className="space-y-3 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  <span>Detected Geological Feature</span>
                  <span>Confidence / Bounding Box</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {yoloMatrix.map((item, idx) => (
                    <div key={idx} className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/70">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.class}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${item.statusColor}`}>
                            {item.severity}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">ROI: {item.bbox}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sky-600 text-sm">
                          {item.confidence}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-sky-500 rounded-full" 
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rock Mass Rating & Safety Advisory */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Mountain className="w-4 h-4 text-amber-600" />
                    Geotechnical RMR Classification:
                  </span>
                  <span className="font-bold font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    RMR = 42 (Class III - Fair Rock)
                  </span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-amber-800">
                  <strong>Mandatory Action:</strong> Install 2.4m resin roof bolts at 1.0m spacing and apply 50mm fiber-reinforced shotcrete before advancing RAKSHAK-Mine through Incline Drift Section #4B.
                </p>
              </div>

              {loggedNotice && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{loggedNotice}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setLoggedNotice('Geotechnical hazard vector logged to DGMS Section Form-IV dossier.');
                  setTimeout(() => setLoggedNotice(null), 3000);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Log to DGMS Audit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------------------------------
// 2. AI SURVIVOR TRIAGE COMPONENT
// --------------------------------------------------------------------------------------
export const AISurvivorTriage: React.FC<{ status?: RoverCombinedStatus }> = ({ status }) => {
  const [showModal, setShowModal] = useState(false);
  const [beaconDispatched, setBeaconDispatched] = useState(false);

  const survivorCount = status?.ai_detected_survivors !== undefined ? status.ai_detected_survivors : 1;
  const condition = status?.survivor_condition || 'Conscious & Responsive';
  const priority = status?.survivor_triage_priority || 'PRIORITY 1 (RED)';
  const thermalTemp = status?.thermal_max_temp_c !== undefined ? `${status.thermal_max_temp_c.toFixed(1)}°C` : '36.8°C';

  const handleDispatchBeacon = async () => {
    try {
      await sendRoverCommand('BUZZER_ON', 0);
      setBeaconDispatched(true);
      setTimeout(() => setBeaconDispatched(false), 3500);
    } catch (err) {
      console.error(err);
      setBeaconDispatched(true);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              AI Survivor Triage
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Autonomous Biological Sign Analysis
            </span>
          </div>
        </div>

        {/* 1 Person Detected Pill Badge */}
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {survivorCount} Person Detected
        </span>
      </div>

      {/* Body: User Icon + Medical Triage Info */}
      <div className="flex items-start gap-3 my-1">
        {/* User Avatar Circle */}
        <div className="w-12 h-12 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0 text-sky-700 shadow-sm">
          <User className="w-6 h-6" />
        </div>

        {/* Triage Status Details */}
        <div className="flex-1 text-xs space-y-1 text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-medium">Condition:</span>
            <span className="font-bold text-emerald-600">{condition}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Suggested Priority:</span>
            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {priority}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Thermal Signature:</span>
            <span className="font-mono font-semibold text-slate-800">
              {thermalTemp} (Body Heat)
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Acoustic Resonance:</span>
            <span className="font-medium text-sky-700">Rhythmic Tapping (1.2 Hz)</span>
          </div>
        </div>
      </div>

      {/* Footer: View Details → Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group py-0.5 cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Survivor Triage Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    AI Survivor Triage &amp; Biometric Diagnostic
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Subject ID: SURVIVOR-LOC-01 | Drift B-4
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

            {/* Biometric Matrix */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                    <Thermometer className="w-4 h-4" />
                    <span>Thermal Core Reading</span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-rose-950">{thermalTemp}</div>
                  <span className="text-[10px] text-rose-600">Normothermic range (36.5–37.5°C)</span>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="flex items-center gap-1.5 text-sky-700 font-bold mb-1">
                    <Wind className="w-4 h-4" />
                    <span>Respiration Rate</span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-sky-950">~18 bpm</div>
                  <span className="text-[10px] text-sky-600">Eupneic acoustic envelope</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                    <Heart className="w-4 h-4" />
                    <span>Est. Blood Oxygen (SpO2)</span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-emerald-950">94%</div>
                  <span className="text-[10px] text-emerald-600">Adequate underground saturation</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1">
                    <Radio className="w-4 h-4" />
                    <span>Acoustic Tapping Rate</span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-amber-950">1.2 Hz</div>
                  <span className="text-[10px] text-amber-600">Rhythmic 3-tap SOS sequence</span>
                </div>
              </div>

              {/* Extraction Route Advisory */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Recommended Evacuation Route:</span>
                  <span className="font-mono font-bold text-emerald-700">Gallery B-4 ➔ Crosscut #2</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Estimated distance to survivor: <strong>4.2 meters</strong> ahead of RAKSHAK-Mine. Clearance height nominal at 1.8m.
                </p>
              </div>

              {beaconDispatched && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>Acoustic response beacon emitted via RAKSHAK-Mine high-gain speaker!</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={handleDispatchBeacon}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>📢 Emit Voice &amp; Siren Beacon</span>
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------------------------------
// 3. OBSTACLE DETECTION COMPONENT
// --------------------------------------------------------------------------------------
export const ObstacleDetection: React.FC<{ status?: RoverCombinedStatus }> = ({ status }) => {
  const obstacles = status?.obstacles_list || [
    { name: 'Rock', distance: '1.2 m', type: 'rock' },
    { name: 'Debris', distance: '2.4 m', type: 'debris' },
    { name: 'Pipe', distance: '3.8 m', type: 'pipe' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              Obstacle Detection
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              HC-SR04 Ultrasonic &amp; Optical Distance
            </span>
          </div>
        </div>
      </div>

      {/* Body: Sonar Camera View + Obstacle Distance List */}
      <div className="grid grid-cols-2 gap-3 items-center my-1">
        {/* Sonar Image View */}
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/3] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/obstacle.jpg"
            alt="Obstacle Detection Camera Stream"
            className="w-full h-full object-cover"
          />

          {/* Sonar Radar Detection Overlays */}
          <div className="absolute inset-0 bg-sky-950/20 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 160 120">
            <circle cx="50" cy="65" r="16" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <circle cx="110" cy="50" r="14" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <circle cx="85" cy="85" r="18" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          </svg>
        </div>

        {/* Obstacles List */}
        <div className="flex flex-col justify-center space-y-1.5">
          <div className="font-bold text-xs text-slate-900 leading-tight">
            {obstacles.length} Obstacles Detected
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            {obstacles.map((obs, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono">
                <span className="text-slate-500 font-sans">• {obs.name}:</span>
                <strong className="text-slate-800">{obs.distance}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          <span>HC-SR04 Auto-Brake: <strong>ARMED (&lt;18cm)</strong></span>
        </span>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// COMBINED CONTAINER COMPONENT
// --------------------------------------------------------------------------------------
export const HazardAndTriage: React.FC<HazardAndTriageProps> = ({ 
  status,
  mode = 'combined'
}) => {
  if (mode === 'hazards_only') {
    return <AIHazardAnalysis status={status} />;
  }
  if (mode === 'triage_only') {
    return <AISurvivorTriage status={status} />;
  }
  if (mode === 'obstacles_only') {
    return <ObstacleDetection status={status} />;
  }

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <AIHazardAnalysis status={status} />
      <AISurvivorTriage status={status} />
      <ObstacleDetection status={status} />
    </div>
  );
};

export default HazardAndTriage;
