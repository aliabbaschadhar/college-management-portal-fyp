"use client";

import { useState, useEffect } from "react";

export function useStoredState<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.sessionStorage.getItem(`cmp_filter_${key}`);
      return item !== null ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(`cmp_filter_${key}`, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }
  }, [key, state]);

  return [state, setState];
}
