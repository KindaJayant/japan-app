"use client";

import Link from "next/link";

/** Last-resort boundary: never a blank screen on stage. Offline cards stay one tap away. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-6 pt-24 text-center">
      <p lang="ja" className="font-mincho text-6xl font-extrabold text-shu">失礼</p>
      <h1 className="display mt-4 text-3xl font-semibold">Something slipped.</h1>
      <p className="mt-2 text-sumi-soft">Your taxi cards, chef cards and manners guide still work offline.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="press rounded-full bg-[#2b2522] px-5 py-3 font-bold text-[#f6efe3] ink">
          Try again
        </button>
        <Link href="/manners" className="press rounded-full ink px-5 py-3 font-bold">
          Offline guides
        </Link>
      </div>
    </div>
  );
}
