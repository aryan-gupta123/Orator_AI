"use client";

import { cn } from "@/lib/utils";
import { AppStatus } from "@/types";

interface AvatarProps {
  name: string;
  type: "user" | "ai_a" | "ai_b";
  status?: AppStatus;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarColors = {
  user: "from-emerald-500 to-teal-600",
  ai_a: "from-violet-500 to-purple-600",
  ai_b: "from-rose-500 to-pink-600",
};

const avatarIcons = {
  user: "👤",
  ai_a: "🤖",
  ai_b: "🤖",
};

const sizeClasses = {
  sm: "w-12 h-12 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-28 h-28 text-4xl",
};

export function Avatar({
  name,
  type,
  status = "idle",
  isActive = false,
  size = "md",
  className,
}: AvatarProps) {
  const isSpeaking = status === "speaking" && isActive;
  const isThinking = status === "thinking" && isActive;
  const isListening = status === "listening" && isActive;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Avatar circle */}
      <div className="relative">
        {/* Pulse ring for speaking */}
        {isSpeaking && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br opacity-50 animate-ping",
              avatarColors[type]
            )}
          />
        )}
        
        {/* Breathing ring for thinking */}
        {isThinking && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br opacity-30 animate-pulse",
              avatarColors[type]
            )}
            style={{ transform: "scale(1.2)" }}
          />
        )}

        {/* Main avatar */}
        <div
          className={cn(
            "relative rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-300",
            avatarColors[type],
            sizeClasses[size],
            isActive && "ring-4 ring-white/30 scale-105",
            isSpeaking && "animate-bounce",
          )}
        >
          <span className="drop-shadow-md">{avatarIcons[type]}</span>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Name label */}
      <span
        className={cn(
          "text-sm font-medium text-white/80 transition-all",
          isActive && "text-white font-semibold"
        )}
      >
        {name}
      </span>

      {/* Status indicator */}
      {isActive && (
        <span className="text-xs text-white/60 capitalize">
          {status === "idle" ? "Ready" : status}...
        </span>
      )}
    </div>
  );
}
