import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Badge } from "../../src/components/badge/badge";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("renders its text in a span and forwards native props", () => {
    renderUi(
      <Badge data-testid="b" id="status" title="Build status">
        Stable
      </Badge>,
      variant,
    );
    const badge = screen.getByTestId("b");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveTextContent("Stable");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("id", "status");
    expect(badge).toHaveAttribute("title", "Build status");
  });

  it("draws a decorative dot for `dot` and `pulse` only", () => {
    renderUi(
      <>
        <Badge data-testid="plain">Plain</Badge>
        <Badge data-testid="dot" dot>
          Dot
        </Badge>
        <Badge data-testid="pulse" pulse>
          Live
        </Badge>
      </>,
      variant,
    );
    expect(screen.getByTestId("plain").querySelector("[aria-hidden]")).toBeNull();
    const dot = screen.getByTestId("dot").querySelector("[aria-hidden]")!;
    expect(dot).toBeInTheDocument();
    expect(dot.children).toHaveLength(1);
    // The pulse adds a ping ring that is capped at a few iterations (WCAG 2.2.2).
    const ring = screen.getByTestId("pulse").querySelector<HTMLElement>("[aria-hidden] > span")!;
    expect(ring.style.animationIterationCount).toBe("4");
  });

  it("merges a custom className and picks a tone", () => {
    renderUi(
      <Badge tone="danger" className="custom-x" data-testid="b">
        Failed
      </Badge>,
      variant,
    );
    expect(screen.getByTestId("b")).toHaveClass("custom-x");
    expect(screen.getByTestId("b").className).toContain("sheen-danger-text");
  });

  it("has no axe violations for every tone", async () => {
    renderUi(
      <div className="flex gap-2">
        <Badge>Neutral</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success" dot>
          Success
        </Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger" pulse>
          Danger
        </Badge>
        <Badge tone="solid">Solid</Badge>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("with reduced motion the badge still renders its dot (no animation needed)", () => {
  reduceMotion();
  renderUi(
    <Badge pulse data-testid="b">
      Live
    </Badge>,
  );
  expect(screen.getByTestId("b")).toHaveTextContent("Live");
  expect(screen.getByTestId("b").querySelector("[aria-hidden]")).toBeInTheDocument();
});
