import { useMemo } from "react";
import type { ChatConversation, ChatMessage } from "@sheenui/theme";

import { DEMO_NOW_MS, useDemoNow } from "../demo-clock";
import { ME, PEOPLE, initialMessages, makeConversations } from "../pages/ChatPages/data";
import { ChatThread } from "../pages/ChatPages/lazy";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ChatThreadScene as ChatThreadSceneData } from "./ShowcaseStage.chat-thread";

/** The live ChatThread on its stage: the last few messages of one chat; the story sends one and Riya answers. */
export function ChatThreadScene({ scene }: { scene: ChatThreadSceneData; ctx: StageContext }) {
  const [step] = useFollow(scene.step);
  const now = useDemoNow();
  const base = useMemo(() => (initialMessages()["c-riya"] ?? []).slice(-4), []);
  const conversation = useMemo<ChatConversation | undefined>(
    () => makeConversations().find((c) => c.id === "c-riya"),
    [],
  );
  const messages = useMemo<ChatMessage[]>(() => {
    const out = [...base];
    if (step >= 1) {
      out.push({
        id: "stage-mine",
        senderId: ME,
        createdAt: DEMO_NOW_MS - 20_000,
        text: "Perfect, see you at 4!",
        status: step === 1 ? "sending" : step === 2 ? "sent" : "read",
      });
    }
    if (step >= 4) {
      out.push({ id: "stage-reply", senderId: "riya", createdAt: DEMO_NOW_MS - 5_000, text: "See you there 🙌" });
    }
    return out;
  }, [base, step]);
  if (!conversation) return null;
  return (
    <ChatThread
      headingLevel="none"
      conversation={{ ...conversation, title: "Riya S.", unreadCount: 0, typingIds: step === 3 ? ["riya"] : [] }}
      messages={messages}
      participants={PEOPLE}
      currentUserId={ME}
      now={now}
      locale="en-US"
      className="h-[26rem] w-full"
    />
  );
}
