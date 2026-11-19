"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Options {
  onAudioData?: (base64: string, mimeType: string) => void;
}

// A turn is one complete container, including its header and final recorder chunk.
export function useAudioRecorder({ onAudioData }: Options = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const starting = useRef(false);
  const callback = useRef(onAudioData);
  callback.current = onAudioData;

  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    release();
    setIsRecording(false);
  }, [release]);

  const cancelRecording = useCallback(() => {
    generation.current += 1;
    stopRecording();
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    if (starting.current || recorder.current) return;
    starting.current = true;
    const token = ++generation.current;
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Recording needs HTTPS or localhost and a supported browser. You can still type below.");
      }
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true, noiseSuppression: true, autoGainControl: true,
      }});
      if (token !== generation.current) { release(); return; }
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"]
        .find(type => MediaRecorder.isTypeSupported(type));
      const current = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
      recorder.current = current;
      const chunks: Blob[] = [];
      current.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      current.onerror = () => { generation.current += 1; setError("Recording failed. Try again or type below."); stopRecording(); };
      current.onstop = () => {
        const blob = new Blob(chunks, { type: current.mimeType });
        release();
        recorder.current = null;
        setIsRecording(false);
        if (token !== generation.current) return;
        if (!blob.size) { setError("No audio recorded. Please try again."); return; }
        const reader = new FileReader();
        reader.onload = () => {
          if (token === generation.current) callback.current?.(String(reader.result).split(",")[1], blob.type);
        };
        reader.onerror = () => setError("Could not read this recording. Please try again.");
        reader.readAsDataURL(blob);
      };
      current.start(250);
      setIsRecording(true);
      timer.current = setTimeout(stopRecording, 60_000);
    } catch (err) {
      release();
      setError(err instanceof Error ? err.message : "Could not start recording. You can type below.");
    } finally { starting.current = false; }
  }, [release, stopRecording]);

  useEffect(() => () => { generation.current += 1; if (recorder.current?.state === "recording") recorder.current.stop(); release(); }, [release]);
  return { isRecording, error, startRecording, stopRecording, cancelRecording };
}
