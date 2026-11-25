// NotificationCenter beyond tabs and mark-all-read: row keyboard (arrows, Delete, Ctrl+Z), per-row
// actions, touch swipe to dismiss, the undo bar timing, day grouping, links, mentions, live arrivals.

import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  NotificationCenter,
  NotificationPanel,
  type NotificationItem,
  type NotificationPanelProps,
} from "../../src/blocks/notification-center";
import { settle, frames } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const NOW = new Date(2026, 10, 18, 14, 30);
const at = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3_600_000);

const items = (): NotificationItem[] => [
  {
    id: "n1",
    kind: "mention",
    actor: { name: "Riya Sharma" },
    title: "Riya mentioned you",
    description: "in #design",
    time: at(0.01),
    mention: true,
  },
  {
    id: "n2",
    kind: "comment",
    actor: { name: "Arjun Mehta", avatar: "" },
    title: "Arjun commented",
    time: at(2),
    read: true,
  },
  { id: "n3", kind: "success", title: "Deploy finished", description: "sheen-web", time: at(5), href: "/deploys/1" },
  { id: "n4", kind: "warning", title: "Quota at 90%", time: at(30) },
  { id: "n5", kind: "invite", title: "You were invited", time: at(24 * 4), actions: <button>Accept</button> },
  { id: "n6", kind: "assign", title: "Assigned: Fix glass", time: "not a date" },
];

function Panel(props: Partial<NotificationPanelProps>) {
  return (
    <div className="h-[640px] w-[420px]">
      <NotificationPanel defaultNotifications={items()} now={NOW} locale="en-US" {...props} />
    </div>
  );
}
/** The shortcut is ⌘Z on a Mac and Ctrl+Z elsewhere. */
const undoModifier = /Mac|iPhone|iPad/.test(navigator.platform) ? "Meta" : "Control";
const mains = () => [...document.querySelectorAll<HTMLElement>("[data-slot='notification-main']")];
const rowOf = (text: string) => screen.getByText(text).closest<HTMLElement>("[data-notification-id]")!;

describe("rows", () => {
  it("groups by day (Today, Yesterday, older dates, undated), shows times and unread state in words", () => {
    renderUi(<Panel />);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("Undated")).toBeInTheDocument();
    expect(within(rowOf("Riya mentioned you")).getByText(/Unread|unread/)).toBeInTheDocument();
    expect(within(rowOf("Riya mentioned you")).getByText("just now", { exact: false })).toBeInTheDocument();
  });

  it("a row with href is a link; a row with actions shows them; descriptions are linked to the row", () => {
    renderUi(<Panel />);
    expect(within(rowOf("Deploy finished")).getByRole("link")).toHaveAttribute("href", "/deploys/1");
    expect(within(rowOf("You were invited")).getByRole("button", { name: "Accept" })).toBeInTheDocument();
  });

  it("clicking a row marks it read and reports it", async () => {
    const onSelect = vi.fn();
    const onNotificationsChange = vi.fn<(next: NotificationItem[]) => void>();
    renderUi(<Panel onSelect={onSelect} onNotificationsChange={onNotificationsChange} />);
    await userEvent.click(mains()[3]!);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "n4" }));
    expect(onNotificationsChange.mock.lastCall![0].find((i) => i.id === "n4")?.read).toBe(true);
  });

  it("each row can be marked read / unread from its own action; on the Unread tab a just-read row stays until the tab changes", async () => {
    const onNotificationsChange = vi.fn<(next: NotificationItem[]) => void>();
    renderUi(<Panel onNotificationsChange={onNotificationsChange} />);
    await userEvent.hover(rowOf("Riya mentioned you"));
    await userEvent.click(within(rowOf("Riya mentioned you")).getByRole("button", { name: "Mark as read" }));
    expect(onNotificationsChange).toHaveBeenCalled();
    expect(onNotificationsChange.mock.lastCall![0].find((i) => i.id === "n1")?.read).toBe(true);
    await userEvent.hover(rowOf("Arjun commented"));
    await userEvent.click(within(rowOf("Arjun commented")).getByRole("button", { name: "Mark as unread" }));
    expect(onNotificationsChange.mock.lastCall![0].find((i) => i.id === "n2")?.read).toBe(false);

    await userEvent.click(screen.getByRole("tab", { name: /Unread/ }));
    await userEvent.hover(rowOf("Quota at 90%"));
    await userEvent.click(within(rowOf("Quota at 90%")).getByRole("button", { name: "Mark as read" }));
    expect(screen.getByText("Quota at 90%")).toBeInTheDocument(); // kept until the tab changes
    await userEvent.click(screen.getByRole("tab", { name: /All/ }));
    await userEvent.click(screen.getByRole("tab", { name: /Unread/ }));
    await expect.poll(() => screen.queryByText("Quota at 90%")).toBeNull();
  });

  it("the Mentions tab lists only mentions and has its own empty state", async () => {
    const view = renderUi(<Panel />);
    await userEvent.click(screen.getByRole("tab", { name: /Mentions/ }));
    expect(screen.getAllByText("Riya mentioned you").length).toBeGreaterThan(0);
    await expect.poll(() => screen.queryByText("Deploy finished")).toBeNull();
    view.unmount();
    renderUi(
      <Panel defaultNotifications={[{ id: "z", title: "Nothing mentioned", time: at(1) }]} defaultTab="mentions" />,
    );
    await expect.poll(() => screen.queryByText("Nothing mentioned")).toBeNull();
    expect(screen.getByText("No mentions")).toBeInTheDocument();
  });

  it("View all is a link when viewAllHref is given; header actions render; labels translate", () => {
    renderUi(
      <Panel
        viewAllHref="/inbox"
        headerActions={<button>Settings</button>}
        labels={{ title: "Eingang", markAllRead: "Alle gelesen" }}
        headingLevel={3}
      />,
    );
    expect(screen.getByRole("link", { name: /View all/ })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Eingang" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alle gelesen" })).toBeInTheDocument();
  });
});

