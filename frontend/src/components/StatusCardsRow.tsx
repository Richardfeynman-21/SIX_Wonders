"use client";

import React from "react";
import {
  Car,
  BatteryCharging,
  Wifi,
  Thermometer,
  Bell,
  Radio,
  Droplets,
  Gauge,
  Sun,
  ArrowRight,
} from "lucide-react";
import { RoverCombinedStatus } from "@/types/telemetry";

interface StatusCardsRowProps {
  status?: RoverCombinedStatus;
  onNavigateAlerts?: () => void;
  onOpenControl?: () => void;
}

export const StatusCardsRow: React.FC<StatusCardsRowProps> = ({
  status,
  onNavigateAlerts,
  onOpenControl,
}) => {
  // Extract or default values matching sample dashboard
  const batteryPct = Math.round(status?.battery_percent ?? 78);
  const batteryVolt = (status?.battery_voltage ?? 11.85).toFixed(1);
  const tempC = (status?.temperature_c ?? 22.1).toFixed(1);
  const humidityPct = Math.round(status?.humidity_pct ?? 68);
  const pressureKPa = ((status?.pressure_hpa ?? 1012.0) / 10).toFixed(1);
  const alertsCount = status?.active_alerts ? status.active_alerts.length : 2;

  // Battery circumference for circular progress
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (batteryPct / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Rover Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-800">RAKSHAK Status</h3>
            </div>
            {onOpenControl && (
              <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                Ready
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ width: '64px', height: '48px', minWidth: '64px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/rover.png"
                alt="RAKSHAK-Mine"
                width={64}
                height={48}
                className="w-16 h-12 object-contain"
                style={{ width: '64px', height: '48px', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {status?.rover_id || "RAKSHAK-Mine"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Mode</span>
                  <span className="font-semibold text-slate-700">
                    {status?.motor_state === "STOPPED" ? "Manual" : status?.motor_state || "Manual"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Distance Traveled</span>
                  <span className="font-semibold text-slate-700">420 m</span>
                </div>
                <div className="flex justify-between">
                  <span>Depth</span>
                  <span className="font-semibold text-slate-700">-310 m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {onOpenControl && (
          <button
            onClick={onOpenControl}
            className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Drive Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card 2: Battery */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-1">
          <BatteryCharging className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800">Battery</h3>
        </div>
        <div className="flex items-center justify-center py-1">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-emerald-500 transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-base font-extrabold text-slate-900">
                {batteryPct}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-center text-[11px] font-medium text-slate-500 mt-1">
          <span>{batteryVolt} V</span>
          <span className="mx-1.5 text-slate-300">|</span>
          <span>~2.5 hrs left</span>
        </div>
      </div>

      {/* Card 3: Connection */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Wifi className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800">Connection</h3>
        </div>
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span>Wi-Fi</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              {status?.esp32_online ? "Connected" : "Standby"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Radio className="w-4 h-4 text-sky-500" />
              <span>LoRa</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-emerald-500 font-mono text-[11px]">llll</span>
              <span>-72 dBm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Environment */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Thermometer className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800">Environment</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Thermometer className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold text-slate-800">{tempC} °C</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-semibold text-slate-800">{humidityPct} % RH</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Gauge className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-800">{pressureKPa} kPa</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Sun className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-semibold text-slate-800">12 lux</span>
          </div>
        </div>
      </div>

      {/* Card 5: Active Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-bold text-slate-800">Active Alerts</h3>
        </div>
        <div className="text-center py-2">
          <span className="text-3xl font-extrabold text-red-600 tracking-tight">
            {alertsCount}
          </span>
        </div>
        <div className="text-right">
          <button
            onClick={onNavigateAlerts}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center justify-end gap-1 ml-auto"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
