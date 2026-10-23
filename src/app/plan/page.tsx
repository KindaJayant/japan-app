"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStored } from "@/lib/useStored";
import { Markdown } from "@/components/Markdown";
import { TripBoard } from "@/components/TripBoard";
import { TripIntake } from "@/components/TripIntake";
import { TRIP_KEY } from "@/components/ShareTrip";
import type { VerifiedItinerary } from "@/lib/itinerary";
import type { AgentEvent } from "@/lib/llm/types";

type ToolStep = { id: string; name: string; label: string; detail?: string; done: boolean; ok?: boolean; data?: unknown };

/** One-line context for a tool step, so "Finding diet-safe food" ×4 reads as four different jobs. */
function stepDetail(name: string, input: unknown): string | undefined {
  const i = (input ?? {}) as Record<string, unknown>;
  if (name === "find_food") return [i.city, i.diet].filter(Boolean).join(" · ");
  if (name === "list_destinations") return (i.city as string) ?? "all of Japan";
  if (name === "get_etiquette") return (i.contexts as string[] | undefined)?.join(", ");
  if (name === "estimate_budget") return `${i.days} days · ${i.travellers ?? 1} people · ${i.style ?? ""}`;
  if (name === "show_route" || name === "present_itinerary") return i.title as string | undefined;
  return undefined;
}
type Turn =
  | { role: "user"; text: string; brief?: boolean }
  | { role: "assistant"; text: string; steps: ToolStep[]; status?: string; error?: string; streaming?: boolean; cached?: boolean; model?: string };
type AssistantTurn = Extract<Turn, { role: "assistant" }>;

const REFINE = ["Make the days lighter", "Cut the cost by 20%", "Add a day trip to Nara", "We skipped day 2, re-plan from here"];
const SAVED_KEY = "saathi.studio";

export default function Page() {
  return (
    <Suspense>
      <TripStudio />
    </Suspense>
  );
}

