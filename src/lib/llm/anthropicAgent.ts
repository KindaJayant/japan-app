import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM } from "@/lib/agent/prompt";
import { runTool, TOOL_PARAMS, TOOLS, type ToolName } from "@/lib/agent/tools";
import { AGENT_EFFORT, client, fallbackParams, MODEL } from "@/lib/claude";
import { MAX_TURNS, type AgentRun } from "./types";

/** Claude tool-use loop (used when ANTHROPIC_API_KEY is set and GEMINI_API_KEY isn't). */
export async function runAnthropicAgent({ messages: chat, send, signal }: AgentRun) {
  const messages: Anthropic.Beta.BetaMessageParam[] = chat.map((m) => ({ role: m.role, content: m.content }));
  send({ type: "meta", provider: "anthropic", model: MODEL });

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const s = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 16000,
        ...fallbackParams,
        output_config: { effort: AGENT_EFFORT },
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        tools: TOOL_PARAMS,
        messages,
      },
      { signal },
    );
    s.on("text", (delta) => send({ type: "text", delta }));
    s.on("contentBlock", (block) => {
      if (block.type === "tool_use") {
        send({ type: "tool", id: block.id, name: block.name, label: TOOLS[block.name as ToolName]?.label ?? block.name, input: block.input });
      }
    });

    let message: Anthropic.Beta.BetaMessage;
    try {
      message = await s.finalMessage();
    } catch (err) {
      // Tool input couldn't be parsed at all (eager streaming): re-issue the turn once.
      if (err instanceof Anthropic.APIError || turn === MAX_TURNS - 1) throw err;
      send({ type: "retry", reason: "unparseable tool input" });
      continue;
    }

    if (message.stop_reason === "refusal") {
      send({ type: "text", delta: "\n\nI can't help with that one. Try asking about your Japan trip." });
      return;
    }
    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) return;
    if (message.stop_reason === "max_tokens") throw new Error("Response cut off (max_tokens)");

    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((tu) => {
      const r = runTool(tu.name, tu.input);
      send({ type: "tool_result", id: tu.id, name: tu.name, ok: r.ok, data: r.ok ? r.data : null });
      return {
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(r.ok ? r.data : { error: r.error }),
        ...(r.ok ? {} : { is_error: true }),
      };
    });
    // All results in ONE user message keeps parallel tool calls working.
    messages.push({ role: "user", content: results });
  }
}
