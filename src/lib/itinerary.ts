import { z } from "zod";
import { CITIES, compareTrips } from "@/data/costs";
import { destinationById, type Destination } from "@/data/destinations";
import { RESTAURANTS } from "@/data/food";
import { estimateBudget, type Budget } from "@/lib/budget";
import { DIET_LABEL, DIETS, type Diet } from "@/lib/diet/types";
import { legBetween } from "@/lib/route";

/**
 * "AI proposes, code checks." The model drafts an itinerary; this verifier
 * scores it against the traveller's hard constraints. Failures go back to the
 * model to repair; the traveller sees the same check ledger the model saw.
 */
export const ItineraryInput = z.object({
  title: z.string().describe('Evocative trip name, e.g. "Temples & Tea: a Jain family in Kyoto"'),
  summary: z.string().describe("One or two sentences: who it's for and the shape of the trip"),
  travellers: z.object({ adults: z.number().int().min(0), seniors: z.number().int().min(0), kids: z.number().int().min(0) }),
  diets: z.array(z.enum(DIETS)),
  style: z.enum(["budget", "comfort", "premium"]),
  pace: z.enum(["relaxed", "balanced", "packed"]),
  budgetPerPersonInr: z.number().int().nullable().describe("The traveller's stated budget per person, or null"),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        city: z.enum(CITIES),
        theme: z.string().describe("3–6 word theme for the day"),
        stops: z.array(z.string()).describe("Destination ids in visiting order (may be empty on travel/rest days)"),
        meals: z.array(
          z.object({
            when: z.enum(["breakfast", "lunch", "dinner"]),
            restaurantId: z.string().nullable().describe("Id from find_food, or null for konbini/hotel/other"),
            label: z.string().describe('What to eat and where, e.g. "Vegan ramen at T\'s TanTan"'),
          }),
        ),
        tip: z.string().describe("One practical tip for the day"),
      }),
    )
    .min(1),
});
export type Itinerary = z.infer<typeof ItineraryInput>;

export type CheckStatus = "pass" | "warn" | "fail";
export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}
export interface DayStats {
  day: number;
  moveMinutes: number;
  sightHours: number;
  km: number;
  hardWalking: string[];
  outdoorShare: number;
}
export interface VerifiedItinerary {
  itinerary: Itinerary;
  checks: Check[];
  dayStats: DayStats[];
  budget: Budget;
  compare: ReturnType<typeof compareTrips>;
}

const worst = (xs: CheckStatus[]): CheckStatus => (xs.includes("fail") ? "fail" : xs.includes("warn") ? "warn" : "pass");

