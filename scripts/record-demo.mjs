/**
 * Records a phone-sized walkthrough of the app (backup demo video).
 *   npm run build && npx next start -p 3200      # in another terminal
 *   node scripts/record-demo.mjs [baseUrl]         # → demo/japan-saathi-demo.mp4
 * Captures Chrome's own high-DPI screencast (a true 2× phone frame), then
 * encodes with ffmpeg (set FFMPEG=path if it isn't on PATH).
 * Uses your installed Chrome. Taps show as ripples so viewers can follow along.
 * The trip brief is pre-warmed so the planner replays from cache (no quota, no waiting).
 */
import { chromium } from "playwright";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:3200";
const OUT = "demo";
const W = 430, H = 932;
mkdirSync(OUT, { recursive: true });

const BRIEF = [
  "Plan my Japan trip.",
  "Travellers: 2 adults, 2 seniors (60+).",
  "Diet: Jain.",
  "6 days. Cities: Tokyo then Kyoto.",
  "Budget: ₹1,50,000 per person, comfort style, relaxed pace.",
  "Interests: Temples & shrines, Food.",
].join("\n");

// Pre-warm the planner cache with exactly the brief the UI will send.
console.log("pre-warming planner…");
const warm = await fetch(`${BASE}/api/agent`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: [{ role: "user", content: BRIEF }] }),
});
const warmText = await warm.text();
if (!warmText.includes('"present_itinerary"')) console.warn("warning: planner did not return a board during pre-warm");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  colorScheme: "light",
  geolocation: { latitude: 35.7142, longitude: 139.7959 }, // simulated: near Senso-ji
  permissions: ["geolocation"],
  locale: "en-IN",
  timezoneId: "Asia/Tokyo",
});

// Tap ripples.
await ctx.addInitScript(() => {
  addEventListener("pointerdown", (e) => {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "fixed", left: e.clientX - 22 + "px", top: e.clientY - 22 + "px", width: "44px", height: "44px",
      borderRadius: "50%", background: "rgba(212,87,59,.35)", border: "2px solid rgba(212,87,59,.8)",
      zIndex: 99999, pointerEvents: "none", transition: "transform .45s ease, opacity .45s ease",
    });
    document.documentElement.appendChild(d);
    requestAnimationFrame(() => { d.style.transform = "scale(1.8)"; d.style.opacity = "0"; });
    setTimeout(() => d.remove(), 500);
  }, true);
});

const page = await ctx.newPage();

// Chrome screencast at device pixels: frames arrive only when the screen changes,
// each with a timestamp, so we can rebuild exact timing in ffmpeg.
const FRAMES = join(OUT, "frames");
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
const frames = [];
const cdp = await ctx.newCDPSession(page);
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const file = join(FRAMES, `f${String(frames.length).padStart(5, "0")}.jpg`);
  writeFileSync(file, Buffer.from(data, "base64"));
  frames.push({ file, t: metadata.timestamp });
  await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: W * 2, maxHeight: H * 2 });
const pause = (ms) => page.waitForTimeout(ms);
async function glide(px, steps = 12) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await pause(40);
  }
  await pause(500);
}
async function tap(locator) {
  await locator.scrollIntoViewIfNeeded();
  await pause(250);
  await locator.click();
}
async function toTop() {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await pause(700);
}

// 1. Home
await page.goto(BASE + "/");
await pause(2600);
await glide(700);
await pause(1200);
await glide(520);
await page.locator("#places").locator("xpath=../..").locator("ul").evaluate((ul) => ul.scrollTo({ left: 900, behavior: "smooth" }));
await pause(1600);
await glide(500);
await pause(1400);
await toTop();

// 2. Place → 3D → taxi card
await tap(page.getByRole("link", { name: /See it in AR/ }));
await pause(2200);
await glide(560);
await pause(800);
await page.getByText("See it before you go").scrollIntoViewIfNeeded();
await pause(4200);
await toTop();
await tap(page.getByRole("link", { name: /Big Japanese card for the driver/ }));
await pause(3200);
await tap(page.getByRole("button", { name: "← Back" }));
await pause(1200);

