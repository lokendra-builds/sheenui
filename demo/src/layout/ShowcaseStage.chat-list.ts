import type { Story } from "./ShowcaseStage";

/** The Chat list stage's scene: how far the incoming message from Daniel has got (0 quiet, 1 typing, 2 arrived, 3 opened). */
export type ChatListScene = { step: 0 | 1 | 2 | 3 };

/** A quiet inbox, Daniel starts typing ("typing…" in his row), his message lands (unread badge, preview, row moves up), then it is opened and read. */
const story: Story<ChatListScene> = async ({ state, scene, wait }) => {
  await wait(900);
  scene({ step: 1 });
  state("working");
  await wait(1700);
  scene({ step: 2 });
  state("lit");
  await wait(1500);
  scene({ step: 3 });
  state("success");
  await wait(1400);
  state("idle");
};

export default story;
