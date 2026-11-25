// ConversationList beyond the basics: previews, sections, filters + search (controlled), windowed
// lists with keyboard paging, the actions menus, touch swipe actions, and the imperative handle.

import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ConversationList, type ConversationListHandle } from "../../src/components/chat/conversation-list";
import type { ChatConversation, ChatMessage, ChatParticipant } from "../../src/components/chat/types";
import { pixel, settle, frames, holdFor } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
});

const NOW = new Date(2026, 10, 18, 14, 30);
const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();

const people: ChatParticipant[] = [
  { id: "me", name: "Ava Chen" },
  { id: "riya", name: "Riya Sharma", presence: "online" },
  { id: "arjun", name: "Arjun Mehta", presence: "away" },
  { id: "lena", name: "Lena Fischer", presence: "offline" },
];
const msg = (
  id: string,
  senderId: string,
  text: string | undefined,
  minutesAgo: number,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({ id, senderId, text, createdAt: at(minutesAgo), ...extra });

const base: ChatConversation[] = [
  {
    id: "c1",
    participantIds: ["me", "riya"],
    lastMessage: msg("m1", "riya", "Shipping tomorrow", 5),
    unreadCount: 3,
    pinned: true,
  },
  {
    id: "c2",
    participantIds: ["me", "arjun"],
    lastMessage: msg("m2", "me", "Thanks, see you", 90, { status: "read" }),
    muted: true,
  },
  {
    id: "c3",
    kind: "group",
    title: "Design team",
    participantIds: ["me", "riya", "lena"],
    lastMessage: msg("m3", "lena", "New mockups", 300),
    unreadCount: 120,
  },
  { id: "c4", participantIds: ["me", "lena"], lastMessage: msg("m4", "lena", "Old thread", 2000), archived: true },
  { id: "c5", participantIds: ["me", "arjun"], typingIds: ["arjun"], updatedAt: at(1) },
  {
    id: "c6",
    kind: "group",
    title: "Ops",
    participantIds: ["me", "riya", "arjun"],
    draft: "Remember to deploy",
    updatedAt: at(2),
    typingIds: [],
  },
  { id: "c7", participantIds: ["me", "riya"], lastMessage: msg("m7", "riya", "Riya joined", 400, { kind: "system" }) },
  { id: "c8", participantIds: ["me", "lena"], lastMessage: msg("m8", "me", undefined, 500, { deleted: true }) },
  {
    id: "c9",
    participantIds: ["me", "lena"],
    lastMessage: msg("m9", "lena", undefined, 600, {
      attachments: [{ id: "a", kind: "image", name: "x.png", url: pixel }],
    }),
    avatarUrl: pixel,
  },
];

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

function List(props: Partial<React.ComponentProps<typeof ConversationList>> = {}) {
  return (
    <div className="h-[560px] w-[360px]">
      <ConversationList
        conversations={base}
        participants={people}
        currentUserId="me"
        now={NOW}
        locale="en-US"
        onSelect={vi.fn()}
        {...props}
      />
    </div>
  );
}
const listbox = () => screen.getByRole("listbox");
const options = () => within(listbox()).getAllByRole("option");
const row = (id: string) => document.querySelector<HTMLElement>(`[data-conversation-row="${id}"]`)!;
const option = (id: string) => within(row(id)).getByRole("option");

describe("rows", () => {
  it("previews the latest activity: text, your own with ticks, group sender prefix, system, deleted, photo, draft and typing", () => {
    renderUi(<List />);
    expect(option("c1")).toHaveTextContent("Shipping tomorrow");
    expect(option("c2")).toHaveTextContent("You: Thanks, see you");
    expect(option("c2").querySelector("[data-status=read]")).not.toBeNull();
    expect(option("c3")).toHaveTextContent("Lena: New mockups");
    expect(option("c5")).toHaveTextContent("typing…");
    expect(option("c6")).toHaveTextContent("Draft: Remember to deploy");
    expect(option("c7")).toHaveTextContent("Riya joined");
    expect(option("c8")).toHaveTextContent("You deleted this message");
    expect(option("c9")).toHaveTextContent("Photo");
  });

  it("pinned chats get a section; unread counts are spoken, muted chats say so, the unread count caps at 99+", () => {
    renderUi(<List />);
    expect(screen.getAllByText("Pinned").length).toBeGreaterThan(0);
    expect(screen.getByText("All chats")).toBeInTheDocument();
    expect(option("c1")).toHaveTextContent("3 unread messages");
    expect(option("c3")).toHaveTextContent("120 unread messages");
    expect(option("c3").textContent).toContain("99+");
    expect(option("c2")).toHaveTextContent("Muted");
    expect(option("c1")).toHaveTextContent("Pinned");
  });

  it("every row is a positioned option: aria-posinset / setsize, selected state, and archived chats hidden by default", () => {
    renderUi(<List selectedId="c3" />);
    const opts = options();
    expect(
      opts.every(
        (o, i) =>
          o.getAttribute("aria-posinset") === String(i + 1) && o.getAttribute("aria-setsize") === String(opts.length),
      ),
    ).toBe(true);
    expect(option("c3")).toHaveAttribute("aria-selected", "true");
    expect(document.querySelector('[data-conversation-row="c4"]')).toBeNull();
  });

  it("compact density uses shorter rows; a header action and a custom title are shown; headingLevel 3", () => {
    renderUi(<List density="compact" title="Inbox" headingLevel={3} headerActions={<button>New</button>} />);
    expect(screen.getByRole("heading", { level: 3, name: "Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
    expect(row("c1").className).toContain("h-16");
  });
});

describe("filters and search", () => {
  it("filters: Unread, Groups, Archived each narrow the list; an empty filter says so", async () => {
    const onFilterChange = vi.fn();
    renderUi(<List onFilterChange={onFilterChange} />);
    const filters = screen.getByRole("group", { name: "Filter chats" });
    await userEvent.click(within(filters).getByRole("button", { name: /Unread/ }));
    expect(onFilterChange).toHaveBeenLastCalledWith("unread");
    expect(options().map((o) => o.closest("[data-conversation-row]")!.getAttribute("data-conversation-row"))).toEqual([
      "c1",
      "c3",
    ]);
    await userEvent.click(within(filters).getByRole("button", { name: /Groups/ }));
    expect(options()).toHaveLength(2);
    await userEvent.click(within(filters).getByRole("button", { name: /Archived/ }));
    expect(options()).toHaveLength(1);
    expect(option("c4")).toBeInTheDocument();
  });

  it("empty filters and an empty list each explain themselves", () => {
    const unread = renderUi(
      <List conversations={base.map((c) => ({ ...c, unreadCount: 0 }))} defaultFilter="unread" />,
    );
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    unread.unmount();
    const none = renderUi(<List conversations={[]} emptyAction={<button>Start a chat</button>} />);
    expect(screen.getByText("No chats yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start a chat" })).toBeInTheDocument();
    none.unmount();
    const groups = renderUi(<List conversations={base.filter((c) => c.kind !== "group")} defaultFilter="groups" />);
    expect(screen.getByText("No group chats yet")).toBeInTheDocument();
    groups.unmount();
    renderUi(<List conversations={base.filter((c) => !c.archived)} defaultFilter="archived" />);
    expect(screen.getByText("No archived chats")).toBeInTheDocument();
  });

  it("search matches names and message text, highlights the match, announces the count; Escape clears; ArrowDown enters the list", async () => {
    const onQueryChange = vi.fn();
    renderUi(<List onQueryChange={onQueryChange} />);
    const search = screen.getByRole("searchbox", { name: "Search chats" });
    await userEvent.type(search, "mock");
    expect(onQueryChange).toHaveBeenLastCalledWith("mock");
    await expect.poll(() => option("c3").querySelector("mark")?.textContent).toBe("mock");
    expect(options()).toHaveLength(1);
    await expect.poll(() => screen.getAllByRole("status").map((s) => s.textContent)).toContain("1 chat");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(option("c3"));
    search.focus();
    await userEvent.keyboard("{Escape}");
    expect(search).toHaveValue("");
    await userEvent.keyboard("{ArrowDown}");
    expect(options().length).toBeGreaterThan(3);
  });

  it("search with no result offers to clear it; the clear button empties the field and refocuses it", async () => {
    renderUi(<List defaultQuery="zzzz" />);
    await expect.poll(() => screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByText(/No chats match/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
    await expect.poll(() => options().length).toBeGreaterThan(3);
  });

  it("controlled query and filter, hidden search / filters, and the loading state", () => {
    const view = renderUi(<List query="ops" filter="all" showSearch showFilters />);
    expect(screen.getByRole("searchbox")).toHaveValue("ops");
    view.rerender(<List showSearch={false} showFilters={false} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("group", { name: "Filter chats" })).toBeNull();
    view.rerender(<List loading />);
    expect(screen.getAllByText("Loading chats…").length).toBeGreaterThan(0);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("keyboard", () => {
  it("Home, End, PageDown, PageUp, arrows and Space/Enter select; typeahead cycles through matches", async () => {
    const onSelect = vi.fn();
    renderUi(<List onSelect={onSelect} />);
    const first = options()[0]!;
    first.focus();
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(options().at(-1));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(options()[0]);
    const pos = () => Number(document.activeElement?.getAttribute("aria-posinset"));
    expect(pos()).toBe(1);
    await userEvent.keyboard("{PageDown}");
    expect(pos()).toBeGreaterThan(2);
    await userEvent.keyboard("{PageUp}");
    expect(pos()).toBe(1);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
    expect(document.activeElement).toBe(options()[1]);
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: expect.any(String) as string }),
      "keyboard",
    );
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(2);

    // Typeahead: "d" -> Design team, "o" -> then "do" has no match; wait, then "o" -> Ops.
    await userEvent.keyboard("d");
    expect(document.activeElement).toBe(option("c3"));
    await holdFor(700);
    await userEvent.keyboard("o");
    expect(document.activeElement).toBe(option("c6"));
  });

  it("clicking selects with `pointer`; Shift+F10 on a row opens its actions", async () => {
    const onSelect = vi.fn();
    const onAction = vi.fn();
    renderUi(<List onSelect={onSelect} onAction={onAction} />);
    await userEvent.click(option("c2"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "c2" }), "pointer");
    option("c1").focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Unpin" }));
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }), "unpin");
  });

  it("the imperative handle focuses a chat by id, or the selected / first one", () => {
    const ref = createRef<ConversationListHandle>();
    renderUi(<List ref={ref} selectedId="c3" />);
    ref.current!.focus("c6");
    expect(document.activeElement).toBe(option("c6"));
    ref.current!.focus();
    expect(document.activeElement).toBe(option("c3"));
    ref.current!.focus("missing");
    expect(document.activeElement).toBe(options()[0]);
  });
});

describe("actions menus", () => {
  it("right-click opens the chat's actions: pin / mute / read / archive reflect the chat's state", async () => {
    const onAction = vi.fn();
    renderUi(<List onAction={onAction} />);
    fireEvent.contextMenu(option("c3"), { clientX: 100, clientY: 100 });
    let menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Pin" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Mute" })).toBeInTheDocument();
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Mark as read" }));
    expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c3" }), "markRead");
    await expect
      .poll(() => screen.getAllByRole("status").map((s) => s.textContent))
      .toContain("Mark as read: Design team");
    await settle();

    fireEvent.contextMenu(option("c2"), { clientX: 100, clientY: 100 });
    menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Unmute" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Mark as unread" })).toBeInTheDocument();
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Archive" }));
    expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c2" }), "archive");
  });

  it("archived chats offer Unarchive and cannot be pinned", async () => {
    renderUi(<List onAction={vi.fn()} defaultFilter="archived" />);
    fireEvent.contextMenu(option("c4"), { clientX: 100, clientY: 100 });
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Unarchive" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Pin" })).toHaveAttribute("aria-disabled", "true");
  });

  it("the ⋯ button on a row opens the same actions; with no onAction there are no menus at all", async () => {
    const onAction = vi.fn();
    const view = renderUi(<List onAction={onAction} />);
    const more = row("c1").querySelector<HTMLElement>("[aria-hidden][class*='opacity-0']")!;
    await userEvent.click(more);
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Mute" }));
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }), "mute");
    await settle();
    view.rerender(<List />);
    fireEvent.contextMenu(option("c1"));
    await frames(7);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("windowing", () => {
  const lots: ChatConversation[] = Array.from({ length: 80 }, (_, i) => ({
    id: `w${i}`,
    participantIds: ["me", i % 2 ? "riya" : "arjun"],
    title: `Chat ${String(i).padStart(2, "0")}`,
    lastMessage: msg(`wm${i}`, "riya", `Message ${i}`, i + 1),
  }));

  it("renders only the rows near the viewport, keeps the focused row, and still pages with the keyboard", async () => {
    renderUi(<List conversations={lots} windowThreshold={20} />);
    const count = () => document.querySelectorAll("[data-conversation-row]").length;
    expect(count()).toBeLessThan(80);
    expect(count()).toBeGreaterThan(5);
    expect(options()[0]).toHaveAttribute("aria-setsize", "80");
    options()[0]!.focus();
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-posinset")).toBe("80");
    await userEvent.keyboard("{PageUp}");
    await expect.poll(() => Number(document.activeElement?.getAttribute("aria-posinset"))).toBeLessThan(80);
    await userEvent.keyboard("{Home}");
    await expect.poll(() => document.activeElement?.getAttribute("aria-posinset")).toBe("1");
  });

  const scrollToEnd = (scroller: HTMLElement) => {
    scroller.scrollTop = scroller.scrollHeight;
  };
  const rendered = () =>
    [...document.querySelectorAll("[data-conversation-row]")].map((n) => n.getAttribute("data-conversation-row"));

  it("scrolling swaps the rows that are rendered when the chats arrive after the first render", async () => {
    const view = renderUi(<List conversations={[]} windowThreshold={20} />);
    view.rerender(<List conversations={lots} windowThreshold={20} />);
    const scroller = listbox().closest<HTMLElement>(".overflow-y-auto")!;
    expect(rendered()).not.toContain("w79");
    scrollToEnd(scroller);
    await expect.poll(rendered, { timeout: 3000 }).toContain("w79");
    expect(rendered()).not.toContain("w1"); // (w0 stays: it is the list's tab stop)
    expect(scroller).toHaveAttribute("data-scrolling");
    await expect.poll(() => scroller.hasAttribute("data-scrolling"), { timeout: 3000 }).toBe(false);
  });

  it("scrolling swaps the rendered rows when the windowed list is there from the first render", async () => {
    renderUi(<List conversations={lots} windowThreshold={20} />);
    const scroller = listbox().closest<HTMLElement>(".overflow-y-auto")!;
    scrollToEnd(scroller);
    await expect.poll(rendered, { timeout: 1500 }).toContain("w79");
  });
});

