import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { CITIES } from "@/data/costs";
import { BudgetInput, estimateBudget } from "@/lib/budget";
import { ItineraryInput, verifyItinerary } from "@/lib/itinerary";
import { DESTINATIONS, destinationById } from "@/data/destinations";
import { ETIQUETTE, ETIQUETTE_CONTEXTS, type EtiquetteContext } from "@/data/etiquette";
import { KONBINI_TIPS, RESTAURANTS } from "@/data/food";
import { DIETS } from "@/lib/diet/types";
import { buildRoute, fmtMinutes } from "@/lib/route";

const FoodInput = z.object({
  city: z.enum(CITIES),
  diet: z.enum(DIETS),
});

function findFood(i: z.infer<typeof FoodInput>) {
  const places = RESTAURANTS.filter((r) => r.city === i.city && r.diets[i.diet]).map((r) => ({
    ...r,
    fit: r.diets[i.diet] === "yes" ? "serves this diet" : "possible on request: show the chef card",
  }));
  return {
    city: i.city,
    diet: i.diet,
    places,
    konbini: KONBINI_TIPS[i.diet],
    tip: places.length
      ? "Call ahead for Jain requests. Use the label scanner for anything packaged."
      : "No curated places yet for this city. Rely on the chef card, konbini picks and the label scanner.",
  };
}

const EtiquetteInput = z.object({
  contexts: z.array(z.enum(ETIQUETTE_CONTEXTS as [EtiquetteContext, ...EtiquetteContext[]])).min(1),
});

function getEtiquette(i: z.infer<typeof EtiquetteInput>) {
  return Object.fromEntries(i.contexts.map((c) => [c, ETIQUETTE[c]]));
}

const PlaceInput = z.object({
  id: z.string().describe("Destination id from list_destinations"),
});

function getPlace(i: z.infer<typeof PlaceInput>) {
  const d = destinationById(i.id);
  if (!d) return { error: `Unknown id. Valid: ${DESTINATIONS.map((x) => x.id).join(", ")}` };
  return { ...d, taxiCardUrl: `/taxi/${d.id}`, pageUrl: `/place/${d.id}` };
}

const ListInput = z.object({ city: z.enum(CITIES).optional() });

function listDestinations(i: z.infer<typeof ListInput>) {
  return DESTINATIONS.filter((d) => !i.city || d.city === i.city).map((d) => ({
    id: d.id,
    name: d.name,
    city: d.city,
    blurb: d.blurb,
    indiaLink: d.indiaLink ?? null,
  }));
}

const RouteInput = z.object({
  title: z.string().describe('Short plan name, e.g. "Plan A · Temples first"'),
  stops: z.array(z.string()).min(2).max(12).describe("Destination ids in visiting order"),
});

function showRoute(i: z.infer<typeof RouteInput>) {
  const unknown = i.stops.filter((id) => !destinationById(id));
  if (unknown.length) return { error: `Unknown ids: ${unknown.join(", ")}. Use list_destinations.` };
  const r = buildRoute(i.title, i.stops);
  return {
    title: r.title,
    stops: r.stops.map((s) => s.id),
    legs: r.legs.map((l) => ({ from: l.from, to: l.to, km: l.km, time: fmtMinutes(l.minutes), how: l.how, fareJpy: l.fareJpy })),
    totalKm: r.totalKm,
    totalMoving: fmtMinutes(r.totalMinutes),
    note: "The traveller now sees this route animated on a map with real photos.",
  };
}

// ── Registry ───────────────────────────────────────────────────────────────

interface ToolDef<S extends z.ZodType> {
  description: string;
  schema: S;
  run: (input: z.infer<S>) => unknown;
  /** Shown in the UI while the tool runs. */
  label: string;
}

const def = <S extends z.ZodType>(d: ToolDef<S>) => d;

export const TOOLS = {
  estimate_budget: def({
    description: "Estimate total trip cost in INR (and JPY) for Indian travellers: flights, stay, food, transport, intercity rail with JR Pass comparison. Always call this before quoting any price.",
    schema: BudgetInput,
    run: estimateBudget,
    label: "Estimating budget",
  }),
  find_food: def({
    description: "Find curated restaurants and convenience-store picks for a diet (veg, jain, halal) in a city. Call once per city/diet pair.",
    schema: FoodInput,
    run: findFood,
    label: "Finding diet-safe food",
  }),
  get_etiquette: def({
    description: "Get practical etiquette rules for contexts the traveller will hit (onsen, shrine, temple, train, taxi, restaurant, street, money, home).",
    schema: EtiquetteInput,
    run: getEtiquette,
    label: "Checking etiquette",
  }),
  list_destinations: def({
    description: "List curated destinations (optionally for one city) with ids, blurbs and India–Japan connections.",
    schema: ListInput,
    run: listDestinations,
    label: "Browsing destinations",
  }),
  present_itinerary: def({
    description:
      "Present the final day-by-day itinerary to the traveller as an interactive trip board. Returns a verification ledger (diet coverage, budget, daily load, stairs, back-tracking). If any check is 'fail', fix the plan and call this again. Explain any 'warn' briefly.",
    schema: ItineraryInput,
    run: (i) => {
      const v = verifyItinerary(i);
      return { ...v, verdict: v.checks.some((c) => c.status === "fail") ? "FIX_AND_RESUBMIT" : "SHOWN_TO_TRAVELLER" };
    },
    label: "Checking every day against your needs",
  }),
  show_route: def({
    description: "Draw a route on the traveller's map (animated, with real photos) and get distances and travel times for every leg. Call once per plan option (Plan A, Plan B…), and again whenever the plan changes.",
    schema: RouteInput,
    run: showRoute,
    label: "Drawing your route",
  }),
  get_place: def({
    description: "Get one destination's details, Japanese taxi card and links. Use the returned taxiCardUrl in the itinerary.",
    schema: PlaceInput,
    run: getPlace,
    label: "Preparing taxi card",
  }),
} as const;

export type ToolName = keyof typeof TOOLS;

export const TOOL_PARAMS: Anthropic.Beta.BetaTool[] = Object.entries(TOOLS).map(([name, t]) => ({
  name,
  description: t.description,
  input_schema: z.toJSONSchema(t.schema, { io: "input" }) as Anthropic.Beta.BetaTool.InputSchema,
  eager_input_streaming: true,
}));

/** Validate the (untrusted, possibly truncated) input, then run. */
export function runTool(name: string, input: unknown): { ok: true; data: unknown } | { ok: false; error: string } {
  const tool = TOOLS[name as ToolName];
  if (!tool) return { ok: false, error: `Unknown tool ${name}` };
  const parsed = tool.schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: `INVALID_INPUT: ${parsed.error.message}` };
  try {
    return { ok: true, data: (tool.run as (i: unknown) => unknown)(parsed.data) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
