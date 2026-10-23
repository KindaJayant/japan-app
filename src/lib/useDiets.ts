"use client";

import { DIETS, type Diet } from "@/lib/diet/types";
import { useStored } from "./useStored";

const DEFAULT: Diet[] = ["jain"];
const isDiets = (v: unknown): v is Diet[] => Array.isArray(v) && v.every((d) => DIETS.includes(d));

/** The traveller's diets, remembered on this device and shared by the scanner and the Trip Studio. */
export function useDiets(): [Diet[], (d: Diet[]) => void] {
  return useStored<Diet[]>("saathi.diets", DEFAULT, isDiets);
}
