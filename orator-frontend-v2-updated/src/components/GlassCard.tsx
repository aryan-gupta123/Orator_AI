"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "darker" | "lighter";
  glow?: "none" | "subtle" | "strong";
  children: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white/[0.03] border-white/[0.08]",
      darker: "bg-black/20 border-white/[0.05]",
      lighter: "bg-white/[0.06] border-white/[0.12]",
    };

    const glowStyles = {
      none: "",
      subtle: "shadow-lg shadow-indigo-500/5",
      strong: "shadow-xl shadow-indigo-500/10",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl border backdrop-blur-xl",
          variantStyles[variant],
          glowStyles[glow],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
