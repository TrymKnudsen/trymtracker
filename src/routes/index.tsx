import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Check, Flame, HeartPulse, Play, Scale, Sparkles, TrendingUp } from "lucide-react";
import { askCoach } from "@/lib/coach.functions";
import { buildCoachContext } from "@/lib/coachContext";
import { getState, setState, useAppState } from "@/lib/store";
import {
  formatDate,
  movingAverage,
  sortedWeights,
  todayISO,
  todayKey,
  weightStatus,
} from "@/lib/helpers";
import { DAY_NAMES } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Treningslogg – daglig vekt og dagens økt" },
      {
        name: "description",
        content:
          "Personlig treningsapp: logg morgenvekt, følg 7-dagers snitt og kjør dagens økt med automatisk progresjon.",
      },
      { property: "og:title", content: "Treningslogg – daglig vekt og dagens økt" },
      {
        property: "og:description",
        content: "Logg vekt, kjør økta og få vektforslag automatisk. Alt lagres på telefonen.",
      },
    ],
  }),
  component: Home,
});

const toneClass: Record<string, string> = {
  good: "bg-success/15 text-success border-success/30",
  fast: "bg-coral/15 text-coral border-coral/30",
  slow: "bg-warning/20 text-warning-foreground border-warning/40",
  unknown: "bg-muted text-muted-foreground border-border",
};

