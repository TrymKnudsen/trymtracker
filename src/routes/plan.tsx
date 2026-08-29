import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Settings2, Trash2 } from "lucide-react";
import { setState, useAppState } from "@/lib/store";
import { DAY_NAMES, DAY_ORDER, type DayKey, type Exercise } from "@/lib/types";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Rediger ukeplan – Treningslogg" },
      {
        name: "description",
        content:
          "Rediger 6-dagers ukeplanen: legg til øvelser, endre rekkefølge, sett, reps, hvile og vektøkning.",
      },
      { property: "og:title", content: "Rediger ukeplan – Treningslogg" },
      { property: "og:description", content: "Full kontroll over øvelser, sett, reps og hvile." },
    ],
  }),
  component: PlanPage,
});

function ExerciseEditor({ ex }: { ex: Exercise }) {
  function patch(p: Partial<Exercise>) {
    setState((s) => ({ ...s, exercises: { ...s.exercises, [ex.id]: { ...s.exercises[ex.id]!, ...p } } }));
  }
  const fields: { label: string; key: keyof Exercise; step?: number }[] = [
    { label: "Sett", key: "sets" },
    { label: "Reps fra", key: "repMin" },
    { label: "Reps til", key: "repMax" },
    { label: "Hvile (s)", key: "rest" },
    { label: "Vektøkning (kg)", key: "increment", step: 0.5 },
    { label: "Nåværende vekt", key: "currentWeight", step: 0.5 },
  ];
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3">
      <input
        value={ex.name}
        onChange={(e) => patch({ name: e.target.value })}
        className="col-span-3 h-11 rounded-xl border border-input bg-card px-3 font-bold outline-none focus:border-primary"
      />
      {fields.map((f) => (
        <label key={f.key} className="text-[11px] font-bold text-muted-foreground">
          {f.label}
          <input
            inputMode="decimal"
            step={f.step ?? 1}
            value={(ex[f.key] as number | null) ?? ""}
            onChange={(e) =>
              patch({ [f.key]: e.target.value === "" ? null : Number(e.target.value.replace(",", ".")) } as Partial<Exercise>)
            }
            className="mt-1 h-11 w-full rounded-xl border border-input bg-card px-2 text-center text-sm font-bold text-foreground outline-none focus:border-primary"
          />
        </label>
      ))}
    </div>
  );
}

function DayCard({ day }: { day: DayKey }) {
  const state = useAppState();
  const plan = state.days.find((d) => d.day === day)!;
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function updateDay(p: Partial<typeof plan>) {
    setState((s) => ({ ...s, days: s.days.map((d) => (d.day === day ? { ...d, ...p } : d)) }));
  }

  function move(i: number, dir: -1 | 1) {
    const ids = [...plan.exerciseIds];
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    updateDay({ exerciseIds: ids });
  }

  function addExisting(id: string) {
    updateDay({ exerciseIds: [...plan.exerciseIds, id] });
    setAdding(false);
  }

  function addNew() {
    const id = `ex-${Date.now()}`;
    setState((s) => ({
      ...s,
      exercises: {
        ...s.exercises,
        [id]: {
          id,
          name: "Ny øvelse",
          muscle: "Annet",
          sets: 3,
          repMin: 8,
          repMax: 12,
          rest: 90,
          increment: 2.5,
          currentWeight: null,
        },
      },
      days: s.days.map((d) => (d.day === day ? { ...d, exerciseIds: [...d.exerciseIds, id] } : d)),
    }));
    setAdding(false);
    setOpen(id);
  }

  const library = Object.values(state.exercises)
    .filter((e) => !plan.exerciseIds.includes(e.id))
    .sort((a, b) => a.name.localeCompare(b.name, "no"));

  return (
    <section className="rounded-3xl border border-border bg-card p-4">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {DAY_NAMES[day]}
      </p>
      <div className="mt-1 flex gap-2">
        <input
          value={plan.title}
          onChange={(e) => updateDay({ title: e.target.value })}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-lg font-extrabold outline-none focus:border-primary"
        />
        <button
          onClick={() => updateDay({ rest: !plan.rest })}
          className={`h-11 shrink-0 rounded-xl px-3 text-xs font-bold ${
            plan.rest ? "gradient-sun text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Hviledag
        </button>
      </div>
      <input
        value={plan.subtitle}
        onChange={(e) => updateDay({ subtitle: e.target.value })}
        className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
      />

      <ul className="mt-3 space-y-2">
        {plan.exerciseIds.map((id, i) => {
          const ex = state.exercises[id];
          if (!ex) return null;
          return (
            <li key={`${id}-${i}`} className="rounded-2xl border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.sets} × {ex.repMin}
                    {ex.repMax !== ex.repMin ? `–${ex.repMax}` : ""} · {ex.rest}s · +{ex.increment} kg
                  </p>
                </div>
                <button onClick={() => move(i, -1)} className="size-10 rounded-xl bg-secondary" aria-label="Opp">
                  <ArrowUp className="mx-auto size-4" />
                </button>
                <button onClick={() => move(i, 1)} className="size-10 rounded-xl bg-secondary" aria-label="Ned">
                  <ArrowDown className="mx-auto size-4" />
                </button>
                <button
                  onClick={() => setOpen(open === id ? null : id)}
                  className="size-10 rounded-xl bg-secondary"
                  aria-label="Rediger"
                >
                  <Settings2 className="mx-auto size-4" />
                </button>
                <button
                  onClick={() =>
                    updateDay({ exerciseIds: plan.exerciseIds.filter((_, idx) => idx !== i) })
                  }
                  className="size-10 rounded-xl bg-destructive/10 text-destructive"
                  aria-label="Fjern"
                >
                  <Trash2 className="mx-auto size-4" />
                </button>
              </div>
              {open === id && <ExerciseEditor ex={ex} />}
            </li>
          );
        })}
      </ul>

      {adding ? (
        <div className="mt-3 rounded-2xl border border-border p-3">
          <button
            onClick={addNew}
            className="gradient-hero tap-target mb-2 w-full rounded-xl font-bold text-primary-foreground"
          >
            Lag helt ny øvelse
          </button>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {library.map((e) => (
              <button
                key={e.id}
                onClick={() => addExisting(e.id)}
                className="w-full rounded-xl bg-secondary px-3 py-2.5 text-left text-sm font-semibold text-secondary-foreground"
              >
                {e.name}
              </button>
            ))}
          </div>
          <button onClick={() => setAdding(false)} className="mt-2 w-full py-2 text-sm font-bold">
            Avbryt
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="tap-target mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-primary/50 text-sm font-bold text-primary"
        >
          <Plus className="size-4" /> Legg til øvelse
        </button>
      )}
    </section>
  );
}

function PlanPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Ukeplan</h1>
      <p className="text-sm text-muted-foreground">
        Endre øvelser, rekkefølge, sett, reps, hvile og vektøkning. Alt lagres automatisk.
      </p>
      {DAY_ORDER.map((d) => (
        <DayCard key={d} day={d} />
      ))}
    </div>
  );
}
