"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export interface Speech {
  id: string;
  text: string;
  audio: string | null;
}

export function useAudioPlayer() {
  const [error, setError] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const done = useRef<(() => void) | null>(null);

  const stopAudio = useCallback(() => {
    if (audio.current) { audio.current.pause(); audio.current.src = ""; audio.current = null; }
    window.speechSynthesis?.cancel();
    done.current?.();
    done.current = null;
  }, []);

  const playSpeech = useCallback((speech: Speech, onFinished: () => void) => {
    stopAudio();
    setError(null);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      done.current = null;
      onFinished();
    };
    done.current = finish;
    const fail = () => { setError("Audio could not play. Your response is available in the transcript."); finish(); };
    if (speech.audio) {
      const player = new Audio(`data:audio/mpeg;base64,${speech.audio}`);
      audio.current = player;
      player.onended = finish;
      player.onerror = fail;
      player.play().catch(fail);
    } else if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(speech.text);
      utterance.lang = "en-US";
      utterance.onend = finish;
      utterance.onerror = event => { if (event.error === "canceled" || event.error === "interrupted") finish(); else fail(); };
      window.speechSynthesis.speak(utterance);
    } else fail();
  }, [stopAudio]);

  useEffect(() => () => stopAudio(), [stopAudio]);
  return { playSpeech, stopAudio, error };
}
