import type { Story } from "./ShowcaseStage";

/** The Calendar stage's scene: the selected day as days after the demo's "today", or null. */
export type CalendarScene = { offset: number | null };

/** The selected-day pill glides from day to day. */
const story: Story<CalendarScene> = async ({ state, scene, wait }) => {
  await wait(800);
  scene({ offset: 4 });
  await wait(1100);
  state("working");
  scene({ offset: 9 });
  await wait(1300);
  scene({ offset: 17 });
  state("idle");
};

export default story;
