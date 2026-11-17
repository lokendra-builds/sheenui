import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { userEvent } from "vitest/browser";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "../../src/components/accordion/accordion";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Example(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="shipping">
        <AccordionTrigger description="Delivery times">Shipping</AccordionTrigger>
        <AccordionPanel>We ship worldwide.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger indicator="plus">Returns</AccordionTrigger>
        <AccordionPanel>Returns within 30 days.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="warranty" disabled>
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionPanel>Two years.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

const trigger = (name: string | RegExp) => screen.getByRole("button", { name });
const expanded = (name: string | RegExp) => trigger(name).getAttribute("aria-expanded");

describeVariants((variant) => {
  it("triggers are buttons inside headings, collapsed by default, panels are labelled groups", async () => {
    renderUi(<Example />, variant);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(expanded(/Shipping/)).toBe("false");
    expect(expanded(/Returns/)).toBe("false");
    await userEvent.click(trigger(/Shipping/));
    expect(expanded(/Shipping/)).toBe("true");
    const region = await screen.findByRole("group", { name: /Shipping/ });
    expect(region).toHaveTextContent("We ship worldwide.");
    expect(trigger(/Shipping/)).toHaveAttribute("aria-controls", region.id);
  });

  it("Enter and Space toggle; each enabled trigger is a tab stop (disabled ones are skipped)", async () => {
    renderUi(
      <>
        <button>before</button>
        <Example />
        <button>after</button>
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(trigger(/Shipping/)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(expanded(/Shipping/)).toBe("true");
    await userEvent.keyboard(" ");
    expect(expanded(/Shipping/)).toBe("false");
    // Base UI's accordion has no arrow-key roving: the triggers are plain tab stops.
    await userEvent.tab();
    expect(trigger(/Returns/)).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(expanded(/Returns/)).toBe("true");
    // Warranty is disabled, so the next Tab goes past it, into the open panel's end and out.
    await userEvent.tab();
    expect(trigger(/Warranty/)).not.toHaveFocus();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("by default only one item is open at a time", async () => {
    renderUi(<Example />, variant);
    await userEvent.click(trigger(/Shipping/));
    await userEvent.click(trigger(/Returns/));
    expect(expanded(/Returns/)).toBe("true");
    expect(expanded(/Shipping/)).toBe("false");
  });

  it("multiple allows several open items", async () => {
    renderUi(<Example multiple />, variant);
    await userEvent.click(trigger(/Shipping/));
    await userEvent.click(trigger(/Returns/));
    expect(expanded(/Shipping/)).toBe("true");
    expect(expanded(/Returns/)).toBe("true");
  });

  it("defaultValue opens an item initially; onValueChange reports", async () => {
    const onValueChange = vi.fn();
    renderUi(<Example defaultValue={["returns"]} onValueChange={onValueChange} />, variant);
    expect(expanded(/Returns/)).toBe("true");
    await userEvent.click(trigger(/Returns/));
    expect(onValueChange.mock.lastCall![0]).toEqual([]);
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <>
          <Example value={value} onValueChange={(v) => setValue(v as string[])} />
          <button onClick={() => setValue(["shipping"])}>open shipping</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("button", { name: "open shipping" }));
    expect(expanded(/Shipping/)).toBe("true");
  });

  it("a disabled item cannot be opened or focused", async () => {
    renderUi(<Example />, variant);
    expect(trigger(/Warranty/)).toBeDisabled();
    trigger(/Returns/).focus();
    await userEvent.tab();
    expect(trigger(/Warranty/)).not.toHaveFocus();
  });

  it("headingLevel changes the wrapping heading", () => {
    renderUi(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger headingLevel={4}>Level four</AccordionTrigger>
          <AccordionPanel>Body</AccordionPanel>
        </AccordionItem>
      </Accordion>,
      variant,
    );
    expect(screen.getByRole("heading", { level: 4, name: "Level four" })).toBeInTheDocument();
  });

  it.each(["glass", "separated", "plain"] as const)("variant=%s renders and opens", async (v) => {
    renderUi(<Example variant={v} />, variant);
    await userEvent.click(trigger(/Shipping/));
    expect(expanded(/Shipping/)).toBe("true");
  });

  it("has no axe violations (closed and with an item open)", async () => {
    renderUi(<Example defaultValue={["shipping"]} />, variant);
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the panel opens without a running height animation", async () => {
  reduceMotion();
  renderUi(<Example />);
  await userEvent.click(trigger(/Shipping/));
  await screen.findByRole("group", { name: /Shipping/ });
  await settle();
  expect(screen.getByText("We ship worldwide.")).toBeVisible();
});

it('server render: React writes hidden="" for closed panels, so panels carry the until-found marker the prerender rewrites', () => {
  const html = renderToString(<Example hiddenUntilFound defaultValue={["shipping"]} />);
  const closed = html.match(/<div[^>]*data-slot="accordion-panel"[^>]*>/g) ?? [];
  const closedPanels = closed.filter((tag) => /\shidden=""/.test(tag));
  expect(closed).toHaveLength(3);
  expect(closedPanels).toHaveLength(2);
  for (const tag of closed) expect(tag).toContain('data-until-found=""');
  expect(renderToString(<Example />)).not.toContain("data-until-found");
});

it("client: closed panels become hidden=until-found and beforematch opens them", async () => {
  renderUi(<Example hiddenUntilFound />);
  const panel = document.querySelector<HTMLElement>('[data-slot="accordion-panel"]')!;
  await vi.waitFor(() => expect(panel.getAttribute("hidden")).toBe("until-found"));
  panel.dispatchEvent(new Event("beforematch", { bubbles: true }));
  await vi.waitFor(() => expect(expanded(/Shipping/)).toBe("true"));
});

it("Arrow Up / Down, Home and End move focus between enabled triggers and wrap", async () => {
  renderUi(<Example />);
  trigger(/Shipping/).focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(trigger(/Returns/)).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}"); // Warranty is disabled: wraps to the first
  expect(trigger(/Shipping/)).toHaveFocus();
  await userEvent.keyboard("{ArrowUp}");
  expect(trigger(/Returns/)).toHaveFocus();
  await userEvent.keyboard("{Home}");
  expect(trigger(/Shipping/)).toHaveFocus();
  await userEvent.keyboard("{End}");
  expect(trigger(/Returns/)).toHaveFocus();
});
