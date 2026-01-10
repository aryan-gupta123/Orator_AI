"use client";

import { cn } from "@/lib/utils";
import { CoachFeedback } from "@/types";
import { AlertTriangle, CheckCircle, Info, TrendingUp } from "lucide-react";

interface CoachSidebarProps {
  feedback: CoachFeedback | null;
  className?: string;
}

const sentimentConfig: Record<
  string,
  { icon: typeof AlertTriangle; color: string; bgColor: string }
> = {
  aggressive: {
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/30",
  },
  defensive: {
    icon: AlertTriangle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/30",
  },
  confident: {
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/30",
  },
  uncertain: {
    icon: Info,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
  },
  neutral: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/30",
  },
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-green-500 to-emerald-500";
  if (score >= 60) return "from-yellow-500 to-amber-500";
  if (score >= 40) return "from-orange-500 to-amber-500";
  return "from-red-500 to-rose-500";
}

export function CoachSidebar({ feedback, className }: CoachSidebarProps) {
  const config = feedback
    ? sentimentConfig[feedback.sentiment.toLowerCase()] || sentimentConfig.neutral
    : null;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Live Coach</h3>
          <p className="text-xs text-white/50">Real-time feedback</p>
        </div>
      </div>

      {/* Content */}
      {feedback && config ? (
        <div className="flex-1 flex flex-col gap-4">
          {/* Score */}
          <div className="text-center py-4">
            <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">
              Performance Score
            </div>
            <div
              className={cn(
                "text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                getScoreGradient(feedback.score)
              )}
            >
              {feedback.score}
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                  getScoreGradient(feedback.score)
                )}
                style={{ width: `${feedback.score}%` }}
              />
            </div>
          </div>

          {/* Sentiment */}
          <div
            className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              config.bgColor
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <config.icon className={cn("w-4 h-4", config.color)} />
              <span className={cn("text-sm font-medium capitalize", config.color)}>
                {feedback.sentiment}
              </span>
            </div>
          </div>

          {/* Advice */}
          <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-white/50 mb-2 uppercase tracking-wider">
              Suggestion
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              {feedback.advice}
            </p>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-white/30 text-center">
            Updated {feedback.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/40">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm">Start speaking to receive feedback</p>
          </div>
        </div>
      )}
    </div>
  );
}