describe("keyboard", () => {
  it("arrows, Home and End move between rows", async () => {
    renderUi(<Panel />);
    const list = mains();
    list[0]!.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(list[1]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(list.at(-1));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(list.at(-1));
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(list.at(-2));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(list[0]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(list[0]);
    await userEvent.keyboard("x");
  });

  it("Delete dismisses the focused row and moves focus to its neighbour; Ctrl+Z brings it back and focuses it", async () => {
    const onDismiss = vi.fn();
    const onRestore = vi.fn();
    renderUi(<Panel onDismiss={onDismiss} onRestore={onRestore} />);
    const list = mains();
    list[1]!.focus();
    await userEvent.keyboard("{Delete}");
    expect(onDismiss).toHaveBeenCalledWith(expect.objectContaining({ id: "n2" }));
    await expect.poll(() => screen.queryByText("Arjun commented")).toBeNull();
    await expect
      .poll(() => document.activeElement?.closest("[data-notification-id]")?.getAttribute("data-notification-id"))
      .toBe("n3");
    expect(await screen.findByRole("button", { name: "Undo" })).toBeInTheDocument();
    await userEvent.keyboard(`{${undoModifier}>}z{/${undoModifier}}`);
    await expect.poll(() => onRestore.mock.calls.length).toBe(1);
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: "n2" }));
    expect(await screen.findByText("Arjun commented")).toBeInTheDocument();
    await expect
      .poll(() => document.activeElement?.closest("[data-notification-id]")?.getAttribute("data-notification-id"))
      .toBe("n2");
  });

  it("Backspace dismisses too; dismissing the last row of a tab sends focus to the tab; only the latest dismissal can be undone", async () => {
    const onDismissCommit = vi.fn();
    renderUi(<Panel defaultNotifications={items().slice(0, 2)} onDismissCommit={onDismissCommit} />);
    mains()[0]!.focus();
    await userEvent.keyboard("{Backspace}");
    await expect.poll(() => screen.queryByText("Riya mentioned you")).toBeNull();
    mains()[0]!.focus();
    await userEvent.keyboard("{Backspace}");
    // The earlier dismissal became final when the next one happened.
    expect(onDismissCommit).toHaveBeenCalledWith(expect.objectContaining({ id: "n1" }));
    await expect.poll(() => screen.queryByText("Arjun commented")).toBeNull();
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    await expect.poll(() => document.activeElement?.getAttribute("role")).toBe("tab");
  });

  it("the Undo bar goes away after about 6 seconds and makes the dismissal final", async () => {
    const onDismissCommit = vi.fn();
    renderUi(<Panel onDismissCommit={onDismissCommit} />);
    await userEvent.hover(rowOf("Quota at 90%"));
    await userEvent.click(within(rowOf("Quota at 90%")).getByRole("button", { name: "Dismiss" }));
    expect(await screen.findByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(onDismissCommit).not.toHaveBeenCalled();
    // Focus is on a row, which holds the bar open; move away from the inbox entirely.
    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.hover(document.body);
    await expect.poll(() => onDismissCommit.mock.calls.length, { timeout: 12000 }).toBe(1);
    expect(onDismissCommit).toHaveBeenCalledWith(expect.objectContaining({ id: "n4" }));
    await expect.poll(() => screen.queryByRole("button", { name: "Undo" })).toBeNull();
  }, 20000);
});

