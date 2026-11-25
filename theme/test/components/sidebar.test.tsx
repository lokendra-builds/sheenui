import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { Sidebar, SidebarGroup, SidebarItem, useSidebar } from "../../src/components/sidebar/sidebar";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("starts collapsed with defaultCollapsed and reports changes through useSidebar().setCollapsed", () => {
    const onCollapsedChange = vi.fn();
    function Toggle() {
      const { collapsed, setCollapsed } = useSidebar();
      return (
        <button type="button" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "Expand" : "Collapse"}
        </button>
      );
    }
    const { container } = renderUi(
      <Sidebar defaultCollapsed onCollapsedChange={onCollapsedChange}>
        <Toggle />
      </Sidebar>,
      variant,
    );
    expect(container.querySelector("[data-collapsed]")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(container.querySelector("[data-collapsed]")).toBeNull();
  });

  it("renders a link with href and a button without, and marks the current page", () => {
    renderUi(
      <Sidebar>
        <SidebarItem href="#a" active>
          Alpha
        </SidebarItem>
        <SidebarItem onClick={() => undefined}>Beta</SidebarItem>
      </Sidebar>,
      variant,
    );
    expect(screen.getByRole("link", { name: "Alpha" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("type", "button");
  });

  it("forwards ref and takes `render` (a router link) without losing the look or aria-current", () => {
    const ref = createRef<HTMLAnchorElement>();
    renderUi(
      <Sidebar>
        <SidebarItem ref={ref} render={<a href="/routed" data-router="yes" />} active>
          Routed
        </SidebarItem>
      </Sidebar>,
      variant,
    );
    const link = screen.getByRole("link", { name: "Routed" });
    expect(link).toHaveAttribute("data-router", "yes");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-slot", "sidebar-item");
    expect(ref.current).toBe(link);
  });

  it("anchor-only attributes never land on the button", () => {
    renderUi(
      <Sidebar>
        <SidebarItem target="_blank" download onClick={() => undefined}>
          Act
        </SidebarItem>
      </Sidebar>,
      variant,
    );
    const button = screen.getByRole("button", { name: "Act" });
    expect(button).not.toHaveAttribute("target");
    expect(button).not.toHaveAttribute("download");
  });

  it("hides a 0 badge unless showZero is set", () => {
    renderUi(
      <Sidebar>
        <SidebarItem href="#a" badge={0}>
          Zero
        </SidebarItem>
        <SidebarItem href="#b" badge={0} showZero>
          Shown
        </SidebarItem>
        <SidebarItem href="#c" badge={3}>
          Three
        </SidebarItem>
      </Sidebar>,
      variant,
    );
    expect(screen.getByRole("link", { name: "Zero" }).textContent).toBe("Zero");
    expect(screen.getByRole("link", { name: /Shown/ })).toHaveTextContent("0");
    expect(screen.getByRole("link", { name: /Three/ })).toHaveTextContent("3");
  });

  it("a disabled link has no href; a disabled button is disabled", () => {
    const onClick = vi.fn();
    renderUi(
      <Sidebar>
        <SidebarItem href="#x" disabled>
          Off link
        </SidebarItem>
        <SidebarItem disabled onClick={onClick}>
          Off button
        </SidebarItem>
      </Sidebar>,
      variant,
    );
    expect(screen.getByText("Off link").closest("a")).not.toHaveAttribute("href");
    expect(screen.getByRole("button", { name: "Off button" })).toBeDisabled();
  });

  it("clicking a disabled link runs neither onClick nor a render element's handler", () => {
    const onClick = vi.fn();
    const renderClick = vi.fn();
    renderUi(
      <Sidebar>
        <SidebarItem href="#x" disabled onClick={onClick}>
          Off link
        </SidebarItem>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- a bare render element carrying its own handler is exactly what the disabled item must block */}
        <SidebarItem disabled render={<a onClick={renderClick} />}>
          Off render
        </SidebarItem>
      </Sidebar>,
      variant,
    );
    for (const name of ["Off link", "Off render"]) {
      const link = screen.getByText(name).closest("a")!;
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(link).toHaveAttribute("tabindex", "-1");
      expect(fireEvent.click(link)).toBe(false);
    }
    expect(onClick).not.toHaveBeenCalled();
    expect(renderClick).not.toHaveBeenCalled();
  });

  it("a collapsed group keeps its name and aria-label", () => {
    renderUi(
      <Sidebar collapsed>
        <SidebarGroup label="Projects" aria-label="All projects">
          <SidebarItem href="#a">Alpha</SidebarItem>
        </SidebarGroup>
      </Sidebar>,
      variant,
    );
    expect(screen.getByRole("group", { name: "All projects" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    renderUi(
      <Sidebar>
        <SidebarGroup label="Projects">
          <SidebarItem href="#a" active>
            Alpha
          </SidebarItem>
          <SidebarItem href="#b" badge="3">
            Beta
          </SidebarItem>
        </SidebarGroup>
      </Sidebar>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("the landmark name comes from labels.name, and aria-label wins over it", () => {
  const { rerender } = renderUi(<Sidebar labels={{ name: "Seitenleiste" }}>x</Sidebar>);
  expect(screen.getByRole("navigation", { name: "Seitenleiste" })).toBeTruthy();
  rerender(
    <Sidebar labels={{ name: "Seitenleiste" }} aria-label="Projekte">
      x
    </Sidebar>,
  );
  expect(screen.getByRole("navigation", { name: "Projekte" })).toBeTruthy();
});

describe("Sidebar morph", () => {
  function Morph({ collapsed }: { collapsed: boolean }) {
    return (
      <Sidebar morph collapsed={collapsed} aria-label="Morph">
        <SidebarGroup label="Main" aria-label="Main group">
          <SidebarItem href="#a" active badge={3} icon={<svg aria-hidden width="16" height="16" />}>
            Alpha
          </SidebarItem>
        </SidebarGroup>
      </Sidebar>
    );
  }

  it("keeps the same items mounted across rail and panel, with the label as the name in both", async () => {
    const { rerender } = renderUi(<Morph collapsed={false} />);
    const link = screen.getByRole("link", { name: /Alpha/ });
    rerender(<Morph collapsed />);
    expect(screen.getByRole("link", { name: /Alpha/ })).toBe(link);
    expect(screen.getByRole("group", { name: "Main group" })).toBeInTheDocument();
    await vi.waitFor(() => expect(getComputedStyle(screen.getByText("Alpha")).opacity).toBe("0"));
    rerender(<Morph collapsed={false} />);
    expect(screen.getByRole("link", { name: /Alpha/ })).toBe(link);
  });

  it("has no axe violations as a rail or a panel", async () => {
    const { rerender } = renderUi(<Morph collapsed />);
    expect(await runAxe()).toHaveNoViolations();
    rerender(<Morph collapsed={false} />);
    expect(await runAxe()).toHaveNoViolations();
  });
});

describeVariants((variant) => {
  describe("Sidebar shape", () => {
    function Curved({ collapsed = false, shape = "curved" as const }) {
      return (
        <Sidebar shape={shape} morph collapsed={collapsed} aria-label="Curved">
          <SidebarItem href="#a" active icon={<svg aria-hidden width="16" height="16" />}>
            Alpha
          </SidebarItem>
        </Sidebar>
      );
    }

    it("marks the glass element itself as curved and keeps the plain rect by default", () => {
      const { rerender } = renderUi(<Curved />, variant);
      const nav = screen.getByRole("navigation", { name: "Curved" });
      expect(nav).toHaveAttribute("data-shape", "curved");
      expect(nav).toHaveClass("glass-2");
      expect(nav.className).toContain("border-start-end-radius");
      rerender(<Curved shape={"rect" as never} />);
      expect(screen.getByRole("navigation", { name: "Curved" })).not.toHaveAttribute("data-shape");
    });

    it("uses a gentler bow in the rail", () => {
      const { rerender } = renderUi(<Curved />, variant);
      expect(screen.getByRole("navigation").className).toContain("[--sidebar-curve:1.75rem_50%]");
      rerender(<Curved collapsed />);
      expect(screen.getByRole("navigation").className).toContain("[--sidebar-curve:0.75rem_50%]");
    });

    it("has no axe violations", async () => {
      renderUi(<Curved />, variant);
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});
