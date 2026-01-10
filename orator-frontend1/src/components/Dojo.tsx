"use client";

import { cn } from "@/lib/utils";
import { AppStatus, ChatMessage, CoachFeedback } from "@/types";
import { Avatar } from "./Avatar";
import { AudioVisualizer } from "./AudioVisualizer";
import { ChatDisplay } from "./ChatDisplay";
import { CoachSidebar } from "./CoachSidebar";
import { Mic, MicOff, RotateCcw } from "lucide-react";

interface DojoProps {
  status: AppStatus;
  messages: ChatMessage[];
  coachFeedback: CoachFeedback | null;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  scenarioName: string;
  className?: string;
}

export function Dojo({
  status,
  messages,
  coachFeedback,
  isRecording,
  onStartRecording,
  onStopRecording,
  onReset,
  scenarioName,
  className,
}: DojoProps) {
  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Scenario header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Training Mode</h2>
            <p className="text-sm text-white/50">{scenarioName}</p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Arena area */}
        <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Avatars section */}
          <div className="flex items-center justify-center gap-16 py-8 border-b border-white/10">
            {/* AI Avatar */}
            <Avatar
              name="Negotiator"
              type="ai_a"
              status={status}
              isActive={status === "speaking" || status === "thinking"}
              size="lg"
            />
          </div>

          {/* Visualizer */}
          <div className="py-4 border-b border-white/10 bg-black/20">
            <AudioVisualizer status={status} />
          </div>

          {/* Chat area */}
          <div className="flex-1 min-h-0">
            <ChatDisplay messages={messages} className="h-full" />
          </div>

          {/* User section */}
          <div className="p-4 border-t border-white/10 bg-black/30">
            <div className="flex items-center justify-center gap-4">
              {/* User avatar (smaller) */}
              <Avatar
                name="You"
                type="user"
                status={status}
                isActive={isRecording || status === "listening"}
                size="sm"
              />

              {/* Record button */}
              <button
                onClick={isRecording ? onStopRecording : onStartRecording}
                className={cn(
                  "relative p-4 rounded-full transition-all duration-300 shadow-lg",
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 scale-110"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
                )}
              >
                {/* Pulse animation when recording */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
                )}
                
                {isRecording ? (
                  <MicOff className="w-6 h-6 text-white relative z-10" />
                ) : (
                  <Mic className="w-6 h-6 text-white relative z-10" />
                )}
              </button>

              {/* Status text */}
              <div className="w-24 text-center">
                <span className="text-sm text-white/60">
                  {isRecording
                    ? "Listening..."
                    : status === "thinking"
                    ? "Thinking..."
                    : status === "speaking"
                    ? "Speaking..."
                    : "Tap to speak"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coach sidebar */}
      <CoachSidebar feedback={coachFeedback} className="w-72 shrink-0" />
    </div>
  );
}
