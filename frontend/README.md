# 💻 RAKSHAK-MINE Mission Control Frontend

Surface Station Command & Telemetry Dashboard for Project RAKSHAK-MINE, built with **Next.js 14**, **React 18**, **TypeScript**, and **Tailwind CSS**.

---

## 📋 Features

* **14 Subsystem Routes**:
  - `dashboard`: Real-time mission overview with sensor cards, cameras, gas dials, survivor audio, and maps.
  - `rover-control`: Full-screen tactical teleoperation with PWM speed control, keyboard driving (WASD/arrows), and live camera stream.
  - `live-camera`: Optical & thermal viewport with snapshot downloads and fullscreen support.
  - `environment`: Tunnel climate, temperature, humidity, and barometric depth equivalent.
  - `gas-monitoring`: Real-time dynamic dials for $CH_4$, $CO$, $CO_2$, $O_2$, and $H_2S$ with DGMS CMR 2017 thresholds.
  - `mine-map`: Interactive spatial grid of Incline Drift 4B with zoom (0.75x–2.5x) and hazard waypoints.
  - `hazard-analysis`: YOLOv8 geotechnical rockfall assessment and strata stress monitoring.
  - `survivor-detection`: 320 Hz acoustic tapping and thermal biometric localization.
  - `communication`: Dual LoRa / acoustic surface-to-rover PTT voice and text intercom.
  - `power-monitoring`: 3S Li-ion battery pack discharge curve and BMS health diagnostics.
  - `alerts`: Circular FIFO alert logs with severity badges.
  - `incident-reports`: Official DGMS Form-IV incident dossier export.
  - `dgms-compliance`: Coal Mines Regulations 2017 preset selector and audit checklists.
  - `settings`: Surface backend URL configuration and simulation mode toggle.
* **Global Navigation & Breadcrumb Bar**:
  - `← Back to Dashboard` navigation bar with breadcrumb tracking on all subsystem views.
* **Tactical Teleoperation Cockpit Modal**:
  - Quick popup modal accessible from anywhere on the dashboard.
  - Directional controls, PWM slider (100–255), throttled key repeats, and backdrop close.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

### Development Server
```bash
npm install
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

### Production Build
```bash
npm run build
npm run start
```
Verified clean build passing with zero TypeScript/ESLint warnings or errors.

---

## 📁 Key File Structure

```
frontend/src/
├── app/
│   ├── layout.tsx                 # Root layout & page metadata
│   ├── page.tsx                   # Master dashboard & breadcrumb subsystem renderer
│   └── globals.css                # Custom glassmorphism, scrollbar, and layout styles
├── components/
│   ├── GasMonitoringGauges.tsx    # DGMS atmospheric gas gauges
│   ├── HazardAndTriage.tsx        # YOLOv8 Geotechnical rockfall & triage
│   ├── Header.tsx                 # Status badges, clock, E-Stop, and alert drawer
│   ├── LiveCameraFeed.tsx         # Camera HUD with live stream & snapshot
│   ├── LogsProtocolsReportRow.tsx # Event logs & Form-IV report generation
│   ├── MineMapCard.tsx            # Subterranean spatial map & waypoints
│   ├── PowerMonitoringCard.tsx    # 3S battery discharge curve & BMS
│   ├── RoverControlModal.tsx      # Tactical teleoperation cockpit modal
│   ├── Sidebar.tsx                # 14-item navigation drawer with badge alerts
│   ├── StatusCardsRow.tsx         # Rover status, battery gauge, and telemetry cards
│   ├── SubsystemViews.tsx         # Fullscreen views for all 14 routes
│   ├── SurvivorAudioWaveform.tsx  # Web Audio API 320 Hz survivor tapping analyzer
│   └── TwoWayCommunication.tsx    # Surface-to-drift PTT voice & LoRa intercom
├── lib/
│   ├── api.ts                     # Telemetry REST & WebSocket client with mock fallback
│   └── utils.ts                   # Tailwind merge & styling utilities
└── types/
    ├── rover.ts                   # Hardware & teleoperation types
    └── telemetry.ts               # Sensor data contracts & alert schemas
```
