"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppStatus, ChatMessage } from "@/types";
import { GlassCard } from "./GlassCard";
import { ChatDisplay } from "./ChatDisplay";
import { VoiceOrb } from "./VoiceOrb";
import { RotateCcw, Play, Pause, Hand, Swords, LogOut } from "lucide-react";

interface ArenaViewProps {
  status: AppStatus;
  messages: ChatMessage[];
  isDebateRunning: boolean;
  activeSpeaker: "ai_a" | "ai_b" | null;
  userJoinedSide: "pro" | "con" | null;
  debateTopic: string;
  isRecording: boolean;
  onStartDebate: (topic: string) => void;
  onPauseDebate: () => void;
  onJoinSide: (side: "pro" | "con") => void;
  onLeaveSide: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  className?: string;
}

function DebaterAvatar({
  side,
  isActive,
  status,
  isUser,
}: {
  side: "left" | "right";
  isActive: boolean;
  status: AppStatus;
  isUser?: boolean;
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
            "relative w-20 h-20 rounded-full flex items-center justify-center",
            "border-2 transition-all duration-300",
            side === "left"
              ? "bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400/50"
              : "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400/50",
            isActive && "ring-4 ring-white/20"
          )}
        >
          <span className="text-3xl">{isUser ? "👤" : "🤖"}</span>
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className={cn(
          "font-bold text-sm",
          side === "left" ? "text-violet-400" : "text-rose-400"
        )}>
          {isUser ? "You" : side === "left" ? "AI Pro" : "AI Con"}
        </div>
        <div className={cn(
          "text-xs px-2 py-0.5 rounded-full mt-1",
          side === "left"
            ? "bg-violet-500/20 text-violet-300"
            : "bg-rose-500/20 text-rose-300"
        )}>
          {side === "left" ? "FOR" : "AGAINST"}
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
  userJoinedSide,
  debateTopic,
  isRecording,
  onStartDebate,
  onPauseDebate,
  onJoinSide,
  onLeaveSide,
  onStartRecording,
  onStopRecording,
  onReset,
  className,
}: ArenaViewProps) {
  const [topicInput, setTopicInput] = useState("");
  
  const aiAMessages = messages.filter((m) => m.speaker === "ai_a").length;
  const aiBMessages = messages.filter((m) => m.speaker === "ai_b").length;
  const userMessages = messages.filter((m) => m.speaker === "user").length;

  const handleStartDebate = () => {
    if (topicInput.trim()) {
      onStartDebate(topicInput.trim());
    }
  };

  const canStart = topicInput.trim().length > 0;

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
            <p className="text-xs text-slate-500">Watch AIs debate any topic</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Topic input */}
          <div className="flex items-center gap-2">
            <input
              aria-label="Debate topic"
              maxLength={500}
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              disabled={isDebateRunning}
              placeholder="Enter a debate topic..."
              className={cn(
                "w-72 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10",
                "text-white placeholder-slate-500 text-sm",
                "focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canStart && !isDebateRunning) {
                  handleStartDebate();
                }
              }}
            />
          </div>
          
          <motion.button
            onClick={isDebateRunning ? onPauseDebate : handleStartDebate}
            disabled={!isDebateRunning && !canStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
              isDebateRunning
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : canStart
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-white/5 text-slate-600 cursor-not-allowed"
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

      {/* Current topic display */}
      {debateTopic && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-rose-500/10 border border-white/10"
        >
          <div className="text-xs text-slate-500 mb-1">Current Topic</div>
          <div className="text-white font-medium">{debateTopic}</div>
        </motion.div>
      )}

      {/* Main arena */}
      <GlassCard variant="default" glow="subtle" className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Debaters section */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <DebaterAvatar
            side="left"
            isActive={activeSpeaker === "ai_a"}
            status={status}
            isUser={userJoinedSide === "pro"}
          />

          {/* VS indicator */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ 
                scale: isDebateRunning ? [1, 1.1, 1] : 1,
                opacity: isDebateRunning ? 1 : 0.5,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-black text-white/20"
            >
              VS
            </motion.div>
          </div>

          <DebaterAvatar
            side="right"
            isActive={activeSpeaker === "ai_b"}
            status={status}
            isUser={userJoinedSide === "con"}
          />
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-4 px-6 py-2 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-violet-400 font-bold">{aiAMessages + (userJoinedSide === "pro" ? userMessages : 0)}</span>
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
            <span className="text-rose-400 font-bold">{aiBMessages + (userJoinedSide === "con" ? userMessages : 0)}</span>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ChatDisplay messages={messages} className="h-full" />
        </div>

        {/* User participation section */}
        <div className="shrink-0 p-4 border-t border-white/5">
          {!userJoinedSide ? (
            // Join side buttons
            <div className="flex gap-3">
              <motion.button
                onClick={() => onJoinSide("pro")}
                disabled={!isDebateRunning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                  isDebateRunning
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                )}
              >
                <Hand className="w-5 h-5" />
                Join FOR Side
              </motion.button>
              
              <motion.button
                onClick={() => onJoinSide("con")}
                disabled={!isDebateRunning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                  isDebateRunning
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                )}
              >
                <Hand className="w-5 h-5" />
                Join AGAINST Side
              </motion.button>
            </div>
          ) : (
            // User is participating - show voice orb and leave button
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col items-center pb-2">
                <VoiceOrb
                  status={status}
                  isRecording={isRecording}
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  size="sm"
                />
              </div>
              
              <motion.button
                onClick={onLeaveSide}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                Leave Debate
              </motion.button>
            </div>
          )}
          
          {!isDebateRunning && !userJoinedSide && (
            <p className="text-center text-slate-500 text-sm mt-2">
              {canStart || debateTopic ? "Start the debate to join a side" : "Enter a topic to start the debate"}
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
