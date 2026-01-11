"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SANDBOX_PERSONAS, SandboxPersona } from "@/types";
import { GlassCard } from "./GlassCard";
import { X } from "lucide-react";

interface PersonaSelectorProps {
  selectedPersona: SandboxPersona | null;
  onSelectPersona: (persona: SandboxPersona) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function PersonaSelector({
  selectedPersona,
  onSelectPersona,
  isOpen,
  onClose,
  className,
}: PersonaSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl p-4",
              className
            )}
          >
            <GlassCard variant="darker" className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Choose a Persona</h2>
                  <p className="text-slate-400 mt-1">Who would you like to talk to?</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Persona Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SANDBOX_PERSONAS.map((persona) => {
                  const isSelected = selectedPersona?.id === persona.id;

                  return (
                    <motion.button
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        onClose();
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "relative p-4 rounded-xl text-left transition-all duration-300",
                        "border",
                        isSelected
                          ? `bg-gradient-to-br ${persona.gradient} border-transparent`
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                      )}
                    >
                      <div className="text-3xl mb-2">{persona.icon}</div>
                      <div className={cn(
                        "font-semibold",
                        isSelected ? "text-white" : "text-slate-200"
                      )}>
                        {persona.name}
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        isSelected ? "text-white/70" : "text-slate-500"
                      )}>
                        {persona.description}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Compact inline selector
export function PersonaChip({
  persona,
  onClick,
  className,
}: {
  persona: SandboxPersona | null;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-white/[0.05] border border-white/10 hover:bg-white/[0.08]",
        "transition-all duration-200",
        className
      )}
    >
      <span className="text-lg">{persona?.icon || "🎭"}</span>
      <span className="text-sm font-medium text-slate-200">
        {persona?.name || "Choose persona"}
      </span>
      <span className="text-xs text-slate-500">▼</span>
    </motion.button>
  );
}
