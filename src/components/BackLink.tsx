"use client";

import { useRouter } from "next/navigation";

export function BackLink({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (history.length > 1 ? router.back() : router.push("/"))}
      className={`press ink rounded-full bg-washi px-4 py-2 text-sm font-bold text-sumi ${className}`}
    >
      ← Back
    </button>
  );
}
