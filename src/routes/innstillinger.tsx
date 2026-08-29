import { createFileRoute } from "@tanstack/react-router";
import { resetState, setState, useAppState } from "@/lib/store";
import { formatDate, sortedWeights } from "@/lib/helpers";

export const Route = createFileRoute("/innstillinger")({
  head: () => ({
    meta: [
      { title: "Innstillinger – Treningslogg" },
      {
        name: "description",
        content: "Sett mål-tempo for vektendring, bulk eller cut, og administrer lagrede data.",
      },
      { property: "og:title", content: "Innstillinger – Treningslogg" },
      { property: "og:description", content: "Mål-tempo, modus og datahåndtering." },
    ],
  }),
  component: SettingsPage,
});

const MODES = [
  { key: "bulk", label: "Bulk", target: 0.25 },
  { key: "vedlikehold", label: "Vedlikehold", target: 0 },
  { key: "cut", label: "Cut", target: -0.5 },
] as const;

function SettingsPage() {
  const state = useAppState();
  const s = state.settings;

  function patch(p: Partial<typeof s>) {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...p } }));
  }

  const weights = sortedWeights(state.weights).slice(-10).reverse();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Innstillinger</h1>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Modus</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => patch({ mode: m.key, targetPerWeek: m.target })}
              className={`tap-target rounded-2xl text-sm font-bold ${
                s.mode === m.key
                  ? "gradient-hero text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-bold">
          Mål-tempo (kg per uke)
          <input
            inputMode="decimal"
            value={s.targetPerWeek}
            onChange={(e) => patch({ targetPerWeek: Number(e.target.value.replace(",", ".")) || 0 })}
            className="tap-target mt-1 w-full rounded-2xl border border-input bg-background px-4 text-lg font-extrabold outline-none focus:border-primary"
          />
        </label>
        <label className="mt-3 block text-sm font-bold">
          Toleranse (± kg per uke)
          <input
            inputMode="decimal"
            value={s.toleranse}
            onChange={(e) => patch({ toleranse: Number(e.target.value.replace(",", ".")) || 0.1 })}
            className="tap-target mt-1 w-full rounded-2xl border border-input bg-background px-4 text-lg font-extrabold outline-none focus:border-primary"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Standard for bulk er +0,20–0,30 kg per uke. Negativt tall gir cut-modus.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Siste vektlogger</h2>
        {weights.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Ingen vekter logget ennå.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {weights.map((w) => (
              <li key={w.date} className="flex justify-between border-b border-border py-1.5">
                <span>{formatDate(w.date)}</span>
                <span className="font-bold">{w.weight} kg</span>
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      weights: prev.weights.filter((x) => x.date !== w.date),
                    }))
                  }
                  className="text-xs font-bold text-destructive"
                >
                  Slett
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Alt lagres lokalt på telefonen din – ingen konto, ingen sky.
        </p>
        <button
          onClick={() => {
            if (confirm("Nullstille alle data og gå tilbake til standardplanen?")) resetState();
          }}
          className="tap-target mt-3 w-full rounded-2xl bg-destructive/10 font-bold text-destructive"
        >
          Nullstill alle data
        </button>
      </section>
    </div>
  );
}
