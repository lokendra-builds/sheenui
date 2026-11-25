import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Tabs, TabsList, TabsPanel, TabsTab } from "../../src/components/tabs/tabs";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe, variants } from "../render";

function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project sections">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
      </TabsList>
      <TabsPanel value="overview">Overview panel</TabsPanel>
      <TabsPanel value="activity">Activity panel</TabsPanel>
      <TabsPanel value="settings">Settings panel</TabsPanel>
    </Tabs>
  );
}

describeVariants((variant) => {
  it("renders a tablist whose tabs control their panels", () => {
    renderUi(<Example />, variant);
    const list = screen.getByRole("tablist", { name: "Project sections" });
    const tabs = screen.getAllByRole("tab");
    expect(list).toBeInTheDocument();
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs[0]!.id);
  });

  it("clicking a tab selects it and shows its panel", async () => {
    renderUi(<Example />, variant);
    await userEvent.click(screen.getByRole("tab", { name: "Settings" }));
    await expect.poll(() => screen.getByRole("tab", { name: "Settings" }).getAttribute("aria-selected")).toBe("true");
    // The old panel may still be mid-exit (inert), so pick the panel by its label.
    expect(screen.getByRole("tabpanel", { name: "Settings" })).toHaveTextContent("Settings panel");
  });

  it("arrow keys move focus, Enter/Space activate, Home/End jump, Tab leaves the list", async () => {
    renderUi(<Example />, variant);
    const overview = screen.getByRole("tab", { name: "Overview" });
    const activity = screen.getByRole("tab", { name: "Activity" });
    const settings = screen.getByRole("tab", { name: "Settings" });
    overview.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(activity);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => activity.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(settings);
    await userEvent.keyboard(" ");
    await expect.poll(() => settings.getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{Home}");
    await expect.poll(() => document.activeElement).toBe(overview);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => overview.getAttribute("aria-selected")).toBe("true");
    // Only the active tab is in the Tab sequence: Tab leaves the list.
    await userEvent.tab();
    expect(screen.getByRole("tablist").contains(document.activeElement)).toBe(false);
  });

  it("the active pill slides and resizes with the snappy spring (translate and width)", async () => {
    renderUi(<Example />, variant);
    const pill = () => document.querySelector<HTMLElement>("[data-slot='tabs-list'] > span:last-child")!;
    await expect.poll(() => getComputedStyle(pill()).transitionProperty).toContain("width");
    expect(getComputedStyle(pill()).transitionProperty).toContain("translate");
    expect(getComputedStyle(pill()).transitionTimingFunction).toContain("linear(");
  });

  it("with reduced motion the panel cross-fades over the short duration token instead of cutting", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    // The fade is 100 ms: record the animation instead of racing it.
    const animate = vi.spyOn(Element.prototype, "animate");
    try {
      renderUi(<Example />, variant);
      animate.mockClear();
      await userEvent.click(screen.getByRole("tab", { name: "Activity" }));
      await expect.poll(() => screen.getByRole("tabpanel", { name: "Activity" })).toBeInTheDocument();
      const call = animate.mock.calls.find(([keyframes]) => "opacity" in (keyframes as object));
      expect(call).toBeDefined();
      expect(Object.keys(call![0] as object)).toEqual(["opacity"]);
      expect((call![1] as KeyframeAnimationOptions).duration).toBeLessThanOrEqual(120);
    } finally {
      animate.mockRestore();
      document.documentElement.removeAttribute("data-motion");
    }
  });

  it("has no axe violations", async () => {
    renderUi(<Example />, variant);
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("in right-to-left text ArrowRight moves to the visually right tab (the previous one), ArrowLeft the reverse", async () => {
  renderUi(
    <div dir="rtl">
      <Example />
    </div>,
    variants[0],
  );
  const tabs = screen.getAllByRole("tab");
  tabs[1]!.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(tabs[0]).toHaveFocus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(tabs[1]).toHaveFocus();
  await userEvent.keyboard("{Home}");
  expect(tabs[0]).toHaveFocus();
  await userEvent.keyboard("{End}");
  expect(tabs[2]).toHaveFocus();
});

const dot = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
);

describe("TabsList morph", () => {
  function Morphing() {
    return (
      <Tabs defaultValue="home">
        <TabsList aria-label="Sections" morph>
          <TabsTab value="home" icon={dot}>
            Home
          </TabsTab>
          <TabsTab value="search" icon={dot}>
            Search
          </TabsTab>
        </TabsList>
        <TabsPanel value="home">Home panel</TabsPanel>
        <TabsPanel value="search">Search panel</TabsPanel>
      </Tabs>
    );
  }

  it("icon-only tabs keep their label as the accessible name and only the active one shows it", async () => {
    renderUi(<Morphing />);
    const home = screen.getByRole("tab", { name: "Home" });
    const search = screen.getByRole("tab", { name: "Search" });
    const widthOf = (tab: HTMLElement) => tab.getBoundingClientRect().width;
    await vi.waitFor(() => expect(widthOf(search)).toBeLessThan(widthOf(home)));
    await userEvent.click(search);
    expect(search).toHaveAttribute("aria-selected", "true");
    await vi.waitFor(() => expect(widthOf(home)).toBeLessThan(widthOf(search)));
  });

  it("keyboard: arrows move focus and Enter activates, as without morph", async () => {
    renderUi(<Morphing />);
    screen.getByRole("tab", { name: "Home" }).focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("tab", { name: "Search" })).toHaveAttribute("aria-selected", "true");
  });

  it("reduced motion: the label reveal has no transition", () => {
    reduceMotion();
    renderUi(<Morphing />);
    const label = screen.getByText("Search").parentElement!.parentElement!;
    expect(parseFloat(getComputedStyle(label).transitionDuration)).toBeLessThanOrEqual(0.12);
  });

  it("no layout property is transitioned on any tab part (only transform, opacity and colours)", async () => {
    renderUi(<Morphing />);
    const search = screen.getByRole("tab", { name: "Search" });
    const parts = (tab: HTMLElement) => [tab, ...Array.from(tab.querySelectorAll<HTMLElement>("*"))];
    const allowed =
      /^(transform|translate|opacity|color|background-color|border-color|outline-color|text-decoration-color|all)$/;
    for (const tab of [screen.getByRole("tab", { name: "Home" }), search]) {
      for (const el of parts(tab)) {
        const props = getComputedStyle(el)
          .transitionProperty.split(",")
          .map((x) => x.trim());
        for (const prop of props) expect(prop, el.outerHTML.slice(0, 80)).toMatch(allowed);
        if (props.includes("all")) expect(parseFloat(getComputedStyle(el).transitionDuration)).toBe(0);
      }
    }
    // Switching also leaves no layout animation on the tab: only transforms are animated.
    await userEvent.click(search);
    const tabs = screen.getAllByRole("tab");
    const running = document
      .getAnimations()
      .filter((a) => tabs.some((tab) => tab.contains((a.effect as KeyframeEffect | null)?.target ?? null)))
      .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((f) => Object.keys(f)))
      .filter((k) => !["offset", "easing", "composite", "computedOffset"].includes(k));
    for (const prop of running)
      expect(prop).toMatch(/^(transform|opacity|color|backgroundColor|borderColor|outlineColor)$/);
  });

  it("has no axe violations in either preset", async () => {
    for (const variant of variants) {
      const { unmount } = renderUi(<Morphing />, variant);
      expect(await runAxe()).toHaveNoViolations();
      unmount();
    }
  });
});

describeVariants((variant) => {
  it("in a narrow box the list scrolls sideways and the last tab can be brought fully into view (no label is cut for good)", async () => {
    renderUi(
      <div style={{ width: 220 }}>
        <Example />
      </div>,
      variant,
    );
    const list = screen.getByRole("tablist");
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    expect(getComputedStyle(list).overflowX).toBe("auto");
    screen.getByRole("tab", { name: "Settings" }).focus();
    await userEvent.keyboard("{Enter}");
    const last = screen.getByRole("tab", { name: "Settings" });
    await expect
      .poll(() => {
        const l = list.getBoundingClientRect();
        const t = last.getBoundingClientRect();
        return t.left >= l.left - 1 && t.right <= l.right + 1;
      })
      .toBe(true);
  });
});
