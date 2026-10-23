import { notFound } from "next/navigation";
import { DESTINATIONS, destinationById } from "@/data/destinations";
import { BackLink } from "@/components/BackLink";
import { Speak } from "@/components/Speak";

// Every page is prerendered from generateStaticParams, so blocking on params is fine.
export const instant = false;
export const generateStaticParams = () => DESTINATIONS.map((d) => ({ id: d.id }));

/**
 * Zero-touch taxi card: the driver reads it from the front seat without
 * holding the phone. Huge kanji, high contrast, no UI chrome.
 */
export default async function TaxiCard({ params }: PageProps<"/taxi/[id]">) {
  const { id } = await params;
  const d = destinationById(id);
  if (!d) notFound();

  return (
    <div className="on-pastel fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white px-5 pt-[max(env(safe-area-inset-top),14px)] pb-6">
      <div className="flex items-center justify-between">
        <BackLink />
        <span className="eyebrow">Show the driver</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-6 landscape:flex-row landscape:items-center landscape:gap-10">
        <div className="landscape:flex-1">
          <p className="font-mincho text-xl font-extrabold text-[#b8452c]">運転手さんへ</p>
          <h1 lang="ja" className="mt-2 font-mincho text-[3.4rem] leading-[1.15] font-extrabold break-keep sm:text-7xl">
            {d.nameJa}
          </h1>
          <p lang="ja" className="mt-4 font-mincho text-[1.7rem] leading-snug font-extrabold sm:text-4xl">
            {d.taxi.ja}
          </p>
          <p lang="ja" className="mt-4 border-t-[3px] border-[#2b2522] pt-3 font-mincho text-xl font-extrabold sm:text-2xl">
            〒 {d.taxi.address}
          </p>
        </div>

        <aside className="mt-8 rounded-xl bg-[#f6efe3] p-4 landscape:mt-0 landscape:w-72">
          <p className="eyebrow">Say it</p>
          <p className="mt-1 text-lg font-bold">{d.taxi.romaji}</p>
          <Speak text={d.taxi.ja} label="Play for the driver" className="mt-2" />
          <p className="mt-1 text-sm opacity-75">{d.taxi.say}</p>
          <p className="mt-3 text-xs opacity-70">Don&rsquo;t touch the door: the driver opens it. Turn your phone sideways for a bigger card.</p>
        </aside>
      </div>
    </div>
  );
}
