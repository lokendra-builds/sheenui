// Chat internals: pure helpers (format, emoji, labels), hooks, small parts, the emoji picker and
// the message parts (links, highlight, meta, quotes, photo grid, files, link previews, reactions, lightbox).

import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  calendarDayDiff,
  conversationTitle,
  dayKey,
  firstName,
  formatCount,
  formatDateTime,
  formatDayLabel,
  formatFileSize,
  formatListTime,
  formatRelative,
  formatTime,
  isGroup,
  messageSummary,
  otherMembers,
  textDirection,
  toDate,
  toParticipantMap,
  toTime,
} from "../../src/components/chat/format";
import {
  defaultEmojiCategories,
  defaultQuickReactions,
  emojiName,
  isJumboEmoji,
} from "../../src/components/chat/emoji";
import { defaultChatLabels, resolveChatLabels } from "../../src/components/chat/labels";
import {
  chatUid,
  useAnnouncer,
  useCoarsePointer,
  useKeyboardInset,
  useLongPressMenuGuard,
  useMediaQuery,
  useModalIsolation,
  useNow,
  useVisualViewport,
} from "../../src/components/chat/hooks";
import { useLatest } from "../../src/hooks/use-latest";
import {
  ChatAvatar,
  ChatKeyframes,
  DeliveryStatus,
  PresenceDot,
  TypingDots,
  UnreadBadge,
  VisuallyHidden,
} from "../../src/components/chat/chat-parts";
import { EmojiPicker } from "../../src/components/chat/emoji-picker";
import {
  AttachmentGrid,
  FileChip,
  Highlight,
  ImageLightbox,
  LinkPreviewCard,
  MessageMeta,
  MessageText,
  QuoteBlock,
  ReactionChips,
} from "../../src/components/chat/message-parts";
import type { ChatAttachment, ChatConversation, ChatMessage, ChatParticipant } from "../../src/components/chat/types";
import { pixel, settle, frames } from "../helpers";
import { setReducedMotion } from "../helpers-text";
import { renderUi, runAxe } from "../render";

