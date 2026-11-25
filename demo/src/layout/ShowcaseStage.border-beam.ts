import type { Story } from "./ShowcaseStage";

/** The Border beam stage's scene: "idle" no beam, "run" the beam circles, "rest" it holds still and the job is done. */
export type BorderBeamScene = { beam: "idle" | "run" | "rest" };

/** A plain card, a beam of light starts to run round its border while work happens, then it holds still when the work is done. */
const story: Story<BorderBeamScene> = async ({ state, scene, wait }) => {
  await wait(700);
  scene({ beam: "run" });
  state("working");
  await wait(3600);
  scene({ beam: "rest" });
  state("success");
  await wait(1200);
  state("idle");
};

export default story;
