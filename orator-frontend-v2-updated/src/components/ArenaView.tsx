"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppStatus, ChatMessage, ScenarioType } from "@/types";
import { GlassCard } from "./GlassCard";
import { ChatDisplay } from "./ChatDisplay";
import { ScenarioSelector } from "./ScenarioSelector";
import { RotateCcw, Play, Pause, Hand, Swords, User } from "lucide-react";

interface ArenaViewProps {
  status: AppStatus;
  messages: ChatMessage[];
  isDebateRunning: boolean;
  activeSpeaker: "ai_a" | "ai_b" | null;
  selectedScenario: ScenarioType | null;
  currentVideo: { videoId: string; timestamp: number } | null;
  onStartDebate: () => void;
  onPauseDebate: () => void;
  onBargeIn: () => void;
  onReset: () => void;
  onScenarioChange: (scenario: ScenarioType) => void;
  onCloseVideo: () => void;
  className?: string;
}

function DebaterAvatar({
  side,
  isActive,
  status,
}: {
  side: "left" | "right";
  isActive: boolean;
  status: AppStatus;
}) {
  const isSpeaking = isActive && status === "speaking";
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow effect */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                "absolute inset-0 rounded-full blur-xl",
                side === "left" ? "bg-violet-500" : "bg-rose-500"
              )}
            />
          )}
        </AnimatePresence>

        {/* Avatar */}
        <motion.div
          animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center",
            "border-2 transition-all duration-300",
            side === "left"
              ? "bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400/50"
              : "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400/50",
            isActive && "ring-4 ring-white/20"
          )}
        >
          <span className="text-4xl">🤖</span>
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className={cn(
          "font-bold",
          side === "left" ? "text-violet-400" : "text-rose-400"
        )}>
          {side === "left" ? "Advocate" : "Critic"}
        </div>
        <div className={cn(
          "text-xs px-2 py-0.5 rounded-full mt-1",
          side === "left"
            ? "bg-violet-500/20 text-violet-300"
            : "bg-rose-500/20 text-rose-300"
        )}>
          {side === "left" ? "PRO" : "CON"}
        </div>
      </div>
    </div>
  );
}

export function ArenaView({
  status,
  messages,
  isDebateRunning,
  activeSpeaker,
  selectedScenario,
  currentVideo,
  onStartDebate,
  onPauseDebate,
  onBargeIn,
  onReset,
  onScenarioChange,
  onCloseVideo,
  className,
}: ArenaViewProps) {
  const aiAMessages = messages.filter((m) => m.speaker === "ai_a").length;
  const aiBMessages = messages.filter((m) => m.speaker === "ai_b").length;

  return (
    <div className={cn("flex flex-col h-full gap-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Debate Arena</h2>
            <p className="text-xs text-slate-500">Watch AIs battle it out</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScenarioSelector
            mode="arena"
            selectedScenario={selectedScenario}
            onSelectScenario={onScenarioChange}
            className="w-64"
          />
          
          <motion.button
            onClick={isDebateRunning ? onPauseDebate : onStartDebate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
              isDebateRunning
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            )}
          >
            {isDebateRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </motion.button>

          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Main arena */}
      <GlassCard variant="default" glow="subtle" className="flex-1 flex flex-col overflow-hidden">
        {/* Debaters section */}
        <div className="flex items-center justify-between px-12 py-8 border-b border-white/5">
          <DebaterAvatar
            side="left"
            isActive={activeSpeaker === "ai_a"}
            status={status}
          />

          {/* VS indicator / Video */}
          <div className="flex flex-col items-center">
            {currentVideo ? (
              <div className="w-64 aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideo.videoId}?start=${Math.floor(currentVideo.timestamp)}&autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay"
                />
              </div>
            ) : (
              <motion.div
                animate={{ 
                  scale: isDebateRunning ? [1, 1.1, 1] : 1,
                  opacity: isDebateRunning ? 1 : 0.5,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl font-black text-white/20"
              >
                VS
              </motion.div>
            )}
          </div>

          <DebaterAvatar
            side="right"
            isActive={activeSpeaker === "ai_b"}
            status={status}
          />
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-violet-400 font-bold">{aiAMessages}</span>
            <span className="text-slate-600">points</span>
          </div>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              animate={{ width: `${(aiAMessages / (aiAMessages + aiBMessages + 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
              animate={{ width: `${(aiBMessages / (aiAMessages + aiBMessages + 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">points</span>
            <span className="text-rose-400 font-bold">{aiBMessages}</span>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatDisplay messages={messages} className="h-full" />
        </div>

        {/* Barge in section */}
        <div className="p-4 border-t border-white/5">
          <motion.button
            onClick={onBargeIn}
            disabled={!isDebateRunning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all",
              isDebateRunning
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            )}
          >
            <Hand className="w-5 h-5" />
            {isDebateRunning ? "Barge In - Settle This Debate!" : "Start debate to participate"}
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}
