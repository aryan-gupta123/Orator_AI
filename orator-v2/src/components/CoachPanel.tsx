"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CoachFeedback } from "@/types";
import { GlassCard } from "./GlassCard";
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

interface CoachPanelProps {
  feedback: CoachFeedback | null;
  className?: string;
}

const sentimentConfig: Record<string, { 
  icon: typeof AlertTriangle; 
  color: string; 
  bg: string;
  label: string;
}> = {
  aggressive: { 
    icon: AlertTriangle, 
    color: "text-red-400", 
    bg: "bg-red-500/10",
    label: "Too aggressive"
  },
  defensive: { 
    icon: AlertTriangle, 
    color: "text-orange-400", 
    bg: "bg-orange-500/10",
    label: "Defensive tone"
  },
  confident: { 
    icon: CheckCircle, 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10",
    label: "Confident"
  },
  uncertain: { 
    icon: Lightbulb, 
    color: "text-amber-400", 
    bg: "bg-amber-500/10",
    label: "Uncertain"
  },
  neutral: { 
    icon: TrendingUp, 
    color: "text-slate-400", 
    bg: "bg-slate-500/10",
    label: "Neutral"
  },
};

function getScoreGradient(score: number) {
  if (score >= 80) return "from-emerald-500 to-teal-500";
  if (score >= 60) return "from-amber-500 to-yellow-500";
  if (score >= 40) return "from-orange-500 to-amber-500";
  return "from-red-500 to-rose-500";
}

export function CoachPanel({ feedback, className }: CoachPanelProps) {
  const config = feedback
    ? sentimentConfig[feedback.sentiment.toLowerCase()] || sentimentConfig.neutral
    : null;

  return (
    <GlassCard variant="darker" className={cn("p-5 h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Live Coach</h3>
          <p className="text-xs text-slate-500">Real-time feedback</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {feedback && config ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col gap-5"
          >
            {/* Score circle */}
            <div className="flex justify-center py-4">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 352" }}
                    animate={{ 
                      strokeDasharray: `${(feedback.score / 100) * 352} 352` 
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className={cn(
                        feedback.score >= 80 ? "text-emerald-500" :
                        feedback.score >= 60 ? "text-amber-500" :
                        feedback.score >= 40 ? "text-orange-500" :
                        "text-red-500"
                      )} stopColor="currentColor" />
                      <stop offset="100%" className={cn(
                        feedback.score >= 80 ? "text-teal-500" :
                        feedback.score >= 60 ? "text-yellow-500" :
                        feedback.score >= 40 ? "text-amber-500" :
                        "text-rose-500"
                      )} stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      getScoreGradient(feedback.score)
                    )}
                  >
                    {feedback.score}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Sentiment badge */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl",
                config.bg
              )}
            >
              <config.icon className={cn("w-5 h-5", config.color)} />
              <span className={cn("font-medium", config.color)}>
                {config.label}
              </span>
            </motion.div>

            {/* Advice */}
            <div className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  Suggestion
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {feedback.advice}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-slate-400">Start speaking</p>
              <p className="text-sm text-slate-600 mt-1">to receive feedback</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