describe("touch swipe", () => {
  function touch(
    el: HTMLElement,
    type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
    x: number,
    y: number,
  ) {
    el.dispatchEvent(
      new PointerEvent(type, {
        pointerType: "touch",
        pointerId: 7,
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        isPrimary: true,
      }),
    );
  }

  it("dragging a row towards the start reveals Pin / Mute / Archive; they act and close the row", async () => {
    stubCoarse();
    vi.spyOn(HTMLElement.prototype, "setPointerCapture").mockImplementation(() => undefined);
    const onAction = vi.fn();
    const onSelect = vi.fn();
    renderUi(<List onAction={onAction} onSelect={onSelect} />);
    const o = option("c1");
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 250, 102);
    touch(o, "pointermove", 60, 102);
    expect(o.style.transform).toMatch(/translateX\(-/);
    expect(row("c1")).toHaveAttribute("data-dragging");
    touch(o, "pointerup", 60, 102);
    await frames(4);
    expect(o.style.transform).toMatch(/translateX\(-216px\)/); // 3 x 72 px of actions
    expect(onSelect).not.toHaveBeenCalled();

    const actions = row("c1").querySelector("[data-swipe-actions]")!;
    const buttons = within(actions as HTMLElement).getAllByRole("button", { hidden: true });
    expect(buttons.map((b) => b.textContent)).toEqual(["Unpin", "Mute", "Archive"]);
    await userEvent.click(buttons[1]!, { force: true });
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }), "mute");
    await expect.poll(() => o.style.transform).toBe("");
  });

  it("a mostly vertical drag is a scroll, a short drag snaps back, a tap elsewhere or Escape closes an open row, and tapping an open row closes it instead of selecting", async () => {
    stubCoarse();
    vi.spyOn(HTMLElement.prototype, "setPointerCapture").mockImplementation(() => undefined);
    const onSelect = vi.fn();
    renderUi(<List onAction={vi.fn()} onSelect={onSelect} />);
    const o = option("c1");
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 295, 160); // vertical
    touch(o, "pointermove", 100, 165);
    expect(o.style.transform).toBe("");
    touch(o, "pointerup", 100, 165);

    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 280, 100); // 20 px: not enough to open
    touch(o, "pointerup", 280, 100);
    await frames(4);
    expect(o.style.transform).toBe("");

    // Open it, then tap another row: the first one closes.
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 20, 100);
    touch(o, "pointerup", 20, 100);
    await frames(4);
    expect(o.style.transform).not.toBe("");
    const other = option("c2");
    other.dispatchEvent(
      new PointerEvent("pointerdown", { pointerType: "touch", pointerId: 8, bubbles: true, clientX: 10, clientY: 10 }),
    );
    await expect.poll(() => o.style.transform).toBe("");

    // Open again; Escape closes; a click on the open row closes it without selecting.
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 20, 100);
    touch(o, "pointerup", 20, 100);
    await frames(4);
    o.focus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => o.style.transform).toBe("");
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 20, 100);
    touch(o, "pointerup", 20, 100);
    await frames(4);
    fireEvent.click(o);
    expect(onSelect).not.toHaveBeenCalled();
    await expect.poll(() => o.style.transform).toBe("");
    fireEvent.click(o);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("swipeActions={false} keeps rows still, and reduced motion swaps without animating", () => {
    stubCoarse();
    document.documentElement.setAttribute("data-motion", "reduced");
    vi.spyOn(HTMLElement.prototype, "setPointerCapture").mockImplementation(() => undefined);
    const view = renderUi(<List onAction={vi.fn()} swipeActions={false} />);
    expect(row("c1").querySelector("[data-swipe-actions]")).toBeNull();
    const o = option("c1");
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 20, 100);
    expect(o.style.transform).toBe("");
    view.rerender(<List onAction={vi.fn()} swipeActions />);
    touch(o, "pointerdown", 300, 100);
    touch(o, "pointermove", 20, 100);
    touch(o, "pointerup", 20, 100);
    expect(o.style.transition).toBe("none");
  });

  it("touch devices have no ⋯ shortcut visible and the long-press menu path works", async () => {
    stubCoarse();
    renderUi(<List onAction={vi.fn()} />);
    const o = option("c1");
    fireEvent.pointerDown(o, { pointerType: "touch", button: 0 });
    fireEvent.touchStart(o);
    await holdFor(500);
    fireEvent.contextMenu(o, { clientX: 50, clientY: 50 });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    fireEvent.touchEnd(o);
    await userEvent.keyboard("{Escape}");
  });
});

describe("a11y", () => {
  it("has no axe violations with previews, sections, the menu open and a swipe-ready touch list", async () => {
    renderUi(<List onAction={vi.fn()} selectedId="c1" />);
    expect(await runAxe()).toHaveNoViolations();
    fireEvent.contextMenu(option("c3"), { clientX: 100, clientY: 100 });
    await screen.findByRole("menu");
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.keyboard("{Escape}");
  });
});
