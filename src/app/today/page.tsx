"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStored } from "@/lib/useStored";
import { JourneyMap } from "@/components/JourneyMap";
import { TRIP_KEY } from "@/components/ShareTrip";
import { DESTINATIONS, destinationById, type Destination } from "@/data/destinations";
import { haversineKm } from "@/lib/geo";
import type { VerifiedItinerary } from "@/lib/itinerary";
import { fmtMinutes, legBetween } from "@/lib/route";

interface Weather {
  now: { temp: number; text: string; wet: boolean };
  hours: { hour: number; temp: number; rain: number; text: string; wet: boolean }[];
  rainy: boolean;
  rainFrom: number | null;
  localTime: string;
}
type Day = { day: number; city: string; theme: string; stops: string[] };

/** Demo trip when nothing has been planned yet: the Golden Route, one region per day. */
const DEMO: Day[] = [
  { day: 1, city: "Tokyo", theme: "Old Tokyo & neon", stops: ["sensoji", "nakamuraya", "shibuya"] },
  { day: 2, city: "Fuji", theme: "The postcard view", stops: ["kawaguchiko"] },
  { day: 3, city: "Kyoto", theme: "Gold & bamboo", stops: ["kinkakuji", "arashiyama"] },
  { day: 4, city: "Kyoto", theme: "Gates & the wooden stage", stops: ["fushimi-inari", "kiyomizu"] },
  { day: 5, city: "Osaka", theme: "Deer, then street food", stops: ["todaiji", "dotonbori"] },
];