const L = defaultChatLabels;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/** A fixed "now" in local time, so calendar-day maths cannot flip with the test machine's time zone. */
const NOW = new Date(2026, 10, 18, 14, 30, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

describe("chat date helpers", () => {
  it("toDate / toTime parse dates, strings and numbers, and shrug at nothing or garbage", () => {
    expect(toDate(undefined)).toBeUndefined();
    expect(toDate(null as never)).toBeUndefined();
    expect(toDate("not a date")).toBeUndefined();
    expect(toDate(NOW)).toBe(NOW);
    expect(toDate(NOW.toISOString())?.getTime()).toBe(NOW.getTime());
    expect(toDate(NOW.getTime())?.getTime()).toBe(NOW.getTime());
    expect(toTime(NOW)).toBe(NOW.getTime());
    expect(toTime(undefined)).toBe(0);
    expect(toTime("garbage")).toBe(0);
  });

  it("calendarDayDiff counts calendar days, not 24-hour spans; dayKey is unique per day", () => {
    const late = new Date(2026, 10, 17, 23, 59);
    const early = new Date(2026, 10, 18, 0, 1);
    expect(calendarDayDiff(late, early)).toBe(1);
    expect(calendarDayDiff(early, early)).toBe(0);
    expect(calendarDayDiff(new Date(2026, 10, 11), early)).toBe(7);
    expect(dayKey(late)).not.toBe(dayKey(early));
    expect(dayKey(early)).toBe(dayKey(new Date(2026, 10, 18, 23, 0)));
  });

  it("formatTime and formatDateTime follow the locale", () => {
    expect(formatTime(NOW, "en-US")).toMatch(/2:30\s?PM/);
    expect(formatTime(NOW, "de-DE")).toMatch(/14:30/);
    expect(formatDateTime(NOW, "en-US")).toMatch(/Nov 18, 2026/);
  });

  it("formatListTime: now, minutes, today's clock, yesterday, weekday, date, and an older year", () => {
    expect(formatListTime(ago(20_000), NOW, "en-US", "now")).toMatchObject({ short: "now", long: "now" });
    expect(formatListTime(ago(5 * MIN), NOW, "en-US", "now")).toEqual({ short: "5m", long: "5 minutes ago" });
    expect(formatListTime(ago(2 * HOUR), NOW, "en-US", "now").short).toMatch(/12:30\s?PM/);
    expect(formatListTime(ago(DAY), NOW, "en-US", "now")).toMatchObject({ short: "Yesterday" });
    expect(formatListTime(ago(DAY), NOW, "en-US", "now").long).toMatch(/^Yesterday, 2:30\s?PM$/);
    const weekday = formatListTime(ago(3 * DAY), NOW, "en-US", "now");
    expect(weekday.short).toBe("Sun");
    expect(weekday.long).toMatch(/^Sunday/);
    const sameYear = formatListTime(ago(20 * DAY), NOW, "en-US", "now");
    expect(sameYear.short).toBe("Oct 29");
    expect(sameYear.long).toBe("October 29, 2026");
    const older = formatListTime(new Date(2024, 2, 5), NOW, "en-US", "now");
    expect(older.short).toMatch(/3\/5\/24/);
    expect(older.long).toBe("March 5, 2024");
  });

  it("formatDayLabel: Today, Yesterday, weekday, this-year date, other-year date", () => {
    expect(formatDayLabel(NOW, NOW, "en-US")).toBe("Today");
    expect(formatDayLabel(ago(DAY), NOW, "en-US")).toBe("Yesterday");
    expect(formatDayLabel(ago(3 * DAY), NOW, "en-US")).toBe("Sunday");
    expect(formatDayLabel(ago(20 * DAY), NOW, "en-US")).toBe("Thu, October 29");
    expect(formatDayLabel(new Date(2024, 2, 5), NOW, "en-US")).toBe("March 5, 2024");
  });

  it("formatRelative: seconds, minutes, hours, days, then a date", () => {
    expect(formatRelative(ago(10_000), NOW, "en-US")).toBe("now");
    expect(formatRelative(ago(5 * MIN), NOW, "en-US")).toBe("5m ago");
    expect(formatRelative(ago(3 * HOUR), NOW, "en-US")).toBe("3h ago");
    expect(formatRelative(ago(3 * DAY), NOW, "en-US")).toBe("3 days ago");
    expect(formatRelative(ago(30 * DAY), NOW, "en-US")).toBe("Oct 19");
    // A date in the future never reads as negative.
    expect(formatRelative(new Date(NOW.getTime() + HOUR), NOW, "en-US")).toBe("now");
  });

  it("textDirection looks at the first letter only", () => {
    expect(textDirection("Hello")).toBe("ltr");
    expect(textDirection("مرحبا بالعالم")).toBe("rtl");
    expect(textDirection("שלום")).toBe("rtl");
    expect(textDirection("123 مرحبا")).toBe("rtl");
    expect(textDirection("مرحبا hello")).toBe("rtl");
    expect(textDirection("hello مرحبا")).toBe("ltr");
    expect(textDirection("1234 !!")).toBeUndefined();
    expect(textDirection("")).toBeUndefined();
    expect(textDirection(undefined)).toBeUndefined();
  });
});

describe("chat people + message helpers", () => {
  const people: ChatParticipant[] = [
    { id: "me", name: "Ava Chen" },
    { id: "riya", name: "Riya Sharma" },
    { id: "lena", name: "Lena Fischer" },
  ];
  const map = toParticipantMap(people);

  it("builds a map, lists the other members (skipping me and unknown ids), and names the conversation", () => {
    expect(toParticipantMap(undefined).size).toBe(0);
    expect(map.get("riya")?.name).toBe("Riya Sharma");
    const convo: ChatConversation = { id: "c", participantIds: ["me", "riya", "ghost", "lena"] };
    expect(otherMembers(convo, map, "me").map((p) => p.name)).toEqual(["Riya Sharma", "Lena Fischer"]);
    expect(conversationTitle(convo, map, "me")).toBe("Riya Sharma, Lena Fischer");
    expect(conversationTitle({ ...convo, title: "Design" }, map, "me")).toBe("Design");
    expect(conversationTitle({ id: "lonely", participantIds: ["me"] }, map, "me")).toBe("lonely");
    expect(isGroup({ ...convo, kind: "group" })).toBe(true);
    expect(isGroup(convo)).toBe(false);
    expect(firstName("Riya Sharma")).toBe("Riya");
    expect(firstName("Prince")).toBe("Prince");
  });

  it("messageSummary: deleted, text (whitespace collapsed), photos, files, mixed, empty", () => {
    const img = (id: string) => ({ id, kind: "image" as const, name: id });
    const file = (id: string) => ({ id, kind: "file" as const, name: id });
    expect(messageSummary({ deleted: true }, L)).toBe(L.deletedMessage);
    expect(messageSummary({ deleted: true }, L, true)).toBe(L.deletedOwnMessage);
    expect(messageSummary({ text: "  hello \n  there  " }, L)).toBe("hello there");
    expect(messageSummary({ attachments: [img("a")] }, L)).toBe("Photo");
    expect(messageSummary({ attachments: [img("a"), img("b")] }, L)).toBe("2 photos");
    expect(messageSummary({ attachments: [file("a")] }, L)).toBe("File");
    expect(messageSummary({ attachments: [img("a"), file("b"), file("c")] }, L)).toBe("3 files");
    expect(messageSummary({ text: "   " }, L)).toBe("");
    expect(messageSummary({}, L)).toBe("");
  });

  it("formatFileSize and formatCount are locale aware", () => {
    expect(formatFileSize(2048, "en-US")).toMatch(/2(\.0)? ?KB/i);
    expect(formatCount(12345, "en-US")).toBe("12,345");
    expect(formatCount(12345, "de-DE")).toBe("12.345");
  });
});

describe("emoji data", () => {
  it("names known emoji, passes unknown through, and has quick reactions", () => {
    expect(emojiName("👍").toLowerCase()).toContain("thumb");
    expect(emojiName("zzz")).toBe("zzz");
    expect(defaultQuickReactions).toHaveLength(6);
    expect(defaultEmojiCategories.map((c) => c.id)).toContain("smileys");
    for (const c of defaultEmojiCategories) expect(c.emojis.length).toBeGreaterThan(5);
  });

  it("isJumboEmoji: 1 to 3 pictographs only", () => {
    expect(isJumboEmoji("😀")).toBe(true);
    expect(isJumboEmoji("  😀 😀 ")).toBe(true);
    expect(isJumboEmoji("😀😀😀")).toBe(true);
    expect(isJumboEmoji("😀😀😀😀")).toBe(false);
    expect(isJumboEmoji("👨‍👩‍👧")).toBe(true);
    expect(isJumboEmoji("hi 😀")).toBe(false);
    expect(isJumboEmoji("123")).toBe(false);
    expect(isJumboEmoji("")).toBe(false);
    expect(isJumboEmoji("   ")).toBe(false);
    expect(isJumboEmoji(undefined)).toBe(false);
    expect(isJumboEmoji("😀".repeat(30))).toBe(false);
  });
});

describe("chat labels", () => {
  it("returns the defaults untouched when nothing is passed", () => {
    expect(resolveChatLabels(undefined)).toMatchObject({ send: "Send", you: "You" });
  });

  it("merges strings, functions and nested records over the defaults", () => {
    const merged = resolveChatLabels({
      send: "Senden",
      filters: { unread: "Ungelesen" } as never,
      unreadCount: (n) => `${n} neu`,
    });
    expect(merged.send).toBe("Senden");
    expect(merged.filters.unread).toBe("Ungelesen");
    expect(merged.filters.all).toBe("All");
    expect(merged.unreadCount(3)).toBe("3 neu");
    expect(merged.back).toBe(L.back);
  });

  it("default function labels pluralise and describe typing, members and attachments", () => {
    expect(L.typing([], true)).toBe("typing…");
    expect(L.typing(["Riya"], false)).toBe("typing…");
    expect(L.typing(["Riya"], true)).toBe("Riya is typing…");
    expect(L.typing(["Riya", "Lena"], true)).toBe("Riya and Lena are typing…");
    expect(L.typing(["a", "b", "c"], true)).toBe("3 people are typing…");
    expect(L.members(1, 0)).toBe("1 member");
    expect(L.members(3, 2)).toBe("3 members, 2 online");
    expect(L.unreadCount(1)).toBe("1 unread message");
    expect(L.unreadCount(4)).toBe("4 unread messages");
    expect(L.attachmentSummary("image", 1)).toBe("Photo");
    expect(L.attachmentSummary("image", 3)).toBe("3 photos");
    expect(L.attachmentSummary("file", 1)).toBe("File");
    expect(L.attachmentSummary("file", 2)).toBe("2 files");
    expect(L.lastSeen("5 min ago")).toBe("Last seen 5 min ago");
    expect(L.noResultsTitle("zz")).toContain("zz");
    expect(L.reactionChip("thumbs up", 2, true)).toBe("thumbs up 2, including you");
    expect(L.reactionChip("thumbs up", 1, false)).toBe("thumbs up 1");
    expect(L.announceReaction("👍", true)).toBe("Reacted 👍");
    expect(L.announceReaction("👍", false)).toBe("Removed 👍");
    expect(L.announceOlderLoaded(1)).toContain("1 earlier message");
    expect(L.newBelow(2)).toBe("2 new messages");
    expect(L.placeholder("Riya")).toBe("Message Riya");
    expect(L.placeholder(undefined)).toBe("Write a message…");
    expect(L.membersHeading(2)).toBe("2 members");
    expect(L.imagePosition(1, 4)).toBe("1 of 4");
    expect(L.block("Riya")).toBe("Block Riya");
  });
});

/** Replace matchMedia for queries containing a key; flipping notifies subscribers. */
function stubMedia(initial: Record<string, boolean>) {
  const real = window.matchMedia.bind(window);
  const lists = new Map<string, { matches: boolean; ls: Set<() => void> }>();
  for (const [k, v] of Object.entries(initial)) lists.set(k, { matches: v, ls: new Set() });
  vi.spyOn(window, "matchMedia").mockImplementation((q: string) => {
    const key = [...lists.keys()].find((k) => q.includes(k));
    if (!key) return real(q);
    const m = lists.get(key)!;
    return {
      get matches() {
        return m.matches;
      },
      media: q,
      addEventListener: (_: string, l: () => void) => m.ls.add(l),
      removeEventListener: (_: string, l: () => void) => m.ls.delete(l),
    } as unknown as MediaQueryList;
  });
  return (key: string, value: boolean) => {
    const m = lists.get(key)!;
    m.matches = value;
    m.ls.forEach((l) => l());
  };
}

describe("chat hooks", () => {
  it("useMediaQuery / useCoarsePointer follow the query live", () => {
    const set = stubMedia({ "pointer: coarse": false, "min-width: 500px": true });
    const coarse = renderHook(() => useCoarsePointer());
    const wide = renderHook(() => useMediaQuery("(min-width: 500px)"));
    expect(coarse.result.current).toBe(false);
    expect(wide.result.current).toBe(true);
    act(() => set("pointer: coarse", true));
    expect(coarse.result.current).toBe(true);
  });

  it("useNow returns a fixed date as is, and a live clock that ticks every 30 s", () => {
    const fixed = renderHook(() => useNow(NOW));
    expect(fixed.result.current.getTime()).toBe(NOW.getTime());
    fixed.unmount();

    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date(2026, 10, 18, 9, 0, 0));
    const live = renderHook(() => useNow());
    const first = live.result.current.getTime();
    expect(Math.abs(first - Date.now())).toBeLessThan(1000);
    act(() => void vi.advanceTimersByTime(30_000));
    expect(live.result.current.getTime()).toBeGreaterThanOrEqual(first + 29_000);
    live.unmount();
  });

  it("useAnnouncer renders a polite status region and speaks the latest text after a frame", async () => {
    function Host() {
      const [announce, node] = useAnnouncer();
      return (
        <div>
          <button onClick={() => announce("Saved")}>go</button>
          {node}
        </div>
      );
    }
    render(<Host />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("");
    await userEvent.click(screen.getByRole("button", { name: "go" }));
    await expect.poll(() => status.textContent).toBe("Saved");
  });

  it("useLatest always points at the newest value", () => {
    const { result, rerender } = renderHook(({ v }) => useLatest(v), { initialProps: { v: 1 } });
    rerender({ v: 2 });
    expect(result.current.current).toBe(2);
  });

  it("useVisualViewport reports the visual viewport box, or null when disabled", async () => {
    const off = renderHook(() => useVisualViewport(false));
    expect(off.result.current).toBeNull();
    const on = renderHook(() => useVisualViewport(true));
    await expect.poll(() => on.result.current).not.toBeNull();
    expect(on.result.current!.height).toBeGreaterThan(100);
    window.visualViewport?.dispatchEvent(new Event("resize"));
    window.visualViewport?.dispatchEvent(new Event("scroll"));
    on.unmount();
  });

  it("useVisualViewport tracks changes from a (fake) mobile visual viewport", async () => {
    const listeners = new Map<string, () => void>();
    const vv = {
      height: 700,
      offsetTop: 0,
      addEventListener: (t: string, l: () => void) => listeners.set(t, l),
      removeEventListener: (t: string) => listeners.delete(t),
    };
    vi.spyOn(window, "visualViewport", "get").mockReturnValue(vv as unknown as VisualViewport);
    const { result, unmount } = renderHook(() => useVisualViewport(true));
    await expect.poll(() => result.current?.height).toBe(700);
    vv.height = 400;
    vv.offsetTop = 30;
    listeners.get("resize")!();
    await expect.poll(() => result.current).toEqual({ height: 400, offsetTop: 30 });
    unmount();
    expect(listeners.size).toBe(0);
  });

  it("useKeyboardInset measures how much of an element the on-screen keyboard covers", async () => {
    const listeners = new Map<string, () => void>();
    const vv = {
      height: 768,
      offsetTop: 0,
      addEventListener: (t: string, l: () => void) => listeners.set(t, l),
      removeEventListener: (t: string) => listeners.delete(t),
    };
    vi.spyOn(window, "visualViewport", "get").mockReturnValue(vv as unknown as VisualViewport);
    function Host({ enabled = true }: { enabled?: boolean }) {
      const ref = useRef<HTMLDivElement>(null);
      const inset = useKeyboardInset(ref, enabled);
      return (
        <div
          ref={ref}
          data-testid="box"
          data-inset={inset}
          style={{ position: "fixed", left: 0, bottom: 68, height: 20, width: 20 }}
        />
      );
    }
    const view = render(<Host />);
    await expect.poll(() => screen.getByTestId("box").dataset.inset).toBe("0");
    vv.height = 300; // keyboard up: the box (bottom at 700) is 400 px under the visible area
    listeners.get("resize")!();
    await expect.poll(() => screen.getByTestId("box").dataset.inset).toBe("400");
    view.rerender(<Host enabled={false} />);
    await expect.poll(() => screen.getByTestId("box").dataset.inset).toBe("0");
  });

  it("useModalIsolation makes everything outside the modal inert and locks page scroll, then restores both", () => {
    function Host({ enabled }: { enabled: boolean }) {
      const ref = useRef<HTMLDivElement>(null);
      useModalIsolation(ref, enabled);
      return (
        <div data-testid="app">
          <p data-testid="outside">outside</p>
          <section>
            <div ref={ref} data-testid="modal">
              modal
            </div>
            <p data-testid="sibling">sibling</p>
          </section>
          <style />
        </div>
      );
    }
    const view = render(<Host enabled />);
    expect(screen.getByTestId("outside")).toHaveAttribute("inert");
    expect(screen.getByTestId("sibling")).toHaveAttribute("inert");
    expect(screen.getByTestId("modal")).not.toHaveAttribute("inert");
    expect(document.documentElement.style.overflow).toBe("hidden");
    view.rerender(<Host enabled={false} />);
    expect(screen.getByTestId("outside")).not.toHaveAttribute("inert");
    expect(screen.getByTestId("sibling")).not.toHaveAttribute("inert");
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("TypingDots plays on screen, pauses when the tab is hidden and resumes when shown", async () => {
    const { container } = render(<TypingDots />);
    const el = container.firstElementChild!;
    await expect.poll(() => el.hasAttribute("data-paused")).toBe(false);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    const state = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    await expect.poll(() => el.hasAttribute("data-paused")).toBe(true);
    hidden.mockReturnValue(false);
    state.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    await expect.poll(() => el.hasAttribute("data-paused")).toBe(false);
  });

  it("TypingDots pauses while scrolled far off screen", async () => {
    const { container } = render(
      <div>
        <div style={{ height: 5000 }} />
        <TypingDots />
      </div>,
    );
    await expect.poll(() => container.querySelector("[aria-hidden]")!.hasAttribute("data-paused")).toBe(true);
  });

  it("useLongPressMenuGuard swallows the mouse events a browser invents after a long press that opened a menu", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "clearTimeout"] });
    let open = true;
    const { result, unmount } = renderHook(() => useLongPressMenuGuard(() => open));
    const click = () => {
      const seen = vi.fn();
      document.body.addEventListener("click", seen);
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      document.body.removeEventListener("click", seen);
      return { prevented: event.defaultPrevented, reached: seen.mock.calls.length };
    };

    // A short tap does nothing.
    result.current.onTouchStartCapture();
    vi.advanceTimersByTime(100);
    result.current.onTouchEndCapture();
    expect(click().reached).toBe(1);

    // A long press with no menu open does nothing either.
    open = false;
    result.current.onTouchStartCapture();
    vi.advanceTimersByTime(600);
    result.current.onTouchEndCapture();
    expect(click().reached).toBe(1);

    // A long press that opened a menu swallows the next click, then lets go.
    open = true;
    result.current.onTouchStartCapture();
    vi.advanceTimersByTime(600);
    result.current.onTouchEndCapture();
    expect(click()).toEqual({ prevented: true, reached: 0 });
    expect(click().reached).toBe(1);

    // If no click ever comes, it lets go after 700 ms; unmount lets go too.
    result.current.onTouchStartCapture();
    vi.advanceTimersByTime(600);
    result.current.onTouchEndCapture();
    vi.advanceTimersByTime(800);
    expect(click().reached).toBe(1);
    result.current.onTouchStartCapture();
    vi.advanceTimersByTime(600);
    result.current.onTouchEndCapture();
    unmount();
    expect(click().reached).toBe(1);
  });

  it("chatUid makes unique ids with a prefix", () => {
    const a = chatUid();
    const b = chatUid("msg");
    expect(a).toMatch(/^chat-/);
    expect(b).toMatch(/^msg-/);
    expect(a).not.toBe(b);
  });
});

