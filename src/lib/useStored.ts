"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state via useSyncExternalStore: hydration-safe (the
 * server snapshot is `fallback`), no effects, and every component reading the
 * same key stays in sync (including across tabs).
 */
const listeners = new Set<() => void>();
const parsed = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {}
  const hit = parsed.get(key);
  if (hit && hit.raw === raw) return hit.value as T; // stable reference until the raw value changes
  let value: T = fallback;
  try {
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {}
  parsed.set(key, { raw, value });
  return value;
}

export function useStored<T>(key: string, fallback: T, validate?: (v: unknown) => v is T): [T, (v: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [validate && !validate(value) ? fallback : value, set];
}
