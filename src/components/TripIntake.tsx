"use client";

import { useState } from "react";
import { CITIES, type City } from "@/data/costs";
import { DIET_LABEL } from "@/lib/diet/types";
import { useDiets } from "@/lib/useDiets";
import { DietTags } from "./DietTags";

const INTERESTS = ["Temples & shrines", "Food", "Nature", "Shopping", "Anime & pop culture", "History", "Photography", "Onsen"];
const AIRPORT: Record<City, string> = { Tokyo: "TYO", Kyoto: "KIX", Osaka: "KIX", Nara: "KIX", Hiroshima: "HIJ", Fuji: "TYO" };
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

function Stepper({ label, value, set, min = 0, max = 9, hint }: { label: string; value: number; set: (n: number) => void; min?: number; max?: number; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>
        <span className="font-bold">{label}</span>
        {hint && <span className="block text-xs text-sumi-soft">{hint}</span>}
      </span>
      <span className="flex items-center gap-2">
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => set(Math.max(min, value - 1))} className="press grid h-8 w-8 place-items-center rounded-full ink font-bold">
          −
        </button>
        <span className="w-6 text-center text-lg font-extrabold tabular-nums">{value}</span>
        <button type="button" aria-label={`More ${label}`} onClick={() => set(Math.min(max, value + 1))} className="press grid h-8 w-8 place-items-center rounded-full ink font-bold">
          +
        </button>
      </span>
    </div>
  );
}

function Segmented<T extends string>({ value, set, options, label }: { value: T; set: (v: T) => void; options: readonly T[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full ink p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => set(o)}
          className={`flex-1 rounded-full py-1.5 text-sm font-bold capitalize transition-colors ${value === o ? "bg-sumi text-washi" : ""}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** The trip brief, laid out as a boarding pass. Produces a precise prompt for the agent. */
export function TripIntake({ onSubmit, busy }: { onSubmit: (brief: string) => void; busy: boolean }) {
  const [days, setDays] = useState(6);
  const [cities, setCities] = useState<City[]>(["Tokyo", "Kyoto"]);
  const [adults, setAdults] = useState(2);
  const [seniors, setSeniors] = useState(2);
  const [kids, setKids] = useState(0);
  const [diets, setDiets] = useDiets();
  const [budget, setBudget] = useState(150000);
  const [noBudget, setNoBudget] = useState(false);
  const [style, setStyle] = useState<"budget" | "comfort" | "premium">("comfort");
  const [pace, setPace] = useState<"relaxed" | "balanced" | "packed">("relaxed");
  const [interests, setInterests] = useState<string[]>(["Temples & shrines", "Food"]);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function submit() {
    const who = [adults && `${adults} adult${adults > 1 ? "s" : ""}`, seniors && `${seniors} senior${seniors > 1 ? "s" : ""} (60+)`, kids && `${kids} kid${kids > 1 ? "s" : ""}`]
      .filter(Boolean)
      .join(", ");
    onSubmit(
      [
        "Plan my Japan trip.",
        `Travellers: ${who || "1 adult"}.`,
        `Diet: ${diets.length ? diets.map((d) => DIET_LABEL[d]).join(" + ") : "no restrictions"}.`,
        `${days} days. Cities: ${cities.length ? cities.join(" then ") : "you choose"}.`,
        `Budget: ${noBudget ? "flexible" : `${inr(budget)} per person`}, ${style} style, ${pace} pace.`,
        interests.length ? `Interests: ${interests.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="overflow-hidden rounded-2xl ink ink-shadow bg-washi"
    >
      {/* Pass header */}
      <div className="on-pastel flex items-center justify-between bg-sakura px-5 py-4">
        <div>
          <p className="eyebrow">Boarding pass · 搭乗券</p>
          <p className="display text-3xl font-semibold leading-none">
            DEL <span className="text-shu">✈</span> {AIRPORT[cities[0] ?? "Tokyo"]}
          </p>
        </div>
        <div className="text-right text-xs font-bold">
          <p>SAATHI AIR</p>
          <p className="font-mincho text-base">日本行き</p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        <section className="space-y-3">
          <p className="eyebrow text-sumi-soft">Who&rsquo;s coming</p>
          <Stepper label="Adults" value={adults} set={setAdults} />
          <Stepper label="Seniors" hint="Gentler days, fewer stairs" value={seniors} set={setSeniors} />
          <Stepper label="Kids" value={kids} set={setKids} />
        </section>

        <DietTags value={diets} onChange={setDiets} />

        <section>
          <div className="flex items-baseline justify-between">
            <p className="eyebrow text-sumi-soft">How long</p>
            <p className="display text-2xl font-semibold">{days} days</p>
          </div>
          <input type="range" min={3} max={14} value={days} onChange={(e) => setDays(+e.target.value)} className="w-full accent-[var(--shu)]" aria-label="Number of days" />
        </section>

        <section>
          <p className="eyebrow mb-2 text-sumi-soft">Cities, in order (optional)</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => {
              const idx = cities.indexOf(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={idx >= 0}
                  onClick={() => setCities(toggle(cities, c))}
                  className={`press flex items-center gap-1.5 rounded-full ink px-3 py-1.5 text-sm font-bold ${idx >= 0 ? "bg-mizu on-pastel" : ""}`}
                >
                  {idx >= 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-sumi text-[11px] text-washi">{idx + 1}</span>}
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <p className="eyebrow text-sumi-soft">Budget per person</p>
            <p className="display text-2xl font-semibold">{noBudget ? "Flexible" : inr(budget)}</p>
          </div>
          <input
            type="range"
            min={75000}
            max={400000}
            step={5000}
            value={budget}
            disabled={noBudget}
            onChange={(e) => setBudget(+e.target.value)}
            className="w-full accent-[var(--shu)] disabled:opacity-40"
            aria-label="Budget per person in rupees"
          />
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={noBudget} onChange={(e) => setNoBudget(e.target.checked)} className="accent-[var(--shu)]" /> No fixed budget
          </label>
        </section>

        <section className="space-y-2">
          <p className="eyebrow text-sumi-soft">Style &amp; pace</p>
          <Segmented label="Style" value={style} set={setStyle} options={["budget", "comfort", "premium"] as const} />
          <Segmented label="Pace" value={pace} set={setPace} options={["relaxed", "balanced", "packed"] as const} />
        </section>

        <section>
          <p className="eyebrow mb-2 text-sumi-soft">You love</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                aria-pressed={interests.includes(i)}
                onClick={() => setInterests(toggle(interests, i))}
                className={`press rounded-full ink px-3 py-1.5 text-sm font-bold ${interests.includes(i) ? "bg-yamabuki on-pastel" : ""}`}
              >
                {i}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Tear-off stub */}
      <div className="perforation mx-5" />
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <p className="text-xs leading-snug text-sumi-soft">
          Saathi drafts the trip, then our checker verifies every meal, rupee, stair and train before you see it.
        </p>
        <button type="submit" disabled={busy} className="press shrink-0 rounded-full bg-[#b8452c] px-5 py-3 font-bold text-white ink ink-shadow disabled:opacity-60">
          {busy ? "Designing…" : "Design my trip"}
        </button>
      </div>
    </form>
  );
}
