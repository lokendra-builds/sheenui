"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "../types";
import { PREPEND_STEP } from "./layout";

/**
 * Earlier messages, a few at a time. A batch of earlier messages (30, say) is added to the page `PREPEND_STEP` at a
 * time, nearest the reader first, one step per frame: no single frame has to build them all, and the reader's place
 * is kept after each step. Returns `hiddenOlder` (how many of the oldest messages are not on the page yet) and
 * `shown` (the messages that are).
 */
export function usePrependedMessages(messages: ChatMessage[]) {
  const [prepend, setPrepend] = useState({ first: messages[0]?.id ?? null, hidden: 0 });
  const firstMessageId = messages[0]?.id ?? null;
  if (prepend.first !== firstMessageId) {
    const oldFirst = prepend.first ? messages.findIndex((m) => m.id === prepend.first) : -1;
    setPrepend({
      first: firstMessageId,
      hidden: oldFirst > 0 ? Math.max(0, oldFirst + prepend.hidden - PREPEND_STEP) : 0,
    });
  }
  const hiddenOlder = Math.min(prepend.hidden, messages.length);
  useEffect(() => {
    if (!hiddenOlder) return;
    const frame = requestAnimationFrame(() =>
      setPrepend((p) => ({ ...p, hidden: Math.max(0, p.hidden - PREPEND_STEP) })),
    );
    return () => cancelAnimationFrame(frame);
  }, [hiddenOlder]);
  const shown = useMemo(() => (hiddenOlder ? messages.slice(hiddenOlder) : messages), [messages, hiddenOlder]);
  return { hiddenOlder, shown };
}