describe("chat small parts", () => {
  it("PresenceDot is decorative, carries the presence and scales with the avatar size", () => {
    const { container } = render(
      <>
        <PresenceDot presence="online" size="sm" />
        <PresenceDot presence="away" />
        <PresenceDot presence="offline" size="xl" />
        <PresenceDot presence="online" size="2xl" className="extra" />
      </>,
    );
    const dots = [...container.querySelectorAll("[data-presence]")];
    expect(dots.map((d) => d.getAttribute("data-presence"))).toEqual(["online", "away", "offline", "online"]);
    for (const d of dots) expect(d).toHaveAttribute("aria-hidden", "true");
    expect(dots[0]).toHaveClass("size-2.5");
    expect(dots[1]).toHaveClass("size-3");
    expect(dots[2]).toHaveClass("size-3.5");
    expect(dots[3]).toHaveClass("size-4", "extra");
  });

  it("ChatAvatar: one person with presence, an explicit image, or two members overlapping", () => {
    const people: ChatParticipant[] = [
      { id: "a", name: "Ava Chen" },
      { id: "b", name: "Ben Ola" },
    ];
    const one = render(<ChatAvatar people={[people[0]!]} presence="online" size="lg" />);
    expect(one.container.querySelector("[data-presence=online]")).not.toBeNull();
    expect(one.container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    one.unmount();

    const src = render(<ChatAvatar people={people} src={pixel} name="Team" />);
    expect(src.container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(src.container.querySelector("[data-presence]")).toBeNull();
    src.unmount();

    for (const size of ["sm", "md", "lg", "xl", "2xl"] as const) {
      const two = render(<ChatAvatar people={people} size={size} />);
      expect(two.container.firstElementChild!.children).toHaveLength(2);
      two.unmount();
    }
    const none = render(<ChatAvatar people={[]} name="Fallback" />);
    expect(none.container.firstElementChild).not.toBeNull();
  });

  it("DeliveryStatus shows an icon per state, speaks it (or stays silent), and has two tones", () => {
    const { container, rerender } = render(<DeliveryStatus status="sending" labels={L} />);
    for (const status of ["sending", "sent", "delivered", "read", "failed"] as const) {
      rerender(<DeliveryStatus status={status} labels={L} />);
      expect(container.querySelector(`[data-status=${status}]`)).not.toBeNull();
      expect(container.querySelector(".sr-only")).toHaveTextContent(L.status[status]);
      expect(container.querySelector("svg")).not.toBeNull();
    }
    rerender(<DeliveryStatus status="read" labels={L} variant="bubble" spoken={false} className="x" />);
    expect(container.querySelector(".sr-only")).toBeNull();
    expect(container.firstElementChild).toHaveClass("x");
  });

  it("DeliveryStatus still honours the deprecated tone alias, and variant wins over it", () => {
    const { container, rerender } = render(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- deliberately exercises the deprecated `tone` alias
      <DeliveryStatus status="read" labels={L} tone="bubble" />,
    );
    const viaTone = container.innerHTML;
    rerender(<DeliveryStatus status="read" labels={L} variant="bubble" />);
    expect(container.innerHTML).toBe(viaTone);
    rerender(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- deliberately exercises the deprecated `tone` alias
      <DeliveryStatus status="read" labels={L} variant="bubble" tone="list" />,
    );
    expect(container.innerHTML).toBe(viaTone);
  });

  it("UnreadBadge renders nothing for 0, caps at 99+, can be muted, and carries a spoken label", () => {
    const { container, rerender } = render(<UnreadBadge count={0} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<UnreadBadge count={7} label="7 unread messages" />);
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("7");
    expect(container.querySelector(".sr-only")).toHaveTextContent("7 unread messages");
    rerender(<UnreadBadge count={150} muted overflow="99+" />);
    expect(container).toHaveTextContent("99+");
    expect(container.firstElementChild!.className).toContain("bg-sheen-fg-subtle");
    rerender(<UnreadBadge count={150} overflow="lots" />);
    expect(container).toHaveTextContent("lots");
  });

  it("TypingDots is decorative with three dots; VisuallyHidden hides text visually; ChatKeyframes injects the shared style once", () => {
    const { container } = render(
      <>
        <TypingDots className="t" />
        <VisuallyHidden>for readers</VisuallyHidden>
        <ChatKeyframes />
      </>,
    );
    const dots = container.querySelector(".t")!;
    expect(dots).toHaveAttribute("aria-hidden", "true");
    expect(dots.children).toHaveLength(3);
    expect(screen.getByText("for readers")).toHaveClass("sr-only");
    expect(document.head.querySelector("style[data-href=sheen-chat-keyframes]")?.textContent).toContain(
      "sheen-chat-typing",
    );
  });
});

describe("EmojiPicker", () => {
  const search = () => screen.getByRole("searchbox", { name: "Search emoji" });
  const emojiButtons = () =>
    within(document.body)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("data-emoji-index"));

  it("renders every category with a search box, category shortcuts and one tab stop in the grid", () => {
    const onSelect = vi.fn();
    renderUi(<EmojiPicker onSelect={onSelect} />);
    expect(search()).toBeInTheDocument();
    const shortcuts = screen.getAllByRole("group", { name: "Emoji" })[0]!;
    expect(within(shortcuts).getAllByRole("button")).toHaveLength(defaultEmojiCategories.length);
    expect(emojiButtons().length).toBeGreaterThan(100);
    expect(emojiButtons().filter((b) => b.tabIndex === 0)).toHaveLength(1);
    for (const category of defaultEmojiCategories)
      expect(screen.getByText((L.emojiCategories as Record<string, string>)[category.id]!)).toBeInTheDocument();
  });

  it("clicking an emoji reports it", async () => {
    const onSelect = vi.fn();
    renderUi(<EmojiPicker onSelect={onSelect} />);
    const first = emojiButtons()[0]!;
    await userEvent.click(first);
    expect(onSelect).toHaveBeenCalledWith(defaultEmojiCategories[0]!.emojis[0]!.char);
  });

  it("search filters by name and keywords, Enter picks the first result, clear restores the grid", async () => {
    const onSelect = vi.fn();
    renderUi(<EmojiPicker onSelect={onSelect} autoFocusSearch />);
    await expect.poll(() => document.activeElement).toBe(search());
    await userEvent.type(search(), "heart");
    const results = emojiButtons();
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(80);
    expect(screen.getByRole("group", { name: L.resultsCount(results.length) })).toBeInTheDocument();
    expect(screen.queryAllByRole("group", { name: "Emoji" })).toHaveLength(0); // category shortcuts are hidden while searching
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search()).toHaveValue("");
    await expect.poll(() => document.activeElement).toBe(search());
    expect(emojiButtons().length).toBeGreaterThan(100);
  });

  it("a search with no match says so (and Enter does nothing)", async () => {
    const onSelect = vi.fn();
    renderUi(<EmojiPicker onSelect={onSelect} />);
    await userEvent.type(search(), "zzzzqqq{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(L.noEmoji);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("keyboard: ArrowDown from search enters the grid; arrows, Home, End and ArrowUp-to-search move focus", async () => {
    renderUi(<EmojiPicker onSelect={vi.fn()} autoFocusSearch />);
    await userEvent.keyboard("{ArrowDown}");
    const buttons = emojiButtons();
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[1]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.keyboard("{ArrowDown}");
    const below = document.activeElement as HTMLElement;
    expect(below).not.toBe(buttons[0]);
    expect(Number(below.dataset.emojiIndex)).toBeGreaterThan(1);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(search());
    // The focused emoji is the tab stop (roving tabindex).
    expect(emojiButtons().filter((b) => b.tabIndex === 0)).toHaveLength(1);
  });

  it("Arrow keys flip in right-to-left layouts", async () => {
    renderUi(
      <div dir="rtl">
        <EmojiPicker onSelect={vi.fn()} autoFocusSearch />
      </div>,
    );
    await userEvent.keyboard("{ArrowDown}{ArrowLeft}");
    const buttons = emojiButtons();
    expect(document.activeElement).toBe(buttons[1]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("a category shortcut scrolls the grid and updates which shortcut is current", async () => {
    renderUi(<EmojiPicker onSelect={vi.fn()} />);
    const shortcuts = within(screen.getAllByRole("group", { name: "Emoji" })[0]!).getAllByRole("button");
    const grid = screen.getAllByRole("group", { name: "Emoji" })[1]!;
    expect(shortcuts[0]).toHaveAttribute("aria-current", "true");
    await userEvent.click(shortcuts[2]!);
    await expect.poll(() => grid.scrollTop, { timeout: 4000 }).toBeGreaterThan(100);
    await expect.poll(() => shortcuts[0]!.hasAttribute("aria-current"), { timeout: 4000 }).toBe(false);
  });

  /** The picker normally lives in a positioned popover; that is where the scroll offset bug shows. */
  const inPopover = (ui: React.ReactElement) => <div style={{ position: "relative", padding: 12 }}>{ui}</div>;

  it("a category shortcut scrolls the grid and stops highlighting the first category", async () => {
    renderUi(inPopover(<EmojiPicker onSelect={vi.fn()} />));
    const shortcuts = within(screen.getAllByRole("group", { name: "Emoji" })[0]!).getAllByRole("button");
    const grid = screen.getAllByRole("group", { name: "Emoji" })[1]!;
    expect(shortcuts[0]).toHaveAttribute("aria-current", "true");
    await userEvent.click(shortcuts[2]!);
    await expect.poll(() => grid.scrollTop, { timeout: 4000 }).toBeGreaterThan(100);
    await expect.poll(() => shortcuts[0]!.hasAttribute("aria-current"), { timeout: 4000 }).toBe(false);
  });

  it("a category shortcut lands on its own section and is the current one", async () => {
    renderUi(inPopover(<EmojiPicker onSelect={vi.fn()} />));
    const shortcuts = within(screen.getAllByRole("group", { name: "Emoji" })[0]!).getAllByRole("button");
    const grid = screen.getAllByRole("group", { name: "Emoji" })[1]!;
    await userEvent.click(shortcuts[2]!);
    // Wait for the smooth scroll to come to rest (a mid-scroll reading can pass the target by chance).
    let last = -1;
    await expect
      .poll(
        async () => {
          const now = grid.scrollTop;
          const settled = now === last;
          last = now;
          await frames(16);
          return settled && now > 0;
        },
        { timeout: 6000 },
      )
      .toBe(true);
    const section = grid.querySelectorAll<HTMLElement>("[data-emoji-section]")[2]!;
    expect(section.getBoundingClientRect().top - grid.getBoundingClientRect().top).toBeLessThanOrEqual(24);
    expect(shortcuts[2]).toHaveAttribute("aria-current", "true");
  });

  it("shows a Frequent section, marks selected emoji as pressed, and accepts custom categories and labels", () => {
    renderUi(
      <EmojiPicker
        onSelect={vi.fn()}
        frequent={["👍", "🦄"]}
        selected={["👍"]}
        categories={[
          {
            id: "smileys",
            icon: "😀",
            emojis: [
              { char: "😀", name: "grinning face" },
              { char: "👍", name: "thumbs up", keywords: "yes" },
            ],
          },
        ]}
        labels={{ searchEmoji: "Suche", reactions: "Häufig" }}
      />,
    );
    expect(screen.getByRole("searchbox", { name: "Suche" })).toBeInTheDocument();
    expect(screen.getByText("Häufig")).toBeInTheDocument();
    const pressed = emojiButtons().filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed.length).toBeGreaterThan(0);
    // An unknown frequent emoji is still offered, named by itself.
    expect(screen.getByRole("button", { name: "🦄" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    renderUi(<EmojiPicker onSelect={vi.fn()} frequent={["👍"]} />);
    expect(await runAxe()).toHaveNoViolations();
  });
});

describe("MessageText + Highlight", () => {
  it("turns urls into safe links (www. gets https), keeps trailing punctuation out, highlights matches around them", () => {
    render(
      <p data-testid="p">
        <MessageText text="Docs at www.example.com/a, or https://example.com/x?y=1. Thanks docs!" highlight="docs" />
      </p>,
    );
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "https://www.example.com/a",
      "https://example.com/x?y=1",
    ]);
    for (const a of links) {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(links[0]).toHaveTextContent("www.example.com/a");
    expect(screen.getByTestId("p").textContent).toBe(
      "Docs at www.example.com/a, or https://example.com/x?y=1. Thanks docs!",
    );
    expect([...screen.getByTestId("p").querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["Docs", "docs"]);
  });

  it("own bubbles use the on-accent link colour; tabbable={false} takes links out of the tab order", () => {
    render(<MessageText text="go https://a.dev now" own tabbable={false} />);
    const a = screen.getByRole("link", { hidden: true });
    expect(a).toHaveAttribute("tabindex", "-1");
    expect(a.className).toContain("text-sheen-accent-fg");
  });

  it("plain text without urls or a query renders as text", () => {
    const { container } = render(<MessageText text="just words" />);
    expect(container.textContent).toBe("just words");
    expect(container.querySelector("a, mark")).toBeNull();
  });

  it("Highlight ignores blank queries, matches case-insensitively and keeps the original casing", () => {
    const { container, rerender } = render(<Highlight text="Hello World" query="  " />);
    expect(container.textContent).toBe("Hello World");
    expect(container.querySelector("mark")).toBeNull();
    rerender(<Highlight text="Hello World" query="o" className="hl" />);
    expect([...container.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["o", "o"]);
    expect(container.querySelector("mark")).toHaveClass("hl");
    rerender(<Highlight text="Hello World" query="WORLD" />);
    expect(container.querySelector("mark")).toHaveTextContent("World");
    rerender(<Highlight text="Hello World" query="xyz" />);
    expect(container.querySelector("mark")).toBeNull();
    expect(container.textContent).toBe("Hello World");
  });
});

describe("MessageMeta", () => {
  const base: ChatMessage = {
    id: "m",
    senderId: "me",
    createdAt: new Date(2026, 10, 18, 14, 5),
    text: "hi",
    status: "delivered",
  };

  it("shows the time as a <time> element with a full date title, and status for own messages only", () => {
    const { container } = render(<MessageMeta message={base} own locale="en-US" labels={L} />);
    const time = container.querySelector("time")!;
    expect(time.textContent).toMatch(/2:05\s?PM/);
    expect(time).toHaveAttribute("datetime", base.createdAt instanceof Date ? base.createdAt.toISOString() : "");
    expect(time.title).toMatch(/Nov 18, 2026/);
    expect(container.querySelector("[data-status=delivered]")).not.toBeNull();
  });

  it("others' messages have no status; failed and deleted ones neither; edited ones say so", () => {
    const other = render(<MessageMeta message={base} own={false} labels={L} />);
    expect(other.container.querySelector("[data-status]")).toBeNull();
    other.unmount();
    const failed = render(<MessageMeta message={{ ...base, status: "failed" }} own labels={L} />);
    expect(failed.container.querySelector("[data-status]")).toBeNull();
    failed.unmount();
    const edited = render(
      <MessageMeta message={{ ...base, editedAt: base.createdAt, deleted: true }} own labels={L} />,
    );
    expect(edited.container).not.toHaveTextContent("edited");
    expect(edited.container.querySelector("[data-status]")).toBeNull();
    edited.unmount();
    const ok = render(<MessageMeta message={{ ...base, editedAt: base.createdAt }} own labels={L} />);
    expect(ok.container).toHaveTextContent("edited");
  });

  it("supports the overlay and plain tones, and an invalid date renders no time", () => {
    const overlay = render(<MessageMeta message={base} own labels={L} variant="overlay" className="o" />);
    expect(overlay.container.firstElementChild).toHaveClass("o");
    expect(overlay.container.firstElementChild!.className).toContain("sheen-chat-media-scrim");
    overlay.unmount();
    const plain = render(
      <MessageMeta message={{ ...base, createdAt: "nope", status: undefined }} own labels={L} variant="plain" />,
    );
    expect(plain.container.querySelector("time")).toBeNull();
    expect(plain.container.querySelector("[data-status=sent]")).not.toBeNull();
  });
});

describe("QuoteBlock", () => {
  it("is plain text without a handler, and a named button with one", async () => {
    const { container, rerender } = render(<QuoteBlock senderName="Riya" text="See you" variant="other" />);
    expect(container.querySelector("button")).toBeNull();
    expect(container).toHaveTextContent("RiyaSee you");
    const onClick = vi.fn();
    rerender(
      <QuoteBlock
        senderName="Riya"
        text="See you"
        variant="own"
        onClick={onClick}
        label="Go to the message from Riya"
        icon={<i data-testid="ic" />}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go to the message from Riya: See you" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
    rerender(<QuoteBlock senderName="Riya" text="See you" variant="composer" onClick={onClick} tabbable={false} />);
    expect(container.querySelector("button")).toHaveAttribute("tabindex", "-1");
  });
});

describe("AttachmentGrid", () => {
  const photo = (i: number, extra: Partial<ChatAttachment> = {}): ChatAttachment => ({
    id: `p${i}`,
    kind: "image",
    name: `photo-${i}.png`,
    url: pixel,
    ...extra,
  });

  it.each([1, 2, 3, 4, 7])("lays out %i photo(s) and opens the one that is clicked", async (count) => {
    const onOpen = vi.fn();
    const images = Array.from({ length: count }, (_, i) => photo(i));
    const { container } = render(
      <AttachmentGrid images={images} labels={L} onOpen={onOpen} overlay={<b data-testid="ov">9:00</b>} />,
    );
    const buttons = within(container).getAllByRole("button");
    expect(buttons).toHaveLength(Math.min(4, count));
    expect(screen.getByTestId("ov")).toBeInTheDocument();
    await userEvent.click(buttons[buttons.length - 1]!);
    expect(onOpen).toHaveBeenCalledWith(buttons.length - 1);
    if (count > 4) {
      // WCAG 2.5.3: the accessible name starts with the visible "+3", then names the photo.
      expect(buttons[3]!.getAttribute("aria-label")).toMatch(/^\+3 Open photo-3\.png$/);
      expect(buttons[3]).toHaveTextContent("+3");
    }
  });

  it("uses the alt text as the name, a placeholder when there is no picture, and honours tabbable={false}", () => {
    const { container } = render(
      <AttachmentGrid
        images={[photo(0, { alt: "A cat", url: undefined })]}
        labels={L}
        onOpen={vi.fn()}
        tabbable={false}
      />,
    );
    const button = within(container).getByRole("button", { name: "Open A cat", hidden: true });
    expect(button).toHaveAttribute("tabindex", "-1");
    expect(button.querySelector("img")).toBeNull();
    expect(button.querySelector("svg")).not.toBeNull();
  });
});

describe("FileChip", () => {
  it("links to the file with a download name, sizes it, and shows the extension", () => {
    render(
      <FileChip
        file={{
          id: "f",
          kind: "file",
          name: "Q3-report.pdf",
          url: "/r.pdf",
          size: 2_300_000,
          mimeType: "application/pdf",
        }}
        own={false}
        locale="en-US"
        labels={L}
      />,
    );
    const link = screen.getByRole("link", { name: /^Download Q3-report\.pdf/ });
    expect(link).toHaveAttribute("href", "/r.pdf");
    expect(link).toHaveAttribute("download", "Q3-report.pdf");
    expect(link).toHaveTextContent("PDF");
    expect(link.textContent).toMatch(/MB/);
  });

  it("without a url it is plain text; own chips and unknown types still render", () => {
    const { container, rerender } = render(<FileChip file={{ id: "f", kind: "file", name: "notes" }} own labels={L} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container).toHaveTextContent("notes");
    rerender(
      <FileChip
        file={{ id: "f", kind: "file", name: "data.xlsx", url: "/d.xlsx", mimeType: "application/vnd.ms-excel" }}
        own
        tabbable={false}
        labels={L}
      />,
    );
    expect(screen.getByRole("link", { hidden: true })).toHaveAttribute("tabindex", "-1");
    rerender(<FileChip file={{ id: "f", kind: "file", name: "bundle.zip", url: "/b.zip" }} own={false} labels={L} />);
    expect(container).toHaveTextContent("ZIP");
  });
});

describe("LinkPreviewCard", () => {
  it("shows the site (or the host), title and description in one external link", () => {
    const { rerender } = render(
      <LinkPreviewCard
        preview={{ url: "https://www.example.com/docs", title: "Docs", description: "Read more" }}
        own={false}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://www.example.com/docs");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("example.com");
    expect(link).toHaveTextContent("Docs");
    expect(link).toHaveTextContent("Read more");
    rerender(<LinkPreviewCard preview={{ url: "https://x.dev", title: "T", siteName: "Sheen" }} own />);
    expect(screen.getByRole("link")).toHaveTextContent("Sheen");
    rerender(<LinkPreviewCard preview={{ url: "not a url", title: "T" }} own tabbable={false} />);
    expect(screen.getByRole("link", { hidden: true })).toHaveTextContent("not a url");
    expect(screen.getByRole("link", { hidden: true })).toHaveAttribute("tabindex", "-1");
  });

  it("draws an image preview from a url or a CSS gradient", () => {
    const { container, rerender } = render(
      <LinkPreviewCard preview={{ url: "https://x.dev", title: "T", imageUrl: pixel }} own={false} />,
    );
    expect(container.querySelector<HTMLElement>("[aria-hidden]")!.style.backgroundImage).toContain("url(");
    rerender(
      <LinkPreviewCard
        preview={{ url: "https://x.dev", title: "T", imageUrl: "linear-gradient(red, blue)" }}
        own={false}
      />,
    );
    expect(container.querySelector<HTMLElement>("[aria-hidden]")!.style.backgroundImage).toContain("linear-gradient");
  });
});

describe("ReactionChips", () => {
  const nameOf = (id: string) => (id === "riya" ? "Riya" : id);

  it("renders nothing for no reactions; each chip is a named toggle and reports add / remove", async () => {
    const empty = render(
      <ReactionChips
        reactions={[{ emoji: "👍", userIds: [] }]}
        currentUserId="me"
        labels={L}
        nameOf={nameOf}
        own={false}
      />,
    );
    expect(empty.container).toBeEmptyDOMElement();
    empty.unmount();

    const onToggle = vi.fn();
    render(
      <ReactionChips
        reactions={[
          { emoji: "👍", userIds: ["me", "riya"] },
          { emoji: "❤️", userIds: ["riya"] },
        ]}
        currentUserId="me"
        labels={L}
        nameOf={nameOf}
        onToggle={onToggle}
        own
      />,
    );
    expect(screen.getByRole("list", { name: "Reactions" })).toBeInTheDocument();
    const mine = screen.getByRole("button", { pressed: true });
    expect(mine.getAttribute("aria-label")).toMatch(/2, including you/);
    expect(mine).toHaveAttribute("title", "👍 You, Riya");
    const theirs = screen.getByRole("button", { pressed: false });
    await userEvent.click(mine);
    expect(onToggle).toHaveBeenLastCalledWith("👍", false);
    await userEvent.click(theirs);
    expect(onToggle).toHaveBeenLastCalledWith("❤️", true);
  });

  it("is disabled without a handler, and reduced motion still renders", () => {
    setReducedMotion();
    render(
      <ReactionChips
        reactions={[{ emoji: "😂", userIds: ["riya"] }]}
        currentUserId="me"
        labels={L}
        nameOf={nameOf}
        own={false}
        tabbable={false}
      />,
    );
    const chip = screen.getByRole("button", { hidden: true });
    expect(chip).toBeDisabled();
    expect(chip).toHaveAttribute("tabindex", "-1");
  });
});

describe("ImageLightbox", () => {
  const images: ChatAttachment[] = [
    { id: "a", kind: "image", name: "first.png", url: pixel },
    { id: "b", kind: "image", name: "second.png", url: pixel, alt: "Second photo" },
    { id: "c", kind: "image", name: "third.png", thumbnailUrl: pixel },
  ];

  function Host({
    start = 0,
    list = images,
    caption,
  }: {
    start?: number | null;
    list?: ChatAttachment[];
    caption?: string;
  }) {
    const [index, setIndex] = useState<number | null>(start);
    return (
      <div>
        <output data-testid="index">{String(index)}</output>
        <ImageLightbox images={list} index={index} onIndexChange={setIndex} labels={L} caption={caption} />
      </div>
    );
  }

  it("opens as a dialog named after the photo with its position, and walks (and wraps) with the buttons", async () => {
    renderUi(<Host caption="Shared by Riya" />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("first.png");
    expect(within(dialog).getByText("1 of 3")).toBeInTheDocument();
    expect(within(dialog).getByText("Shared by Riya")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Next photo" }));
    expect(screen.getByTestId("index")).toHaveTextContent("1");
    expect(await within(dialog).findByText("2 of 3")).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName("Second photo");
    await userEvent.click(within(dialog).getByRole("button", { name: "Previous photo" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Previous photo" }));
    expect(screen.getByTestId("index")).toHaveTextContent("2");
    await userEvent.click(within(dialog).getByRole("button", { name: "Next photo" }));
    expect(screen.getByTestId("index")).toHaveTextContent("0");
  });

  it("arrow keys move between photos, Escape closes, and the download link names the file", async () => {
    renderUi(<Host />);
    const dialog = await screen.findByRole("dialog");
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    expect(within(dialog).getByRole("link", { name: "Download first.png" })).toHaveAttribute("download", "first.png");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => screen.getByTestId("index").textContent).toBe("1");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => screen.getByTestId("index").textContent).toBe("0");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => screen.getByTestId("index").textContent).toBe("2");
    // The third photo has only a thumbnail: no download link.
    await expect.poll(() => within(dialog).queryByRole("link")).toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByTestId("index")).toHaveTextContent("null");
    await settle();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("right-to-left layouts flip the arrow keys", async () => {
    document.documentElement.dir = "rtl"; // the dialog renders in a portal, so the page direction decides
    try {
      renderUi(<Host />);
      const dialog = await screen.findByRole("dialog");
      await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
      await userEvent.keyboard("{ArrowLeft}");
      await expect.poll(() => screen.getByTestId("index").textContent).toBe("1");
    } finally {
      document.documentElement.removeAttribute("dir");
    }
  });

  it("swipes: a clear horizontal drag changes photo, a short or vertical one does not", async () => {
    renderUi(<Host />);
    const dialog = await screen.findByRole("dialog");
    const stage = within(dialog).getAllByRole("img")[0]!.parentElement!;
    const touch = (x: number, y: number) => new Touch({ identifier: 1, target: stage, clientX: x, clientY: y });
    const swipe = (x0: number, y0: number, x1: number, y1: number) => {
      stage.dispatchEvent(
        new TouchEvent("touchstart", {
          bubbles: true,
          cancelable: true,
          touches: [touch(x0, y0)],
          changedTouches: [touch(x0, y0)],
        }),
      );
      stage.dispatchEvent(
        new TouchEvent("touchend", { bubbles: true, cancelable: true, touches: [], changedTouches: [touch(x1, y1)] }),
      );
    };
    const index = () => screen.getByTestId("index").textContent;
    swipe(200, 100, 100, 105); // towards the start: next
    await expect.poll(index).toBe("1");
    swipe(100, 100, 130, 100); // too short
    swipe(100, 100, 190, 300); // mostly vertical
    await frames(7);
    expect(index()).toBe("1");
    swipe(100, 100, 200, 100); // towards the end: previous
    await expect.poll(index).toBe("0");
    stage.dispatchEvent(new TouchEvent("touchend", { bubbles: true, changedTouches: [touch(0, 0)] })); // no start: ignored
    await frames(7);
    expect(index()).toBe("0");
  });

  it("a single photo has no navigation and no position; closed (null index) renders no dialog; reduced motion works", async () => {
    setReducedMotion();
    const view = renderUi(<Host list={[images[0]!]} />);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByRole("button", { name: "Next photo" })).toBeNull();
    expect(within(dialog).queryByText(/ of /)).toBeNull();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByTestId("index")).toHaveTextContent("0");
    view.unmount();
    renderUi(<Host start={null} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has no axe violations while open", async () => {
    renderUi(<Host />);
    await screen.findByRole("dialog");
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
