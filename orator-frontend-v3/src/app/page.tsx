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
    providerLabel,
    isConnected,
    connectionError,
    actionError,
    notice,
    sendText,
    playbackFinished,
    isDebateRunning,
    status,
    mode,
    messages,
    coachFeedback,
    latestSpeech,
    sendAudio,
    setMode,
    setScenario,
    setSandboxConfig,
    startDebate,
    stopDebate,
    joinDebate,
    leaveDebate,
    clearMessages,
    clearLatestSpeech,
    connect,
  } = useWebSocket();

  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>("salary_hard");
  const [draft, setDraft] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<"ai_a" | "ai_b" | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [debateTopic, setDebateTopic] = useState("");
  const [userJoinedSide, setUserJoinedSide] = useState<"pro" | "con" | null>(null);

  const { playSpeech, stopAudio, error: playbackError } = useAudioPlayer();

  const {
    isRecording,
    error: recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder({ onAudioData: sendAudio });

  useEffect(() => { connect(); }, [connect]);

  useEffect(() => {
    if (!latestSpeech) return;
    if (isMuted) playbackFinished(latestSpeech.id);
    else playSpeech(latestSpeech, () => playbackFinished(latestSpeech.id));
    clearLatestSpeech();
  }, [latestSpeech, isMuted, playSpeech, playbackFinished, clearLatestSpeech]);

  useEffect(() => { if (isMuted) stopAudio(); }, [isMuted, stopAudio]);
  useEffect(() => {
    if (!isConnected) { cancelRecording(); stopAudio(); }
  }, [isConnected, cancelRecording, stopAudio]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: AppMode) => {
    setDraft("");
    setMode(newMode);
    setActiveSpeaker(null);
    setDebateTopic("");
    setUserJoinedSide(null);
    cancelRecording();
    setCurrentScenario("salary_hard");
    stopAudio();
  }, [setMode, cancelRecording, stopAudio]);

  // Handle recording
  const handleStartRecording = useCallback(async () => {
    if (!isConnected || status !== "idle") return;
    stopAudio();
    await startRecording();
  }, [isConnected, status, stopAudio, startRecording]);

  // Handle reset
  const handleReset = useCallback(() => {
    setDraft("");
    clearMessages();
    setActiveSpeaker(null);
    setDebateTopic("");
    setUserJoinedSide(null);
    stopAudio();
    cancelRecording();
  }, [clearMessages, stopAudio, cancelRecording]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setScenario(scenario);
    cancelRecording();
    stopAudio();
  }, [setScenario, cancelRecording, stopAudio]);

  // Handle persona change (Sandbox)
  const handlePersonaChange = useCallback((persona: SandboxPersona) => {
    setSandboxConfig(persona.id, "");
    cancelRecording();
    stopAudio();
  }, [setSandboxConfig, cancelRecording, stopAudio]);

  // Arena controls
  const handleStartDebate = useCallback((topic: string) => {
    setDebateTopic(topic);
    setActiveSpeaker("ai_a");
    startDebate(topic);
  }, [startDebate]);

  const handlePauseDebate = useCallback(() => {
    setUserJoinedSide(null);
    stopDebate();
    stopAudio();
  }, [stopDebate, stopAudio]);

  const handleJoinSide = useCallback((side: "pro" | "con") => {
    setUserJoinedSide(side);
    stopAudio();
    joinDebate(side);
  }, [joinDebate, stopAudio]);

  const handleLeaveSide = useCallback(() => {
    setUserJoinedSide(null);
    leaveDebate();
    cancelRecording();
  }, [leaveDebate, cancelRecording]);

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
              aria-label={isMuted ? "Unmute responses" : "Mute responses"}
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
          {(connectionError || actionError || recordingError || playbackError) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mx-6"
            >
              <div role="alert" className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {connectionError || actionError || recordingError || playbackError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {notice && <p role="status" className="mx-6 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">{notice}</p>}

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
                  userJoinedSide={userJoinedSide}
                  debateTopic={debateTopic}
                  isRecording={isRecording}
                  onStartDebate={handleStartDebate}
                  onPauseDebate={handlePauseDebate}
                  onJoinSide={handleJoinSide}
                  onLeaveSide={handleLeaveSide}
                  onStartRecording={handleStartRecording}
                  onStopRecording={stopRecording}
                  onReset={handleReset}
                  className="h-full"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {(mode !== "arena" || userJoinedSide) && (
          <form className="mx-6 mb-5 flex gap-3" onSubmit={event => {
            event.preventDefault();
            if (!draft.trim() || !isConnected || status !== "idle" || isRecording) return;
            sendText(draft.trim()); setDraft("");
          }}>
            <input aria-label="Your message" value={draft} maxLength={4000}
              onChange={event => setDraft(event.target.value)}
              placeholder="Or type your message…"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500" />
            <button type="submit" disabled={!draft.trim() || !isConnected || status !== "idle" || isRecording}
              className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white disabled:opacity-40">Send</button>
          </form>
        )}

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Powered by</span>
              <span className="text-slate-400">Voice or text</span>
              <span>·</span>
              <span className="text-slate-400">{providerLabel}</span>
              <span>·</span>
              <span className="text-slate-400">Browser speech</span>
            </div>
            <div className="text-xs text-slate-600">
              Tap the microphone to record; tap again to send
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
