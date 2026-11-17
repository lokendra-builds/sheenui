import { beforeEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { VerticalNav, type VerticalNavSection } from "../../src/components/vertical-nav/vertical-nav";
import { parkPointer } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

// The real pointer stays where an earlier test left it; a hover-driven widget under it would open on its own.
beforeEach(parkPointer);

const icon = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
);
const sections: VerticalNavSection[] = [
  {
    items: [
      { value: "overview", label: "Overview", icon, href: "#overview" },
      { value: "inbox", label: "Inbox", icon, badge: 3 },
    ],
  },
  {
    title: "Admin",
    items: [
      { value: "users", label: "Users", icon },
      { value: "billing", label: "Billing", icon, disabled: true },
    ],
  },
];

const nav = (name = "Sidebar") => screen.getByRole("navigation", { name });

describeVariants((variant) => {
  it("is a named nav; sections with a title are named lists; the active item has aria-current", () => {
    renderUi(<VerticalNav sections={sections} value="inbox" />, variant);
    expect(within(nav()).getByRole("list", { name: "Admin" })).toBeInTheDocument();
    expect(within(nav()).getByRole("button", { name: /Inbox/ })).toHaveAttribute("aria-current", "page");
    expect(within(nav()).getByRole("link", { name: "Overview" })).toHaveAttribute("href", "#overview");
    expect(within(nav()).getByRole("button", { name: "Billing" })).toBeDisabled();
    expect(within(nav()).getByText("3")).toBeInTheDocument();
  });

  it("clicking and pressing Enter on an item report its value; Tab visits items in order", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <>
        <button>before</button>
        <VerticalNav sections={sections} value="overview" onValueChange={onValueChange} />
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(within(nav()).getByRole("link", { name: "Overview" })).toHaveFocus();
    await userEvent.tab();
    expect(within(nav()).getByRole("button", { name: /Inbox/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("inbox");
    await userEvent.click(within(nav()).getByRole("button", { name: "Users" }));
    expect(onValueChange).toHaveBeenLastCalledWith("users");
  });

  it("header and footer render; renderLink wraps href items; aria-label renames the landmark", () => {
    renderUi(
      <VerticalNav
        aria-label="Workspace"
        sections={sections}
        value="overview"
        header={<span>Acme</span>}
        footer={<button>Settings</button>}
        renderLink={(props) => (
          <a {...props} data-router="yes">
            {props.children}
          </a>
        )}
      />,
      variant,
    );
    expect(nav("Workspace")).toBeInTheDocument();
    expect(within(nav("Workspace")).getByText("Acme")).toBeInTheDocument();
    expect(within(nav("Workspace")).getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(within(nav("Workspace")).getByRole("link", { name: "Overview" })).toHaveAttribute("data-router", "yes");
  });

  it("collapsed rail keeps every item named for assistive tech and shows a tooltip on keyboard focus", async () => {
    const { rerender } = renderUi(
      <div style={{ width: 280 }}>
        <VerticalNav sections={sections} value="overview" collapsed={false} />
      </div>,
      variant,
    );
    const open = nav().getBoundingClientRect().width;
    rerender(
      <div style={{ width: 280 }}>
        <VerticalNav sections={sections} value="overview" collapsed />
      </div>,
    );
    await expect.poll(() => nav().getBoundingClientRect().width).toBeLessThan(open);
    expect(within(nav()).getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(within(nav()).getByRole("button", { name: /Inbox/ })).toBeInTheDocument();
    within(nav()).getByRole("button", { name: "Users" }).focus();
    await userEvent.tab();
    within(nav()).getByRole("button", { name: "Users" }).focus();
    await expect.poll(() => screen.queryAllByText("Users").length).toBeGreaterThan(1);
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("overview");
      return (
        <>
          <VerticalNav sections={sections} value={v} onValueChange={setV} />
          <button onClick={() => setV("users")}>go users</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("button", { name: "go users" }));
    expect(within(nav()).getByRole("button", { name: "Users" })).toHaveAttribute("aria-current", "page");
    expect(within(nav()).getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("has no axe violations (expanded and collapsed)", async () => {
    renderUi(
      <div className="flex gap-6">
        <VerticalNav
          sections={sections}
          value="overview"
          aria-label="Expanded"
          header={<span>Acme</span>}
          footer={<button>Settings</button>}
        />
        <VerticalNav sections={sections} value="overview" aria-label="Rail" collapsed />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("the landmark name comes from labels.name, and aria-label wins over it", () => {
  const { rerender } = renderUi(<VerticalNav sections={sections} value="home" labels={{ name: "Seitenleiste" }} />);
  expect(screen.getByRole("navigation", { name: "Seitenleiste" })).toBeTruthy();
  rerender(<VerticalNav sections={sections} value="home" labels={{ name: "Seitenleiste" }} aria-label="Konto" />);
  expect(screen.getByRole("navigation", { name: "Konto" })).toBeTruthy();
});
