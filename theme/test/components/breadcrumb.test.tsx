import { expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Breadcrumb, type BreadcrumbItem } from "../../src/components/breadcrumb/breadcrumb";
import { describeVariants, renderUi, runAxe } from "../render";

const trail: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "SheenUI", href: "/projects/sheenui" },
  { label: "Components", href: "/projects/sheenui/components" },
  { label: "Breadcrumb" },
];

describeVariants((variant) => {
  it("is a named nav with an ordered list; the last item is the current page", async () => {
    renderUi(<Breadcrumb items={trail} collapse="never" />, variant);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const list = within(nav).getByRole("list");
    expect(list.tagName).toBe("OL");
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Home", "Projects", "SheenUI", "Components"]);
    expect(links[1]).toHaveAttribute("href", "/projects");
    // aria-current is set once the width measurement pass is done.
    await expect.poll(() => nav.querySelector("[aria-current=page]")).not.toBeNull();
    expect(nav.querySelector("[aria-current=page]")).toHaveTextContent("Breadcrumb");
    // Separators are decorative.
    expect(within(nav).queryAllByRole("separator")).toHaveLength(0);
  });

  it("links are tab stops in order and Enter follows the link", async () => {
    const onClick = vi.fn((e: MouseEvent) => e.preventDefault());
    renderUi(
      <>
        <button>before</button>
        <Breadcrumb
          items={trail}
          collapse="never"
          renderLink={(item) => (
            <a href={item.href} onClick={onClick as never}>
              {item.label}
            </a>
          )}
        />
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("labels.nav renames the landmark (i18n)", () => {
    renderUi(<Breadcrumb items={trail} labels={{ nav: "Brotkrumen" }} collapse="never" />, variant);
    expect(screen.getByRole("navigation", { name: "Brotkrumen" })).toBeInTheDocument();
  });

  it("maxItems folds the middle into a '…' menu button that lists the hidden pages", async () => {
    renderUi(<Breadcrumb items={trail} maxItems={3} itemsBefore={1} itemsAfter={1} />, variant);
    const more = await screen.findByRole("button", { name: "Show 3 hidden pages" });
    expect(more).toHaveAttribute("aria-haspopup", "menu");
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).queryByRole("link", { name: "Projects" })).toBeNull();
    expect(within(nav).getByRole("link", { name: "Home" })).toBeInTheDocument();

    await userEvent.click(more);
    const menu = await screen.findByRole("menu");
    const items = within(menu).getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["Projects", "SheenUI", "Components"]);
    expect(items[0]).toHaveAttribute("href", "/projects");
    // Escape closes the menu and returns focus to the button.
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("menu")).toBeNull();
    await expect.poll(() => document.activeElement).toBe(more);
  });

  it("the collapse menu works from the keyboard", async () => {
    renderUi(<Breadcrumb items={trail} maxItems={3} itemsBefore={1} itemsAfter={1} />, variant);
    const more = await screen.findByRole("button", { name: "Show 3 hidden pages" });
    more.focus();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("menu");
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement?.textContent).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("menu")).toBeNull();
  });

  it("labels.more renames the '…' button", async () => {
    renderUi(
      <Breadcrumb items={trail} maxItems={3} itemsBefore={1} itemsAfter={1} labels={{ more: (n) => `${n} weitere` }} />,
      variant,
    );
    expect(await screen.findByRole("button", { name: "3 weitere" })).toBeInTheDocument();
  });

  it("collapse=auto folds items when the container is too narrow", async () => {
    renderUi(
      <div style={{ width: 220 }}>
        <Breadcrumb items={trail} />
      </div>,
      variant,
    );
    await expect.poll(() => screen.queryByRole("button", { name: /hidden page/ })).not.toBeNull();
  });

  it("collapse=never keeps every link (wraps instead)", () => {
    renderUi(
      <div style={{ width: 220 }}>
        <Breadcrumb items={trail} collapse="never" />
      </div>,
      variant,
    );
    expect(screen.queryByRole("button", { name: /hidden page/ })).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("iconOnly keeps the label for screen readers; separators accept presets and nodes", () => {
    const home = <svg width="16" height="16" aria-hidden="true" />;
    const { rerender } = renderUi(
      <Breadcrumb
        items={[{ label: "Home", href: "/", icon: home, iconOnly: true }, { label: "Docs" }]}
        separator="slash"
        collapse="never"
      />,
      variant,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    rerender(<Breadcrumb items={trail} separator={<b data-testid="sep">/</b>} collapse="never" />);
    expect(screen.getAllByTestId("sep").length).toBeGreaterThan(0);
    rerender(<Breadcrumb items={trail} separator="dot" collapse="never" variant="glass" size="sm" />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("has no axe violations (plain, glass, collapsed and menu open)", async () => {
    renderUi(
      <div className="grid gap-4">
        <Breadcrumb items={trail} collapse="never" />
        <Breadcrumb items={trail} collapse="never" variant="glass" labels={{ nav: "Glass trail" }} />
        <Breadcrumb items={trail} maxItems={3} itemsBefore={1} itemsAfter={1} labels={{ nav: "Collapsed trail" }} />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.click(await screen.findByRole("button", { name: "Show 3 hidden pages" }));
    await screen.findByRole("menu");
    expect(await runAxe()).toHaveNoViolations();
  });
});
