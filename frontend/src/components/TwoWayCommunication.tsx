"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Mic,
  Send,
  Radio,
  Volume2,
  CheckCheck,
  Headphones,
  Signal,
  Sparkles,
  Play,
  Square,
  CornerDownLeft,
} from "lucide-react";
import { ChatMessage } from "@/types/telemetry";

interface TwoWayCommunicationProps {
  className?: string;
  roverId?: string;
  onSendMessage?: (message: string, recipient: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    timestamp: "14:28",
    sender: "Surface Cmd",
    recipient: "RAKSHAK-Mine",
    message: "RAKSHAK-Mine, proceed to Mine Gallery B-4 and report atmospheric conditions.",
    type: "text",
    status: "ACK",
  },
  {
    id: "msg-2",
    timestamp: "14:29",
    sender: "RAKSHAK-Mine",
    recipient: "Surface Cmd",
    message: "Affirmative. Gallery B-4 reached. Ambient CO 14 ppm, CH4 0.4%. Acoustic sensor armed.",
    type: "text",
    status: "ACK",
  },
  {
    id: "msg-3",
    timestamp: "14:30",
    sender: "Surface Cmd",
    recipient: "RAKSHAK-Mine",
    message: "Acoustic tap detected in sector 3. Verify thermal hotspot.",
    type: "text",
    status: "ACK",
  },
  {
    id: "msg-4",
    timestamp: "14:31",
    sender: "RAKSHAK-Mine",
    recipient: "Surface Cmd",
    message: "Scanning thermal signature... Hotspot detected at 36.8°C. Possible survivor localized.",
    type: "text",
    status: "ACK",
  },
];

const PRESET_COMMANDS = [
  "Report Gas & Telemetry",
  "Halt & Listen for Taps",
  "Sound Siren Beacon",
  "Searchlight to Full",
  "Verify Thermal Hotspot",
];

