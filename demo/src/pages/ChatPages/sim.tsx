import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChatAttachment, ChatConversation, ChatConversationAction, ChatDraft, ChatMessage } from "@sheenui/theme";
import { demoNowMs } from "../../demo-clock";
import { lookup } from "../../lookup";
import { ME, shortThread } from "./data";

/* =====================================================================
 * A pretend backend: optimistic sends, ticks that advance, typing,
 * replies, one failed send, older history that loads with a delay.
 * ===================================================================== */

const REPLIES = [
  "Haha, true 😄",
  "Sounds good! 👍",
  "Arre waah, nice! 🔥",
  "Give me 5 minutes",
  "Let me check and get back to you",
  "Done ✅",
  "😂😂",
  "Perfect, thanks!",
  "Can we do it tomorrow?",
];

type SimOptions = {
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  older?: Record<string, ChatMessage[]>;
  /** Fail this send (1-based) to show "Not delivered · Retry". */
  failOn?: number;
  replies?: string[];
  /** Someone who is typing when the page opens finishes their message this long after. */
  arrivals?: { conversationId: string; text: string; after: number }[];
};

function attachmentsFrom(draft: ChatDraft): ChatAttachment[] {
  return draft.attachments.map((a) => ({
    id: a.id,
    kind: a.mimeType.startsWith("image/") ? "image" : "file",
    name: a.name,
    size: a.size,
    mimeType: a.mimeType,
    url: a.previewUrl ?? URL.createObjectURL(a.file),
  }));
}

