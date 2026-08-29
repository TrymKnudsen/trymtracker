import { useCallback, useSyncExternalStore } from "react";
import { defaultState } from "./defaultPlan";
import type { AppState } from "./types";

const KEY = "treningsapp-v1";

let state: AppState = defaultState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      const base = defaultState();
      state = {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings ?? {}) },
      };
    }
  } catch {
    /* ignorer korrupt data */
  }
  emit();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* full disk / privat modus */
  }
}

export function getState(): AppState {
  return state;
}

export function setState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

export function resetState() {
  state = defaultState();
  persist();
  emit();
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const serverState = defaultState();

export function useApp<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => selector(state), [selector]),
    useCallback(() => selector(serverState), [selector]),
  );
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}
