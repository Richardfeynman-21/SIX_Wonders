"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatusCardsRow } from "@/components/StatusCardsRow";
import { LiveCameraFeed } from "@/components/LiveCameraFeed";
import { GasMonitoringGauges } from "@/components/GasMonitoringGauges";
import { SurvivorAudioWaveform } from "@/components/SurvivorAudioWaveform";
import { HazardAndTriage } from "@/components/HazardAndTriage";
import { MineMapCard } from "@/components/MineMapCard";
import { PowerMonitoringCard } from "@/components/PowerMonitoringCard";
import { TwoWayCommunication } from "@/components/TwoWayCommunication";
import { LogsProtocolsReportRow } from "@/components/LogsProtocolsReportRow";
import { RoverControlModal } from "@/components/RoverControlModal";
import { SubsystemViews } from "@/components/SubsystemViews";
import { RoverCombinedStatus } from "@/types/telemetry";
import { api, DEFAULT_STATUS } from "@/lib/api";
import { Compass, ArrowLeft, ChevronRight } from "lucide-react";

export default function MissionDashboardPage() {
  const [telemetry, setTelemetry] = useState<RoverCombinedStatus>(DEFAULT_STATUS);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isControlModalOpen, setIsControlModalOpen] = useState<boolean>(false);
  const [eStopActive, setEStopActive] = useState<boolean>(false);

  // Real-time WebSocket connection + fallback polling
  useEffect(() => {
    // 1. Initial REST fetch
    api.getStatus().then((data) => {
      if (data) setTelemetry(data);
    });

    // 2. Real-time WebSocket
    const cleanupWs = api.connectTelemetryWebSocket(
      (incoming) => {
        setTelemetry((prev) => ({ ...prev, ...incoming }));
      },
      (err) => console.warn("WebSocket error, falling back to REST:", err)
    );

    // 3. Fallback interval polling (every 3 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const latest = await api.getStatus();
        if (latest) {
          setTelemetry((prev) => ({ ...prev, ...latest }));
        }
      } catch (err) {
        console.warn("Status poll error:", err);
      }
    }, 3000);

    return () => {
      cleanupWs();
      clearInterval(pollInterval);
    };
  }, []);

  const handleEmergencyStop = useCallback(async () => {
    setEStopActive(true);
    await api.sendRoverCommand("STOP", 0);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR                                               */}
      {/* ------------------------------------------------------------- */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        alertsCount={telemetry?.active_alerts?.length ?? 2}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN VIEWPORT CONTAINER                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP HEADER */}
        <Header
          isRoverOnline={telemetry?.esp32_online ?? true}
          isLoRaConnected={telemetry?.pi_online ?? true}
          alertsCount={telemetry?.active_alerts?.length ?? 2}
          onOpenAlerts={() => setActiveTab("alerts")}
          onEmergencyStopTriggered={handleEmergencyStop}
          onOpenControl={() => setIsControlModalOpen(true)}
        />

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
          {activeTab === "dashboard" ? (
            <>
              {/* ROW 1: STATUS CARDS (Rover 3D card, Battery, Wi-Fi, Env, Alerts) */}
              <StatusCardsRow
                status={telemetry}
                onNavigateAlerts={() => setActiveTab("alerts")}
                onOpenControl={() => setIsControlModalOpen(true)}
              />

              {/* ROW 2A: Live Camera, Gas Monitoring, AI Hazard Analysis */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
                <div className="xl:col-span-4 min-h-[300px]">
                  <LiveCameraFeed status={telemetry} />
                </div>
                <div className="xl:col-span-5">
                  <GasMonitoringGauges status={telemetry} />
                </div>
                <div className="xl:col-span-3">
                  <HazardAndTriage status={telemetry} mode="hazards_only" />
                </div>
              </div>

              {/* ROW 2B: Survivor Audio, AI Survivor Triage, Obstacle Detection */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
                <div className="xl:col-span-5">
                  <SurvivorAudioWaveform status={telemetry} />
                </div>
                <div className="xl:col-span-4">
                  <HazardAndTriage status={telemetry} mode="triage_only" />
                </div>
                <div className="xl:col-span-3">
                  <HazardAndTriage status={telemetry} mode="obstacles_only" />
                </div>
              </div>

              {/* ROW 3: Mine Map, Power Monitoring, Two-Way Communication */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                <MineMapCard
                  telemetry={telemetry}
                  onOpenModal={() => setActiveTab("mine-map")}
                />
                <PowerMonitoringCard
                  telemetry={telemetry}
                  onViewDetails={() => setActiveTab("power-monitoring")}
                />
                <TwoWayCommunication />
              </div>

              {/* ROW 4: RECENT EVENT LOG, DGMS PROTOCOLS, INCIDENT REPORT */}
              <LogsProtocolsReportRow
                telemetry={telemetry}
                onViewAllLogs={() => setActiveTab("alerts")}
                onViewCompliance={() => setActiveTab("dgms-compliance")}
                onViewIncidentReport={() => setActiveTab("incident-reports")}
              />
            </>
          ) : (
            /* DEDICATED SUBSYSTEM VIEW (When user clicks sidebar item) */
            <div className="space-y-3.5">
              {/* Top Subsystem Breadcrumb / Navigation Bar */}
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>← Back to Dashboard</span>
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-400 font-normal">Subsystem</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-800 font-bold capitalize bg-slate-100 px-2 py-0.5 rounded">
                    {activeTab.replace(/-/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsControlModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Drive Cockpit 🎮</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm min-h-full">
                <SubsystemViews
                  activeTab={activeTab}
                  telemetry={telemetry}
                  onBack={() => setActiveTab("dashboard")}
                  onSelectTab={(tabId) => setActiveTab(tabId)}
                />
              </div>
            </div>
          )}
        </main>
      </div>



      {/* ------------------------------------------------------------- */}
      {/* 4. ROVER TELEOPERATION MODAL / DRAWER                         */}
      {/* ------------------------------------------------------------- */}
      <RoverControlModal
        isOpen={isControlModalOpen}
        onClose={() => setIsControlModalOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
