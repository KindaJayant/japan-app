import { ThinkingLevel, type Content, type FunctionCall, type Part } from "@google/genai";
import { SYSTEM } from "@/lib/agent/prompt";
import { runTool, TOOL_PARAMS, TOOLS, type ToolName } from "@/lib/agent/tools";
import { gemini, toGeminiSchema, withGemini } from "./gemini";
import { MAX_TURNS, type AgentRun } from "./types";

const FUNCTIONS = TOOL_PARAMS.map((t) => ({
  name: t.name,
  description: t.description,
  parametersJsonSchema: toGeminiSchema(t.input_schema),
}));

/**
 * Gemini tool-use loop. Model parts are appended to history verbatim so
 * Gemini 3 thought signatures survive between turns (required for function calling).
 */
export async function runGeminiAgent({ messages, send, signal }: AgentRun) {
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const { result: parts, model } = await withGemini(
      async (model) => {
        const collected: Part[] = [];
        let emitted = false;
        try {
          const stream = await gemini.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction: SYSTEM,
              tools: [{ functionDeclarations: FUNCTIONS }],
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              abortSignal: signal,
            },
          });
          for await (const chunk of stream) {
            for (const p of chunk.candidates?.[0]?.content?.parts ?? []) {
              collected.push(p);
              if (p.text && !p.thought) {
                send({ type: "text", delta: p.text });
                emitted = true;
              }
            }
          }
        } catch (err) {
          // Failed after partial output: tell the UI to drop it before we retry elsewhere.
          if (emitted) send({ type: "retry", reason: "model busy" });
          throw err;
        }
        return collected;
      },
      {
        signal,
        onWait: (message) => send({ type: "status", message }),
        onSwitch: (_from, to) => send({ type: "status", message: `Busy model, switching to ${to}…` }),
      },
    );
    if (turn === 0) send({ type: "meta", provider: "gemini", model });

    contents.push({ role: "model", parts });
    const calls = parts.map((p) => p.functionCall).filter((c): c is FunctionCall => !!c?.name);
    if (!calls.length) return;

    const responses: Part[] = calls.map((call, k) => {
      const id = call.id ?? `${turn}-${k}-${call.name}`;
      send({ type: "tool", id, name: call.name!, label: TOOLS[call.name as ToolName]?.label ?? call.name!, input: call.args });
      const r = runTool(call.name!, call.args ?? {});
      send({ type: "tool_result", id, name: call.name!, ok: r.ok, data: r.ok ? r.data : null });
      return {
        functionResponse: { id: call.id, name: call.name, response: r.ok ? { result: r.data } : { error: r.error } },
      };
    });
    // All responses in ONE turn so parallel calls stay paired.
    contents.push({ role: "user", parts: responses });
  }
}
