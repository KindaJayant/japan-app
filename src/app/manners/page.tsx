import { EMERGENCY, PHRASES, RITUALS } from "@/data/culture";
import { Speak } from "@/components/Speak";
import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Manners & phrases · Japan Saathi" };

const FILL = { sakura: "bg-sakura", mizu: "bg-mizu", matcha: "bg-matcha", yamabuki: "bg-yamabuki" } as const;

/** Culture companion: step-by-step visual guides, phrases with audio, emergency numbers. Works offline. */
export default function Manners() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <header className="flex items-end justify-between border-b-[1.5px] border-sumi pb-2">
        <h1 className="display text-4xl font-semibold">Manners</h1>
        <span className="font-mincho text-sm font-extrabold text-sumi-soft">作法と言葉</span>
      </header>
      <p className="mt-3 max-w-[40ch] text-[1.05rem] leading-relaxed text-sumi-soft">
        The unwritten rules, step by step. Nobody expects perfection; trying is what earns smiles.
      </p>

      <nav aria-label="Guides" className="mt-4 flex flex-wrap gap-2">
        {RITUALS.map((r) => (
          <a key={r.id} href={`#${r.id}`} className={`press rounded-full ink px-3 py-1.5 text-sm font-bold on-pastel ${FILL[r.tone]}`}>
            {r.title}
          </a>
        ))}
        <a href="#phrases" className="press rounded-full ink px-3 py-1.5 text-sm font-bold">
          Phrases
        </a>
        <a href="#help" className="press rounded-full ink bg-[#b8452c] px-3 py-1.5 text-sm font-bold text-white">
          Emergency
        </a>
      </nav>

      {RITUALS.map((r) => (
        <section key={r.id} id={r.id} className="mt-10 scroll-mt-4">
          <Reveal>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display text-3xl font-semibold">{r.title}</h2>
              <span lang="ja" className="shrink-0 font-mincho text-sm font-extrabold whitespace-nowrap text-sumi-soft">
                {r.ja}
              </span>
            </div>
            <p className="mt-1 text-sumi-soft">{r.intro}</p>
          </Reveal>
          {/* Swipeable step cards, like a rail ticket book */}
          <ol className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
            {r.steps.map((s, i) => (
              <li key={i} className={`on-pastel relative w-[72%] max-w-[260px] shrink-0 snap-start rounded-xl p-4 ink ink-shadow ${FILL[r.tone]}`}>
                <div className="flex items-start justify-between">
                  <span className="eyebrow">
                    Step {i + 1} / {r.steps.length}
                  </span>
                  <span
                    lang="ja"
                    className="grid h-14 w-14 rotate-[-6deg] place-items-center rounded-md border-[3px] border-[#b8452c] bg-[#fbf3e6] font-mincho text-3xl font-extrabold text-[#b8452c]"
                    aria-hidden
                  >
                    {s.seal}
                  </span>
                </div>
                <p className="mt-3 font-bold leading-snug">{s.do}</p>
                {s.tip && <p className="mt-2 text-sm opacity-80">{s.tip}</p>}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section id="phrases" className="mt-10 scroll-mt-4">
        <h2 className="display text-3xl font-semibold">Say it in Japanese</h2>
        <p className="mt-1 text-sumi-soft">Tap to hear it, or show the screen.</p>
        {PHRASES.map((g) => (
          <div key={g.group} className="mt-5">
            <h3 className="eyebrow text-sumi-soft">{g.group}</h3>
            <ul className="mt-2 divide-y-[1.5px] divide-dashed divide-sumi-soft/40 border-y-[1.5px] border-sumi">
              {g.items.map((p) => (
                <li key={p.ja} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p lang="ja" className="font-mincho text-lg leading-snug font-extrabold">
                      {p.ja}
                    </p>
                    <p className="text-sm">{p.romaji}</p>
                    <p className="text-sm text-sumi-soft">{p.en}</p>
                  </div>
                  <Speak text={p.ja} label="Play" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="help" className="mt-10 mb-6 scroll-mt-4 rounded-xl border-[3px] border-shu bg-washi p-5">
        <h2 className="display text-3xl font-semibold text-shu">Emergency</h2>
        <p className="mt-1 text-sm text-sumi-soft">Works offline. Tap to call.</p>
        <ul className="mt-3 space-y-2">
          {EMERGENCY.map((e) => (
            <li key={e.number}>
              <a href={`tel:${e.number.replace(/[^+\d]/g, "")}`} className="press flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-lg ink bg-washi-deep px-4 py-3">
                <span className="font-bold">{e.label}</span>
                <span className="display text-xl font-semibold whitespace-nowrap tabular-nums">{e.number}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
