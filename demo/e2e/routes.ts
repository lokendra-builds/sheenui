// Route list for the e2e specs: read from src/routes.ts and the per-group tables it imports from src/routes/
// as text (the same way the build scripts do), so a new route is swept the moment it is added and nothing is
// listed twice.

import { readFileSync } from "node:fs";

import type { Page } from "@playwright/test";

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
const index = read("routes.ts");
const source = [
  index,
  ...[...index.matchAll(/from "\.\/routes\/([\w-]+)"/g)].map((m) => read(`routes/${m[1]}.ts`)),
].join("\n");

/** Every routable path, in file order ("/" first). */
export const routePaths: string[] = [...source.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1] ?? "");

/** The URL to pass to `page.goto` (relative to the /sheenui/ baseURL). */
export function urlFor(path: string): string {
  return path === "/" ? "" : path.slice(1);
}

/** The three preference keys the demo reads from localStorage before first paint. */
export function preferenceScript(theme: "light" | "dark", style: "liquid" | "aurora", reducedMotion = false): string {
  const motion = reducedMotion ? `localStorage.setItem("sheen:motion","reduced");` : "";
  return `try{localStorage.setItem("sheen:theme","${theme}");localStorage.setItem("sheen:style","${style}");${motion}}catch(e){}`;
}

/**
 * Condition wait instead of a fixed sleep: resolves once fonts are ready, two frames have passed (so a state change has
 * been rendered) and no finite animation or transition has been running for `quietFrames` frames in a row. Infinite
 * loops (shimmers, ambient motion) are ignored. Rejects through `timeout` like any Playwright wait.
 */
export async function settle(page: Page, quietFrames = 6, timeout = 10_000): Promise<void> {
  await page.evaluate(
    ([frames, limit]) =>
      new Promise<void>((resolve) => {
        const deadline = performance.now() + limit;
        let quiet = 0;
        let seen = 0;
        const step = () => {
          seen += 1;
          const busy = document
            .getAnimations()
            .some((a) => a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0));
          quiet = busy ? 0 : quiet + 1;
          if ((seen >= 2 && quiet >= frames) || performance.now() > deadline) resolve();
          else requestAnimationFrame(step);
        };
        void document.fonts.ready.then(() => requestAnimationFrame(step));
      }),
    [quietFrames, timeout] as const,
  );
}
