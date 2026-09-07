import type { RunLog, RunPlanState, RunPrescription, RunType } from "./types";

export const RUN_TYPE_NAMES: Record<RunType, string> = {
  rolig: "Rolig tur",
  intervall: "Intervall",
  terskel: "Terskel",
  langtur: "Langtur",
};

export function paceSecPerKm(distanceKm: number, durationSec: number): number {
  if (!distanceKm) return 0;
  return durationSec / distanceKm;
}

export function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

export function formatClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

/** Historikk for én økttype, nyeste først */
export function runHistory(logs: RunLog[], type: RunType): RunLog[] {
  return logs.filter((l) => l.type === type).sort((a, b) => b.date.localeCompare(a.date));
}

const INTERVAL_STEPS = [
  { reps: 6, meters: 400 },
  { reps: 8, meters: 400 },
  { reps: 6, meters: 600 },
  { reps: 6, meters: 800 },
  { reps: 4, meters: 1000 },
  { reps: 5, meters: 1000 },
];

export function nextRunPrescription(
  type: RunType,
  plan: RunPlanState,
  logs: RunLog[],
): RunPrescription {
  const goal = plan.goalPaceSecPerKm;
  const hist = runHistory(logs, type);
  const last = hist[0];

  if (type === "rolig") {
    const pace = goal + 50;
    return {
      type,
      description: `Rolig restitusjonstur 5–8 km i ca. ${formatPace(pace)}. Skal føles lett – du skal kunne prate hele veien.`,
      targetPaceSecPerKm: pace,
      targetDistanceKm: 6,
      targetDurationSec: null,
    };
  }

  if (type === "langtur") {
    const pace = goal + 45;
    const baseline = plan.baselineTest?.distanceKm ?? 6;
    let distance = Math.max(8, Math.round(baseline * 1.3));
    if (last) {
      distance = last.distanceKm;
      // Øk 10 % kun hvis forrige langtur ble gjennomført i målfart eller roligere
      if (last.avgPaceSecPerKm >= pace - 15) distance = last.distanceKm * 1.1;
    }
    distance = Math.min(20, Math.round(distance * 2) / 2);
    return {
      type,
      description: `Langtur ${distance.toFixed(1)} km i ca. ${formatPace(pace)}. Maks 10 % lengre enn forrige langtur – tak på 20 km mot halvmaraton.`,
      targetPaceSecPerKm: pace,
      targetDistanceKm: distance,
      targetDurationSec: null,
    };
  }

  if (type === "terskel") {
    const pace = goal + 18;
    const completed = hist.length;
    const durationSec = Math.min(1800, 900 + Math.floor(completed / 2) * 150);
    return {
      type,
      description: `Terskel: ${Math.round(durationSec / 60)} min sammenhengende i ca. ${formatPace(pace)} (15–20 sek/km roligere enn målfart). 15 min rolig oppvarming og nedjogg.`,
      targetPaceSecPerKm: pace,
      targetDistanceKm: null,
      targetDurationSec: durationSec,
    };
  }

  // intervall
  const progressed = hist.filter((l) => l.avgPaceSecPerKm <= goal + 5).length;
  const step = INTERVAL_STEPS[Math.min(INTERVAL_STEPS.length - 1, progressed)]!;
  const pace = goal - 5;
  const totalKm = (step.reps * step.meters) / 1000;
  return {
    type: "intervall",
    description: `Intervall: ${step.reps} × ${step.meters} m i ca. ${formatPace(pace)}, 2 min rolig pause mellom. Øker først når økta gjennomføres i målfart eller raskere.`,
    targetPaceSecPerKm: pace,
    targetDistanceKm: totalKm,
    targetDurationSec: null,
  };
}

/** Speiler isStagnating() i helpers.ts, men på pace/distanse i stedet for vekt */
export function isRunStagnating(logs: RunLog[], type: RunType, lookback = 4): boolean {
  const hist = runHistory(logs, type).slice(0, lookback);
  if (hist.length < 3) return false;
  if (type === "langtur") {
    const best = Math.max(...hist.map((l) => l.distanceKm));
    return hist[0]!.distanceKm >= best - 0.2;
  }
  const best = Math.min(...hist.map((l) => l.avgPaceSecPerKm));
  return hist[0]!.avgPaceSecPerKm >= best - 3;
}