export function useChatSim({
  conversations: initialConversations,
  messages: initial,
  older: initialOlder = {},
  failOn = 3,
  replies = REPLIES,
  arrivals,
}: SimOptions) {
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(initial);
  const [older, setOlder] = useState<Record<string, ChatMessage[]>>(initialOlder);
  const [loadingOlder, setLoadingOlder] = useState<string | null>(null);
  const timers = useRef(new Set<number>());
  const sends = useRef(0);
  const replyIndex = useRef(0);
  const live = useRef({ conversations, messages });
  useLayoutEffect(() => {
    live.current = { conversations, messages };
  });

  useEffect(() => {
    const all = timers.current;
    return () => all.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  const patchConversation = useCallback((id: string, patch: (c: ChatConversation) => Partial<ChatConversation>) => {
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, ...patch(c) } : c)));
  }, []);

  const patchMessage = useCallback(
    (conversationId: string, messageId: string, patch: Partial<ChatMessage>) => {
      setMessages((all) => {
        const list = all[conversationId] ?? [];
        const next = list.map((m) => (m.id === messageId ? { ...m, ...patch } : m));
        return { ...all, [conversationId]: next };
      });
      patchConversation(conversationId, (c) =>
        c.lastMessage?.id === messageId ? { lastMessage: { ...c.lastMessage, ...patch } } : {},
      );
    },
    [patchConversation],
  );

  const append = useCallback(
    (conversationId: string, message: ChatMessage, incoming: boolean) => {
      // A chat whose messages aren't loaded yet gets them (ending with this one) when it is opened.
      setMessages((all) =>
        lookup(all, conversationId) || !incoming
          ? { ...all, [conversationId]: [...(lookup(all, conversationId) ?? []), message] }
          : all,
      );
      patchConversation(conversationId, (c) => ({
        lastMessage: message,
        updatedAt: message.createdAt,
        unreadCount: incoming ? (c.unreadCount ?? 0) + 1 : c.unreadCount,
        typingIds: incoming ? (c.typingIds ?? []).filter((t) => t !== message.senderId) : c.typingIds,
        draft: incoming ? c.draft : undefined,
        archived: false,
      }));
    },
    [patchConversation],
  );

  /** The other side: ticks advance, then someone types and replies. */
  const deliver = useCallback(
    (conversationId: string, messageId: string, fail: boolean) => {
      later(550, () => patchMessage(conversationId, messageId, { status: "sent" }));
      if (fail) {
        later(1300, () => patchMessage(conversationId, messageId, { status: "failed" }));
        return;
      }
      later(1200, () => patchMessage(conversationId, messageId, { status: "delivered", deliveredAt: demoNowMs() }));
      const conversation = live.current.conversations.find((c) => c.id === conversationId);
      const partner = conversation?.participantIds.find((p) => p !== ME);
      if (!partner) return;
      later(2300, () => patchMessage(conversationId, messageId, { status: "read", readAt: demoNowMs() }));
      later(2700, () => patchConversation(conversationId, () => ({ typingIds: [partner] })));
      later(4600, () => {
        const text = replies[replyIndex.current % replies.length];
        replyIndex.current += 1;
        append(conversationId, { id: `in-${Date.now()}`, senderId: partner, createdAt: demoNowMs(), text }, true);
        // Now and then they react to what you said.
        if (replyIndex.current % 2 === 0) {
          later(900, () =>
            setMessages((all) => ({
              ...all,
              [conversationId]: (all[conversationId] ?? []).map((m) =>
                m.id === messageId ? { ...m, reactions: [{ emoji: "❤️", userIds: [partner] }] } : m,
              ),
            })),
          );
        }
      });
    },
    [later, patchMessage, patchConversation, append, replies],
  );

  // Typing when the page opens: the message arrives a few seconds later (the chat moves up, its badge pops).
  const arrivalsRef = useRef(arrivals);
  useEffect(() => {
    for (const a of arrivalsRef.current ?? []) {
      later(a.after, () => {
        const c = live.current.conversations.find((x) => x.id === a.conversationId);
        const from = c?.typingIds?.[0];
        if (from)
          append(
            a.conversationId,
            { id: `${a.conversationId}-live-${Date.now()}`, senderId: from, createdAt: demoNowMs(), text: a.text },
            true,
          );
      });
    }
  }, [later, append]);

  const send = useCallback(
    (conversationId: string, draft: ChatDraft) => {
      sends.current += 1;
      const message: ChatMessage = {
        id: `out-${Date.now()}-${sends.current}`,
        senderId: ME,
        createdAt: demoNowMs(),
        text: draft.text || undefined,
        attachments: draft.attachments.length ? attachmentsFrom(draft) : undefined,
        replyTo: draft.replyTo,
        status: "sending",
      };
      append(conversationId, message, false);
      deliver(conversationId, message.id, sends.current === failOn);
    },
    [append, deliver, failOn],
  );

  const retry = useCallback(
    (conversationId: string, message: ChatMessage) => {
      patchMessage(conversationId, message.id, { status: "sending", createdAt: demoNowMs() });
      deliver(conversationId, message.id, false);
    },
    [patchMessage, deliver],
  );

  const edit = useCallback(
    (conversationId: string, messageId: string, text: string) =>
      patchMessage(conversationId, messageId, { text, editedAt: demoNowMs() }),
    [patchMessage],
  );
  const remove = useCallback(
    (conversationId: string, message: ChatMessage) =>
      patchMessage(conversationId, message.id, {
        deleted: true,
        text: undefined,
        attachments: undefined,
        reactions: undefined,
        linkPreview: undefined,
        replyTo: undefined,
      }),
    [patchMessage],
  );

  const react = useCallback((conversationId: string, message: ChatMessage, emoji: string, add: boolean) => {
    setMessages((all) => ({
      ...all,
      [conversationId]: (all[conversationId] ?? []).map((m) => {
        if (m.id !== message.id) return m;
        // One reaction per person (WhatsApp): adding replaces your previous one.
        const without = (m.reactions ?? [])
          .map((r) => ({ ...r, userIds: r.userIds.filter((u) => u !== ME) }))
          .filter((r) => r.userIds.length > 0);
        if (!add) return { ...m, reactions: without };
        const existing = without.find((r) => r.emoji === emoji);
        const reactions = existing
          ? without.map((r) => (r.emoji === emoji ? { ...r, userIds: [...r.userIds, ME] } : r))
          : [...without, { emoji, userIds: [ME] }];
        return { ...m, reactions };
      }),
    }));
  }, []);

  const olderRef = useRef(older);
  useLayoutEffect(() => {
    olderRef.current = older;
  });
  const loadingRef = useRef(false);
  const loadOlder = useCallback(
    (conversationId: string) => {
      if (!lookup(olderRef.current, conversationId)?.length || loadingRef.current) return;
      loadingRef.current = true;
      setLoadingOlder(conversationId);
      later(900, () => {
        const list = olderRef.current[conversationId] ?? [];
        const chunk = list.slice(-30);
        setOlder((all) => ({ ...all, [conversationId]: list.slice(0, -30) }));
        setMessages((m) => ({ ...m, [conversationId]: [...chunk, ...(m[conversationId] ?? [])] }));
        setLoadingOlder(null);
        loadingRef.current = false;
      });
    },
    [later],
  );

  const action = useCallback(
    (conversation: ChatConversation, a: ChatConversationAction) => {
      patchConversation(conversation.id, () => {
        switch (a) {
          case "pin":
            return { pinned: true };
          case "unpin":
            return { pinned: false };
          case "mute":
            return { muted: true };
          case "unmute":
            return { muted: false };
          case "archive":
            return { archived: true, pinned: false };
          case "unarchive":
            return { archived: false };
          case "markRead":
            return { unreadCount: 0 };
          case "markUnread":
            return { unreadCount: 1 };
        }
      });
    },
    [patchConversation],
  );

  const ensureThread = useCallback((conversationId: string) => {
    if (lookup(live.current.messages, conversationId)) return;
    const c = live.current.conversations.find((x) => x.id === conversationId);
    if (!c) return;
    setMessages((all) => (lookup(all, conversationId) ? all : { ...all, [conversationId]: shortThread(c) }));
  }, []);

  /** A new chat with its first messages (e.g. support's greeting). */
  const start = useCallback((conversation: ChatConversation, first: ChatMessage[]) => {
    setConversations((list) => [conversation, ...list]);
    setMessages((all) => ({ ...all, [conversation.id]: first }));
  }, []);

  const read = useCallback(
    (conversationId: string) => patchConversation(conversationId, () => ({ unreadCount: 0 })),
    [patchConversation],
  );
  const setDraft = useCallback(
    (conversationId: string, text: string) => patchConversation(conversationId, () => ({ draft: text || undefined })),
    [patchConversation],
  );

  return {
    conversations,
    setConversations,
    messages,
    hasOlder: (id: string) => (lookup(older, id)?.length ?? 0) > 0,
    loadingOlder,
    send,
    retry,
    edit,
    remove,
    react,
    loadOlder,
    action,
    ensureThread,
    start,
    read,
    setDraft,
  };
}
