/** Events streamed from /api/agent to the browser as NDJSON. */
export type AgentEvent =
  | { type: "text"; delta: string }
  | { type: "tool"; id: string; name: string; label: string; input: unknown }
  | { type: "tool_result"; id: string; name: string; ok: boolean; data: unknown }
  /** A model call failed mid-stream and is being retried: drop text since the last checkpoint. */
  | { type: "retry"; reason: string }
  /** Waiting on rate limits: show the traveller why it's slow. */
  | { type: "status"; message: string }
  | { type: "meta"; provider: string; model?: string; cached?: boolean }
  | { type: "error"; message: string }
  | { type: "done" };

export type Send = (e: AgentEvent) => void;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentRun {
  messages: ChatMessage[];
  send: Send;
  signal?: AbortSignal;
}

export const MAX_TURNS = 8;