export function verifyItinerary(it: Itinerary): VerifiedItinerary {
  const checks: Check[] = [];
  const careful = it.travellers.seniors > 0 || it.travellers.kids > 0 || it.pace === "relaxed";
  const maxDayHours = it.pace === "packed" && !careful ? 10 : careful ? 7 : 8.5;

  // 1. Every stop is a real, curated place.
  const unknown = it.days.flatMap((d) => d.stops.filter((id) => !destinationById(id)));
  checks.push({
    id: "places",
    label: "Every stop is a verified place",
    status: unknown.length ? "fail" : "pass",
    detail: unknown.length ? `Unknown: ${unknown.join(", ")}` : `${it.days.reduce((n, d) => n + d.stops.length, 0)} stops, all with taxi cards`,
  });

  // 2. Per-day load, including the travel from the previous day's last stop.
  let prevLast: Destination | undefined;
  const dayStats: DayStats[] = it.days.map((d) => {
    const stops = d.stops.map(destinationById).filter((x): x is Destination => !!x);
    const chain = prevLast && stops.length ? [prevLast, ...stops] : stops;
    const legs = chain.slice(1).map((s, i) => legBetween(chain[i], s));
    if (stops.length) prevLast = stops[stops.length - 1];
    return {
      day: d.day,
      moveMinutes: legs.reduce((s, l) => s + l.minutes, 0),
      sightHours: stops.reduce((s, x) => s + x.hours, 0),
      km: Math.round(legs.reduce((s, l) => s + l.km, 0)),
      hardWalking: stops.filter((x) => x.walking === "hard").map((x) => x.name),
      outdoorShare: stops.length ? stops.filter((x) => x.setting === "outdoor").length / stops.length : 0,
    };
  });
  const heavy = dayStats.filter((s) => s.sightHours + s.moveMinutes / 60 > maxDayHours);
  checks.push({
    id: "load",
    label: careful ? "Gentle days (≤ 7 h out)" : `Days fit in ${maxDayHours} h`,
    status: heavy.length ? "warn" : "pass",
    detail: heavy.length
      ? heavy.map((s) => `Day ${s.day}: ~${(s.sightHours + s.moveMinutes / 60).toFixed(1)} h`).join(", ")
      : `Longest day ~${Math.max(...dayStats.map((s) => s.sightHours + s.moveMinutes / 60)).toFixed(1)} h`,
  });

  // 3. Stairs and long walks when travelling with elders or kids.
  if (it.travellers.seniors > 0 || it.travellers.kids > 0) {
    const hard = dayStats.flatMap((s) => s.hardWalking.map((n) => `Day ${s.day}: ${n}`));
    checks.push({
      id: "walking",
      label: "Easy on knees",
      status: hard.length ? "warn" : "pass",
      detail: hard.length ? `${hard.join("; ")}: lots of stairs. Plan a shorter version or a rest.` : "No steep climbs",
    });
  }

  // 4. Diet: every lunch and dinner has a safe plan.
  for (const diet of it.diets) {
    const perDay = it.days.map((d) => {
      const main = d.meals.filter((m) => m.when !== "breakfast");
      if (!main.length) return "warn" as CheckStatus;
      return worst(
        main.map((m) => {
          const r = m.restaurantId ? RESTAURANTS.find((x) => x.id === m.restaurantId) : undefined;
          if (!r) return "warn"; // konbini / hotel / unknown: doable with the scanner + chef card
          const fit = r.diets[diet as Diet];
          return fit === "yes" ? "pass" : fit === "ask" ? "warn" : "fail";
        }),
      );
    });
    const safe = perDay.filter((x) => x === "pass").length;
    checks.push({
      id: `diet-${diet}`,
      label: `${DIET_LABEL[diet]} meals every day`,
      status: perDay.includes("fail") ? "fail" : safe === perDay.length ? "pass" : "warn",
      detail: perDay.includes("fail")
        ? `A restaurant on day ${perDay.indexOf("fail") + 1} doesn't serve ${DIET_LABEL[diet].toLowerCase()} food`
        : `${safe}/${perDay.length} days fully covered by verified restaurants; the rest rely on the chef card + scanner`,
    });
  }

  // 4b. Restaurants are in today's city (or the city you leave from that morning).
  const misplaced = it.days.flatMap((d, i) =>
    d.meals
      .map((m) => (m.restaurantId ? RESTAURANTS.find((x) => x.id === m.restaurantId) : undefined))
      .filter((r): r is NonNullable<typeof r> => !!r && r.city !== d.city && r.city !== it.days[i - 1]?.city)
      .map((r) => `Day ${d.day}: ${r.name} is in ${r.city}`),
  );
  checks.push({
    id: "meals-nearby",
    label: "Meals are where you are",
    status: misplaced.length ? "fail" : "pass",
    detail: misplaced.length ? misplaced.join("; ") : "Every restaurant is in that day's city",
  });

  // 5. Budget.
  const cities = it.days.map((d) => d.city).filter((c, i, a) => i === 0 || a[i - 1] !== c);
  const budget = estimateBudget({
    days: it.days.length,
    cities,
    travellers: Math.max(1, it.travellers.adults + it.travellers.seniors + it.travellers.kids),
    style: it.style,
  });
  if (it.budgetPerPersonInr) {
    const ratio = budget.perPersonTotalInr / it.budgetPerPersonInr;
    checks.push({
      id: "budget",
      label: "Within budget",
      status: ratio <= 1 ? "pass" : ratio <= 1.1 ? "warn" : "fail",
      detail: `₹${budget.perPersonTotalInr.toLocaleString("en-IN")} of ₹${it.budgetPerPersonInr.toLocaleString("en-IN")} per person`,
    });
  }

  // 6. No back-tracking between cities.
  const revisit = cities.find((c, i) => cities.indexOf(c) !== i);
  checks.push({
    id: "route",
    label: "No back-tracking",
    status: revisit ? "warn" : "pass",
    detail: revisit ? `Returns to ${revisit}. Could the order be smoother?` : cities.join(" → "),
  });

  return { itinerary: it, checks, dayStats, budget, compare: compareTrips(it.days.length, it.style, budget.perPersonTotalInr) };
}
