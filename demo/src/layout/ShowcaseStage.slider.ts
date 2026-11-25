import type { Story } from "./ShowcaseStage";

/** The Slider stage's scene: the brightness. */
export type SliderScene = { value: number };

/** The stage light that goes with a brightness value: dark at the bottom, warm at the top. */
export const lightFor = (value: number) => (value < 25 ? "off" : value < 60 ? "idle" : "lit");

/** The brightness slider glides from almost off to 85 and the stage light follows it. */
const story: Story<SliderScene> = async ({ state, scene, wait }) => {
  await wait(1000);
  for (let value = 10; value <= 85; value += 5) {
    scene({ value });
    state(lightFor(value));
    await wait(150);
  }
  await wait(800);
};

export default story;
