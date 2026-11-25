import type { Plugin } from "vite";

import type { SheenGraph } from "./sheen-closure.mjs";

export function scanThemeDeps(root: string, registryFile?: string): { files: string[]; graph: SheenGraph };

export function sheenDeps(themeSrc?: string, registryFile?: string): Plugin;
