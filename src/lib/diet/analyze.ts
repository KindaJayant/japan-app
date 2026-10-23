import { findMatches, judge, type AiConcern } from "./engine";
import { DIETS, type Diet, type DietResult, type Match } from "./types";

/** What the AI reader returns (see scan.ts for the schema). Pure type: safe to import in the browser. */
export interface LabelReading {
  readable: boolean;
  product_name: string;
  transcription: string;
  ingredients: { original: string; english: string }[];
  concerns: AiConcern[];
}

export interface ScanResult {
  reading: LabelReading;
  matches: Match[];
  results: DietResult[];
}

/** Rules decide. The reading only supplies text and (stricter-only) concerns. */
export function analyze(reading: LabelReading, diets: readonly Diet[] = DIETS): ScanResult {
  const text = [reading.transcription, ...reading.ingredients.map((i) => i.original)].join("、");
  const matches = findMatches(text);
  const results = diets.map((d) =>
    judge(d, { text, readable: reading.readable, aiConcerns: reading.concerns }, matches),
  );
  return { reading, matches, results };
}

/**
 * Garbled or corrupted text (mojibake, "????", replacement chars) must never be
 * judged "safe": treat it as unreadable so the verdict is "unsure".
 */
export function looksReadable(text: string): boolean {
  const t = text.trim();
  if (!t || t.includes("�")) return false;
  const letters = t.match(/\p{L}/gu)?.length ?? 0;
  const junk = t.match(/[?？�]/g)?.length ?? 0;
  return letters >= 2 && junk / t.length < 0.3;
}

/** Offline / paste mode: no AI at all, rules only. Runs on the phone. */
export function analyzeText(text: string, diets: readonly Diet[] = DIETS): ScanResult {
  return analyze(
    { readable: looksReadable(text), product_name: "", transcription: text, ingredients: [], concerns: [] },
    diets,
  );
}
