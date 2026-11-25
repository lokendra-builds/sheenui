import type { Story } from "./ShowcaseStage";

/** The Confetti stage's scene: "idle" ready to order, "run" the order is placed and confetti bursts, "rest" the order is confirmed. */
export type ConfettiScene = { run: "idle" | "run" | "rest" };

/** An order button, then it is pressed and confetti bursts from it, then the order stays confirmed. */
const story: Story<ConfettiScene> = async ({ state, scene, wait }) => {
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
