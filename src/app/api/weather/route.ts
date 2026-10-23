import { z } from "zod";

const Q = z.object({ lat: z.coerce.number().min(20).max(50), lng: z.coerce.number().min(120).max(150) });

/** WMO weather codes → short words + whether it's wet. */
function describe(code: number): { text: string; wet: boolean } {
  if (code === 0) return { text: "Clear", wet: false };
  if (code <= 3) return { text: "Partly cloudy", wet: false };
  if (code <= 48) return { text: "Fog", wet: false };
  if (code <= 57) return { text: "Drizzle", wet: true };
  if (code <= 67) return { text: "Rain", wet: true };
  if (code <= 77) return { text: "Snow", wet: true };
  if (code <= 82) return { text: "Showers", wet: true };
  return { text: "Thunderstorm", wet: true };
}

/**
 * Live weather for a place in Japan (Open-Meteo, free, no key), cached 10 min.
 * Returns now + the rest of today's daytime hours, in Japan time.
 */
export async function GET(req: Request) {
  const q = Q.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!q.success) return Response.json({ error: "lat/lng required" }, { status: 400 });

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${q.data.lat}&longitude=${q.data.lng}` +
      "&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code" +
      "&timezone=Asia%2FTokyo&forecast_days=1";
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(String(res.status));
    const j = await res.json();
    const nowHour = Number(String(j.current.time).slice(11, 13));
    const hours = (j.hourly.time as string[])
      .map((t, i) => ({
        hour: Number(t.slice(11, 13)),
        temp: Math.round(j.hourly.temperature_2m[i]),
        rain: j.hourly.precipitation_probability[i] as number,
        ...describe(j.hourly.weather_code[i]),
      }))
      .filter((h) => h.hour >= Math.max(nowHour, 7) && h.hour <= 21);
    const now = { temp: Math.round(j.current.temperature_2m), ...describe(j.current.weather_code) };
    const wetHours = hours.filter((h) => h.wet || h.rain >= 50);
    return Response.json(
      {
        now,
        hours,
        rainy: now.wet || wetHours.length >= 2,
        rainFrom: wetHours[0]?.hour ?? null,
        localTime: String(j.current.time).slice(11, 16),
        source: "Open-Meteo",
      },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch {
    return Response.json({ error: "weather unavailable" }, { status: 502 });
  }
}
