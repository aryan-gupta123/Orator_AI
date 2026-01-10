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

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  status: AppStatus;
  mode: AppMode;
  messages: ChatMessage[];
  coachFeedback: CoachFeedback | null;
  currentVideo: { videoId: string; timestamp: number } | null;
  
  // Actions
  sendAudio: (base64: string) => void;
  setMode: (mode: AppMode) => void;
  setScenario: (scenario: ScenarioType) => void;
  bargeIn: () => void;
  clearMessages: () => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [mode, setModeState] = useState<AppMode>("dojo");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [currentVideo, setCurrentVideo] = useState<{ videoId: string; timestamp: number } | null>(null);

  const handleIncomingMessage = useCallback((message: IncomingMessage) => {
    switch (message.type) {
      case "transcript":
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          speaker: message.data.speaker,
          text: message.data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        break;

      case "audio":
        // Audio is handled by parent component via event
        break;

      case "video":
        setCurrentVideo(message.data);
        break;

      case "coach":
        setCoachFeedback({
          ...message.data,
          timestamp: new Date(),
        });
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
      console.log("Connected to backend");
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from backend");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setConnectionError(`Failed to connect: ${err.message}`);
      setIsConnected(false);
    });

    socket.on("message", (data: IncomingMessage) => {
      handleIncomingMessage(data);
    });

    // Specific event for audio to allow direct handling
    socket.on("audio", (data: string) => {
      // This will be picked up by the useEffect in the component
    });

    socketRef.current = socket;
  }, [handleIncomingMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
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
    setMessages([]); // Clear messages when switching modes
    setCoachFeedback(null);
    setCurrentVideo(null);
  }, [sendMessage]);

  const setScenario = useCallback((scenario: ScenarioType) => {
    sendMessage({ type: "scenario", data: scenario });
    setMessages([]); // Clear messages when switching scenarios
    setCoachFeedback(null);
    setCurrentVideo(null);
  }, [sendMessage]);

  const bargeIn = useCallback(() => {
    sendMessage({ type: "barge_in", data: true });
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCoachFeedback(null);
    setCurrentVideo(null);
  }, []);

  // Get socket for direct audio event listening
  const getSocket = useCallback(() => socketRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: WebSocketContextType = {
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
    bargeIn,
    clearMessages,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

// Export socket getter for audio handling
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  return socketRef.current;
}
