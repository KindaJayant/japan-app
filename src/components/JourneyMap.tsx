"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { PREFECTURES } from "@/data/japanMap";
import { MAP_H, MAP_W, project } from "@/lib/geo";
import { fmtMinutes, legBetween, type Leg } from "@/lib/route";

type VB = [number, number, number, number];
const FULL: VB = [0, 0, MAP_W, MAP_H];

/** Fit a viewBox around points with padding, keeping the map's aspect ratio. */
function fit(points: [number, number][], minW = 90): VB {
  if (!points.length) return FULL;
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  let w = Math.max(Math.max(...xs) - Math.min(...xs), minW) * 1.5;
  let h = Math.max(Math.max(...ys) - Math.min(...ys), minW * 0.6) * 1.5;
  const aspect = 4 / 3.2;
  if (w / h > aspect) h = w / aspect; else w = h * aspect;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return [cx - w / 2, cy - h / 2, w, h];
}

/** Smoothly tween the viewBox (rAF; falls back to an instant jump if reduced motion). */
function useTweenedViewBox(target: VB): VB {
  const [vb, setVb] = useState<VB>(target);
  const from = useRef<VB>(target);
  useEffect(() => {
    const start = performance.now(), a = from.current, dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700;
    let raf = 0;
    const tick = (t: number) => {
      const k = dur ? Math.min(1, (t - start) / dur) : 1;
      const e = 1 - Math.pow(1 - k, 3);
      const next = a.map((v, i) => v + (target[i] - v) * e) as VB;
      setVb(next);
      from.current = next;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return vb;
}

function arc([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
  const bend = 0.22;
  return { d: `M${x1},${y1} Q${mx - dy * bend},${my + dx * bend} ${x2},${y2}`, mid: [mx - (dy * bend) / 2, my + (dx * bend) / 2] as [number, number] };
}

export interface JourneyMapProps {
  /** Ordered destination ids. Empty = just the explore map. */
  stops: string[];
  /** Change this to replay the drawing animation. */
  routeKey?: string;
  onPick?: (d: Destination) => void;
  /** Traveller's live position, drawn as a pulsing dot. */
  you?: { lat: number; lng: number } | null;
}

export function JourneyMap({ stops, routeKey, onPick, you }: JourneyMapProps) {
  const stopDest = useMemo(() => stops.map((id) => DESTINATIONS.find((d) => d.id === id)).filter((d): d is Destination => !!d), [stops]);
  const pts = useMemo(() => stopDest.map((d) => project(d.geo.lng, d.geo.lat)), [stopDest]);
  const legs: Leg[] = useMemo(() => stopDest.slice(1).map((s, i) => legBetween(stopDest[i], s)), [stopDest]);

  // Focus belongs to one route: a new routeKey starts unfocused without an effect.
  const [focusState, setFocusState] = useState<{ route?: string; id: string | null }>({ id: null });
  const focus = focusState.route === routeKey ? focusState.id : null;
  const setFocus = (id: string | null) => setFocusState({ route: routeKey, id });
  const focused = DESTINATIONS.find((d) => d.id === focus) ?? null;
  const target = useMemo<VB>(() => {
    if (focused) return fit([project(focused.geo.lng, focused.geo.lat)], 60);
    if (you && pts.length) return fit([...pts, project(you.lng, you.lat)]);
    return pts.length ? fit(pts) : fit(DESTINATIONS.map((d) => project(d.geo.lng, d.geo.lat)), 200);
  }, [focused, pts, you]);
  const vb = useTweenedViewBox(target);
  // One CSS pixel expressed in map units, so pins and labels stay the same size at any zoom.
  const boxRef = useRef<HTMLDivElement>(null);
  const [pxWidth, setPxWidth] = useState(360);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPxWidth(e.contentRect.width || 360));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const u = vb[2] / pxWidth;


  const pick = (d: Destination) => {
    setFocus(d.id);
    onPick?.(d);
  };
  const stopIndex = (id: string) => stopDest.findIndex((d) => d.id === id);

  return (
    <div className="relative" ref={boxRef}>
      <svg
        viewBox={vb.join(" ")}
        className="block w-full touch-manipulation ink bg-sora"
        style={{ aspectRatio: "4 / 3.2" }}
        role="img"
        aria-label={stopDest.length ? `Route: ${stopDest.map((d) => d.name).join(" → ")}` : "Map of Japan"}
        onClick={(e) => e.target === e.currentTarget && setFocus(null)}
      >
        <defs>
          <pattern id="waves" width={24 * u * 2} height={12 * u * 2} patternUnits="userSpaceOnUse">
            <path d={`M0 ${12 * u * 2} q${6 * u * 2} ${-8 * u * 2} ${12 * u * 2} 0 t${12 * u * 2} 0`} fill="none" stroke="#fbf3e6" strokeOpacity=".55" strokeWidth={1.4 * u} />
          </pattern>
        </defs>
        <rect x={vb[0] - 50} y={vb[1] - 50} width={vb[2] + 100} height={vb[3] + 100} fill="url(#waves)" />
        <g>
          {PREFECTURES.map((p) => (
            <path key={p.name} d={p.d} fill="#f6efe3" stroke="#2b2522" strokeOpacity=".22" strokeWidth={1.1 * u} strokeLinejoin="round" />
          ))}
        </g>

        {/* every curated place, faint */}
        {DESTINATIONS.filter((d) => stopIndex(d.id) < 0).map((d) => {
          const [x, y] = project(d.geo.lng, d.geo.lat);
          return (
            <g key={d.id} className="cursor-pointer" onClick={() => pick(d)}>
              <circle cx={x} cy={y} r={14 * u} fill="transparent" />
              <circle cx={x} cy={y} r={5 * u} fill="#fbf3e6" stroke="#2b2522" strokeWidth={1.6 * u} />
            </g>
          );
        })}

        {/* route legs, drawn in sequence */}
        <g key={routeKey}>
          {legs.map((l, i) => {
            const { d, mid } = arc(pts[i], pts[i + 1]);
            const screenLen = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) / u;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="#2b2522" strokeOpacity=".25" strokeWidth={6 * u} strokeLinecap="round" transform={`translate(${2 * u} ${2 * u})`} className="draw-leg" style={{ animationDelay: `${i * 0.45}s` }} pathLength={1} />
                <path d={d} fill="none" stroke="#d4573b" strokeWidth={5 * u} strokeLinecap="round" className="draw-leg" style={{ animationDelay: `${i * 0.45}s` }} pathLength={1} />
                <path d={d} fill="none" stroke="#fbf3e6" strokeWidth={1.6 * u} strokeDasharray={`${6 * u} ${6 * u}`} className="fade-in" style={{ animationDelay: `${i * 0.45 + 0.4}s` }} />
                {screenLen > 70 && (
                  <g className="fade-in" style={{ animationDelay: `${i * 0.45 + 0.35}s` }} transform={`translate(${mid[0]} ${mid[1]})`}>
                    <rect x={-46 * u} y={-12 * u} width={92 * u} height={24 * u} rx={12 * u} fill="#2b2522" />
                    <text textAnchor="middle" y={4.5 * u} fontSize={13 * u} fill="#f6efe3" fontWeight={700}>
                      {fmtMinutes(l.minutes)} · {Math.round(l.km)} km
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* numbered stops */}
        {stopDest.map((d, i) => {
          const [x, y] = pts[i];
          const active = focus === d.id;
          return (
            <g
              key={d.id + i}
              className="pop-in cursor-pointer"
              style={{ animationDelay: `${i * 0.45}s`, transformOrigin: `${x}px ${y}px` }}
              onClick={() => pick(d)}
             
              tabIndex={0}
              role="button"
              aria-label={`${i + 1}. ${d.name}`}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick(d)}
            >
              <circle cx={x} cy={y} r={(active ? 17 : 13) * u} fill={active ? "#d4573b" : "#fbf3e6"} stroke="#2b2522" strokeWidth={2.2 * u} />
              <text x={x} y={y + 4.6 * u} textAnchor="middle" fontSize={13 * u} fontWeight={800} fill={active ? "#fff" : "#2b2522"}>
                {i + 1}
              </text>
            </g>
          );
        })}

        {you && (() => {
          const [x, y] = project(you.lng, you.lat);
          return (
            <g aria-label="You are here">
              <circle cx={x} cy={y} r={16 * u} fill="#2b59c3" opacity=".25" className="animate-ping" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
              <circle cx={x} cy={y} r={7 * u} fill="#2b59c3" stroke="#fff" strokeWidth={2.5 * u} />
            </g>
          );
        })()}

        {/* compass */}
        <g transform={`translate(${vb[0] + vb[2] - 34 * u} ${vb[1] + 38 * u})`} opacity=".75">
          <circle r={18 * u} fill="#fbf3e6" stroke="#2b2522" strokeWidth={1.4 * u} />
          <path d={`M0 ${-14 * u} L${5 * u} 0 L0 ${14 * u} L${-5 * u} 0Z`} fill="#2b2522" />
          <path d={`M0 ${-14 * u} L${5 * u} 0 L${-5 * u} 0Z`} fill="#d4573b" />
          <text y={-22 * u} textAnchor="middle" fontSize={11 * u} fontWeight={800} fill="#2b2522">N</text>
        </g>
      </svg>

      {focused && <PhotoCard d={focused} vb={vb} stops={stopDest} legs={legs} onClose={() => setFocus(null)} />}
    </div>
  );
}

const photoCache = new Map<string, { src: string; page?: string } | null>();

function PhotoCard({ d, vb, stops, legs, onClose }: { d: Destination; vb: VB; stops: Destination[]; legs: Leg[]; onClose: () => void }) {
  // Keyed by place id: switching pins shows the loading state instead of the previous photo.
  const [loaded, setLoaded] = useState<{ id: string; photo: { src: string; page?: string } | null } | null>(null);
  useEffect(() => {
    if (photoCache.has(d.id)) return;
    let live = true;
    fetch(`/api/photo/${d.id}?v=2`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((j) => {
        photoCache.set(d.id, j);
        if (live) setLoaded({ id: d.id, photo: j });
      });
    return () => {
      live = false;
    };
  }, [d.id]);
  const photo = photoCache.has(d.id) ? photoCache.get(d.id) : loaded?.id === d.id ? loaded.photo : undefined;

  const [x, y] = project(d.geo.lng, d.geo.lat);
  const left = ((x - vb[0]) / vb[2]) * 100;
  const top = ((y - vb[1]) / vb[3]) * 100;
  const idx = stops.findIndex((s) => s.id === d.id);
  const arriving = idx > 0 ? legs[idx - 1] : null;

  return (
    <div
      className="rise absolute z-10 w-52 -translate-x-1/2 bg-[#fffaf0] p-2 pb-3 shadow-[3px_3px_0_#2b2522] ink on-pastel"
      style={{ left: `${Math.min(80, Math.max(20, left))}%`, top: top > 50 ? undefined : `calc(${top}% + 22px)`, bottom: top > 50 ? `calc(${100 - top}% + 22px)` : undefined }}
    >
      <button type="button" onClick={onClose} aria-label="Close" className="absolute -top-3 -right-3 grid h-7 w-7 place-items-center rounded-full bg-sumi text-sm font-bold text-washi ink">
        ×
      </button>
      <div className="aspect-[4/3] overflow-hidden bg-[#ede3d1]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={d.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full ${photo === undefined ? "animate-pulse" : ""}`} />
        )}
      </div>
      <p className="mt-2 px-1 leading-tight font-bold">{d.name}</p>
      <p lang="ja" className="px-1 font-mincho text-sm font-extrabold opacity-70">
        {d.nameJa}
      </p>
      {arriving && (
        <p className="mt-1 px-1 text-xs">
          From stop {idx}: <strong>{fmtMinutes(arriving.minutes)}</strong> · {arriving.km} km · {arriving.how.split(".")[0]}
        </p>
      )}
      <div className="mt-2 flex gap-2 px-1 text-xs font-bold">
        <Link href={`/place/${d.id}`} className="underline decoration-tokiha decoration-2 underline-offset-2">
          Details
        </Link>
        <Link href={`/taxi/${d.id}`} className="underline decoration-tokiha decoration-2 underline-offset-2">
          Taxi card
        </Link>
        {photo?.page && (
          <a href={photo.page} target="_blank" rel="noreferrer" className="ml-auto font-normal opacity-60">
            Photo: Wikimedia
          </a>
        )}
      </div>
    </div>
  );
}
