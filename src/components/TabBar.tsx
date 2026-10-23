"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", ja: "旅", en: "Explore" },
  { href: "/scan", ja: "食", en: "Scan food" },
  { href: "/plan", ja: "計", en: "Trip studio" },
  { href: "/today", ja: "今", en: "Today" },
] as const;

/** Bottom navigation styled as a strip of rail tickets. Hidden on full-screen cards. */
export function TabBar() {
  const path = usePathname();
  if (path.startsWith("/taxi") || path.startsWith("/chef")) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2"
    >
      <ul className="mx-auto flex max-w-md gap-1.5 rounded-[14px] ink bg-washi p-1.5 ink-shadow">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" || path.startsWith("/place") : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center rounded-[9px] py-1.5 transition-colors ${
                  active ? "bg-sumi text-washi" : "text-sumi-soft hover:bg-washi-deep"
                }`}
              >
                <span className="font-mincho text-lg leading-none font-extrabold">{t.ja}</span>
                <span className="mt-1 text-[11px] font-bold tracking-wide">{t.en}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
