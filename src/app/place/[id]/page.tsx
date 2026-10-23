import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, destinationById } from "@/data/destinations";
import { ETIQUETTE, type EtiquetteContext } from "@/data/etiquette";
import { Poster } from "@/components/Poster";
import { ModelViewer } from "@/components/ModelViewer";
import { BackLink } from "@/components/BackLink";
import { Reveal } from "@/components/Reveal";

// Every page is prerendered from generateStaticParams, so blocking on params is fine.
export const instant = false;
export const generateStaticParams = () => DESTINATIONS.map((d) => ({ id: d.id }));

const KANJI_NUM = ["一", "二", "三", "四", "五", "六", "七", "八"];

export async function generateMetadata({ params }: PageProps<"/place/[id]">) {
  const d = destinationById((await params).id);
  return { title: d ? `${d.name} · Japan Saathi` : "Japan Saathi" };
}

export default async function Place({ params }: PageProps<"/place/[id]">) {
  const { id } = await params;
  const d = destinationById(id);
  if (!d) notFound();
  const rules = d.etiquette.flatMap((c) => ETIQUETTE[c as EtiquetteContext] ?? []).slice(0, 5);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Poster banner */}
      <div className="relative h-[52vh] max-h-[460px] overflow-hidden border-b-[1.5px] border-sumi">
        <Poster art={d.art} tone={d.tone} className="h-full w-full" />
        <div className="absolute inset-x-4 top-[max(env(safe-area-inset-top),14px)] flex items-center justify-between">
          <BackLink />
          <span className="eyebrow on-pastel rounded-full bg-[#fbf3e6] px-3 py-1 ink">{d.city}</span>
        </div>
        <span className="vertical-jp on-pastel absolute right-5 bottom-5 bg-[#fbf3e6] px-1.5 py-3 font-mincho text-2xl font-extrabold ink">{d.nameJa}</span>
      </div>

      <div className="px-4">
        <Reveal>
          <h1 className="display mt-6 text-4xl leading-tight font-semibold">{d.name}</h1>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-sumi-soft">{d.blurb}</p>
        </Reveal>

        {/* Taxi ticket */}
        <Reveal delay={0.06}>
          <Link href={`/taxi/${d.id}`} className="press ticket on-pastel mt-6 flex items-stretch bg-yamabuki">
            <span className="flex flex-1 flex-col justify-center px-5 py-4">
              <span className="eyebrow">Taxi card</span>
              <span lang="ja" className="font-mincho text-2xl font-extrabold">
                {d.nameJa}
              </span>
              <span className="text-sm opacity-80">Big Japanese card for the driver →</span>
            </span>
            <span className="flex w-20 items-center justify-center border-l-2 border-dashed border-[#2b252266] font-mincho text-4xl font-extrabold">
              車
            </span>
          </Link>
        </Reveal>

        {d.indiaLink && (
          <Reveal delay={0.1}>
            <figure className="on-pastel relative mt-6 rotate-[-0.8deg] bg-fuji p-5 ink ink-shadow">
              <span className="eyebrow">The India connection</span>
              <p className="display mt-2 text-xl leading-snug font-medium">{d.indiaLink}</p>
              <span aria-hidden className="absolute -top-3 -right-2 rounded-full bg-shu px-3 py-1 text-xs font-bold text-white ink">
                縁
              </span>
            </figure>
          </Reveal>
        )}

        {d.model && (
          <section className="mt-8">
            <h2 className="display mb-3 text-2xl font-semibold">See it before you go</h2>
            <ModelViewer src={`/models/${d.model}.glb`} alt={`3D model of ${d.name}`} />
            <p className="mt-2 text-xs text-sumi-soft">Tap &ldquo;View on your table&rdquo; on a phone to place it in your room.</p>
          </section>
        )}

        {d.funFact && (
          <p className="mt-8 border-l-4 border-tokiha pl-4 leading-relaxed">
            <span className="eyebrow block text-sumi-soft">Did you know</span>
            {d.funFact}
          </p>
        )}

        {rules.length > 0 && (
          <section className="mt-8">
            <h2 className="display text-2xl font-semibold">Manners here</h2>
            <ol className="mt-3 divide-y-[1.5px] divide-dashed divide-sumi-soft/40 border-y-[1.5px] border-sumi">
              {rules.map((r, i) => (
                <li key={r.do} className="flex gap-4 py-3">
                  <span className="w-6 shrink-0 font-mincho text-xl font-extrabold text-shu">{KANJI_NUM[i]}</span>
                  <span>
                    <span className="block font-bold leading-snug">{r.do}</span>
                    <span className="text-sm text-sumi-soft">{r.why}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <Link
          href={`/plan?q=${encodeURIComponent(`Plan a trip that includes ${d.name}`)}`}
          className="press ink ink-shadow mt-8 mb-4 block rounded-full bg-sumi px-5 py-3 text-center font-bold text-washi"
        >
          Plan a trip around {d.city} →
        </Link>
      </div>
    </div>
  );
}
