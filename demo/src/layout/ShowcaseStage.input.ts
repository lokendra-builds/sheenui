import type { Story } from "./ShowcaseStage";

/** The Input stage's scene: the typed text and whether the field was left (so errors may show). */
export type InputScene = { value: string; touched: boolean };

/** The email a person types in the story. */
export const INPUT_DEMO_EMAIL = "maya@example.com";

/** Types an email, stops half-way so the error shows (red light), then finishes it and the field is valid (green). */
const story: Story<InputScene> = async ({ state, scene, wait }) => {
  await wait(800);
  for (let i = 1; i <= 10; i += 1) {
    scene({ value: INPUT_DEMO_EMAIL.slice(0, i) });
    await wait(85);
  }
  scene({ touched: true });
  state("error");
  await wait(1900);
  for (let i = 11; i <= INPUT_DEMO_EMAIL.length; i += 1) {
    scene({ value: INPUT_DEMO_EMAIL.slice(0, i) });
    await wait(110);
  }
  state("success");
  await wait(500);
};

export default story;
