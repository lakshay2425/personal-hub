"use client";

import { useSyncExternalStore } from "react";

const DEFAULT_LANG = "en-IN";
const PROBE_TIMEOUT_MS = 3000;

const FATAL_PROBE_ERRORS = new Set<SpeechRecognitionErrorCode>([
  "network",
  "service-not-allowed",
]);

export type SpeechRecognitionSupportState =
  | "pending"
  | "supported"
  | "unsupported";

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

async function probeWithAvailable(
  SpeechRecognitionImpl: SpeechRecognitionConstructor,
  lang: string,
): Promise<boolean | null> {
  if (typeof SpeechRecognitionImpl.available !== "function") return null;

  try {
    const status = await SpeechRecognitionImpl.available({
      langs: [lang],
      processLocally: false,
    });
    if (status === "available") return true;
    if (status === "unavailable") return false;
    // "downloading" — treat as unsupported (e.g. Brave stub that never resolves).
    return false;
  } catch {
    return null;
  }
}

function probeWithStart(
  SpeechRecognitionImpl: SpeechRecognitionConstructor,
  lang: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    const cleanup = () => {
      recognition.onstart = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve(false);
    }, PROBE_TIMEOUT_MS);

    const finish = (supported: boolean) => {
      window.clearTimeout(timeoutId);
      cleanup();
      resolve(supported);
    };

    recognition.onstart = () => finish(true);

    recognition.onerror = (event) => {
      if (FATAL_PROBE_ERRORS.has(event.error)) {
        finish(false);
        return;
      }
      // Permission denied or benign errors mean the API itself works.
      finish(true);
    };

    try {
      recognition.start();
    } catch {
      finish(false);
    }
  });
}

async function probeSpeechRecognition(lang: string): Promise<boolean> {
  const SpeechRecognitionImpl = getSpeechRecognition();
  if (!SpeechRecognitionImpl) return false;

  const availableResult = await probeWithAvailable(SpeechRecognitionImpl, lang);
  if (availableResult !== null) return availableResult;

  return probeWithStart(SpeechRecognitionImpl, lang);
}

const listeners = new Set<() => void>();

let state: SpeechRecognitionSupportState = "pending";
let probeStarted = false;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  ensureProbe();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): SpeechRecognitionSupportState {
  return state;
}

function getServerSnapshot(): SpeechRecognitionSupportState {
  return "pending";
}

function ensureProbe(lang = DEFAULT_LANG) {
  if (probeStarted || typeof window === "undefined") return;
  probeStarted = true;

  if (!getSpeechRecognition()) {
    state = "unsupported";
    emitChange();
    return;
  }

  void probeSpeechRecognition(lang).then((supported) => {
    state = supported ? "supported" : "unsupported";
    emitChange();
  });
}

export function useSpeechRecognitionSupport(): SpeechRecognitionSupportState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
