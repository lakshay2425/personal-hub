"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface LeadDraftStorageResult<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  clearDraft: () => void;
  isReady: boolean;
  storageError: string | null;
}

export function useLeadDraftStorage<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
  enabled = true,
): LeadDraftStorageResult<T> {
  const [value, setValueState] = useState(initialValue);
  const valueRef = useRef(value);
  const [isReady, setIsReady] = useState(!enabled);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        if (!validate(parsed)) {
          // Report malformed persisted data after hydration.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStorageError("The saved lead draft has an invalid format.");
        } else {
          valueRef.current = parsed;
          // Restore browser state after hydration to avoid server/client markup mismatch.
          setValueState(parsed);
        }
      }
    } catch {
      setStorageError("The saved lead draft could not be loaded.");
    } finally {
      setIsReady(true);
    }
  }, [enabled, initialValue, key, validate]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback((nextValue) => {
    const updated =
      typeof nextValue === "function"
        ? (nextValue as (current: T) => T)(valueRef.current)
        : nextValue;
    valueRef.current = updated;
    setValueState(updated);
    if (!enabled) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(updated));
      setStorageError(null);
    } catch {
      setStorageError("The lead draft could not be saved in this browser.");
    }
  }, [enabled, key]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStorageError(null);
    } catch {
      setStorageError("The saved lead draft could not be cleared.");
    }
    valueRef.current = initialValue;
    setValueState(initialValue);
  }, [initialValue, key]);

  return { value, setValue, clearDraft, isReady, storageError };
}
