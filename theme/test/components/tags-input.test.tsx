import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { TagsInput } from "../../src/components/tags-input/tags-input";
import { describeVariants, renderUi, runAxe } from "../render";

const field = (name = "Skills") => screen.getByRole<HTMLInputElement>("textbox", { name });
const chips = () =>
  within(screen.getByRole("list", { name: "Tags" }))
    .queryAllByRole("listitem")
    .map((li) => li.querySelector("span.truncate")?.textContent);

describeVariants((variant) => {
  it("is a labelled field whose hint is read with it, listing existing tags", () => {
    renderUi(<TagsInput label="Skills" description="Add up to eight" defaultValue={["react", "css"]} />, variant);
    expect(field()).toHaveAccessibleDescription(/Add up to eight/);
    expect(field()).toHaveAccessibleDescription(/Press Enter or comma to add a tag/);
    expect(chips()).toEqual(["react", "css"]);
    expect(screen.getByRole("button", { name: "Remove react", hidden: true })).toBeInTheDocument();
  });

  it("Enter and the comma add a trimmed tag and report the new list", async () => {
    const onValueChange = vi.fn();
    renderUi(<TagsInput label="Skills" onValueChange={onValueChange} />, variant);
    await userEvent.click(field());
    await userEvent.keyboard("  react  {Enter}");
    expect(chips()).toEqual(["react"]);
    expect(field()).toHaveValue("");
    await userEvent.keyboard("vue,");
    expect(chips()).toEqual(["react", "vue"]);
    expect(onValueChange).toHaveBeenLastCalledWith(["react", "vue"]);
    // An empty entry adds nothing.
    await userEvent.keyboard("{Enter}");
    expect(chips()).toEqual(["react", "vue"]);
  });

  it("duplicates are rejected with a message (case-insensitive) unless allowDuplicates", async () => {
    const { rerender } = renderUi(<TagsInput label="Skills" defaultValue={["react"]} />, variant);
    await userEvent.click(field());
    await userEvent.keyboard("React{Enter}");
    expect(chips()).toEqual(["react"]);
    await expect.poll(() => screen.queryByText(/is already added/)).not.toBeNull();
    // The rejected text stays in the field so it can be corrected; with allowDuplicates it is accepted as is.
    expect(field()).toHaveValue("React");
    rerender(<TagsInput label="Skills" defaultValue={["react"]} allowDuplicates />);
    await userEvent.click(field());
    await userEvent.keyboard("{Enter}");
    expect(chips()).toEqual(["react", "React"]);
  });

  it("max stops adding, shows a counter and explains why", async () => {
    renderUi(<TagsInput label="Skills" max={2} defaultValue={["a"]} />, variant);
    expect(screen.getByText("1/2")).toBeInTheDocument();
    await userEvent.click(field());
    await userEvent.keyboard("b{Enter}");
    expect(chips()).toEqual(["a", "b"]);
    await userEvent.keyboard("c{Enter}");
    expect(chips()).toEqual(["a", "b"]);
    await expect.poll(() => screen.queryByText("You can add up to 2 tags.")).not.toBeNull();
  });

  it("maxLength and validate reject a tag with a message", async () => {
    renderUi(
      <TagsInput label="Skills" maxLength={4} validate={(t) => (t === "bad" ? "No bad tags" : null)} />,
      variant,
    );
    await userEvent.click(field());
    await userEvent.keyboard("toolong{Enter}");
    expect(chips()).toEqual([]);
    await expect.poll(() => screen.queryByText("Tags can be at most 4 characters.")).not.toBeNull();
    await userEvent.clear(field());
    await userEvent.keyboard("bad{Enter}");
    expect(chips()).toEqual([]);
    await expect.poll(() => screen.queryByText("No bad tags")).not.toBeNull();
    await userEvent.clear(field());
    await userEvent.keyboard("ok{Enter}");
    expect(chips()).toEqual(["ok"]);
  });

  it("Backspace on an empty field selects the last tag; Backspace again removes it", async () => {
    renderUi(<TagsInput label="Skills" defaultValue={["a", "b"]} />, variant);
    await userEvent.click(field());
    await userEvent.keyboard("{Backspace}");
    const lastChip = document.querySelector<HTMLElement>("[data-tag-index='1']")!;
    await expect.poll(() => document.activeElement).toBe(lastChip);
    await userEvent.keyboard("{Backspace}");
    await expect.poll(chips).toEqual(["a"]);
    // Focus moves to the previous tag, so repeated Backspace keeps deleting.
    await expect.poll(() => document.activeElement?.getAttribute("data-tag-index")).toBe("0");
    await userEvent.keyboard("{Backspace}");
    await expect.poll(chips).toEqual([]);
    await expect.poll(() => document.activeElement).toBe(field());
  });

  it("ArrowLeft at the start moves into the chips, ArrowRight back; Delete removes a focused chip", async () => {
    renderUi(<TagsInput label="Skills" defaultValue={["a", "b", "c"]} />, variant);
    await userEvent.click(field());
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => document.activeElement?.getAttribute("data-tag-index")).toBe("2");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => document.activeElement?.getAttribute("data-tag-index")).toBe("1");
    await userEvent.keyboard("{Delete}");
    await expect.poll(chips).toEqual(["a", "c"]);
  });

  it("the × button removes a tag by pointer; clearable removes them all", async () => {
    renderUi(<TagsInput label="Skills" defaultValue={["a", "b"]} clearable />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Remove a" }));
    await expect.poll(chips).toEqual(["b"]);
    await userEvent.click(screen.getByRole("button", { name: "Remove all tags" }));
    await expect.poll(chips).toEqual([]);
  });

  it("pasted text is split on commas, semicolons and new lines", async () => {
    renderUi(<TagsInput label="Skills" />, variant);
    field().focus();
    const data = new DataTransfer();
    data.setData("text/plain", "one, two;three\nfour");
    field().dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await expect.poll(chips).toEqual(["one", "two", "three", "four"]);
  });

  it("controlled value follows the parent; name submits one hidden input per tag", async () => {
    function Controlled() {
      const [tags, setTags] = useState(["x"]);
      return (
        <form data-testid="f">
          <TagsInput label="Skills" value={tags} onValueChange={setTags} name="skills" />
          <button type="button" onClick={() => setTags(["p", "q"])}>
            swap
          </button>
        </form>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("button", { name: "swap" }));
    await expect.poll(chips).toEqual(["p", "q"]);
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).getAll("skills")).toEqual(["p", "q"]);
  });

  it("addOnBlur commits the typed text when the field loses focus", async () => {
    renderUi(
      <>
        <TagsInput label="Skills" addOnBlur />
        <button>elsewhere</button>
      </>,
      variant,
    );
    await userEvent.click(field());
    await userEvent.keyboard("typed");
    await userEvent.click(screen.getByRole("button", { name: "elsewhere" }));
    await expect.poll(chips).toEqual(["typed"]);
  });

  it("suggestions open a listbox you can pick from with the keyboard", async () => {
    renderUi(<TagsInput label="Skills" suggestions={["react", "redux", "rust"]} />, variant);
    const input = screen.getByRole("combobox", { name: "Skills" });
    await userEvent.click(input);
    await userEvent.keyboard("re");
    const listbox = await screen.findByRole("listbox");
    expect(
      within(listbox)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["react", "redux"]);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect.poll(chips).toEqual(["react"]);
  });

  it("restrictToSuggestions rejects tags that are not in the list", async () => {
    renderUi(<TagsInput label="Skills" suggestions={["react"]} restrictToSuggestions />, variant);
    await userEvent.click(screen.getByRole("combobox", { name: "Skills" }));
    await userEvent.keyboard("vue{Enter}");
    expect(chips()).toEqual([]);
    await expect.poll(() => screen.queryByText("“vue” isn’t in the list.")).not.toBeNull();
  });

  it("disabled and readOnly fields cannot be edited", () => {
    renderUi(
      <>
        <TagsInput label="Off" disabled defaultValue={["a"]} />
        <TagsInput label="Locked" readOnly defaultValue={["b"]} />
      </>,
      variant,
    );
    expect(screen.getByRole("textbox", { name: "Off" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Locked" })).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Remove b", hidden: true })).toBeNull();
  });

  it("labels override the strings (i18n); error from outside marks the field invalid", () => {
    renderUi(
      <TagsInput
        label="Fähigkeiten"
        defaultValue={["a"]}
        error="Pflichtfeld"
        labels={{ remove: (t) => `${t} entfernen`, duplicate: (t) => `${t} gibt es schon` }}
      />,
      variant,
    );
    expect(screen.getByRole("button", { name: "a entfernen", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Pflichtfeld");
    expect(screen.getByRole("textbox", { name: "Fähigkeiten" })).toHaveAttribute("aria-invalid", "true");
  });

  it("has no axe violations (with tags, an error, suggestions open)", async () => {
    renderUi(
      <div className="grid gap-4">
        <TagsInput label="Skills" defaultValue={["react", "css"]} max={5} clearable />
        <TagsInput label="Errored" error="Needs one" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
