import { expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";

import {
  Skeleton,
  SkeletonCard,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonList,
  SkeletonRect,
  SkeletonText,
} from "../../src/components/skeleton/skeleton";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("every shape is decorative (aria-hidden) and takes px or CSS sizes", () => {
    renderUi(<Skeleton data-testid="s" width={120} height="2rem" />, variant);
    const s = screen.getByTestId("s");
    expect(s).toHaveAttribute("aria-hidden", "true");
    expect(s.style.width).toBe("120px");
    expect(s.style.height).toBe("2rem");
  });

  it("a circle's height defaults to its width", () => {
    renderUi(<Skeleton shape="circle" width={40} data-testid="c" />, variant);
    expect(screen.getByTestId("c").style.height).toBe("40px");
  });

  it("SkeletonGroup is a named status region; labels={{ loading: null }} removes it", () => {
    const { rerender } = renderUi(
      <SkeletonGroup labels={{ loading: "Loading projects" }}>
        <Skeleton width={10} height={10} />
      </SkeletonGroup>,
      variant,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading projects");
    rerender(
      <SkeletonGroup labels={{ loading: null }} data-testid="g">
        <Skeleton width={10} height={10} />
      </SkeletonGroup>,
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByTestId("g")).toHaveAttribute("data-slot", "skeleton-group");
  });

  it("default group label is 'Loading…'", () => {
    renderUi(
      <SkeletonGroup>
        <SkeletonText />
      </SkeletonGroup>,
      variant,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("SkeletonText renders the requested number of lines, a shorter last line and an optional status label", () => {
    renderUi(<SkeletonText lines={4} lastLineWidth="40%" labels={{ loading: "Loading article" }} />, variant);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading article");
    const bars = status.querySelectorAll<HTMLElement>("[data-slot=skeleton]");
    expect(bars).toHaveLength(4);
    expect(bars[3]!.style.width).toBe("40%");
  });

  it("SkeletonText with zero lines renders none", () => {
    renderUi(<SkeletonText lines={0} data-testid="t" />, variant);
    expect(screen.getByTestId("t").querySelectorAll("[data-slot=skeleton]")).toHaveLength(0);
  });

  it("SkeletonCircle takes a named or numeric size; SkeletonRect keeps a ratio unless height is set", () => {
    renderUi(
      <>
        <SkeletonCircle size="xl" data-testid="c1" />
        <SkeletonCircle size="lg" data-testid="c2" />
        <SkeletonRect ratio="16 / 9" data-testid="r1" />
        <SkeletonRect ratio="16 / 9" height={80} data-testid="r2" />
      </>,
      variant,
    );
    expect(screen.getByTestId("c1").style.width).toBe("64px");
    expect(screen.getByTestId("c2").style.width).toBe("48px");
    expect(screen.getByTestId("r1").style.aspectRatio).toBe("16 / 9");
    expect(screen.getByTestId("r2").style.height).toBe("80px");
  });

  it("SkeletonCard and SkeletonList compose shapes and announce once", () => {
    renderUi(
      <>
        <SkeletonCard media avatar lines={2} actions={2} labels={{ loading: "Loading card" }} />
        <SkeletonList rows={3} avatar trailing labels={{ loading: "Loading list" }} />
      </>,
      variant,
    );
    const cards = screen.getAllByRole("status");
    expect(cards.map((c) => c.textContent)).toEqual(["Loading card", "Loading list"]);
    expect(document.querySelectorAll("[data-slot=skeleton-card] [data-slot=skeleton]").length).toBeGreaterThan(5);
    expect(document.querySelectorAll("[data-slot=skeleton-list] [data-slot=skeleton]").length).toBeGreaterThanOrEqual(
      9,
    );
  });

  it("has no axe violations (cards, lists, text inside a group)", async () => {
    renderUi(
      <SkeletonGroup labels={{ loading: "Loading dashboard" }}>
        <SkeletonCard media avatar lines={3} actions={1} labels={{ loading: null }} />
        <SkeletonList rows={2} avatar trailing labels={{ loading: null }} />
        <SkeletonText lines={2} />
      </SkeletonGroup>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("the shimmer sweep is drawn normally, and never under reduced motion", () => {
  renderUi(
    <SkeletonGroup>
      <Skeleton width={50} height={10} data-testid="s" />
    </SkeletonGroup>,
  );
  expect(getComputedStyle(screen.getByTestId("s").querySelector("span")!).display).toBe("block");
  cleanup();
  reduceMotion();
  renderUi(
    <SkeletonGroup>
      <Skeleton width={50} height={10} data-testid="s" />
    </SkeletonGroup>,
  );
  expect(getComputedStyle(screen.getByTestId("s").querySelector("span")!).display).toBe("none");
});

it("shimmer={false} draws no sweep", () => {
  renderUi(<Skeleton shimmer={false} width={20} height={20} data-testid="s" />);
  expect(screen.getByTestId("s").querySelector("span")).toBeNull();
});
