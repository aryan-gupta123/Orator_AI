"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { AppStatus, AppMode, ScenarioType, ChatMessage, CoachFeedback, IncomingMessage, OutgoingMessage } from "@/types";
import type { Speech } from "@/hooks/useAudioPlayer";
import { generateId } from "@/lib/utils";

interface Context {
  providerLabel: string;
  isConnected: boolean;
  connectionError: string | null;
  actionError: string | null;
  notice: string | null;
  status: AppStatus;
  mode: AppMode;
  messages: ChatMessage[];
  coachFeedback: CoachFeedback | null;
  latestSpeech: Speech | null;
  isDebateRunning: boolean;
  sendAudio: (audio: string, mimeType: string) => void;
  sendText: (text: string) => void;
  playbackFinished: (id: string) => void;
  clearLatestSpeech: () => void;
  setMode: (mode: AppMode) => void;
  setScenario: (scenario: ScenarioType) => void;
  setSandboxConfig: (persona: string, context: string) => void;
  startDebate: (topic: string) => void;
  stopDebate: () => void;
  joinDebate: (side: "pro" | "con") => void;
  leaveDebate: () => void;
  clearMessages: () => void;
  connect: () => void;
}
const WebSocketContext = createContext<Context | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const modeRef = useRef<AppMode>("sandbox");
  const personaRef = useRef("friend");
  const scenarioRef = useRef<ScenarioType>("salary_hard");
  const [providerLabel, setProviderLabel] = useState("AI");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [mode, setModeState] = useState<AppMode>("sandbox");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [latestSpeech, setLatestSpeech] = useState<Speech | null>(null);
  const [isDebateRunning, setIsDebateRunning] = useState(false);

  const clearLocal = useCallback(() => {
    setMessages([]); setCoachFeedback(null); setLatestSpeech(null);
    setActionError(null); setNotice(null); setStatus("idle");
  }, []);

  const sendMessage = useCallback((message: OutgoingMessage) => {
    if (!socketRef.current?.connected) { setActionError("You are offline. Reconnect before sending."); return; }
    if (message.type !== "playback_finished") { setActionError(null); setNotice(null); }
    if (message.type === "text" || message.type === "audio") { setStatus("thinking"); setCoachFeedback(null); }
    socketRef.current.emit("message", message);
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) return;
    // Same-origin proxy works through cloud previews and deployed HTTPS frontends.
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || undefined, { reconnectionAttempts: 10 });
    socketRef.current = socket;
    socket.on("connect", () => {
      setIsConnected(true); setConnectionError(null); clearLocal(); setIsDebateRunning(false);
      socket.emit("message", { type: "mode", data: modeRef.current });
      if (modeRef.current === "sandbox") socket.emit("message", { type: "sandbox_config", data: { persona: personaRef.current } });
      if (modeRef.current === "dojo") socket.emit("message", { type: "scenario", data: scenarioRef.current });
    });
    socket.on("disconnect", () => { setIsConnected(false); setStatus("idle"); setLatestSpeech(null); setIsDebateRunning(false); });
    socket.on("connect_error", () => { setConnectionError("Cannot connect to Orator. Check that the backend is running."); setIsConnected(false); });
    socket.on("message", (message: IncomingMessage) => {
      switch (message.type) {
        case "configuration": setProviderLabel(message.data.provider === "local" ? `Local ${message.data.model}` : "Gemini"); break;
        case "transcript": setMessages(prev => [...prev, { id: generateId(), speaker: message.data.speaker, text: message.data.text, timestamp: new Date() }]); break;
        case "speech": setLatestSpeech(message.data); break;
        case "coach": setCoachFeedback({ ...message.data, timestamp: new Date() }); break;
        case "status": setStatus(message.data); break;
        case "error": setActionError(message.data); break;
        case "notice": setNotice(message.data); break;
        case "debate_state": setIsDebateRunning(message.data); break;
      }
    });
  }, [clearLocal]);

  const setMode = useCallback((value: AppMode) => {
    modeRef.current = value; personaRef.current = "friend"; scenarioRef.current = "salary_hard";
    setModeState(value); clearLocal(); sendMessage({ type: "mode", data: value });
  }, [clearLocal, sendMessage]);
  const setScenario = useCallback((value: ScenarioType) => {
    scenarioRef.current = value; clearLocal(); sendMessage({ type: "scenario", data: value });
  }, [clearLocal, sendMessage]);
  const setSandboxConfig = useCallback((persona: string, context: string) => {
    personaRef.current = persona; clearLocal(); sendMessage({ type: "sandbox_config", data: { persona, context } });
  }, [clearLocal, sendMessage]);
  const clearMessages = useCallback(() => { clearLocal(); sendMessage({ type: "reset", data: true }); }, [clearLocal, sendMessage]);
  useEffect(() => () => {
    socketRef.current?.removeAllListeners(); socketRef.current?.disconnect(); socketRef.current = null;
  }, []);

  return <WebSocketContext.Provider value={{
    providerLabel, isConnected, connectionError, actionError, notice, status, mode, messages, coachFeedback, latestSpeech, isDebateRunning,
    connect, setMode, setScenario, setSandboxConfig, clearMessages,
    sendAudio: (audio, mimeType) => sendMessage({ type: "audio", data: { audio, mimeType } }),
    sendText: text => sendMessage({ type: "text", data: text }),
    playbackFinished: id => sendMessage({ type: "playback_finished", data: id }),
    clearLatestSpeech: () => setLatestSpeech(null),
    startDebate: topic => sendMessage({ type: "start_debate", data: { topic } }),
    stopDebate: () => sendMessage({ type: "stop_debate", data: true }),
    joinDebate: side => sendMessage({ type: "join_debate", data: { side } }),
    leaveDebate: () => sendMessage({ type: "leave_debate", data: true }),
  }}>{children}</WebSocketContext.Provider>;
}
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
}
