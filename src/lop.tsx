import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useAppState } from "@/lib/store";
import { DAY_NAMES, DAY_ORDER, type RunType } from "@/lib/types";
import { formatPace, nextRunPrescription, runHistory, RUN_TYPE_NAMES } from "@/lib/running";
import { formatDate } from "@/lib/helpers";

export const Route = createFileRoute("/lop")({
  head: () => ({
    meta: [
      { title: "Løping – Treningslogg" },
      {
        name: "description",
        content: "Ukeplan for løping, historikk og progresjon mot halvmaratonmålet.",
      },
    ],
  }),
  component: RunPage,
});

const RUN_TYPES: RunType[] = ["rolig", "intervall", "terskel", "langtur"];

function RunPage() {
  const state = useAppState();

  return (
    <div className="space-y-5">
      <Link to="/" className="flex items-center gap-1 font-bold text-primary">
        <ChevronLeft className="size-5" /> Hjem
      </Link>

      <header className="gradient-hero shadow-pop rounded-3xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-extrabold">Løpeplan</h1>
        <p className="opacity-90">
          Mål: {state.runPlan.goalDistanceKm} km i {formatPace(state.runPlan.goalPaceSecPerKm)} (sub
          1:30 halvmaraton)
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-2 font-bold">Ukeplan</h2>
        <ul className="space-y-2">
          {DAY_ORDER.map((day) => {
            const type = state.runPlan.week[day];
            return (
              <li
                key={day}
                className="flex items-center justify-between rounded-2xl border border-border bg-background p-3"
              >
                <span className="text-sm font-bold">{DAY_NAMES[day]}</span>
                <span className="text-sm text-muted-foreground">
                  {type ? RUN_TYPE_NAMES[type] : "Ingen løping"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {RUN_TYPES.map((type) => {
        const hist = runHistory(state.runLogs, type);
        if (!hist.length) return null;
        const next = nextRunPrescription(type, state.runPlan, state.runLogs);
        const vals = hist
          .slice(0, 14)
          .reverse()
          .map((r) => (type === "langtur" ? r.distanceKm : r.avgPaceSecPerKm));
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const span = Math.max(0.1, max - min);
        const pts = vals
          .map((v, i) => {
            const x = (i / Math.max(1, vals.length - 1)) * 100;
            const norm = type === "langtur" ? (v - min) / span : 1 - (v - min) / span;
            return `${x},${100 - norm * 100}`;
          })
          .join(" ");

        return (
          <section key={type} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-bold">{RUN_TYPE_NAMES[type]}</h2>
            <p className="mt-1 text-sm text-primary">Neste: {next.description}</p>

            {vals.length > 1 && (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-20 w-full">
                <polyline
                  points={pts}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}

            <ul className="mt-3 space-y-1 text-sm">
              {hist.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between border-b border-border py-1.5">
                  <span>{formatDate(r.date)}</span>
                  <span className="font-bold">
                    {r.distanceKm} km · {formatPace(r.avgPaceSecPerKm)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
