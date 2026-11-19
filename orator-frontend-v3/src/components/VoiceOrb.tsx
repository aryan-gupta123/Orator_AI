"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppStatus } from "@/types";
import { Mic, MicOff } from "lucide-react";

interface VoiceOrbProps {
  status: AppStatus;
  isRecording: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VoiceOrb({
  status,
  isRecording,
  onClick,
  size = "lg",
  className,
}: VoiceOrbProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const isActive = isRecording || status === "speaking" || status === "thinking";
  const isSpeaking = status === "speaking";
  const isThinking = status === "thinking";
  const isListening = isRecording || status === "listening";

  return (
    <div className={cn("relative", className)}>
      {/* Outer glow rings */}
      <AnimatePresence>
        {isActive && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute inset-0 rounded-full blur-xl",
                isSpeaking && "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                isThinking && "bg-gradient-to-r from-amber-500 to-orange-500",
                isListening && "bg-gradient-to-r from-emerald-500 to-cyan-500"
              )}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: [1.1, 1.4, 1.1],
                opacity: [0.2, 0.05, 0.2],
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={cn(
                "absolute inset-[-20%] rounded-full blur-2xl",
                isSpeaking && "bg-violet-500/30",
                isThinking && "bg-amber-500/30",
                isListening && "bg-emerald-500/30"
              )}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main orb button */}
      <motion.button
        onClick={onClick}
        aria-label={isRecording ? "Stop recording and send" : "Start recording"}
        disabled={!isRecording && status !== "idle"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "transition-all duration-300 cursor-pointer",
          "border border-white/10",
          sizeClasses[size],
          isRecording
            ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30"
            : isActive
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"
            : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
        )}
      >
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-t from-transparent to-white/10" />
        
        {/* Icon */}
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isRecording ? (
            <MicOff className={cn("text-white relative z-10", iconSizes[size])} />
          ) : (
            <Mic className={cn("text-white relative z-10", iconSizes[size])} />
          )}
        </motion.div>

        {/* Audio visualization rings (when speaking/listening) */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "absolute inset-0 rounded-full border",
                    isSpeaking && "border-violet-400/30",
                    isThinking && "border-amber-400/30",
                    isListening && "border-emerald-400/30"
                  )}
                  animate={{
                    scale: [1, 1.3 + i * 0.2],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span className={cn(
          "text-sm font-medium",
          isRecording && "text-rose-400",
          isSpeaking && "text-violet-400",
          isThinking && "text-amber-400",
          isListening && !isRecording && "text-emerald-400",
          !isActive && "text-slate-400"
        )}>
          {isRecording
            ? "Tap to send"
            : isSpeaking
            ? "Speaking..."
            : isThinking
            ? "Thinking..."
            : status === "listening"
            ? "Transcribing..."
            : "Tap to record"}
        </span>
      </motion.div>
    </div>
  );
}
