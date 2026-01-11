"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  IncomingMessage,
  OutgoingMessage,
  AppStatus,
  AppMode,
  ScenarioType,
  ChatMessage,
  CoachFeedback,
} from "@/types";
import { generateId } from "@/lib/utils";

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  status: AppStatus;
  mode: AppMode;
  messages: ChatMessage[];
  coachFeedback: CoachFeedback | null;
  currentVideo: { videoId: string; timestamp: number } | null;
  
  sendAudio: (base64: string) => void;
  setMode: (mode: AppMode) => void;
  setScenario: (scenario: ScenarioType) => void;
  setSandboxConfig: (persona: string, context: string) => void;
  bargeIn: () => void;
  startDebate: () => void;
  stopDebate: () => void;
  clearMessages: () => void;
  addMessage: (speaker: ChatMessage['speaker'], text: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [mode, setModeState] = useState<AppMode>("sandbox");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [currentVideo, setCurrentVideo] = useState<{ videoId: string; timestamp: number } | null>(null);

  const handleIncomingMessage = useCallback((message: IncomingMessage) => {
    switch (message.type) {
      case "transcript": {
        const newMessage: ChatMessage = {
          id: generateId(),
          speaker: message.data.speaker,
          text: message.data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        break;
      }

      case "audio": {
        console.log("🔊 Playing audio, length:", message.data.length);
        playAudioFromBase64(message.data);
        break;
      }

      case "video":
        setCurrentVideo(message.data);
        break;

      case "coach":
        setCoachFeedback({ ...message.data, timestamp: new Date() });
        break;

      case "status":
        setStatus(message.data);
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("connect_error", (err) => {
      setConnectionError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    socket.on("message", handleIncomingMessage);

    socketRef.current = socket;
  }, [handleIncomingMessage]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: OutgoingMessage) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message", message);
    }
  }, []);

  const sendAudio = useCallback((base64: string) => {
    sendMessage({ type: "audio", data: base64 });
  }, [sendMessage]);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    sendMessage({ type: "mode", data: newMode });
    setMessages([]);
    setCoachFeedback(null);
    setCurrentVideo(null);
  }, [sendMessage]);

  const setScenario = useCallback((scenario: ScenarioType) => {
    sendMessage({ type: "scenario", data: scenario });
    setMessages([]);
    setCoachFeedback(null);
  }, [sendMessage]);

  const setSandboxConfig = useCallback((persona: string, context: string) => {
    sendMessage({ type: "sandbox_config", data: { persona, context } });
  }, [sendMessage]);

  const bargeIn = useCallback(() => {
    sendMessage({ type: "barge_in", data: true });
  }, [sendMessage]);

  const startDebate = useCallback(() => {
    sendMessage({ type: "start_debate", data: true });
  }, [sendMessage]);

  const stopDebate = useCallback(() => {
    sendMessage({ type: "stop_debate", data: true });
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCoachFeedback(null);
    setCurrentVideo(null);
  }, []);

  const addMessage = useCallback((speaker: ChatMessage['speaker'], text: string) => {
    setMessages((prev) => [...prev, {
      id: generateId(),
      speaker,
      text,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      connectionError,
      status,
      mode,
      messages,
      coachFeedback,
      currentVideo,
      sendAudio,
      setMode,
      setScenario,
      setSandboxConfig,
      bargeIn,
      startDebate,
      stopDebate,
      clearMessages,
      addMessage,
      connect,
      disconnect,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
}
function playAudioFromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  audio.volume = 1.0;
  audio.muted = false;

  audio.onended = () => URL.revokeObjectURL(url);

  audio.play().catch(err => {
    console.error("❌ Audio playback failed:", err);
  });
}

