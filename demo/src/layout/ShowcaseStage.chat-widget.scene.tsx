import { useMemo } from "react";
import type { ChatConversation, ChatMessage } from "@sheenui/theme";

import { DEMO_NOW_MS, useDemoNow } from "../demo-clock";
import { ME, PEOPLE } from "../pages/ChatPages/data";
import { ChatWidget } from "../pages/ChatPages/lazy";
import { useFollow } from "./ShowcaseStage.follow";
import type { StageContext } from "./ShowcaseStage";
import type { ChatWidgetScene as ChatWidgetSceneData } from "./ShowcaseStage.chat-widget";

const T = DEMO_NOW_MS;
const SEED: ChatMessage[] = [
  {
    id: "w1",
    senderId: ME,
    createdAt: T - 3_600_000,
    text: "The date picker doesn't open on Safari 17",
    status: "read",
  },
  {
    id: "w2",
    senderId: "leo",
    createdAt: T - 3_000_000,
    text: "Thanks for the report! Can you try the latest version? We shipped a fix this morning 🛠️",
  },
];

/** The live ChatWidget on its stage: a launcher with an unread badge, the panel, a conversation, a reply and the team's answer. */
export function ChatWidgetScene({ scene }: { scene: ChatWidgetSceneData; ctx?: StageContext }) {
  const [step, setStep] = useFollow(scene.step);
  const now = useDemoNow();
  const messages = useMemo<ChatMessage[]>(() => {
    const out = [...SEED];
    if (step >= 3)
      out.push({ id: "w3", senderId: ME, createdAt: T - 60_000, text: "That fixed it, thank you!", status: "read" });
    if (step >= 4) out.push({ id: "w4", senderId: "leo", createdAt: T - 20_000, text: "Glad to hear it! 😊" });
    return out;
  }, [step]);
  const conversations = useMemo<ChatConversation[]>(
    () => [
      {
        id: "sup-bug",
        title: "Date picker on Safari",
        participantIds: [ME, "leo"],
        unreadCount: step >= 2 ? 0 : 1,
        lastMessage: messages[messages.length - 1],
      },
    ],
    [messages, step],
  );
  return (
    <div className="relative h-[27rem] w-full overflow-hidden rounded-sheen-lg">
      <ChatWidget
        conversations={conversations}
        messages={{ "sup-bug": messages }}
        participants={PEOPLE}
        currentUserId={ME}
        teamIds={["leo", "sana"]}
        headingLevel="none"
        open={step >= 1}
        onOpenChange={(open) => setStep(open ? 1 : 0)}
        conversationId={step >= 2 ? "sup-bug" : null}
        onConversationChange={(id) => setStep(id ? 2 : 1)}
        strategy="absolute"
        now={now}
        locale="en-US"
      />
    </div>
  );
}
