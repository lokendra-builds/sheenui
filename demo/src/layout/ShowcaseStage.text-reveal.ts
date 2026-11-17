import type { Story } from "./ShowcaseStage";

/** The Text reveal stage's scene: "idle" the panel is at its top, "run" it scrolls to the end, "rest" it holds at the end with every word lit. */
export type TextRevealScene = { run: "idle" | "run" | "rest" };

/** A statement is dim, the panel scrolls and the words light up one by one, ending fully lit. */
const story: Story<TextRevealScene> = async ({ state, scene, wait }) => {
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
