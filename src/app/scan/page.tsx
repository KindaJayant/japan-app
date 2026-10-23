"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { analyzeText, type ScanResult } from "@/lib/diet/analyze";
import { DIET_LABEL, type DietResult } from "@/lib/diet/types";
import { useDiets } from "@/lib/useDiets";
import { DietTags } from "@/components/DietTags";
import { Stamp } from "@/components/Stamp";

const SAMPLE = {
  name: "Cup noodle (sample)",
  text: "油揚げめん（小麦粉、植物油脂、食塩、しょうゆ）、スープ（豚脂、粉末しょうゆ、かつおエキス、チキンエキス、ねぎ、香辛料）、かやく（えび、卵、ねぎ）、調味料（アミノ酸等）",
};

/** Downscale on the phone before upload: faster on venue Wi-Fi, same OCR quality. */
async function toJpegBase64(file: File, max = 1568): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

type State =
  | { kind: "idle" }
  | { kind: "loading"; preview?: string }
  | { kind: "done"; data: ScanResult & { ms?: number }; preview?: string; source: "photo" | "text" }
  | { kind: "error"; message: string; preview?: string };

export default function ScanPage() {
  const [diets, setDiets] = useDiets();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function scanPhoto(file: File) {
    const preview = URL.createObjectURL(file);
    setState({ kind: "loading", preview });
    try {
      const image = await toJpegBase64(file);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setState({ kind: "done", data, preview, source: "photo" });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Scan failed", preview });
    }
  }

  /** Rules-only check, entirely on the phone: instant and works offline. */
  function checkText(t: string) {
    if (!t.trim()) return;
    setState({ kind: "done", data: analyzeText(t), source: "text" });
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-end justify-between border-b-[1.5px] border-sumi pb-2">
        <h1 className="display text-4xl font-semibold">Label check</h1>
        <span className="font-mincho text-sm font-extrabold text-sumi-soft">原材料チェック</span>
      </header>

      <div className="mt-5">
        <DietTags value={diets} onChange={setDiets} />
      </div>

      {/* Capture */}
      <section className="mt-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && scanPhoto(e.target.files[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={state.kind === "loading" || diets.length === 0}
          className="press ink ink-shadow on-pastel relative flex w-full items-center gap-4 bg-sakura px-5 py-5 text-left disabled:opacity-60"
        >
          <CameraGlyph />
          <span>
            <span className="display block text-2xl font-semibold leading-tight">Photograph the label</span>
            <span className="text-sm opacity-80">Find 原材料名 (ingredients) on the pack</span>
          </span>
        </button>

        <details className="mt-3 rounded-lg ink bg-washi-deep px-4 py-3">
          <summary className="cursor-pointer font-bold">Paste ingredients instead (works offline)</summary>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="小麦粉、砂糖、ゼラチン…"
            className="mt-3 w-full rounded-md ink bg-washi p-3 font-mincho"
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => checkText(text)} className="press ink rounded-full bg-sumi px-4 py-2 text-sm font-bold text-washi">
              Check
            </button>
            <button
              type="button"
              onClick={() => {
                setText(SAMPLE.text);
                checkText(SAMPLE.text);
              }}
              className="press ink rounded-full px-4 py-2 text-sm font-bold"
            >
              Try a sample
            </button>
          </div>
        </details>
      </section>

      {/* Result */}
      <section aria-live="polite" className="mt-8">
        {state.kind === "loading" && <Reading preview={state.preview} />}
        {state.kind === "error" && (
          <div className="rounded-lg ink bg-washi-deep p-4">
            <p className="font-bold text-bad">{state.message}</p>
            <ChefLinks diets={diets} />
          </div>
        )}
        {state.kind === "done" && <Result data={state.data} diets={diets} preview={state.preview} source={state.source} />}
      </section>
    </div>
  );
}

function Reading({ preview }: { preview?: string }) {
  return (
    <div className="flex items-center gap-4">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-24 w-20 rotate-[-2deg] object-cover ink" />
      )}
      <div>
        <p className="display text-xl font-semibold">Reading the label…</p>
        <p className="text-sm text-sumi-soft">Claude transcribes it, then our rules decide.</p>
        <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-washi-deep">
          <div className="h-full w-1/3 animate-[slide_1.1s_ease-in-out_infinite] rounded-full bg-shu" />
        </div>
      </div>
    </div>
  );
}

