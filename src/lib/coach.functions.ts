import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  mode: z.enum(["briefing", "chat"]),
  context: z.string().max(40000),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .max(40)
    .optional(),
});

const SYSTEM =
  "Du er en personlig trenings- og helsecoach. Brukeren trener 6 dager i uken (Push/Pull/Legs-variant). " +
  "Gi konkrete, korte råd basert på dataene under – ikke generiske treningstips. Vær ærlig hvis noe stagnerer " +
  "eller ser ut som overtrening. Skriv på norsk, kort og direkte, ingen unødvendig fyllstoff. " +
  "Merk: søvn/HRV måles ikke automatisk – bruk brukerens egenrapportering som proxy for restitusjon.";

const BRIEFING_INSTRUCTION =
  "Gi en morgenbriefing på maks 120 ord: hvordan ligger vekta an mot målet, hvordan ser restitusjonen ut i dag, " +
  "hva bør fokus være på dagens økt, og nevn eventuelle øvelser som stagnerer. Bruk korte punkter.";

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { text: "AI-coachen er ikke tilgjengelig akkurat nå." };

    const messages: { role: string; content: string }[] = [
      { role: "system", content: `${SYSTEM}\n\n# Brukerens data\n${data.context}` },
    ];
    if (data.mode === "briefing") {
      messages.push({ role: "user", content: BRIEFING_INSTRUCTION });
    } else {
      for (const m of data.messages ?? []) messages.push({ role: m.role, content: m.content });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!res.ok) {
      if (res.status === 429) return { text: "For mange forespørsler – prøv igjen om litt." };
      if (res.status === 402) return { text: "AI-kvoten er brukt opp." };
      return { text: "Klarte ikke å hente svar fra coachen akkurat nå." };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { text: json.choices?.[0]?.message?.content ?? "Tomt svar fra coachen." };
  });
