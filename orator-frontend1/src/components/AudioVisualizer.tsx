"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AppStatus } from "@/types";

interface AudioVisualizerProps {
  status: AppStatus;
  className?: string;
}

export function AudioVisualizer({ status, className }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0.1));
  const animationRef = useRef<number>();

  const animate = useCallback(() => {
    setBars((prev) =>
      prev.map(() => {
        if (status === "speaking") {
          return 0.2 + Math.random() * 0.8;
        } else if (status === "listening") {
          return 0.1 + Math.random() * 0.4;
        } else if (status === "thinking") {
          return 0.15 + Math.sin(Date.now() / 200) * 0.1;
        }
        return 0.1;
      })
    );
    animationRef.current = requestAnimationFrame(animate);
  }, [status]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const getBarColor = () => {
    switch (status) {
      case "speaking":
        return "bg-gradient-to-t from-violet-500 to-purple-400";
      case "listening":
        return "bg-gradient-to-t from-emerald-500 to-teal-400";
      case "thinking":
        return "bg-gradient-to-t from-amber-500 to-yellow-400";
      default:
        return "bg-gradient-to-t from-gray-600 to-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "flex items-end justify-center gap-0.5 h-12 px-4",
        className
      )}
    >
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-75",
            getBarColor()
          )}
          style={{
            height: `${height * 100}%`,
            opacity: 0.6 + height * 0.4,
          }}
        />
      ))}
    </div>
  );
}
