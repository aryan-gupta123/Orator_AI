"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";

interface ChatDisplayProps {
  messages: ChatMessage[];
  className?: string;
}

const speakerConfig = {
  user: {
    name: "You",
    align: "justify-end",
    bubble: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    textAlign: "text-right",
  },
  ai_a: {
    name: "AI",
    align: "justify-start",
    bubble: "bg-gradient-to-br from-violet-500/20 to-purple-600/20 text-white border border-violet-500/30",
    textAlign: "text-left",
  },
  ai_b: {
    name: "Opponent",
    align: "justify-start",
    bubble: "bg-gradient-to-br from-rose-500/20 to-pink-600/20 text-white border border-rose-500/30",
    textAlign: "text-left",
  },
  system: {
    name: "System",
    align: "justify-center",
    bubble: "bg-white/10 text-white/60 text-sm italic",
    textAlign: "text-center",
  },
};

export function ChatDisplay({ messages, className }: ChatDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full text-white/30",
          className
        )}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">💬</div>
          <p>Conversation will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 overflow-y-auto p-4 scroll-smooth",
        className
      )}
    >
      {messages.map((message) => {
        const config = speakerConfig[message.speaker];
        
        return (
          <div
            key={message.id}
            className={cn("flex w-full", config.align)}
          >
            <div className="max-w-[80%] flex flex-col gap-1">
              {/* Speaker name */}
              <span
                className={cn(
                  "text-xs text-white/50 px-2",
                  config.textAlign
                )}
              >
                {config.name}
              </span>
              
              {/* Message bubble */}
              <div
                className={cn(
                  "px-4 py-2 rounded-2xl shadow-lg",
                  config.bubble
                )}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              
              {/* Timestamp */}
              <span
                className={cn(
                  "text-xs text-white/30 px-2",
                  config.textAlign
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
