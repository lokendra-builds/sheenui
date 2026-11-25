import type { Story } from "./ShowcaseStage";

/** The scene of the Button stage: what the story changes on the one live Button. */
export type ButtonScene = { loading: boolean; pressed: boolean; saved: boolean };

/** A press, then loading (the aura breathes), then success (green aura and a light sweep), then rest. */
const story: Story<ButtonScene> = async ({ state, scene, wait }) => {
  await wait(500);
  scene({ pressed: true });
  await wait(160);
  scene({ pressed: false, loading: true });
  state("working");
  await wait(1700);
  scene({ loading: false, saved: true });
  state("success");
  await wait(1600);
  scene({ saved: false });
  state("idle");
};

export default story;
