"use client";

import { useRef, useCallback, useState } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const queueAudio = useCallback((base64: string) => {
    console.log("Received audio to play, length:", base64.length);
    
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      // Create data URL from base64
      const audioUrl = `data:audio/mpeg;base64,${base64}`;
      
      audioRef.current.src = audioUrl;
      audioRef.current.onplay = () => {
        console.log("Audio started playing");
        setIsPlaying(true);
      };
      audioRef.current.onended = () => {
        console.log("Audio finished playing");
        setIsPlaying(false);
      };
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      };
      
      // Play the audio
      audioRef.current.play()
        .then(() => console.log("Audio play() succeeded"))
        .catch((err) => console.error("Audio play() failed:", err));
        
    } catch (err) {
      console.error("Error setting up audio:", err);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  return { isPlaying, queueAudio, stopAudio };
}
