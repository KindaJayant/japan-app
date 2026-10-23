"use client";

import { DIETS, DIET_LABEL, type Diet } from "@/lib/diet/types";

const FILL: Record<Diet, string> = { veg: "bg-matcha", jain: "bg-sakura", halal: "bg-sora" };

/** Diet selector as luggage tags: string hole, slanted corners, pressed when on. */
export function DietTags({ value, onChange }: { value: Diet[]; onChange: (d: Diet[]) => void }) {
  return (
    <fieldset className="flex flex-wrap gap-2.5">
      <legend className="eyebrow mb-2 text-sumi-soft">I eat</legend>
      {DIETS.map((d) => {
        const on = value.includes(d);
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== d) : [...value, d])}
            className={`press ink relative flex items-center gap-2 rounded-l-[22px] rounded-r-md py-2 pr-4 pl-3 font-bold transition-colors ${
              on ? `${FILL[d]} on-pastel ink-shadow` : "bg-washi text-sumi-soft"
            }`}
          >
            <span aria-hidden className={`ml-1 h-2.5 w-2.5 rounded-full ink ${on ? "bg-washi" : ""}`} />
            {DIET_LABEL[d]}
          </button>
        );
      })}
    </fieldset>
  );
}
