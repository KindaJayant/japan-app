/**
 * Trip-verifier regression suite: the checks the planner is held to.
 *   npm run eval:plan
 */
import { verifyItinerary, type Itinerary, type CheckStatus } from "../src/lib/itinerary";

const base: Itinerary = {
  title: "Test",
  summary: "Test",
  travellers: { adults: 2, seniors: 0, kids: 0 },
  diets: ["veg"],
  style: "comfort",
  pace: "balanced",
  budgetPerPersonInr: 200000,
  days: [
    { day: 1, city: "Tokyo", theme: "t", stops: ["sensoji", "shibuya"], meals: [{ when: "lunch", restaurantId: "t-s-tantan", label: "x" }, { when: "dinner", restaurantId: "saido", label: "x" }], tip: "x" },
    { day: 2, city: "Kyoto", theme: "t", stops: ["kinkakuji"], meals: [{ when: "lunch", restaurantId: "veg-out", label: "x" }, { when: "dinner", restaurantId: "mumokuteki-caf", label: "x" }], tip: "x" },
  ],
};
const clone = (f: (i: Itinerary) => void) => { const i = structuredClone(base); f(i); return i; };

const CASES: { name: string; it: Itinerary; expect: Record<string, CheckStatus> }[] = [
  { name: "clean plan", it: base, expect: { places: "pass", "diet-veg": "pass", budget: "pass", route: "pass", "meals-nearby": "pass" } },
  { name: "unknown place", it: clone((i) => i.days[0].stops.push("eiffel-tower")), expect: { places: "fail" } },
  { name: "restaurant in the wrong city", it: clone((i) => (i.days[1].meals[1].restaurantId = "saido", i.days.push({ ...i.days[1], day: 3, meals: [{ when: "dinner", restaurantId: "nataraj", label: "x" }] }))), expect: { "meals-nearby": "fail" } },
  { name: "halal diner sent to a veg-only place", it: clone((i) => (i.diets = ["halal"])), expect: { "diet-halal": "fail" } },
  { name: "konbini dinner is a warning, not a pass", it: clone((i) => (i.days[0].meals[1].restaurantId = null)), expect: { "diet-veg": "warn" } },
  { name: "over budget", it: clone((i) => (i.budgetPerPersonInr = 60000)), expect: { budget: "fail" } },
  { name: "seniors + Fushimi Inari stairs", it: clone((i) => ((i.travellers.seniors = 2), i.days[1].stops.push("fushimi-inari"))), expect: { walking: "warn" } },
  { name: "back-tracking", it: clone((i) => i.days.push({ ...i.days[0], day: 3 })), expect: { route: "warn" } },
];

let fails = 0;
for (const c of CASES) {
  const { checks } = verifyItinerary(c.it);
  for (const [id, want] of Object.entries(c.expect)) {
    const got = checks.find((k) => k.id === id)?.status ?? "missing";
    if (got !== want) { fails++; console.log(`✗ ${c.name}: ${id} expected ${want}, got ${got}`); }
  }
}
console.log(`${CASES.length} plans · ${fails ? `${fails} FAILED` : "all checks behave"}`);
process.exit(fails ? 1 : 0);
