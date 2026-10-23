import { RAIL_JPY } from "@/data/costs";
import { destinationById, type Destination } from "@/data/destinations";
import { haversineKm } from "./geo";

export interface Leg {
  from: string;
  to: string;
  km: number;
  mode: "walk" | "metro / taxi" | "train" | "shinkansen";
  minutes: number;
  fareJpy: number;
  how: string;
}

/** Practical leg estimate between two curated places. Deterministic, no network. */
export function legBetween(a: Destination, b: Destination): Leg {
  const km = Math.round(haversineKm(a.geo, b.geo) * 10) / 10;
  const base = { from: a.id, to: b.id, km };
  if (a.city === b.city || km < 40) {
    if (km < 2.5) return { ...base, mode: "walk", minutes: Math.round(km * 14) + 3, fareJpy: 0, how: "Walk" };
    return {
      ...base,
      mode: "metro / taxi",
      minutes: Math.round(12 + km * 2.6),
      fareJpy: km < 8 ? 230 : 400,
      how: "Train or bus with an IC card (Suica/ICOCA). Taxi if you're tired.",
    };
  }
  const rail = RAIL_JPY[[a.city, b.city].sort().join("|")];
  if (rail) {
    const [h, m] = rail.time.match(/\d+/g)!.map(Number);
    const minutes = rail.time.includes("h") ? h * 60 + (m ?? 0) : h;
    return { ...base, mode: rail.train.includes("Shinkansen") ? "shinkansen" : "train", minutes: minutes + 20, fareJpy: rail.fare, how: rail.train };
  }
  return { ...base, mode: "shinkansen", minutes: Math.round(30 + km / 3), fareJpy: Math.round(km * 25), how: "Shinkansen (estimate)" };
}

export interface Route {
  title: string;
  stops: Destination[];
  legs: Leg[];
  totalKm: number;
  totalMinutes: number;
}

export function buildRoute(title: string, ids: string[]): Route {
  const stops = ids.map(destinationById).filter((d): d is Destination => !!d);
  const legs = stops.slice(1).map((s, i) => legBetween(stops[i], s));
  return {
    title,
    stops,
    legs,
    totalKm: Math.round(legs.reduce((s, l) => s + l.km, 0)),
    totalMinutes: legs.reduce((s, l) => s + l.minutes, 0),
  };
}

export const fmtMinutes = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim());

/** Ready-made plans for the map page. */
export const PRESET_ROUTES = [
  { key: "golden", title: "Plan A · The Golden Route", days: "7 days", ids: ["sensoji", "shibuya", "kawaguchiko", "kinkakuji", "fushimi-inari", "todaiji", "dotonbori"] },
  { key: "kyoto", title: "Plan B · Slow Kyoto & Nara", days: "4 days", ids: ["arashiyama", "kinkakuji", "kiyomizu", "fushimi-inari", "todaiji"] },
  { key: "west", title: "Plan C · Osaka to Hiroshima", days: "5 days", ids: ["dotonbori", "todaiji", "kiyomizu", "hiroshima"] },
] as const;