export default function Today() {
  const [trip] = useStored<VerifiedItinerary | null>(TRIP_KEY, null);
  const [dayIdx, setDayIdx] = useState(0);
  // Weather is keyed by place so switching days never shows the previous city's sky.
  const [weatherFor, setWeatherFor] = useState<{ key: string; data: Weather | null } | null>(null);
  const [you, setYou] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  const days: Day[] = trip?.itinerary.days ?? DEMO;
  const day = days[Math.min(dayIdx, days.length - 1)];
  const stops = day.stops.map(destinationById).filter((d): d is Destination => !!d);
  const anchor = stops[0] ?? DESTINATIONS.find((d) => d.city === day.city) ?? DESTINATIONS[0];

  const weatherKey = anchor.id;
  useEffect(() => {
    let live = true;
    fetch(`/api/weather?lat=${anchor.geo.lat}&lng=${anchor.geo.lng}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((data) => live && setWeatherFor({ key: weatherKey, data }));
    return () => {
      live = false;
    };
  }, [weatherKey, anchor.geo.lat, anchor.geo.lng]);
  const weather = weatherFor?.key === weatherKey ? weatherFor.data : null;

  const outdoor = stops.filter((s) => s.setting === "outdoor");
  const indoorNearby = DESTINATIONS.filter((d) => d.setting === "indoor" && !day.stops.includes(d.id))
    .map((d) => ({ d, km: haversineKm(d.geo, anchor.geo) }))
    .filter((x) => x.km < 60)
    .sort((a, b) => a.km - b.km)
    .slice(0, 2);

  const nearest = you ? DESTINATIONS.map((d) => ({ d, km: haversineKm(you, d.geo) })).sort((a, b) => a.km - b.km)[0] : null;

  function locate() {
    setLocError(null);
    if (!navigator.geolocation) return setLocError("Location isn't available on this device.");
    navigator.geolocation.getCurrentPosition(
      (p) => setYou({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocError("Couldn't get your location. Pick where you are from the list instead."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const rainQ = `It's raining in ${day.city} today (Day ${day.day}). Swap the outdoor stops (${outdoor.map((s) => s.name).join(", ")}) for indoor options and re-plan today.`;
  const offPlanQ = nearest
    ? `I'm off-plan: I'm near ${nearest.d.name} (${nearest.km.toFixed(1)} km away) on Day ${day.day}. Re-plan the rest of today and the remaining days from here.`
    : "";

  return (
    <div className="mx-auto max-w-2xl px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-end justify-between border-b-[1.5px] border-sumi pb-2">
        <h1 className="display text-4xl font-semibold">Today</h1>
        <span className="font-mincho text-sm font-extrabold text-sumi-soft">本日の旅</span>
      </header>

      {!trip && (
        <p className="mt-3 rounded-md bg-washi-deep px-3 py-2 text-sm">
          Showing a demo trip.{" "}
          <Link transitionTypes={["nav-forward"]} href="/plan" className="font-bold underline decoration-tokiha decoration-2 underline-offset-2">
            Design yours in the Trip Studio →
          </Link>
        </p>
      )}

      {/* Day picker */}
      <div role="tablist" aria-label="Trip day" className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {days.map((d, i) => (
          <button
            key={d.day}
            role="tab"
            aria-selected={i === dayIdx}
            onClick={() => setDayIdx(i)}
            className={`press shrink-0 rounded-xl ink px-3 py-1.5 text-left ${i === dayIdx ? "bg-sumi text-washi ink-shadow" : "bg-washi"}`}
          >
            <span className="block text-[11px] font-bold tracking-wide uppercase opacity-80">Day {d.day}</span>
            <span className="text-sm font-bold">{d.city}</span>
          </button>
        ))}
      </div>

      <h2 className="display mt-4 text-3xl leading-tight font-semibold">{day.theme}</h2>

      {/* Live weather */}
      <section className="on-pastel mt-4 flex items-center gap-4 rounded-xl bg-sora p-4 ink" aria-live="polite">
        {weather ? (
          <>
            <div className="text-center">
              <p className="display text-4xl font-semibold leading-none">{weather.now.temp}°</p>
              <p className="text-xs font-bold">{weather.now.text}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">
                Live in {day.city} · {weather.localTime} JST
              </p>
              <div className="mt-1 flex gap-1 overflow-x-auto [scrollbar-width:none]">
                {weather.hours.slice(0, 10).map((h) => (
                  <span key={h.hour} className="flex w-9 shrink-0 flex-col items-center text-[11px]">
                    <span className="font-bold">{h.hour}h</span>
                    <span className="relative mt-0.5 h-8 w-2.5 overflow-hidden rounded-full bg-white/60">
                      <span className="absolute inset-x-0 bottom-0 rounded-full bg-kon/70" style={{ height: `${h.rain}%` }} />
                    </span>
                    <span>{h.rain}%</span>
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm">Checking the sky over {day.city}…</p>
        )}
      </section>

      {weather && (
        <p className="mt-1 text-right text-[10px] text-sumi-soft">
          Weather data by{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">
            Open-Meteo.com
          </a>
        </p>
      )}

      {/* Rain plan */}
      {weather?.rainy && outdoor.length > 0 && (
        <section className="on-pastel mt-3 rounded-xl bg-yamabuki p-4 ink ink-shadow">
          <p className="display text-xl font-semibold">Rain plan ☂</p>
          <p className="mt-1 text-sm">
            {weather.now.wet ? "It's wet right now" : `Rain likely from ${weather.rainFrom}:00`}. {outdoor.map((s) => s.name).join(" and ")}{" "}
            {outdoor.length > 1 ? "are" : "is"} outdoors.
            {indoorNearby.length > 0 && ` Nearby indoor picks: ${indoorNearby.map((x) => `${x.d.name} (${Math.round(x.km)} km)`).join(", ")}.`} Konbini sell umbrellas for about ¥600.
          </p>
          <Link transitionTypes={["nav-forward"]} href={`/plan?q=${encodeURIComponent(rainQ)}`} className="press mt-3 inline-block rounded-full bg-sumi px-4 py-2 text-sm font-bold text-[#f6efe3] ink">
            Re-plan today for rain →
          </Link>
        </section>
      )}

      {/* Map */}
      <div className="mt-5">
        <JourneyMap stops={day.stops} routeKey={`today-${day.day}`} you={you} />
      </div>

      {/* Stops as a timetable */}
      <ol className="mt-5 border-t-[1.5px] border-sumi">
        {stops.map((s, i) => {
          const leg = i > 0 ? legBetween(stops[i - 1], s) : null;
          return (
            <li key={s.id}>
              {leg && (
                <p className="flex items-center gap-3 py-1.5 pl-[14px] text-xs text-sumi-soft">
                  <span className="h-6 border-l-2 border-dashed border-shu" aria-hidden />
                  {fmtMinutes(leg.minutes)} · {leg.km} km · {leg.how.split(".")[0]}
                </p>
              )}
              <div className="flex items-center gap-3 py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/photo/${s.id}?raw=1`} alt="" className="h-12 w-12 shrink-0 rounded-md bg-washi-deep object-cover ink" />
                <Link transitionTypes={["nav-forward"]} href={`/place/${s.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{s.name}</span>
                  <span className="text-xs text-sumi-soft">
                    {s.setting === "outdoor" ? "Outdoor" : "Indoor"} · ~{s.hours} h
                  </span>
                </Link>
                <Link transitionTypes={["nav-forward"]} href={`/taxi/${s.id}`} className="press shrink-0 rounded-full ink bg-yamabuki px-3 py-1.5 text-sm font-bold on-pastel">
                  Taxi card
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Off-plan */}
      <section className="on-pastel mt-6 rounded-xl bg-sakura p-4 ink ink-shadow">
        <p className="display text-xl font-semibold">Went off-plan?</p>
        {nearest ? (
          <p className="mt-1 text-sm">
            You&rsquo;re {nearest.km < 1 ? `${Math.round(nearest.km * 1000)} m` : `${nearest.km.toFixed(1)} km`} from <strong>{nearest.d.name}</strong>.
          </p>
        ) : (
          <p className="mt-1 text-sm">Share your location and Saathi re-plans the rest of the trip from where you actually are.</p>
        )}
        {locError && <p className="mt-1 text-sm font-bold text-bad">{locError}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {!nearest ? (
            <button type="button" onClick={locate} className="press rounded-full bg-sumi px-4 py-2 text-sm font-bold text-[#f6efe3] ink">
              Where am I?
            </button>
          ) : (
            <Link transitionTypes={["nav-forward"]} href={`/plan?q=${encodeURIComponent(offPlanQ)}`} className="press rounded-full bg-sumi px-4 py-2 text-sm font-bold text-[#f6efe3] ink">
              Re-plan from here →
            </Link>
          )}
          <Link transitionTypes={["nav-forward"]} href="/scan" className="press rounded-full ink bg-washi px-4 py-2 text-sm font-bold text-[#2b2522]">
            Check a label
          </Link>
        </div>
      </section>
    </div>
  );
}
