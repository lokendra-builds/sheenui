import type { Story } from "./ShowcaseStage";

/** The Button group stage's scene: the selected range. */
export type ButtonGroupScene = { range: "day" | "week" | "month" };

/** Day, then Week, then Month: one joined control, one selection. */
const story: Story<ButtonGroupScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  state("working");
  scene({ range: "week" });
  await wait(1500);
  scene({ range: "month" });
  state("idle");
  await wait(1500);
};

export default story;
