/**
 * End-to-end label eval: real photos → Claude reads → rules decide.
 *   1. Put photos in fixtures/labels/  (e.g. cupnoodle.jpg)
 *   2. Add expectations to fixtures/labels/expected.json:
 *        { "cupnoodle.jpg": { "veg": "avoid", "jain": "avoid", "halal": "avoid" } }
 *   3. ANTHROPIC_API_KEY=... npm run eval:scan
 * Costs one API call per photo. FALSE SAFE must be 0 before demo day.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { analyze } from "../src/lib/diet/analyze";
import { readLabel } from "../src/lib/diet/scan";
import type { Diet, Verdict } from "../src/lib/diet/types";

const DIR = "fixtures/labels";
const expectedPath = join(DIR, "expected.json");
if (!existsSync(expectedPath)) {
  console.log(`No ${expectedPath} yet. Add label photos + expectations first (see header).`);
  process.exit(0);
}
const expected: Record<string, Partial<Record<Diet, Verdict>>> = JSON.parse(readFileSync(expectedPath, "utf8"));
const MEDIA: Record<string, "image/jpeg" | "image/png" | "image/webp"> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function main() {
  let pass = 0, total = 0, falseSafe = 0;
  for (const file of readdirSync(DIR).filter((f) => MEDIA[extname(f).toLowerCase()])) {
    const want = expected[file];
    if (!want) continue;
    const t0 = Date.now();
    const reading = await readLabel(readFileSync(join(DIR, file)).toString("base64"), MEDIA[extname(file).toLowerCase()]);
    const { results, matches } = analyze(reading);
    const ms = Date.now() - t0;
    for (const [diet, v] of Object.entries(want) as [Diet, Verdict][]) {
      total++;
      const got = results.find((r) => r.diet === diet)!.verdict;
      if (got === v) pass++;
      else {
        if (got === "safe") falseSafe++;
        console.log(`✗ ${file} [${diet}] expected ${v}, got ${got} · matched: ${matches.map((m) => m.found).join(", ") || "—"}`);
      }
    }
    console.log(`· ${file} read in ${(ms / 1000).toFixed(1)}s (readable=${reading.readable})`);
  }
  console.log(`\n${pass}/${total} checks passed · FALSE SAFE: ${falseSafe}`);
  process.exit(falseSafe ? 1 : 0);
}

main();
