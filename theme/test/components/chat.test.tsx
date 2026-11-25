// Chat: ConversationList (listbox keyboard, search, filters), ChatThread (role=log, composer Enter /
// Shift+Enter, delete confirm, reactions) and ChatWidget (open, Escape, focus return).

import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ConversationList } from "../../src/components/chat/conversation-list";
import { ChatThread } from "../../src/components/chat/chat-thread";
import { ChatWidget } from "../../src/components/chat/chat-widget";
import type { ChatConversation, ChatDraft, ChatMessage, ChatParticipant } from "../../src/components/chat/types";
import { settle } from "../helpers";
import { setReducedMotion } from "../helpers-text";
import { describeVariants, renderUi, runAxe } from "../render";

const NOW = new Date("2026-11-08T10:00:00Z");
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

const people: ChatParticipant[] = [
  { id: "me", name: "Ava Chen", presence: "online" },
  { id: "riya", name: "Riya Sharma", presence: "online", role: "Support" },
  { id: "arjun", name: "Arjun Mehta", presence: "away" },
  { id: "lena", name: "Lena Fischer", presence: "offline", lastSeenAt: at(300) },
];

const msg = (
  id: string,
  senderId: string,
  text: string,
  minutesAgo: number,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  senderId,
  text,
  createdAt: at(minutesAgo),
  ...extra,
});

const conversations: ChatConversation[] = [
  {
    id: "c1",
    participantIds: ["me", "riya"],
    lastMessage: msg("m1", "riya", "Shipping tomorrow morning", 5),
    unreadCount: 2,
    pinned: true,
  },
  {
    id: "c2",
    participantIds: ["me", "arjun"],
    lastMessage: msg("m2", "me", "Thanks, sounds good", 90),
    unreadCount: 0,
  },
  {
    id: "c3",
    kind: "group",
    title: "Design team",
    participantIds: ["me", "riya", "lena"],
    lastMessage: msg("m3", "lena", "New mockups are up", 300),
    unreadCount: 5,
  },
  { id: "c4", participantIds: ["me", "lena"], lastMessage: msg("m4", "lena", "Old thread", 2000), archived: true },
];

/* ---------- ConversationList ---------- */

