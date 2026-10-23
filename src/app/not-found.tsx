import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 pt-24 text-center">
      <p lang="ja" className="font-mincho text-6xl font-extrabold text-shu">迷子</p>
      <p className="eyebrow mt-2 text-sumi-soft">Maigo · lost</p>
      <h1 className="display mt-4 text-3xl font-semibold">This path isn&rsquo;t on the map.</h1>
      <p className="mt-2 text-sumi-soft">Even Tokyo station regulars get lost sometimes.</p>
      <Link href="/" className="press mt-6 inline-block rounded-full bg-[#2b2522] px-5 py-3 font-bold text-[#f6efe3] ink ink-shadow">
        Back to Explore
      </Link>
    </div>
  );
}
