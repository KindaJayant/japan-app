import { z } from "zod";
import { CITIES, FLIGHT_INR, FX, JR_PASS_7DAY_JPY, ONE_OFF_INR, PER_DAY_JPY, RAIL_JPY } from "@/data/costs";

const inr = (jpy: number) => Math.round(jpy * FX.jpyToInr);

// ── Tool implementations (pure functions over local data) ─────────────────

export const BudgetInput = z.object({
  days: z.number().int().min(1).max(30),
  cities: z.array(z.enum(CITIES)).min(1).describe("Cities in visiting order"),
  travellers: z.number().int().min(1).max(12).default(1),
  style: z.enum(["budget", "comfort", "premium"]).default("comfort"),
});

export function estimateBudget(i: z.infer<typeof BudgetInput>) {
  const d = PER_DAY_JPY[i.style];
  const perDayJpy = d.stay / 2 + d.food + d.localTransport + d.activities; // stay assumes twin-share
  const legs = i.cities.slice(1).map((to, k) => {
    const from = i.cities[k];
    const key = [from, to].sort().join("|");
    const r = RAIL_JPY[key] ?? { fare: 12000, time: "~3h", train: "Rail (estimate)" };
    return { from, to, ...r };
  });
  // Open-jaw flights (in to Tokyo, out of Osaka) avoid a return rail leg.
  const railJpy = legs.reduce((s, l) => s + l.fare, 0);
  const jrPassWorthIt = i.days <= 7 && railJpy > JR_PASS_7DAY_JPY;

  const perPerson = {
    flights: FLIGHT_INR[i.style],
    stay: inr((d.stay / 2) * i.days),
    food: inr(d.food * i.days),
    localTransport: inr(d.localTransport * i.days),
    intercityRail: inr(jrPassWorthIt ? JR_PASS_7DAY_JPY : railJpy),
    activities: inr(d.activities * i.days),
    visaInsuranceSim: ONE_OFF_INR.visa + ONE_OFF_INR.travelInsurance + ONE_OFF_INR.simOrEsim,
  };
  const perPersonTotal = Object.values(perPerson).reduce((a, b) => a + b, 0);
  return {
    style: i.style,
    days: i.days,
    travellers: i.travellers,
    perPersonInr: perPerson,
    perPersonTotalInr: perPersonTotal,
    groupTotalInr: perPersonTotal * i.travellers,
    dailySpendJpy: perDayJpy,
    dailySpendInr: inr(perDayJpy),
    rail: { legs, totalJpy: railJpy, jrPass7DayJpy: JR_PASS_7DAY_JPY, jrPassWorthIt },
    fx: `¥1 = ₹${FX.jpyToInr} (as of ${FX.asOf})`,
    assumptions: "Twin-share rooms, economy return flight from Delhi/Mumbai, approximate 2026 prices.",
  };
}

export type Budget = ReturnType<typeof estimateBudget>;
