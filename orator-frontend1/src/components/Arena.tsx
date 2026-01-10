"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AppStatus, ChatMessage } from "@/types";
import { Avatar } from "./Avatar";
import { AudioVisualizer } from "./AudioVisualizer";
import { ChatDisplay } from "./ChatDisplay";
import { VideoPlayer } from "./VideoPlayer";
import { Hand, RotateCcw, Play, Pause } from "lucide-react";

interface ArenaProps {
  status: AppStatus;
  messages: ChatMessage[];
  currentVideo: { videoId: string; timestamp: number } | null;
  activeSpeaker: "ai_a" | "ai_b" | null;
  isDebateRunning: boolean;
  onBargeIn: () => void;
  onStartDebate: () => void;
  onPauseDebate: () => void;
  onReset: () => void;
  onCloseVideo: () => void;
  scenarioName: string;
  className?: string;
}

export function Arena({
  status,
  messages,
  currentVideo,
  activeSpeaker,
  isDebateRunning,
  onBargeIn,
  onStartDebate,
  onPauseDebate,
  onReset,
  onCloseVideo,
  scenarioName,
  className,
}: ArenaProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Arena Mode</h2>
          <p className="text-sm text-white/50">{scenarioName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={isDebateRunning ? onPauseDebate : onStartDebate}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
              isDebateRunning
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
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
                Start Debate
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Main arena */}
      <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* Debate stage */}
        <div className="flex items-stretch justify-between p-6 border-b border-white/10">
          {/* AI A (Left) */}
          <div className="flex-1 flex flex-col items-center">
            <Avatar
              name="Advocate"
              type="ai_a"
              status={status}
              isActive={activeSpeaker === "ai_a"}
              size="lg"
            />
            <div className="mt-3 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30">
              <span className="text-xs text-violet-300 font-medium">PRO</span>
            </div>
          </div>

          {/* Center - VS / Video */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {currentVideo ? (
              <VideoPlayer
                videoId={currentVideo.videoId}
                timestamp={currentVideo.timestamp}
                onClose={onCloseVideo}
                className="w-full max-w-sm"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-white/20">VS</div>
                <AudioVisualizer status={status} className="mt-4" />
              </div>
            )}
          </div>

          {/* AI B (Right) */}
          <div className="flex-1 flex flex-col items-center">
            <Avatar
              name="Critic"
              type="ai_b"
              status={status}
              isActive={activeSpeaker === "ai_b"}
              size="lg"
            />
            <div className="mt-3 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30">
              <span className="text-xs text-rose-300 font-medium">CON</span>
            </div>
          </div>
        </div>

        {/* Chat/transcript area */}
        <div className="flex-1 min-h-0">
          <ChatDisplay messages={messages} className="h-full" />
        </div>

        {/* User intervention bar */}
        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onBargeIn}
              disabled={!isDebateRunning}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                isDebateRunning
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              <Hand className="w-5 h-5" />
              Barge In
            </button>
            <p className="text-sm text-white/40">
              {isDebateRunning
                ? "Jump in to settle the debate!"
                : "Start the debate to participate"}
            </p>
          </div>
        </div>
      </div>

      {/* Score/stats could go here */}
      <div className="mt-4 flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-violet-400">
            {messages.filter((m) => m.speaker === "ai_a").length}
          </div>
          <div className="text-xs text-white/40">Advocate points</div>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="text-center">
          <div className="text-2xl font-bold text-rose-400">
            {messages.filter((m) => m.speaker === "ai_b").length}
          </div>
          <div className="text-xs text-white/40">Critic points</div>
        </div>
      </div>
    </div>
  );
}
