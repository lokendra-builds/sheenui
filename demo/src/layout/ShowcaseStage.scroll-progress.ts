import type { Story } from "./ShowcaseStage";

/** The Scroll progress stage's scene: "idle" the panel is at its top, "run" it scrolls to the end, "rest" it holds at the end with a full bar. */
export type ScrollProgressScene = { run: "idle" | "run" | "rest" };

/** A reading panel at its top with an empty bar, it scrolls down and the bar fills. */
const story: Story<ScrollProgressScene> = async ({ state, scene, wait }) => {
  await wait(700);
  scene({ run: "run" });
  state("lit");
  await wait(3800);
  scene({ run: "rest" });
  state("success");
  await wait(1200);
  state("idle");
};

export default story;
