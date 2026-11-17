// SideDrawer: open/close paths, close guards, notices, resize handle, non-modal mode,
// SideDrawerForm (validation, dirty bar, discard confirm) and SideDrawerDetail (tabs, record nav, J/K).

import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { Input } from "../../src/components/input/input";
import {
  SideDrawer,
  SideDrawerBody,
  SideDrawerClose,
  SideDrawerContent,
  SideDrawerFooter,
  SideDrawerHeader,
  SideDrawerTrigger,
  useSideDrawer,
  useSideDrawerCloseGuard,
} from "../../src/components/side-drawer/side-drawer";
import { SideDrawerForm } from "../../src/components/side-drawer/side-drawer-form";
import { SideDrawerDetail } from "../../src/components/side-drawer/side-drawer-detail";
import { settle } from "../helpers";
import { setReducedMotion } from "../helpers-text";
import { describeVariants, renderUi, runAxe } from "../render";

const dialog = () => screen.queryByRole("dialog");
const trigger = (name = "Open panel") => screen.getByRole("button", { name });

/* ---------- Basics ---------- */

function Basic({
  onOpenChange,
  labels,
  modal,
}: {
  onOpenChange?: (open: boolean) => void;
  labels?: { close?: string };
  modal?: boolean;
}) {
  return (
    <div className="p-4">
      <SideDrawer onOpenChange={onOpenChange} labels={labels} modal={modal}>
        <SideDrawerTrigger render={<Button />}>Open panel</SideDrawerTrigger>
        <SideDrawerContent size="sm">
          <SideDrawerHeader title="Edit profile" description="Visible to your team." />
          <SideDrawerBody>
            <p>Body copy</p>
            <Input label="Display name" defaultValue="Ava" />
          </SideDrawerBody>
          <SideDrawerFooter>
            <SideDrawerClose render={<Button variant="ghost" />}>Done</SideDrawerClose>
          </SideDrawerFooter>
        </SideDrawerContent>
      </SideDrawer>
      <button>page button</button>
    </div>
  );
}

