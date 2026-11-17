import type { Story } from "./ShowcaseStage";
import { tween } from "./ShowcaseStage.tween";

/** The Meter stage's scene: percent of storage used. */
export type MeterScene = { value: number };

/** Storage fills: the bar is accent, turns amber past 70% and red past 90%, and the light follows it. */
const story: Story<MeterScene> = async ({ state, scene, wait, reduced }) => {
  await wait(900);
  let level = "";
  await tween(wait, reduced, 38, 95, 2400, (value) => {
    scene({ value: Math.round(value) });
    const next = value >= 90 ? "error" : value >= 70 ? "warning" : "working";
    if (next !== level) {
      level = next;
      state(next);
    }
  });
  state("error");
  await wait(1300);
};

export default story;
