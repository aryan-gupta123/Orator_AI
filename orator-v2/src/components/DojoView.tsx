"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppStatus, ChatMessage, CoachFeedback, ScenarioType } from "@/types";
import { GlassCard } from "./GlassCard";
import { VoiceOrb } from "./VoiceOrb";
import { ChatDisplay } from "./ChatDisplay";
import { CoachPanel } from "./CoachPanel";
import { ScenarioSelector } from "./ScenarioSelector";
import { RotateCcw, Target } from "lucide-react";

interface DojoViewProps {
  status: AppStatus;
  messages: ChatMessage[];
  coachFeedback: CoachFeedback | null;
  isRecording: boolean;
  selectedScenario: ScenarioType | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  onScenarioChange: (scenario: ScenarioType) => void;
  className?: string;
}

export function DojoView({
  status,
  messages,
  coachFeedback,
  isRecording,
  selectedScenario,
  onStartRecording,
  onStopRecording,
  onReset,
  onScenarioChange,
  className,
}: DojoViewProps) {
  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* Main area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Training Dojo</h2>
              <p className="text-xs text-slate-500">Practice makes perfect</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ScenarioSelector
              mode="dojo"
              selectedScenario={selectedScenario}
              onSelectScenario={onScenarioChange}
              className="w-72"
            />
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

        {/* Conversation area */}
        <GlassCard variant="default" glow="subtle" className="flex-1 flex flex-col overflow-hidden">
          {/* Chat */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatDisplay messages={messages} className="h-full" />
          </div>

          {/* Voice orb */}
          <div className="p-6 border-t border-white/5">
            <div className="flex justify-center">
              <VoiceOrb
                status={status}
                isRecording={isRecording}
                onClick={isRecording ? onStopRecording : onStartRecording}
                size="md"
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Coach sidebar */}
      <div className="w-80 shrink-0">
        <CoachPanel feedback={coachFeedback} className="h-full" />
      </div>
    </div>
  );
}
