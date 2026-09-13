'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Play, 
  Square, 
  Radio, 
  Volume2
} from 'lucide-react';
import { RoverCombinedStatus } from '@/types/rover';

interface SurvivorAudioWaveformProps {
  status?: RoverCombinedStatus;
}

export const SurvivorAudioWaveform: React.FC<SurvivorAudioWaveformProps> = ({ status }) => {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Baseline 24 bar spectrum heights
  const defaultHeights = [
    14, 20, 28, 18, 32, 40, 24, 16, 36, 48, 42, 30, 
    52, 44, 26, 20, 38, 32, 16, 12, 26, 36, 18, 10
  ];

  const [barHeights, setBarHeights] = useState<number[]>(defaultHeights);

  // Animate waveform bars: higher dynamic fluctuations when listening
  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map((base, idx) => {
          // Dynamic jitter with enhanced amplitude when listening live
          const multiplier = isListening ? 1.6 : 0.8;
          const variance =
            (Math.sin(Date.now() / 200 + idx * 0.5) * 8 +
              Math.cos(Date.now() / 150 + idx * 0.35) * 6) * multiplier;
          const dynamicHeight = Math.min(54, Math.max(6, base + variance));
          return Math.round(dynamicHeight);
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  // Audio synthesis feedback via Web Audio API oscillator
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          // Continuous subtle ambient tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, ctx.currentTime); // 320 Hz human voice formant
          gain.gain.setValueAtTime(0.03, ctx.currentTime);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();

          oscRef.current = osc;
          gainRef.current = gain;

          // Periodic rhythmic tapping ping (every 1.2s to simulate detected survivor acoustic tapping)
          pulseIntervalRef.current = setInterval(() => {
            if (ctx.state === 'suspended') {
              ctx.resume();
            }
            if (gainRef.current) {
              const now = ctx.currentTime;
              gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
              gainRef.current.gain.setValueAtTime(0.08, now);
              gainRef.current.gain.exponentialRampToValueAtTime(0.02, now + 0.15);
            }
          }, 1200);
        }
      } catch (err) {
        console.warn('Web Audio playback error or autoplay policy restricted:', err);
      }
    } else {
      setIsListening(false);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {
          // ignore
        }
        oscRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
        audioContextRef.current = null;
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const isTapping = status?.acoustic_tapping_detected ?? true;
  const isVoice = status?.voice_detected ?? true;
  const confidence = status?.audio_confidence ?? 87;
  const ambientDb = status?.audio_ambient_db ?? 42.0;

  const alertText = isTapping && !isVoice
    ? 'Acoustic Tapping Detected'
    : 'Possible Human Voice Detected';

  return (
    <div className="h-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* 1. Header: Soundwave icon, Survivor Audio Detection */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              Survivor Audio Detection
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              INMP441 I2S Digital MEMS Mic • 300Hz–3.4kHz Bandpass
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          <Radio className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
          <span>{ambientDb.toFixed(1)} dB</span>
        </div>
      </div>

      {/* 2. Animated 24-bar SVG Audio Frequency Spectrum */}
      <div className="flex-1 min-h-[4.2rem] flex items-center justify-center py-2 px-1">
        <svg
          className="w-full h-14"
          viewBox="0 0 360 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="audioBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="audioVoiceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          {barHeights.map((h, i) => {
            const barWidth = 6;
            const barSpacing = 14.5;
            const x = 8 + i * barSpacing;
            const y = 56 - h;
            const isSpeechFormant = i >= 8 && i <= 15;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={3}
                fill={isSpeechFormant ? "url(#audioVoiceGrad)" : "url(#audioBarGrad)"}
                className="transition-all duration-100 ease-out"
              />
            );
          })}
        </svg>
      </div>

      {/* 3. Red/Amber Alert Pill */}
      <div className="my-2.5 bg-rose-50 border border-rose-200/80 rounded-lg px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-300">
            <AlertCircle className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-rose-700 tracking-tight">
            {alertText}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-rose-500 bg-rose-100/70 px-2 py-0.5 rounded">
          Ch. 1 Mic (1.2 Hz Taps)
        </span>
      </div>

      {/* 4. Footer: Confidence 87%, Listen Live Toggle Button */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">
            Confidence:
          </span>
          <span className="text-xs font-bold text-slate-800 font-mono">
            {confidence}%
          </span>
        </div>

        {/* ▶ Listen Live / ⏹ Stop Listening Button */}
        <button
          onClick={toggleListening}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
            isListening
              ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/30'
              : 'bg-sky-600 hover:bg-sky-700 text-white border-transparent shadow-sky-500/20'
          }`}
        >
          {isListening ? (
            <>
              <Square className="w-3 h-3 fill-rose-600 text-rose-600" />
              <span>⏹ Stop Listening</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block ml-0.5" />
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-white text-white" />
              <span>▶ Listen Live</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SurvivorAudioWaveform;
