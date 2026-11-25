import type { Story } from "./ShowcaseStage";

/** The Vertical nav stage's scene: the active page and the Inbox badge count. */
export type VerticalScene = { page: "home" | "inbox" | "projects"; unread: number };

/** The highlight glides to Inbox, the unread badge clears as it is read, then it moves on to Projects. */
const story: Story<VerticalScene> = async ({ state, scene, wait }) => {
  await wait(900);
  state("working");
  scene({ page: "inbox" });
  await wait(1200);
  scene({ unread: 0 });
  await wait(800);
  scene({ page: "projects" });
  state("idle");
  await wait(1500);
  state("idle");
};

export default story;
