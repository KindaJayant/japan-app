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

/** Offline / paste mode: no AI at all, rules only. Runs on the phone. */
export function analyzeText(text: string, diets: readonly Diet[] = DIETS): ScanResult {
  return analyze(
    { readable: text.trim().length > 0, product_name: "", transcription: text, ingredients: [], concerns: [] },
    diets,
  );
}
