"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppStatus, ChatMessage, SandboxPersona, SANDBOX_PERSONAS } from "@/types";
import { GlassCard } from "./GlassCard";
import { VoiceOrb } from "./VoiceOrb";
import { ChatDisplay } from "./ChatDisplay";
import { PersonaSelector, PersonaChip } from "./PersonaSelector";
import { RotateCcw, Sparkles } from "lucide-react";

interface SandboxViewProps {
  status: AppStatus;
  messages: ChatMessage[];
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  onPersonaChange: (persona: SandboxPersona) => void;
  className?: string;
}

export function SandboxView({
  status,
  messages,
  isRecording,
  onStartRecording,
  onStopRecording,
  onReset,
  onPersonaChange,
  className,
}: SandboxViewProps) {
  const [selectedPersona, setSelectedPersona] = useState<SandboxPersona>(
    SANDBOX_PERSONAS[0]
  );
  const [isPersonaSelectorOpen, setIsPersonaSelectorOpen] = useState(false);

  const handlePersonaSelect = (persona: SandboxPersona) => {
    setSelectedPersona(persona);
    onPersonaChange(persona);
  };

  return (
    <div className={cn("flex flex-col h-full gap-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PersonaChip
            persona={selectedPersona}
            onClick={() => setIsPersonaSelectorOpen(true)}
          />
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-slate-500"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Talk about anything</span>
          </motion.div>
        </div>

        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </motion.button>
      </div>

      {/* Main content */}
      <GlassCard variant="default" glow="subtle" className="flex-1 flex flex-col overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatDisplay messages={messages} className="h-full" />
        </div>

        {/* Voice control area */}
        <div className="p-8 border-t border-white/5">
          <div className="flex flex-col items-center">
            <VoiceOrb
              status={status}
              isRecording={isRecording}
              onClick={isRecording ? onStopRecording : onStartRecording}
              size="lg"
            />
          </div>
        </div>
      </GlassCard>

      {/* Persona selector modal */}
      <PersonaSelector
        selectedPersona={selectedPersona}
        onSelectPersona={handlePersonaSelect}
        isOpen={isPersonaSelectorOpen}
        onClose={() => setIsPersonaSelectorOpen(false)}
      />
    </div>
  );
}
