"use client";

import { useSpeechRecognitionSupport } from "../../lib/speechRecognitionSupport";

export function VoiceInputNote() {
  const support = useSpeechRecognitionSupport();

  if (support !== "unsupported") return null;

  return (
    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
      Voice input requires Chrome or Edge; not supported in Brave.
    </p>
  );
}
