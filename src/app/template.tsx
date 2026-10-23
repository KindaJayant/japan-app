import type { ReactNode } from "react";
import { PageTransition } from "@/components/PageTransition";

/** Templates remount on every navigation, so each page gets enter/exit transitions. */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
