'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Camera, 
  Disc, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Radio, 
  AlertCircle,
  Download,
  Wifi,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { RoverCombinedStatus } from '@/types/rover';

interface LiveCameraFeedProps {
  status?: RoverCombinedStatus;
  streamUrl?: string;
  defaultImage?: string;
}

export const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({
  status,
  streamUrl = 'http://localhost:8080/stream',
  defaultImage = '/assets/mine_photo.jpg',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNightVision, setIsNightVision] = useState(false); // Default to crisp natural color mode
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [snapshotNotice, setSnapshotNotice] = useState<string | null>(null);
  const [recordingNotice, setRecordingNotice] = useState<string | null>(null);
  const [useLiveStream, setUseLiveStream] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [currentTime, setCurrentTime] = useState('2025-09-08 14:32:18');

  // Live HUD clock formatted to YYYY-MM-DD HH:mm:ss
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  const handleSnapshot = () => {
    // 1. White flash animation
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 250);

    // 2. Timestamped name
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const snapName = `RAKSHAK_snapshot_${timestamp}.jpg`;

    // 3. Show toast notification
    setSnapshotNotice(`Snapshot captured: ${snapName}`);
    setTimeout(() => setSnapshotNotice(null), 3500);

    // 4. Trigger download of the current image
    const link = document.createElement('a');
    link.href = defaultImage;
    link.download = snapName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const mins = Math.floor(recordSeconds / 60).toString().padStart(2, '0');
      const secs = (recordSeconds % 60).toString().padStart(2, '0');
      setRecordingNotice(`Recording saved: RAKSHAK_REC_${mins}m${secs}s.mp4`);
      setTimeout(() => setRecordingNotice(null), 3500);
    } else {
      setIsRecording(true);
      setRecordingNotice('Recording started...');
      setTimeout(() => setRecordingNotice(null), 2000);
    }
  };

  const formatRecordTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const depthVal = status?.depth_m !== undefined ? status.depth_m : -310;

  return (
    <div className="h-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* 1. Header: Video Icon, Live Camera Feed, Night Vision & LIVE badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              Live Camera Feed
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Sony IMX291 Starvis Sensor • 1080p 60fps
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Night Vision Mode Switch */}
          <button
            onClick={() => setIsNightVision(!isNightVision)}
            title="Toggle IR-CUT / Night Vision Mode"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isNightVision
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${isNightVision ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{isNightVision ? 'IR Night Vision' : 'Crisp Color Mode'}</span>
          </button>

          {/* ● LIVE Red Pulse Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500 text-white shadow-sm shadow-red-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </span>
        </div>
      </div>

      {/* 2. Video display container with HUD overlay */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 min-h-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 select-none group"
      >
        {/* Live Stream / Camera Image Feed */}
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
          {useLiveStream && !streamError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streamUrl}
              alt="RAKSHAK-Mine Live Stream"
              onError={() => setStreamError(true)}
              className={`w-full h-full object-cover object-center transition-all duration-300 ${
                isNightVision ? 'contrast-125 brightness-110 hue-rotate-15 saturate-50' : 'contrast-105 brightness-100'
              }`}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={defaultImage}
              alt="Underground Mine Tunnel Camera Feed"
              className={`w-full h-full object-cover object-center transition-all duration-300 ${
                isNightVision ? 'contrast-125 brightness-110 hue-rotate-15 saturate-50' : 'contrast-105 brightness-100'
              }`}
            />
          )}

          {/* IR Night Vision Phosphor & Scanline Overlay Effect */}
          {isNightVision && (
            <>
              <div className="absolute inset-0 bg-emerald-950/25 mix-blend-color-dodge pointer-events-none" />
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(16, 185, 129, 0.2) 0px, rgba(16, 185, 129, 0.2) 1px, transparent 1px, transparent 3px)',
                }}
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 font-mono text-[11px] font-bold shadow">
                <Sparkles className="w-3 h-3" />
                <span>IR-CUT 850nm ACTIVE</span>
              </div>
            </>
          )}

          {/* Snapshot Flash Animation Overlay */}
          {snapshotFlash && (
            <div className="absolute inset-0 bg-white/95 z-30 transition-opacity duration-200 pointer-events-none animate-out fade-out" />
          )}

          {/* Top-Right HUD: Night-vision timestamp overlay */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600/90 text-white font-mono text-xs font-bold animate-pulse shadow">
                <span className="w-2.5 h-2.5 rounded-full bg-white inline-block"></span>
                <span>REC {formatRecordTime(recordSeconds)}</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-white/90 font-mono text-xs font-bold tracking-wider shadow">
              {currentTime}
            </div>
          </div>

          {/* Crosshair / Reticle Center Target */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-12 h-12 border border-dashed border-sky-400/60 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
            </div>
          </div>

          {/* Right-Side Overlay Controls: Snapshot, Record, Fullscreen */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Snapshot Button */}
            <button
              onClick={handleSnapshot}
              title="Capture Snapshot & Download"
              className="p-2.5 rounded-lg bg-black/65 hover:bg-black/85 text-white/90 hover:text-white border border-white/20 backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer hover:border-sky-400"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Record Button */}
            <button
              onClick={toggleRecording}
              title={isRecording ? 'Stop Recording' : 'Start Video Recording'}
              className={`p-2.5 rounded-lg border backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 text-white border-red-400 ring-2 ring-red-500/50' 
                  : 'bg-black/65 hover:bg-black/85 text-white/90 hover:text-white border-white/20 hover:border-red-400'
              }`}
            >
              <Disc className={`w-4 h-4 ${isRecording ? 'animate-spin' : ''}`} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2.5 rounded-lg bg-black/65 hover:bg-black/85 text-white/90 hover:text-white border border-white/20 backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer hover:border-sky-400"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Snapshot Notification Toast */}
          {snapshotNotice && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/80 text-xs text-white font-medium shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">{snapshotNotice}</span>
            </div>
          )}

          {/* Recording Notification Toast */}
          {recordingNotice && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-red-500/80 text-xs text-white font-medium shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Disc className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="font-mono text-[11px]">{recordingNotice}</span>
            </div>
          )}
        </div>

        {/* 3. Bottom HUD Overlay Bar: RAKSHAK Cam 1 | Depth: -310 m */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-4 pb-2 px-3 flex items-center justify-between text-xs text-slate-200 z-20">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-white tracking-wide">
              RAKSHAK Cam 1
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-sky-400 font-bold">
              Depth: {depthVal} m
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/30 text-sky-300 text-[11px] font-semibold">
              {isNightVision ? '1080p • IR NIGHT VISION' : '1080p • RGB NATURAL COLOR'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stream Fallback & Latency Bar */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>Bitrate: 4.2 Mbps</span>
          </span>
          <span>•</span>
          <span>Latency: ~48 ms</span>
        </div>
        <button
          onClick={() => {
            setUseLiveStream(!useLiveStream);
            setStreamError(false);
          }}
          className="text-sky-600 hover:text-sky-700 font-semibold underline decoration-dotted text-[11px] cursor-pointer"
        >
          {useLiveStream ? 'Switch to Test Feed' : 'Connect Live Stream'}
        </button>
      </div>
    </div>
  );
};

export default LiveCameraFeed;
