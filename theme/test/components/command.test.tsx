import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { CommandPalette, type CommandItem } from "../../src/components/command/command";
import { fuzzyMatch } from "../../src/components/command/fuzzy";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const make = (spies: { onNew?: () => void; onTheme?: () => void; onOff?: () => void } = {}): CommandItem[] => [
  { id: "new", label: "New file", group: "File", shortcut: "mod+n", keywords: ["create"], onSelect: spies.onNew },
  { id: "open", label: "Open recent", description: "Pick from history", group: "File" },
  { id: "theme", label: "Toggle theme", group: "View", keepOpen: true, onSelect: spies.onTheme },
  {
    id: "go",
    label: "Go to…",
    group: "View",
    placeholder: "Go to a page",
    items: [
      { id: "go-home", label: "Home" },
      { id: "go-settings", label: "Settings", keywords: ["preferences"] },
    ],
  },
  { id: "off", label: "Disabled command", disabled: true, onSelect: spies.onOff },
];

const dialog = () => screen.queryByRole("dialog", { name: "Command palette" });
const field = () => screen.getByRole("combobox", { name: /Search commands/ });
/** Visible command labels (without shortcuts, hints or the screen-reader suffix of nested pages). */
const options = () =>
  screen.queryAllByRole("option").map((o) => {
    const label = o.querySelector(".font-medium")!.cloneNode(true) as HTMLElement;
    label.querySelectorAll(".sr-only").forEach((n) => n.remove());
    return label.textContent;
  });

/** The dialog is mounted and focus has reached the search field (keys typed before that are lost). */
async function ready() {
  await expect.poll(dialog).not.toBeNull();
  await expect.poll(() => document.activeElement?.getAttribute("role")).toBe("combobox");
}

function Host(props: Partial<React.ComponentProps<typeof CommandPalette>>) {
  return <CommandPalette items={make()} trigger={<Button>Open palette</Button>} {...props} />;
}

