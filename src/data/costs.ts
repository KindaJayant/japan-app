/**
 * Cost model for the budget tool. All figures are approximate planning numbers.
 * UPDATE the exchange rate before the demo and keep the "as of" date honest.
 */
export const FX = { jpyToInr: 0.58, asOf: "2026-10-23" };

export type Style = "budget" | "comfort" | "premium";

export const PER_DAY_JPY: Record<Style, { stay: number; food: number; localTransport: number; activities: number }> = {
  budget: { stay: 8000, food: 3500, localTransport: 1200, activities: 2000 },
  comfort: { stay: 16000, food: 6500, localTransport: 1800, activities: 4000 },
  premium: { stay: 35000, food: 12000, localTransport: 4000, activities: 8000 },
};

/** Return economy flight from a metro, per person, INR. */
export const FLIGHT_INR: Record<Style, number> = { budget: 45000, comfort: 60000, premium: 90000 };

/** Approx one-way reserved fares, JPY. Key: sorted "A|B". */
export const RAIL_JPY: Record<string, { fare: number; time: string; train: string }> = {
  "Kyoto|Tokyo": { fare: 14170, time: "2h15m", train: "Shinkansen Nozomi" },
  "Osaka|Tokyo": { fare: 14720, time: "2h30m", train: "Shinkansen Nozomi" },
  "Kyoto|Osaka": { fare: 580, time: "30m", train: "JR Special Rapid" },
  "Kyoto|Nara": { fare: 760, time: "45m", train: "JR Nara line" },
  "Nara|Osaka": { fare: 820, time: "50m", train: "JR Yamatoji line" },
  "Hiroshima|Osaka": { fare: 10620, time: "1h30m", train: "Shinkansen" },
  "Hiroshima|Kyoto": { fare: 11420, time: "1h40m", train: "Shinkansen" },
  "Hiroshima|Tokyo": { fare: 19760, time: "4h", train: "Shinkansen" },
  "Fuji|Tokyo": { fare: 2500, time: "2h", train: "Express bus / Fuji Excursion" },
  "Fuji|Kyoto": { fare: 13000, time: "3h30m", train: "Bus + Shinkansen" },
};

export const JR_PASS_7DAY_JPY = 50000;

export const ONE_OFF_INR = { visa: 1500, travelInsurance: 1500, simOrEsim: 1200 };

export const CITIES = ["Tokyo", "Kyoto", "Osaka", "Nara", "Hiroshima", "Fuji"] as const;
export type City = (typeof CITIES)[number];

/**
 * "Same money, other places": the perceived-cost barrier from our research.
 * Rough per-person planning numbers for a comparable comfort trip from Delhi/Mumbai.
 * VERIFY before the demo and keep the wording "approx".
 */
export const COMPARE: { name: string; flightInr: number; perDayInr: Record<Style, number> }[] = [
  { name: "Switzerland", flightInr: 60000, perDayInr: { budget: 14000, comfort: 24000, premium: 45000 } },
  { name: "Paris & Amsterdam", flightInr: 55000, perDayInr: { budget: 11000, comfort: 18000, premium: 34000 } },
  { name: "Singapore", flightInr: 28000, perDayInr: { budget: 8000, comfort: 13000, premium: 26000 } },
  { name: "Dubai", flightInr: 22000, perDayInr: { budget: 8000, comfort: 13000, premium: 28000 } },
];

export function compareTrips(days: number, style: Style, japanPerPersonInr: number) {
  return [
    { name: "Japan", total: japanPerPersonInr, isJapan: true },
    ...COMPARE.map((c) => ({ name: c.name, total: c.flightInr + c.perDayInr[style] * days, isJapan: false })),
  ].sort((a, b) => b.total - a.total);
}
