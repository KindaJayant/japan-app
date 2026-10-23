"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VerifiedItinerary } from "@/lib/itinerary";

export const TRIP_KEY = "saathi.trip";
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/** Resolve next/font's generated family names so canvas text uses the real fonts. */
function fontFamily(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Paint a 1080×1350 vintage travel poster of the trip (WhatsApp-friendly 4:5). */
async function paintPoster(v: VerifiedItinerary): Promise<Blob> {
  await document.fonts.ready;
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const display = fontFamily("--font-fraunces", "Georgia, serif");
  const body = fontFamily("--font-zen-maru", "system-ui, sans-serif");
  const mincho = fontFamily("--font-shippori", "serif");
  const INK = "#2b2522", SHU = "#b8452c", WASHI = "#f6efe3";
  const it = v.itinerary;

  // paper + frame
  ctx.fillStyle = WASHI;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // sky band with sun and Fuji
  ctx.fillStyle = "#c3dbe6";
  ctx.fillRect(36, 36, W - 72, 420);
  ctx.fillStyle = "#fbf3e6";
  ctx.beginPath();
  ctx.arc(780, 210, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9fb8cc";
  ctx.beginPath();
  ctx.moveTo(36, 456);
  ctx.lineTo(420, 190);
  ctx.quadraticCurveTo(470, 160, 520, 190);
  ctx.lineTo(1044, 456);
  ctx.fill();
  ctx.fillStyle = "#fbf3e6";
  ctx.beginPath();
  ctx.moveTo(400, 204);
  ctx.lineTo(420, 190);
  ctx.quadraticCurveTo(470, 160, 520, 190);
  ctx.lineTo(540, 204);
  ctx.lineTo(505, 222);
  ctx.lineTo(470, 200);
  ctx.lineTo(435, 222);
  ctx.fill();
  // torii
  ctx.fillStyle = SHU;
  ctx.fillRect(170, 250, 22, 206);
  ctx.fillRect(298, 250, 22, 206);
  ctx.fillRect(150, 286, 190, 16);
  ctx.fillRect(140, 248, 210, 14);
  ctx.fillStyle = INK;
  ctx.fillRect(126, 228, 238, 18);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(36, 456);
  ctx.lineTo(W - 36, 456);
  ctx.stroke();

  // header text
  ctx.fillStyle = INK;
  ctx.font = `700 26px ${body}`;
  ctx.fillText("JAPAN SAATHI · TRIP PLAN", 84, 100);
  ctx.font = `800 40px ${mincho}`;
  ctx.textAlign = "right";
  ctx.fillText("日本の旅", W - 84, 104);
  ctx.textAlign = "left";

  // title
  ctx.font = `600 68px ${display}`;
  let y = 540;
  for (const line of wrap(ctx, it.title, W - 168).slice(0, 2)) {
    ctx.fillText(line, 84, y);
    y += 76;
  }

  // route
  const cities = it.days.map((d) => d.city).filter((x, i, a) => i === 0 || a[i - 1] !== x);
  ctx.font = `700 34px ${body}`;
  ctx.fillStyle = SHU;
  ctx.fillText(cities.join("  →  "), 84, y + 10);
  y += 70;

  // days
  ctx.fillStyle = INK;
  for (const d of it.days.slice(0, 7)) {
    ctx.font = `800 28px ${body}`;
    ctx.fillText(`Day ${d.day}`, 84, y);
    ctx.font = `500 28px ${body}`;
    const t = `${d.city} · ${d.theme}`;
    ctx.fillText(t.length > 34 ? t.slice(0, 33) + "…" : t, 210, y);
    y += 46;
  }
  if (it.days.length > 7) {
    ctx.fillText(`+ ${it.days.length - 7} more days`, 210, y);
    y += 46;
  }

  // price stamp
  ctx.save();
  ctx.translate(W - 220, H - 290);
  ctx.rotate(-0.12);
  ctx.strokeStyle = SHU;
  ctx.fillStyle = SHU;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 122, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `700 24px ${body}`;
  ctx.fillText("PER PERSON", 0, -40);
  ctx.font = `600 54px ${display}`;
  ctx.fillText(inr(v.budget.perPersonTotalInr), 0, 20);
  ctx.font = `700 22px ${body}`;
  ctx.fillText(`${it.days.length} DAYS · ALL-IN`, 0, 62);
  ctx.restore();

  // checks
  ctx.fillStyle = INK;
  ctx.font = `700 26px ${body}`;
  const passed = v.checks.filter((k) => k.status === "pass").map((k) => k.label);
  let cy = Math.max(y + 24, H - 330);
  ctx.fillText("Checked by Saathi:", 84, cy);
  ctx.font = `500 24px ${body}`;
  const room = Math.max(1, Math.floor((H - 120 - cy) / 38));
  for (const p of passed.slice(0, Math.min(5, room))) {
    cy += 38;
    ctx.fillText(`✓ ${p}`, 84, cy);
  }

  ctx.font = `500 22px ${body}`;
  ctx.fillStyle = "#5d544e";
  ctx.fillText("Plan yours with Japan Saathi", 84, H - 70);

  return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
}

export function ShareTrip({ v }: { v: VerifiedItinerary }) {
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  async function make() {
    const b = await paintPoster(v);
    setBlob(b);
    setUrl(URL.createObjectURL(b));
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], "japan-trip.png", { type: "image/png" });
    const text = `${v.itinerary.title}: ${v.itinerary.days.length} days in Japan, ${inr(v.budget.perPersonTotalInr)} per person. Planned with Japan Saathi.`;
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text }).catch(() => {});
    } else {
      const a = document.createElement("a");
      a.href = url!;
      a.download = "japan-trip.png";
      a.click();
    }
  }

  function useForToday() {
    try {
      localStorage.setItem(TRIP_KEY, JSON.stringify(v));
      setSaved(true);
    } catch {}
  }

  return (
    <section className="rounded-2xl ink bg-washi-deep p-5">
      <h3 className="display text-2xl font-semibold">Send it to the family group</h3>
      <p className="mt-1 text-sm text-sumi-soft">A vintage poster of your trip, sized for WhatsApp.</p>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Your trip poster" className="mx-auto mt-4 w-64 rotate-[-1deg] ink ink-shadow" />
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!url ? (
          <button type="button" onClick={make} className="press rounded-full bg-sumi px-5 py-2.5 font-bold text-washi ink">
            Make trip poster
          </button>
        ) : (
          <button type="button" onClick={share} className="press rounded-full bg-[#25d366] px-5 py-2.5 font-bold text-[#0b2e17] ink">
            Share poster
          </button>
        )}
        {saved ? (
          <Link transitionTypes={["nav-forward"]} href="/today" className="press rounded-full bg-[#b8452c] px-5 py-2.5 font-bold text-white ink">
            Open in Today →
          </Link>
        ) : (
          <button type="button" onClick={useForToday} className="press rounded-full ink px-5 py-2.5 font-bold">
            Use this trip in Japan
          </button>
        )}
      </div>
    </section>
  );
}
