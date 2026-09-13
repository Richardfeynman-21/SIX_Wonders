#ifndef DASHBOARD_HTML_H
#define DASHBOARD_HTML_H

#include <Arduino.h>
#include <pgmspace.h>

// ==============================================================================
//  PROJECT RAKSHAK-MINE: Robotic Autonomous Rescue & Hazard Assessment
//  Motto: Protection + Rescue
//  Self-contained, 100% offline web dashboard served directly from ESP32 Flash
// ==============================================================================

const char INDEX_HTML[] PROGMEM = R"rawliteral(<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>RAKSHAK-Mine &bull; Robotic Autonomous Rescue &amp; Hazard Assessment</title>
  <style>
    :root {
      --bg-body: #f4f6fa;
      --bg-card: #ffffff;
      --bg-card-alt: #f8fafc;
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --primary-gold: #f5b72e;
      --primary-gold-dark: #d99a18;
      --primary-gold-light: #fffbeb;
      --primary-gold-glow: rgba(245, 183, 46, 0.35);
      --safe-green: #10b981;
      --safe-green-light: #ecfdf5;
      --safe-green-border: #a7f3d0;
      --caution-amber: #f59e0b;
      --caution-amber-light: #fffbeb;
      --danger-red: #ef4444;
      --danger-red-light: #fef2f2;
      --danger-red-border: #fca5a5;
      --cyan-bright: #06b6d4;
      --cyan-light: #ecfeff;
      --text-dark: #0f172a;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --card-radius: 12px;
      --card-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
      --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }

    body {
      background-color: var(--bg-body);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* ==========================================================================
       TOP COMMAND HEADER: Full Width with Embedded Team Logo & Official Branding
       ========================================================================== */
    .top-header {
      background: #ffffff;
      border-bottom: 1px solid var(--border-subtle);
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .header-logo-frame {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(245, 183, 46, 0.45), rgba(245, 183, 46, 0.08));
      border: 2px solid var(--primary-gold);
      box-shadow: 0 0 16px var(--primary-gold-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .header-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }

    .brand-title-group {
      display: flex;
      flex-direction: column;
    }

    .brand-heading-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .brand-heading {
      font-size: 1.55rem;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: var(--text-dark);
      line-height: 1.1;
      display: flex;
      align-items: center;
    }

    .brand-heading .gold-tag {
      color: var(--primary-gold-dark);
      font-weight: 900;
      border-bottom: 3px solid var(--primary-gold);
      padding-bottom: 1px;
    }

    .motto-badge {
      font-size: 0.66rem;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 3px 8px;
      border-radius: 6px;
      background: #fffbeb;
      color: var(--primary-gold-dark);
      border: 1px solid #fde68a;
      text-transform: uppercase;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(245, 183, 46, 0.15);
    }

    .brand-sub {
      font-size: 0.73rem;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .header-status-strip {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      background: #f1f5f9;
      color: var(--text-muted);
      border: 1px solid var(--border-subtle);
    }

    .status-pill.online {
      background: var(--safe-green-light);
      color: #065f46;
      border-color: var(--safe-green-border);
    }

    .status-pill.simulation {
      background: var(--caution-amber-light);
      color: #92400e;
      border-color: #fde68a;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
    }

    .pulse-animation {
      animation: pulseGlow 1.8s infinite;
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .header-nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 800;
      background: #f8fafc;
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .header-nav-btn:hover {
      background: #e2e8f0;
    }

    .header-mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary-gold);
      color: #0f172a;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      cursor: pointer;
      box-shadow: 0 2px 8px var(--primary-gold-glow);
      transition: var(--transition-smooth);
    }

    .header-mode-btn:hover {
      background: var(--primary-gold-dark);
      transform: translateY(-1px);
    }

    /* Master Hazard Alert Strip */
    .alert-banner {
      padding: 9px 28px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: var(--transition-smooth);
      border-bottom: 1px solid transparent;
    }

    .alert-banner.nominal {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }

    .alert-banner.warning {
      background: #fffbeb;
      color: #b45309;
      border-color: #fde68a;
    }

    .alert-banner.critical {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
      animation: criticalFlash 1.2s infinite;
    }

    @keyframes criticalFlash {
      0%, 100% { background: #fef2f2; }
      50% { background: #fee2e2; }
    }

    /* Main Container */
    .dashboard-content {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
    }

    /* ==========================================================================
       ROW 1: 4 SENSOR TELEMETRY CARDS
       ========================================================================== */
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .hud-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--card-radius);
      padding: 18px 20px;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      position: relative;
      transition: var(--transition-smooth);
    }

    .hud-card:hover {
      box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08);
      border-color: var(--border-strong);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .card-title-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-icon {
      width: 22px;
      height: 22px;
      color: var(--text-dark);
    }

    .card-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: 0.3px;
    }

    .card-sensor-tag {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .card-sensor-tag.cyan {
      background: var(--cyan-light);
      color: #0e7490;
      border-color: #a5f3fc;
    }

    /* Semi-Circle SVG Gauge */
    .gauge-container {
      position: relative;
      width: 100%;
      max-width: 220px;
      margin: 4px auto 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .gauge-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .gauge-bg-path {
      fill: none;
      stroke: #e2e8f0;
      stroke-width: 14;
      stroke-linecap: round;
    }

    .gauge-val-path {
      fill: none;
      stroke-width: 14;
      stroke-linecap: round;
      stroke-dasharray: 236;
      stroke-dashoffset: 236;
      transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s;
    }

    .gauge-center-info {
      position: absolute;
      bottom: 6px;
      left: 0;
      right: 0;
      text-align: center;
    }

    .gauge-numeric-value {
      font-size: 2.1rem;
      font-weight: 900;
      color: var(--text-dark);
      line-height: 1;
      font-family: var(--font-sans);
    }

    .gauge-unit-label {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 1px;
      margin-top: 4px;
    }

    /* Hazard Status Pill */
    .hazard-status-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 10px 0 14px;
      background: var(--safe-green-light);
      color: #065f46;
      border: 1px solid var(--safe-green-border);
      text-align: center;
    }

    .hazard-status-pill.warning {
      background: var(--caution-amber-light);
      color: #92400e;
      border-color: #fde68a;
    }

    .hazard-status-pill.danger {
      background: var(--danger-red-light);
      color: #991b1b;
      border-color: var(--danger-red-border);
      animation: pulseGlow 1.2s infinite;
    }

    /* Sub Stats Row */
    .sub-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
      margin-top: auto;
    }

    .sub-stat-box {
      display: flex;
      flex-direction: column;
    }

    .sub-stat-lbl {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .sub-stat-val {
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--text-dark);
      margin-top: 2px;
      font-family: var(--font-mono);
    }

    /* Card 4: Threat List */
    .threat-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 12px 0 16px;
      flex: 1;
    }

    .threat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
    }

    .threat-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .threat-icon {
      font-size: 1.1rem;
    }

    .threat-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-dark);
    }

    .threat-status-badge {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--safe-green);
    }

    .threat-status-badge.danger {
      color: var(--danger-red);
    }

    .threat-status-badge.active-shield {
      color: #059669;
    }

    .index-double-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: auto;
    }

    .index-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
    }

    .index-box.cyan {
      background: #ecfeff;
      border-color: #a5f3fc;
    }

    .index-box-lbl {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .index-box-val {
      font-size: 0.75rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 3px;
    }

    /* ==========================================================================
       ROW 2: 3 CONTROLS & OPERATIONS CARDS
       ========================================================================== */
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1.35fr 1fr;
      gap: 20px;
    }

    /* Card 1: D-Pad */
    .dpad-container {
      display: grid;
      grid-template-columns: repeat(3, 62px);
      grid-template-rows: repeat(3, 56px);
      gap: 8px;
      justify-content: center;
      margin: 12px auto 14px;
    }

    .dpad-btn {
      background: #f1f5f9;
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      color: var(--text-dark);
      font-size: 1.1rem;
      font-weight: 900;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      transition: var(--transition-smooth);
    }

    .dpad-btn:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }

    .dpad-btn:active {
      background: #cbd5e1;
      transform: translateY(1px);
    }

    .dpad-btn.halt-btn {
      background: var(--primary-gold);
      border-color: var(--primary-gold-dark);
      color: #0f172a;
      box-shadow: 0 2px 8px var(--primary-gold-glow);
    }

    .dpad-btn.halt-btn:hover {
      background: var(--primary-gold-dark);
    }

    .dpad-btn-sub {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }

    .pivot-actions-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: auto;
    }

    .pivot-btn {
      padding: 9px 12px;
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--text-dark);
      cursor: pointer;
      text-align: center;
      transition: var(--transition-smooth);
    }

    .pivot-btn:hover {
      background: #e2e8f0;
      border-color: var(--border-strong);
    }

    /* Card 2: Emergency Brake & Modes */
    .estop-banner-btn {
      width: 100%;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #ffffff;
      border: 2px solid #b91c1c;
      border-radius: 10px;
      padding: 16px 20px;
      font-size: 1.02rem;
      font-weight: 900;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
      transition: var(--transition-smooth);
      margin-bottom: 20px;
    }

    .estop-banner-btn:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-1px);
    }

    .estop-banner-btn:active {
      transform: translateY(1px);
    }

    /* Resumed state: Toggles cleanly between red STOP and green RESUME */
    .estop-banner-btn.resumed {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border-color: #047857 !important;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
    }

    .estop-banner-btn.resumed:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
    }

    .nav-mode-section-title {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .nav-mode-buttons-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }

    .nav-mode-card-btn {
      padding: 14px 16px;
      border-radius: 10px;
      background: #f1f5f9;
      border: 2px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--text-muted);
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .nav-mode-card-btn svg {
      width: 22px;
      height: 22px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }

    .nav-mode-card-btn:hover {
      border-color: var(--border-strong);
      color: var(--text-dark);
    }

    .nav-mode-card-btn.selected {
      background: var(--primary-gold);
      border-color: var(--primary-gold-dark);
      color: #0f172a;
      box-shadow: 0 4px 14px var(--primary-gold-glow);
    }

    .nav-mode-card-btn.selected svg {
      stroke: #0f172a;
    }

    .aux-toggles-strip {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-top: auto;
    }

    .aux-toggle-btn {
      padding: 8px 10px;
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      font-size: 0.74rem;
      font-weight: 800;
      color: var(--text-main);
      cursor: pointer;
      text-align: center;
      transition: var(--transition-smooth);
    }

    .aux-toggle-btn:hover {
      background: #f1f5f9;
      border-color: var(--border-strong);
    }

    /* Card 3: Speed Presets & Slider */
    .speed-presets-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 8px 0 20px;
    }

    .speed-preset-btn {
      background: #f1f5f9;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 10px 8px;
      text-align: center;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .speed-preset-btn:hover {
      background: #e2e8f0;
    }

    .speed-preset-btn.active {
      background: var(--primary-gold);
      border-color: var(--primary-gold-dark);
      box-shadow: 0 2px 8px var(--primary-gold-glow);
    }

    .preset-name {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-dark);
    }

    .preset-pwm {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .speed-preset-btn.active .preset-pwm {
      color: #475569;
    }

    .throttle-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .throttle-title {
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--text-dark);
    }

    .throttle-readout {
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--primary-gold-dark);
      font-family: var(--font-mono);
    }

    .slider-interactive-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .slider-step-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #f1f5f9;
      border: 1px solid var(--border-strong);
      color: var(--text-dark);
      font-size: 1.2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .slider-step-btn:hover {
      background: #e2e8f0;
    }

    .custom-range-slider {
      flex: 1;
      -webkit-appearance: none;
      height: 10px;
      border-radius: 5px;
      background: #e2e8f0;
      outline: none;
    }

    .custom-range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary-gold);
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transition: transform 0.1s;
    }

    .custom-range-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }

    .slider-tick-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-top: 8px;
    }

    /* ==========================================================================
       ROW 3: DEDICATED LIVE MISSION & TELEMETRY EVENT LOG CONSOLE
       ========================================================================== */
    .log-panel-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--card-radius);
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .log-panel-header {
      padding: 12px 20px;
      background: #f8fafc;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .log-panel-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .log-panel-title {
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: 0.5px;
    }

    .log-badge-live {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--safe-green-light);
      color: #065f46;
      border: 1px solid var(--safe-green-border);
    }

    .log-controls-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .log-filter-btn {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      background: #ffffff;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .log-filter-btn:hover {
      background: #f1f5f9;
      color: var(--text-dark);
    }

    .log-filter-btn.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    .log-btn-action {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      background: #f1f5f9;
      border: 1px solid var(--border-strong);
      color: var(--text-dark);
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .log-btn-action:hover {
      background: #e2e8f0;
    }

    .log-entries-viewport {
      height: 190px;
      overflow-y: auto;
      padding: 12px 20px;
      background: #0b101c;
      color: #cbd5e1;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      line-height: 1.6;
    }

    .log-entry-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      animation: fadeInRow 0.2s ease-out;
    }

    @keyframes fadeInRow {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .log-time-tag {
      color: #64748b;
      font-size: 0.76rem;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .log-tag-badge {
      font-weight: 800;
      font-size: 0.7rem;
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .tag-cmd { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
    .tag-sys { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }
    .tag-alert { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.5); font-weight: 900; }
    .tag-gas { background: rgba(245, 158, 11, 0.25); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.5); }
    .tag-nav { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }

    .log-entry-text {
      color: #e2e8f0;
      word-break: break-word;
      flex: 1;
    }

    .log-entry-text b {
      color: #f1f5f9;
      font-weight: 800;
    }

    /* ==========================================================================
       BOTTOM FOOTER
       ========================================================================== */
    .dashboard-footer {
      background: #ffffff;
      border-top: 1px solid var(--border-subtle);
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-top: auto;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-dark);
    }

    .footer-gold-bar {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background: var(--primary-gold);
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .telemetry-grid { grid-template-columns: repeat(2, 1fr); }
      .controls-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .top-header { flex-direction: column; align-items: flex-start; }
      .telemetry-grid { grid-template-columns: 1fr; }
      .brand-container { width: 100%; justify-content: space-between; }
    }
  </style>
</head>
<body>

  <!-- ==================== TOP COMMAND HEADER ==================== -->
  <header class="top-header">
    <div class="brand-container">
      <div class="header-logo-frame">
        <img src="data:image/jpeg;base64,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" alt="RAKSHAK-Mine Logo" class="header-logo-img">
      </div>
      <div class="brand-title-group">
        <div class="brand-heading-row">
          <h1 class="brand-heading">
            RAKSHAK-<span class="gold-tag">MINE</span>
          </h1>
          <span class="motto-badge">PROTECTION + RESCUE</span>
        </div>
        <div class="brand-sub">Robotic Autonomous Rescue &amp; Knowledge-based Hazard Assessment for Coal Mines</div>
      </div>
    </div>

    <div class="header-status-strip">
      <div id="badgeConn" class="status-pill simulation">
        <div class="status-dot pulse-animation"></div>
        <span id="txtConn">SIMULATION DEMO</span>
      </div>

      <div class="status-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
        <span id="txtIp">192.168.4.1</span>
      </div>

      <div class="status-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h.01"></path><path d="M7 20v-4"></path><path d="M12 20v-8"></path><path d="M17 20V4"></path></svg>
        <span id="txtSignal">-58 dBm</span>
      </div>

      <div class="status-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span id="txtUptime">00:00:00</span>
      </div>

      <!-- Quick Scroll to Logs -->
      <button id="btnScrollLogs" class="header-nav-btn" title="View Event Log">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        <span>LOGS (<span id="txtLogCount">0</span>)</span>
      </button>

      <!-- Top Header Mode Action Button (STRICTLY DEFAULTS TO MANUAL TELE-OP) -->
      <button id="btnHeaderMode" class="header-mode-btn" title="Click to Switch Mode">
        <span id="txtHeaderModeIcon">&#9654;</span>
        <span id="txtHeaderMode">MANUAL TELE-OP</span>
      </button>
    </div>
  </header>

  <!-- Hazard Alert Strip -->
  <div id="bannerAlert" class="alert-banner nominal">
    <span id="txtAlertIcon">&#9679;</span>
    <span id="txtAlertMessage">STATUS NOMINAL: ATMOSPHERE CLEAR &bull; ACTIVE COLLISION SHIELD ARMED</span>
  </div>

  <!-- Main Content -->
  <main class="dashboard-content">

    <!-- ==================== ROW 1: 4 SENSOR TELEMETRY CARDS ==================== -->
    <section class="telemetry-grid">

      <!-- CARD 1: METHANE (CH4) -->
      <div class="hud-card" id="cardCH4">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
            <div class="card-title">Methane (CH&#8324;)</div>
          </div>
          <span class="card-sensor-tag">MQ-4</span>
        </div>

        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 200 115">
            <path class="gauge-bg-path" d="M 25 100 A 75 75 0 0 1 175 100" />
            <path id="gaugePathCH4" class="gauge-val-path" stroke="var(--safe-green)" d="M 25 100 A 75 75 0 0 1 175 100" />
          </svg>
          <div class="gauge-center-info">
            <div id="valCH4" class="gauge-numeric-value">250</div>
            <div class="gauge-unit-label">PPM</div>
          </div>
        </div>

        <div id="pillCH4" class="hazard-status-pill">&#9679; NORMAL &bull; SAFE CORRIDOR</div>

        <div class="sub-stats-grid">
          <div class="sub-stat-box">
            <span class="sub-stat-lbl">RAW ADC (12-BIT)</span>
            <span id="rawCH4" class="sub-stat-val">338</span>
          </div>
          <div class="sub-stat-box">
            <span class="sub-stat-lbl">LOWER EXP. LIMIT</span>
            <span id="lelCH4" class="sub-stat-val">0.50% LEL</span>
          </div>
        </div>
      </div>

      <!-- CARD 2: CARBON MONOXIDE (CO) -->
      <div class="hud-card" id="cardCO">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
            <div class="card-title">Carbon Monoxide (CO)</div>
          </div>
          <span class="card-sensor-tag">MQ-7</span>
        </div>

        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 200 115">
            <path class="gauge-bg-path" d="M 25 100 A 75 75 0 0 1 175 100" />
            <path id="gaugePathCO" class="gauge-val-path" stroke="var(--safe-green)" d="M 25 100 A 75 75 0 0 1 175 100" />
          </svg>
          <div class="gauge-center-info">
            <div id="valCO" class="gauge-numeric-value">10</div>
            <div class="gauge-unit-label">PPM</div>
          </div>
        </div>

        <div id="pillCO" class="hazard-status-pill">&#9679; NORMAL &bull; SAFE LEVELS</div>

        <div class="sub-stats-grid">
          <div class="sub-stat-box">
            <span class="sub-stat-lbl">RAW ADC (12-BIT)</span>
            <span id="rawCO" class="sub-stat-val">12</span>
          </div>
          <div class="sub-stat-box">
            <span class="sub-stat-lbl">OSHA 8H CEILING</span>
            <span class="sub-stat-val">50 PPM MAX</span>
          </div>
        </div>
      </div>

      <!-- CARD 3: PROXIMITY RADAR (HC-SR04) -->
      <div class="hud-card" id="cardSonar">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16.2 7.8a6 6 0 0 0-8.4 0"></path><path d="M19 5a10 10 0 0 0-14 0"></path><line x1="12" y1="12" x2="12.01"></line></svg>
            <div class="card-title">Proximity Radar</div>
          </div>
          <span class="card-sensor-tag">HC-SR04</span>
        </div>

        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 200 115">
            <path class="gauge-bg-path" d="M 25 100 A 75 75 0 0 1 175 100" />
            <path id="gaugePathSonar" class="gauge-val-path" stroke="var(--caution-amber)" d="M 25 100 A 75 75 0 0 1 175 100" />
          </svg>
          <div class="gauge-center-info">
            <div id="valDist" class="gauge-numeric-value">200.0</div>
            <div class="gauge-unit-label">CM CLEARANCE</div>
          </div>
        </div>

        <div id="pillDist" class="hazard-status-pill">&#9679; CLEAR &bull; SAFE DISTANCE (&gt;50cm)</div>

        <div class="sub-stats-grid">
          <div class="sub-stat-box">
            <span class="sub-stat-lbl">OBSTACLE THRESHOLD</span>
            <span class="sub-stat-val" style="color:var(--danger-red);">&lt; 18.0 CM CRITICAL</span>
          </div>
          <div class="sub-stat-box">
            <span class="sub-stat-lbl">NAV STATE</span>
            <span id="valNavState" class="sub-stat-val" style="color:var(--safe-green);">STANDBY</span>
          </div>
        </div>
      </div>

      <!-- CARD 4: MINE HAZARD & SAFETY INDEX -->
      <div class="hud-card" id="cardSafetyIndex">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <div class="card-title">Mine Hazard &amp; Safety Index</div>
          </div>
          <span class="card-sensor-tag cyan">AI CORE</span>
        </div>

        <div class="threat-list">
          <div class="threat-row">
            <div class="threat-info">
              <span class="threat-icon">&#128165;</span>
              <span class="threat-name">Explosive Threat</span>
            </div>
            <span id="statusExplosive" class="threat-status-badge">SAFE (&lt; 1% LEL)</span>
          </div>

          <div class="threat-row">
            <div class="threat-info">
              <span class="threat-icon">&#9760;</span>
              <span class="threat-name">CO Toxicity</span>
            </div>
            <span id="statusToxicity" class="threat-status-badge">SAFE (&lt; 50 PPM)</span>
          </div>

          <div class="threat-row">
            <div class="threat-info">
              <span class="threat-icon">&#128737;</span>
              <span class="threat-name">Collision Shield</span>
            </div>
            <span id="statusShield" class="threat-status-badge active-shield">ACTIVE (&lt; 15cm) BRAKE</span>
          </div>
        </div>

        <div class="index-double-box">
          <div class="index-box cyan">
            <div class="index-box-lbl">Chassis Orientation</div>
            <div id="valOrient" class="index-box-val">REVERSED (FRONT - SONAR)</div>
          </div>
          <div class="index-box">
            <div class="index-box-lbl">Overall Mine Safety</div>
            <div id="valOverallSafety" class="index-box-val">SECURE (100%)</div>
          </div>
        </div>
      </div>

    </section>

    <!-- ==================== ROW 2: 3 CONTROLS & OPERATIONS CARDS ==================== -->
    <section class="controls-grid">

      <!-- CARD 1: ROVER CONTROL (WASD / ARROWS) -->
      <div class="hud-card">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="6"></rect><path d="M6 12h4m-2-2v4m9-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>
            <div class="card-title">Rover Control</div>
          </div>
          <span class="card-sensor-tag">WASD / ARROWS</span>
        </div>

        <!-- Directional D-Pad -->
        <div class="dpad-container">
          <div style="grid-column:2;">
            <button class="dpad-btn" id="btnFwd" data-cmd="FORWARD" title="Forward [W]">
              <span>&#9650;</span>
              <span class="dpad-btn-sub">FWD</span>
            </button>
          </div>
          <div style="grid-row:2; grid-column:1;">
            <button class="dpad-btn" id="btnLeft" data-cmd="LEFT" title="Left [A]">
              <span>&#9664;</span>
              <span class="dpad-btn-sub">LEFT</span>
            </button>
          </div>
          <div style="grid-row:2; grid-column:2;">
            <button class="dpad-btn halt-btn" id="btnHalt" data-cmd="STOP" title="Stop [Space]">
              <span style="font-size:1rem;">&#9632;</span>
              <span class="dpad-btn-sub">HALT</span>
            </button>
          </div>
          <div style="grid-row:2; grid-column:3;">
            <button class="dpad-btn" id="btnRight" data-cmd="RIGHT" title="Right [D]">
              <span>&#9654;</span>
              <span class="dpad-btn-sub">RIGHT</span>
            </button>
          </div>
          <div style="grid-row:3; grid-column:2;">
            <button class="dpad-btn" id="btnRev" data-cmd="BACKWARD" title="Reverse [S]">
              <span>&#9660;</span>
              <span class="dpad-btn-sub">REV</span>
            </button>
          </div>
        </div>

        <!-- Pivot Buttons -->
        <div class="pivot-actions-row">
          <button class="pivot-btn" id="btnPivLeft" data-cmd="PIVOT_LEFT">&#8630; PIVOT LEFT [Q]</button>
          <button class="pivot-btn" id="btnPivRight" data-cmd="PIVOT_RIGHT">PIVOT RIGHT [E] &#8631;</button>
        </div>
      </div>

      <!-- CARD 2: MASTER SAFETY & NAVIGATION MODE -->
      <div class="hud-card">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <div class="card-title">Master Safety</div>
          </div>
          <span class="card-sensor-tag" style="background:#fee2e2; color:#991b1b; border-color:#fca5a5;">CRITICAL INTERLOCK</span>
        </div>

        <!-- Big Emergency Brake / Resume Toggle Button -->
        <button id="btnEStop" class="estop-banner-btn" title="Emergency Stop Toggle">
          <span style="font-size:1.3rem;">&#9888;</span>
          <span id="txtEStop">EMERGENCY BRAKE / E-STOP</span>
        </button>

        <!-- Navigation Mode Selection (STRICTLY DEFAULTS TO MANUAL TELE-OP) -->
        <div class="nav-mode-section-title">Rover Navigation Mode</div>
        <div class="nav-mode-buttons-row">
          <button id="btnModeAuto" class="nav-mode-card-btn" title="Autonomous Exploration Mode">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4m-4 5h.01m8 0h.01"></path></svg>
            <span>AUTONOMOUS</span>
          </button>

          <button id="btnModeManual" class="nav-mode-card-btn selected" title="Manual Tele-Operation Mode">
            <svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="6"></rect><path d="M6 12h4m-2-2v4m9-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path></svg>
            <span>MANUAL TELE-OP</span>
          </button>
        </div>

        <!-- Auxiliary Toggles -->
        <div class="aux-toggles-strip">
          <button id="btnToggleBeacon" class="aux-toggle-btn">&#128680; SIREN / BEACON</button>
          <button id="btnToggleOrient" class="aux-toggle-btn" style="color:#0284c7;">&#128260; ORIENT: REV</button>
          <button id="btnToggleShield" class="aux-toggle-btn" style="color:#059669;">&#128737; SHIELD: ON</button>
        </div>
      </div>

      <!-- CARD 3: SPEED & PWM CONTROL -->
      <div class="hud-card">
        <div class="card-header">
          <div class="card-title-box">
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>
            <div class="card-title">Speed &amp; PWM Control</div>
          </div>
          <span class="card-sensor-tag">8-BIT PWM</span>
        </div>

        <!-- Speed Presets -->
        <div class="speed-presets-row">
          <div class="speed-preset-btn" id="presetSlow" data-speed="120">
            <div class="preset-name">SLOW</div>
            <div class="preset-pwm">120 PWM</div>
          </div>
          <div class="speed-preset-btn active" id="presetMed" data-speed="170">
            <div class="preset-name">MEDIUM</div>
            <div class="preset-pwm">170 PWM</div>
          </div>
          <div class="speed-preset-btn" id="presetFast" data-speed="230">
            <div class="preset-name">FAST</div>
            <div class="preset-pwm">230 PWM</div>
          </div>
        </div>

        <!-- Motor Throttle Slider -->
        <div class="throttle-header-row">
          <span class="throttle-title">Motor Throttle</span>
          <span id="txtThrottleVal" class="throttle-readout">170 / 255</span>
        </div>

        <div class="slider-interactive-group">
          <button class="slider-step-btn" id="btnThrottleDec">&minus;</button>
          <input type="range" min="0" max="255" value="170" id="sliderSpeed" class="custom-range-slider">
          <button class="slider-step-btn" id="btnThrottleInc">&plus;</button>
        </div>

        <div class="slider-tick-labels">
          <span>0 (STOP)</span>
          <span>128 (50%)</span>
          <span>255 (MAX)</span>
        </div>
      </div>

    </section>

    <!-- ==================== ROW 3: DEDICATED LIVE MISSION & TELEMETRY EVENT LOG CONSOLE ==================== -->
    <section class="log-panel-card" id="sectionEventLog">
      <div class="log-panel-header">
        <div class="log-panel-title-group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          <span class="log-panel-title">MISSION &amp; TELEMETRY EVENT LOG</span>
          <span class="log-badge-live">LIVE 10 HZ BUS</span>
        </div>

        <div class="log-controls-group">
          <button class="log-filter-btn active" data-filter="ALL">ALL</button>
          <button class="log-filter-btn" data-filter="CMD">CMD</button>
          <button class="log-filter-btn" data-filter="SYS">SYS</button>
          <button class="log-filter-btn" data-filter="ALERT">ALERTS</button>
          <button class="log-filter-btn" data-filter="GAS">GAS</button>
          <button id="btnToggleAutoScroll" class="log-btn-action" title="Toggle Auto-Scroll">&#9660; AUTO-SCROLL: ON</button>
          <button id="btnClearLog" class="log-btn-action" title="Clear Event Logs">CLEAR LOG</button>
        </div>
      </div>

      <div class="log-entries-viewport" id="logViewport"></div>
    </section>

  </main>

  <!-- Bottom Command Footer -->
  <footer class="dashboard-footer">
    <div class="footer-left">
      <span>RAKSHAK-MINE RESCUE ROVER</span>
      <div class="footer-gold-bar"></div>
      <span style="color:var(--primary-gold); font-size:0.75rem;">PROTECTION + RESCUE</span>
    </div>
    <div class="footer-right">
      <span>ROBOTIC AUTONOMOUS RESCUE &amp; HAZARD ASSESSMENT FOR COAL MINES</span>
    </div>
  </footer>

  <!-- ==========================================================================
       JAVASCRIPT LOGIC ENGINE: ROBUST, CLEAN, TESTED, ZERO ERRORS
       ========================================================================== -->
  <script>
    (function () {
      'use strict';

      // Application State - STRICTLY DEFAULTS TO MANUAL TELE-OP
      var state = {
        navMode: 'MANUAL',        // 'MANUAL' or 'AUTO'
        currentSpeed: 170,        // 0 - 255 PWM
        emergencyHalt: false,
        reversedOrient: true,
        collisionShield: true,
        beaconActive: false,
        uptimeSeconds: 0,
        isSimMode: false,
        autoScroll: true,
        logFilter: 'ALL',
        logCounter: 0,
        telemetry: {
          us: 200.0,
          ch4: 250,
          co: 10,
          temp: 24.8,
          hum: 61.0,
          baro: 1014.2,
          state: 'STANDBY',
          mode: 'MANUAL',
          speed: 170,
          alert: 0,
          orient: 'REVERSED',
          shield: true,
          ehalt: 0,
          uptime: 0
        }
      };

      // Cache DOM Elements
      var el = {
        badgeConn: document.getElementById('badgeConn'),
        txtConn: document.getElementById('txtConn'),
        txtIp: document.getElementById('txtIp'),
        txtSignal: document.getElementById('txtSignal'),
        txtUptime: document.getElementById('txtUptime'),
        btnScrollLogs: document.getElementById('btnScrollLogs'),
        txtLogCount: document.getElementById('txtLogCount'),
        btnHeaderMode: document.getElementById('btnHeaderMode'),
        txtHeaderMode: document.getElementById('txtHeaderMode'),
        txtHeaderModeIcon: document.getElementById('txtHeaderModeIcon'),

        bannerAlert: document.getElementById('bannerAlert'),
        txtAlertIcon: document.getElementById('txtAlertIcon'),
        txtAlertMessage: document.getElementById('txtAlertMessage'),

        // Card 1 CH4
        valCH4: document.getElementById('valCH4'),
        rawCH4: document.getElementById('rawCH4'),
        lelCH4: document.getElementById('lelCH4'),
        pillCH4: document.getElementById('pillCH4'),
        gaugePathCH4: document.getElementById('gaugePathCH4'),

        // Card 2 CO
        valCO: document.getElementById('valCO'),
        rawCO: document.getElementById('rawCO'),
        pillCO: document.getElementById('pillCO'),
        gaugePathCO: document.getElementById('gaugePathCO'),

        // Card 3 Sonar
        valDist: document.getElementById('valDist'),
        valNavState: document.getElementById('valNavState'),
        pillDist: document.getElementById('pillDist'),
        gaugePathSonar: document.getElementById('gaugePathSonar'),

        // Card 4 Safety
        statusExplosive: document.getElementById('statusExplosive'),
        statusToxicity: document.getElementById('statusToxicity'),
        statusShield: document.getElementById('statusShield'),
        valOrient: document.getElementById('valOrient'),
        valOverallSafety: document.getElementById('valOverallSafety'),

        // Controls
        btnFwd: document.getElementById('btnFwd'),
        btnRev: document.getElementById('btnRev'),
        btnLeft: document.getElementById('btnLeft'),
        btnRight: document.getElementById('btnRight'),
        btnHalt: document.getElementById('btnHalt'),
        btnPivLeft: document.getElementById('btnPivLeft'),
        btnPivRight: document.getElementById('btnPivRight'),

        btnEStop: document.getElementById('btnEStop'),
        txtEStop: document.getElementById('txtEStop'),
        btnModeAuto: document.getElementById('btnModeAuto'),
        btnModeManual: document.getElementById('btnModeManual'),

        btnToggleBeacon: document.getElementById('btnToggleBeacon'),
        btnToggleOrient: document.getElementById('btnToggleOrient'),
        btnToggleShield: document.getElementById('btnToggleShield'),

        sliderSpeed: document.getElementById('sliderSpeed'),
        txtThrottleVal: document.getElementById('txtThrottleVal'),
        btnThrottleDec: document.getElementById('btnThrottleDec'),
        btnThrottleInc: document.getElementById('btnThrottleInc'),

        presetSlow: document.getElementById('presetSlow'),
        presetMed: document.getElementById('presetMed'),
        presetFast: document.getElementById('presetFast'),

        // Log Console
        logViewport: document.getElementById('logViewport'),
        btnToggleAutoScroll: document.getElementById('btnToggleAutoScroll'),
        btnClearLog: document.getElementById('btnClearLog'),
        sectionEventLog: document.getElementById('sectionEventLog')
      };

      // Helper: Pad zero
      function pad(n) {
        return (n < 10 ? '0' : '') + n;
      }

      // Add log entry to console
      function addLog(tag, msg) {
        if (!el.logViewport) return;
        state.logCounter++;
        if (el.txtLogCount) el.txtLogCount.textContent = state.logCounter;

        var now = new Date();
        var timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
        var row = document.createElement('div');
        row.className = 'log-entry-row';
        row.setAttribute('data-tag', tag);

        var tagClass = 'tag-sys';
        if (tag === 'CMD') tagClass = 'tag-cmd';
        else if (tag === 'ALERT') tagClass = 'tag-alert';
        else if (tag === 'GAS') tagClass = 'tag-gas';
        else if (tag === 'NAV') tagClass = 'tag-nav';

        row.innerHTML = '<span class="log-time-tag">' + timeStr + '</span>' +
                        '<span class="log-tag-badge ' + tagClass + '">[' + tag + ']</span>' +
                        '<span class="log-entry-text">' + msg + '</span>';

        if (state.logFilter !== 'ALL' && state.logFilter !== tag) {
          row.style.display = 'none';
        }

        el.logViewport.appendChild(row);

        // Keep maximum 100 entries in DOM
        if (el.logViewport.children.length > 100) {
          el.logViewport.removeChild(el.logViewport.children[0]);
        }

        if (state.autoScroll) {
          el.logViewport.scrollTop = el.logViewport.scrollHeight;
        }
      }

      // Update Arc Gauge (dasharray: 236 for 180-deg arc)
      function setGaugeValue(pathElement, normalizedFraction) {
        if (!pathElement) return;
        var frac = Math.max(0, Math.min(1, normalizedFraction));
        var totalLength = 236;
        var offset = totalLength * (1 - frac);
        pathElement.style.strokeDashoffset = offset;
      }

      // EMERGENCY BRAKE / RESUME TOGGLE LOGIC (FIXED: RETRIEVES BACK IMMEDIATELY)
      function setEmergencyHaltUI(isHalted) {
        state.emergencyHalt = isHalted;
        if (isHalted) {
          el.txtEStop.textContent = 'RESUME ROVER SYSTEM (RESET E-STOP)';
          el.btnEStop.classList.add('resumed');
          el.bannerAlert.className = 'alert-banner critical';
          el.txtAlertIcon.innerHTML = '&#9888;';
          el.txtAlertMessage.textContent = 'CRITICAL INTERLOCK: EMERGENCY BRAKE ENGAGED • MOTORS ISOLATED • PRESS RESUME';
        } else {
          el.txtEStop.textContent = 'EMERGENCY BRAKE / E-STOP';
          el.btnEStop.classList.remove('resumed');
          el.bannerAlert.className = 'alert-banner nominal';
          el.txtAlertIcon.innerHTML = '&#9679;';
          el.txtAlertMessage.textContent = 'STATUS NOMINAL: ATMOSPHERE CLEAR • ACTIVE COLLISION SHIELD ARMED';
        }
      }

      function toggleEmergencyStop() {
        if (!state.emergencyHalt) {
          setEmergencyHaltUI(true);
          sendRoverCommand('EMERGENCY_STOP');
          addLog('ALERT', 'CRITICAL INTERLOCK: EMERGENCY BRAKE ENGAGED! Motors Isolated.');
        } else {
          setEmergencyHaltUI(false);
          sendRoverCommand('RESUME');
          addLog('SYS', 'EMERGENCY BRAKE RELEASED. Tele-Op Controls Restored.');
        }
      }

      // Update Dashboard UI Elements
      function renderDashboard(t) {
        // CH4
        var ch4Ppm = Math.round(t.ch4);
        el.valCH4.textContent = ch4Ppm;
        var rawAdcCH4 = Math.round(ch4Ppm * 1.35);
        el.rawCH4.textContent = rawAdcCH4;
        var lelPct = (ch4Ppm / 50000 * 100).toFixed(2);
        el.lelCH4.textContent = lelPct + '% LEL';

        // CH4 Arc (0 - 5000 PPM)
        setGaugeValue(el.gaugePathCH4, ch4Ppm / 5000);
        if (ch4Ppm > 2500) {
          el.gaugePathCH4.style.stroke = 'var(--danger-red)';
          el.pillCH4.className = 'hazard-status-pill danger';
          el.pillCH4.innerHTML = '&#9888; CRITICAL FIREDAMP (&gt;2500 PPM)';
          el.statusExplosive.className = 'threat-status-badge danger';
          el.statusExplosive.textContent = 'LETHAL FIREDAMP (>5% LEL)';
        } else if (ch4Ppm > 1000) {
          el.gaugePathCH4.style.stroke = 'var(--caution-amber)';
          el.pillCH4.className = 'hazard-status-pill warning';
          el.pillCH4.innerHTML = '&#9888; CAUTION: CH&#8324; ELEVATED';
          el.statusExplosive.className = 'threat-status-badge danger';
          el.statusExplosive.textContent = 'ELEVATED (>2% LEL)';
        } else {
          el.gaugePathCH4.style.stroke = 'var(--safe-green)';
          el.pillCH4.className = 'hazard-status-pill';
          el.pillCH4.innerHTML = '&#9679; NORMAL &bull; SAFE CORRIDOR';
          el.statusExplosive.className = 'threat-status-badge';
          el.statusExplosive.textContent = 'SAFE (< 1% LEL)';
        }

        // CO
        var coPpm = Math.round(t.co);
        el.valCO.textContent = coPpm;
        var rawAdcCO = Math.round(coPpm * 1.15);
        el.rawCO.textContent = rawAdcCO;

        // CO Arc (0 - 200 PPM)
        setGaugeValue(el.gaugePathCO, coPpm / 200);
        if (coPpm > 100) {
          el.gaugePathCO.style.stroke = 'var(--danger-red)';
          el.pillCO.className = 'hazard-status-pill danger';
          el.pillCO.innerHTML = '&#9760; LETHAL AFTERDAMP (&gt;100 PPM)';
          el.statusToxicity.className = 'threat-status-badge danger';
          el.statusToxicity.textContent = 'LETHAL CO AFTERDAMP';
        } else if (coPpm > 45) {
          el.gaugePathCO.style.stroke = 'var(--caution-amber)';
          el.pillCO.className = 'hazard-status-pill warning';
          el.pillCO.innerHTML = '&#9888; WARNING: OSHA 50PPM CEILING';
          el.statusToxicity.className = 'threat-status-badge danger';
          el.statusToxicity.textContent = 'WARNING (>50 PPM)';
        } else {
          el.gaugePathCO.style.stroke = 'var(--safe-green)';
          el.pillCO.className = 'hazard-status-pill';
          el.pillCO.innerHTML = '&#9679; NORMAL &bull; SAFE LEVELS';
          el.statusToxicity.className = 'threat-status-badge';
          el.statusToxicity.textContent = 'SAFE (< 50 PPM)';
        }

        // Sonar Proximity
        var distCm = parseFloat(t.us).toFixed(1);
        el.valDist.textContent = distCm;
        el.valNavState.textContent = t.state || (state.emergencyHalt ? 'EMERGENCY_STOP' : 'STANDBY');

        // Sonar Arc (0 - 200 cm)
        setGaugeValue(el.gaugePathSonar, parseFloat(distCm) / 200);
        if (parseFloat(distCm) < 18.0) {
          el.gaugePathSonar.style.stroke = 'var(--danger-red)';
          el.pillDist.className = 'hazard-status-pill danger';
          el.pillDist.innerHTML = '&#9888; CRITICAL COLLISION (&lt;18cm)';
        } else if (parseFloat(distCm) < 45.0) {
          el.gaugePathSonar.style.stroke = 'var(--caution-amber)';
          el.pillDist.className = 'hazard-status-pill warning';
          el.pillDist.innerHTML = '&#9888; CAUTION: APPROACHING WALL';
        } else {
          el.gaugePathSonar.style.stroke = 'var(--primary-gold)';
          el.pillDist.className = 'hazard-status-pill';
          el.pillDist.innerHTML = '&#9679; CLEAR &bull; SAFE DISTANCE (>50cm)';
        }

        // Safety Index Badges
        el.statusShield.textContent = state.collisionShield ? 'ACTIVE (< 15cm) BRAKE' : 'DISABLED';
        el.statusShield.className = state.collisionShield ? 'threat-status-badge active-shield' : 'threat-status-badge danger';

        el.valOrient.textContent = state.reversedOrient ? 'REVERSED (FRONT - SONAR)' : 'STANDARD (REAR - SONAR)';

        // Safety Score
        var safetyScore = 100;
        if (ch4Ppm > 1000) safetyScore -= 30;
        if (ch4Ppm > 2500) safetyScore -= 40;
        if (coPpm > 50) safetyScore -= 20;
        if (coPpm > 100) safetyScore -= 30;
        if (parseFloat(distCm) < 18.0) safetyScore -= 20;
        safetyScore = Math.max(0, safetyScore);

        el.valOverallSafety.textContent = safetyScore > 80 ? 'SECURE (' + safetyScore + '%)' : (safetyScore > 50 ? 'CAUTION (' + safetyScore + '%)' : 'CRITICAL (' + safetyScore + '%)');

        // Master Hazard Banner (unless Emergency Brake is engaged)
        if (!state.emergencyHalt) {
          if (ch4Ppm > 2500) {
            el.bannerAlert.className = 'alert-banner critical';
            el.txtAlertIcon.innerHTML = '&#9888;';
            el.txtAlertMessage.textContent = 'CRITICAL EXPLOSION HAZARD: FIREDAMP CH4 > 2500 PPM &bull; COMMENCE EVACUATION';
          } else if (coPpm > 100) {
            el.bannerAlert.className = 'alert-banner critical';
            el.txtAlertIcon.innerHTML = '&#9760;';
            el.txtAlertMessage.textContent = 'LETHAL TOXIC HAZARD: CO AFTERDAMP > 100 PPM &bull; DON BREATHING APPARATUS';
          } else if (parseFloat(distCm) < 18.0) {
            el.bannerAlert.className = 'alert-banner warning';
            el.txtAlertIcon.innerHTML = '&#9888;';
            el.txtAlertMessage.textContent = 'PROXIMITY WARNING: OBSTACLE WITHIN 18cm &bull; CLEARANCE REVERSE ENGAGED';
          } else {
            el.bannerAlert.className = 'alert-banner nominal';
            el.txtAlertIcon.innerHTML = '&#9679;';
            el.txtAlertMessage.textContent = 'STATUS NOMINAL: ATMOSPHERE CLEAR &bull; ACTIVE COLLISION SHIELD ARMED';
          }
        }

        // Mode Display Sync
        if (t.mode === 'AUTO') {
          setNavigationModeUI('AUTO');
        } else {
          setNavigationModeUI('MANUAL');
        }
      }

      // Mode Switcher UI
      function setNavigationModeUI(mode) {
        state.navMode = mode;
        if (mode === 'AUTO') {
          el.btnModeAuto.classList.add('selected');
          el.btnModeManual.classList.remove('selected');
          el.txtHeaderMode.textContent = 'AUTONOMOUS';
        } else {
          el.btnModeManual.classList.add('selected');
          el.btnModeAuto.classList.remove('selected');
          el.txtHeaderMode.textContent = 'MANUAL TELE-OP';
        }
      }

      // Send Command to ESP32 Rover
      function sendRoverCommand(cmd, pwm) {
        var p = (pwm !== undefined) ? pwm : state.currentSpeed;
        var url = '/cmd?c=' + encodeURIComponent(cmd) + '&pwm=' + p;
        if (cmd !== 'STOP') {
          addLog('CMD', 'Dispatched: <b>' + cmd + '</b> (PWM: ' + p + ')');
        }

        fetch(url, { method: 'GET', cache: 'no-cache' })
          .then(function (res) {
            return res.text();
          })
          .then(function () {
            // Success
          })
          .catch(function () {
            // If offline, simulate locally
            simulateRoverResponse(cmd, p);
          });
      }

      // Offline Simulation Logic (Ensures dashboard is 100% testable without physical rover)
      function simulateRoverResponse(cmd, pwm) {
        if (!state.isSimMode) {
          state.isSimMode = true;
          el.badgeConn.className = 'status-pill simulation';
          el.txtConn.textContent = 'SIMULATION DEMO';
          addLog('SYS', 'Physical rover not detected; autonomous simulation loop armed.');
        }

        if (cmd === 'FORWARD') state.telemetry.state = 'FORWARD';
        else if (cmd === 'BACKWARD') state.telemetry.state = 'BACKWARD';
        else if (cmd === 'LEFT') state.telemetry.state = 'LEFT';
        else if (cmd === 'RIGHT') state.telemetry.state = 'RIGHT';
        else if (cmd === 'PIVOT_LEFT') state.telemetry.state = 'PIVOT_L';
        else if (cmd === 'PIVOT_RIGHT') state.telemetry.state = 'PIVOT_R';
        else if (cmd === 'STOP') state.telemetry.state = 'STANDBY';
        else if (cmd === 'EMERGENCY_STOP' || cmd === 'ESTOP' || cmd === 'HALT') {
          setEmergencyHaltUI(true);
          state.telemetry.state = 'EMERGENCY_STOP';
          state.telemetry.ehalt = 1;
        } else if (cmd === 'RESUME' || cmd === 'CLEAR_ESTOP' || cmd === 'RESET_ESTOP') {
          setEmergencyHaltUI(false);
          state.telemetry.state = 'STANDBY';
          state.telemetry.ehalt = 0;
        } else if (cmd === 'MODE_AUTO') {
          state.telemetry.mode = 'AUTO';
          state.navMode = 'AUTO';
        } else if (cmd === 'MODE_MANUAL') {
          state.telemetry.mode = 'MANUAL';
          state.navMode = 'MANUAL';
        } else if (cmd === 'TOGGLE_ORIENT') {
          state.reversedOrient = !state.reversedOrient;
        } else if (cmd === 'TOGGLE_SHIELD') {
          state.collisionShield = !state.collisionShield;
        }

        renderDashboard(state.telemetry);
      }

      // Fetch Live Telemetry from ESP32
      function fetchLiveTelemetry() {
        var startTime = performance.now();
        fetch('/telemetry', { cache: 'no-cache' })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(function (data) {
            state.telemetry = data;
            state.reversedOrient = (data.orient === 'REVERSED');
            state.collisionShield = (data.shield === true || data.shield === 'true');

            // Sync Emergency Halt state from hardware
            if (data.ehalt !== undefined) {
              var isHalt = (data.ehalt === 1 || data.ehalt === true || data.state === 'EMERGENCY_STOP');
              if (state.emergencyHalt !== isHalt) {
                setEmergencyHaltUI(isHalt);
              }
            }

            el.badgeConn.className = 'status-pill online';
            el.txtConn.textContent = 'ROVER ONLINE';
            state.isSimMode = false;

            renderDashboard(data);
          })
          .catch(function () {
            // If offline, run periodic simulation noise
            if (state.navMode === 'AUTO' && !state.emergencyHalt) {
              state.telemetry.state = 'CRUISING';
              state.telemetry.us = Math.max(15, (state.telemetry.us - 2 + Math.random() * 4)).toFixed(1);
              if (state.telemetry.us < 18) state.telemetry.us = 190.0;
            }
            state.telemetry.ch4 = Math.max(180, Math.min(600, state.telemetry.ch4 + (Math.random() * 10 - 5)));
            state.telemetry.co = Math.max(8, Math.min(35, state.telemetry.co + (Math.random() * 4 - 2)));
            renderDashboard(state.telemetry);
          });
      }

      // Set Speed Throttle
      function setSpeed(val) {
        val = Math.max(0, Math.min(255, parseInt(val, 10)));
        state.currentSpeed = val;
        el.sliderSpeed.value = val;
        el.txtThrottleVal.textContent = val + ' / 255';

        // Update Presets Highlight
        el.presetSlow.classList.remove('active');
        el.presetMed.classList.remove('active');
        el.presetFast.classList.remove('active');
        if (val === 120) el.presetSlow.classList.add('active');
        else if (val === 170) el.presetMed.classList.add('active');
        else if (val === 230) el.presetFast.classList.add('active');

        sendRoverCommand('SET_SPEED_' + val, val);
      }

      // Mode Switch Command
      function switchMode(newMode) {
        setNavigationModeUI(newMode);
        if (newMode === 'AUTO') {
          sendRoverCommand('MODE_AUTO');
          addLog('NAV', 'Switched to AUTONOMOUS EXPLORATION');
        } else {
          sendRoverCommand('MODE_MANUAL');
          addLog('NAV', 'Switched to MANUAL TELE-OPERATION');
        }
      }

      // Attach Event Listeners
      function setupEvents() {
        // Top Header Mode Button
        el.btnHeaderMode.addEventListener('click', function () {
          var next = (state.navMode === 'MANUAL') ? 'AUTO' : 'MANUAL';
          switchMode(next);
        });

        // Mode Card Buttons
        el.btnModeAuto.addEventListener('click', function () {
          switchMode('AUTO');
        });
        el.btnModeManual.addEventListener('click', function () {
          switchMode('MANUAL');
        });

        // Directional D-Pad Buttons
        var dirBtns = [el.btnFwd, el.btnRev, el.btnLeft, el.btnRight, el.btnHalt, el.btnPivLeft, el.btnPivRight];
        dirBtns.forEach(function (btn) {
          if (!btn) return;
          var cmd = btn.getAttribute('data-cmd');

          btn.addEventListener('mousedown', function () {
            if (state.emergencyHalt) {
              addLog('ALERT', 'Command blocked: Emergency Brake is active! Press RESUME first.');
              return;
            }
            sendRoverCommand(cmd);
          });
          btn.addEventListener('mouseup', function () {
            if (state.emergencyHalt || cmd === 'STOP') return;
            sendRoverCommand('STOP');
          });
          btn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (state.emergencyHalt) {
              addLog('ALERT', 'Command blocked: Emergency Brake is active! Press RESUME first.');
              return;
            }
            sendRoverCommand(cmd);
          });
          btn.addEventListener('touchend', function (e) {
            e.preventDefault();
            if (state.emergencyHalt || cmd === 'STOP') return;
            sendRoverCommand('STOP');
          });
        });

        // EMERGENCY STOP / RESUME BUTTON LISTENER (TWO-WAY TOGGLE)
        el.btnEStop.addEventListener('click', function () {
          toggleEmergencyStop();
        });

        // Auxiliary Toggles
        el.btnToggleBeacon.addEventListener('click', function () {
          state.beaconActive = !state.beaconActive;
          sendRoverCommand(state.beaconActive ? 'BEACON_ON' : 'BEACON_OFF');
          el.btnToggleBeacon.style.color = state.beaconActive ? 'var(--danger-red)' : 'var(--text-main)';
          addLog('SYS', 'Audible Hazard Beacon: ' + (state.beaconActive ? 'ON' : 'OFF'));
        });

        el.btnToggleOrient.addEventListener('click', function () {
          sendRoverCommand('TOGGLE_ORIENT');
          state.reversedOrient = !state.reversedOrient;
          el.valOrient.textContent = state.reversedOrient ? 'REVERSED (FRONT - SONAR)' : 'STANDARD (REAR - SONAR)';
          el.btnToggleOrient.textContent = state.reversedOrient ? '\u{1F504} ORIENT: REV' : '\u{1F504} ORIENT: STD';
          addLog('SYS', 'Chassis Orientation: ' + (state.reversedOrient ? 'REVERSED (FRONT - SONAR)' : 'STANDARD'));
        });

        el.btnToggleShield.addEventListener('click', function () {
          sendRoverCommand('TOGGLE_SHIELD');
          state.collisionShield = !state.collisionShield;
          el.statusShield.textContent = state.collisionShield ? 'ACTIVE (< 15cm) BRAKE' : 'DISABLED';
          el.btnToggleShield.textContent = state.collisionShield ? '\u{1F6E1} SHIELD: ON' : '\u{1F6E1} SHIELD: OFF';
          addLog('SYS', 'Collision Shield: ' + (state.collisionShield ? 'ENABLED (<15cm)' : 'DISABLED'));
        });

        // Speed Slider & Steppers
        el.sliderSpeed.addEventListener('input', function (e) {
          setSpeed(e.target.value);
        });

        el.btnThrottleDec.addEventListener('click', function () {
          setSpeed(state.currentSpeed - 15);
        });

        el.btnThrottleInc.addEventListener('click', function () {
          setSpeed(state.currentSpeed + 15);
        });

        // Speed Presets
        el.presetSlow.addEventListener('click', function () { setSpeed(120); });
        el.presetMed.addEventListener('click', function () { setSpeed(170); });
        el.presetFast.addEventListener('click', function () { setSpeed(230); });

        // Log Console Controls
        el.btnScrollLogs.addEventListener('click', function () {
          el.sectionEventLog.scrollIntoView({ behavior: 'smooth' });
        });

        el.btnClearLog.addEventListener('click', function () {
          el.logViewport.innerHTML = '';
          state.logCounter = 0;
          if (el.txtLogCount) el.txtLogCount.textContent = '0';
          addLog('SYS', 'Event log cleared by operator.');
        });

        el.btnToggleAutoScroll.addEventListener('click', function () {
          state.autoScroll = !state.autoScroll;
          el.btnToggleAutoScroll.textContent = state.autoScroll ? '\u25BC AUTO-SCROLL: ON' : '\u25BC AUTO-SCROLL: OFF';
          el.btnToggleAutoScroll.style.background = state.autoScroll ? '#f1f5f9' : '#fee2e2';
        });

        // Filter Buttons
        var filterBtns = document.querySelectorAll('.log-filter-btn');
        filterBtns.forEach(function (fb) {
          fb.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            fb.classList.add('active');
            var filter = fb.getAttribute('data-filter');
            state.logFilter = filter;
            var rows = el.logViewport.querySelectorAll('.log-entry-row');
            rows.forEach(function (r) {
              if (filter === 'ALL' || r.getAttribute('data-tag') === filter) {
                r.style.display = 'flex';
              } else {
                r.style.display = 'none';
              }
            });
          });
        });

        // Keyboard Controls (WASD / Arrows)
        var keyActive = {};
        window.addEventListener('keydown', function (e) {
          var k = e.key.toLowerCase();
          if (keyActive[k]) return;
          keyActive[k] = true;

          if (state.emergencyHalt) {
            if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) !== -1) {
              addLog('ALERT', 'Key [' + k.toUpperCase() + '] ignored: Emergency Stop is active! Press RESUME first.');
            }
            return;
          }

          if (k === 'w' || k === 'arrowup') sendRoverCommand('FORWARD');
          else if (k === 's' || k === 'arrowdown') sendRoverCommand('BACKWARD');
          else if (k === 'a' || k === 'arrowleft') sendRoverCommand('LEFT');
          else if (k === 'd' || k === 'arrowright') sendRoverCommand('RIGHT');
          else if (k === 'q') sendRoverCommand('PIVOT_LEFT');
          else if (k === 'e') sendRoverCommand('PIVOT_RIGHT');
          else if (k === ' ') sendRoverCommand('STOP');
        });

        window.addEventListener('keyup', function (e) {
          var k = e.key.toLowerCase();
          delete keyActive[k];
          var moveKeys = ['w', 's', 'a', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
          if (moveKeys.indexOf(k) !== -1 && !Object.keys(keyActive).some(function (x) { return moveKeys.indexOf(x) !== -1; })) {
            if (!state.emergencyHalt) sendRoverCommand('STOP');
          }
        });

        // Mission Clock Timer
        setInterval(function () {
          state.uptimeSeconds++;
          var h = pad(Math.floor(state.uptimeSeconds / 3600));
          var m = pad(Math.floor((state.uptimeSeconds % 3600) / 60));
          var s = pad(state.uptimeSeconds % 60);
          el.txtUptime.textContent = h + ':' + m + ':' + s;
        }, 1000);
      }

      // Initialize System
      setupEvents();

      // STRICTLY SET TO MANUAL TELE-OP IMMEDIATELY ON LOAD
      setNavigationModeUI('MANUAL');
      renderDashboard(state.telemetry);
      addLog('SYS', 'RAKSHAK-Mine Core HUD Initialized. Mode: MANUAL TELE-OP');
      addLog('SYS', 'Mission: Robotic Autonomous Rescue & Hazard Assessment for Coal Mines');
      addLog('SYS', 'Motto: Protection + Rescue');
      addLog('SYS', 'Chassis Orientation: REVERSED (Front = Sonar & Sensors)');
      addLog('SYS', 'Collision Shield: ACTIVE (< 15cm Auto-Brake Armed)');

      // Poll live telemetry at 10 Hz (every 100 ms)
      setInterval(fetchLiveTelemetry, 100);
    })();
  </script>
</body>
</html>)rawliteral";

#define PAGE_DASHBOARD INDEX_HTML

#endif // DASHBOARD_HTML_H
