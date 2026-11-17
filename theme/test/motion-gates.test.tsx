// Lens-2 motion gates (motion budget):
//   (a) only transform / opacity animate (plus theme/motion-exceptions.json), across a walk of components
//   (b) reduced motion: zero transform animations; anything left is <= 0.01 s or an opacity fade <= 150 ms
//   (d) every looping animation pauses while off-screen (useOffscreenLoops)
// The long-task / layout-shift gate (c) is the Playwright spec demo/e2e/motion-gates.spec.ts.

import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { useRef } from "react";

import { Progress } from "../src/components/progress/progress";
import { Skeleton } from "../src/components/skeleton/skeleton";
import { useOffscreenLoops } from "../src/motion/offscreen-loops";
import { SheenMotionProvider } from "../src/motion/provider";
import { frames } from "./helpers";
import {
  motionExceptions,
  offenders,
  recordAnimations,
  reducedViolations,
  scenarios,
  stillMoving,
  usedExceptions,
  type Scenario,
} from "./motion-gates-harness";
import { applyVariant, renderUi, variants } from "./render";

// The two looks differ only in backdrops and the hero, but their CSS differs: gate both.
const looks = [variants[0]!, variants[3]!];

async function walk(scenario: Scenario, reduced: boolean, look: (typeof looks)[number]) {
  if (reduced) document.documentElement.setAttribute("data-motion", "reduced");
  // Record from before the render, so animations that start on mount (a spinner, an entrance) are seen too.
  const recorder = recordAnimations();
  renderUi(scenario.ui, look);
  let seen: ReturnType<typeof recorder.stop>;
  try {
    await scenario.run();
  } finally {
    // Stopping in `finally` also covers a failing scenario; the recording is returned either way.
    seen = recorder.stop();
  }
  return seen;
}

describe("motion-exceptions.json", () => {
  it("is well formed: every entry names a component, a property and a reason", () => {
    for (const entry of motionExceptions) {
      expect(entry.component, JSON.stringify(entry)).toMatch(/^([a-z][a-z0-9-]*|\*)$/);
      expect(entry.property, JSON.stringify(entry)).toMatch(/^(--)?[a-z][a-z0-9-]*$/);
      expect(entry.reason.length, JSON.stringify(entry)).toBeGreaterThan(15);
    }
    // Entries are checked against the source by `pnpm motion:properties` (every file, no scenario needed); the ones
    // that carry a `file` must name a real source file.
    const sources = import.meta.glob("../src/**/*.{ts,tsx,css}", { query: "?raw", import: "default" });
    for (const entry of motionExceptions) {
      if (!entry.file || entry.file.startsWith("demo/")) continue;
      expect(`../${entry.file.replace(/^theme\//, "")}` in sources, `${entry.file} does not exist`).toBe(true);
    }
  });
});

for (const look of looks) {
  describe(`${look.theme} ${look.style}`, () => {
    for (const scenario of scenarios) {
      const label = `${scenario.component}: ${scenario.title}`;
      const gate = scenario.knownIssue ? it.fails : it;

      gate(`only compositor properties animate, ${label}`, async () => {
        const seen = await walk(scenario, false, look);
        expect(
          seen.length,
          `the ${label} walk should animate something (a vacuous pass hides a broken walk)`,
        ).toBeGreaterThan(0);
        expect(offenders(scenario.component, seen)).toEqual([]);
      });

      const reducedGate = scenario.knownReducedIssue ? it.fails : it;
      reducedGate(`reduced motion: no transform animation, ${label}`, async () => {
        const seen = await walk(scenario, true, look);
        expect(reducedViolations(seen)).toEqual([]);
        // JS-driven motion (Motion transforms, written positions) is invisible to getAnimations: sample boxes.
        expect(await stillMoving(), "elements still moving after the walk under reduced motion").toEqual([]);
      });
    }
  });
}

/** Runs after every walk above (tests in a file run in order): an entry nothing relied on is stale and must go. */
describe("motion-exceptions.json stays current", () => {
  it("every entry was needed by at least one scenario in this run", () => {
    // Under a name filter (`-t`) only some scenarios run, so nothing can be judged.
    if (usedExceptions.size === 0) return;
    // Entries that name a file are kept honest statically (`pnpm motion:properties` fails on a stale one); this runtime
    // check covers the wildcard entries, which no single file owns.
    const stale = motionExceptions
      .filter((e) => e.component === "*" && !usedExceptions.has(`${e.component}/${e.property}`))
      .map((e) => `${e.component}/${e.property}`);
    expect(stale, "exceptions no scenario animates any more: delete them from theme/motion-exceptions.json").toEqual(
      [],
    );
  });
});

/* ---------- (d) loops pause off-screen ---------- */

function Loops() {
  useOffscreenLoops();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div style={{ height: 4000 }} />
      <div ref={ref} data-testid="loops" className="flex flex-col gap-4">
        <Skeleton width={200} height={20} shimmer />
        <Progress value={null} label="Loading" />
        <div className="sheen-spinner size-5 rounded-full border-2" />
      </div>
      <div style={{ height: 4000 }} />
    </div>
  );
}

const infinite = () =>
  document
    .getAnimations()
    .filter(
      (a): a is CSSAnimation => a instanceof CSSAnimation && a.effect?.getComputedTiming().iterations === Infinity,
    );

describe("looping animations pause off-screen", () => {
  it("loops run while visible, pause once scrolled away, and resume on return", async () => {
    applyVariant(variants[0]!);
    window.scrollTo(0, 0);
    const { getByTestId } = render(<Loops />, { wrapper: SheenMotionProvider });
    const loops = getByTestId("loops");
    // Off-screen from the start: every infinite CSS animation ends up paused.
    await expect.poll(() => infinite().length).toBeGreaterThanOrEqual(3);
    await expect.poll(() => infinite().filter((a) => a.playState === "running")).toEqual([]);

    loops.scrollIntoView({ block: "center" });
    await expect
      .poll(() =>
        infinite()
          .filter((a) => a.playState !== "running")
          .map((a) => a.animationName),
      )
      .toEqual([]);

    window.scrollTo(0, 0);
    await frames(2);
    await expect.poll(() => infinite().filter((a) => a.playState === "running")).toEqual([]);
  });
});
