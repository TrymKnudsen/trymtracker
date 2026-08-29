import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAppState } from "@/lib/store";
import { exerciseHistory, formatDate, isStagnating } from "@/lib/helpers";

export const Route = createFileRoute("/historikk")({
  head: () => ({
    meta: [
      { title: "Utvikling per øvelse – Treningslogg" },
      {
        name: "description",
        content: "Se vekt og reps for hver økt per øvelse, og oppdag øvelser som har stagnert.",
      },
      { property: "og:title", content: "Utvikling per øvelse – Treningslogg" },
      { property: "og:description", content: "Full historikk over vekt og reps for hver øvelse." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const state = useAppState();
  const all = Object.values(state.exercises).sort((a, b) => a.name.localeCompare(b.name, "no"));
  const [selected, setSelected] = useState(all[0]?.id ?? "");
  const hist = exerciseHistory(state, selected);
  const stagnant = isStagnating(state, selected);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Utvikling</h1>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="tap-target w-full rounded-2xl border border-input bg-card px-4 text-base font-bold outline-none focus:border-primary"
      >
        {all.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
            {isStagnating(state, ex.id) ? " ⚠︎" : ""}
          </option>
        ))}
      </select>

      {stagnant && (
        <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning/15 p-4 text-sm font-semibold text-warning-foreground">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          Vekta har stått stille de siste øktene. Vurder ekstra fokus, deload eller flere reps.
        </div>
      )}

      {hist.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">
          Ingen loggede økter for denne øvelsen ennå.
        </p>
      ) : (
        <ul className="space-y-2">
          {hist.map((h) => {
            const top = Math.max(...h.sets.map((s) => s.weight));
            return (
              <li key={h.date} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{formatDate(h.date)}</p>
                  <p className="font-extrabold text-primary">{top} kg</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {h.sets.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground"
                    >
                      {s.weight} kg × {s.reps}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
