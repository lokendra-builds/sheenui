import type { Story } from "./ShowcaseStage";

/** The Input group stage's scene: the typed address and whether it was copied. */
export type InputGroupScene = { text: string; copied: boolean };

const ADDRESS = "example.com/alex";

/** The address is typed between its prefix and suffix, then the attached button copies it. */
const story: Story<InputGroupScene> = async ({ state, scene, wait }) => {
  await wait(700);
  for (let i = 1; i <= ADDRESS.length; i += 1) {
    scene({ text: ADDRESS.slice(0, i) });
    await wait(80);
  }
  await wait(500);
  state("working");
  await wait(500);
  scene({ copied: true });
  state("success");
};

export default story;
