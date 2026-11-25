import { afterEach, describe, expect, it, vi } from "vitest";
import { useState, type ReactElement } from "react";
import { screen } from "@testing-library/react";
import { page, userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/dialog/dialog";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../../src/components/menu/menu";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../../src/components/popover/popover";
import { Select } from "../../src/components/select/select";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

type Mobile = "popup" | "sheet";

const fruit = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/** Every overlay that can be a sheet: how to render it, how to open it and where its popup is. */
const overlays: {
  name: string;
  slot: string;
  ui: (mobile: Mobile, onOpenChange?: (o: boolean) => void) => ReactElement;
  trigger: string;
}[] = [
  {
    name: "Dialog",
    slot: "dialog-content",
    trigger: "Open",
    ui: (mobile, onOpenChange) => (
      <Dialog mobile={mobile} onOpenChange={onOpenChange}>
        <DialogTrigger render={<Button>Open</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Changes are saved when you press Save.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: "Popover",
    slot: "popover-content",
    trigger: "Open",
    ui: (mobile, onOpenChange) => (
      <Popover mobile={mobile} onOpenChange={onOpenChange}>
        <PopoverTrigger render={<Button>Open</Button>} />
        <PopoverContent>
          <PopoverTitle>Billing</PopoverTitle>
          <Button>Manage</Button>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    name: "Menu",
    slot: "menu-content",
    trigger: "Open",
    ui: (mobile, onOpenChange) => (
      <Menu mobile={mobile} onOpenChange={onOpenChange}>
        <MenuTrigger render={<Button>Open</Button>} />
        <MenuContent>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },
  {
    name: "Select",
    slot: "select-popup",
    trigger: "Fruit",
    ui: (mobile, onOpenChange) => <Select label="Fruit" items={fruit} mobile={mobile} onOpenChange={onOpenChange} />,
  },
];

const triggerOf = (o: (typeof overlays)[number]) =>
  o.name === "Select"
    ? screen.getByRole("combobox", { name: "Fruit" })
    : screen.getByRole("button", { name: o.trigger });
/** The open popup (a Select keeps its closed popup mounted, marked `data-closed`). */
const popupOf = (slot: string) => {
  const el = document.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  return el && !el.hasAttribute("data-closed") ? el : null;
};
const handle = () => document.querySelector<HTMLElement>('[data-slot="sheet-handle"]');

/** Waits for the slide-in to settle, then reports the popup's box. */
async function settledBox(slot: string) {
  await expect.poll(() => popupOf(slot)).not.toBeNull();
  const box = () => popupOf(slot)!.getBoundingClientRect();
  await expect.poll(() => Math.abs(box().bottom - window.innerHeight)).toBeLessThan(2);
  return box();
}

afterEach(async () => {
  document.documentElement.removeAttribute("dir");
  await page.viewport(1024, 768);
});

describeVariants((variant) => {
  describe.each(overlays)("$name on a phone", (overlay) => {
    it('mobile="sheet" opens a full-width bottom sheet with a handle, capped height and safe-area padding', async () => {
      await page.viewport(390, 844);
      renderUi(overlay.ui("sheet"), variant);
      await userEvent.click(triggerOf(overlay));
      const box = await settledBox(overlay.slot);
      expect(handle()).not.toBeNull();
      expect(Math.round(box.left)).toBe(0);
      expect(Math.round(box.width)).toBe(390);
      expect(box.height).toBeLessThanOrEqual(844 * 0.85 + 1);
      expect(getComputedStyle(popupOf(overlay.slot)!).overflowY).toBe("auto");
      // The corners that touch the screen edge are square, the top ones round.
      expect(getComputedStyle(popupOf(overlay.slot)!).borderBottomLeftRadius).toBe("0px");
      expect(parseFloat(getComputedStyle(popupOf(overlay.slot)!).borderTopLeftRadius)).toBeGreaterThan(8);
    });

    it("keeps the popup's own padding: inline padding stays, the safe area is only added below", async () => {
      // Dialog p-6, Popover p-4, Menu p-1.5, Select p-1 (in px); the test page has no safe-area inset.
      const inline = { Dialog: 24, Popover: 16, Menu: 6, Select: 4 }[overlay.name]!;
      for (const dir of ["ltr", "rtl"]) {
        document.documentElement.setAttribute("dir", dir);
        await page.viewport(390, 844);
        const view = renderUi(overlay.ui("sheet"), variant);
        await userEvent.click(triggerOf(overlay));
        await settledBox(overlay.slot);
        const style = getComputedStyle(popupOf(overlay.slot)!);
        expect(parseFloat(style.paddingLeft), `${dir} left`).toBe(inline);
        expect(parseFloat(style.paddingRight), `${dir} right`).toBe(inline);
        expect(parseFloat(style.paddingBottom), `${dir} bottom`).toBeGreaterThanOrEqual(inline);
        expect(parseFloat(style.paddingTop), `${dir} top`).toBeGreaterThan(0);
        await userEvent.keyboard("{Escape}");
        await expect.poll(() => popupOf(overlay.slot)).toBeNull();
        view.unmount();
      }
    });

    it("Escape closes the sheet and focus returns to the trigger", async () => {
      await page.viewport(390, 844);
      const onOpenChange = vi.fn();
      renderUi(overlay.ui("sheet", onOpenChange), variant);
      const trigger = triggerOf(overlay);
      await userEvent.click(trigger);
      await settledBox(overlay.slot);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();
      expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
      await expect.poll(() => document.activeElement).toBe(trigger);
    });

    it("swiping the handle down dismisses it; a short drag springs back", async () => {
      await page.viewport(390, 844);
      renderUi(overlay.ui("sheet"), variant);
      await userEvent.click(triggerOf(overlay));
      await settledBox(overlay.slot);

      const fire = (type: string, y: number) =>
        handle()!.dispatchEvent(
          new PointerEvent(type, {
            pointerId: 7,
            pointerType: "touch",
            clientX: 195,
            clientY: y,
            bubbles: true,
            button: 0,
          }),
        );
      // 20 px is far short of the threshold: the sheet settles back to the edge.
      fire("pointerdown", 600);
      fire("pointermove", 620);
      expect(popupOf(overlay.slot)!.style.getPropertyValue("--sheen-sheet-drag")).toBe("20px");
      fire("pointerup", 620);
      await expect.poll(() => popupOf(overlay.slot)!.style.getPropertyValue("--sheen-sheet-drag")).toBe("");
      expect(popupOf(overlay.slot)).not.toBeNull();

      fire("pointerdown", 400);
      fire("pointermove", 520);
      fire("pointermove", 640);
      fire("pointerup", 640);
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();
    });

    it("the handle is a named button: tap and the keyboard close the sheet through onOpenChange", async () => {
      await page.viewport(390, 844);
      const onOpenChange = vi.fn();
      renderUi(overlay.ui("sheet", onOpenChange), variant);
      await userEvent.click(triggerOf(overlay));
      await settledBox(overlay.slot);
      const grab = handle()!;
      expect(grab.tagName).toBe("BUTTON");
      // A Dialog already has a named × (the one Close for assistive tech); the other sheets' handle is that Close.
      if (overlay.name === "Dialog") {
        expect(grab.getAttribute("aria-hidden")).toBe("true");
        expect(grab.hasAttribute("aria-label")).toBe(false);
      } else expect(grab.getAttribute("aria-label")).toBe("Close");
      expect(grab.getBoundingClientRect().height).toBeGreaterThanOrEqual(44 - 0.01); // sub-pixel layout rounding
      await userEvent.click(grab);
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();
      expect(onOpenChange.mock.lastCall?.[0]).toBe(false);

      await userEvent.click(triggerOf(overlay));
      await settledBox(overlay.slot);
      handle()!.focus();
      await userEvent.keyboard("{Enter}");
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();

      await userEvent.click(triggerOf(overlay));
      await settledBox(overlay.slot);
      handle()!.focus();
      await userEvent.keyboard(" ");
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();
    });

    it("has exactly one way to close that assistive technology can name, and Escape closes it", async () => {
      await page.viewport(390, 844);
      renderUi(overlay.ui("sheet"), variant);
      await userEvent.click(triggerOf(overlay));
      await settledBox(overlay.slot);
      const popup = popupOf(overlay.slot)!;
      // The accessibility tree: buttons named "Close" inside the sheet (aria-hidden ones are not in it).
      const closers = [...popup.querySelectorAll<HTMLElement>("button")].filter(
        (b) => !b.closest("[aria-hidden='true']") && b.getAttribute("aria-label") === "Close",
      );
      expect(closers).toHaveLength(1);
      // Keyboard: the handle is out of the Tab order, so a Dialog's visible × is focusable and the others close on Escape.
      if (overlay.name === "Dialog") {
        expect(closers[0]!.tabIndex).toBeGreaterThanOrEqual(0);
        expect(closers[0]!.getBoundingClientRect().height).toBeGreaterThanOrEqual(32 - 0.01);
      }
      expect(handle()!.tabIndex).toBe(-1);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();
    });

    it("after a dismissing swipe the sheet keeps travelling down: it never rebounds up", async () => {
      await page.viewport(390, 844);
      renderUi(overlay.ui("sheet"), variant);
      await userEvent.click(triggerOf(overlay));
      await settledBox(overlay.slot);
      const fire = (type: string, y: number) =>
        handle()!.dispatchEvent(
          new PointerEvent(type, {
            pointerId: 8,
            pointerType: "touch",
            clientX: 195,
            clientY: y,
            bubbles: true,
            button: 0,
          }),
        );
      fire("pointerdown", 400);
      fire("pointermove", 800);
      fire("pointermove", 1100); // far past the sheet's own height: the exit must not pull it back up to the edge
      fire("pointerup", 1100);
      // Sampled every frame until it leaves: the top edge never moves up and the drag offset is never cleared early.
      let lastTop = -Infinity;
      let rebounded = false;
      await expect
        .poll(
          () => {
            const popup = popupOf(overlay.slot);
            if (!popup) return true;
            const top = popup.getBoundingClientRect().top;
            if (top < lastTop - 1) rebounded = true;
            if (!popup.hasAttribute("data-ending-style") && popup.style.getPropertyValue("--sheen-sheet-drag") === "")
              rebounded = true;
            lastTop = Math.max(lastTop, top);
            return false;
          },
          { interval: 16, timeout: 3000 },
        )
        .toBe(true);
      expect(rebounded).toBe(false);
    });

    it('the default mobile="popup" and wide screens keep the floating popup (no handle)', async () => {
      await page.viewport(390, 844);
      const first = renderUi(overlay.ui("popup"), variant);
      await userEvent.click(triggerOf(overlay));
      await expect.poll(() => popupOf(overlay.slot)).not.toBeNull();
      expect(handle()).toBeNull();
      first.unmount();

      await page.viewport(1024, 768);
      renderUi(overlay.ui("sheet"), variant);
      await userEvent.click(triggerOf(overlay));
      await expect.poll(() => popupOf(overlay.slot)).not.toBeNull();
      expect(handle()).toBeNull();
    });

    it("works with reduced motion and in a right-to-left page", async () => {
      await page.viewport(390, 844);
      reduceMotion();
      document.documentElement.setAttribute("dir", "rtl");
      renderUi(overlay.ui("sheet"), variant);
      await userEvent.click(triggerOf(overlay));
      const box = await settledBox(overlay.slot);
      expect(Math.round(box.width)).toBe(390);
      // The handle sits in the middle whichever way the page reads.
      const h = handle()!.getBoundingClientRect();
      expect(Math.abs(h.left + h.width / 2 - 195)).toBeLessThan(2);
      // Nothing slides: no transform animation runs on the sheet.
      const sliding = popupOf(overlay.slot)!
        .getAnimations()
        .filter((a) => a instanceof CSSTransition && a.transitionProperty === "transform");
      expect(sliding).toHaveLength(0);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => popupOf(overlay.slot)).toBeNull();
    });

    it.each<Mobile>(["popup", "sheet"])(
      "under reduced motion the %s exit is a short opacity fade (no hard cut)",
      async (mobile) => {
        await page.viewport(390, 844);
        reduceMotion();
        renderUi(overlay.ui(mobile), variant);
        await userEvent.click(triggerOf(overlay));
        await expect.poll(() => popupOf(overlay.slot)).not.toBeNull();
        const popup = popupOf(overlay.slot)!;
        let ending: { property: string[]; duration: number[] } | null = null;
        const watch = new MutationObserver(() => {
          if (!ending && popup.hasAttribute("data-ending-style")) {
            const cs = getComputedStyle(popup);
            ending = {
              property: cs.transitionProperty.split(",").map((p) => p.trim()),
              duration: cs.transitionDuration
                .split(",")
                .map((d) => parseFloat(d) * (d.trim().endsWith("ms") ? 0.001 : 1)),
            };
          }
        });
        watch.observe(popup, { attributes: true, attributeFilter: ["data-ending-style"] });
        await userEvent.keyboard("{Escape}");
        await expect.poll(() => ending).not.toBeNull();
        watch.disconnect();
        const at = ending!.property.indexOf("opacity");
        expect(at).toBeGreaterThanOrEqual(0);
        expect(ending!.duration[at % ending!.duration.length]).toBeGreaterThan(0);
        await expect.poll(() => popupOf(overlay.slot)).toBeNull();
      },
    );
  });

  it("a Select opened and closed 20 times in a row always settles closed", async () => {
    await page.viewport(390, 844);
    reduceMotion();
    renderUi(overlays[3]!.ui("sheet"), variant);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    for (let i = 0; i < 20; i++) {
      await userEvent.click(trigger);
      await userEvent.keyboard("{Escape}");
    }
    await expect.poll(() => popupOf("select-popup")).toBeNull();
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    // A hidden popup may stay mounted (`data-closed`), but nothing is shown.
    for (const el of document.querySelectorAll<HTMLElement>('[data-slot="select-popup"]')) {
      expect(el.hasAttribute("data-open")).toBe(false);
    }
  });

  it("a Dialog sheet is named, modal and has no axe violations", async () => {
    await page.viewport(390, 844);
    renderUi(overlays[0]!.ui("sheet"), variant);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await settledBox("dialog-content");
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toHaveAttribute("aria-modal", "true");
    expect(await runAxe()).toHaveNoViolations();
  });

  it("a Popover sheet is modal: named, aria-modal and Tab stays inside it", async () => {
    await page.viewport(390, 844);
    renderUi(
      <div>
        <Button>Before</Button>
        <Popover mobile="sheet">
          <PopoverTrigger render={<Button>Open</Button>} />
          <PopoverContent>
            <PopoverTitle>Billing</PopoverTitle>
            <Button>First</Button>
            <Button>Second</Button>
          </PopoverContent>
        </Popover>
        <Button>After</Button>
      </div>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await settledBox("popover-content");
    const dialog = screen.getByRole("dialog", { name: "Billing" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    for (let i = 0; i < 8; i++) {
      await userEvent.keyboard("{Tab}");
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 4; i++) {
      await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    expect(await runAxe()).toHaveNoViolations();
  });

  it("a Select sheet still selects with the keyboard", async () => {
    await page.viewport(390, 844);
    function Host() {
      const [value, setValue] = useState<string | null>(null);
      return <Select label="Fruit" items={fruit} mobile="sheet" value={value} onValueChange={setValue} />;
    }
    renderUi(<Host />, variant);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await settledBox("select-popup");
    await expect.poll(() => document.querySelector('[role="option"][data-highlighted]')).not.toBeNull();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect.poll(() => trigger.textContent).toContain("Banana");
  });
});
