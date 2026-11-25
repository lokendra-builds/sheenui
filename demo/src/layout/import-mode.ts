import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Which import path the docs' code samples show: the `@sheenui/theme` package barrel, or the files the shadcn CLI
 * copies into the app (`@/components/sheenui/<folder>/<file>`, there is no barrel in a copied install). One choice for the
 * whole site, remembered in localStorage.
 */
export type ImportMode = "package" | "files";

const KEY = "sheen:import-mode";
/** The package is not on npm yet, so the samples show the paths a copied (shadcn CLI) install has until it is published. */
const DEFAULT_MODE: ImportMode = "files";
const listeners = new Set<() => void>();
let mode: ImportMode = DEFAULT_MODE;
let loaded = false;

function readStored(): ImportMode {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "files" || stored === "package" ? stored : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    const stored = readStored();
    if (stored !== mode) {
      mode = stored;
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
  }
  return () => listeners.delete(listener);
}

function setMode(next: ImportMode) {
  mode = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* private mode: the choice just lasts for this visit */
  }
  listeners.forEach((l) => l());
}

/** The shared import mode and its setter. Server and first client render always use the default ("files"), so hydration matches. */
export function useImportMode(): [ImportMode, (next: ImportMode) => void] {
  return [
    useSyncExternalStore(
      subscribe,
      () => mode,
      () => DEFAULT_MODE,
    ),
    setMode,
  ];
}

/** Does this sample import from the package (so the toggle means something)? */
export const importsPackage = (code: string) => /from\s+"@sheenui\/theme(?:\/demo-data)?"/.test(code);

/** Packages a reader already has with SheenUI (React and the library's own dependencies): never listed as "also needs". */
const OWN_PACKAGES = new Set(["react", "react-dom", "motion", "@base-ui/react", "@sheenui/theme"]);

/** The third-party npm packages a sample imports beyond React and SheenUI's own dependencies (for example `lucide-react`), in order of appearance. */
export function extraPackages(code: string): string[] {
  const found: string[] = [];
  for (const match of code.matchAll(/(?:from|import)\s+"([^"./][^"]*)"/g)) {
    const spec = match[1] ?? "";
    const parts = spec.split("/");
    const name = spec.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? "");
    if (name && !OWN_PACKAGES.has(name) && !found.includes(name)) found.push(name);
  }
  return found;
}

/** The sample as the chosen import mode shows it. The path table (73 KB) is only fetched when "Copied files" is picked. */
export function useImportedCode(code: string, mode: ImportMode): string {
  const [rewrite, setRewrite] = useState<((code: string) => string) | null>(null);
  const wanted = mode === "files" && importsPackage(code);
  useEffect(() => {
    if (!wanted || rewrite) return;
    let live = true;
    void import("./import-rewrite").then((m) => live && setRewrite(() => m.rewriteWithInstallPaths));
    return () => {
      live = false;
    };
  }, [wanted, rewrite]);
  return wanted && rewrite ? rewrite(code) : code;
}
