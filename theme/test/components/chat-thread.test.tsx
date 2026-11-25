// ChatThread in depth: grouping + day labels + unread divider, header states, the message toolbar
// and context menu, reactions panel, copy / reply / edit / delete / retry / info, quote jumps,
// the photo viewer, loading earlier messages, read receipts, jump-to-latest, and the touch variants.

import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ChatThread, type ChatThreadProps } from "../../src/components/chat/chat-thread";
import type { ChatConversation, ChatDraft, ChatMessage, ChatParticipant } from "../../src/components/chat/types";
import { pixel, settle, frames, holdFor, stable } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const NOW = new Date(2026, 10, 18, 14, 30);
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

const people: ChatParticipant[] = [
  { id: "me", name: "Ava Chen", presence: "online" },
  { id: "riya", name: "Riya Sharma", presence: "online", role: "Support" },
  { id: "arjun", name: "Arjun Mehta", presence: "away" },
  { id: "lena", name: "Lena Fischer", presence: "offline", lastSeenAt: at(300) },
];

const m = (
  id: string,
  senderId: string,
  text: string | undefined,
  minutesAgo: number,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  senderId,
  text,
  createdAt: at(minutesAgo),
  status: senderId === "me" ? "read" : undefined,
  ...extra,
});

const direct: ChatConversation = { id: "c1", participantIds: ["me", "riya"] };
const group: ChatConversation = {
  id: "g1",
  kind: "group",
  title: "Design team",
  participantIds: ["me", "riya", "arjun", "lena"],
};

const history: ChatMessage[] = [
  m("a1", "riya", "Morning!", 60 * 26),
  m("a2", "me", "Hi Riya", 60 * 26 - 1),
  m("b1", "riya", "Did the build pass?", 50),
  m("b2", "riya", "Also see www.example.com/docs for the guide", 49),
  m("b3", "me", "Yes, shipped", 40, { reactions: [{ emoji: "👍", userIds: ["riya"] }] }),
  m("b4", "riya", "Great 🎉", 30, { replyTo: { id: "b3", senderId: "me", text: "Yes, shipped" } }),
  m("b5", "me", "😀", 20),
  m("s1", "riya", "Riya joined the call", 15, { kind: "system" }),
  m("b6", "me", "Oops", 10, { status: "failed" }),
  m("b7", "riya", "Original removed", 8, { deleted: true }),
  m("b8", "me", "Edited text", 5, { editedAt: at(4) }),
];

type Props = Partial<ChatThreadProps>;
function Thread(props: Props) {
  return (
    <div className="h-[560px] w-[420px]">
      <ChatThread
        conversation={direct}
        messages={history}
        participants={people}
        currentUserId="me"
        now={NOW}
        locale="en-US"
        {...props}
      />
    </div>
  );
}
const article = (id: string) => document.querySelector<HTMLElement>(`[data-message-id="${id}"]`)!;
const field = () => screen.getByRole<HTMLTextAreaElement>("textbox");
const log = () => screen.getByRole("log");

