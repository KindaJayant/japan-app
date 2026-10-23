import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { analyze, analyzeText } from "@/lib/diet/analyze";
import { readLabel } from "@/lib/diet/scan";
import { ApiError } from "@google/genai";
import { AllModelsBusyError } from "@/lib/llm/gemini";
import { PROVIDER } from "@/lib/llm/provider";
import { clientId, rateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

const Body = z.union([
  z.object({
    image: z.string().min(100).max(8_000_000), // ~6 MB photo; the client downsizes to ~1568px first
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  }),
  z.object({ text: z.string().min(1).max(5000) }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Send {image, mediaType} or {text}" }, { status: 400 });

  if ("text" in parsed.data) return Response.json(analyzeText(parsed.data.text));

  const limited = rateLimit(`scan:${clientId(req)}`, 15, 60_000);
  if (!limited.ok) return Response.json({ error: `Too many scans. Try again in ${limited.retryAfter}s, or paste the ingredients.` }, { status: 429 });

  const started = Date.now();
  try {
    const { model, cached, ...reading } = await readLabel(parsed.data.image, parsed.data.mediaType);
    return Response.json({ ...analyze(reading), ms: Date.now() - started, model, cached });
  } catch (err) {
    console.error("scan failed", err);
    const status = err instanceof Anthropic.APIError || err instanceof ApiError ? (err.status ?? 502) : 503;
    const message =
      PROVIDER === "none"
        ? "Label reading isn't connected: add GEMINI_API_KEY to .env.local."
        : err instanceof AllModelsBusyError
          ? "The free AI models are busy. Try again in a moment, or paste the ingredients."
          : "Couldn't read the label right now. Use the chef card or paste the ingredients.";
    return Response.json({ error: message }, { status });
  }
}
