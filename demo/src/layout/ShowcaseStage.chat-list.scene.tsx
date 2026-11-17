import { useMemo } from "react";
import type { ChatConversation } from "@sheenui/theme";

import { DEMO_NOW_MS } from "../demo-clock";
import { useDemoNow } from "../demo-clock";
import { ME, PEOPLE, makeConversations } from "../pages/ChatPages/data";
import { ConversationList } from "../pages/ChatPages/lazy";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ChatListScene as ChatListSceneData } from "./ShowcaseStage.chat-list";

const SHOWN = ["c-riya", "c-design", "c-daniel", "c-trek", "c-priya"];

/** The live ConversationList on its stage: the story delivers one message and the row reacts (typing, preview, unread, read). */
export function ChatListScene({ scene }: { scene: ChatListSceneData; ctx: StageContext }) {
  const [step] = useFollow(scene.step);
  const now = useDemoNow();
  const conversations = useMemo<ChatConversation[]>(() => {
    const base = makeConversations().filter((c) => SHOWN.includes(c.id));
    return base.map((c) => {
      if (c.id !== "c-daniel") return c;
      const quiet = { ...c, typingIds: [], unreadCount: 0 };
      if (step === 0) return quiet;
      if (step === 1) return { ...quiet, typingIds: ["daniel"] };
      const last = {
        id: "c-daniel-new",
        senderId: "daniel",
        createdAt: DEMO_NOW_MS - 30_000,
        text: "Taking the S-Bahn into town now 🚆",
      };
      return { ...quiet, lastMessage: last, updatedAt: last.createdAt, unreadCount: step === 2 ? 1 : 0 };
    });
  }, [step]);
  return (
    <div className="h-[21rem] w-full overflow-hidden rounded-sheen-lg">
      <ConversationList
        headingLevel="none"
        title="Recent chats"
        conversations={conversations}
        participants={PEOPLE}
        currentUserId={ME}
        selectedId={step === 3 ? "c-daniel" : undefined}
        showFilters={false}
        now={now}
        locale="en-US"
      />
    </div>
  );
}
