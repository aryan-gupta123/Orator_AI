"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { useEffect, useRef } from "react";

interface ChatDisplayProps {
  messages: ChatMessage[];
  className?: string;
}

const speakerConfig = {
  user: {
    align: "justify-end",
    bubble: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
    name: "You",
  },
  ai: {
    align: "justify-start",
    bubble: "bg-white/[0.08] text-white border border-white/10",
    name: "Orator",
  },
  ai_a: {
    align: "justify-start",
    bubble: "bg-gradient-to-br from-violet-500/20 to-purple-600/20 text-white border border-violet-500/20",
    name: "Advocate",
  },
  ai_b: {
    align: "justify-start ml-auto",
    bubble: "bg-gradient-to-br from-rose-500/20 to-pink-600/20 text-white border border-rose-500/20",
    name: "Critic",
  },
  system: {
    align: "justify-center",
    bubble: "bg-white/5 text-slate-400 text-sm italic",
    name: "System",
  },
};

export function ChatDisplay({ messages, className }: ChatDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">💬</div>
          <p className="text-slate-400 text-lg">Record or type to begin the conversation</p>
          <p className="text-slate-500 text-sm mt-2">Your words will appear here</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col gap-4 overflow-y-auto p-6", className)}
    >
      {messages.map((message, index) => {
        const config = speakerConfig[message.speaker];
        const isUser = message.speaker === "user";

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, x: isUser ? 20 : -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn("flex w-full", config.align)}
          >
            <div className={cn(
              "max-w-[75%] flex flex-col gap-1",
              isUser && "items-end"
            )}>
              <span className="text-xs text-slate-500 px-3">
                {config.name}
              </span>
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl shadow-lg",
                  config.bubble,
                  isUser ? "rounded-br-md" : "rounded-bl-md"
                )}
              >
                <p className="text-[15px] leading-relaxed">{message.text}</p>
              </div>
              <span className="text-xs text-slate-600 px-3">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
