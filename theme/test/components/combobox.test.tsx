import { expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Combobox, type ComboboxOption } from "../../src/components/combobox/combobox";
import { lastArg, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const countries: ComboboxOption[] = [
  { value: "ar", label: "Argentina", group: "Americas" },
  { value: "br", label: "Brazil", group: "Americas", description: "South America" },
  { value: "de", label: "Germany", group: "Europe" },
  { value: "fr", label: "France", group: "Europe" },
  { value: "xx", label: "Atlantis", disabled: true },
];

const input = (name = "Country") => screen.getByRole<HTMLInputElement>("combobox", { name });
const listbox = () => screen.queryByRole("listbox");
const optionNames = () => screen.queryAllByRole("option").map((o) => o.textContent);
const open = async () => {
  await userEvent.click(input());
  await expect.poll(listbox).not.toBeNull();
};

describeVariants((variant) => {
  it("is a labelled combobox whose list opens on click with grouped options", async () => {
    renderUi(<Combobox label="Country" options={countries} />, variant);
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    await open();
    expect(listbox()).toHaveAccessibleName("Country");
    expect(optionNames().length).toBe(5);
    expect(screen.getByRole("option", { name: /Atlantis/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("group", { name: "Americas" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Europe" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Other" })).toBeInTheDocument();
  });

  for (const coarse of [false, true]) {
    it(`Tab in the open list moves focus to the next control and closes it (${coarse ? "coarse" : "fine"} pointer, 2.1.1)`, async () => {
      const real = window.matchMedia.bind(window);
      if (coarse)
        vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
          const list = real(query);
          if (query.includes("pointer: coarse")) Object.defineProperty(list, "matches", { value: true });
          return list;
        });
      try {
        renderUi(
          <>
            <Combobox label="Country" options={countries} />
            <button type="button">After the field</button>
          </>,
          variant,
        );
        await open();
        await userEvent.tab();
        await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "After the field" }));
        await expect.poll(listbox).toBeNull();
      } finally {
        vi.restoreAllMocks();
      }
    });
  }

  it("typing filters the options; a match is picked with Enter and shown in the field", async () => {
    const onValueChange = vi.fn();
    renderUi(<Combobox label="Country" options={countries} onValueChange={onValueChange} />, variant);
    await userEvent.click(input());
    await userEvent.keyboard("ger");
    await expect.poll(optionNames).toEqual(["Germany"]);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(lastArg(onValueChange)).toBe("de");
    await expect.poll(listbox).toBeNull();
    expect(input()).toHaveValue("Germany");
  });

  it("ArrowDown opens, arrows move the highlight, Escape closes and keeps focus in the field", async () => {
    renderUi(<Combobox label="Country" options={countries} />, variant);
    input().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(listbox).not.toBeNull();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    const active = () => document.getElementById(input().getAttribute("aria-activedescendant") ?? "");
    await expect.poll(() => active()?.textContent).toBe("Germany");
    await userEvent.keyboard("{Escape}");
    await expect.poll(listbox).toBeNull();
    expect(input()).toHaveFocus();
  });

  it("no matches shows the empty text; emptyState is configurable", async () => {
    renderUi(<Combobox label="Country" options={countries} emptyState="Nothing found" />, variant);
    await userEvent.click(input());
    await userEvent.keyboard("zzzz");
    await expect.poll(() => screen.queryByText("Nothing found")).not.toBeNull();
  });

  it("clicking an option selects it; the clear button resets", async () => {
    renderUi(<Combobox label="Country" options={countries} defaultValue="fr" />, variant);
    expect(input()).toHaveValue("France");
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    await expect.poll(() => input().value).toBe("");
    await open();
    await userEvent.click(screen.getByRole("option", { name: /Brazil/ }));
    expect(input()).toHaveValue("Brazil");
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState<string | null>("ar");
      return (
        <>
          <Combobox label="Country" options={countries} value={v} onValueChange={setV} />
          <button onClick={() => setV("de")}>germany</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    expect(input()).toHaveValue("Argentina");
    await userEvent.click(screen.getByRole("button", { name: "germany" }));
    expect(input()).toHaveValue("Germany");
  });

  it("multiple: picks become removable chips; Backspace removes the last; maxSelected caps it", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <Combobox label="Country" options={countries} multiple maxSelected={2} onValueChange={onValueChange} />,
      variant,
    );
    await open();
    await userEvent.click(screen.getByRole("option", { name: /Argentina/ }));
    await userEvent.click(screen.getByRole("option", { name: /Germany/ }));
    expect(lastArg(onValueChange)).toEqual(["ar", "de"]);
    const chips = screen.getByRole("toolbar", { name: "Selected" });
    expect(within(chips).getByText("Argentina")).toBeInTheDocument();
    expect(within(chips).getByText("Germany")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Argentina" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove Argentina" }));
    await expect.poll(() => lastArg(onValueChange)).toEqual(["de"]);
  });

  it("onCreate adds a 'Create “…”' option for new text", async () => {
    // onCreate resolves with the option to add (value + label).
    const onCreate = vi.fn((text: string): Promise<ComboboxOption> =>
      Promise.resolve({ value: text.toLowerCase(), label: text }),
    );
    const onValueChange = vi.fn();
    renderUi(
      <Combobox label="Country" options={countries} onCreate={onCreate} onValueChange={onValueChange} />,
      variant,
    );
    await userEvent.click(input());
    await userEvent.keyboard("Narnia");
    const create = await screen.findByRole("option", { name: "Create “Narnia”" });
    await userEvent.click(create);
    await expect.poll(() => onCreate.mock.calls.length).toBe(1);
    expect(onCreate.mock.lastCall![0]).toBe("Narnia");
    await expect.poll(() => lastArg(onValueChange)).toBe("narnia");
    await expect.poll(() => input().value).toBe("Narnia");
  });

  it("onCreate that resolves with nothing shows the create error instead of throwing", async () => {
    const onCreate = vi.fn(() => Promise.resolve(undefined as unknown as ComboboxOption));
    const onError = vi.fn();
    const onValueChange = vi.fn();
    renderUi(
      <Combobox
        label="Country"
        options={countries}
        onCreate={onCreate}
        onError={onError}
        onValueChange={onValueChange}
      />,
      variant,
    );
    await userEvent.click(input());
    await userEvent.keyboard("Narnia");
    await userEvent.click(await screen.findByRole("option", { name: "Create “Narnia”" }));
    await expect.poll(() => screen.getByRole("alert").textContent).toContain("Couldn’t create “Narnia”");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(TypeError);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("loadOptions searches asynchronously with a searching state and an error retry", async () => {
    let fail = true;
    const loadOptions = vi.fn((q: string) =>
      fail
        ? Promise.reject(new Error("network"))
        : Promise.resolve(countries.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))),
    );
    renderUi(<Combobox label="Country" loadOptions={loadOptions} debounceMs={0} />, variant);
    await userEvent.click(input());
    await userEvent.keyboard("fra");
    await expect.poll(() => screen.queryByText("Couldn’t load results.")).not.toBeNull();
    fail = false;
    await userEvent.click(screen.getByRole("option", { name: "Try again" }));
    await expect.poll(optionNames).toEqual(["France"]);
  });

  it("label strings are overridable (i18n)", () => {
    renderUi(
      <Combobox
        label="Land"
        options={countries}
        placeholder="Suchen…"
        labels={{ trigger: "Optionen", clear: "Leeren" }}
        defaultValue="de"
        emptyState="Nichts"
      />,
      variant,
    );
    expect(screen.getByRole("combobox", { name: "Land" })).toHaveAttribute("placeholder", "Suchen…");
    expect(screen.getByRole("button", { name: "Optionen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leeren" })).toBeInTheDocument();
  });

  it("error text is announced and marks the field invalid; disabled/readOnly block input", () => {
    renderUi(
      <>
        <Combobox label="Country" options={countries} error="Pick one" />
        <Combobox label="Off" options={countries} disabled />
        <Combobox label="Locked" options={countries} readOnly defaultValue="de" />
      </>,
      variant,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Pick one");
    expect(input()).toHaveAttribute("aria-invalid", "true");
    expect(input("Off")).toBeDisabled();
    expect(input("Locked")).toHaveAttribute("readonly");
  });

  it("submits the value with a form", () => {
    renderUi(
      <form data-testid="f">
        <Combobox label="Country" options={countries} name="country" defaultValue="br" />
      </form>,
      variant,
    );
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("country")).toBe("br");
  });

  it("has no axe violations (closed and open, single and multiple)", async () => {
    renderUi(
      <div className="grid gap-4">
        <Combobox label="Country" options={countries} description="Where you live" />
        <Combobox label="Visited" options={countries} multiple defaultValue={["de", "fr"]} />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
    // Open: Base UI hides the rest of the page from AT while the list is up, so axe is run with a
    // single combobox on the page (other focusable widgets would be flagged as aria-hidden-focus).
    cleanup();
    renderUi(<Combobox label="Country" options={countries} />, variant);
    await userEvent.click(input());
    await expect.poll(listbox).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
