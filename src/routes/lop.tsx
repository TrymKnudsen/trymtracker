import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Footprints } from "lucide-react";
import { setState, useAppState } from "@/lib/store";
import { formatDate, todayISO } from "@/lib/helpers";
import {
  RUN_TYPE_NAMES,
  formatClock,
  formatPace,
  isRunStagnating,
  nextRunPrescription,
  runHistory,
} from "@/lib/running";
import { DAY_NAMES, DAY_ORDER, type RunType } from "@/lib/types";

export const Route = createFileRoute("/lop")({
  head: () => ({
    meta: [
      { title: "Løpeplan – mot halvmaraton under 1:30" },
      {
        name: "description",
        content:
          "Ukeplan for løping, anbefalt økt per type og historikk over langtur, terskel og intervall.",
      },
      { property: "og:title", content: "Løpeplan – mot halvmaraton under 1:30" },
      {
        property: "og:description",
        content: "Se anbefalte løpeøkter, fart og utvikling over tid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RunPage,
});

const TYPES: RunType[] = ["intervall", "terskel", "langtur", "rolig"];

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) * 0.97;
  const max = Math.max(...values) * 1.03;
  const span = Math.max(0.001, max - min);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / span) * 100}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-2 h-20 w-full">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function RunPage() {
  const state = useAppState();
  const [open, setOpen] = useState<RunType>("langtur");
  const plan = state.runPlan;

  const langtur = [...runHistory(state.runLogs, "langtur")].reverse();
  const terskel = [...runHistory(state.runLogs, "terskel")].reverse();

  return (
    <div className="space-y-4">
      <header className="gradient-hero shadow-pop rounded-3xl p-6 text-primary-foreground">
        <p className="text-sm font-semibold opacity-90">Løping</p>
        <h1 className="mt-1 text-3xl font-extrabold">Mot halvmaraton</h1>
        <p className="text-sm opacity-90">
          Mål: {plan.goalDistanceKm} km i {formatPace(plan.goalPaceSecPerKm)}
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Footprints className="size-5 text-primary" /> Løpeuka
        </h2>
        <ul className="mt-3 space-y-2">
          {DAY_ORDER.map((d) => {
            const t = plan.week[d];
            return (
              <li
                key={d}
                className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-bold">{DAY_NAMES[d]}</span>
                <select
                  value={t ?? ""}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      runPlan: {
                        ...s.runPlan,
                        week: {
                          ...s.runPlan.week,
                          [d]: e.target.value ? (e.target.value as RunType) : null,
                        },
                      },
                    }))
                  }
                  className="rounded-xl border border-input bg-card px-3 py-2 text-sm font-bold"
                >
                  <option value="">Ingen løping</option>
                  {TYPES.map((tt) => (
                    <option key={tt} value={tt}>
                      {RUN_TYPE_NAMES[tt]}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        {TYPES.map((t) => {
          const rx = nextRunPrescription(t, plan, state.runLogs);
          const hist = runHistory(state.runLogs, t);
          const stag = isRunStagnating(state.runLogs, t);
          return (
            <div key={t} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <button
                onClick={() => setOpen(open === t ? ("rolig" as RunType) : t)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-lg font-bold">{RUN_TYPE_NAMES[t]}</span>
                <span className="text-xs font-bold text-muted-foreground">
                  {hist.length} økter
                </span>
              </button>
              <p className="mt-2 text-sm leading-relaxed">{rx.description}</p>
              {stag && (
                <p className="mt-2 rounded-2xl bg-warning/20 px-3 py-2 text-xs font-bold text-warning-foreground">
                  Står stille de siste øktene – vurder ekstra hvile eller et lite hopp i belastning.
                </p>
              )}
              {open === t && hist.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {hist.slice(0, 10).map((l) => (
                    <li key={l.id} className="flex justify-between border-b border-border py-1.5">
                      <span>{formatDate(l.date)}</span>
                      <span className="font-bold">
                        {l.distanceKm} km · {formatClock(l.durationSec)}
                      </span>
                      <span className="font-bold text-primary">
                        {formatPace(l.avgPaceSecPerKm)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      {langtur.length > 1 && (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-bold">Langtur – distanse (km)</h2>
          <Spark values={langtur.map((l) => l.distanceKm)} />
          <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatDate(langtur[0]!.date)}</span>
            <span>{formatDate(langtur[langtur.length - 1]!.date)}</span>
          </p>
        </section>
      )}

      {terskel.length > 1 && (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-bold">Terskel – varighet (min)</h2>
          <Spark values={terskel.map((l) => l.durationSec / 60)} />
          <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatDate(terskel[0]!.date)}</span>
            <span>{formatDate(terskel[terskel.length - 1]!.date)}</span>
          </p>
        </section>
      )}

      {state.runLogs.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Ingen løpeturer logget ennå – logg dagens tur fra hjemskjermen ({formatDate(todayISO())}).
        </p>
      )}
    </div>
  );
}
