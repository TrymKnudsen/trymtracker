import type { AppState, BodyWeightLog, DayKey, Exercise, WorkoutSession } from "./types";
import { DAY_ORDER } from "./types";

export function todayISO(d = new Date()): string {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function todayKey(d = new Date()): DayKey {
  // JS: 0 = søndag
  const idx = (d.getDay() + 6) % 7;
  return DAY_ORDER[idx]!;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function round(n: number, step = 0.1): number {
  return Math.round(n / step) * step;
}

/* ---------- Vekt / snitt ---------- */

export function sortedWeights(logs: BodyWeightLog[]): BodyWeightLog[] {
  return [...logs].sort((a, b) => a.date.localeCompare(b.date));
}

export function movingAverage(logs: BodyWeightLog[], window = 7): { date: string; avg: number }[] {
  const s = sortedWeights(logs);
  return s.map((log, i) => {
    const slice = s.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((a, b) => a + b.weight, 0) / slice.length;
    return { date: log.date, avg };
  });
}

function avgOfRange(logs: BodyWeightLog[], from: Date, to: Date): number | null {
  const f = todayISO(from);
  const t = todayISO(to);
  const inRange = logs.filter((l) => l.date >= f && l.date < t);
  if (!inRange.length) return null;
  return inRange.reduce((a, b) => a + b.weight, 0) / inRange.length;
}

export interface WeightStatus {
  thisWeek: number | null;
  lastWeek: number | null;
  delta: number | null;
  label: string;
  tone: "good" | "fast" | "slow" | "unknown";
  hint: string;
}

export function weightStatus(state: AppState): WeightStatus {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d14 = new Date(now.getTime() - 14 * 86400000);
  const tomorrow = new Date(now.getTime() + 86400000);
  const thisWeek = avgOfRange(state.weights, d7, tomorrow);
  const lastWeek = avgOfRange(state.weights, d14, d7);
  if (thisWeek == null || lastWeek == null) {
    return {
      thisWeek,
      lastWeek,
      delta: null,
      label: "Trenger mer data",
      tone: "unknown",
      hint: "Logg vekt i minst to uker for å se trenden.",
    };
  }
  const delta = thisWeek - lastWeek;
  const target = state.settings.targetPerWeek;
  const tol = Math.max(0.05, state.settings.toleranse);
  if (delta > target + tol) {
    return {
      thisWeek,
      lastWeek,
      delta,
      label: target >= 0 ? "Går for fort opp" : "Går for sakte ned",
      tone: "fast",
      hint: `Mål ${target.toFixed(2)} kg/uke. Du ligger ${(delta - target).toFixed(2)} kg over.`,
    };
  }
  if (delta < target - tol) {
    return {
      thisWeek,
      lastWeek,
      delta,
      label: target >= 0 ? "Går for sakte / ikke opp" : "Går for fort ned",
      tone: "slow",
      hint: `Mål ${target.toFixed(2)} kg/uke. Du ligger ${(target - delta).toFixed(2)} kg under.`,
    };
  }
  return {
    thisWeek,
    lastWeek,
    delta,
    label: "På rett vei",
    tone: "good",
    hint: `Mål ${target.toFixed(2)} kg/uke – du treffer blinken.`,
  };
}

/* ---------- Progressive overload ---------- */

export function nextWeight(ex: Exercise, sets: { weight: number; reps: number }[]): number | null {
  const done = sets.filter((s) => s.reps > 0);
  if (!done.length) return ex.currentWeight;
  const weight = Math.max(...done.map((s) => s.weight));
  const allTop = done.every((s) => s.reps >= ex.repMax);
  if (allTop) return round(weight + ex.increment, 0.5);
  return weight;
}

export function applyProgression(state: AppState, session: WorkoutSession): AppState {
  const exercises = { ...state.exercises };
  for (const entry of session.entries) {
    const ex = exercises[entry.exerciseId];
    if (!ex) continue;
    const w = nextWeight(ex, entry.sets);
    if (w != null) exercises[entry.exerciseId] = { ...ex, currentWeight: w };
  }
  return { ...state, exercises };
}

/** Historikk for en øvelse, nyeste først */
export function exerciseHistory(state: AppState, exerciseId: string) {
  return state.sessions
    .filter((s) => s.entries.some((e) => e.exerciseId === exerciseId && e.sets.length))
    .map((s) => ({
      date: s.date,
      sets: s.entries.find((e) => e.exerciseId === exerciseId)!.sets,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function isStagnating(state: AppState, exerciseId: string, lookback = 4): boolean {
  const hist = exerciseHistory(state, exerciseId).slice(0, lookback);
  if (hist.length < 3) return false;
  const tops = hist.map((h) => Math.max(...h.sets.map((s) => s.weight)));
  return tops.every((t) => t === tops[0]);
}

export function sessionVolume(session: WorkoutSession): number {
  return session.entries.reduce(
    (a, e) => a + e.sets.reduce((x, s) => x + s.weight * s.reps, 0),
    0,
  );
}

export function personalRecords(state: AppState, session: WorkoutSession): string[] {
  const prs: string[] = [];
  for (const entry of session.entries) {
    const best = Math.max(0, ...entry.sets.map((s) => s.weight));
    if (!best) continue;
    const previous = state.sessions
      .filter((s) => s.id !== session.id)
      .flatMap((s) => s.entries.filter((e) => e.exerciseId === entry.exerciseId))
      .flatMap((e) => e.sets.map((x) => x.weight));
    const prevBest = previous.length ? Math.max(...previous) : 0;
    if (best > prevBest) prs.push(`${entry.name} – ${best} kg`);
  }
  return prs;
}
