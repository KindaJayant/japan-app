"use client";

import { useRouter } from "next/navigation";
import { addTransitionType, startTransition } from "react";

/** History back (keeps scroll position) with a "back" slide; falls back to home on a cold open. */
export function BackLink({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() => {
          addTransitionType("nav-back");
          if (history.length > 1) router.back();
          else router.push("/");
        })
      }
      className={`press ink rounded-full bg-washi px-4 py-2 text-sm font-bold text-sumi ${className}`}
    >
      ← Back
    </button>
  );
}
