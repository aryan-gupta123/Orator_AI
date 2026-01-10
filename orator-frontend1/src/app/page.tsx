"use client";

import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Dojo } from "@/components/Dojo";
import { Arena } from "@/components/Arena";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { SCENARIOS, ScenarioType, AppMode } from "@/types";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Volume2, VolumeX } from "lucide-react";

export default function Home() {
  const {
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
  } = useWebSocket();

  const [currentScenarioId, setCurrentScenarioId] = useState<ScenarioType>("salary_hard");
  const [isDebateRunning, setIsDebateRunning] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"ai_a" | "ai_b" | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const { queueAudio, stopAudio, isPlaying } = useAudioPlayer();

  // Audio recorder with callback to send to backend
  const {
    isRecording,
    error: recordingError,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermission,
  } = useAudioRecorder({
    onAudioData: (base64) => {
      if (!isMuted) {
        sendAudio(base64);
      }
    },
  });

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Get current scenario info
  const currentScenario = SCENARIOS.find((s) => s.id === currentScenarioId);

  // Handle mode change
  const handleModeChange = useCallback(
    (newMode: AppMode) => {
      setMode(newMode);
      // Select first scenario for new mode
      const firstScenario = SCENARIOS.find((s) => s.mode === newMode);
      if (firstScenario) {
        setCurrentScenarioId(firstScenario.id);
        setScenario(firstScenario.id);
      }
      setIsDebateRunning(false);
      setActiveSpeaker(null);
    },
    [setMode, setScenario]
  );

  // Handle scenario change
  const handleScenarioChange = useCallback(
    (scenarioId: ScenarioType) => {
      setCurrentScenarioId(scenarioId);
      setScenario(scenarioId);
      setIsDebateRunning(false);
      setActiveSpeaker(null);
    },
    [setScenario]
  );

  // Handle recording
  const handleStartRecording = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await startRecording();
  }, [hasPermission, requestPermission, startRecording]);

  // Handle reset
  const handleReset = useCallback(() => {
    clearMessages();
    setIsDebateRunning(false);
    setActiveSpeaker(null);
    stopAudio();
    if (isRecording) {
      stopRecording();
    }
  }, [clearMessages, stopAudio, isRecording, stopRecording]);

  // Handle debate controls (Arena mode)
  const handleStartDebate = useCallback(() => {
    setIsDebateRunning(true);
    setActiveSpeaker("ai_a");
  }, []);

  const handlePauseDebate = useCallback(() => {
    setIsDebateRunning(false);
    setActiveSpeaker(null);
  }, []);

  const handleBargeIn = useCallback(() => {
    bargeIn();
    setActiveSpeaker(null);
  }, [bargeIn]);

  // Handle video close
  const handleCloseVideo = useCallback(() => {
    // Video state is managed by WebSocket context
  }, []);

  // Update active speaker based on messages (for Arena mode)
  useEffect(() => {
    if (mode === "arena" && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.speaker === "ai_a" || lastMessage.speaker === "ai_b") {
        setActiveSpeaker(lastMessage.speaker);
      }
    }
  }, [messages, mode]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-grid noise-overlay">
      {/* Gradient orbs for atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <span className="text-xl">🎭</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Orator
              </h1>
              <p className="text-xs text-white/50">Flight simulator for conversations</p>
            </div>
          </div>

          {/* Scenario selector */}
          <ScenarioSelector
            currentScenario={currentScenarioId}
            currentMode={mode}
            onSelectScenario={handleScenarioChange}
            onSelectMode={handleModeChange}
          />

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            {/* Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isMuted
                  ? "bg-red-500/20 text-red-400"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
              <div
                className={cn(
                  "connection-dot",
                  isConnected ? "connected" : "disconnected"
                )}
              />
              <span className="text-xs text-white/60">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-white/40" />
              ) : (
                <WifiOff className="w-4 h-4 text-white/40" />
              )}
            </div>
          </div>
        </header>

        {/* Error banner */}
        {(connectionError || recordingError) && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {connectionError || recordingError}
          </div>
        )}

        {/* Main area */}
        <main className="flex-1 p-6 min-h-0">
          {mode === "dojo" ? (
            <Dojo
              status={status}
              messages={messages}
              coachFeedback={coachFeedback}
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={stopRecording}
              onReset={handleReset}
              scenarioName={currentScenario?.name || ""}
              className="h-full"
            />
          ) : (
            <Arena
              status={status}
              messages={messages}
              currentVideo={currentVideo}
              activeSpeaker={activeSpeaker}
              isDebateRunning={isDebateRunning}
              onBargeIn={handleBargeIn}
              onStartDebate={handleStartDebate}
              onPauseDebate={handlePauseDebate}
              onReset={handleReset}
              onCloseVideo={handleCloseVideo}
              scenarioName={currentScenario?.name || ""}
              className="h-full"
            />
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>Built with Deepgram · Gemini · ElevenLabs · TwelveLabs</span>
            <span>SBHacks 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
