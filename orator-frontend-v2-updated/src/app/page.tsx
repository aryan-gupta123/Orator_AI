"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ModeSelector } from "@/components/ModeSelector";
import { SandboxView } from "@/components/SandboxView";
import { DojoView } from "@/components/DojoView";
import { ArenaView } from "@/components/ArenaView";
import { AppMode, ScenarioType, SandboxPersona } from "@/types";
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
    setSandboxConfig,
    bargeIn,
    startDebate,
    stopDebate,
    clearMessages,
    connect,
  } = useWebSocket();

  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>("salary_hard");
  const [isDebateRunning, setIsDebateRunning] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"ai_a" | "ai_b" | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const { stopAudio } = useAudioPlayer();

  const {
    isRecording,
    error: recordingError,
    startRecording,
    stopRecording,
    hasPermission,
    requestPermission,
  } = useAudioRecorder({
    onAudioData: (base64) => {
      if (!isMuted) sendAudio(base64);
    },
  });

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
    setIsDebateRunning(false);
    setActiveSpeaker(null);
    if (isRecording) stopRecording();
  }, [setMode, isRecording, stopRecording]);

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
    if (isRecording) stopRecording();
  }, [clearMessages, stopAudio, isRecording, stopRecording]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setScenario(scenario);
    handleReset();
  }, [setScenario, handleReset]);

  // Handle persona change (Sandbox)
  const handlePersonaChange = useCallback((persona: SandboxPersona) => {
    setSandboxConfig(persona.systemPrompt, "");
    handleReset();
  }, [setSandboxConfig, handleReset]);

  // Arena controls
  const handleStartDebate = useCallback(() => {
    setIsDebateRunning(true);
    setActiveSpeaker("ai_a");
    startDebate();  // Tell backend to start
  }, [startDebate]);

  const handlePauseDebate = useCallback(() => {
    setIsDebateRunning(false);
    stopDebate();  // Tell backend to stop
  }, [stopDebate]);

  const handleBargeIn = useCallback(() => {
    bargeIn();
    setActiveSpeaker(null);
  }, [bargeIn]);

  // Update active speaker based on messages
  useEffect(() => {
    if (mode === "arena" && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.speaker === "ai_a" || lastMessage.speaker === "ai_b") {
        setActiveSpeaker(lastMessage.speaker);
      }
    }
  }, [messages, mode]);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-lg -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Orator
              </h1>
              <p className="text-xs text-slate-500">Master conversations</p>
            </div>
          </motion.div>

          {/* Mode selector - center */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ModeSelector
              currentMode={mode}
              onSelectMode={handleModeChange}
            />
          </motion.div>

          {/* Status indicators - right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isMuted
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Connection status */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-white/[0.03] border border-white/10"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected 
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" 
                  : "bg-rose-500 shadow-lg shadow-rose-500/50"
              )} />
              <span className="text-xs font-medium text-slate-400">
                {isConnected ? "Live" : "Offline"}
              </span>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-emerald-500/70" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-500/70" />
              )}
            </div>
          </motion.div>
        </header>

        {/* Error banner */}
        <AnimatePresence>
          {(connectionError || recordingError) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mx-6"
            >
              <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {connectionError || recordingError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main view */}
        <main className="flex-1 p-6 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {mode === "sandbox" && (
                <SandboxView
                  status={status}
                  messages={messages}
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={stopRecording}
                  onReset={handleReset}
                  onPersonaChange={handlePersonaChange}
                  className="h-full"
                />
              )}

              {mode === "dojo" && (
                <DojoView
                  status={status}
                  messages={messages}
                  coachFeedback={coachFeedback}
                  isRecording={isRecording}
                  selectedScenario={currentScenario}
                  onStartRecording={handleStartRecording}
                  onStopRecording={stopRecording}
                  onReset={handleReset}
                  onScenarioChange={handleScenarioChange}
                  className="h-full"
                />
              )}

              {mode === "arena" && (
                <ArenaView
                  status={status}
                  messages={messages}
                  isDebateRunning={isDebateRunning}
                  activeSpeaker={activeSpeaker}
                  selectedScenario={currentScenario}
                  currentVideo={currentVideo}
                  onStartDebate={handleStartDebate}
                  onPauseDebate={handlePauseDebate}
                  onBargeIn={handleBargeIn}
                  onReset={handleReset}
                  onScenarioChange={handleScenarioChange}
                  onCloseVideo={() => {}}
                  className="h-full"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Powered by</span>
              <span className="text-slate-400">Deepgram</span>
              <span>·</span>
              <span className="text-slate-400">Gemini</span>
              <span>·</span>
              <span className="text-slate-400">ElevenLabs</span>
              <span>·</span>
              <span className="text-slate-400">TwelveLabs</span>
            </div>
            <div className="text-xs text-slate-600">
              SBHacks 2025
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
