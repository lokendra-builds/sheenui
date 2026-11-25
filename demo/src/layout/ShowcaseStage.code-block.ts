import type { Story } from "./ShowcaseStage";

/** The Code block stage's scene: 0 the code, 1 the wrong line is marked, 2 the fix as a diff. */
export type CodeBlockScene = { phase: 0 | 1 | 2 };

/** A bug is marked in red, then the fix appears as a diff and the light turns green. */
const story: Story<CodeBlockScene> = async ({ state, scene, wait }) => {
  await wait(1100);
  scene({ phase: 1 });
  state("error");
  await wait(1500);
  scene({ phase: 2 });
  state("success");
  await wait(1200);
};

export default story;
