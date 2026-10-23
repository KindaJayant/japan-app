/**
 * Rules-engine regression suite. No API calls, runs in <1s.
 *   npm run eval:rules
 * Every case is a realistic Japanese ingredient line. The one number that
 * matters: FALSE SAFE must be 0 (we never tell someone a product is safe when it isn't).
 */
import { analyzeText } from "../src/lib/diet/analyze";
import type { Diet, Verdict } from "../src/lib/diet/types";

type Expect = Partial<Record<Diet, Verdict>>;
const CASES: { name: string; text: string; expect: Expect }[] = [
  {
    name: "Cup noodle (pork + bonito)",
    text: "油揚げめん（小麦粉、植物油脂、食塩）、スープ（豚脂、しょうゆ、かつおエキス、ねぎ、香辛料）、調味料（アミノ酸等）",
    expect: { veg: "avoid", jain: "avoid", halal: "avoid" },
  },
  {
    name: "Kombu onigiri",
    text: "ご飯、昆布佃煮、のり、食塩",
    expect: { veg: "safe", jain: "safe", halal: "safe" },
  },
  {
    name: "Plain potato chips",
    text: "じゃがいも（遺伝子組換えでない）、植物油、食塩",
    expect: { veg: "safe", jain: "avoid", halal: "safe" },
  },
  {
    name: "Consommé chips (hidden meat)",
    text: "じゃがいも、植物油、コンソメシーズニング（乳糖、食塩、ぶどう糖、チキンエキスパウダー、オニオンパウダー）",
    expect: { veg: "avoid", jain: "avoid" },
  },
  {
    name: "Milk chocolate (牛乳 must NOT read as beef)",
    text: "砂糖、カカオマス、全粉乳、ココアバター、乳化剤、香料、（一部に乳成分・大豆を含む）",
    expect: { veg: "safe", jain: "safe", halal: "unsure" },
  },
  {
    name: "Gummy (gelatin)",
    text: "水あめ、砂糖、ゼラチン、果汁、酸味料、香料、着色料（カルミン酸）",
    expect: { veg: "avoid", jain: "avoid", halal: "avoid" },
  },
  {
    name: "Gobo salad (牛蒡 is burdock, not beef)",
    text: "牛蒡、人参、ごま、砂糖、醤油",
    expect: { veg: "safe", jain: "avoid", halal: "unsure" },
  },
  {
    name: "Miso soup instant (dashi)",
    text: "米みそ、乾燥ねぎ、乾燥わかめ、風味調味料（かつお）",
    expect: { veg: "avoid", jain: "avoid" },
  },
  {
    name: "Teriyaki sauce (mirin + sake)",
    text: "しょうゆ、砂糖、本みりん、清酒、しょうが",
    expect: { veg: "safe", jain: "avoid", halal: "avoid" },
  },
  {
    name: "Melon pan (egg)",
    text: "小麦粉、砂糖、マーガリン、鶏卵、イースト、食塩",
    expect: { veg: "avoid", jain: "avoid", halal: "safe" },
  },
  {
    name: "Sugar alcohol mint (糖アルコール is not alcohol)",
    text: "糖アルコール（キシリトール）、香料、甘味料",
    expect: { veg: "safe", jain: "safe", halal: "safe" },
  },
  {
    name: "Ramune candy",
    text: "ぶどう糖、酸味料、香料、ラムネ",
    expect: { veg: "safe", jain: "safe", halal: "safe" },
  },
  {
    name: "Shrimp crackers",
    text: "でん粉、えび、植物油脂、砂糖、食塩",
    expect: { veg: "avoid", jain: "avoid", halal: "safe" },
  },
  {
    name: "Unknown extract",
    text: "小麦粉、砂糖、エキス、食塩",
    expect: { veg: "unsure", jain: "unsure", halal: "unsure" },
  },
  {
    name: "Kombu-only dashi",
    text: "昆布だし、食塩、砂糖",
    expect: { veg: "safe", jain: "safe", halal: "safe" },
  },
  {
    name: "Katakana / full-width spelling",
    text: "ﾎﾟｰｸｴｷｽ、ガーリック",
    expect: { veg: "avoid", jain: "avoid", halal: "avoid" },
  },
  {
    name: "Mushroom rice (Jain)",
    text: "米、しいたけ、醤油、砂糖",
    expect: { veg: "safe", jain: "avoid", halal: "unsure" },
  },
  {
    name: "Cheese snack (rennet)",
    text: "小麦粉、チーズ、植物油脂、食塩",
    expect: { veg: "unsure", jain: "unsure", halal: "unsure" },
  },
  {
    name: "Honey lemon drink",
    text: "果糖ぶどう糖液糖、はちみつ、レモン果汁、酸味料",
    expect: { veg: "safe", jain: "avoid", halal: "safe" },
  },
  {
    name: "Fruit jelly with 果肉 (not meat)",
    text: "砂糖、みかん果肉、ゲル化剤（増粘多糖類）、酸味料",
    expect: { veg: "safe", jain: "safe", halal: "safe" },
  },
  {
    name: "English label",
    text: "Wheat flour, sugar, palm oil, whey powder, egg, onion powder",
    expect: { veg: "avoid", jain: "avoid", halal: "safe" },
  },
  {
    name: "Empty / unreadable",
    text: "",
    expect: { veg: "unsure", jain: "unsure", halal: "unsure" },
  },
];

const RANK: Record<Verdict, number> = { safe: 0, unsure: 1, avoid: 2 };
let pass = 0;
let falseSafe = 0;
const failures: string[] = [];

for (const c of CASES) {
  const { results, matches } = analyzeText(c.text);
  for (const [diet, want] of Object.entries(c.expect) as [Diet, Verdict][]) {
    const got = results.find((r) => r.diet === diet)!.verdict;
    if (got === want) {
      pass++;
      continue;
    }
    if (got === "safe" && RANK[want] > 0) falseSafe++;
    failures.push(
      `✗ ${c.name} [${diet}] expected ${want}, got ${got}\n    matched: ${matches.map((m) => `${m.found}(${m.entryId})`).join(", ") || "—"}`,
    );
  }
}

const total = CASES.reduce((n, c) => n + Object.keys(c.expect).length, 0);
console.log(failures.join("\n"));
console.log(`\n${pass}/${total} checks passed · FALSE SAFE: ${falseSafe}`);
process.exit(failures.length ? 1 : 0);
