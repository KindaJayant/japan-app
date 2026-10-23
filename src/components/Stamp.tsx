import type { Verdict } from "@/lib/diet/types";

const LOOK: Record<Verdict, { ja: string; en: string; color: string; rot: string }> = {
  safe: { ja: "安心", en: "Looks OK", color: "var(--ok)", rot: "-7deg" },
  unsure: { ja: "確認", en: "Ask staff", color: "var(--warn)", rot: "5deg" },
  avoid: { ja: "不可", en: "Avoid", color: "var(--bad)", rot: "-4deg" },
};

/** A rubber passport stamp. Double ring, kanji in the middle, slight rotation, ink texture. */
export function Stamp({ verdict, label, delay = 0 }: { verdict: Verdict; label: string; delay?: number }) {
  const l = LOOK[verdict];
  return (
    <div
      className="stamp-in relative grid h-[118px] w-[118px] place-items-center rounded-full"
      style={{ color: l.color, ["--rot" as string]: l.rot, animationDelay: `${delay}s` }}
      role="img"
      aria-label={`${label}: ${l.en}`}
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" result="n" />
            <feComponentTransfer in="n" result="m"><feFuncA type="discrete" tableValues="0 1 1 1 1 1" /></feComponentTransfer>
            <feComposite in="SourceGraphic" in2="m" operator="in" />
          </filter>
          <path id={`arc-${label}`} d="M 18 60 A 42 42 0 0 1 102 60" />
        </defs>
        <g filter="url(#rough)" fill="none" stroke="currentColor">
          <circle cx="60" cy="60" r="56" strokeWidth="3.5" />
          <circle cx="60" cy="60" r="48" strokeWidth="1.5" />
          <text fontSize="10.5" fontWeight="700" letterSpacing="2.5" fill="currentColor" stroke="none" style={{ fontFamily: "var(--font-fraunces)" }}>
            <textPath href={`#arc-${label}`} startOffset="50%" textAnchor="middle">
              {label.toUpperCase()}
            </textPath>
          </text>
          <text x="60" y="72" textAnchor="middle" fontSize="30" fill="currentColor" stroke="none" style={{ fontFamily: "var(--font-shippori)", fontWeight: 800 }}>
            {l.ja}
          </text>
          <text x="60" y="94" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1.5" fill="currentColor" stroke="none" style={{ fontFamily: "var(--font-zen-maru)" }}>
            {l.en.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
}
