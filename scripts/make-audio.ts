/**
 * Pre-generates natural Japanese audio for every fixed line in the app
 * (phrases, taxi cards, chef cards) so "Play" works on every phone and
 * offline, even where the device has no Japanese voice installed.
 *   FFMPEG=path/to/ffmpeg npx tsx --env-file=.env.local scripts/make-audio.ts
 * Resumable: existing clips are skipped. Free-tier friendly: sequential, honours retryDelay.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PHRASES } from "../src/data/culture";
import { DESTINATIONS } from "../src/data/destinations";
import { CHEF_CARD } from "../src/lib/diet/chefCard";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) throw new Error("GEMINI_API_KEY missing (use --env-file=.env.local)");
const MODEL = process.env.GEMINI_TTS_MODEL ?? "gemini-3.8-flash-tts";
const VOICE = process.env.GEMINI_TTS_VOICE ?? "Kore";
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const OUT = "public/audio";
mkdirSync(OUT, { recursive: true });

const audioId = (text: string) => createHash("sha1").update(text).digest("hex").slice(0, 12);

const texts = [
  ...PHRASES.flatMap((g) => g.items.map((p) => p.ja)),
  ...DESTINATIONS.map((d) => d.taxi.ja),
  ...Object.values(CHEF_CARD).map((c) => c.ja),
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const manifest: Record<string, string> = {};

// Free tier: ~10 clips/day per TTS model, so rotate models when one's daily quota runs out.
const MODELS = (process.env.GEMINI_TTS_MODELS ?? `${MODEL},gemini-3.8-flash-lite-tts,gemini-2.5-flash-preview-tts`).split(",");
let modelIdx = 0;

async function tts(text: string): Promise<{ data: Buffer; mime: string }> {
  for (let attempt = 0; attempt < 12 && modelIdx < MODELS.length; attempt++) {
    const model = MODELS[modelIdx];
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      }),
    });
    const j = await res.json();
    if (res.ok) {
      const part = j.candidates?.[0]?.content?.parts?.find((p: { inlineData?: unknown }) => p.inlineData)?.inlineData;
      if (!part) throw new Error("no audio in response");
      return { data: Buffer.from(part.data, "base64"), mime: part.mimeType as string };
    }
    const delay = Number(JSON.stringify(j).match(/"retryDelay":\s*"(\d+)/)?.[1] ?? 0);
    if (res.status === 429 && delay > 90) {
      console.log(`  ${model}: daily quota used, switching model`);
      modelIdx++;
      continue;
    }
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} ${j.error?.message}`);
    const wait = (delay || 5 * (attempt + 1)) * 1000;
    console.log(`  ${res.status}, waiting ${Math.round(wait / 1000)}s…`);
    await sleep(wait + 500);
  }
  throw new Error("All TTS models are out of free quota for today. Re-run tomorrow; finished clips are kept.");
}

async function main() {
  let made = 0;
  for (const text of [...new Set(texts)]) {
    const id = audioId(text);
    const mp3 = join(OUT, `${id}.mp3`);
    manifest[text] = `/audio/${id}.mp3`;
    if (existsSync(mp3)) continue;
    const wav = join(OUT, `${id}.raw`);
    const { data, mime } = await tts(text);
    writeFileSync(wav, data);
    // Some models return WAV, others raw 16-bit PCM ("audio/L16;rate=24000").
    const rate = mime.match(/rate=(\d+)/)?.[1];
    const input = mime.includes("L16") || mime.includes("pcm") ? ["-f", "s16le", "-ar", rate ?? "24000", "-ac", "1", "-i", wav] : ["-i", wav];
    // Mono 64 kbps MP3 plays everywhere (iOS Safari included) and stays ~20–40 KB per clip.
    execFileSync(FFMPEG, ["-y", "-loglevel", "error", ...input, "-ac", "1", "-b:a", "64k", mp3]);
    unlinkSync(wav);
    made++;
    console.log(`✓ ${text}`);
  }

  writeFileSync("src/data/audioManifest.json", JSON.stringify(manifest, null, 2) + "\n");
  // The service worker reads this list to precache every clip for offline use.
  writeFileSync(join(OUT, "index.json"), JSON.stringify(Object.values(manifest)));
  console.log(`${made} new clips · ${Object.keys(manifest).length} in manifest`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
