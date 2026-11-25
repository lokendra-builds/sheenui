import { useMemo, useState } from "react";
import { Button, useToast } from "@sheenui/theme";
import { useDemoNow } from "../../demo-clock";
import { useChatSim } from "./sim";
import { DANIEL_ARRIVES, HOUR, ME, PEOPLE, makeConversations, manyConversations } from "./data";
import { ConversationList } from "./lazy";

/* =====================================================================
 * Chat list
 * ===================================================================== */

/* German labels for the compact list (a constant: an inline object would re-render every row on each update). */
const GERMAN_LIST_LABELS = {
  chats: "Unterhaltungen",
  search: "Unterhaltungen durchsuchen",
  searchPlaceholder: "Suchen",
  youPrefix: "Du:",
  pinnedSection: "Angeheftet",
  allSection: "Alle Chats",
  justNow: "jetzt",
  typing: () => "schreibt…",
};

/* Each live demo owns its simulated backend, so a message arriving re-renders that demo only (not the page, its tabs and props table). */
export function InboxDemo({ loading, many, empty }: { loading: boolean; many: boolean; empty: boolean }) {
  const toast = useToast();
  const now = useDemoNow();
  const sim = useChatSim({ conversations: makeConversations(), messages: {}, arrivals: DANIEL_ARRIVES });
  const [selected, setSelected] = useState<string | null>("c-riya");
  const bulk = useMemo(() => (many ? manyConversations() : []), [many]);
  const conversations = useMemo(() => (empty ? [] : [...sim.conversations, ...bulk]), [empty, sim.conversations, bulk]);
  return (
    <div className="glass-3 h-[36rem] w-full max-w-md overflow-hidden rounded-sheen-xl">
      <ConversationList
        headingLevel="none"
        conversations={conversations}
        participants={PEOPLE}
        currentUserId={ME}
        selectedId={selected}
        loading={loading}
        onSelect={(c) => {
          setSelected(c.id);
          sim.read(c.id);
        }}
        onAction={(c, a) => sim.action(c, a)}
        emptyAction={
          <Button size="sm" onClick={() => toast.info("Start a chat", "Pick someone from your contacts.")}>
            Start a chat
          </Button>
        }
        now={now}
        locale="en-US"
      />
    </div>
  );
}

export function CompactListDemo() {
  // The browsers' German formats differ a little ("4 Min." or "4min", "9:02" or "09:02"). Read at 15:00, every
  // time in this list is a two-digit clock time or a day name, so the prerendered text matches in all of them.
  const demoNow = useDemoNow();
  const now = useMemo(() => new Date(demoNow.getTime() + 3 * HOUR), [demoNow]);
  const sim = useChatSim({ conversations: makeConversations(), messages: {}, arrivals: DANIEL_ARRIVES });
  return (
    <div lang="de" className="contents">
      <div className="glass-3 h-[28rem] w-full max-w-xs overflow-hidden rounded-sheen-xl">
        <ConversationList
          headingLevel="none"
          conversations={sim.conversations}
          participants={PEOPLE}
          currentUserId={ME}
          density="compact"
          showFilters={false}
          title={false}
          now={now}
          locale="de-DE"
          labels={GERMAN_LIST_LABELS}
        />
      </div>
    </div>
  );
}
