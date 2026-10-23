import type { ReactNode } from "react";

/**
 * Ink-press entrance (CSS keyframes, so it runs on the compositor and never
 * leaves content invisible if JS is slow). Stagger with `delay` in seconds.
 */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`rise ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
