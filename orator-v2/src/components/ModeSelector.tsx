"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";
import { MessageCircle, Swords, GraduationCap } from "lucide-react";

interface ModeSelectorProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  className?: string;
}

const modes = [
  {
    id: "sandbox" as AppMode,
    name: "Sandbox",
    description: "Free conversation",
    icon: MessageCircle,
    gradient: "from-cyan-500 to-blue-600",
    shadowColor: "shadow-cyan-500/20",
  },
  {
    id: "dojo" as AppMode,
    name: "Dojo",
    description: "Practice scenarios",
    icon: GraduationCap,
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    id: "arena" as AppMode,
    name: "Arena",
    description: "Watch AI debates",
    icon: Swords,
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
  },
];

export function ModeSelector({ currentMode, onSelectMode, className }: ModeSelectorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        const Icon = mode.icon;

        return (
          <motion.button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
              "border",
              isActive
                ? `bg-gradient-to-r ${mode.gradient} border-transparent shadow-lg ${mode.shadowColor}`
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
            )}
          >
            <Icon className={cn(
              "w-4 h-4",
              isActive ? "text-white" : "text-slate-400"
            )} />
            <div className="text-left">
              <div className={cn(
                "text-sm font-semibold",
                isActive ? "text-white" : "text-slate-200"
              )}>
                {mode.name}
              </div>
              <div className={cn(
                "text-xs",
                isActive ? "text-white/70" : "text-slate-500"
              )}>
                {mode.description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
