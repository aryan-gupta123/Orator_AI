"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  videoId: string | null;
  timestamp: number;
  onClose: () => void;
  className?: string;
}

// TwelveLabs video URLs - in production, you'd fetch this from your backend
// For now, we'll use a mapping of pre-indexed videos
const VIDEO_MAP: Record<string, string> = {
  // Add your TwelveLabs indexed video URLs here
  // Format: "twelvelabs_video_id": "youtube_or_video_url"
  "sample_ai_video": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "sample_climate": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "sample_cooking": "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

export function VideoPlayer({
  videoId,
  timestamp,
  onClose,
  className,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get video URL with timestamp
  const getVideoUrl = () => {
    if (!videoId) return null;
    
    const baseUrl = VIDEO_MAP[videoId];
    if (!baseUrl) {
      // Fallback: assume it's a YouTube video ID
      return `https://www.youtube.com/embed/${videoId}?start=${Math.floor(timestamp)}&autoplay=1`;
    }
    
    // Add timestamp parameter
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}start=${Math.floor(timestamp)}&autoplay=1`;
  };

  const videoUrl = getVideoUrl();

  if (!videoId || !videoUrl) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-white/70 font-medium">
            Evidence Clip
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={videoUrl.replace("embed/", "watch?v=").replace("?start=", "&t=")}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-white/70" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Timestamp indicator */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
        <span className="text-xs text-white/70">
          Starting at {Math.floor(timestamp / 60)}:{(timestamp % 60).toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