export const TwoWayCommunication: React.FC<TwoWayCommunicationProps> = ({
  className = "",
  roverId = "RAKSHAK-Mine",
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");
  const [recipient, setRecipient] = useState<string>(roverId);
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isPttActive, setIsPttActive] = useState<boolean>(false);
  const [pttSeconds, setPttSeconds] = useState<number>(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pttTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayVoice = (msg: ChatMessage) => {
    if (playingVoiceId === msg.id) {
      setPlayingVoiceId(null);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    setPlayingVoiceId(msg.id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg.message);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingVoiceId(null), 3000);
    }
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTransmitting]);

  // Handle PTT timer count
  useEffect(() => {
    if (isPttActive) {
      setPttSeconds(0);
      pttTimerRef.current = setInterval(() => {
        setPttSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (pttTimerRef.current) clearInterval(pttTimerRef.current);
    }
    return () => {
      if (pttTimerRef.current) clearInterval(pttTimerRef.current);
    };
  }, [isPttActive]);

  // Format current local time HH:mm
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // Dispatch simulated RAKSHAK-Mine acoustic acknowledgement
  const triggerSimulatedAck = (userMessage: string) => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);

      let responseText = `ACK [Surface Cmd]: Message confirmed by ${recipient}. Link SNR +14dB (Acoustic link stable).`;
      const lower = userMessage.toLowerCase();

      if (lower.includes("gas") || lower.includes("telemetry") || lower.includes("report")) {
        responseText = `${recipient}: CH4: 0.42% | CO: 12 ppm | CO2: 420 ppm | Temp: 22.4°C | Battery: 78%. All systems nominal.`;
      } else if (lower.includes("halt") || lower.includes("listen") || lower.includes("tap")) {
        responseText = `${recipient}: Motors halted. MEMS geophone & hydrophone listening active. Background noise: 42 dB.`;
      } else if (lower.includes("siren") || lower.includes("buzzer") || lower.includes("beacon")) {
        responseText = `${recipient}: High-decibel rescue siren pulse initiated (3x short beeps emitted to drift).`;
      } else if (lower.includes("light") || lower.includes("searchlight")) {
        responseText = `${recipient}: 1200-lumen Cree searchlight engaged at 100% duty cycle.`;
      } else if (lower.includes("thermal") || lower.includes("hotspot") || lower.includes("survivor")) {
        responseText = `${recipient}: Thermal camera locked at bearing 042°. Body heat detected at 36.8°C. Survivor triage updated to Priority 1.`;
      }

      const ackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        timestamp: getCurrentTime(),
        sender: recipient,
        recipient: "Surface Cmd",
        message: responseText,
        type: "text",
        status: "ACK",
      };

      setMessages((prev) => [...prev, ackMsg]);
    }, 1100);
  };

  const sendMessageContent = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isTransmitting) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      timestamp: getCurrentTime(),
      sender: "Surface Cmd",
      recipient: recipient,
      message: trimmed,
      type: "text",
      status: "SENT",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    if (onSendMessage) onSendMessage(trimmed, recipient);

    triggerSimulatedAck(trimmed);
  };

  const handleSend = () => {
    sendMessageContent(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Push-to-Talk (PTT) Press & Release Handlers
  const handlePttStart = () => {
    setIsPttActive(true);
  };

  const handlePttEnd = () => {
    if (!isPttActive) return;
    setIsPttActive(false);

    const duration = Math.max(1, pttSeconds);
    const timeStr = getCurrentTime();

    const voiceMsg: ChatMessage = {
      id: `voice-${Date.now()}`,
      timestamp: timeStr,
      sender: "Surface Cmd",
      recipient: recipient,
      message: `[Voice Transmission 0:0${duration}s] "Surface Dispatch calling ${recipient} - report situation."`,
      type: "voice",
      status: "SENT",
    };

    setMessages((prev) => [...prev, voiceMsg]);

    // Simulated acoustic audio return
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      const voiceReply: ChatMessage = {
        id: `voice-reply-${Date.now()}`,
        timestamp: getCurrentTime(),
        sender: recipient,
        recipient: "Surface Cmd",
        message: `Acoustic voice playback acknowledged on ${recipient} speaker (88 dB). Survivor listen-mode restored.`,
        type: "text",
        status: "ACK",
      };
      setMessages((prev) => [...prev, voiceReply]);
    }, 1200);
  };

  return (
    <div
      className={`h-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}
    >
      {/* Header: Title, Message icon, Active Link Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100 shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
              Two-Way Communication
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-500 font-medium">
                LoRa 868MHz + Ultrasonic Acoustic Link
              </span>
            </div>
          </div>
        </div>

        {/* Active Link Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Active Link</span>
        </div>
      </div>

      {/* Control Bar: Tabs & Recipient Selector */}
      <div className="flex items-center justify-between gap-3 pt-3 pb-2.5">
        {/* Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "voice"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
        </div>

        {/* Recipient Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">To:</span>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors cursor-pointer"
          >
            <option value="RAKSHAK-Mine">RAKSHAK-Mine</option>
            <option value="RAKSHAK-Mine (Standby)">RAKSHAK-Mine (Standby)</option>
            <option value="All Rescue Units">All Rescue Units</option>
          </select>
        </div>
      </div>

      {/* Interactive Scrollable Chat History */}
      <div className="flex-1 min-h-[160px] overflow-y-auto bg-slate-50/70 rounded-xl border border-slate-200/70 p-3 space-y-2.5 my-1 custom-scrollbar">
        {messages.map((msg) => {
          const isSurface = msg.sender === "Surface Cmd";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSurface ? "items-end" : "items-start"}`}
            >
              {/* Sender & Timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mb-0.5 px-1">
                <span className={isSurface ? "text-sky-700 font-bold" : "text-emerald-700 font-bold"}>
                  {msg.sender}
                </span>
                <span>•</span>
                <span className="font-mono text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-2xs transition-all ${
                  isSurface
                    ? "bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                }`}
              >
                {msg.type === "voice" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(msg)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isSurface
                          ? "bg-sky-500/40 hover:bg-sky-500/60 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {playingVoiceId === msg.id ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[11px]">Acoustic Voice Note</span>
                      </div>
                      <p className="text-[10px] opacity-90 truncate max-w-[190px]">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                )}

                {/* Ack Checkmark */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                    isSurface ? "text-sky-200" : "text-slate-400"
                  }`}
                >
                  <span>{msg.status === "ACK" ? "Delivered & ACKed" : "Dispatched"}</span>
                  <CheckCheck className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Transmitting loader */}
        {isTransmitting && (
          <div className="flex items-center gap-2 text-xs text-sky-600 font-medium py-1 px-2.5 bg-sky-50 rounded-lg border border-sky-200 w-fit animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>Awaiting acoustic acknowledgment from {recipient}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Quick Actions with Immediate Dispatch */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {PRESET_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => sendMessageContent(cmd)}
            title={`Click to send "${cmd}" to ${recipient} immediately`}
            className="text-[10.5px] font-semibold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border border-slate-200/80 cursor-pointer active:scale-95 shadow-xs"
          >
            ⚡ {cmd}
          </button>
        ))}
      </div>

      {/* Tab Specific Bottom Controls */}
      {activeTab === "text" ? (
        /* Text Input Box & Send Button */
        <div className="pt-1">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 focus-within:bg-white transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${recipient} (e.g. Report gas levels)...`}
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim() || isTransmitting}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Voice Mode: Hold to Talk (PTT) Tactile Button */
        <div className="pt-2 flex flex-col items-center justify-center">
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2">
            {/* Visual audio frequency wave representation */}
            <div className="flex items-center justify-center gap-1 h-7">
              {[6, 14, 22, 10, 26, 18, 12, 24, 16, 8, 20, 14].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: isPttActive ? `${Math.min(26, h * (1 + Math.random() * 0.6))}px` : "4px",
                  }}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isPttActive
                      ? "bg-red-500 animate-pulse"
                      : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onMouseDown={handlePttStart}
              onMouseUp={handlePttEnd}
              onMouseLeave={handlePttEnd}
              onTouchStart={handlePttStart}
              onTouchEnd={handlePttEnd}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md select-none active:scale-[0.98] cursor-pointer ${
                isPttActive
                  ? "bg-red-600 text-white shadow-red-600/30 ring-4 ring-red-200 animate-pulse"
                  : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-sky-600/20"
              }`}
            >
              <Mic className={`w-4 h-4 ${isPttActive ? "animate-bounce" : ""}`} />
              <span>
                {isPttActive
                  ? `TRANSMITTING AUDIO [0:0${pttSeconds}s] — RELEASE TO SEND`
                  : `Hold to Talk (PTT) to ${recipient}`}
              </span>
            </button>

            <p className="text-[10px] text-slate-400 font-medium text-center">
              Voice note is transmitted over 868MHz LoRa / acoustic transducer to {recipient}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoWayCommunication;
