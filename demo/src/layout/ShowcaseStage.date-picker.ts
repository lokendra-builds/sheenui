import type { Story } from "./ShowcaseStage";

/** The Date picker stage's scene: the chosen day as days after the demo's "today", or null. */
export type DatePickerScene = { offset: number | null };

/** A day is chosen and the field fills in with the formatted date and a confirmation under it. */
const story: Story<DatePickerScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  await wait(700);
  scene({ offset: 5 });
  state("idle");
};

export default story;
