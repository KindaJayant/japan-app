import type { Art, Tone } from "@/data/destinations";

/**
 * Flat, screen-printed travel-poster scenes drawn in SVG: no stock photos and
 * no AI imagery. Each scene has sky, sun, two hill layers and a landmark.
 * Colours are fixed pastel inks so posters look the same in light and dark mode.
 */
const TONES: Record<Tone, { sky: string; far: string; near: string }> = {
  sakura: { sky: "#f4cfc8", far: "#e9b5ad", near: "#d9968c" },
  yamabuki: { sky: "#f3dea4", far: "#e8c47a", near: "#c99b4f" },
  tokiha: { sky: "#f6c7ba", far: "#eca695", near: "#cf8070" },
  matcha: { sky: "#dde7c4", far: "#c0d19c", near: "#90ab70" },
  sora: { sky: "#cbe0ea", far: "#aac7d6", near: "#80a2b8" },
  fuji: { sky: "#ddd3ea", far: "#c4b5db", near: "#9d8ec0" },
  mizu: { sky: "#cfe6e1", far: "#abd0c8", near: "#80afa7" },
};

const INK = "#2b2522";
const SHU = "#d4573b";
const KON = "#24324a";
const GOLD = "#e2b33c";
const CREAM = "#fbf3e6";

