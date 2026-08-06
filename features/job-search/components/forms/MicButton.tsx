"use client";

import { Mic, MicOff } from "lucide-react";
import { useCallback } from "react";

import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

interface MicButtonProps {
  value: string;
  onChange: (v: string) => void;
  /** Vertical alignment: "center" for inputs, "top" for textareas. */
  align?: "center" | "top";
}

export function MicButton({ value, onChange, align = "center" }: MicButtonProps) {
  const handleResult = useCallback(
    (transcript: string) => {
      const existing = value.trimEnd();
      onChange(existing ? `${existing} ${transcript}` : transcript);
    },
    [value, onChange],
  );

  const { isSupported, isListening, toggle } = useSpeechRecognition({
    onResult: handleResult,
  });

  // Progressive enhancement: silently hide when unsupported.
  if (!isSupported) return null;

  const verticalClass =
    align === "top" ? "top-2" : "top-1/2 -translate-y-1/2";

  return (
    <>
      {isListening && (
        <span
          className={`pointer-events-none absolute right-10 flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400 ${verticalClass}`}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          Listening…
        </span>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        aria-pressed={isListening}
        title={isListening ? "Stop listening" : "Voice to text"}
        className={`absolute right-2 flex h-6 w-6 items-center justify-center rounded-md transition-colors ${verticalClass} ${
          isListening
            ? "animate-pulse text-red-500 hover:text-red-600"
            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        }`}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>
    </>
  );
}
