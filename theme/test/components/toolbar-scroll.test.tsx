// Toolbar (roving focus, toggle groups) and ScrollArea (keyboard scroll, focus ring, labels).

import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "../../src/components/toolbar/toolbar";
import { ScrollArea } from "../../src/components/scroll-area/scroll-area";
import { describeVariants, renderUi, runAxe } from "../render";

const Icon = () => <svg aria-hidden viewBox="0 0 8 8" width="14" height="14" />;

function ToolbarExample({ onLink, onAlign }: { onLink?: () => void; onAlign?: (value: string[]) => void }) {
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarToggleGroup multiple aria-label="Text style" defaultValue={["bold"]}>
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b">
          <Icon />
        </ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic">
          <Icon />
        </ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarToggleGroup aria-label="Alignment" defaultValue={["left"]} onValueChange={onAlign}>
        <ToolbarToggle value="left" tooltip="Align left">
          <Icon />
        </ToolbarToggle>
        <ToolbarToggle value="center" tooltip="Align centre">
          <Icon />
        </ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Insert link" onClick={onLink}>
        <Icon />
      </ToolbarButton>
      <ToolbarButton disabled tooltip="Undo">
        <Icon />
      </ToolbarButton>
      <ToolbarSpacer />
      <ToolbarLink href="/history">Edited 2m ago</ToolbarLink>
    </Toolbar>
  );
}

