import Anthropic from "@anthropic-ai/sdk";
import { ApiError } from "@google/genai";
import { z } from "zod";
import { cacheGet, cacheKey, cacheSet } from "@/lib/llm/cache";
import { AllModelsBusyError } from "@/lib/llm/gemini";
import { runGeminiAgent } from "@/lib/llm/geminiAgent";
import { runAnthropicAgent } from "@/lib/llm/anthropicAgent";
import { PROVIDER } from "@/lib/llm/provider";
import type { AgentEvent } from "@/lib/llm/types";
import { clientId, rateLimit } from "@/lib/rateLimit";

export const maxDuration = 300;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) }))
    .min(1)
    .max(30),
  /** Skip the rehearsal cache and ask the model again. */
  fresh: z.boolean().optional(),
});

function friendly(err: unknown): string {
  if (PROVIDER === "none") return "Saathi isn't connected yet: add GEMINI_API_KEY (or ANTHROPIC_API_KEY) to .env.local and restart.";
  if (err instanceof AllModelsBusyError) return "Every free Gemini model is busy right now. Try again in a minute; your last plan is saved.";
  if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return "The Gemini key was rejected. Check GEMINI_API_KEY.";
  if (err instanceof Anthropic.AuthenticationError) return "The Anthropic key was rejected. Check ANTHROPIC_API_KEY.";
  if (err instanceof Anthropic.RateLimitError) return "Saathi is busy. Try again in a few seconds.";
  return "Something went wrong. Try again.";
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  const { messages, fresh } = parsed.data;

  const id = clientId(req);
  const limited = [rateLimit(`agent:m:${id}`, 6, 60_000), rateLimit(`agent:d:${id}`, 60, 86_400_000)].find((r) => !r.ok);
  if (limited && !limited.ok) {
    return Response.json({ error: `Too many plans at once. Try again in ${limited.retryAfter}s.` }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }
  const key = cacheKey("agent-v1", PROVIDER, messages);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const log: AgentEvent[] = [];
      const send = (e: AgentEvent) => {
        if (e.type !== "status") log.push(e);
        controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      };

      try {
        const cached = fresh ? undefined : cacheGet<AgentEvent[]>(key);
        if (cached) {
          // Replay a previous identical run: zero quota, same experience (lightly paced).
          send({ type: "meta", provider: PROVIDER, cached: true });
          for (const e of cached) {
            if (e.type === "meta") continue;
            controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
            await new Promise((r) => setTimeout(r, e.type === "text" ? 6 : 140));
          }
          return;
        }

        if (PROVIDER === "gemini") await runGeminiAgent({ messages, send, signal: req.signal });
        else if (PROVIDER === "anthropic") await runAnthropicAgent({ messages, send, signal: req.signal });
        else throw new Error("no provider");

        send({ type: "done" });
        if (!log.some((e) => e.type === "error" || e.type === "retry")) cacheSet(key, log);
      } catch (err) {
        if (req.signal.aborted) return;
        console.error("agent failed", err);
        send({ type: "error", message: friendly(err) });
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