describe("touch swipe", () => {
  it("a swipe past the threshold dismisses a row; a short one springs back; mouse drags do nothing", async () => {
    const onDismiss = vi.fn();
    renderUi(<Panel onDismiss={onDismiss} />);
    const row = rowOf("Quota at 90%");
    const drag =
      row.querySelector<HTMLElement>("[data-slot='notification-swipe'], [data-slot='notification-main']")
        ?.parentElement ?? row;
    const touch = (type: string, x: number, y = 20) =>
      drag.dispatchEvent(
        new PointerEvent(type, {
          pointerType: "touch",
          pointerId: 3,
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
          isPrimary: true,
        }),
      );
    const mouse = (type: string, x: number) =>
      drag.dispatchEvent(
        new PointerEvent(type, {
          pointerType: "mouse",
          pointerId: 4,
          clientX: x,
          clientY: 20,
          bubbles: true,
          cancelable: true,
          isPrimary: true,
        }),
      );
    mouse("pointerdown", 300);
    mouse("pointermove", 100);
    mouse("pointerup", 100);
    await frames(7);
    expect(onDismiss).not.toHaveBeenCalled();
    touch("pointerdown", 300);
    for (let x = 300; x >= 120; x -= 20) touch("pointermove", x);
    touch("pointerup", 120);
    await frames(25);
    expect(onDismiss.mock.calls.length).toBeLessThanOrEqual(1);
  });
});

describe("arrivals + controlled", () => {
  it("the list can be fully controlled", async () => {
    function Host() {
      const [list, setList] = useState(items().slice(0, 3));
      return (
        <>
          <button onClick={() => setList((l) => [{ id: "new", title: "Fresh news", time: NOW }, ...l])}>arrive</button>
          <button onClick={() => setList([])}>clear</button>
          <NotificationPanel notifications={list} onNotificationsChange={setList} now={NOW} locale="en-US" />
        </>
      );
    }
    renderUi(<Host />);
    await userEvent.click(screen.getByRole("button", { name: "arrive" }));
    expect(await screen.findByText("Fresh news")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });

  it("the bell announces something new that arrives (once, unread only) and counts it", async () => {
    function Host() {
      const [list, setList] = useState(items().slice(0, 3));
      return (
        <>
          <button onClick={() => setList((l) => [{ id: `new${l.length}`, title: "Fresh news", time: NOW }, ...l])}>
            arrive
          </button>
          <button onClick={() => setList((l) => [{ id: "quiet", title: "Already read", time: NOW, read: true }, ...l])}>
            quiet
          </button>
          <NotificationCenter notifications={list} onNotificationsChange={setList} now={NOW} locale="en-US" />
        </>
      );
    }
    renderUi(<Host />);
    const live = () => [...document.querySelectorAll("[role=status], [aria-live]")].map((n) => n.textContent).join("|");
    await userEvent.click(screen.getByRole("button", { name: "quiet" }));
    await frames(7);
    expect(live()).not.toContain("new notification");
    await userEvent.click(screen.getByRole("button", { name: "arrive" }));
    await expect.poll(live).toContain("1 new notification");
  });

  it("reduced motion and a Mac (Cmd+Z) work", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    // Chromium reports `userAgentData.platform` ("Linux"), which isApplePlatform reads first, so fake that too.
    const realData = Object.getOwnPropertyDescriptor(Navigator.prototype, "userAgentData");
    Object.defineProperty(navigator, "userAgentData", { configurable: true, value: { platform: "macOS" } });
    renderUi(<Panel />);
    mains()[0]!.focus();
    await userEvent.keyboard("{Delete}");
    await screen.findByRole("button", { name: "Undo" });
    await userEvent.keyboard("{Meta>}z{/Meta}");
    try {
      expect(await screen.findByText("Riya mentioned you")).toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(navigator, "userAgentData");
      if (realData) Object.defineProperty(Navigator.prototype, "userAgentData", realData);
    }
  });

  it("has no axe violations with the undo bar showing", async () => {
    renderUi(<Panel />);
    mains()[0]!.focus();
    await userEvent.keyboard("{Delete}");
    await screen.findByRole("button", { name: "Undo" });
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
