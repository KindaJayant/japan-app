import { DICTIONARY } from "./dictionary";
import type { Diet, DictEntry, DietResult, Match } from "./types";
import { DIET_LABEL } from "./types";

/**
 * Normalise label text so one dictionary term matches every common spelling:
 * full-width → half-width (NFKC), lowercase, katakana → hiragana, no whitespace.
 */
export function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/\s+/g, "");
}

interface IndexedTerm {
  norm: string;
  term: string;
  entry: DictEntry;
}

// Longest first: a longer term always wins over any term it contains.
const INDEX: IndexedTerm[] = DICTIONARY.flatMap((entry) =>
  entry.terms.map((term) => ({ norm: normalize(term), term, entry })),
)
  .filter((t) => t.norm.length > 0)
  .sort((a, b) => b.norm.length - a.norm.length);

const MASK = "\u0000";

/** Find every dictionary hit in the text. Pure and deterministic. */
export function findMatches(text: string): Match[] {
  let haystack = normalize(text);
  const hits: { pos: number; m: Match }[] = [];

  for (const { norm, term, entry } of INDEX) {
    let from = 0;
    for (;;) {
      const pos = haystack.indexOf(norm, from);
      if (pos === -1) break;
      haystack = haystack.slice(0, pos) + MASK.repeat(norm.length) + haystack.slice(pos + norm.length);
      hits.push({
        pos,
        m: { entryId: entry.id, found: term, en: entry.en, effect: null, why: entry.why },
      });
      from = pos + norm.length;
    }
  }

  // Label order, one row per distinct term.
  hits.sort((a, b) => a.pos - b.pos);
  const seen = new Set<string>();
  return hits
    .map((h) => h.m)
    .filter((m) => {
      const key = `${m.entryId}:${m.found}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const ENTRY_BY_ID = new Map(DICTIONARY.map((e) => [e.id, e]));

export interface AiConcern {
  ingredient: string;
  reason: string;
  diets: Diet[];
}

export interface JudgeInput {
  /** All label text we have (transcription + ingredient names). */
  text: string;
  /** False when the reader couldn't see a full ingredient list. */
  readable: boolean;
  /** Concerns raised by the AI reader. These can only make a verdict stricter. */
  aiConcerns?: AiConcern[];
}

/**
 * "AI reads, rules decide."
 *  - Any dictionary "no"           → avoid
 *  - Any dictionary "maybe"        → unsure
 *  - Unreadable / empty label      → unsure
 *  - AI concern the rules missed   → unsure (AI can never upgrade a verdict to safe)
 *  - otherwise                     → safe
 */
export function judge(diet: Diet, input: JudgeInput, matches = findMatches(input.text)): DietResult {
  const withEffect = matches.map((m) => ({
    ...m,
    effect: ENTRY_BY_ID.get(m.entryId)?.effects[diet] ?? null,
  }));
  const no = withEffect.filter((m) => m.effect === "no");
  const maybe = withEffect.filter((m) => m.effect === "maybe");
  const reasons: string[] = [];

  if (no.length) {
    reasons.push(...no.map((m) => `${m.found} = ${m.en}${m.why ? ` (${m.why})` : ""}`));
    reasons.push(...maybe.map((m) => `Also check: ${m.found} = ${m.en}`));
    return { diet, verdict: "avoid", culprits: [...no, ...maybe], reasons };
  }

  const covered = new Set(matches.map((m) => normalize(m.found)));
  const aiOnly = (input.aiConcerns ?? []).filter(
    (c) => c.diets.includes(diet) && ![...covered].some((t) => normalize(c.ingredient).includes(t)),
  );

  if (maybe.length || aiOnly.length || !input.readable || !input.text.trim()) {
    reasons.push(...maybe.map((m) => `${m.found} = ${m.en}${m.why ? ` (${m.why})` : ""}`));
    reasons.push(...aiOnly.map((c) => `AI reader flagged ${c.ingredient}: ${c.reason}`));
    if (!input.readable || !input.text.trim()) {
      reasons.push("Couldn't read a complete ingredient list. Show the chef card and ask staff.");
    }
    return { diet, verdict: "unsure", culprits: maybe, reasons };
  }

  return {
    diet,
    verdict: "safe",
    culprits: [],
    reasons: [`No ${DIET_LABEL[diet].toLowerCase()} conflicts found in ${matches.length ? "the listed ingredients" : "the label"}.`],
  };
}
