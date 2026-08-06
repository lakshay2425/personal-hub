"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useSpeechRecognitionSupport } from "../lib/speechRecognitionSupport";

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionOptions {
  /** Called with the recognized transcript when speech is captured. */
  onResult: (transcript: string) => void;
  /** BCP-47 language tag. Defaults to Indian English. */
  lang?: string;
}

interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useSpeechRecognition({
  onResult,
  lang = "en-IN",
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const support = useSpeechRecognitionSupport();
  const isSupported = support === "supported";
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Keep the latest callback without re-creating the recognition instance.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionImpl = getSpeechRecognition();
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) onResultRef.current(transcript);
    };

    recognition.onerror = (event) => {
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          toast.error("Microphone access denied");
          break;
        case "no-speech":
          toast.error("No speech detected, try again");
          break;
        case "aborted":
          // User stopped intentionally; no toast needed.
          break;
        default:
          toast.error(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [isSupported, lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // start() throws if recognition is already running; ignore.
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return { isSupported, isListening, start, stop, toggle };
}
