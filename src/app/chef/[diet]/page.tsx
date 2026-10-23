import { notFound } from "next/navigation";
import { CHEF_CARD } from "@/lib/diet/chefCard";
import { DIETS, DIET_LABEL, type Diet } from "@/lib/diet/types";
import { BackLink } from "@/components/BackLink";
import { Speak } from "@/components/Speak";

// Every page is prerendered from generateStaticParams, so blocking on params is fine.
export const instant = false;
export const generateStaticParams = () => DIETS.map((diet) => ({ diet }));

/** Full-screen card for restaurant staff. Fixed light colours: it must read well in any lighting. */
export default async function ChefCard({ params }: PageProps<"/chef/[diet]">) {
  const { diet } = await params;
  if (!DIETS.includes(diet as Diet)) notFound();
  const card = CHEF_CARD[diet as Diet];

  return (
    <div className="on-pastel fixed inset-0 z-[60] overflow-y-auto bg-[#fbf6ec] px-5 pt-[max(env(safe-area-inset-top),16px)] pb-10">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <BackLink />
        <span className="eyebrow">{DIET_LABEL[diet as Diet]} card</span>
      </div>

      <article className="mx-auto mt-6 max-w-2xl border-[3px] border-[#2b2522] bg-white p-6 shadow-[6px_6px_0_#2b2522] sm:p-10">
        <p className="font-mincho text-lg font-extrabold text-[#b8452c]">お店の方へ</p>
        <p className="mt-1 text-sm">To the restaurant staff</p>
        <p lang="ja" className="mt-6 font-mincho text-[1.6rem] leading-[1.9] font-extrabold sm:text-4xl sm:leading-[1.8]">
          {card.ja}
        </p>
        <Speak text={card.ja} label="Read it aloud" className="mt-5" />
        <hr className="my-6 border-dashed border-[#2b252266]" />
        <p className="text-base leading-relaxed">{card.en}</p>
      </article>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm opacity-70">
        Turn up the brightness and hand the phone over. Staff can point to the words.
      </p>
    </div>
  );
}
