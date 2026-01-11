"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SCENARIOS, Scenario, ScenarioType } from "@/types";
import { GlassCard } from "./GlassCard";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ScenarioSelectorProps {
  mode: "dojo" | "arena";
  selectedScenario: ScenarioType | null;
  onSelectScenario: (scenario: ScenarioType) => void;
  className?: string;
}

export function ScenarioSelector({
  mode,
  selectedScenario,
  onSelectScenario,
  className,
}: ScenarioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scenarios = SCENARIOS.filter((s) => s.mode === mode);
  const currentScenario = scenarios.find((s) => s.id === selectedScenario);

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
          "bg-white/[0.03] border border-white/10 hover:bg-white/[0.06]",
          "transition-all duration-200"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentScenario?.icon || "📋"}</span>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">
              {currentScenario?.name || "Select a scenario"}
            </div>
            <div className="text-xs text-slate-500">
              {currentScenario?.description || "Choose your challenge"}
            </div>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-slate-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 z-40"
            >
              <GlassCard variant="darker" className="p-2 max-h-80 overflow-y-auto">
                {scenarios.map((scenario) => {
                  const isSelected = selectedScenario === scenario.id;

                  return (
                    <motion.button
                      key={scenario.id}
                      onClick={() => {
                        onSelectScenario(scenario.id);
                        setIsOpen(false);
                      }}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left",
                        "transition-all duration-200",
                        isSelected
                          ? `bg-gradient-to-r ${scenario.gradient} text-white`
                          : "hover:bg-white/[0.05]"
                      )}
                    >
                      <span className="text-2xl">{scenario.icon}</span>
                      <div>
                        <div className={cn(
                          "text-sm font-semibold",
                          isSelected ? "text-white" : "text-slate-200"
                        )}>
                          {scenario.name}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isSelected ? "text-white/70" : "text-slate-500"
                        )}>
                          {scenario.description}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