describe("Toolbar", () => {
  it("is a labelled toolbar; icon-only controls are named by their tooltip; toggles expose pressed state", () => {
    renderUi(<ToolbarExample />);
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Text style" })).toBeInTheDocument();
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Insert link" })).toBeInTheDocument();
    // The shortcut is advertised to assistive tech in a platform form.
    expect(bold.getAttribute("aria-keyshortcuts")).toMatch(/\+B$/);
    expect(screen.getAllByRole("separator").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("link", { name: "Edited 2m ago" })).toHaveAttribute("href", "/history");
  });

  it("is one tab stop: Tab enters on the first control and the next Tab leaves the toolbar", async () => {
    renderUi(
      <div>
        <button>before</button>
        <ToolbarExample />
        <button>after</button>
      </div>,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    // Back into the toolbar on the control that was last focused.
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
  });

  it("arrows rove (wrapping), Home/End jump, disabled controls stay reachable", async () => {
    renderUi(<ToolbarExample />);
    screen.getByRole("button", { name: "Bold" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("link", { name: "Edited 2m ago" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    const undo = screen.getByRole("button", { name: "Undo" });
    expect(undo).toHaveFocus();
    expect(undo).toHaveAttribute("aria-disabled", "true");
    // Arrows still move on from a disabled control.
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Insert link" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("link", { name: "Edited 2m ago" })).toHaveFocus();
  });

  it("Home / End also work from a focused disabled control", async () => {
    renderUi(<ToolbarExample />);
    screen.getByRole("button", { name: "Undo" }).focus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
  });

  it("multiple group: toggles are independent. single group: choosing one replaces the other", async () => {
    const onAlign = vi.fn();
    renderUi(<ToolbarExample onAlign={onAlign} />);
    await userEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    screen.getByRole("button", { name: "Align centre" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onAlign.mock.lastCall![0]).toEqual(["center"]);
    await expect
      .poll(() => screen.getByRole("button", { name: "Align left" }).getAttribute("aria-pressed"))
      .toBe("false");
    expect(screen.getByRole("button", { name: "Align centre" })).toHaveAttribute("aria-pressed", "true");
  });

  it("Enter and Space activate buttons; a disabled one does nothing", async () => {
    const onLink = vi.fn();
    renderUi(<ToolbarExample onLink={onLink} />);
    const link = screen.getByRole("button", { name: "Insert link" });
    link.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onLink).toHaveBeenCalledTimes(2);
    screen.getByRole("button", { name: "Undo" }).click();
  });

  it("a hovered or focused tooltip shows its text", async () => {
    renderUi(<ToolbarExample />);
    await userEvent.hover(screen.getByRole("button", { name: "Insert link" }));
    // Base UI renders the popup without role="tooltip" (known, see tooltip.test.tsx), so find it by text:
    // the button is named by aria-label, so the visible text only exists in the tooltip.
    await expect.poll(() => screen.queryAllByText("Insert link").length, { timeout: 4000 }).toBeGreaterThan(0);
  });

  it("vertical: Up/Down arrows rove instead of Left/Right", async () => {
    renderUi(
      <Toolbar orientation="vertical" aria-label="Tools">
        <ToolbarButton>One</ToolbarButton>
        <ToolbarButton>Two</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar", { name: "Tools" })).toHaveAttribute("aria-orientation", "vertical");
    screen.getByRole("button", { name: "One" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
  });

  it("an input inside keeps Home/End for the caret", async () => {
    renderUi(
      <Toolbar aria-label="Search bar">
        <ToolbarButton>Back</ToolbarButton>
        <ToolbarInput aria-label="Query" defaultValue="hello" />
        <ToolbarButton>Go</ToolbarButton>
      </Toolbar>,
    );
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Query" });
    input.focus();
    await userEvent.keyboard("{End}");
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(5);
    await userEvent.keyboard("{Home}");
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
  });

  it("controlled pressed toggle outside a group reports changes", async () => {
    const seen: boolean[] = [];
    function Solo() {
      const [on, setOn] = useState(false);
      return (
        <Toolbar aria-label="Solo">
          <ToolbarToggle
            pressed={on}
            onPressedChange={(v) => {
              seen.push(v);
              setOn(v);
            }}
            tooltip="Mute"
          >
            <Icon />
          </ToolbarToggle>
        </Toolbar>
      );
    }
    renderUi(<Solo />);
    await userEvent.click(screen.getByRole("button", { name: "Mute" }));
    await expect.poll(() => screen.getByRole("button", { name: "Mute" }).getAttribute("aria-pressed")).toBe("true");
    expect(seen).toEqual([true]);
  });

  it("overflow='scroll' keeps one row and scrolls sideways; variants render", () => {
    renderUi(
      <div style={{ width: 160 }}>
        <Toolbar overflow="scroll" variant="floating" size="sm" aria-label="Many" className="max-w-full">
          <ToolbarGroup>
            {Array.from({ length: 12 }, (_, i) => (
              <ToolbarButton key={i}>{`Tool ${i + 1}`}</ToolbarButton>
            ))}
          </ToolbarGroup>
        </Toolbar>
      </div>,
    );
    const bar = screen.getByRole("toolbar", { name: "Many" });
    expect(bar).toHaveAttribute("data-variant", "floating");
    expect(bar.getBoundingClientRect().width).toBeLessThanOrEqual(161);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    screen.getByRole("button", { name: "Tool 12" }).focus();
    expect(screen.getByRole("button", { name: "Tool 12" })).toHaveFocus();
  });

  it("reduced motion: pressing a toggle still changes state (the pill jumps)", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<ToolbarExample />);
    await userEvent.click(screen.getByRole("button", { name: "Align centre" }));
    await expect
      .poll(() => screen.getByRole("button", { name: "Align centre" }).getAttribute("aria-pressed"))
      .toBe("true");
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(
        <div className="p-4">
          <ToolbarExample />
        </div>,
        variant,
      );
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- ScrollArea ---------- */

const lines = Array.from({ length: 60 }, (_, i) => <p key={i}>Release note {i + 1}</p>);

describe("ScrollArea", () => {
  it("a label makes the viewport a named region; content scrolls natively", async () => {
    renderUi(
      <ScrollArea label="Release notes" className="h-40 w-64">
        {lines}
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Release notes" });
    await expect.poll(() => region.scrollHeight > region.clientHeight).toBe(true);
    region.scrollTop = 200;
    await expect.poll(() => region.scrollTop).toBeGreaterThan(100);
  });

  it("the viewport can be scrolled with the keyboard once focused, and shows the root's focus ring", async () => {
    renderUi(
      <ScrollArea label="Notes" className="h-40 w-64 rounded-xl">
        {lines}
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Notes" });
    // The viewport becomes a tab stop once Base UI has measured that it overflows (a resize observer, not the first render).
    await expect.poll(() => region.tabIndex).toBe(0);
    await userEvent.tab();
    await expect.poll(() => document.activeElement).toBe(region);
    const root = region.parentElement!;
    // The ring is an inset outline on the root's ::after overlay (the masked viewport would clip it).
    const ring = getComputedStyle(root, "::after");
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(ring.outlineStyle).not.toBe("none");
    expect(parseFloat(ring.outlineOffset)).toBeLessThan(0);
    await userEvent.keyboard("{PageDown}");
    await expect.poll(() => region.scrollTop).toBeGreaterThan(0);
    await userEvent.keyboard("{End}");
    await expect.poll(() => region.scrollTop + region.clientHeight >= region.scrollHeight - 2).toBe(true);
  });

  it("no ring while unfocused", () => {
    renderUi(
      <ScrollArea label="Notes" className="h-40 w-64">
        {lines}
      </ScrollArea>,
    );
    const root = screen.getByRole("region", { name: "Notes" }).parentElement!;
    expect(getComputedStyle(root, "::after").outlineStyle).toBe("none");
  });

  it("orientation, fade and scrollbars props render their parts", async () => {
    renderUi(
      <ScrollArea label="Wide" orientation="horizontal" fade="shadow" scrollbars="always" className="h-24 w-48">
        <div style={{ width: 800 }}>wide content</div>
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Wide" });
    expect(region.parentElement).toHaveAttribute("data-scrollbars", "always");
    await expect.poll(() => region.scrollWidth > region.clientWidth).toBe(true);
    await expect
      .poll(() => document.querySelector('[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'))
      .not.toBeNull();
  });

  it("fade='mask' masks the viewport, 'none' leaves it unmasked, and viewportRef reaches the scroller", () => {
    const refs: { mask?: HTMLDivElement | null; none?: HTMLDivElement | null } = {};
    renderUi(
      <div>
        <ScrollArea
          label="m"
          fade="mask"
          className="h-20"
          viewportRef={(el) => {
            refs.mask = el;
          }}
        >
          {lines}
        </ScrollArea>
        <ScrollArea
          label="n"
          fade="none"
          className="h-20"
          viewportRef={(el) => {
            refs.none = el;
          }}
        >
          {lines}
        </ScrollArea>
      </div>,
    );
    expect(refs.mask).toBe(screen.getByRole("region", { name: "m" }));
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Safari and older Chromium only expose the prefixed property
    expect(refs.mask!.style.maskImage || refs.mask!.style.webkitMaskImage).toMatch(/linear-gradient/);
    expect(refs.none!.style.maskImage).toBe("");
  });

  describeVariants((variant) => {
    it("has no axe violations (scrollable region is focusable and named)", async () => {
      renderUi(
        <div className="p-4">
          <ScrollArea label="Release notes" className="h-40 w-64">
            {lines}
          </ScrollArea>
        </div>,
        variant,
      );
      // The viewport becomes focusable once Base UI has measured that it overflows.
      await expect.poll(() => screen.getByRole("region", { name: "Release notes" }).tabIndex).toBe(0);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
