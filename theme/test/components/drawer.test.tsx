import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerSide,
  type DrawerSnapPoint,
} from "../../src/components/drawer/drawer";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Example({ side, ...rest }: Partial<React.ComponentProps<typeof Drawer>> & { side?: DrawerSide }) {
  return (
    <Drawer side={side} {...rest}>
      <DrawerTrigger render={<Button variant="glass" />}>Open filters</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the results.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <label>
            Keyword <input />
          </label>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost" />}>Reset</DrawerClose>
          <DrawerClose render={<Button />}>Apply</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const dialog = () => screen.queryByRole("dialog");
const trigger = () => screen.getByRole("button", { name: "Open filters" });
const handle = () => screen.queryByRole("button", { name: /(Expand|Collapse) sheet/ });

describeVariants((variant) => {
  it("opens as a labelled, described modal dialog and closes with Escape, restoring focus", async () => {
    renderUi(<Example />, variant);
    expect(dialog()).toBeNull();
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()).toHaveAccessibleName("Filters");
    expect(dialog()).toHaveAccessibleDescription("Narrow the results.");
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("opens from the keyboard, keeps focus inside, and the × button and DrawerClose close it", async () => {
    renderUi(<Example />, variant);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      // Focus may pass through a focus guard for a moment before it is wrapped back into the dialog.
      await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    }
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await expect.poll(dialog).toBeNull();

    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await expect.poll(dialog).toBeNull();
  });

  it("clicking the scrim dismisses a modal drawer", async () => {
    renderUi(<Example side="left" />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(document.documentElement, { position: { x: 1000, y: 10 } });
    await expect.poll(dialog).toBeNull();
  });

  it.each(["left", "right", "top", "bottom"] as const)("side=%s docks to that edge", async (side) => {
    renderUi(<Example side={side} />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await settle();
    const r = dialog()!.getBoundingClientRect();
    const { innerWidth: w, innerHeight: h } = window;
    if (side === "left") expect(r.left).toBeLessThanOrEqual(1);
    if (side === "right") expect(Math.round(r.right)).toBeGreaterThanOrEqual(w - 1);
    if (side === "top") expect(r.top).toBeLessThanOrEqual(1);
    if (side === "bottom") expect(Math.round(r.bottom)).toBeGreaterThanOrEqual(h - 1);
  });

  it("showClose={false} hides the × and labels.close renames it", async () => {
    const { rerender } = renderUi(<Example labels={{ close: "Schließen" }} />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(screen.getByRole("button", { name: "Schließen" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    rerender(
      <Drawer defaultOpen>
        <DrawerContent showClose={false} handle={false}>
          <DrawerTitle>Bare</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
  });

  it("snap points: the handle names the height, arrows/Home/End change it and report", async () => {
    const onSnapPointChange = vi.fn();
    renderUi(<Example snapPoints={["peek", "half", "full"]} onSnapPointChange={onSnapPointChange} />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(handle).not.toBeNull();
    // Let the open transition and the peek-height measurement finish (see the skipped race test below).
    await settle();
    const h = handle()!;
    expect(h).toHaveAttribute("aria-label", "Expand sheet");
    expect(h).toHaveAccessibleDescription("Peek height. Arrow keys change the height.");
    h.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onSnapPointChange.mock.lastCall![0]).toBe("half");
    await expect.poll(() => handle()!.getAttribute("aria-label")).toBe("Expand sheet");
    expect(handle()).toHaveAccessibleDescription("Half height. Arrow keys change the height.");
    await userEvent.keyboard("{End}");
    expect(onSnapPointChange.mock.lastCall![0]).toBe("full");
    await expect.poll(() => handle()!.getAttribute("aria-label")).toBe("Collapse sheet");
    // A polite status announces the new height.
    expect(screen.getAllByRole("status").map((s) => s.textContent)).toContain("Full height");
    await userEvent.keyboard("{Home}");
    expect(onSnapPointChange.mock.lastCall![0]).toBe("peek");
    // Clicking the handle cycles to the next height.
    await userEvent.click(handle()!);
    expect(onSnapPointChange.mock.lastCall![0]).toBe("half");
  });

  it("controlled snapPoint and custom (numeric) snap points get positional names", async () => {
    function Controlled() {
      const [snap, setSnap] = useState<DrawerSnapPoint | null>(0.3);
      return (
        <Example
          snapPoints={[0.3, 0.6]}
          snapPoint={snap}
          onSnapPointChange={setSnap}
          labels={{ expand: "Aufklappen", customSnapPoint: (p, c) => `Höhe ${p} von ${c}`, handleHint: "Pfeiltasten." }}
        />
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    const h = await screen.findByRole("button", { name: "Aufklappen" });
    await settle();
    expect(h).toHaveAccessibleDescription("Höhe 1 von 2. Pfeiltasten.");
    h.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => screen.getByRole("button", { name: /Collapse sheet/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Collapse sheet/ })).toHaveAccessibleDescription(
      "Höhe 2 von 2. Pfeiltasten.",
    );
  });

  it("without snap points the handle is decorative", async () => {
    renderUi(<Example side="bottom" />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(handle()).toBeNull();
    expect(document.querySelector("[data-slot=drawer-handle]")).toBeInTheDocument();
  });

  it("controlled open / onOpenChange", async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return <Example open={open} onOpenChange={setOpen} />;
    }
    renderUi(<Controlled />, variant);
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
  });

  it("has no axe violations while open (side sheet and bottom sheet with snap points)", async () => {
    renderUi(<Example side="right" />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();

    renderUi(<Example side="bottom" snapPoints={["peek", "half"]} />, variant);
    await userEvent.click(screen.getAllByRole("button", { name: "Open filters" }).at(-1)!);
    await expect.poll(dialog).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: opens and closes without a slide", async () => {
  reduceMotion();
  renderUi(<Example side="right" />);
  await userEvent.click(trigger());
  await expect.poll(dialog).not.toBeNull();
  await settle();
  await userEvent.keyboard("{Escape}");
  await expect.poll(dialog).toBeNull();
});

it("one ArrowUp right after opening moves exactly one snap point", async () => {
  const onSnapPointChange = vi.fn();
  renderUi(<Example snapPoints={["peek", "half", "full"]} onSnapPointChange={onSnapPointChange} />);
  await userEvent.click(trigger());
  const h = await screen.findByRole("button", { name: /Expand sheet/ });
  h.focus();
  await userEvent.keyboard("{ArrowUp}");
  // Let the sheet finish sliding in: focus on the handle must not make it jump on to "full".
  await settle();
  expect((onSnapPointChange.mock.calls as unknown[][]).map((c) => c[0])).toEqual(["half"]);
});

describeVariants((variant) => {
  it.each(["left", "right", "top", "bottom"] as const)(
    "a glass %s drawer's edge bleed sits outside the panel, never as a strip inside it",
    async (side) => {
      renderUi(<Example side={side} />, variant);
      await userEvent.click(trigger());
      await expect.poll(dialog).not.toBeNull();
      const panel = dialog()!;
      const bleed = getComputedStyle(panel, "::after");
      const left = parseFloat(bleed.left);
      const top = parseFloat(bleed.top);
      const width = panel.clientWidth;
      const height = panel.clientHeight;
      if (side === "left") expect(left).toBeLessThan(0);
      if (side === "right") expect(left).toBeGreaterThanOrEqual(width - 2);
      if (side === "top") expect(top).toBeLessThan(0);
      if (side === "bottom") expect(top).toBeGreaterThanOrEqual(height - 2);
    },
  );
});