function WeightCard() {
  const state = useAppState();
  const today = todayISO();
  const existing = state.weights.find((w) => w.date === today);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const status = weightStatus(state);

  function save() {
    const n = parseFloat(value.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    setState((s) => ({
      ...s,
      weights: [...s.weights.filter((w) => w.date !== today), { date: today, weight: n }],
    }));
    setValue("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  const avg = movingAverage(state.weights).slice(-14);
  const raw = sortedWeights(state.weights).slice(-14);
  const all = [...avg.map((a) => a.avg), ...raw.map((r) => r.weight)];
  const min = all.length ? Math.min(...all) - 0.4 : 0;
  const max = all.length ? Math.max(...all) + 0.4 : 1;
  const span = Math.max(0.1, max - min);
  const pts = (vals: number[]) =>
    vals
      .map((v, i) => `${(i / Math.max(1, vals.length - 1)) * 100},${100 - ((v - min) / span) * 100}`)
      .join(" ");

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Scale className="size-5 text-primary" /> Morgenvekt
      </h2>
      <div className="mt-3 flex gap-2">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={existing ? `${existing.weight} kg lagret i dag` : "kg i dag"}
          className="tap-target w-full rounded-2xl border border-input bg-background px-4 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <button
          onClick={save}
          className="tap-target gradient-hero shadow-pop press flex items-center gap-2 rounded-2xl px-5 text-base font-bold text-primary-foreground active:scale-95"
        >
          {saved ? <Check className="size-5 animate-pop-in" /> : "Lagre"}
        </button>
      </div>

      <div className={`mt-4 rounded-2xl border px-4 py-3 ${toneClass[status.tone]}`}>
        <p className="text-base font-bold">{status.label}</p>
        <p className="text-xs opacity-90">{status.hint}</p>
        {status.thisWeek != null && status.lastWeek != null && (
          <p className="mt-2 text-xs font-medium opacity-90">
            Denne uka {status.thisWeek.toFixed(2)} kg · forrige uke {status.lastWeek.toFixed(2)} kg ·
            endring {status.delta! >= 0 ? "+" : ""}
            {status.delta!.toFixed(2)} kg
          </p>
        )}
      </div>

      {raw.length > 1 && (
        <div className="mt-4">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-28 w-full">
            <polyline
              points={pts(raw.map((r) => r.weight))}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={pts(avg.map((a) => a.avg))}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatDate(raw[0]!.date)}</span>
            <span className="font-semibold text-primary">7-dagers snitt</span>
            <span>{formatDate(raw[raw.length - 1]!.date)}</span>
          </p>
        </div>
      )}
    </section>
  );
}

function Scale5({
  value,
  onChange,
  labels,
}: {
  value: number;
  onChange: (n: number) => void;
  labels: [string, string];
}) {
  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`tap-target press flex-1 rounded-2xl border text-base font-bold ${
              value === n
                ? "gradient-hero border-transparent text-primary-foreground"
                : "border-border bg-background"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </p>
    </div>
  );
}

function CheckinCard() {
  const state = useAppState();
  const today = todayISO();
  const existing = state.checkins.find((c) => c.date === today);
  const [sleep, setSleep] = useState("");
  const [recovery, setRecovery] = useState(0);
  const [soreness, setSoreness] = useState(0);

  if (existing) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <HeartPulse className="size-5 text-primary" /> Dagens egenrapportering
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Søvnscore {existing.sleepScore}/100 · restitusjon {existing.recovery}/5 · ømhet{" "}
          {existing.soreness}/5
        </p>
      </section>
    );
  }

  function save() {
    const n = parseInt(sleep, 10);
    if (!Number.isFinite(n) || n < 0 || n > 100 || !recovery || !soreness) return;
    setState((s) => ({
      ...s,
      checkins: [
        ...s.checkins.filter((c) => c.date !== today),
        { date: today, sleepScore: n, recovery, soreness },
      ],
    }));
  }

  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <HeartPulse className="size-5 text-primary" /> Hvordan er formen i dag?
      </h2>
      <div>
        <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">Søvnscore (0–100)</p>
        <input
          inputMode="numeric"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          placeholder="Tall fra klokka"
          className="tap-target w-full rounded-2xl border border-input bg-background px-4 text-lg font-semibold outline-none focus:border-primary"
        />
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">Restitusjon</p>
        <Scale5 value={recovery} onChange={setRecovery} labels={["Utladet", "Toppform"]} />
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">Ømhet</p>
        <Scale5 value={soreness} onChange={setSoreness} labels={["Ingen", "Veldig øm"]} />
      </div>
      <button
        onClick={save}
        className="tap-target gradient-hero shadow-pop press w-full rounded-2xl text-base font-bold text-primary-foreground active:scale-95"
      >
        Lagre dagens sjekk
      </button>
    </section>
  );
}

function BriefingCard() {
  const state = useAppState();
  const call = useServerFn(askCoach);
  const today = todayISO();
  const briefing = state.dailyBriefings.find((b) => b.date === today);
  const hasWeight = state.weights.some((w) => w.date === today);
  const hasCheckin = state.checkins.some((c) => c.date === today);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (briefing || !hasWeight || !hasCheckin || loading) return;
    let cancelled = false;
    setLoading(true);
    call({ data: { mode: "briefing", context: buildCoachContext(getState()) } })
      .then((res) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          dailyBriefings: [
            ...s.dailyBriefings.filter((b) => b.date !== today),
            { date: today, text: res.text },
          ],
        }));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefing, hasWeight, hasCheckin]);

  if (!hasWeight || !hasCheckin) return null;

  return (
    <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Sparkles className="size-5 text-primary" /> Morgenbriefing
      </h2>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
        {briefing?.text ?? (loading ? "Coachen leser dataene dine …" : "Ingen briefing i dag.")}
      </p>
      <Link to="/coach" className="mt-3 inline-block text-sm font-bold text-primary">
        Spør coachen om noe →
      </Link>
    </section>
  );
}

function Home() {
  const state = useAppState();
  const navigate = useNavigate();
  const key = todayKey();
  const day = state.days.find((d) => d.day === key)!;
  const doneToday = state.sessions.some((s) => s.date === todayISO());

  return (
    <div className="space-y-5">
      <header className="gradient-hero shadow-pop rounded-3xl p-6 text-primary-foreground">
        <p className="text-sm font-semibold opacity-90">
          {DAY_NAMES[key]} · {formatDate(todayISO())}
        </p>
        <h1 className="mt-1 text-3xl leading-tight font-extrabold">
          {day.rest ? "Hviledag" : day.title}
        </h1>
        <p className="text-sm opacity-90">{day.subtitle}</p>
        <button
          onClick={() => navigate({ to: "/okt/$day", params: { day: key } })}
          className="press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-4 text-lg font-extrabold text-primary active:scale-95"
        >
          {day.rest ? <Flame className="size-5" /> : <Play className="size-5" />}
          {day.rest ? "Logg fri aktivitet" : "Start dagens økt"}
        </button>
        {doneToday && (
          <p className="mt-2 text-center text-xs font-semibold opacity-90">
            Du har allerede loggført en økt i dag 💪
          </p>
        )}
      </header>

      <WeightCard />

      <CheckinCard />

      <BriefingCard />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CalendarDays className="size-5 text-primary" /> Uka
          </h2>
          <Link to="/plan" className="text-sm font-bold text-primary">
            Rediger plan
          </Link>
        </div>
        <ul className="space-y-2">
          {state.days.map((d) => (
            <li key={d.day}>
              <Link
                to="/okt/$day"
                params={{ day: d.day }}
                className="press flex items-center justify-between rounded-2xl border border-border bg-card p-4 active:scale-[0.99]"
              >
                <div>
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    {DAY_NAMES[d.day]}
                  </p>
                  <p className="text-base font-bold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.rest ? d.subtitle : `${d.exerciseIds.length} øvelser · ${d.subtitle}`}
                  </p>
                </div>
                <span
                  className={`rounded-xl px-3 py-2 text-xs font-bold ${
                    d.day === key
                      ? "gradient-sun text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {d.day === key ? "I dag" : "Åpne"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link
        to="/historikk"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-base font-bold text-primary"
      >
        <TrendingUp className="size-5" /> Se utvikling per øvelse
      </Link>

      <Link
        to="/coach"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-base font-bold text-primary"
      >
        <Sparkles className="size-5" /> Chat med AI-coachen
      </Link>
    </div>
  );
}
