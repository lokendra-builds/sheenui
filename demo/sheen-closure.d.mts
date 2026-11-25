export type SheenGraph = {
  f: string[];
  e: number[][];
  p: number[][];
  pn: string[];
  i: number[];
  in: string[];
  rd: Record<string, string[]>;
};
export const MANY_ITEMS: number;
export function resolveCopyList(
  graph: SheenGraph,
  sources: string[],
): { units: string[]; files: string[]; packages: string[]; items: string[] };
