// HoverCard, ContextMenu and Menubar: open paths, keyboard, Escape + focus return, axe.

import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  LinkPreview,
  ProfilePreview,
} from "../../src/components/hover-card/hover-card";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "../../src/components/context-menu/context-menu";
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "../../src/components/menubar/menubar";
import {
  MenuCheckboxItem,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "../../src/components/menu/menu";
import { holdFor, pixel, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

/* ---------- HoverCard ---------- */

function CardExample({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <div className="p-24">
      <p>
        Maintained by{" "}
        <HoverCard onOpenChange={onOpenChange}>
          <HoverCardTrigger href="/people/ada" delay={0} closeDelay={0}>
            Ada Lovelace
          </HoverCardTrigger>
          <HoverCardContent>
            <ProfilePreview
              name="Ada Lovelace"
              handle="ada"
              avatarSrc={pixel}
              bio="Wrote the first program."
              stats={[
                { label: "Followers", value: 12400 },
                { label: "Following", value: 12 },
              ]}
              joined="2021-08-01"
              locale="en-US"
            />
          </HoverCardContent>
        </HoverCard>
      </p>
      <button>after</button>
    </div>
  );
}

const card = () => document.querySelector<HTMLElement>('[data-slot="hover-card-content"]');
const cardTrigger = () => screen.getByRole("link", { name: "Ada Lovelace" });

describe("HoverCard", () => {
  it("the trigger is a plain link; the card is closed until hover", () => {
    renderUi(<CardExample />);
    expect(cardTrigger()).toHaveAttribute("href", "/people/ada");
    expect(card()).toBeNull();
  });

  it("hover opens the preview, leaving closes it", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(<CardExample onOpenChange={onOpenChange} />);
    await userEvent.hover(cardTrigger());
    await expect.poll(card).not.toBeNull();
    expect(within(card()!).getByText("Wrote the first program.")).toBeInTheDocument();
    // Numbers are shortened for the locale.
    expect(card()!.textContent).toContain("12.4K");
    await userEvent.unhover(cardTrigger());
    await expect.poll(card).toBeNull();
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("a tap opens the card and the mouse events a browser fires after a touch do not close it again", async () => {
    renderUi(<CardExample />);
    const link = cardTrigger();
    fireEvent.pointerDown(link, { pointerType: "touch", pointerId: 7, isPrimary: true });
    fireEvent.pointerUp(link, { pointerType: "touch", pointerId: 7, isPrimary: true });
    // The first tap shows the preview instead of navigating (preventDefault).
    expect(fireEvent.click(link, { detail: 1 })).toBe(false);
    await expect.poll(card).not.toBeNull();
    // Compatibility events synthesised after the touch: mouse "leave" on the trigger.
    fireEvent.pointerLeave(link, { pointerType: "mouse" });
    fireEvent.mouseOut(link);
    fireEvent.mouseLeave(link);
    await holdFor(600);
    expect(card()).not.toBeNull();
    // An outside tap closes it.
    fireEvent.pointerDown(screen.getByRole("button", { name: "after" }), { pointerType: "touch", pointerId: 8 });
    await expect.poll(card).toBeNull();
  });

  it("a touch-opened card also closes on Escape", async () => {
    renderUi(<CardExample />);
    const link = cardTrigger();
    fireEvent.pointerDown(link, { pointerType: "touch", pointerId: 7, isPrimary: true });
    fireEvent.click(link, { detail: 1 });
    await expect.poll(card).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(card).toBeNull();
  });

  it("keyboard focus opens it, Escape closes it and focus stays on the link", async () => {
    renderUi(<CardExample />);
    await userEvent.tab();
    expect(cardTrigger()).toHaveFocus();
    await expect.poll(card).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(card).toBeNull();
    expect(cardTrigger()).toHaveFocus();
  });

  it("Tab leaves the link without trapping focus in the card (its content is not tabbable)", async () => {
    renderUi(<CardExample />);
    await userEvent.tab();
    await expect.poll(card).not.toBeNull();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("LinkPreview shows the host name, title and an image with alt text", async () => {
    renderUi(
      <div className="p-24">
        <HoverCard defaultOpen>
          <HoverCardTrigger href="https://www.example.com/post" variant="plain">
            Post
          </HoverCardTrigger>
          <HoverCardContent padded={false}>
            <LinkPreview
              url="https://www.example.com/post"
              title="A great post"
              description="Read it"
              image={pixel}
              imageAlt="Cover art"
            />
          </HoverCardContent>
        </HoverCard>
      </div>,
    );
    await expect.poll(card).not.toBeNull();
    expect(card()!.textContent).toContain("example.com");
    expect(card()!.textContent).toContain("A great post");
  });

  describeVariants((variant) => {
    it("has no axe violations with the card open", async () => {
      renderUi(<CardExample />, variant);
      await userEvent.hover(cardTrigger());
      await expect.poll(card).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- ContextMenu ---------- */

function ContextExample({ onDuplicate }: { onDuplicate?: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        tabIndex={0}
        aria-label="Photo, press Shift+F10 for actions"
        className="m-8 flex h-40 w-64 items-center justify-center rounded-xl border"
      >
        Photo
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Photo actions">
        <MenuItem shortcut="mod+d" onClick={onDuplicate}>
          Duplicate
        </MenuItem>
        <MenuCheckboxItem>Favourite</MenuCheckboxItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>Share</MenuSubTrigger>
          <MenuSubContent aria-label="Share">
            <MenuItem>Email</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem tone="danger">Delete</MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const ctxMenu = () => screen.queryByRole("menu", { name: "Photo actions" });
const ctxTrigger = () => screen.getByLabelText("Photo, press Shift+F10 for actions");

describe("ContextMenu", () => {
  it("names its popup by default and mentions Shift+F10", async () => {
    renderUi(
      <ContextMenu>
        <ContextMenuTrigger tabIndex={0}>Area</ContextMenuTrigger>
        <ContextMenuContent>
          <MenuItem>Paste</MenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    await userEvent.click(screen.getByText("Area"), { button: "right" });
    await expect.poll(() => screen.queryByRole("menu", { name: "Context menu (Shift+F10)" })).not.toBeNull();
  });

  it("right-click opens a labelled menu; Escape closes it and focus returns to the trigger", async () => {
    renderUi(<ContextExample />);
    await userEvent.click(ctxTrigger(), { button: "right" });
    await expect.poll(ctxMenu).not.toBeNull();
    expect(
      within(ctxMenu()!)
        .getAllByRole("menuitem")
        .map((i) => i.textContent.replace(/\s+/g, " ").trim()),
    ).toEqual(expect.arrayContaining([expect.stringMatching(/^Duplicate/), "Delete"]));
    await expect.poll(() => ctxMenu()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(ctxMenu).toBeNull();
    await expect.poll(() => document.activeElement).toBe(ctxTrigger());
  });

  it("Shift+F10 on the focused trigger opens it, inside the trigger's box (not at 0,0)", async () => {
    renderUi(<ContextExample />);
    ctxTrigger().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await expect.poll(ctxMenu).not.toBeNull();
    const menuBox = ctxMenu()!.getBoundingClientRect();
    const triggerBox = ctxTrigger().getBoundingClientRect();
    expect(menuBox.left).toBeGreaterThanOrEqual(triggerBox.left - 2);
    expect(menuBox.top).toBeGreaterThanOrEqual(triggerBox.top - 2);
  });

  it("the Menu key opens it too; arrows move, Enter runs an item and closes", async () => {
    const onDuplicate = vi.fn();
    renderUi(<ContextExample onDuplicate={onDuplicate} />);
    ctxTrigger().focus();
    await userEvent.keyboard("{ContextMenu}");
    await expect.poll(ctxMenu).not.toBeNull();
    // Home is retried until the menu has taken focus and is listening (slower under machine load).
    const first = within(ctxMenu()!).getByRole("menuitem", { name: /Duplicate/ });
    await expect
      .poll(async () => {
        await userEvent.keyboard("{Home}");
        return document.activeElement;
      })
      .toBe(first);
    await userEvent.keyboard("{Enter}");
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    await expect.poll(ctxMenu).toBeNull();
  });

  it("the trigger is focusable and shows a focus ring", async () => {
    renderUi(<ContextExample />);
    await userEvent.tab();
    expect(ctxTrigger()).toHaveFocus();
    expect(parseFloat(getComputedStyle(ctxTrigger()).outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  it("submenu opens with ArrowRight and closes with ArrowLeft", async () => {
    renderUi(<ContextExample />);
    await userEvent.click(ctxTrigger(), { button: "right" });
    await expect.poll(ctxMenu).not.toBeNull();
    const share = within(ctxMenu()!).getByRole("menuitem", { name: /Share/ });
    share.focus();
    await userEvent.keyboard("{ArrowRight}");
    const sub = await screen.findByRole("menu", { name: "Share" });
    expect(within(sub).getByRole("menuitem", { name: "Email" })).toBeInTheDocument();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => screen.queryByRole("menu", { name: "Share" })).toBeNull();
  });

  describeVariants((variant) => {
    it("has no axe violations while open", async () => {
      renderUi(<ContextExample />, variant);
      await userEvent.click(ctxTrigger(), { button: "right" });
      await expect.poll(ctxMenu).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Menubar ---------- */

function BarExample({ onNew }: { onNew?: () => void }) {
  return (
    <Menubar aria-label="Application">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent aria-label="File">
          <MenuItem shortcut="mod+n" onClick={onNew}>
            New note
          </MenuItem>
          <MenuItem>Open</MenuItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent aria-label="Edit">
          <MenuItem>Undo</MenuItem>
          <MenuCheckboxItem defaultChecked>Spellcheck</MenuCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent aria-label="View">
          <MenuItem>Zoom in</MenuItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

const fileMenu = () => screen.queryByRole("menu", { name: "File" });
const editMenu = () => screen.queryByRole("menu", { name: "Edit" });

describe("Menubar", () => {
  it("is a menubar of menu-button triggers", () => {
    renderUi(<BarExample />);
    const bar = screen.getByRole("menubar", { name: "Application" });
    const items = within(bar).getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["File", "Edit", "View"]);
    for (const item of items) {
      expect(item).toHaveAttribute("aria-haspopup", "menu");
      expect(item).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("ArrowDown / Enter open a menu, Escape closes it and returns focus to its trigger", async () => {
    renderUi(<BarExample />);
    const file = screen.getByRole("menuitem", { name: "File" });
    file.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(fileMenu).not.toBeNull();
    expect(file).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => fileMenu()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(fileMenu).toBeNull();
    await expect.poll(() => document.activeElement).toBe(file);

    await userEvent.keyboard("{Enter}");
    await expect.poll(fileMenu).not.toBeNull();
  });

  it("with a menu open, ArrowRight moves to the neighbouring menu and opens it", async () => {
    renderUi(<BarExample />);
    const file = screen.getByRole("menuitem", { name: "File" });
    file.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(fileMenu).not.toBeNull();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(editMenu).not.toBeNull();
    await expect.poll(fileMenu).toBeNull();
    // Keyboard travel along the bar lands on the first item, not on the menu container.
    await expect.poll(() => document.activeElement?.getAttribute("role")).toBe("menuitem");
    await expect.poll(() => editMenu()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(fileMenu).not.toBeNull();
  });

  it("when closed, arrows rove focus between triggers and wrap", async () => {
    renderUi(<BarExample />);
    const [file, edit, view] = screen.getAllByRole("menuitem");
    file!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(edit).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(view).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(file).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(view).toHaveFocus();
  });

  it("hovering a neighbour switches the open menu; selecting an item runs it and closes", async () => {
    const onNew = vi.fn();
    renderUi(<BarExample onNew={onNew} />);
    await userEvent.click(screen.getByRole("menuitem", { name: "File" }));
    await expect.poll(fileMenu).not.toBeNull();
    await userEvent.hover(screen.getByRole("menuitem", { name: "Edit" }));
    await expect.poll(editMenu).not.toBeNull();
    await userEvent.hover(screen.getByRole("menuitem", { name: "File" }));
    await expect.poll(fileMenu).not.toBeNull();
    await userEvent.click(within(fileMenu()!).getByRole("menuitem", { name: /New note/ }));
    expect(onNew).toHaveBeenCalledTimes(1);
    await expect.poll(fileMenu).toBeNull();
  });

  it("an open trigger keeps an inset focus ring (never clipped by the scrolling bar)", async () => {
    renderUi(<BarExample />);
    await userEvent.tab();
    const file = screen.getByRole("menuitem", { name: "File" });
    expect(file).toHaveFocus();
    expect(parseFloat(getComputedStyle(file).outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(parseFloat(getComputedStyle(file).outlineOffset)).toBeLessThan(0);
  });

  it("works with the in-app reduced-motion switch on (the tint jumps, nothing breaks)", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<BarExample />);
    await userEvent.click(screen.getByRole("menuitem", { name: "File" }));
    await expect.poll(fileMenu).not.toBeNull();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(editMenu).not.toBeNull();
  });

  describeVariants((variant) => {
    it("has no axe violations (closed, and with a menu open)", async () => {
      renderUi(<BarExample />, variant);
      expect(await runAxe()).toHaveNoViolations();
      await userEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
      await expect.poll(editMenu).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
