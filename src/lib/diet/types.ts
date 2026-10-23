export const DIETS = ["veg", "jain", "halal"] as const;
export type Diet = (typeof DIETS)[number];

/** How an ingredient affects a diet. Absent = fine for that diet. */
export type Effect = "no" | "maybe";

export type Verdict = "safe" | "avoid" | "unsure";

export interface DictEntry {
  id: string;
  /** Japanese (kanji / kana) and English spellings. Matched after normalisation. */
  terms: string[];
  en: string;
  /** Per-diet effect. Missing key means "fine for that diet". */
  effects: Partial<Record<Diet, Effect>>;
  /** Short reason shown to the traveller. */
  why?: string;
}

export interface Match {
  entryId: string;
  /** The exact text found on the label. */
  found: string;
  en: string;
  effect: Effect | null;
  why?: string;
}

export interface DietResult {
  diet: Diet;
  verdict: Verdict;
  /** Ingredients that caused avoid / unsure, in label order. */
  culprits: Match[];
  /** Human-readable reasons, most important first. */
  reasons: string[];
}

export const DIET_LABEL: Record<Diet, string> = {
  veg: "Vegetarian",
  jain: "Jain",
  halal: "Halal",
};