// 3. Scan a label (photo)
await tap(page.locator("nav[aria-label=Main]").getByRole("link", { name: /Scan food/ }));
await pause(1500);
await page.locator('input[type="file"]').setInputFiles("fixtures/labels/cupnoodle-synthetic.jpg");
await page.getByRole("img", { name: /^Jain:/ }).waitFor({ timeout: 90000 });
await pause(600);
await page.locator("section[aria-live]").scrollIntoViewIfNeeded();
await pause(2600);
await glide(420);
await pause(1600);
await tap(page.getByRole("link", { name: /Show Jain chef card/ }));
await pause(3000);
await tap(page.getByRole("button", { name: "← Back" }));
await pause(1000);

// 4. Trip studio
await tap(page.locator("nav[aria-label=Main]").getByRole("link", { name: /Studio/ }));
await pause(1600);
await glide(500);
await pause(800);
await glide(500);
await pause(800);
await tap(page.getByRole("button", { name: "Design my trip" }));
await page.locator("article").first().waitFor({ timeout: 180000 });
await pause(1200);
await page.locator("article").first().scrollIntoViewIfNeeded();
await pause(2200);
await glide(560);
await pause(2000);
await glide(560);
await pause(3200); // route animates
await glide(700);
await pause(1600);
await glide(700);
await pause(1200);
await page.getByText("Same money, other places").scrollIntoViewIfNeeded();
await pause(2800);
await tap(page.getByRole("button", { name: "Make trip poster" }));
await pause(800);
await page.getByAltText("Your trip poster").scrollIntoViewIfNeeded();
await pause(3200);

// 5. Today
await tap(page.locator("nav[aria-label=Main]").getByRole("link", { name: /Today/ }));
await pause(3200);
await glide(520);
await pause(2600);
await glide(520);
await pause(1200);
await tap(page.getByRole("button", { name: "Where am I?" }));
await pause(3200);

// 6. Manners: visual guides, phrases with audio, emergency
await tap(page.locator("nav[aria-label=Main]").getByRole("link", { name: /Manners/ }));
await pause(2200);
await page.locator("#shrine ol").evaluate((ol) => ol.scrollTo({ left: 520, behavior: "smooth" }));
await pause(2000);
await page.locator("#phrases").scrollIntoViewIfNeeded();
await pause(2400);
await page.locator("#help").scrollIntoViewIfNeeded();
await pause(2200);

// 7. Back home
await tap(page.locator("nav[aria-label=Main]").getByRole("link", { name: /Explore/ }));
await pause(2000);

await pause(800);
await cdp.send("Page.stopScreencast");
await ctx.close();
await browser.close();

// Variable-frame-rate concat list → constant 30 fps phone video.
const posix = (p) => resolve(p).split("\\").join("/");
const lines = [];
frames.forEach((f, i) => {
  const next = frames[i + 1]?.t ?? f.t + 1.2;
  lines.push(`file '${posix(f.file)}'`, `duration ${Math.max(0.001, next - f.t).toFixed(3)}`);
});
lines.push(`file '${posix(frames.at(-1).file)}'`);
const list = join(OUT, "frames.txt");
writeFileSync(list, lines.join("\n"));
const stamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "");
const mp4 = join(OUT, `japan-saathi-demo_${stamp}.mp4`); // timestamped: an open player can't lock it
execFileSync(process.env.FFMPEG ?? "ffmpeg", [
  "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list,
  "-vf", `fps=30,scale=${W * 2}:${H * 2}:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`,
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-movflags", "+faststart", mp4,
]);
rmSync(FRAMES, { recursive: true, force: true });
rmSync(list, { force: true });
console.log(`saved ${mp4} (${frames.length} frames)`);
