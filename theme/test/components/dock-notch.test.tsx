import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Dock, DockItem } from "../../src/components/dock/dock";
import { reduceMotion } from "../helpers";
import { renderUi, runAxe, variants } from "../render";

const glyph = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
);

function Notched({ active = "Mail" }: { active?: string }) {
  return (
    <Dock label="Apps" notch>
      {["Finder", "Mail", "Notes"].map((name) => (
        <DockItem key={name} label={name} icon={glyph} active={name === active} />
      ))}
    </Dock>
  );
}

describe("Dock notch", () => {
  it("cuts a notch into the glass bar itself and lifts only the active tile", async () => {
    renderUi(<Notched />);
    const bar = document.querySelector<HTMLElement>("[data-slot='dock-bar']")!;
    await vi.waitFor(() => expect(bar).toHaveAttribute("data-notch"));
    // The notch is a clip-path on the glass element itself, never on a wrapper of it.
    await vi.waitFor(() => expect(getComputedStyle(bar).clipPath).toContain("polygon("));
    const root = getComputedStyle(document.querySelector("[data-slot='dock']")!);
    expect(root.clipPath).toBe("none");
    expect(root.maskImage).toBe("none");
    const lifted = document.querySelectorAll("[data-lifted]");
    expect(lifted).toHaveLength(1);
    expect(lifted[0]).toHaveAccessibleName("Mail, open");
    expect(getComputedStyle(lifted[0]!).translate).not.toBe("none");
  });

  it("without `notch` nothing is clipped or lifted", () => {
    renderUi(
      <Dock label="Plain">
        <DockItem label="Mail" icon={glyph} active />
      </Dock>,
    );
    expect(document.querySelector("[data-slot='dock-bar']")).not.toHaveAttribute("data-notch");
    expect(document.querySelector("[data-lifted]")).toBeNull();
  });

  it("moves the lift to the newly active item and keeps keyboard behaviour", async () => {
    const { rerender } = renderUi(<Notched />);
    screen.getByRole("button", { name: "Finder" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Mail, open" })).toHaveFocus();
    rerender(<Notched active="Notes" />);
    expect(document.querySelector("[data-lifted]")).toHaveAccessibleName("Notes, open");
  });

  it("reduced motion: the lift has no long transition", () => {
    reduceMotion();
    renderUi(<Notched />);
    const lifted = document.querySelector<HTMLElement>("[data-lifted]")!;
    expect(parseFloat(getComputedStyle(lifted).transitionDuration)).toBeLessThanOrEqual(0.12);
  });

  it("has no axe violations in either preset", async () => {
    for (const variant of variants) {
      const { unmount } = renderUi(<Notched />, variant);
      expect(await runAxe()).toHaveNoViolations();
      unmount();
    }
  });
});