export function Poster({ art, tone, className }: { art: Art; tone: Tone; className?: string }) {
  const t = TONES[tone];
  return (
    <svg viewBox="0 0 300 400" className={className} role="img" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="400" fill={t.sky} />
      {/* sun with print-offset ring */}
      <circle cx="205" cy="120" r="58" fill={CREAM} />
      <circle cx="205" cy="120" r="58" fill="none" stroke={INK} strokeOpacity=".12" strokeWidth="1.5" transform="translate(3 3)" />
      {/* distant Fuji-like ridge */}
      <path d="M-10 260 L70 205 Q95 188 120 205 L190 250 L240 230 L310 255 L310 400 L-10 400Z" fill={t.far} />
      <path d="M60 212 Q95 186 130 212 L118 214 L108 207 L96 215 L84 208 L72 215Z" fill={CREAM} />
      <Landmark art={art} />
      {/* foreground hill */}
      <path d="M-10 330 Q80 300 160 322 T310 318 L310 400 L-10 400Z" fill={t.near} />
      {/* poster frame */}
      <rect x="8" y="8" width="284" height="384" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

function Landmark({ art }: { art: Art }) {
  switch (art) {
    case "torii":
    case "sea-torii":
      return (
        <g>
          {art === "sea-torii" && (
            <g>
              <rect x="-10" y="300" width="320" height="100" fill="#9cc9c0" />
              {[312, 326, 340].map((y) => (
                <path key={y} d={`M0 ${y} q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0`} stroke={CREAM} strokeWidth="2" fill="none" />
              ))}
            </g>
          )}
          <rect x="98" y="168" width="13" height="150" fill={SHU} />
          <rect x="189" y="168" width="13" height="150" fill={SHU} />
          <rect x="88" y="188" width="124" height="10" fill={SHU} />
          <rect x="144" y="160" width="12" height="28" fill={SHU} />
          <path d="M70 150 Q150 166 230 150 L234 140 Q150 156 66 140Z" fill={INK} />
          <rect x="80" y="160" width="140" height="9" fill={SHU} />
          <rect x="95" y="310" width="19" height="10" fill={INK} />
          <rect x="186" y="310" width="19" height="10" fill={INK} />
        </g>
      );
    case "pavilion":
      return (
        <g>
          <rect x="40" y="306" width="220" height="40" fill="#8fbcb4" />
          <rect x="95" y="262" width="110" height="44" fill="#6b4a2b" />
          <rect x="95" y="272" width="110" height="18" fill={CREAM} />
          <path d="M80 262 L220 262 L204 250 L96 250Z" fill={KON} />
          <rect x="104" y="214" width="92" height="36" fill={GOLD} />
          <path d="M90 214 L210 214 L196 202 L104 202Z" fill={KON} />
          <rect x="120" y="172" width="60" height="30" fill={GOLD} />
          <path d="M106 172 L194 172 L150 140Z" fill={KON} />
          <rect x="147" y="128" width="6" height="12" fill={GOLD} />
          {/* reflection */}
          <rect x="104" y="314" width="92" height="6" fill={GOLD} opacity=".45" />
          <rect x="120" y="326" width="60" height="4" fill={GOLD} opacity=".3" />
        </g>
      );
    case "pagoda":
      return (
        <g fill={KON}>
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 300 - i * 32;
            const w = 92 - i * 12;
            return (
              <g key={i}>
                <rect x={150 - w / 4} y={y - 18} width={w / 2} height="20" fill={SHU} />
                <path d={`M${150 - w / 2 - 10} ${y - 18} L${150 + w / 2 + 10} ${y - 18} L${150 + w / 4} ${y - 30} L${150 - w / 4} ${y - 30}Z`} />
              </g>
            );
          })}
          <rect x="148" y="118" width="4" height="52" fill={GOLD} />
          <rect x="140" y="304" width="20" height="18" fill={SHU} />
        </g>
      );
    case "hall":
      return (
        <g>
          <rect x="60" y="270" width="180" height="50" fill={CREAM} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={66 + i * 24} y="270" width="6" height="50" fill="#6b4a2b" />
          ))}
          <path d="M36 270 L264 270 L232 244 L68 244Z" fill={KON} />
          <rect x="86" y="226" width="128" height="18" fill="#6b4a2b" />
          <path d="M52 226 L248 226 L206 192 L94 192Z" fill={KON} />
          <rect x="92" y="180" width="10" height="14" fill={GOLD} />
          <rect x="198" y="180" width="10" height="14" fill={GOLD} />
        </g>
      );
    case "bamboo":
      return (
        <g>
          {[30, 62, 88, 120, 148, 182, 210, 240, 268].map((x, i) => (
            <g key={x}>
              <rect x={x} y={i % 2 ? 40 : 20} width={i % 3 ? 12 : 16} height="320" fill={i % 2 ? "#5f8a4a" : "#77a05c"} />
              {[90, 150, 210, 270].map((y) => (
                <rect key={y} x={x - 1} y={y + (i % 2) * 14} width={i % 3 ? 14 : 18} height="3" fill={INK} opacity=".35" />
              ))}
            </g>
          ))}
          <path d="M100 340 Q150 300 200 340Z" fill="#c9b48a" />
        </g>
      );
    case "lantern":
      return (
        <g>
          <path d="M40 120 L260 120 L250 104 L50 104Z" fill={KON} />
          <rect x="52" y="120" width="14" height="210" fill={SHU} />
          <rect x="234" y="120" width="14" height="210" fill={SHU} />
          <rect x="140" y="124" width="20" height="8" fill={INK} />
          <rect x="100" y="132" width="100" height="12" rx="3" fill={INK} />
          <ellipse cx="150" cy="210" rx="64" ry="72" fill={SHU} />
          {[160, 180, 240, 260].map((y) => (
            <path key={y} d={`M${150 - Math.sqrt(1 - ((y - 210) / 72) ** 2) * 64} ${y} H${150 + Math.sqrt(1 - ((y - 210) / 72) ** 2) * 64}`} stroke={INK} strokeOpacity=".25" strokeWidth="2" />
          ))}
          <rect x="112" y="186" width="76" height="48" fill={INK} />
          <text x="150" y="222" textAnchor="middle" fontSize="30" fill={CREAM} style={{ fontFamily: "var(--font-shippori), serif", fontWeight: 800 }}>雷門</text>
          <rect x="112" y="276" width="76" height="12" rx="3" fill={INK} />
        </g>
      );
    case "bowl":
      return (
        <g>
          {[120, 150, 180].map((x) => (
            <path key={x} d={`M${x} 236 q-10 -18 0 -36 t0 -36`} stroke={CREAM} strokeWidth="5" fill="none" strokeLinecap="round" />
          ))}
          <ellipse cx="150" cy="250" rx="96" ry="16" fill="#c98a2e" />
          <path d="M54 250 Q150 350 246 250Z" fill={CREAM} />
          <path d="M54 250 Q150 350 246 250" stroke={KON} strokeWidth="6" fill="none" />
          <path d="M70 262 H230" stroke={KON} strokeWidth="3" />
          <ellipse cx="190" cy="246" rx="34" ry="8" fill="#fffaf0" />
          <text x="150" y="384" textAnchor="middle" fontSize="15" fill={INK} letterSpacing="4" style={{ fontFamily: "var(--font-fraunces), serif" }}>EST. 1927</text>
        </g>
      );
    case "city":
      return (
        <g>
          {[
            [24, 150, 46], [74, 186, 40], [118, 128, 52], [176, 170, 44], [224, 140, 56],
          ].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={330 - y} fill={i % 2 ? KON : "#3b4c6b"} />
              {Array.from({ length: Math.floor((310 - y) / 22) }).map((_, r) => (
                <rect key={r} x={x + 8} y={y + 12 + r * 22} width={w - 16} height="6" fill={i % 2 ? "#f3dea4" : CREAM} opacity=".8" />
              ))}
            </g>
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={20 + i * 30} y="342" width="16" height="44" fill={CREAM} />
          ))}
        </g>
      );
    case "fuji":
      return (
        <g>
          <path d="M-10 300 L120 140 Q150 112 180 140 L310 300Z" fill="#7d9bb5" />
          <path d="M120 140 Q150 112 180 140 L196 160 L178 154 L166 166 L150 152 L134 166 L122 154 L104 160Z" fill={CREAM} />
          <rect x="-10" y="296" width="320" height="104" fill="#9cc2d4" />
          <path d="M40 300 L150 170 L260 300Z" fill="#7d9bb5" opacity=".35" transform="matrix(1 0 0 -0.45 0 435)" />
          <g transform="translate(232 196)">
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={-10 + i * 1.5} y={92 - i * 20} width={20 - i * 3} height="12" fill={SHU} />
                <path d={`M${-18 + i * 2.4} ${92 - i * 20} H${18 - i * 2.4} L${11 - i * 2} ${84 - i * 20} H${-11 + i * 2}Z`} fill={KON} />
              </g>
            ))}
            <rect x="-1" y="0" width="2" height="16" fill={GOLD} />
          </g>
          {[60, 84, 104].map((x, i) => (
            <circle key={x} cx={x} cy={292 - i * 4} r={18 - i * 3} fill="#f4cfc8" />
          ))}
        </g>
      );
    case "neon":
      return (
        <g>
          <rect x="20" y="150" width="70" height="180" fill={KON} />
          <rect x="96" y="110" width="80" height="220" fill="#3b4c6b" />
          <rect x="182" y="160" width="96" height="170" fill={KON} />
          <rect x="30" y="170" width="50" height="70" fill="#ee9a8b" />
          <rect x="108" y="128" width="56" height="44" fill="#cbe0ea" />
          <circle cx="136" cy="220" r="26" fill={GOLD} />
          <rect x="196" y="176" width="68" height="30" fill="#f4cfc8" />
          <rect x="196" y="216" width="68" height="30" fill="#cfe6e1" />
          <rect x="-10" y="330" width="320" height="70" fill="#7d6fa8" />
          <path d="M0 352 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke={GOLD} strokeWidth="2" fill="none" opacity=".7" />
        </g>
      );
  }
}
