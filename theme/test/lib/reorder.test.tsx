import { expect, it } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { AnimatedList, AnimatedListItem } from "../../src/motion/reorder";
import { renderUi } from "../render";

function Demo() {
  const [items, setItems] = useState(["a", "b", "c"]);
  return (
    <>
      <button type="button" onClick={() => setItems((l) => [...l].reverse())}>
        reverse
      </button>
      <button type="button" onClick={() => setItems((l) => l.slice(0, -1))}>
        drop
      </button>
      <AnimatedList aria-label="letters">
        {items.map((i) => (
          <AnimatedListItem key={i}>
            <button type="button">{`item-${i}`}</button>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </>
  );
}

const order = () => screen.getAllByRole("listitem").map((li) => li.textContent);

it("reorders in the DOM at once", async () => {
  renderUi(<Demo />);
  expect(order()).toEqual(["item-a", "item-b", "item-c"]);
  await userEvent.click(screen.getByRole("button", { name: "reverse" }));
  expect(order()).toEqual(["item-c", "item-b", "item-a"]);
});

it("removes an item and renders as any tag", () => {
  renderUi(
    <AnimatedList as="div" role="list">
      <AnimatedListItem as="section" role="listitem">
        x
      </AnimatedListItem>
    </AnimatedList>,
  );
  expect(screen.getByRole("listitem").tagName).toBe("SECTION");
  expect(screen.getByRole("list").tagName).toBe("DIV");
});

it("an item leaves after drop", async () => {
  renderUi(<Demo />);
  await userEvent.click(screen.getByRole("button", { name: "drop" }));
  await expect.poll(() => order()).toEqual(["item-a", "item-b"]);
});
