import type { Story } from "./ShowcaseStage";

/** The Color picker stage's scene: the chosen colour. */
export type ColorPickerScene = { color: string };

/** The accent the story starts from, and the ones it tries. */
export const COLOR_SWATCHES = ["#6d4aff", "#3b82f6", "#10b981", "#f59e0b"];

/** The colour is changed swatch by swatch, and the preview follows. */
const story: Story<ColorPickerScene> = async ({ state, scene, wait }) => {
  await wait(800);
  state("working");
  scene({ color: "#3b82f6" });
  await wait(900);
  scene({ color: "#f59e0b" });
  await wait(900);
  scene({ color: "#10b981" });
  state("lit");
};

export default story;
