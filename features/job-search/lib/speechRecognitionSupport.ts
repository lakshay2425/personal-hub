"use client";

import { useSyncExternalStore } from "react";

const DEFAULT_LANG = "en-IN";
const PROBE_TIMEOUT_MS = 5000;

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

/** Returns false when definitely unavailable; null when a start probe is needed. */
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
    if (status === "unavailable" || status === "downloading") return false;
    // "available" can be a false positive (e.g. Brave stub) — verify with start probe.
    return null;
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

    let settled = false;
    let started = false;
    let fatalError = false;

    const cleanup = () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };

    const finish = (supported: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      cleanup();
      resolve(supported);
    };

    const timeoutId = window.setTimeout(() => finish(false), PROBE_TIMEOUT_MS);

    recognition.onstart = () => {
      started = true;
    };

    recognition.onresult = () => finish(true);

    recognition.onerror = (event) => {
      if (FATAL_PROBE_ERRORS.has(event.error)) {
        fatalError = true;
        return;
      }
      if (event.error === "not-allowed") {
        // API works; the user denied mic access during the probe.
        finish(true);
      }
    };

    recognition.onend = () => {
      if (fatalError) {
        finish(false);
        return;
      }
      // Session ended without a fatal error — API is functional.
      finish(started);
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
  if (availableResult === false) return false;

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

/** Downgrade after a runtime fatal error (safety net for false-positive probes). */
export function markSpeechRecognitionUnsupported(): void {
  if (state === "unsupported") return;
  state = "unsupported";
  emitChange();
}

export function useSpeechRecognitionSupport(): SpeechRecognitionSupportState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
