"use client";

import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";
import { RESTAURANTS } from "@/data/food";
import type { CheckStatus, VerifiedItinerary } from "@/lib/itinerary";
import { fmtMinutes } from "@/lib/route";
import { JourneyMap } from "./JourneyMap";
import { BudgetReceipt } from "./ToolCards";
import { ShareTrip } from "./ShareTrip";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const STATUS: Record<CheckStatus, { ja: string; color: string; label: string }> = {
  pass: { ja: "安", color: "var(--ok)", label: "Checked" },
  warn: { ja: "注", color: "var(--warn)", label: "Heads-up" },
  fail: { ja: "否", color: "var(--bad)", label: "Problem" },
};

/** The verified itinerary as a printed trip folio: cover, check ledger, route, day cards, receipt. */
export function TripBoard({ v }: { v: VerifiedItinerary }) {
  const it = v.itinerary;
  const allStops = it.days.flatMap((d) => d.stops);
  const cities = it.days.map((d) => d.city).filter((c, i, a) => i === 0 || a[i - 1] !== c);
  const people = it.travellers.adults + it.travellers.seniors + it.travellers.kids;
  const max = Math.max(...v.compare.map((c) => c.total));

  return (
    <article className="space-y-6">
      {/* Cover */}
      <header className="on-pastel relative overflow-hidden rounded-2xl bg-mizu p-5 ink ink-shadow">
        <p className="eyebrow">Your trip · {it.days.length} days · {people} {people === 1 ? "traveller" : "travellers"}</p>
        <h2 className="display mt-1 text-3xl leading-tight font-semibold">{it.title}</h2>
        <p className="mt-2 max-w-[48ch] text-sm leading-relaxed">{it.summary}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <p className="font-bold">{cities.join(" → ")}</p>
          <p className="text-right">
            <span className="block text-xs">per person</span>
            <span className="display text-3xl font-semibold">{inr(v.budget.perPersonTotalInr)}</span>
          </p>
        </div>
        <span aria-hidden className="vertical-jp absolute top-4 right-4 font-mincho text-lg font-extrabold opacity-60">
          旅程表
        </span>
      </header>

      {/* Check ledger */}
      <section aria-labelledby="checks">
        <h3 id="checks" className="display text-2xl font-semibold">
          Checked for you
        </h3>
        <p className="text-sm text-sumi-soft">Every plan is verified by code, not just written by AI.</p>
        <ul className="mt-3 divide-y-[1.5px] divide-dashed divide-sumi-soft/40 border-y-[1.5px] border-sumi">
          {v.checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 py-2.5">
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 rotate-[-6deg] place-items-center rounded-full border-2 font-mincho text-sm font-extrabold"
                style={{ color: STATUS[c.status].color, borderColor: STATUS[c.status].color }}
                aria-label={STATUS[c.status].label}
              >
                {STATUS[c.status].ja}
              </span>
              <span>
                <span className="block font-bold leading-snug">{c.label}</span>
                <span className="text-sm text-sumi-soft">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Whole route */}
      <section>
        <h3 className="display mb-2 text-2xl font-semibold">The route</h3>
        <JourneyMap stops={allStops} routeKey={it.title + allStops.join()} />
      </section>

      {/* Days */}
      <section className="space-y-4">
        {it.days.map((d, i) => {
          const s = v.dayStats[i];
          return (
            <div key={d.day} className="overflow-hidden rounded-xl ink bg-washi">
              <div className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-sumi bg-washi-deep px-4 py-2.5">
                <p>
                  <span className="eyebrow mr-2 text-shu">Day {d.day}</span>
                  <span className="font-bold">{d.city}</span>
                </p>
                <p className="text-xs text-sumi-soft">
                  {s ? `~${(s.sightHours + s.moveMinutes / 60).toFixed(1)} h out · ${fmtMinutes(s.moveMinutes)} moving` : ""}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="display text-xl font-semibold">{d.theme}</p>

                {d.stops.length > 0 && (
                  <ol className="mt-3 space-y-2.5">
                    {d.stops.map((id) => {
                      const p = DESTINATIONS.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <li key={id} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/api/photo/${id}?raw=1`} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-md bg-washi-deep object-cover ink" />
                          <span className="min-w-0 flex-1">
                            <Link href={`/place/${id}`} className="block truncate font-bold">
                              {p.name}
                            </Link>
                            <span className="text-xs text-sumi-soft">
                              {p.setting === "indoor" ? "Indoor" : "Outdoor"} · ~{p.hours} h{p.walking === "hard" ? " · lots of stairs" : ""}
                            </span>
                          </span>
                          <Link href={`/taxi/${id}`} className="press shrink-0 rounded-full ink bg-yamabuki px-2.5 py-1 font-mincho text-sm font-extrabold on-pastel" aria-label={`Taxi card for ${p.name}`}>
                            車
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {d.meals.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {d.meals.map((m, k) => {
                      const r = m.restaurantId ? RESTAURANTS.find((x) => x.id === m.restaurantId) : undefined;
                      const fits = it.diets.map((dt) => r?.diets[dt]);
                      const badge = !r ? "chef card" : fits.every((f) => f === "yes") ? "verified" : "ask staff";
                      return (
                        <li key={k} className="flex items-baseline gap-2">
                          <span className="w-16 shrink-0 text-xs font-bold tracking-wide text-sumi-soft uppercase">{m.when}</span>
                          <span className="flex-1">{m.label}</span>
                          {it.diets.length > 0 && (
                            <span
                              className={`shrink-0 rounded-full px-2 text-[11px] font-bold on-pastel ${badge === "verified" ? "bg-matcha" : badge === "ask staff" ? "bg-yamabuki" : "bg-sakura"}`}
                            >
                              {badge}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {d.tip && <p className="mt-3 border-l-4 border-tokiha pl-3 text-sm leading-relaxed">{d.tip}</p>}
              </div>
            </div>
          );
        })}
      </section>

      {/* Money */}
      <section className="space-y-5">
        <BudgetReceipt data={v.budget} />
        <div>
          <h3 className="display text-2xl font-semibold">Same money, other places</h3>
          <p className="text-sm text-sumi-soft">A comparable {it.style} trip of {it.days.length} days, per person, approx.</p>
          <ul className="mt-3 space-y-2">
            {v.compare.map((c) => (
              <li key={c.name} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-sm">
                <span className={c.isJapan ? "font-extrabold" : ""}>{c.name}</span>
                <span className="relative h-7 overflow-hidden rounded-md bg-washi-deep">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-md ${c.isJapan ? "bg-shu" : "bg-sumi-soft/50"}`}
                    style={{ width: `${(c.total / max) * 100}%` }}
                  />
                  <span className={`absolute inset-y-0 left-2 flex items-center text-xs font-bold ${c.isJapan ? "text-white" : ""}`}>{inr(c.total)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ShareTrip v={v} />
    </article>
  );
}