describeVariants((variant) => {
  it("opens from its trigger as a dialog with a combobox that owns a listbox; focus starts in the field", async () => {
    renderUi(<Host />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Open palette" }));
    await ready();
    await expect.poll(() => document.activeElement).toBe(field());
    expect(field()).toHaveAttribute("aria-autocomplete", "list");
    expect(field()).toHaveAttribute("aria-expanded", "true");
    expect(field()).toHaveAccessibleDescription(/Type to search/);
    const list = screen.getByRole("listbox");
    expect(field()).toHaveAttribute("aria-controls", list.id);
    expect(options().length).toBe(5);
    expect(screen.getByRole("option", { name: /New file/ })).toHaveAttribute("aria-keyshortcuts");
    expect(screen.getByRole("option", { name: /Disabled command/ })).toHaveAttribute("aria-disabled", "true");
    // Groups are labelled.
    expect(screen.getByRole("group", { name: "File" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
  });

  it("typing filters with fuzzy matching and announces the number of results", async () => {
    renderUi(<Host defaultOpen />, variant);
    await ready();
    await userEvent.keyboard("nwfl");
    await expect.poll(options).toEqual(["New file"]);
    // The polite status reads the count.
    await expect
      .poll(() =>
        within(dialog()!)
          .getAllByRole("status")
          .map((s) => s.textContent)
          .join(""),
      )
      .toMatch(/1 result/);
    await userEvent.clear(field());
    await userEvent.keyboard("create");
    await expect.poll(options).toEqual(["New file"]);
    await userEvent.clear(field());
    await userEvent.keyboard("history");
    await expect.poll(() => options()).toHaveLength(1);
  });

  it("no matches shows the empty state (and a polite announcement)", async () => {
    renderUi(<Host defaultOpen />, variant);
    await ready();
    await userEvent.keyboard("zzzzqq");
    await expect.poll(() => screen.queryByText(/No results for/)).not.toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("arrow keys move the active option (aria-activedescendant), skipping disabled; Enter runs it and closes", async () => {
    const onNew = vi.fn();
    renderUi(<Host defaultOpen items={make({ onNew })} />, variant);
    await ready();
    const active = () => document.getElementById(field().getAttribute("aria-activedescendant") ?? "")?.textContent;
    await expect.poll(active).toMatch(/New file/);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(active).toMatch(/Open recent/);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    // The disabled command is skipped: wraps to the first.
    await expect.poll(active).toMatch(/New file/);
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(active).toMatch(/Go to/);
    // Down from the last enabled command wraps to the first.
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(active).toMatch(/New file/);
    await userEvent.keyboard("{Enter}");
    expect(onNew).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
  });

  it("keepOpen commands keep the palette open", async () => {
    const onTheme = vi.fn();
    renderUi(<Host defaultOpen items={make({ onTheme })} />, variant);
    await ready();
    await userEvent.click(screen.getByRole("option", { name: /Toggle theme/ }));
    expect(onTheme).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeNull();
  });

  it("clicking a disabled command does nothing", async () => {
    const onOff = vi.fn();
    renderUi(<Host defaultOpen items={make({ onOff })} />, variant);
    await ready();
    screen.getByRole("option", { name: /Disabled command/ }).click();
    expect(onOff).not.toHaveBeenCalled();
    expect(dialog()).not.toBeNull();
  });

  it("nested pages: Enter opens the page, the field renames, Escape goes back before closing", async () => {
    renderUi(<Host defaultOpen />, variant);
    await ready();
    await userEvent.click(screen.getByRole("option", { name: /Go to/ }));
    await expect.poll(() => screen.queryByRole("combobox", { name: "Search commands: Go to…" })).not.toBeNull();
    await expect.poll(() => options()).toEqual(["Home", "Settings"]);
    expect(screen.getByRole("button", { name: "Back: Go to…" })).toBeInTheDocument();
    await userEvent.keyboard("pref");
    await expect.poll(() => options()).toEqual(["Settings"]);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("combobox", { name: "Search commands" })).not.toBeNull();
    expect(dialog()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
  });

  it("Escape closes and focus returns to the trigger", async () => {
    renderUi(<Host />, variant);
    const trigger = screen.getByRole("button", { name: "Open palette" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await ready();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  it("the global shortcut (mod+k) toggles it; shortcut={false} disables it", async () => {
    const { rerender } = renderUi(<Host trigger={undefined} />, variant);
    const press = async () =>
      userEvent.keyboard(/mac/i.exec(navigator.platform) ? "{Meta>}k{/Meta}" : "{Control>}k{/Control}");
    await press();
    await ready();
    await press();
    await expect.poll(dialog).toBeNull();
    rerender(<Host trigger={undefined} shortcut={false} />);
    await press();
    expect(dialog()).toBeNull();
  });

  it("records recents and lists them first; controlled via recent/onRecentChange", async () => {
    function Controlled() {
      const [recent, setRecent] = useState<string[]>(["open"]);
      return (
        <>
          <Host defaultOpen recent={recent} onRecentChange={setRecent} />
          <output>{recent.join(",")}</output>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await ready();
    expect(screen.getByRole("group", { name: "Recent" })).toHaveTextContent("Open recent");
    await userEvent.click(screen.getByRole("option", { name: /New file/ }));
    await expect.poll(() => document.querySelector("output")?.textContent).toBe("new,open");
  });

  it("recentStorageKey persists recents in localStorage", async () => {
    renderUi(<Host defaultOpen recentStorageKey="test-recents" />, variant);
    await ready();
    await userEvent.click(screen.getByRole("option", { name: /New file/ }));
    await expect.poll(() => localStorage.getItem("test-recents")).toContain("new");
  });

  it("labels override the strings (i18n) and query is controllable", async () => {
    function Controlled() {
      const [q, setQ] = useState("");
      return (
        <Host
          defaultOpen
          query={q}
          onQueryChange={setQ}
          labels={{ title: "Befehle", inputLabel: "Befehle suchen", noResults: (x) => `Nichts für ${x}` }}
        />
      );
    }
    renderUi(<Controlled />, variant);
    await expect.poll(() => screen.queryByRole("dialog", { name: "Befehle" })).not.toBeNull();
    await userEvent.fill(screen.getByRole("combobox", { name: "Befehle suchen" }), "qqzz");
    await expect.poll(() => screen.queryByText("Nichts für qqzz")).not.toBeNull();
  });

  it("filter={false} shows items as given; loading shows the searching state", async () => {
    renderUi(
      <Host
        defaultOpen
        filter={false}
        items={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta" },
        ]}
      />,
      variant,
    );
    await ready();
    await userEvent.keyboard("zzz");
    await expect.poll(options).toEqual(["Alpha", "Beta"]);
    renderUi(<Host defaultOpen loading items={[]} />, variant);
    await expect.poll(() => screen.queryByText("Searching…")).not.toBeNull();
  });

  it("has no axe violations (open, with a query, and on a nested page)", async () => {
    renderUi(<Host defaultOpen />, variant);
    await ready();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.keyboard("fi");
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.keyboard("{Escape}");
  });
});

it("reduced motion: opening a nested page needs no slide, and axe stays clean", async () => {
  reduceMotion();
  renderUi(<Host defaultOpen />);
  await ready();
  await userEvent.click(screen.getByRole("option", { name: /Go to/ }));
  await expect.poll(() => options()).toEqual(["Home", "Settings"]);
  await settle();
  expect(await runAxe()).toHaveNoViolations();
});

it("initialFocus={false}: opening leaves focus where it was", async () => {
  renderUi(
    <>
      <button>Elsewhere</button>
      <Host initialFocus={false} />
    </>,
  );
  const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
  elsewhere.focus();
  await userEvent.click(screen.getByRole("button", { name: "Open palette" }));
  await expect.poll(dialog).not.toBeNull();
  await settle();
  expect(document.activeElement).not.toBe(field());
});

it("modal={false}: no scrim, the page stays interactive, and it renders into `container`", async () => {
  const mount = document.createElement("div");
  mount.setAttribute("data-testid", "mount");
  document.body.append(mount);
  const onClick = vi.fn();
  renderUi(
    <>
      <button onClick={onClick}>Page button</button>
      <Host modal={false} container={mount} defaultOpen initialFocus={false} />
    </>,
  );
  await expect.poll(dialog).not.toBeNull();
  await settle();
  expect(mount.contains(dialog())).toBe(true);
  expect(document.querySelector('[class*="bg-sheen-scrim"]')).toBeNull();
  const page = screen.getByRole("button", { name: "Page button" });
  expect(page.closest("[inert]")).toBeNull();
  expect(page).not.toHaveAttribute("aria-hidden");
  await userEvent.click(page);
  expect(onClick).toHaveBeenCalled();
  expect(await runAxe()).toHaveNoViolations();
  mount.remove();
});

it("fuzzyMatch: letters in order, case/accent insensitive, best run wins, indices point at the original text", () => {
  expect(fuzzyMatch("New tab", "nwtb")).not.toBeNull();
  expect(fuzzyMatch("New tab", "tbn")).toBeNull();
  expect(fuzzyMatch("Café au lait", "cafe")?.indices).toEqual([0, 1, 2, 3]);
  const word = fuzzyMatch("dark-mode", "dm")!;
  expect(word.indices).toEqual([0, 5]);
  expect(fuzzyMatch("Settings", "settings")!.score).toBeGreaterThan(fuzzyMatch("Set tings", "settings")!.score);
  expect(fuzzyMatch("abc", "")).toEqual({ score: 0, indices: [] });
  expect(fuzzyMatch("ab", "abc")).toBeNull();
});
