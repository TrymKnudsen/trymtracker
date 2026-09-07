import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { setState, useAppState } from "@/lib/store";
import { askCoach } from "@/lib/coach.functions";
import { buildCoachContext } from "@/lib/coachContext";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI-coach – spør om treningen din" },
      {
        name: "description",
        content:
          "Chat med en AI-coach som kjenner vektloggen, øktene og progresjonen din, og gir konkrete råd.",
      },
      { property: "og:title", content: "AI-coach – spør om treningen din" },
      {
        property: "og:description",
        content: "Få korte, konkrete råd basert på dine egne treningsdata.",
      },
    ],
  }),
  component: CoachPage,
});

function CoachPage() {
  const state = useAppState();
  const call = useServerFn(askCoach);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.coachMessages.length, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    const history = [
      ...state.coachMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: text },
    ];
    setState((s) => ({
      ...s,
      coachMessages: [...s.coachMessages, { role: "user", content: text, at: Date.now() }],
    }));
    try {
      const res = await call({
        data: { mode: "chat", context: buildCoachContext(state), messages: history },
      });
      setState((s) => ({
        ...s,
        coachMessages: [...s.coachMessages, { role: "assistant", content: res.text, at: Date.now() }],
      }));
    } catch {
      setState((s) => ({
        ...s,
        coachMessages: [
          ...s.coachMessages,
          { role: "assistant", content: "Noe gikk galt. Prøv igjen.", at: Date.now() },
        ],
      }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold">
          <Sparkles className="size-7 text-primary" /> Coach
        </h1>
        {state.coachMessages.length > 0 && (
          <button
            onClick={() => setState((s) => ({ ...s, coachMessages: [] }))}
            className="flex items-center gap-1 text-sm font-bold text-muted-foreground"
          >
            <Trash2 className="size-4" /> Tøm
          </button>
        )}
      </header>

      {state.coachMessages.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Spør om hva som helst – f.eks. «Hvorfor stagnerer benken min?» eller «Bør jeg spise mer
          denne uka?». Coachen ser vektloggen, øktene og progresjonen din.
        </p>
      )}

      <ul className="space-y-3">
        {state.coachMessages.map((m, i) => (
          <li
            key={i}
            className={
              m.role === "user"
                ? "gradient-hero ml-8 rounded-3xl rounded-br-lg px-4 py-3 text-primary-foreground"
                : "mr-8 rounded-3xl rounded-bl-lg border border-border bg-card px-4 py-3"
            }
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
          </li>
        ))}
        {busy && (
          <li className="mr-8 rounded-3xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Coachen tenker …
          </li>
        )}
      </ul>
      <div ref={endRef} />

      <div className="sticky bottom-20 flex gap-2 rounded-3xl border border-border bg-card p-2 shadow-soft">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Spør coachen …"
          className="tap-target w-full rounded-2xl bg-background px-4 text-base outline-none"
        />
        <button
          onClick={send}
          disabled={busy}
          className="tap-target gradient-hero shadow-pop press flex items-center rounded-2xl px-5 font-bold text-primary-foreground active:scale-95 disabled:opacity-60"
        >
          <Send className="size-5" />
        </button>
      </div>
    </div>
  );
}
