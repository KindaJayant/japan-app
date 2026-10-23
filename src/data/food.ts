import type { Diet } from "@/lib/diet/types";

export interface Restaurant {
  id: string;
  name: string;
  nameJa?: string;
  city: "Tokyo" | "Kyoto" | "Osaka" | "Nara" | "Hiroshima";
  area: string;
  type: string;
  /** Diets it reliably serves. "ask" = possible on request. */
  diets: Partial<Record<Diet, "yes" | "ask">>;
  priceJpy: number; // approx per person
  note: string;
}

// TODO(data team): verify every entry (still open? diet claims?) before the demo.
export const RESTAURANTS: Restaurant[] = [
  { id: "t-s-tantan", name: "T's TanTan", city: "Tokyo", area: "Tokyo Station (inside gates)", type: "Vegan ramen", diets: { veg: "yes", jain: "ask" }, priceJpy: 1300, note: "Fully vegan. Perfect before a Shinkansen ride." },
  { id: "ain-soph-journey", name: "Ain Soph. Journey", city: "Tokyo", area: "Shinjuku", type: "Vegan café", diets: { veg: "yes", jain: "ask" }, priceJpy: 2000, note: "Famous vegan pancakes." },
  { id: "saido", name: "Saido", city: "Tokyo", area: "Jimbocho", type: "Vegan Japanese", diets: { veg: "yes", jain: "ask" }, priceJpy: 1800, note: "Vegan versions of Japanese classics." },
  { id: "nataraj", name: "Nataraj", city: "Tokyo", area: "Ginza / Ogikubo", type: "Indian vegetarian", diets: { veg: "yes", jain: "ask" }, priceJpy: 2000, note: "Long-running Indian vegetarian restaurant." },
  { id: "vege-herb-saga", name: "Vege Herb Saga", city: "Tokyo", area: "Okachimachi", type: "Indian vegetarian", diets: { veg: "yes", jain: "yes" }, priceJpy: 1500, note: "Known among Indian travellers for Jain food. Call ahead." },
  { id: "naritaya", name: "Naritaya", city: "Tokyo", area: "Asakusa", type: "Halal ramen", diets: { halal: "yes" }, priceJpy: 1200, note: "Halal-certified ramen near Senso-ji." },
  { id: "shinjuku-nakamuraya", name: "Shinjuku Nakamuraya", nameJa: "新宿中村屋", city: "Tokyo", area: "Shinjuku", type: "Historic Indian curry", diets: { veg: "ask" }, priceJpy: 2000, note: "Rash Behari Bose's 1927 curry. Ask about veg options." },
  { id: "shigetsu-tenryu-ji", name: "Shigetsu (Tenryu-ji)", nameJa: "篩月", city: "Kyoto", area: "Arashiyama", type: "Shōjin ryōri (temple vegan)", diets: { veg: "yes", jain: "ask", halal: "ask" }, priceJpy: 3300, note: "Buddhist cuisine traditionally avoids onion and garlic. Ask about mushrooms for Jain." },
  { id: "veg-out", name: "Veg Out", city: "Kyoto", area: "Shichijo, by the Kamo river", type: "Vegan café", diets: { veg: "yes", jain: "ask" }, priceJpy: 1500, note: "Riverside vegan bowls." },
  { id: "mumokuteki-caf", name: "Mumokuteki Café", city: "Kyoto", area: "Teramachi", type: "Vegetarian café", diets: { veg: "yes" }, priceJpy: 1400, note: "Big vegetarian lunch sets." },
  { id: "paprika-shokudo-vegan", name: "Paprika Shokudo Vegan", city: "Osaka", area: "Honmachi", type: "Vegan diner", diets: { veg: "yes", jain: "ask" }, priceJpy: 1500, note: "Vegan Osaka comfort food." },
];

/** Convenience-store survival list: generally safe picks (still scan the label!). */
export const KONBINI_TIPS: Record<Diet, string[]> = {
  veg: ["Kombu (昆布) or umeboshi (梅) onigiri", "Plain bread & fruit", "Edamame, salads (check dressing)", "Ice cream: scan for gelatin"],
  jain: ["Umeboshi (梅) or plain salt onigiri", "Fruit, nuts, plain rice crackers (scan for dashi)", "Soy milk", "Avoid anything with エキス or だし"],
  halal: ["Onigiri with kombu or tuna-mayo (scan for mirin)", "Fruit, nuts, bread", "Look for Muslim-friendly labels", "Use the scanner: mirin hides in sauces"],
};
