import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Pagination, getPageItems } from "../../src/components/pagination/pagination";
import { describeVariants, renderUi, runAxe } from "../render";

const current = () => document.querySelector("[aria-current=page]");

describeVariants((variant) => {
  it("is a named nav; the current page has aria-current and a name", () => {
    renderUi(<Pagination pageCount={20} defaultPage={6} />, variant);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(current()).toHaveAttribute("aria-label", "Page 6");
    expect(current()).toHaveTextContent("6");
    for (const name of [
      "First page",
      "Previous page",
      "Next page",
      "Last page",
      "Page 1",
      "Page 5",
      "Page 7",
      "Page 20",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    // Ellipses are text, with a screen-reader note.
    expect(screen.getAllByText("More pages")).toHaveLength(2);
  });

  it("clicking a page, next, previous, first and last navigates and reports", async () => {
    const onPageChange = vi.fn();
    renderUi(<Pagination pageCount={20} defaultPage={6} onPageChange={onPageChange} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(7);
    expect(current()).toHaveAttribute("aria-label", "Page 7");
    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    await userEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(20);
    await userEvent.click(screen.getByRole("button", { name: "First page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it("at the edges the arrows are aria-disabled but stay focusable, and do nothing", async () => {
    const onPageChange = vi.fn();
    renderUi(<Pagination pageCount={5} defaultPage={1} onPageChange={onPageChange} />, variant);
    const prev = screen.getByRole("button", { name: "Previous page" });
    expect(prev).toHaveAttribute("aria-disabled", "true");
    prev.focus();
    expect(prev).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("keyboard: Tab through buttons, Enter and Space activate", async () => {
    const onPageChange = vi.fn();
    renderUi(
      <>
        <button>before</button>
        <Pagination pageCount={5} defaultPage={1} onPageChange={onPageChange} />
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "First page" })).toHaveFocus();
    // Focus the page 3 button and activate with both keys.
    screen.getByRole("button", { name: "Page 3" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    screen.getByRole("button", { name: "Page 4" }).focus();
    await userEvent.keyboard(" ");
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("controlled page follows the parent", async () => {
    function Controlled() {
      const [page, setPage] = useState(2);
      return (
        <>
          <Pagination pageCount={9} page={page} onPageChange={setPage} />
          <button onClick={() => setPage(9)}>jump</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    expect(current()).toHaveAttribute("aria-label", "Page 2");
    await userEvent.click(screen.getByRole("button", { name: "jump" }));
    expect(current()).toHaveAttribute("aria-label", "Page 9");
  });

  it("a locked controlled page does not move", async () => {
    renderUi(<Pagination pageCount={9} page={2} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(current()).toHaveAttribute("aria-label", "Page 2");
  });

  it("getPageHref renders crawlable links; with onPageChange the click is handled in-app", async () => {
    const onPageChange = vi.fn();
    renderUi(
      <Pagination pageCount={5} defaultPage={2} getPageHref={(p) => `/items?page=${p}`} onPageChange={onPageChange} />,
      variant,
    );
    const link = screen.getByRole("link", { name: "Page 4" });
    expect(link).toHaveAttribute("href", "/items?page=4");
    await userEvent.click(link);
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    expect(location.search).not.toContain("page=4");
  });

  it("showFirstLast={false} / showPrevNext={false} hide those buttons", () => {
    renderUi(<Pagination pageCount={9} defaultPage={4} showFirstLast={false} showPrevNext={false} />, variant);
    for (const name of ["First page", "Previous page", "Next page", "Last page"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
  });

  it("disabled disables everything", () => {
    renderUi(<Pagination pageCount={9} defaultPage={4} disabled />, variant);
    for (const b of screen.getAllByRole("button")) expect(b).toBeDisabled();
  });

  it("labels override every string (i18n) and aria-label renames the landmark", () => {
    renderUi(
      <Pagination
        pageCount={20}
        defaultPage={6}
        aria-label="Ergebnisse"
        labels={{
          next: "Weiter",
          previous: "Zurück",
          first: "Erste",
          last: "Letzte",
          page: (n) => `Seite ${n}`,
          morePages: "Mehr Seiten",
          pageOf: (p, c) => `Seite ${p} von ${c}`,
        }}
      />,
      variant,
    );
    expect(screen.getByRole("navigation", { name: "Ergebnisse" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seite 7" })).toBeInTheDocument();
    expect(screen.getAllByText("Mehr Seiten")).toHaveLength(2);
    expect(screen.getByText("Seite 6 von 20")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="grid gap-4">
        <Pagination pageCount={20} defaultPage={6} aria-label="Results" />
        <Pagination pageCount={3} defaultPage={1} size="sm" aria-label="Small" />
        <Pagination pageCount={30} defaultPage={30} getPageHref={(p) => `#p${p}`} aria-label="Links" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("getPageItems keeps a constant number of slots as the page moves", () => {
  expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 20]);
  expect(getPageItems(6, 20)).toEqual([1, "start-ellipsis", 5, 6, 7, "end-ellipsis", 20]);
  expect(getPageItems(20, 20)).toEqual([1, "start-ellipsis", 16, 17, 18, 19, 20]);
  expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(getPageItems(1, 1)).toEqual([1]);
  // Out-of-range input is clamped.
  expect(getPageItems(99, 3)).toEqual([1, 2, 3]);
  expect(getPageItems(0, 0)).toEqual([1]);
  expect(getPageItems(10, 20, 2, 2)).toEqual([1, 2, "start-ellipsis", 8, 9, 10, 11, 12, "end-ellipsis", 19, 20]);
  expect(getPageItems(1, 20).length).toBe(getPageItems(10, 20).length);
});
