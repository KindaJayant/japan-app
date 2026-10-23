/**
 * Self-hosts the Japanese fonts, subset to exactly the glyphs the app uses.
 *   node scripts/make-fonts.mjs      (re-run after adding new Japanese text)
 *
 * Why: Google's Japanese fonts ship as ~120 unicode-range slices per weight.
 * A page with a few dozen kanji pulled 148 font files (2.6 MB) and pushed LCP
 * to ~20 s on slow 4G. Subsetting to every kana + every kanji in src/ + Latin
 * gives one small file per weight. Rare kanji in AI-generated text fall back
 * to the phone's own Japanese font.
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "src/app/fonts";
mkdirSync(OUT, { recursive: true });

function walk(dir, files = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx?|css)$/.test(f)) files.push(p);
  }
  return files;
}

const glyphs = new Set();
for (const file of walk("src")) {
  for (const ch of readFileSync(file, "utf8")) {
    const c = ch.codePointAt(0);
    if ((c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef)) glyphs.add(ch);
  }
}
// Full kana + common punctuation so most AI-transcribed labels render in-font.
for (let c = 0x3041; c <= 0x3096; c++) glyphs.add(String.fromCodePoint(c));
for (let c = 0x30a1; c <= 0x30fc; c++) glyphs.add(String.fromCodePoint(c));
"、。「」『』・ー々（）！？".split("").forEach((c) => glyphs.add(c));
const latin = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") + "₹¥–—‘’“”…·→←✓×°";
const text = latin + [...glyphs].join("");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const FONTS = [
  { family: "Zen Maru Gothic", weights: [400, 700], file: "zen-maru" },
  { family: "Shippori Mincho B1", weights: [800], file: "shippori" },
];

for (const f of FONTS) {
  for (const w of f.weights) {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.family)}:wght@${w}&text=${encodeURIComponent(text)}&display=swap`, {
        headers: { "User-Agent": UA },
      })
    ).text();
    const url = css.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) throw new Error(`No font URL for ${f.family} ${w}:\n${css.slice(0, 300)}`);
    const buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());
    writeFileSync(join(OUT, `${f.file}-${w}.woff2`), buf);
    console.log(`${f.family} ${w}: ${(buf.length / 1024).toFixed(0)} KB`);
  }
}
console.log(`${glyphs.size} Japanese glyphs + Latin`);
