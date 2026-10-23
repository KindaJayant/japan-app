"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { href: "/", ja: "旅", en: "Explore", match: (p: string) => p === "/" || p.startsWith("/place") },
  { href: "/scan", ja: "食", en: "Scan food", match: (p: string) => p.startsWith("/scan") },
  { href: "/plan", ja: "計", en: "Studio", match: (p: string) => p.startsWith("/plan") },
  { href: "/today", ja: "今", en: "Today", match: (p: string) => p.startsWith("/today") },
  { href: "/manners", ja: "礼", en: "Manners", match: (p: string) => p.startsWith("/manners") },
] as const;

/**
 * Bottom navigation. The ink pill slides to the tab you tap *immediately*
 * (optimistic), before the route finishes, and pages slide in the direction
 * of the tab. Hidden on full-screen cards.
 */
export function TabBar() {
  const path = usePathname();
  // Optimistic selection is only valid until the URL changes: keyed by the path it was set on.
  const [pending, setPending] = useState<{ from: string; idx: number } | null>(null);
  if (path.startsWith("/taxi") || path.startsWith("/chef")) return null;

  const routeIdx = TABS.findIndex((t) => t.match(path));
  const active = pending?.from === path ? pending.idx : routeIdx;

  return (
    <nav
      aria-label="Main"
      style={{ viewTransitionName: "tabbar" }}
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
    >
      <ul className="relative mx-auto flex max-w-md rounded-[14px] ink bg-washi p-1.5 ink-shadow">
        {active >= 0 && (
          <li
            aria-hidden
            className="absolute top-1.5 bottom-1.5 rounded-[9px] bg-sumi transition-[left] duration-300 ease-[cubic-bezier(.3,.9,.3,1)]"
            style={{ left: `calc(6px + (100% - 12px) * ${active} / ${TABS.length})`, width: `calc((100% - 12px) / ${TABS.length})` }}
          />
        )}
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <li key={t.href} className="relative flex-1">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                transitionTypes={routeIdx < 0 || i === routeIdx ? undefined : [i > routeIdx ? "tab-right" : "tab-left"]}
                onClick={() => {
                  if (i === routeIdx) return window.scrollTo({ top: 0, behavior: "smooth" }); // tap again: back to top
                  setPending({ from: path, idx: i });
                  navigator.vibrate?.(8);
                }}
                className={`flex flex-col items-center rounded-[9px] py-1.5 transition-colors duration-200 ${on ? "text-washi" : "text-sumi-soft hover:text-sumi"}`}
              >
                <span className={`font-mincho text-lg leading-none font-extrabold transition-transform duration-300 ${on ? "scale-110" : ""}`}>{t.ja}</span>
                <span className="mt-1 text-[10.5px] font-bold tracking-wide whitespace-nowrap">{t.en}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