function stubCoarse() {
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((q: string) =>
    q.includes("pointer: coarse")
      ? ({
          matches: true,
          media: q,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList)
      : real(q),
  );
}

async function openMenu(id: string) {
  fireEvent.contextMenu(article(id), { clientX: 120, clientY: 200 });
  return screen.findByRole("menu");
}

describe("structure", () => {
  it("groups a sender's quick messages into runs, labels the days, and shows system notes, deleted and edited messages", () => {
    renderUi(<Thread />);
    const days = [...document.querySelectorAll("[data-day]")].map((d) => d.getAttribute("data-day"));
    expect(days).toEqual(["Yesterday", "Today"]);
    expect(article("s1")).toHaveAttribute("data-system");
    expect(article("s1")).toHaveAccessibleName(/Riya joined the call/);
    expect(article("b7")).toHaveTextContent("This message was deleted");
    expect(article("b8")).toHaveTextContent("edited");
    // Run: b1 and b2 are one run (same sender, one minute apart): only the first has the extra top padding.
    expect(article("b1").className).toContain("pt-2.5");
    expect(article("b2").className).toContain("pt-0.5");
    // A link inside a message is clickable and safe.
    expect(within(article("b2")).getByRole("link", { name: "www.example.com/docs" })).toHaveAttribute(
      "href",
      "https://www.example.com/docs",
    );
    // The jumbo-emoji message has no bubble text size class, and the quote shows who it answers.
    expect(within(article("b4")).getByRole("button", { name: /^Go to the message from You: / })).toBeInTheDocument();
  });

  it("in a group, other people's first message of a run shows their name; yours never does", () => {
    renderUi(
      <Thread
        conversation={group}
        messages={[
          m("g1", "riya", "Hello team", 30),
          m("g2", "riya", "More", 29),
          m("g3", "arjun", "Hi", 20),
          m("g4", "me", "Hey", 10),
        ]}
      />,
    );
    expect(within(article("g1")).getByText("Riya Sharma")).toBeInTheDocument();
    expect(within(article("g2")).queryByText("Riya Sharma")).toBeNull();
    expect(within(article("g3")).getByText("Arjun Mehta")).toBeInTheDocument();
    expect(within(article("g4")).queryByText("Ava Chen")).toBeNull();
  });

  it("draws a New messages divider at firstUnreadId and starts a new run there", () => {
    renderUi(<Thread firstUnreadId="b2" />);
    expect(screen.getByRole("separator", { name: "New messages" })).toBeInTheDocument();
    expect(article("b2").className).toContain("pt-2.5");
  });

  it("headings: the level can be 3, and the heading ref is handed out", () => {
    let heading: HTMLHeadingElement | null = null;
    renderUi(<Thread headingLevel={3} headingRef={(el) => void (heading = el)} />);
    expect(screen.getByRole("heading", { level: 3, name: "Riya Sharma" })).toBe(heading);
  });

  it("header subtitle: online, away, last seen, group members, and typing (direct and group)", () => {
    const view = renderUi(<Thread />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    view.rerender(<Thread conversation={{ id: "d2", participantIds: ["me", "arjun"] }} />);
    expect(screen.getByText("Away")).toBeInTheDocument();
    view.rerender(<Thread conversation={{ id: "d3", participantIds: ["me", "lena"] }} />);
    expect(screen.getByText(/Last seen 5h ago/)).toBeInTheDocument();
    view.rerender(<Thread conversation={group} />);
    expect(screen.getByText("4 members, 1 online")).toBeInTheDocument();
    view.rerender(<Thread conversation={{ ...group, typingIds: ["riya", "arjun", "me"] }} />);
    expect(screen.getByText("Riya and Arjun are typing…")).toBeInTheDocument();
    view.rerender(<Thread conversation={{ ...direct, typingIds: ["riya"] }} />);
    expect(screen.getByText("typing…")).toBeInTheDocument();
  });

  it("props switch parts off: no header, no composer, plain surface, compact density, custom empty state, no attachments", () => {
    renderUi(<Thread showHeader={false} showComposer={false} surface="none" density="compact" />);
    // The visible header goes; the heading that names the section stays for screen readers only.
    expect(screen.getByRole("heading", { name: "Riya Sharma" })).toHaveClass("sr-only");
    expect(screen.queryByRole("button", { name: "Voice call" })).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(log()).toBeInTheDocument();
  });

  it("an empty chat shows a custom empty state, or the default beginning-of-chat text", () => {
    const view = renderUi(<Thread messages={[]} emptyState={<p>Say hi!</p>} allowAttachments={false} />);
    expect(screen.getByText("Say hi!")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Attach files" })).toBeNull();
    view.rerender(<Thread messages={[]} />);
    expect(screen.getByText("This is the beginning of your chat with Riya Sharma.")).toBeInTheDocument();
  });

  it("header buttons call back: back, call, video call, info", async () => {
    const [onBack, onCall, onVideoCall, onInfo] = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    renderUi(
      <Thread
        onBack={onBack}
        onCall={onCall}
        onVideoCall={onVideoCall}
        onInfo={onInfo}
        headerActions={<button>Extra</button>}
      />,
    );
    for (const name of ["Back to chats", "Voice call", "Video call", "Contact info"])
      await userEvent.click(screen.getByRole("button", { name }));
    expect([onBack, onCall, onVideoCall, onInfo].map((f) => f.mock.calls.length)).toEqual([1, 1, 1, 1]);
    expect(screen.getByRole("button", { name: "Extra" })).toBeInTheDocument();
  });
});

describe("keyboard", () => {
  it("the newest message is the one tab stop; arrows, Home, End, PageUp and PageDown walk the log", async () => {
    renderUi(<Thread />);
    const tabbable = [...document.querySelectorAll<HTMLElement>("[data-message-id]")].filter((n) => n.tabIndex === 0);
    expect(tabbable.map((n) => n.dataset.messageId)).toEqual(["b8"]);
    article("b8").focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(article("b7"));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(article("b8"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(article("a1"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(article("b8"));
    await userEvent.keyboard("{PageUp}");
    expect(document.activeElement).toBe(article("a1")); // 10 up, clamped
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(article("b1"));
    await userEvent.keyboard("{PageDown}");
    expect(document.activeElement).toBe(article("b8")); // 10 down, clamped
    await userEvent.keyboard("{ArrowUp}");
    // The roving stop follows focus.
    expect(article("b7").tabIndex).toBe(0);
    expect(article("b8").tabIndex).toBe(-1);
  });

  it("R replies to the focused message, E edits your own, and neither works on system notes or deleted messages", async () => {
    const onEdit = vi.fn();
    renderUi(<Thread onEdit={onEdit} />);
    article("b1").focus();
    await userEvent.keyboard("r");
    expect(await screen.findByText("Replying to Riya Sharma")).toBeInTheDocument();
    expect(document.activeElement).toBe(field());
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByText("Replying to Riya Sharma")).toBeNull();
    article("b8").focus();
    await userEvent.keyboard("e");
    expect(screen.getByRole("textbox", { name: "Editing message" })).toHaveValue("Edited text");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("textbox", { name: "Editing message" })).toBeNull();
    article("s1").focus();
    await userEvent.keyboard("r");
    article("b7").focus();
    await userEvent.keyboard("r");
    expect(screen.queryByText(/^Replying to/, { ignore: "script, style, [hidden]" })).toBeNull();
    // E on someone else's message does nothing.
    article("b1").focus();
    await userEvent.keyboard("e");
    expect(screen.queryByRole("textbox", { name: "Editing message" })).toBeNull();
  });

  it("modifier keys are left alone, and keys typed inside a message's controls do not move the log", async () => {
    renderUi(<Thread />);
    article("b8").focus();
    await userEvent.keyboard("{Control>}{ArrowUp}{/Control}");
    expect(document.activeElement).toBe(article("b8"));
    // Escape inside a control returns focus to the message.
    const link = within(article("b2")).getByRole("link");
    link.focus();
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(article("b2"));
  });

  it("ArrowUp on the first message asks for earlier messages, then moves on to the one above it once they load", async () => {
    const onLoadOlder = vi.fn();
    function Host() {
      const [older, setOlder] = useState(false);
      const list = older
        ? [m("o1", "riya", "Earlier", 60 * 50), m("o2", "me", "Earlier still", 60 * 49), ...history.slice(0, 3)]
        : history.slice(0, 3);
      return (
        <Thread
          messages={list}
          hasOlder={!older}
          onLoadOlder={() => {
            onLoadOlder();
            setOlder(true);
          }}
        />
      );
    }
    renderUi(<Host />);
    // A short history loads more immediately, so let that happen first.
    await expect.poll(() => onLoadOlder.mock.calls.length).toBeGreaterThan(0);
    await expect.poll(() => article("o1")).not.toBeNull();
    article("a1").focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(article("o2"));
  });

  it("Enter on a message opens its actions menu; Space too", async () => {
    renderUi(<Thread onEdit={vi.fn()} onDelete={vi.fn()} onReact={vi.fn()} />);
    article("b8").focus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Reply/ })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(screen.queryByRole("menu")).toBeNull();
    article("b1").focus();
    await userEvent.keyboard(" ");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  });
});

describe("message menu", () => {
  it("own message: reply, copy, edit, message info, delete (no retry unless failed); others: no edit / delete", async () => {
    renderUi(<Thread onEdit={vi.fn()} onDelete={vi.fn()} onReact={vi.fn()} onRetry={vi.fn()} />);
    let menu = await openMenu("b8");
    const names = within(menu)
      .getAllByRole("menuitem")
      .map((i) => i.textContent);
    expect(names.join("|")).toMatch(/Reply.*Copy text.*Edit.*Message info.*Delete/);
    expect(names.join("|")).not.toMatch(/Retry/);
    await userEvent.keyboard("{Escape}");
    await settle();
    menu = await openMenu("b1");
    const other = within(menu)
      .getAllByRole("menuitem")
      .map((i) => i.textContent);
    expect(other.join("|")).toMatch(/Reply.*Copy text/);
    expect(other.join("|")).not.toMatch(/Edit|Delete|Message info/);
    await userEvent.keyboard("{Escape}");
  });

  it("a failed message offers Retry in its menu and in its row", async () => {
    const onRetry = vi.fn<(message: ChatMessage) => void>();
    renderUi(<Thread onRetry={onRetry} />);
    const menu = await openMenu("b6");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Retry/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry.mock.calls[0]![0].id).toBe("b6");
    await userEvent.click(within(article("b6")).getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("Reply from the menu opens the reply bar and an attachment-only message is described as a photo", async () => {
    renderUi(
      <Thread
        messages={[
          ...history,
          m("p1", "riya", undefined, 3, { attachments: [{ id: "i1", kind: "image", name: "cat.png", url: pixel }] }),
        ]}
      />,
    );
    const menu = await openMenu("p1");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Reply/ }));
    expect(await screen.findByText("Replying to Riya Sharma")).toBeInTheDocument();
    expect(screen.getAllByText("Photo").length).toBeGreaterThan(0);
  });

  it("Copy writes the text to the clipboard and says so; a failure or a missing clipboard says that instead", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    try {
      renderUi(<Thread />);
      let menu = await openMenu("b1");
      await userEvent.click(within(menu).getByRole("menuitem", { name: /Copy text/ }));
      expect(writeText).toHaveBeenCalledWith("Did the build pass?");
      expect(await screen.findAllByText("Copied")).not.toHaveLength(0);

      writeText.mockRejectedValueOnce(new Error("denied"));
      menu = await openMenu("b1");
      await userEvent.click(within(menu).getByRole("menuitem", { name: /Copy text/ }));
      expect((await screen.findAllByText(/Couldn't copy/)).length).toBeGreaterThan(0);

      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
      menu = await openMenu("b1");
      await userEvent.click(within(menu).getByRole("menuitem", { name: /Copy text/ }));
      expect((await screen.findAllByText(/Couldn't copy/)).length).toBeGreaterThan(0);
    } finally {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("Edit from the menu fills the composer; saving calls onEdit with the new text", async () => {
    const onEdit = vi.fn();
    renderUi(<Thread onEdit={onEdit} />);
    const menu = await openMenu("b8");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Edit/ }));
    expect(field()).toHaveValue("Edited text");
    await userEvent.fill(field(), "Fixed text");
    await userEvent.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledWith("b8", "Fixed text");
  });

  it("↑ in an empty composer edits your last editable message", async () => {
    renderUi(<Thread onEdit={vi.fn()} />);
    field().focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("textbox", { name: "Editing message" })).toHaveValue("Edited text");
  });

  it("Message info shows when it was sent, delivered and read", async () => {
    renderUi(
      <Thread
        messages={[
          m("x1", "me", "Hello", 12, { status: "delivered" }),
          m("x2", "me", "Seen", 11, { status: "read", readAt: at(9) }),
        ]}
      />,
    );
    let menu = await openMenu("x1");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Message info" }));
    const dialog = await screen.findByRole("dialog", { name: "Message info" });
    expect(within(dialog).getByText("Sent")).toBeInTheDocument();
    expect(within(dialog).getByText("Delivered")).toBeInTheDocument();
    expect(within(dialog).getByText("Not yet")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await settle();
    menu = await openMenu("x2");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Message info" }));
    const read = await screen.findByRole("dialog", { name: "Message info" });
    expect(within(read).queryByText("Not yet")).toBeNull();
    await userEvent.keyboard("{Escape}");
  });

  it("Delete asks first; confirming calls onDelete", async () => {
    const onDelete = vi.fn<(message: ChatMessage) => void>();
    renderUi(<Thread onDelete={onDelete} />);
    const menu = await openMenu("b8");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Delete" }));
    await userEvent.click(await screen.findByRole("button", { name: "Delete for everyone" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete.mock.calls[0]![0].id).toBe("b8");
  });

  it("the menu has quick reactions (checkable) and a way to more emoji", async () => {
    const onReact = vi.fn<(message: ChatMessage, emoji: string, add: boolean) => void>();
    renderUi(<Thread onReact={onReact} />);
    const menu = await openMenu("b3");
    const thumbs = within(menu).getByRole("menuitemcheckbox", { name: /thumbs up/i });
    expect(thumbs).toHaveAttribute("aria-checked", "false"); // Riya reacted, not me
    await userEvent.click(thumbs);
    expect(onReact).toHaveBeenCalledWith(expect.objectContaining({ id: "b3" }), "👍", true);

    const again = await openMenu("b3");
    await userEvent.click(within(again).getByRole("menuitem", { name: "More emoji" }));
    const panel = await screen.findByRole("dialog", { name: "Add reaction" });
    expect(panel).toBeInTheDocument();
    await userEvent.click(within(panel).getByRole("button", { name: /red heart/i }));
    expect(onReact).toHaveBeenLastCalledWith(expect.objectContaining({ id: "b3" }), "❤️", true);
  });

  it("right-clicking away from a message leaves the browser's own menu alone", async () => {
    renderUi(<Thread />);
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    log().dispatchEvent(event);
    await frames(7);
    expect(screen.queryByRole("menu")).toBeNull();
    // A deleted message and a system note have no menu either.
    fireEvent.contextMenu(article("b7"));
    fireEvent.contextMenu(article("s1"));
    await frames(7);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("hover toolbar + reactions", () => {
  it("hovering a message shows React / Reply / More actions; React opens the picker and picking toggles a reaction", async () => {
    const onReact = vi.fn<(message: ChatMessage, emoji: string, add: boolean) => void>();
    renderUi(<Thread onReact={onReact} />);
    await userEvent.hover(article("b1"));
    const bar = await screen.findByRole("toolbar", { name: "More actions" });
    await settle();
    await userEvent.click(within(bar).getByRole("button", { name: "React" }));
    const panel = await screen.findByRole("dialog", { name: "Add reaction" });
    await userEvent.click(within(panel).getByRole("button", { name: /laughing|joy|tears/i }));
    expect(onReact).toHaveBeenCalledTimes(1);
    expect(onReact.mock.calls[0]![0].id).toBe("b1");
    expect(onReact.mock.calls[0]![2]).toBe(true);
    await settle();
    expect(screen.queryByRole("dialog", { name: "Add reaction" })).toBeNull();
  });

  it("the reaction panel marks emoji you already chose as pressed, and picking one removes it", async () => {
    const onReact = vi.fn<(message: ChatMessage, emoji: string, add: boolean) => void>();
    renderUi(
      <Thread
        onReact={onReact}
        messages={[m("r1", "riya", "Nice", 5, { reactions: [{ emoji: "👍", userIds: ["me", "riya"] }] })]}
      />,
    );
    await userEvent.hover(article("r1"));
    await screen.findByRole("toolbar", { name: "More actions" });
    await settle();
    await userEvent.click(await screen.findByRole("button", { name: "React" }));
    const panel = await screen.findByRole("dialog", { name: "Add reaction" });
    const mine = within(panel).getByRole("button", { name: /thumbs up/i });
    expect(mine).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(mine);
    expect(onReact).toHaveBeenCalledWith(expect.objectContaining({ id: "r1" }), "👍", false);
  });

  it("the panel's More emoji button expands the full emoji picker", async () => {
    renderUi(<Thread onReact={vi.fn()} />);
    await userEvent.hover(article("b1"));
    await screen.findByRole("toolbar", { name: "More actions" });
    await settle();
    await userEvent.click(await screen.findByRole("button", { name: "React" }));
    const panel = await screen.findByRole("dialog", { name: "Add reaction" });
    const more = within(panel).getByRole("button", { name: "More emoji" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(more);
    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(await within(panel).findByRole("searchbox", { name: "Search emoji" })).toBeInTheDocument();
  });

  it("the toolbar's Reply starts a reply and its More actions opens the same menu; arrows move inside the toolbar", async () => {
    renderUi(<Thread onReact={vi.fn()} />);
    article("b1").focus();
    await userEvent.hover(article("b1"));
    const bar = await screen.findByRole("toolbar", { name: "More actions" });
    const buttons = within(bar).getAllByRole("button");
    expect(buttons).toHaveLength(3);
    buttons[0]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[1]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(buttons[2]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(buttons[0]); // wraps
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(buttons[2]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.keyboard("x"); // other keys pass through

    await settle();
    await userEvent.click(within(bar).getByRole("button", { name: "Reply" }));
    expect(await screen.findByText("Replying to Riya Sharma")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await userEvent.unhover(article("b1")); // the first toolbar leaves; wait until it is really gone before a new hover
    await expect.poll(() => screen.queryByRole("toolbar", { name: "More actions" })).toBeNull();
    await settle();

    await userEvent.hover(article("b1"));
    const again = await screen.findByRole("toolbar", { name: "More actions" });
    await settle();
    await userEvent.click(within(again).getByRole("button", { name: "More actions" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Reply/ })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  });

  it("deleted messages and system notes get no toolbar", async () => {
    renderUi(<Thread />);
    await userEvent.hover(article("b7"));
    await frames(7);
    expect(screen.queryByRole("toolbar")).toBeNull();
  });
});

describe("quotes + photos", () => {
  it("clicking a quote jumps to the original message and flashes it; a missing original says so", async () => {
    renderUi(
      <Thread
        messages={[
          ...history,
          m("q1", "riya", "About that", 3, { replyTo: { id: "ghost", senderId: "me", text: "Not loaded" } }),
          m("q2", "me", "Answer", 2, { replyTo: { id: "a1", senderId: "riya", text: "Morning!" } }),
        ]}
      />,
    );
    await userEvent.click(within(article("q2")).getByRole("button", { name: /^Go to the message from Riya Sharma: / }));
    await expect.poll(() => document.activeElement).toBe(article("a1"));

    await userEvent.click(within(article("q1")).getByRole("button", { name: /^Go to the message from You: / }));
    expect((await screen.findAllByText("The original message isn't loaded yet.")).length).toBeGreaterThan(0);
  });

  it("photos open in a viewer; Escape closes it and focus returns to the photo", async () => {
    const images = [1, 2, 3].map((i) => ({ id: `img${i}`, kind: "image" as const, name: `shot-${i}.png`, url: pixel }));
    renderUi(<Thread messages={[...history, m("ph", "riya", "Look", 2, { attachments: images })]} />);
    const second = within(article("ph")).getByRole("button", { name: "Open shot-2.png" });
    await userEvent.click(second);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("2 of 3")).toBeInTheDocument();
    expect(within(dialog).getByText(/Riya Sharma · /)).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await settle();
    await expect.poll(() => document.activeElement).toBe(second);
  });

  it("files and link previews render inside messages", () => {
    renderUi(
      <Thread
        messages={[
          m("f1", "riya", "Report attached", 4, {
            attachments: [{ id: "f", kind: "file", name: "q3.pdf", url: "/q3.pdf", size: 12_000 }],
          }),
          m("l1", "me", "Check this", 3, {
            linkPreview: { url: "https://example.com", title: "SheenUI", description: "Glass components" },
          }),
        ]}
      />,
    );
    expect(within(article("f1")).getByRole("link", { name: /^Download q3\.pdf/ })).toBeInTheDocument();
    expect(within(article("l1")).getByRole("link", { name: /SheenUI/ })).toHaveAttribute("href", "https://example.com");
  });
});

describe("loading, reading and scrolling", () => {
  const many = (n: number, from = 0): ChatMessage[] =>
    Array.from({ length: n }, (_, i) =>
      m(`n${from + i}`, (from + i) % 2 ? "me" : "riya", `Message number ${from + i}`, 600 - (from + i) * 2),
    );

  it("shows a loading state while earlier messages arrive and the beginning note once there are none", () => {
    const view = renderUi(<Thread hasOlder loadingOlder onLoadOlder={vi.fn()} />);
    expect(log()).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading earlier messages…")).toBeInTheDocument();
    view.rerender(<Thread hasOlder={false} />);
    expect(log()).not.toHaveAttribute("aria-busy");
    expect(screen.getByText("This is the beginning of your chat with Riya Sharma.")).toBeInTheDocument();
  });

  it("asks for earlier messages when the reader scrolls near the top (not while loading)", async () => {
    const onLoadOlder = vi.fn();
    renderUi(<Thread messages={many(60)} hasOlder onLoadOlder={onLoadOlder} />);
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    await stable(() => scroller.scrollTop); // the initial jump to the newest message has finished
    onLoadOlder.mockClear();
    scroller.scrollTop = 0;
    await expect.poll(() => onLoadOlder.mock.calls.length).toBeGreaterThan(0);
  });

  it("prepended history keeps the reader's place and is revealed a few at a time", async () => {
    function Host() {
      const [list, setList] = useState(many(30, 100));
      return (
        <Thread
          messages={list}
          hasOlder
          onLoadOlder={() => setList((l) => (l.length > 30 ? l : [...many(30, 0), ...l]))}
        />
      );
    }
    renderUi(<Host />);
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    scroller.scrollTop = 0;
    await expect
      .poll(() => document.querySelectorAll("[data-message-id]").length, { timeout: 5000 })
      .toBeGreaterThan(40);
    await expect.poll(() => log().getAttribute("aria-busy"), { timeout: 5000 }).toBeNull();
  });

  it("reports the newest message as read when it is from someone else, once; not when it is yours", async () => {
    const onRead = vi.fn();
    const view = renderUi(<Thread onRead={onRead} />);
    expect(onRead).not.toHaveBeenCalled(); // last message is mine
    view.rerender(<Thread onRead={onRead} messages={[...history, m("in1", "riya", "New one", 1)]} />);
    await expect.poll(() => onRead.mock.calls.length).toBe(1);
    expect(onRead).toHaveBeenCalledWith("in1");
  });

  it("scrolled up: new incoming messages raise a jump button with a count, and it returns to the latest", async () => {
    const view = renderUi(<Thread messages={many(60)} />);
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    scroller.scrollTop = 0;
    await screen.findByRole("button", { name: "Jump to latest message" });
    view.rerender(<Thread messages={[...many(60), m("new1", "riya", "Anyone there?", 0)]} />);
    await expect.poll(() => screen.getByRole("button", { name: /Jump to latest message, 1 new message/ })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /Jump to latest message/ }));
    await expect
      .poll(() => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight, { timeout: 4000 })
      .toBeLessThan(60);
    await expect.poll(() => screen.queryByRole("button", { name: /Jump to latest message/ })).toBeNull();
    expect(document.activeElement).toBe(field());
  });

  it("announces an incoming message in a polite live region, but not your own", async () => {
    const view = renderUi(<Thread />);
    view.rerender(<Thread messages={[...history, m("in2", "riya", "Heads up", 0)]} />);
    await expect.poll(() => screen.getAllByRole("status").map((s) => s.textContent)).toContain("Riya Sharma: Heads up");
  });

  it("your own new message sticks to the bottom", async () => {
    const view = renderUi(<Thread messages={many(60)} />);
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    scroller.scrollTop = 200;
    view.rerender(<Thread messages={[...many(60), m("mine", "me", "Done", 0)]} />);
    await expect
      .poll(() => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight, { timeout: 4000 })
      .toBeLessThan(60);
  });

  it("opens at the New messages divider when there are unread messages", async () => {
    renderUi(<Thread messages={many(60)} firstUnreadId="n20" />);
    const scroller = log().closest("[data-chat-log]")!;
    const divider = await screen.findByRole("separator", { name: "New messages" });
    await expect
      .poll(() => divider.getBoundingClientRect().top - scroller.getBoundingClientRect().top, { timeout: 3000 })
      .toBeLessThan(150);
  });

  it("late-arriving unread info moves the view to the divider, unless the reader already scrolled", async () => {
    const view = renderUi(<Thread messages={many(60)} />);
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    view.rerender(<Thread messages={many(60)} firstUnreadId="n10" />);
    const divider = await screen.findByRole("separator", { name: "New messages" });
    await expect
      .poll(() => divider.getBoundingClientRect().top - scroller.getBoundingClientRect().top, { timeout: 3000 })
      .toBeLessThan(150);
  });

  it("scrolling by hand shows the floating day pill for the day at the top", async () => {
    renderUi(
      <Thread
        messages={[
          ...many(40, 0).map((x, i) => ({
            ...x,
            createdAt: new Date(NOW.getTime() - (4 - Math.floor(i / 10)) * 86_400_000).toISOString(),
          })),
          ...many(40, 40),
        ]}
      />,
    );
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    scroller.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: -100 }));
    scroller.scrollTop = 600;
    await frames(16);
    // Whatever day is on top, the pill never covers a visible day label: it is simply present in the DOM.
    expect(scroller.querySelector("[data-show], span.pointer-events-none, span")).not.toBeNull();
  });
});

describe("controlled draft + typing + quick replies", () => {
  it("passes draft, onDraftChange, onTyping and quickReplies to the composer; a quick reply sends", async () => {
    const onSend = vi.fn<(draft: ChatDraft) => void>();
    const onTyping = vi.fn();
    const onDraftChange = vi.fn();
    function Host() {
      const [draft, setDraft] = useState("");
      return (
        <Thread
          draft={draft}
          onDraftChange={(t) => {
            onDraftChange(t);
            setDraft(t);
          }}
          onTyping={onTyping}
          onSend={onSend}
          quickReplies={["Thanks!", "Got it"]}
          accept="image/*"
          autoFocus
        />
      );
    }
    renderUi(<Host />);
    await expect.poll(() => document.activeElement).toBe(field());
    await userEvent.keyboard("hey");
    expect(onDraftChange).toHaveBeenLastCalledWith("hey");
    expect(onTyping).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onSend.mock.calls.at(-1)![0].text).toBe("Got it");
  });

  it("exposes the composer through composerRef", () => {
    let handle: { textarea: HTMLTextAreaElement | null } | null = null;
    renderUi(<Thread composerRef={(h) => void (handle = h)} />);
    expect(handle!.textarea).toBe(field());
  });
});

describe("touch + reduced motion", () => {
  it("on a touch screen the reaction picker is a bottom sheet and message info a sheet too", async () => {
    stubCoarse();
    const onReact = vi.fn<(message: ChatMessage, emoji: string, add: boolean) => void>();
    renderUi(<Thread onReact={onReact} />);
    let menu = await openMenu("b8");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "More emoji" }));
    const sheet = await screen.findByRole("dialog", { name: "Add reaction" });
    await userEvent.click(
      within(sheet)
        .getAllByRole("button")
        .find((b) => b.getAttribute("aria-pressed") !== null)!,
    );
    expect(onReact).toHaveBeenCalledTimes(1);
    await settle();
    menu = await openMenu("b8");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Message info" }));
    expect(await screen.findByRole("dialog", { name: "Message info" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  });

  it("with touch, Return in the composer adds a line and the hover toolbar is not used", async () => {
    stubCoarse();
    renderUi(<Thread />);
    await userEvent.hover(article("b1"));
    await holdFor(100);
    expect(screen.queryByRole("toolbar")).toBeNull();
  });

  it("a long press (held over 450 ms) opens the menu through the touch guard without it closing again", async () => {
    stubCoarse();
    renderUi(<Thread />);
    const row = article("b1");
    fireEvent.pointerDown(row, { pointerType: "touch", button: 0 });
    fireEvent.touchStart(row);
    await holdFor(520);
    fireEvent.contextMenu(row, { clientX: 100, clientY: 100 });
    await screen.findByRole("menu");
    fireEvent.touchEnd(row);
    fireEvent.click(document.body);
    await frames(7);
    expect(screen.queryByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  });

  it("works with reduced motion (jump to latest uses instant scroll)", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    const msgs = Array.from({ length: 60 }, (_, i) => m(`k${i}`, i % 2 ? "me" : "riya", `Line ${i}`, 600 - i * 2));
    renderUi(<Thread messages={msgs} />);
    const scroller = log().closest("[data-chat-log]")!;
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(300);
    scroller.scrollTop = 0;
    await userEvent.click(await screen.findByRole("button", { name: "Jump to latest message" }));
    await expect.poll(() => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight).toBeLessThan(60);
  });

  const withoutQuote = history.map(({ replyTo: _quote, ...rest }) => rest as ChatMessage);

  it("has no axe violations with the actions menu open", async () => {
    renderUi(<Thread messages={withoutQuote} onReact={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    await openMenu("b8");
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.keyboard("{Escape}");
  });

  it("a quoted reply has no axe violations (the quote button's name contains its visible text)", async () => {
    renderUi(<Thread />);
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
