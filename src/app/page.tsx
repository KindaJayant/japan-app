import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";
import { Poster } from "@/components/Poster";
import { Reveal } from "@/components/Reveal";

const COUNTERS = [
  {
    href: "/scan",
    no: "01",
    ja: "食",
    title: "Is this Jain?",
    body: "Point your camera at any Japanese label. We find hidden fish stock, gelatin, onion or mirin.",
    fill: "bg-sakura",
  },
  {
    href: "/plan",
    no: "02",
    ja: "計",
    title: "A trip that's checked",
    body: "Tell us who's coming. Saathi designs the days, and our checker verifies every meal, rupee and stair.",
    fill: "bg-mizu",
  },
  {
    href: "/today",
    no: "03",
    ja: "今",
    title: "On the ground",
    body: "Today's stops, live weather with a rain plan, taxi cards, and re-planning from wherever you are.",
    fill: "bg-yamabuki",
  },
] as const;

export default function Home() {
  const hero = DESTINATIONS[0];
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[max(env(safe-area-inset-top),16px)]">
      {/* Masthead */}
      <header className="flex items-center justify-between border-b-[1.5px] border-sumi pb-2">
        <span className="eyebrow">
          Japan Saathi<span className="hidden sm:inline"> · Tourist Bureau for Indian travellers</span>
        </span>
        <span className="font-mincho text-sm font-extrabold text-sumi-soft">観光案内所</span>
      </header>

      {/* Hero: asymmetric, poster on the right */}
      <section className="grid gap-6 pt-6 md:grid-cols-[1.25fr_1fr] md:items-end md:pt-10">
        <div className="relative">
          <Reveal>
            <h1 className="display text-[3.1rem] leading-[0.95] font-semibold sm:text-7xl">
              Japan,
              <br />
              without the
              <br />
              <em className="font-medium text-shu">guesswork.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 max-w-[34ch] text-[1.05rem] leading-relaxed text-sumi-soft">
              Know what&rsquo;s in your food, what to do at the shrine, and what the whole trip costs in rupees.
              Made for vegetarian, Jain and halal travellers.
            </p>
          </Reveal>
          <Reveal delay={0.14} className="mt-6 flex flex-wrap gap-3">
            <Link href="/scan" className="press ink ink-shadow rounded-full bg-sumi px-5 py-3 font-bold text-washi">
              Scan a label
            </Link>
            <Link href="/plan" className="press ink ink-shadow rounded-full bg-washi px-5 py-3 font-bold">
              Design my trip
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative mx-auto w-[78%] max-w-xs md:w-full">
          <Link href={`/place/${hero.id}`} className="block rotate-[1.5deg] transition-transform hover:rotate-0">
            <Poster art={hero.art} tone={hero.tone} className="w-full ink-shadow" />
            <span className="on-pastel absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <span className="display text-2xl leading-none font-semibold">Kyoto</span>
              <span className="eyebrow">See it in AR →</span>
            </span>
          </Link>
          <span
            aria-hidden
            className="vertical-jp absolute -left-9 top-2 font-mincho text-2xl font-extrabold text-shu md:-left-12 md:text-3xl"
          >
            安心の旅
          </span>
        </Reveal>
      </section>

      {/* Counters, as rail tickets */}
      <section className="mt-12" aria-labelledby="counters">
        <h2 id="counters" className="eyebrow mb-3 text-sumi-soft">
          Three counters, one companion
        </h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {COUNTERS.map((c, i) => (
            <li key={c.no}>
              <Reveal delay={i * 0.06}>
                <Link href={c.href} className={`press ticket on-pastel flex h-full ${c.fill}`}>
                  <span className="flex w-16 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-[#2b252266] py-4">
                    <span className="font-mincho text-3xl font-extrabold">{c.ja}</span>
                    <span className="mt-1 text-xs font-bold tracking-widest">{c.no}</span>
                  </span>
                  <span className="px-4 py-4">
                    <span className="display block text-xl font-semibold">{c.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed opacity-80">{c.body}</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Poster gallery */}
      <section className="mt-14" aria-labelledby="places">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="places" className="display text-3xl font-semibold">
            Where to?
          </h2>
          <span className="eyebrow text-sumi-soft">{DESTINATIONS.length} posters</span>
        </div>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
          {DESTINATIONS.map((d) => (
            <li key={d.id} className="w-[62%] max-w-[240px] shrink-0 snap-start">
              <Link href={`/place/${d.id}`} className="group block">
                <div className="relative">
                  <Poster art={d.art} tone={d.tone} className="w-full transition-transform group-hover:-translate-y-1" />
                  <span className="vertical-jp on-pastel absolute right-3 top-3 max-h-[85%] overflow-hidden bg-[#fbf3e6] px-1 py-2 font-mincho text-base font-extrabold ink">
                    {d.nameJa}
                  </span>
                </div>
                <p className="mt-2 font-bold leading-tight">{d.name}</p>
                <p className="eyebrow text-sumi-soft">{d.city}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* India–Japan connection */}
      <section className="mt-10">
        <Reveal>
          <figure className="on-pastel relative rotate-[-0.6deg] bg-fuji p-5 ink ink-shadow">
            <span className="eyebrow">India · Japan · 752 CE</span>
            <blockquote className="display mt-2 text-xl leading-snug font-medium sm:text-2xl">
              The eyes of Nara&rsquo;s Great Buddha were &lsquo;opened&rsquo; by Bodhisena, a monk from India.
            </blockquote>
            <figcaption className="mt-3 text-sm opacity-80">
              The connection is older than you think.{" "}
              <Link href="/place/todaiji" className="font-bold underline decoration-2 underline-offset-2">
                Visit Tōdai-ji →
              </Link>
            </figcaption>
            <span aria-hidden className="absolute -right-2 -top-3 rounded-full bg-shu px-3 py-1 text-xs font-bold text-white ink">
              縁 bond
            </span>
          </figure>
        </Reveal>
      </section>

      <footer className="mt-14 mb-4">
        <div className="seigaiha h-10 ink" aria-hidden />
        <p className="mt-3 text-center text-xs text-sumi-soft">
          Japan Saathi · Team Zero · Built for the Hakuhodo hackathon
        </p>
      </footer>
    </div>
  );
}