function Result({
  data,
  diets,
  preview,
  source,
}: {
  data: ScanResult & { ms?: number };
  diets: string[];
  preview?: string;
  source: "photo" | "text";
}) {
  const shown = data.results.filter((r) => diets.includes(r.diet));
  const terms = [...new Set(shown.flatMap((r) => r.culprits.map((c) => c.found)))];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-sumi-soft">Result</p>
          <h2 className="display text-2xl font-semibold leading-tight">
            {data.reading.product_name || (source === "text" ? "Pasted ingredients" : "This label")}
          </h2>
        </div>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your photo" className="h-20 w-16 shrink-0 rotate-[2deg] object-cover ink" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
        {shown.map((r, i) => (
          <Stamp key={r.diet} verdict={r.verdict} label={DIET_LABEL[r.diet]} delay={i * 0.18} />
        ))}
      </div>

      {shown.map((r) => (
        <Reasons key={r.diet} r={r} />
      ))}

      {data.reading.transcription && (
        <figure className="mt-6 rounded-lg ink bg-washi-deep p-4">
          <figcaption className="eyebrow mb-2 text-sumi-soft">What the label says</figcaption>
          <p className="font-mincho leading-loose">
            <Highlighted text={data.reading.transcription} terms={terms} />
          </p>
        </figure>
      )}

      <ChefLinks diets={diets} />

      <p className="mt-6 border-t-[1.5px] border-dashed border-sumi-soft pt-3 text-xs leading-relaxed text-sumi-soft">
        <strong className="text-sumi">AI reads, rules decide.</strong>{" "}
        {source === "photo" ? `Claude transcribed the label${data.ms ? ` in ${(data.ms / 1000).toFixed(1)}s` : ""}; ` : ""}
        the verdict comes from a hand-checked ingredient dictionary. The AI can only make a verdict stricter, never
        mark something safe. Always confirm with staff if you have an allergy.
      </p>
    </div>
  );
}

function Reasons({ r }: { r: DietResult }) {
  if (r.verdict === "safe") return null;
  return (
    <div className="mt-4">
      <p className="font-bold">
        {DIET_LABEL[r.diet]}: {r.verdict === "avoid" ? "contains" : "check"}
      </p>
      <ul className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
        {r.culprits.length
          ? r.culprits.map((c) => (
              <li key={c.found} className="col-span-2 grid grid-cols-subgrid items-baseline">
                <span className={`font-mincho text-lg font-extrabold whitespace-nowrap ${c.effect === "no" ? "text-bad" : "text-warn"}`}>{c.found}</span>
                <span className="text-sm">
                  {c.en}
                  {c.why && <span className="text-sumi-soft"> · {c.why}</span>}
                </span>
              </li>
            ))
          : r.reasons.map((x) => (
              <li key={x} className="col-span-2 text-sm">
                {x}
              </li>
            ))}
      </ul>
    </div>
  );
}

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {text.split(re).map((part, i) =>
        terms.includes(part) ? (
          <mark key={i} className="on-pastel rounded-sm bg-tokiha px-0.5 font-extrabold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ChefLinks({ diets }: { diets: string[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {diets.map((d) => (
        <Link key={d} href={`/chef/${d}`} className="press ink ink-shadow rounded-full bg-yamabuki px-4 py-2 text-sm font-bold on-pastel">
          Show {DIET_LABEL[d as keyof typeof DIET_LABEL]} chef card →
        </Link>
      ))}
    </div>
  );
}

function CameraGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
      <rect x="4" y="12" width="40" height="28" rx="4" fill="#fbf3e6" stroke="#2b2522" strokeWidth="2.5" />
      <rect x="16" y="7" width="16" height="7" rx="2" fill="#2b2522" />
      <circle cx="24" cy="26" r="9" fill="#d4573b" stroke="#2b2522" strokeWidth="2.5" />
      <circle cx="24" cy="26" r="3.5" fill="#fbf3e6" />
    </svg>
  );
}
