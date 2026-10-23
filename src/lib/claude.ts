import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY (or ANTHROPIC_BASE_URL / auth token) from the environment.
export const client = new Anthropic();

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

/** Lower effort = faster on stage. Override per route via env. */
export const SCAN_EFFORT = (process.env.SCAN_EFFORT ?? "low") as "low" | "medium" | "high";
export const AGENT_EFFORT = (process.env.AGENT_EFFORT ?? "low") as "low" | "medium" | "high";

/**
 * Server-side refusal fallback: if the model declines, the API reruns the
 * request on a fallback model inside the same call. Set CLAUDE_FALLBACKS=0 if
 * your gateway/proxy rejects the beta.
 */
const FALLBACKS_ON = process.env.CLAUDE_FALLBACKS !== "0";
export const fallbackParams: { betas: Anthropic.AnthropicBeta[]; fallbacks?: "default" } = FALLBACKS_ON
  ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }
  : { betas: [] };
