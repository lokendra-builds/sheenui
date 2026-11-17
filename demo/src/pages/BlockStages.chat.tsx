import { useState } from "react";

import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import { press, type } from "../layout/ShowcaseStage.block.drive";
import { AppDemo } from "./ChatPages/app-demo";

/** The stage at the top of /blocks/chat-app: a chat is opened, a message is written and sent. */
export function ChatAppStage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <BlockStage
      label="Chat app demo"
      story="work"
      width={960}
      height={704}
      fit={640}
      fade
      actions={[press("Riya Sharma"), type("Message", "Lunch at one tomorrow?", 40), press("Send")]}
    >
      <AppDemo selected={selected} onSelectedChange={setSelected} />
    </BlockStage>
  );
}
ChatAppStage.isShowcaseStage = true;
