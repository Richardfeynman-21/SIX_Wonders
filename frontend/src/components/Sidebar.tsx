"use client";

import React from "react";
import {
  LayoutDashboard,
  Gamepad2,
  Video,
  Thermometer,
  Cloud,
  Map,
  AlertTriangle,
  Radio,
  MessageSquare,
  BatteryCharging,
  Bell,
  FileText,
  ShieldCheck,
  Settings,
  Pickaxe,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "rover-control", label: "RAKSHAK Control", icon: Gamepad2 },
  { id: "live-camera", label: "Live Camera", icon: Video },
  { id: "environment", label: "Environmental Monitoring", icon: Thermometer },
  { id: "gas-monitoring", label: "Gas Monitoring", icon: Cloud },
  { id: "mine-map", label: "Mine Map", icon: Map },
  { id: "hazard-analysis", label: "AI Hazard Analysis", icon: AlertTriangle },
  { id: "survivor-detection", label: "Survivor Detection", icon: Radio },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "power-monitoring", label: "Power Monitoring", icon: BatteryCharging },
  { id: "alerts", label: "Alerts & Notifications", icon: Bell, badge: 3 },
  { id: "incident-reports", label: "Incident Reports", icon: FileText },
  { id: "dgms-compliance", label: "DGMS Compliance", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  alertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  alertsCount = 3,
}) => {
  return (
    <aside className="w-64 min-w-[16rem] h-screen bg-gradient-to-b from-[#090E20] via-[#0B132B] to-[#0F172A] text-slate-200 flex flex-col border-r border-slate-800 shadow-xl select-none z-30">
      {/* Brand Header */}
      <div className="p-4 pb-3 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25 text-white font-bold p-1 border border-sky-300/30 shrink-0">
          <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7">
            <path
              d="M9 27V9C9 7.9 9.9 7 11 7H18.5C21.5 7 24 9.5 24 12.5C24 15 22.2 17.1 19.8 17.8L25.5 26.5C26 27.2 25.5 28 24.7 28H21C20.4 28 19.8 27.7 19.4 27.2L15 20H13V27C13 27.6 12.6 28 12 28H9.5C8.9 28 8.5 27.6 8.5 27H9ZM13 16.5H18C19.4 16.5 20.5 15.4 20.5 14C20.5 12.6 19.4 11.5 18 11.5H13V16.5Z"
              fill="white"
            />
            <circle cx="27" cy="8" r="2" fill="#38BDF8" />
            <circle cx="27" cy="8" r="0.8" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
            RAKSHAK-Mine
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Safer Mines, Brighter Tomorrows
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeValue =
            item.id === "alerts" ? alertsCount || item.badge : item.badge;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left ${
                isActive
                  ? "bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/30 border border-sky-400/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {badgeValue !== undefined && Number(badgeValue) > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${
                    item.id === "alerts"
                      ? "bg-red-500 text-white"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Poster Card matching sample dashboard */}
      <div className="p-2.5 border-t border-slate-800/80 hidden sm:block">
        <div className="relative rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900 group">
          <div className="relative h-16 w-full overflow-hidden" style={{ height: '64px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/sidebar_footer.jpg"
              alt="Technology for Safer Mines"
              className="w-full h-full object-cover brightness-75 contrast-110 group-hover:scale-105 transition-transform duration-300"
              style={{ width: '100%', height: '64px', objectFit: 'cover', display: 'block' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090E20] via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="p-2 bg-[#090E20] border-t border-slate-800">
            <p className="text-[11px] font-bold text-white leading-tight">
              Technology for Safer Mines
            </p>
            <p className="text-[9px] text-sky-400 font-medium">
              and Stronger Lives.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
