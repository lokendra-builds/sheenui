import type { Story } from "./ShowcaseStage";

/** The File upload stage's scene: whether the sample files have been dropped on the zone. */
export type FileUploadScene = { dropped: boolean };

/** Two files land on the zone, each gets its own progress bar and a done tick. */
const story: Story<FileUploadScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ dropped: true });
  state("working");
  await wait(2900);
  state("success");
};

export default story;
