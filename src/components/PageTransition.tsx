import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each page's content. Navigation direction is encoded by the link that
 * started it (transitionTypes): deeper = slide left, back = slide right,
 * tab bar = slide toward the tab you picked. Untyped navigations (browser
 * back, refresh) don't animate. The tab bar lives in the layout, so it stays put.
 */
const MAP = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  "tab-right": "nav-forward",
  "tab-left": "nav-back",
  default: "none",
} as const;

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={MAP} exit={MAP} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}

/** Shared element: the same poster morphs between the gallery and the place page. */
export function PosterMorph({ id, children }: { id: string; children: ReactNode }) {
  return (
    <ViewTransition name={`poster-${id}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