describe("SideDrawer", () => {
  it("opens a dialog named by its title and described by its description", async () => {
    renderUi(<Basic />);
    expect(dialog()).toBeNull();
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()).toHaveAccessibleName("Edit profile");
    expect(dialog()).toHaveAccessibleDescription("Visible to your team.");
    expect(within(dialog()!).getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("keyboard: Enter opens, focus moves in, Escape closes, focus returns to the trigger", async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    renderUi(<Basic onOpenChange={onOpenChange} />);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it("is modal: Tab stays inside; the × button and the Close part close it", async () => {
    renderUi(<Basic />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    }
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Close" }));
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();

    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Done" }));
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
  });

  it("labels override the close button name", async () => {
    renderUi(<Basic labels={{ close: "Cerrar" }} />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(within(dialog()!).getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });

  it("an outside press (the scrim) closes a modal drawer", async () => {
    renderUi(<Basic />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(document.documentElement, { position: { x: 4, y: 4 } });
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
  });

  it("modal={false}: the page stays usable and an outside click does not close it; Escape closes it from inside", async () => {
    renderUi(<Basic modal={false} />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "page button" }));
    expect(screen.getByRole("button", { name: "page button" })).toHaveFocus();
    expect(dialog()).not.toBeNull();
    within(dialog()!).getByRole("textbox", { name: "Display name" }).focus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
  });

  it("reduced motion: opens and closes with the same semantics", async () => {
    setReducedMotion();
    renderUi(<Basic />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
  });

  it("floats inset by default, with a lit edge; inset={false} attaches it", async () => {
    const { unmount } = renderUi(<Basic />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()!.hasAttribute("data-inset")).toBe(true);
    expect(dialog()!.querySelector("[data-slot='side-drawer-lit-edge']")).not.toBeNull();
    unmount();
    renderUi(
      <SideDrawer defaultOpen>
        <SideDrawerContent inset={false}>
          <SideDrawerHeader title="Flush" />
        </SideDrawerContent>
      </SideDrawer>,
    );
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()!.hasAttribute("data-inset")).toBe(false);
    expect(dialog()!.querySelector("[data-slot='side-drawer-lit-edge']")).toBeNull();
  });

  it("keeps Escape and focus return working on the floating panel", async () => {
    renderUi(<Basic />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  describeVariants((variant) => {
    it("has no axe violations while open", async () => {
      renderUi(<Basic />, variant);
      await userEvent.click(trigger());
      await expect.poll(dialog).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- Close guard + notices ---------- */

function GuardedPanel({ guard }: { guard: () => boolean | Promise<boolean> }) {
  useSideDrawerCloseGuard(guard);
  const drawer = useSideDrawer();
  return (
    <>
      <SideDrawerHeader title="Guarded" />
      <SideDrawerBody>
        <Button onClick={() => drawer?.notify("Archived", { announce: "Order 1042 archived" })}>Archive</Button>
        <Button onClick={() => void drawer?.requestClose({ force: true })}>Force close</Button>
      </SideDrawerBody>
    </>
  );
}

function Guarded({ guard }: { guard: () => boolean | Promise<boolean> }) {
  return (
    <SideDrawer>
      <SideDrawerTrigger render={<Button />}>Open panel</SideDrawerTrigger>
      <SideDrawerContent>
        <GuardedPanel guard={guard} />
      </SideDrawerContent>
    </SideDrawer>
  );
}

describe("SideDrawer close guard and notices", () => {
  it("a guard returning false keeps it open for Escape, the × button and the scrim", async () => {
    const guard = vi.fn(() => false);
    renderUi(<Guarded guard={guard} />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => guard.mock.calls.length).toBe(1);
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Close" }));
    await expect.poll(() => guard.mock.calls.length).toBe(2);
    await userEvent.click(document.documentElement, { position: { x: 4, y: 4 } });
    await expect.poll(() => guard.mock.calls.length).toBe(3);
    expect(dialog()).not.toBeNull();
  });

  it("an async guard that resolves true lets it close; focus returns to the trigger", async () => {
    const guard = vi.fn(() => Promise.resolve(true));
    renderUi(<Guarded guard={guard} />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    expect(guard).toHaveBeenCalledTimes(1);
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("requestClose({ force: true }) skips the guard", async () => {
    const guard = vi.fn(() => false);
    renderUi(<Guarded guard={guard} />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Force close" }));
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    expect(guard).not.toHaveBeenCalled();
  });

  it("notify() shows a check by the title and announces the message once in a polite live region", async () => {
    renderUi(<Guarded guard={() => true} />);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    await expect.poll(() => document.querySelector('[data-slot="side-drawer-notice"]')).not.toBeNull();
    const status = within(dialog()!)
      .getAllByRole("status")
      .find((n) => n.textContent === "Order 1042 archived");
    expect(status).toBeTruthy();
    // The visible notice is aria-hidden, so the message is announced once.
    expect(document.querySelector('[data-slot="side-drawer-notice"]')).toHaveAttribute("aria-hidden", "true");
  });
});

/* ---------- Resize handle ---------- */

describe("SideDrawer resizable", () => {
  function Resizable({ onWidthChange }: { onWidthChange?: (w: number | null) => void }) {
    return (
      <SideDrawer defaultOpen>
        <SideDrawerContent resizable defaultWidth={480} minWidth={360} maxWidth={640} onWidthChange={onWidthChange}>
          <SideDrawerHeader title="Resizable" />
          <SideDrawerBody>content</SideDrawerBody>
        </SideDrawerContent>
      </SideDrawer>
    );
  }

  it("the handle is a focusable vertical separator with a spoken width; arrows, Home/End resize within limits", async () => {
    const onWidthChange = vi.fn<(width: number | null) => void>();
    renderUi(<Resizable onWidthChange={onWidthChange} />);
    await expect.poll(dialog).not.toBeNull();
    const handle = await screen.findByRole("separator", { name: "Resize panel" });
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("tabindex", "0");
    expect(Number(handle.getAttribute("aria-valuemin"))).toBe(360);
    expect(Number(handle.getAttribute("aria-valuemax"))).toBe(640);
    expect(handle.getAttribute("aria-valuetext")).toMatch(/pixels wide/);
    handle.focus();
    const start = Number(handle.getAttribute("aria-valuenow"));
    // The panel hugs the right edge, so the free edge is its left side: ArrowLeft widens it.
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => Number(handle.getAttribute("aria-valuenow"))).not.toBe(start);
    await userEvent.keyboard("{Home}");
    await expect.poll(() => Number(handle.getAttribute("aria-valuenow"))).toBe(360);
    await userEvent.keyboard("{End}");
    await expect.poll(() => Number(handle.getAttribute("aria-valuenow"))).toBe(640);
    expect(onWidthChange).toHaveBeenCalled();
    // Double-click resets to the size. While the handle has keyboard focus its single-pointer step buttons sit over its
    // middle (WCAG 2.5.7), so the double-click lands near the top of the handle, on the handle itself.
    await userEvent.dblClick(handle, { position: { x: 4, y: 24 } });
    await expect.poll(() => onWidthChange.mock.lastCall?.[0]).toBeNull();
  });

  it("labels override the handle name and spoken value", async () => {
    renderUi(
      <SideDrawer defaultOpen labels={{ resize: "Cambiar tamaño", resizeValue: (w) => `${Math.round(w)} píxeles` }}>
        <SideDrawerContent resizable defaultWidth={480}>
          <SideDrawerHeader title="Resizable" />
          <SideDrawerBody>content</SideDrawerBody>
        </SideDrawerContent>
      </SideDrawer>,
    );
    const handle = await screen.findByRole("separator", { name: "Cambiar tamaño" });
    expect(handle.getAttribute("aria-valuetext")).toMatch(/píxeles$/);
  });

  it("storageKey remembers the width across mounts", async () => {
    localStorage.clear();
    const first = renderUi(
      <SideDrawer defaultOpen>
        <SideDrawerContent resizable defaultWidth={480} minWidth={360} maxWidth={640} storageKey="c-test">
          <SideDrawerHeader title="Remember" />
          <SideDrawerBody>content</SideDrawerBody>
        </SideDrawerContent>
      </SideDrawer>,
    );
    const handle = await screen.findByRole("separator", { name: "Resize panel" });
    handle.focus();
    await userEvent.keyboard("{End}");
    await expect.poll(() => Number(handle.getAttribute("aria-valuenow"))).toBe(640);
    first.unmount();
    expect(Object.keys(localStorage).some((k) => k.includes("c-test"))).toBe(true);
    renderUi(
      <SideDrawer defaultOpen>
        <SideDrawerContent resizable defaultWidth={480} minWidth={360} maxWidth={640} storageKey="c-test">
          <SideDrawerHeader title="Remember" />
          <SideDrawerBody>content</SideDrawerBody>
        </SideDrawerContent>
      </SideDrawer>,
    );
    const again = await screen.findByRole("separator", { name: "Resize panel" });
    await expect.poll(() => Number(again.getAttribute("aria-valuenow"))).toBe(640);
  });
});

/* ---------- SideDrawerForm ---------- */

type Profile = { name: string; email: string };

function FormExample({
  onSubmit = () => undefined,
  onSuccess,
  confirmDiscard = true,
  validate,
  successSeal,
}: {
  successSeal?: boolean;
  onSubmit?: (values: Profile) => unknown;
  onSuccess?: (values: Profile) => void;
  confirmDiscard?: boolean;
  validate?: (values: Profile) => Partial<Record<keyof Profile, string>>;
}) {
  return (
    <SideDrawer>
      <SideDrawerTrigger render={<Button />}>Open panel</SideDrawerTrigger>
      <SideDrawerContent>
        <SideDrawerHeader title="Edit profile" />
        <SideDrawerForm<Profile>
          initialValues={{ name: "Ava", email: "ava@example.com" }}
          confirmDiscard={confirmDiscard}
          validate={
            validate ??
            ((v) => ({
              name: v.name.trim() ? undefined : "Name is required",
              email: /.+@.+/.test(v.email) ? undefined : "Enter a valid email",
            }))
          }
          onSubmit={onSubmit as never}
          onSuccess={onSuccess}
          closeOnFinish
          successSeal={successSeal}
        >
          {(form) => (
            <>
              <Input label="Name" {...form.field("name")} />
              <Input label="Email" {...form.field("email")} />
            </>
          )}
        </SideDrawerForm>
      </SideDrawerContent>
    </SideDrawer>
  );
}

const openForm = async () => {
  await userEvent.click(trigger());
  await expect.poll(dialog).not.toBeNull();
};
const nameField = () => within(dialog()!).getByRole<HTMLInputElement>("textbox", { name: "Name" });

describe("SideDrawerForm", () => {
  it("shows the unsaved hint only once something changed", async () => {
    renderUi(<FormExample />);
    await openForm();
    expect(within(dialog()!).queryByText("Unsaved changes")).toBeNull();
    nameField().focus();
    await userEvent.keyboard("x");
    await expect.poll(() => within(dialog()!).queryByText("Unsaved changes")).not.toBeNull();
    // Typing the value back removes the dirty state.
    await userEvent.keyboard("{Backspace}");
    await expect.poll(() => within(dialog()!).queryByText("Unsaved changes")).toBeNull();
  });

  it("an invalid submit shows an error summary and per-field errors without calling onSubmit; summary entries focus the field", async () => {
    const onSubmit = vi.fn();
    renderUi(<FormExample onSubmit={onSubmit} />);
    await openForm();
    await userEvent.clear(nameField());
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Save" }));
    const summary = await within(dialog()!).findByText("There is 1 problem to fix");
    expect(summary).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(nameField()).toBeInvalid();
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Name is required" }));
    expect(nameField()).toHaveFocus();
  });

  it("a valid submit calls onSubmit with the values, reports success and closes the drawer", async () => {
    const onSubmit = vi.fn();
    const onSuccess = vi.fn();
    renderUi(<FormExample onSubmit={onSubmit} onSuccess={onSuccess} />);
    await openForm();
    nameField().focus();
    await userEvent.keyboard("{End}!");
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Save" }));
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: "Ava!", email: "ava@example.com" });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
  });

  it("server errors returned from onSubmit are shown on their field", async () => {
    renderUi(<FormExample onSubmit={() => Promise.resolve({ errors: { email: "Already taken" } })} />);
    await openForm();
    nameField().focus();
    await userEvent.keyboard("x");
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Save" }));
    await expect.poll(() => within(dialog()!).queryAllByText("Already taken").length).toBeGreaterThan(0);
    expect(dialog()).not.toBeNull();
  });

  it("closing with unsaved changes asks 'Discard unsaved changes?'; Keep editing stays, Discard closes", async () => {
    renderUi(<FormExample />);
    await openForm();
    nameField().focus();
    await userEvent.keyboard("x");
    await userEvent.keyboard("{Escape}");
    const confirm = await screen.findByRole("alertdialog", { name: "Discard unsaved changes?" });
    expect(confirm).toBeInTheDocument();
    await userEvent.click(within(confirm).getByRole("button", { name: "Keep editing" }));
    await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull();
    expect(dialog()).not.toBeNull();
    // The edit survived.
    expect(nameField().value).toBe("Avax");

    await userEvent.click(within(dialog()!).getByRole("button", { name: "Cancel" }));
    const again = await screen.findByRole("alertdialog", { name: "Discard unsaved changes?" });
    await userEvent.click(within(again).getByRole("button", { name: "Discard" }));
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("without changes (or confirmDiscard={false}) Escape closes straight away", async () => {
    renderUi(<FormExample />);
    await openForm();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("Cmd/Ctrl+Enter in a field saves", async () => {
    const onSubmit = vi.fn();
    renderUi(<FormExample onSubmit={onSubmit} />);
    await openForm();
    nameField().focus();
    // Nothing changed means nothing to send, so make an edit first.
    await userEvent.keyboard("x");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1);
  });

  it("successSeal shows the seal and announces Saved before the drawer closes", async () => {
    const onSuccess = vi.fn();
    renderUi(<FormExample onSuccess={onSuccess} successSeal />);
    await openForm();
    nameField().focus();
    await userEvent.keyboard("{End}!");
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Save" }));
    await expect.poll(() => dialog()?.querySelector("[data-slot='side-drawer-seal']")).not.toBeNull();
    expect(
      within(dialog()!)
        .getAllByRole("status")
        .some((el) => el.textContent === "Saved"),
    ).toBe(true);
    await expect.poll(dialog, { timeout: 5000 }).toBeNull();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  describeVariants((variant) => {
    it("has no axe violations with the success seal showing", async () => {
      renderUi(<FormExample successSeal />, variant);
      await openForm();
      nameField().focus();
      await userEvent.keyboard("x");
      await userEvent.click(within(dialog()!).getByRole("button", { name: "Save" }));
      await expect.poll(() => dialog()?.querySelector("[data-slot='side-drawer-seal']")).not.toBeNull();
      expect(await runAxe()).toHaveNoViolations();
    });

    it("has no axe violations (form, with errors shown)", async () => {
      renderUi(<FormExample />, variant);
      await openForm();
      await userEvent.clear(nameField());
      await userEvent.click(within(dialog()!).getByRole("button", { name: "Save" }));
      await within(dialog()!).findByText("There is 1 problem to fix");
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

/* ---------- SideDrawerDetail ---------- */

const orders = [
  { id: "ord_1", title: "Order #1", email: "one@example.com" },
  { id: "ord_2", title: "Order #2", email: "two@example.com" },
  { id: "ord_3", title: "Order #3", email: "three@example.com" },
];

function DetailExample({
  onIndex,
  state,
}: {
  onIndex?: (i: number) => void;
  state?: { loading?: boolean; error?: boolean; empty?: boolean; onRetry?: () => void };
}) {
  const [index, setIndex] = useState(0);
  const order = orders[index]!;
  return (
    <SideDrawer defaultOpen>
      <SideDrawerContent size="lg">
        <SideDrawerDetail
          title={order.title}
          subtitle={order.email}
          recordId={order.id}
          recordIdLabel="Order ID"
          recordKey={order.id}
          navigation={{
            index,
            count: orders.length,
            onIndexChange: (i) => {
              onIndex?.(i);
              setIndex(i);
            },
          }}
          tabs={[
            { value: "overview", label: "Overview", content: <p>Overview of {order.title}</p> },
            { value: "activity", label: "Activity", count: 12, content: <p>Activity feed</p> },
          ]}
          loading={state?.loading}
          error={state?.error}
          empty={state?.empty}
          onRetry={state?.onRetry}
          editable={false}
        />
      </SideDrawerContent>
    </SideDrawer>
  );
}

describe("SideDrawerDetail", () => {
  it("renders the title, the copyable record id chip, tabs and the record position", async () => {
    renderUi(<DetailExample />);
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()).toHaveAccessibleName("Order #1");
    expect(within(dialog()!).getByRole("button", { name: "Copy Order ID ord_1" })).toBeInTheDocument();
    expect(within(dialog()!).getByRole("tablist", { name: "Sections" })).toBeInTheDocument();
    expect(within(dialog()!).getByRole("tab", { name: /Overview/ })).toHaveAttribute("aria-selected", "true");
    expect(within(dialog()!).getByText("1 of 3")).toBeInTheDocument();
    expect(within(dialog()!).getByRole("tab", { name: /Activity/ })).toHaveTextContent("12");
  });

  it("tabs: arrow keys move between tabs and show their panel", async () => {
    renderUi(<DetailExample />);
    await expect.poll(dialog).not.toBeNull();
    const overview = within(dialog()!).getByRole("tab", { name: /Overview/ });
    overview.focus();
    // Arrows move focus along the list; Enter activates (Tabs without activateOnFocus).
    await userEvent.keyboard("{ArrowRight}{Enter}");
    const activity = within(dialog()!).getByRole("tab", { name: /Activity/ });
    await expect.poll(() => activity.getAttribute("aria-selected")).toBe("true");
    expect(await within(dialog()!).findByText("Activity feed")).toBeInTheDocument();
  });

  it("next / previous buttons walk the records; they stay focusable (aria-disabled) at the ends", async () => {
    const onIndex = vi.fn();
    renderUi(<DetailExample onIndex={onIndex} />);
    await expect.poll(dialog).not.toBeNull();
    const prev = within(dialog()!).getByRole("button", { name: "Previous" });
    const next = within(dialog()!).getByRole("button", { name: "Next" });
    expect(prev).toHaveAttribute("aria-disabled", "true");
    prev.focus();
    await userEvent.keyboard("{Enter}");
    expect(prev).toHaveFocus();
    expect(onIndex).not.toHaveBeenCalled();
    await userEvent.click(next);
    await expect.poll(() => dialog()!.textContent).toContain("2 of 3");
    expect(dialog()).toHaveAccessibleName("Order #2");
    expect(next).not.toHaveAttribute("aria-disabled");
  });

  it("J / K move to the next / previous record when focus is in the panel (not in a field)", async () => {
    renderUi(<DetailExample />);
    await expect.poll(dialog).not.toBeNull();
    const tab = within(dialog()!).getByRole("tab", { name: /Overview/ });
    // J / K are plain letters, so make sure they are not swallowed by tab typeahead.
    within(dialog()!).getByRole("button", { name: "Next" }).focus();
    await userEvent.keyboard("j");
    await expect.poll(() => dialog()!.textContent).toContain("2 of 3");
    await userEvent.keyboard("j");
    await expect.poll(() => dialog()!.textContent).toContain("3 of 3");
    await userEvent.keyboard("j");
    expect(dialog()!.textContent).toContain("3 of 3");
    await userEvent.keyboard("k");
    await expect.poll(() => dialog()!.textContent).toContain("2 of 3");
    expect(tab).toBeInTheDocument();
  });

  it("the move is announced once in a polite live region", async () => {
    renderUi(<DetailExample />);
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Next" }));
    await expect
      .poll(() => [...dialog()!.querySelectorAll('[aria-live="polite"]')].map((n) => n.textContent).filter(Boolean))
      .toEqual(["Order #2, 2 of 3"]);
  });

  it("J / K are ignored while typing in a text field", async () => {
    const onIndex = vi.fn();
    render_withField(onIndex);
    await expect.poll(dialog).not.toBeNull();
    const field = within(dialog()!).getByRole("textbox", { name: "Note" });
    field.focus();
    await userEvent.keyboard("jk");
    expect(onIndex).not.toHaveBeenCalled();
    expect((field as HTMLInputElement).value).toBe("jk");
  });

  it("loading shows a named skeleton; an error shows an alert with Retry; empty shows its message", async () => {
    const onRetry = vi.fn();
    const view = renderUi(<DetailExample state={{ loading: true }} />);
    await expect.poll(dialog).not.toBeNull();
    expect(within(dialog()!).getAllByText("Loading…").length).toBeGreaterThan(0);
    view.unmount();

    const err = renderUi(<DetailExample state={{ error: true, onRetry }} />);
    await expect.poll(dialog).not.toBeNull();
    expect(within(dialog()!).getByRole("alert")).toHaveTextContent("Couldn’t load this record");
    await userEvent.click(within(dialog()!).getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    err.unmount();

    renderUi(<DetailExample state={{ empty: true }} />);
    await expect.poll(dialog).not.toBeNull();
    expect(within(dialog()!).getByText("Nothing selected")).toBeInTheDocument();
  });

  describeVariants((variant) => {
    it("has no axe violations", async () => {
      renderUi(<DetailExample />, variant);
      await expect.poll(dialog).not.toBeNull();
      await settle();
      expect(await runAxe()).toHaveNoViolations();
    });
  });
});

function render_withField(onIndex: (i: number) => void) {
  renderUi(
    <SideDrawer defaultOpen>
      <SideDrawerContent>
        <SideDrawerDetail title="Order #1" editable={false} navigation={{ index: 0, count: 3, onIndexChange: onIndex }}>
          <Input label="Note" />
        </SideDrawerDetail>
      </SideDrawerContent>
    </SideDrawer>,
  );
}
