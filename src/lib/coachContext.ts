import type { AppState } from "./types";
import { exerciseHistory, isStagnating, sessionVolume, weightStatus } from "./helpers";
import { formatPace } from "./running";

/** Bygger en kompakt tekstkontekst av all treningsdata for AI-coachen. */
export function buildCoachContext(state: AppState): string {
  const lines: string[] = [];

  const ws = weightStatus(state);
  lines.push("## Kroppsvekt");
  lines.push(
    `Mål: ${state.settings.targetPerWeek.toFixed(2)} kg/uke (${state.settings.mode}). Status: ${ws.label}.`,
  );
  if (ws.thisWeek != null && ws.lastWeek != null) {
    lines.push(
      `Snitt denne uka: ${ws.thisWeek.toFixed(2)} kg, forrige uke: ${ws.lastWeek.toFixed(2)} kg, endring: ${ws.delta!.toFixed(2)} kg.`,
    );
  }
  const lastWeights = [...state.weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  if (lastWeights.length) {
    lines.push(
      "Siste vektlogger: " + lastWeights.map((w) => `${w.date}: ${w.weight} kg`).join(", "),
    );
  }

  lines.push("\n## Egenrapportering (siste 3 dager)");
  const checkins = [...state.checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  if (!checkins.length) lines.push("Ingen egenrapportering logget.");
  for (const c of checkins) {
    lines.push(
      `${c.date}: søvnscore ${c.sleepScore}/100, Garmin anslår ${c.recoveryHours} timer til fullstendig restituert (høyt tall = trenger mer hvile), ømhet ${c.soreness}/5${c.note ? ` – ${c.note}` : ""}`,
    );
  }

  lines.push("\n## Løping (mål: halvmaraton)");
  lines.push(
    `Mål: ${state.runPlan.goalDistanceKm} km i ${formatPace(state.runPlan.goalPaceSecPerKm)} snittfart.`,
  );
  const runs = [...state.runLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  if (!runs.length) lines.push("Ingen løpeturer logget ennå.");
  for (const r of runs) {
    lines.push(
      `${r.date} – ${r.type}: ${r.distanceKm} km på ${Math.round(r.durationSec / 60)} min (${formatPace(r.avgPaceSecPerKm)})`,
    );
  }

  lines.push("\n## Siste økter");
  const sessions = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  if (!sessions.length) lines.push("Ingen økter logget ennå.");
  for (const s of sessions) {
    lines.push(
      `${s.date} – ${s.title}: ${Math.round(s.durationSec / 60)} min, volum ${Math.round(sessionVolume(s))} kg${s.freeActivity ? `, fri aktivitet: ${s.freeActivity}` : ""}`,
    );
  }

  lines.push("\n## Løftprogresjon");
  for (const ex of Object.values(state.exercises)) {
    const hist = exerciseHistory(state, ex.id).slice(0, 3);
    if (!hist.length) continue;
    const summary = hist
      .map((h) => `${h.date}: ${h.sets.map((x) => `${x.weight}x${x.reps}`).join("/")}`)
      .join(" | ");
    lines.push(
      `${ex.name} (mål ${ex.sets}x${ex.repMin}-${ex.repMax}, nå ${ex.currentWeight ?? "?"} kg)${
        isStagnating(state, ex.id) ? " [STAGNERER]" : ""
      }: ${summary}`,
    );
  }

  return lines.join("\n");
}
