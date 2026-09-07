import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Minus, Plus, SkipForward, Trophy } from "lucide-react";
import { setState, useAppState } from "@/lib/store";
import {
  applyProgression,
  formatDuration,
  personalRecords,
  sessionVolume,
  todayISO,
} from "@/lib/helpers";
import { DAY_NAMES, type DayKey, type DraftSession, type WorkoutSession } from "@/lib/types";
import { Confetti } from "@/components/Confetti";

export const Route = createFileRoute("/okt/$day")({
  head: () => ({
    meta: [
      { title: "Dagens økt – Treningslogg" },
      {
        name: "description",
        content: "Kjør økta sett for sett med hviletimer, vektforslag og fremdrift.",
      },
      { property: "og:title", content: "Dagens økt – Treningslogg" },
      { property: "og:description", content: "Logg sett, start hviletimer og fullfør økta." },
    ],
  }),
  component: WorkoutPage,
});

interface SetDraft {
  weight: string;
  reps: string;
  done: boolean;
}

function beep() {
  if (typeof window === "undefined") return;
  navigator.vibrate?.([200, 80, 200]);
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    /* lyd ikke tilgjengelig */
  }
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const fired = useRef(false);
  useEffect(() => {
    setLeft(seconds);
    fired.current = false;
  }, [seconds]);
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (left === 0 && !fired.current) {
      fired.current = true;
      beep();
    }
  }, [left]);

  const pct = seconds ? ((seconds - left) / seconds) * 100 : 100;
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md px-4">
      <div
        className={`shadow-pop rounded-2xl p-4 text-primary-foreground ${
          left === 0 ? "bg-success" : "gradient-hero"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">{left === 0 ? "Hvile ferdig – kjør!" : "Hviler"}</p>
          <p className="text-2xl font-extrabold tabular-nums">{formatDuration(left)}</p>
          <button onClick={onDone} className="rounded-xl bg-card/25 px-3 py-2 text-sm font-bold">
            {left === 0 ? "Ok" : "Hopp over"}
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card/30">
          <div className="h-full bg-card transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function WorkoutPage() {
  const { day } = Route.useParams();
  const state = useAppState();
  const navigate = useNavigate();
  const dayKey = day as DayKey;
  const plan = state.days.find((d) => d.day === dayKey);
  const planTitle = plan?.title ?? "";

  const existingDraft =
    state.draftSession &&
    state.draftSession.day === dayKey &&
    state.draftSession.date === todayISO()
      ? state.draftSession
      : null;
  const otherDraft =
    state.draftSession && !existingDraft && state.draftSession.date === todayISO()
      ? state.draftSession
      : null;

  const started = useRef(existingDraft?.startedAt ?? Date.now());
  const [rest, setRest] = useState<number | null>(null);
  const [current, setCurrent] = useState(existingDraft?.current ?? 0);
  const [skipped, setSkipped] = useState<string[]>(existingDraft?.skipped ?? []);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [activity, setActivity] = useState(existingDraft?.activity ?? "");
  const [discardBanner, setDiscardBanner] = useState(Boolean(otherDraft));

  const exercises = useMemo(
    () =>
      (plan?.exerciseIds ?? [])
        .map((id) => state.exercises[id])
        .filter((e): e is NonNullable<typeof e> => Boolean(e)),
    [plan, state.exercises],
  );

  const [drafts, setDrafts] = useState<Record<string, SetDraft[]>>(existingDraft?.drafts ?? {});
  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const ex of exercises) {
        if (!next[ex.id]) {
          next[ex.id] = Array.from({ length: ex.sets }, () => ({
            weight: ex.currentWeight != null ? String(ex.currentWeight) : "",
            reps: String(ex.repMax),
            done: false,
          }));
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  function persistDraft(patch: Partial<Omit<DraftSession, "day" | "date" | "startedAt">>) {
    setState((s) => ({
      ...s,
      draftSession: {
        day: dayKey,
        date: todayISO(),
        startedAt: started.current,
        current: patch.current ?? current,
        skipped: patch.skipped ?? skipped,
        activity: patch.activity ?? activity,
        drafts: patch.drafts ?? drafts,
      },
    }));
  }

  function discardDraft() {
    setState((s) => ({ ...s, draftSession: null }));
    setDiscardBanner(false);
    setCurrent(0);
    setSkipped([]);
    setActivity("");
    setDrafts({});
    started.current = Date.now();
  }

  if (!plan) return <p className="p-6">Fant ikke økta.</p>;

  if (discardBanner && otherDraft) {
    return (
      <div className="space-y-4">
        <Link to="/" className="flex items-center gap-1 font-bold text-primary">
          <ChevronLeft className="size-5" /> Hjem
        </Link>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <p className="font-bold">Du har en påbegynt økt for {DAY_NAMES[otherDraft.day]}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vil du fortsette den økta, eller forkaste den og starte {plan.title} på nytt?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate({ to: "/okt/$day", params: { day: otherDraft.day } })}
              className="tap-target flex-1 rounded-2xl bg-secondary font-bold text-secondary-foreground"
            >
              Fortsett {DAY_NAMES[otherDraft.day]}
            </button>
            <button
              onClick={discardDraft}
              className="tap-target gradient-hero flex-1 rounded-2xl font-extrabold text-primary-foreground"
            >
              Forkast, start {plan.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const active = exercises[current]!;

  function updatedDrafts(exId: string, i: number, patch: Partial<SetDraft>) {
    return {
      ...drafts,
      [exId]: (drafts[exId] ?? []).map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    };
  }

  function update(exId: string, i: number, patch: Partial<SetDraft>) {
    setDrafts(updatedDrafts(exId, i, patch));
  }

  function completeSet(exId: string, i: number, restSec: number) {
    const next = updatedDrafts(exId, i, { done: true });
    setDrafts(next);
    persistDraft({ drafts: next });
    setRest(restSec);
  }

  function finish() {
    const entries = exercises
      .filter((ex) => !skipped.includes(ex.id))
      .map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: (drafts[ex.id] ?? [])
          .filter((s) => s.done)
          .map((s) => ({
            weight: parseFloat(s.weight.replace(",", ".")) || 0,
            reps: parseInt(s.reps, 10) || 0,
            at: Date.now(),
          })),
      }))
      .filter((e) => e.sets.length);

    const session: WorkoutSession = {
      id: `${Date.now()}`,
      date: todayISO(),
      day: dayKey,
      title: planTitle,
      durationSec: Math.round((Date.now() - started.current) / 1000),
      entries,
      ...(activity ? { freeActivity: activity } : {}),
    };
    setState((s) =>
      applyProgression({ ...s, sessions: [...s.sessions, session], draftSession: null }, session),
    );
    setSummary(session);
  }

  if (summary) {
    const prs = personalRecords(state, summary);
    return (
      <div className="space-y-4">
        <Confetti />
        <div className="gradient-hero shadow-pop animate-pop-in rounded-3xl p-6 text-center text-primary-foreground">
          <Check className="mx-auto size-14" />
          <h1 className="mt-2 text-3xl font-extrabold">Økt fullført!</h1>
          <p className="opacity-90">{summary.title}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total tid</p>
            <p className="text-2xl font-extrabold">{formatDuration(summary.durationSec)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Totalt volum</p>
            <p className="text-2xl font-extrabold">{Math.round(sessionVolume(summary))} kg</p>
          </div>
        </div>
        {prs.length > 0 && (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
            <p className="flex items-center gap-2 font-bold text-success">
              <Trophy className="size-5" /> Nye personlige rekorder
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {prs.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 font-bold">Neste gang foreslås</p>
          <ul className="space-y-1 text-sm">
            {summary.entries.map((e) => (
              <li key={e.exerciseId} className="flex justify-between">
                <span>{e.name}</span>
                <span className="font-bold text-primary">
                  {state.exercises[e.exerciseId]?.currentWeight ?? "–"} kg
                </span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => navigate({ to: "/" })}
          className="gradient-hero shadow-pop w-full rounded-2xl py-4 text-lg font-extrabold text-primary-foreground"
        >
          Ferdig
        </button>
      </div>
    );
  }

  if (plan.rest) {
    return (
      <div className="space-y-4">
        <Link to="/" className="flex items-center gap-1 font-bold text-primary">
          <ChevronLeft className="size-5" /> Hjem
        </Link>
        <div className="gradient-sun shadow-pop rounded-3xl p-6 text-primary-foreground">
          <h1 className="text-3xl font-extrabold">Hviledag</h1>
          <p className="opacity-90">Ingen strukturert styrkeøkt i dag. Lad batteriene.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-bold">Logg fri aktivitet</p>
          <input
            value={activity}
            onChange={(e) => {
              setActivity(e.target.value);
              persistDraft({ activity: e.target.value });
            }}
            placeholder="F.eks. padel 90 min"
            className="tap-target mt-2 w-full rounded-2xl border border-input bg-background px-4 outline-none focus:border-primary"
          />
          <button
            onClick={finish}
            className="gradient-hero mt-3 w-full rounded-2xl py-4 font-extrabold text-primary-foreground"
          >
            Lagre aktivitet
          </button>
        </div>
      </div>
    );
  }

  const setsDone = (drafts[active?.id ?? ""] ?? []).filter((s) => s.done).length;

  return (
    <div className="space-y-4 pb-40">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 font-bold text-primary">
          <ChevronLeft className="size-5" /> Avbryt
        </Link>
        <p className="text-sm font-bold text-muted-foreground">
          {DAY_NAMES[dayKey]} · {plan.title}
        </p>
      </div>

      <div className="flex gap-1.5">
        {exercises.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => setCurrent(i)}
            className={`h-2 flex-1 rounded-full ${
              i === current ? "bg-primary" : i < current ? "bg-accent" : "bg-muted"
            }`}
            aria-label={ex.name}
          />
        ))}
      </div>

      {active && (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Øvelse {current + 1} av {exercises.length}
          </p>
          <h1 className="text-2xl leading-tight font-extrabold">{active.name}</h1>
          <p className="text-sm text-muted-foreground">
            Mål: {active.sets} × {active.repMin}
            {active.repMax !== active.repMin ? `–${active.repMax}` : ""} reps · hvile {active.rest}s
            {active.note ? ` · ${active.note}` : ""}
          </p>
          <p className="mt-1 text-sm font-bold text-primary">
            Foreslått vekt:{" "}
            {active.currentWeight != null ? `${active.currentWeight} kg` : "sett selv"}
          </p>

          <ul className="mt-4 space-y-2">
            {(drafts[active.id] ?? []).map((s, i) => (
              <li
                key={i}
                className={`rounded-2xl border p-3 ${
                  s.done ? "border-success/40 bg-success/10" : "border-border bg-background"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs font-bold text-muted-foreground">
                    #{i + 1}
                  </span>
                  <div className="flex min-w-[68px] flex-1 items-center gap-1">
                    <input
                      inputMode="decimal"
                      value={s.weight}
                      onChange={(e) => update(active.id, i, { weight: e.target.value })}
                      placeholder="kg"
                      className="h-12 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-center text-base font-bold outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">kg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        update(active.id, i, {
                          reps: String(Math.max(0, (parseInt(s.reps, 10) || 0) - 1)),
                        })
                      }
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
                      aria-label="Færre reps"
                    >
                      <Minus className="size-4" />
                    </button>
                    <input
                      inputMode="numeric"
                      value={s.reps}
                      onChange={(e) => update(active.id, i, { reps: e.target.value })}
                      className="h-12 w-11 shrink-0 rounded-xl border border-input bg-card text-center text-base font-bold outline-none focus:border-primary"
                    />
                    <button
                      onClick={() =>
                        update(active.id, i, { reps: String((parseInt(s.reps, 10) || 0) + 1) })
                      }
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
                      aria-label="Flere reps"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => completeSet(active.id, i, active.rest)}
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                      s.done
                        ? "bg-success text-success-foreground"
                        : "gradient-hero text-primary-foreground"
                    }`}
                    aria-label="Fullfør sett"
                  >
                    <Check className={`size-6 ${s.done ? "animate-pop-in" : ""}`} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                const next = {
                  ...drafts,
                  [active.id]: [
                    ...(drafts[active.id] ?? []),
                    {
                      weight: drafts[active.id]?.at(-1)?.weight ?? "",
                      reps: String(active.repMax),
                      done: false,
                    },
                  ],
                };
                setDrafts(next);
                persistDraft({ drafts: next });
              }}
              className="tap-target flex-1 rounded-2xl border border-border bg-background text-sm font-bold"
            >
              + Ekstra sett
            </button>
            <button
              onClick={() => {
                const nextSkipped = [...skipped, active.id];
                const nextCurrent = Math.min(exercises.length - 1, current + 1);
                setSkipped(nextSkipped);
                setCurrent(nextCurrent);
                persistDraft({ skipped: nextSkipped, current: nextCurrent });
              }}
              className="tap-target flex flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-background text-sm font-bold"
            >
              <SkipForward className="size-4" /> Hopp over
            </button>
          </div>

          <p className="mt-3 text-center text-sm font-semibold text-muted-foreground">
            Sett {setsDone} av {(drafts[active.id] ?? []).length}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              disabled={current === 0}
              onClick={() => {
                const nextCurrent = current - 1;
                setCurrent(nextCurrent);
                persistDraft({ current: nextCurrent });
              }}
              className="tap-target flex-1 rounded-2xl bg-secondary font-bold text-secondary-foreground disabled:opacity-40"
            >
              Forrige
            </button>
            {current < exercises.length - 1 ? (
              <button
                onClick={() => {
                  const nextCurrent = current + 1;
                  setCurrent(nextCurrent);
                  persistDraft({ current: nextCurrent });
                }}
                className="tap-target gradient-hero flex-1 rounded-2xl font-extrabold text-primary-foreground"
              >
                Neste øvelse
              </button>
            ) : (
              <button
                onClick={finish}
                className="tap-target flex-1 rounded-2xl bg-success font-extrabold text-success-foreground"
              >
                Fullfør økt
              </button>
            )}
          </div>
        </section>
      )}

      {rest != null && <RestTimer seconds={rest} onDone={() => setRest(null)} />}
    </div>
  );
}