function ListExample({
  onSelect,
  onAction,
  selectedId = null,
}: {
  onSelect?: (c: ChatConversation) => void;
  onAction?: (c: ChatConversation, a: string) => void;
  selectedId?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(selectedId);
  return (
    <div className="h-[560px] w-[360px]">
      <ConversationList
        conversations={conversations}
        participants={people}
        currentUserId="me"
        selectedId={selected}
        onSelect={(c) => {
          setSelected(c.id);
          onSelect?.(c);
        }}
        onAction={onAction}
        now={NOW}
        locale="en-US"
      />
    </div>
  );
}

const listbox = () => screen.getByRole("listbox");
const options = () => within(listbox()).getAllByRole("option");
const optionNames = () => options().map((o) => o.textContent);

describe("ConversationList", () => {
  it("is a named single-select listbox of options with position info; archived chats are hidden by default", () => {
    renderUi(<ListExample selectedId="c2" />);
    const lb = listbox();
    expect(lb).toHaveAccessibleName("Chats");
    expect(lb).toHaveAttribute("aria-orientation", "vertical");
    const rows = options();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveAttribute("aria-posinset", "1");
    expect(rows[0]).toHaveAttribute("aria-setsize", "3");
    expect(rows.filter((r) => r.getAttribute("aria-selected") === "true")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Chats" })).toBeInTheDocument();
    // Pinned chats come first, then by newest activity.
    expect(optionNames()[0]).toContain("Riya Sharma");
    expect(optionNames().join("|")).not.toContain("Old thread");
    // The keyboard hint is attached to the listbox.
    expect(lb).toHaveAccessibleDescription(/Arrow keys move between chats/);
  });

  it("is one tab stop; arrows, Home/End move; Enter and Space select", async () => {
    const onSelect = vi.fn();
    renderUi(
      <div>
        <button>before</button>
        <ListExample onSelect={onSelect} />
        <button>after</button>
      </div>,
    );
    screen.getByRole("button", { name: "before" }).focus();
    // Tab order: the search field, the filter control, then exactly one row.
    let tabs = 0;
    while (!options().includes(document.activeElement as HTMLElement) && tabs++ < 8) await userEvent.tab();
    expect(options()[0]).toHaveFocus();
    expect(options().filter((o) => o.tabIndex === 0)).toHaveLength(1);

    await userEvent.keyboard("{ArrowDown}");
    expect(options()[1]).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(options()[2]).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(options()[0]).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c2" }));
    await expect.poll(() => options()[1]!.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c3" }));
  });

  it("typing a name jumps to that chat (typeahead)", async () => {
    renderUi(<ListExample />);
    options()[0]!.focus();
    await userEvent.keyboard("d");
    await expect.poll(() => document.activeElement?.textContent).toContain("Design team");
  });

  it("search filters the list, announces the count, and shows a no-results state with a clear button", async () => {
    renderUi(<ListExample />);
    const search = screen.getByRole("searchbox", { name: "Search chats" });
    await userEvent.click(search);
    await userEvent.keyboard("mock");
    await expect.poll(() => options().length).toBe(1);
    expect(optionNames()[0]).toContain("Design team");
    await expect.poll(() => screen.getAllByRole("status").some((s) => s.textContent.includes("1"))).toBe(true);

    await userEvent.clear(search);
    await userEvent.keyboard("zzzz");
    await expect.poll(() => screen.queryByRole("listbox")).toBeNull();
    // The empty state, and (once typing pauses) the polite announcement of it: one or both can be present.
    expect((await screen.findAllByText(/No chats match/)).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    await expect.poll(() => options().length).toBe(3);
    expect(search).toHaveFocus();
  });

  it("controlled query / filter: filters narrow the rows and report changes", async () => {
    const onFilterChange = vi.fn();
    renderUi(
      <div className="h-[560px] w-[360px]">
        <ConversationList
          conversations={conversations}
          participants={people}
          currentUserId="me"
          onFilterChange={onFilterChange}
          now={NOW}
          locale="en-US"
        />
      </div>,
    );
    // The filters are a toggle group: a named group of pressed-state buttons.
    const filters = screen.getByRole("group", { name: "Filter chats" });
    await userEvent.click(within(filters).getByRole("button", { name: /Unread/ }));
    await expect
      .poll(() =>
        within(filters)
          .getByRole("button", { name: /Unread/ })
          .getAttribute("aria-pressed"),
      )
      .toBe("true");
    expect(onFilterChange).toHaveBeenLastCalledWith("unread");
    await expect.poll(() => options().length).toBe(2);
    await userEvent.click(within(filters).getByRole("button", { name: /Archived/ }));
    await expect.poll(() => optionNames().join("|")).toContain("Old thread");
    await userEvent.click(within(filters).getByRole("button", { name: /Groups/ }));
    await expect.poll(() => options().length).toBe(1);
  });

  it("labels override the visible and accessible strings", () => {
    renderUi(
      <div className="h-[560px] w-[360px]">
        <ConversationList
          conversations={conversations}
          participants={people}
          currentUserId="me"
          now={NOW}
          locale="en-US"
          labels={{ chats: "Conversaciones", search: "Buscar chats", filtersLabel: "Filtrar" }}
        />
      </div>,
    );
    expect(screen.getByRole("listbox", { name: "Conversaciones" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar chats" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filtrar" })).toBeInTheDocument();
  });

  it("title={false} hides the heading but the list keeps its name; loading shows a named skeleton", () => {
    const view = renderUi(
      <div className="h-[560px] w-[360px]">
        <ConversationList
          conversations={conversations}
          participants={people}
          currentUserId="me"
          title={false}
          now={NOW}
          locale="en-US"
        />
      </div>,
    );
    // The heading stays in the tree as the list's name, but is visually hidden.
    expect(screen.getByRole("heading", { name: "Chats" }).closest(".sr-only")).not.toBeNull();
    expect(screen.getByRole("listbox", { name: "Chats" })).toBeInTheDocument();
    view.unmount();
    renderUi(
      <div className="h-[560px] w-[360px]">
        <ConversationList
          conversations={conversations}
          participants={people}
          currentUserId="me"
          loading
          now={NOW}
          locale="en-US"
        />
      </div>,
    );
    expect(screen.getAllByText("Loading chats…").length).toBeGreaterThan(0);
  });

  it("empty list shows 'No chats yet'", () => {
    renderUi(
      <div className="h-[560px] w-[360px]">
        <ConversationList conversations={[]} participants={people} currentUserId="me" now={NOW} locale="en-US" />
      </div>,
    );
    expect(screen.getByText("No chats yet")).toBeInTheDocument();
  });

  it("Shift+F10 on a row opens its actions menu; choosing an action calls onAction", async () => {
    const onAction = vi.fn<(conversation: ChatConversation, action: string) => void>();
    renderUi(<ListExample onAction={onAction} />);
    options()[1]!.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Pin/ }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0]![0].id).toBe("c2");
    expect(onAction.mock.calls[0]![1]).toBe("pin");
    await expect.poll(() => screen.queryByRole("menu")).toBeNull();
  });

  it("the unread count is exposed to assistive tech with the chat's name", () => {
    renderUi(<ListExample />);
    const design = options().find((o) => o.textContent.includes("Design team"))!;
    expect(design.textContent).toMatch(/5 unread/);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<ListExample selectedId="c1" />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- ChatThread ---------- */

const baseMessages: ChatMessage[] = [
  msg("t1", "riya", "Hi! How can I help?", 30),
  msg("t2", "me", "Is my order on its way?", 28, { status: "read" }),
  msg("t3", "riya", "Yes, shipping tomorrow.", 20, { reactions: [{ emoji: "👍", userIds: ["me"] }] }),
  msg("t4", "me", "This one failed", 10, { status: "failed" }),
];

function ThreadExample({
  onSend,
  onDelete,
  onReact,
  onRetry,
  initial = baseMessages,
  composer = true,
}: {
  onSend?: (draft: ChatDraft) => void;
  onDelete?: (m: ChatMessage) => void;
  onReact?: (m: ChatMessage, emoji: string, add: boolean) => void;
  onRetry?: (m: ChatMessage) => void;
  initial?: ChatMessage[];
  composer?: boolean;
}) {
  return (
    <div className="h-[640px] w-[420px]">
      <ChatThread
        conversation={conversations[0]!}
        messages={initial}
        participants={people}
        currentUserId="me"
        onSend={onSend}
        onDelete={onDelete}
        onReact={onReact}
        onRetry={onRetry}
        showComposer={composer}
        now={NOW}
        locale="en-US"
      />
    </div>
  );
}

const field = () => screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Message" });

describe("ChatThread", () => {
  it("is a role=log named after the chat, with the messages as articles and a heading for the chat", () => {
    renderUi(<ThreadExample />);
    const log = screen.getByRole("log", { name: "Messages with Riya Sharma" });
    expect(screen.getByRole("heading", { name: /Riya Sharma/ })).toBeInTheDocument();
    expect(within(log).getByText("Hi! How can I help?")).toBeInTheDocument();
    expect(within(log).getByText("Yes, shipping tomorrow.")).toBeInTheDocument();
    // Each message names its sender and time for screen readers.
    expect(log.textContent).toMatch(/Riya Sharma, /);
    // The log is not a live region itself (new incoming messages are announced separately, once).
    expect(log.getAttribute("aria-live")).not.toBe("assertive");
  });

  it("Enter sends the text and clears the field; Shift+Enter adds a new line instead", async () => {
    const onSend = vi.fn<(draft: ChatDraft) => void>();
    renderUi(<ThreadExample onSend={onSend} />);
    field().focus();
    await userEvent.keyboard("first line{Shift>}{Enter}{/Shift}second line");
    expect(field().value).toBe("first line\nsecond line");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0]![0].text).toBe("first line\nsecond line");
    await expect.poll(() => field().value).toBe("");
  });

  it("an empty message cannot be sent: Enter does nothing and the send button is disabled", async () => {
    const onSend = vi.fn<(draft: ChatDraft) => void>();
    renderUi(<ThreadExample onSend={onSend} />);
    field().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
    const send = screen.getByRole("button", { name: "Send" });
    expect(send.hasAttribute("disabled") || send.getAttribute("aria-disabled") === "true").toBe(true);
  });

  it("the send button sends too, and focus stays in the field for the next message", async () => {
    const onSend = vi.fn<(draft: ChatDraft) => void>();
    renderUi(<ThreadExample onSend={onSend} />);
    field().focus();
    await userEvent.keyboard("via button");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledTimes(1);
    await expect.poll(() => document.activeElement).toBe(field());
  });

  it("a failed message offers Retry; delivery states are readable", async () => {
    const onRetry = vi.fn();
    renderUi(<ThreadExample onRetry={onRetry} />);
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(screen.getAllByText(/Not delivered/).length).toBeGreaterThan(0);
    await userEvent.click(retry);
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ id: "t4" }));
  });

  it("a reaction chip is a toggle button that describes itself and reports add / remove", async () => {
    const onReact = vi.fn();
    renderUi(<ThreadExample onReact={onReact} />);
    const chip = screen.getByRole("button", { name: /👍|thumbs up/i });
    await userEvent.click(chip);
    expect(onReact).toHaveBeenCalledWith(expect.objectContaining({ id: "t3" }), "👍", false);
  });

  it("deleting my own message asks first: Cancel keeps it, Delete confirms", async () => {
    const onDelete = vi.fn();
    renderUi(<ThreadExample onDelete={onDelete} />);
    const mine = screen.getByText("Is my order on its way?");
    await userEvent.hover(mine);
    await userEvent.click(mine, { button: "right" });
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Delete/ }));
    const confirm = await screen.findByRole("alertdialog");
    await userEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
    // Focus returns somewhere in the page (not lost to <body>).
    expect(document.activeElement).not.toBe(document.body);

    await userEvent.click(mine, { button: "right" });
    const again = await screen.findByRole("menu");
    await userEvent.click(within(again).getByRole("menuitem", { name: /Delete/ }));
    const confirm2 = await screen.findByRole("alertdialog");
    await userEvent.click(within(confirm2).getByRole("button", { name: /^Delete/ }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: "t2" }));
  });

  it("shows an empty state instead of the log when there are no messages", () => {
    renderUi(
      <div className="h-[480px] w-[420px]">
        <ChatThread
          conversation={conversations[0]!}
          messages={[]}
          participants={people}
          currentUserId="me"
          emptyState={<p>Say hello</p>}
          now={NOW}
          locale="en-US"
        />
      </div>,
    );
    expect(screen.getByText("Say hello")).toBeInTheDocument();
  });

  it("labels override the log name and the composer", () => {
    renderUi(
      <div className="h-[640px] w-[420px]">
        <ChatThread
          conversation={conversations[0]!}
          messages={baseMessages}
          participants={people}
          currentUserId="me"
          now={NOW}
          locale="en-US"
          labels={{ messagesWith: (t) => `Mensajes con ${t}`, message: "Mensaje", send: "Enviar" }}
        />
      </div>,
    );
    expect(screen.getByRole("log", { name: "Mensajes con Riya Sharma" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Mensaje" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("header buttons appear only when their handlers exist and are named", () => {
    renderUi(
      <div className="h-[640px] w-[420px]">
        <ChatThread
          conversation={conversations[0]!}
          messages={baseMessages}
          participants={people}
          currentUserId="me"
          onBack={() => undefined}
          onCall={() => undefined}
          onInfo={() => undefined}
          now={NOW}
          locale="en-US"
        />
      </div>,
    );
    expect(screen.getByRole("button", { name: "Back to chats" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voice call" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contact info" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Video call" })).toBeNull();
  });

  it("reduced motion: still a working log + composer", async () => {
    setReducedMotion();
    const onSend = vi.fn();
    renderUi(<ThreadExample onSend={onSend} />);
    field().focus();
    await userEvent.keyboard("hi{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<ThreadExample />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- ChatWidget ---------- */

function WidgetExample({
  onOpenChange,
  onSend,
}: {
  onOpenChange?: (open: boolean) => void;
  onSend?: (id: string, draft: ChatDraft) => void;
}) {
  return (
    <div className="relative h-[720px] w-[720px]">
      <ChatWidget
        conversations={[conversations[0]!]}
        messages={{ c1: baseMessages }}
        participants={people}
        currentUserId="me"
        strategy="absolute"
        onOpenChange={onOpenChange}
        onSend={onSend}
        helpLinks={[{ label: "Shipping times", href: "/help/shipping" }]}
        now={NOW}
        locale="en-US"
      />
    </div>
  );
}

const launcher = () => screen.getByRole("button", { name: /Open chat|Close chat/ });
const panel = () => screen.queryByRole("dialog");

describe("ChatWidget", () => {
  it("the launcher is a button that exposes its expanded state; the panel is closed at first", () => {
    renderUi(<WidgetExample />);
    expect(panel()).toBeNull();
    expect(launcher()).toHaveAccessibleName(/Open chat/);
  });

  it("opens a dialog named by the widget title; home lists recent chats and help links", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(<WidgetExample onOpenChange={onOpenChange} />);
    await userEvent.click(launcher());
    await expect.poll(panel).not.toBeNull();
    expect(panel()).toHaveAccessibleName(/SheenUI Support/);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(within(panel()!).getByRole("link", { name: /Shipping times/ })).toHaveAttribute("href", "/help/shipping");
  });

  it("Escape closes it (non-modal) and focus goes back to the launcher", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(<WidgetExample onOpenChange={onOpenChange} />);
    launcher().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(panel).not.toBeNull();
    await expect.poll(() => panel()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(panel, { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(launcher());
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("the minimise button closes it and returns focus to the launcher", async () => {
    renderUi(<WidgetExample />);
    await userEvent.click(launcher());
    await expect.poll(panel).not.toBeNull();
    await userEvent.click(within(panel()!).getByRole("button", { name: "Minimise chat" }));
    await expect.poll(panel, { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(launcher());
  });

  it("open a chat from home, send a message with Enter, and go back to home", async () => {
    const onSend = vi.fn<(id: string, draft: ChatDraft) => void>();
    renderUi(<WidgetExample onSend={onSend} />);
    await userEvent.click(launcher());
    await expect.poll(panel).not.toBeNull();
    await userEvent.click(within(panel()!).getByRole("button", { name: /Riya|Shipping tomorrow/ }));
    const log = await within(panel()!).findByRole("log");
    expect(log).toBeInTheDocument();
    const box = within(panel()!).getByRole("textbox", { name: "Message" });
    box.focus();
    await userEvent.keyboard("hello there{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0]![0]).toBe("c1");
    expect(onSend.mock.calls[0]![1].text).toBe("hello there");
    await userEvent.click(within(panel()!).getByRole("button", { name: /Back/ }));
    await expect.poll(() => within(panel()!).queryByRole("log")).toBeNull();
  });

  it("controlled `open` follows its prop", async () => {
    const view = renderUi(
      <ChatWidget
        open
        conversations={conversations}
        messages={{}}
        participants={people}
        currentUserId="me"
        strategy="absolute"
        now={NOW}
        locale="en-US"
      />,
    );
    await expect.poll(panel).not.toBeNull();
    view.rerender(
      <ChatWidget
        open={false}
        conversations={conversations}
        messages={{}}
        participants={people}
        currentUserId="me"
        strategy="absolute"
        now={NOW}
        locale="en-US"
      />,
    );
    await expect.poll(panel, { timeout: 5000 }).toBeNull();
  });

  it("labels override the launcher and panel strings", async () => {
    renderUi(
      <div className="relative h-[720px] w-[720px]">
        <ChatWidget
          conversations={[]}
          messages={{}}
          participants={people}
          currentUserId="me"
          strategy="absolute"
          now={NOW}
          locale="en-US"
          labels={{ openChat: "Abrir chat", closeChat: "Cerrar chat", widgetTitle: "Soporte" }}
        />
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Abrir chat" }));
    await expect.poll(panel).not.toBeNull();
    expect(panel()).toHaveAccessibleName(/Soporte/);
    expect(screen.getByRole("button", { name: "Cerrar chat" })).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations on the closed launcher with an unread badge", async () => {
      renderUi(<WidgetExample />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });

  it("reduced motion: opens and closes without the spring", async () => {
    setReducedMotion();
    renderUi(<WidgetExample />);
    await userEvent.click(launcher());
    await expect.poll(panel).not.toBeNull();
    // Escape only closes once focus has moved into the panel (slower under machine load).
    await expect.poll(() => panel()?.contains(document.activeElement) ?? false).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(panel, { timeout: 5000 }).toBeNull();
  });

  describeVariants((variant) => {
    it("has no axe violations (open on the home view)", async () => {
      renderUi(<WidgetExample />, variant);
      await userEvent.click(launcher());
      await expect.poll(panel).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