function TripStudio() {
  const [turns, setTurns] = useState<Turn[]>([]);
  // ?q= arrives from Today ("re-plan for rain") and place pages.
  const [input, setInput] = useState(useSearchParams().get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useStored<Turn[] | null>(SAVED_KEY, null);
  const boardRef = useRef<HTMLDivElement>(null);

  // The latest verified itinerary across the whole conversation is "the trip".
  const board = useMemo(() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      const t = turns[i];
      if (t.role !== "assistant") continue;
      const steps = t.steps.filter((s) => s.name === "present_itinerary" && s.ok && s.data);
      if (steps.length) return steps[steps.length - 1].data as VerifiedItinerary;
    }
    return null;
  }, [turns]);

  useEffect(() => {
    if (!board) return;
    try {
      localStorage.setItem(TRIP_KEY, JSON.stringify(board));
    } catch {}
  }, [board]);

  async function send(text: string, brief = false) {
    if (!text.trim() || busy) return;
    const history: Turn[] = [...turns, { role: "user", text, brief }];
    setTurns([...history, { role: "assistant", text: "", steps: [], streaming: true }]);
    setInput("");
    setBusy(true);
    let checkpoint = 0;

    const update = (fn: (a: AssistantTurn) => void) =>
      setTurns((ts) => {
        const copy = [...ts];
        const last = { ...(copy[copy.length - 1] as AssistantTurn) };
        last.steps = [...last.steps];
        fn(last);
        copy[copy.length - 1] = last;
        return copy;
      });

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((t) => t.text.trim()).map((t) => ({ role: t.role, content: t.text })) }),
      });
      if (!res.body) throw new Error("No response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as AgentEvent;
          switch (ev.type) {
            case "text":
              update((a) => void ((a.text += ev.delta), (a.status = undefined)));
              break;
            case "tool":
              update((a) => {
                checkpoint = a.text.length;
                a.status = undefined;
                if (!a.steps.some((s) => s.id === ev.id)) a.steps.push({ id: ev.id, name: ev.name, label: ev.label, detail: stepDetail(ev.name, ev.input), done: false });
              });
              break;
            case "tool_result":
              update((a) => void (a.steps = a.steps.map((s) => (s.id === ev.id ? { ...s, done: true, ok: ev.ok, data: ev.data } : s))));
              break;
            case "retry":
              update((a) => void (a.text = a.text.slice(0, checkpoint)));
              break;
            case "status":
              update((a) => void (a.status = ev.message));
              break;
            case "meta":
              update((a) => void ((a.cached = ev.cached), (a.model = ev.model)));
              break;
            case "error":
              update((a) => void (a.error = ev.message));
              break;
          }
        }
      }
    } catch {
      update((a) => void (a.error = "Couldn't reach Saathi. Check your connection."));
    } finally {
      update((a) => void ((a.streaming = false), (a.status = undefined)));
      setBusy(false);
      setTurns((ts) => {
        const last = ts[ts.length - 1];
        if (last?.role === "assistant" && !last.error) queueMicrotask(() => setSaved(ts));
        return ts;
      });
      setTimeout(() => boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  const started = turns.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-end justify-between border-b-[1.5px] border-sumi pb-2">
        <h1 className="display text-4xl font-semibold">Trip studio</h1>
        <span className="font-mincho text-sm font-extrabold text-sumi-soft">旅の設計</span>
      </header>

      {!started && (
        <section className="mt-5 space-y-4">
          <p className="max-w-[38ch] text-[1.05rem] leading-relaxed text-sumi-soft">
            Tell us who&rsquo;s travelling. Saathi designs the trip, and our checker proves it works for your family before you see it.
          </p>
          <TripIntake onSubmit={(brief) => send(brief, true)} busy={busy} />
          {saved && (
            <button type="button" onClick={() => setTurns(saved)} className="text-sm font-bold underline decoration-tokiha decoration-2 underline-offset-4">
              Open my last trip
            </button>
          )}
        </section>
      )}

      {started && (
        <ol className="mt-5 space-y-5">
          {turns.map((t, i) =>
            t.role === "user" ? (
              <li key={i} className={`ml-auto max-w-[88%] rotate-[0.4deg] rounded-lg rounded-br-none ink bg-washi-deep px-4 py-3 ${t.brief ? "text-sm" : "font-bold"}`}>
                {t.brief ? <BriefChips text={t.text} /> : t.text}
              </li>
            ) : (
              <li key={i}>
                <Working turn={t} />
              </li>
            ),
          )}
        </ol>
      )}

      {board && (
        <div ref={boardRef} className="mt-8 scroll-mt-4">
          <TripBoard v={board} />
        </div>
      )}

      {started && (
        <div className="mt-8 space-y-2">
          {board && !busy && (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {REFINE.map((r) => (
                <button key={r} type="button" onClick={() => send(r)} className="press shrink-0 rounded-full ink bg-washi px-3 py-1.5 text-sm font-bold">
                  {r}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 rounded-full ink bg-washi p-1.5 ink-shadow"
          >
            <label htmlFor="ask" className="sr-only">
              Change the trip
            </label>
            <input
              id="ask"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Change anything: “we're in Osaka now”"
              className="min-w-0 flex-1 bg-transparent px-4 outline-none placeholder:text-sumi-soft"
            />
            <button type="submit" disabled={busy || !input.trim()} className="press rounded-full bg-shu px-5 py-2.5 font-bold text-white disabled:opacity-50">
              {busy ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/** The brief as compact tags instead of a wall of text. */
function BriefChips({ text }: { text: string }) {
  const lines = text.split("\n").slice(1);
  return (
    <span className="flex flex-wrap gap-1.5">
      {lines.map((l) => (
        <span key={l} className="rounded-full bg-washi px-2.5 py-0.5 ink">
          {l.replace(/\.$/, "")}
        </span>
      ))}
    </span>
  );
}

/** Live log of what Saathi is doing: tool steps tick by, then a short note. */
function Working({ turn }: { turn: AssistantTurn }) {
  return (
    <div>
      {turn.steps.length > 0 && (
        <ul className="mb-3 space-y-1 border-l-2 border-dashed border-sumi-soft pl-4" aria-label="What Saathi checked">
          {turn.steps.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <span className={`grid h-5 w-5 place-items-center rounded-full ink text-[10px] font-bold on-pastel ${s.done ? (s.ok ? "bg-matcha" : "bg-sakura") : "animate-pulse bg-yamabuki"}`} aria-hidden>
                {s.done ? (s.ok ? "✓" : "!") : ""}
              </span>
              <span className={s.done ? "text-sumi-soft" : "font-bold"}>
                {s.label}
                {s.detail && <span className="font-normal opacity-70"> · {s.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {turn.status && <p className="mb-2 rounded-md bg-yamabuki/40 px-3 py-1.5 text-sm font-bold">{turn.status}</p>}
      {turn.text ? <Markdown text={turn.text} /> : turn.streaming && !turn.steps.length && <p className="animate-pulse text-sumi-soft">Saathi is reading your brief…</p>}
      {!turn.streaming && (turn.cached || turn.model) && (
        <p className="mt-2 text-[11px] text-sumi-soft">{turn.cached ? "Instant replay of an identical earlier request (saves free-tier quota)." : `Planned with ${turn.model}.`}</p>
      )}
      {turn.error && <p className="mt-3 rounded-md ink bg-sakura p-3 font-bold on-pastel">{turn.error}</p>}
    </div>
  );
}
