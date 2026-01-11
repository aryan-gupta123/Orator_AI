"use client";

import { useRef, useCallback, useState } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    setIsPlaying(true);

    while (queueRef.current.length > 0) {
      const base64 = queueRef.current.shift();
      if (!base64) continue;

      try {
        const audioContext = getAudioContext();
        if (audioContext.state === "suspended") await audioContext.resume();

        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

        await new Promise<void>((resolve) => {
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          currentSourceRef.current = source;
          source.onended = () => {
            currentSourceRef.current = null;
            resolve();
          };
          source.start();
        });
      } catch (err) {
        console.error("Error playing audio:", err);
      }
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
  }, [getAudioContext]);

  const queueAudio = useCallback((base64: string) => {
    queueRef.current.push(base64);
    processQueue();
  }, [processQueue]);

  const stopAudio = useCallback(() => {
    queueRef.current = [];
    currentSourceRef.current?.stop();
    currentSourceRef.current = null;
    isProcessingRef.current = false;
    setIsPlaying(false);
  }, []);

  return { isPlaying, queueAudio, stopAudio };
}
