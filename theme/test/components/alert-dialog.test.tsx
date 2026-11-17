import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  ConfirmDialog,
  useConfirm,
  type AlertDialogTone,
} from "../../src/components/alert-dialog/alert-dialog";
import { Button } from "../../src/components/button/button";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const dialog = () => screen.queryByRole("alertdialog");
const trigger = (name = "Delete project") => screen.getByRole("button", { name });

function Composed({ tone, onAction }: { tone?: AlertDialogTone; onAction?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="danger" />}>Delete project</AlertDialogTrigger>
      <AlertDialogContent tone={tone}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describeVariants((variant) => {
  it("opens as a named, described alertdialog; Escape closes it and focus returns to the trigger", async () => {
    renderUi(<Composed />, variant);
    expect(dialog()).toBeNull();
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()).toHaveAccessibleName("Delete this project?");
    expect(dialog()).toHaveAccessibleDescription("This cannot be undone.");
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  it("keyboard opens it, focus is trapped, and the action closes it after running", async () => {
    const onAction = vi.fn();
    renderUi(<Composed onAction={onAction} />, variant);
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(dialog).not.toBeNull();
    await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      // Focus may pass through a focus guard for a moment before it is wrapped back into the dialog.
      await expect.poll(() => dialog()!.contains(document.activeElement)).toBe(true);
    }
    screen.getByRole("button", { name: "Delete" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
  });

  it("Cancel closes without running the action", async () => {
    const onAction = vi.fn();
    renderUi(<Composed onAction={onAction} />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }));
    await expect.poll(dialog).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("an alert dialog is not dismissed by a click on the scrim", async () => {
    renderUi(<Composed />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(document.documentElement, { position: { x: 3, y: 3 } });
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it.each(["danger", "warning", "info"] as const)("tone=%s shows an icon and opens", async (tone) => {
    renderUi(<Composed tone={tone} />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()!.querySelector("svg")).toBeInTheDocument();
  });

  it("ConfirmDialog: title, description, custom labels and focus lands on Cancel for danger", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderUi(
      <ConfirmDialog
        trigger={<Button>Archive</Button>}
        title="Archive 3 files?"
        description="They move to the archive."
        confirmLabel="Archive"
        cancelLabel="Not now"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    await expect.poll(dialog).not.toBeNull();
    expect(dialog()).toHaveAccessibleName("Archive 3 files?");
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "Not now" }));
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("ConfirmDialog: an async onConfirm shows a working state, blocks dismissal, then closes", async () => {
    let finish!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    renderUi(
      <ConfirmDialog
        trigger={<Button>Go</Button>}
        title="Proceed?"
        onConfirm={onConfirm}
        labels={{ pending: "Bezig…", confirm: "Doorgaan" }}
      />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Doorgaan" }));
    await expect.poll(() => screen.queryByText("Bezig…", { selector: "span[role=status]" })).not.toBeNull();
    expect(dialog()).toHaveAttribute("aria-busy", "true");
    await userEvent.keyboard("{Escape}");
    expect(dialog()).not.toBeNull();
    finish();
    await expect.poll(dialog).toBeNull();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("ConfirmDialog: a failing onConfirm keeps the dialog open and announces the error", async () => {
    renderUi(
      <ConfirmDialog
        trigger={<Button>Go</Button>}
        title="Proceed?"
        onConfirm={() => Promise.reject(new Error("Server said no"))}
      />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    await userEvent.click(await screen.findByRole("button", { name: "Confirm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Server said no");
    expect(dialog()).not.toBeNull();
  });

  it("ConfirmDialog: errorMessage maps the thrown error", async () => {
    renderUi(
      <ConfirmDialog
        trigger={<Button>Go</Button>}
        title="Proceed?"
        onConfirm={() => Promise.reject(new Error("E42"))}
        errorMessage={(e) => `Custom: ${(e as Error).message}`}
      />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    await userEvent.click(await screen.findByRole("button", { name: "Confirm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Custom: E42");
  });

  it("ConfirmDialog: labels.error is the fallback for errors without a message", async () => {
    renderUi(
      <ConfirmDialog
        trigger={<Button>Go</Button>}
        title="Proceed?"
        onConfirm={() => Promise.reject(new Error(""))}
        labels={{ error: "Das hat nicht geklappt." }}
      />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    await userEvent.click(await screen.findByRole("button", { name: "Confirm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Das hat nicht geklappt.");
  });

  it("confirmationText keeps the action disabled until it is typed exactly", async () => {
    const onConfirm = vi.fn();
    renderUi(
      <ConfirmDialog
        trigger={<Button>Delete</Button>}
        title="Delete project?"
        confirmationText="sheenui"
        onConfirm={onConfirm}
        confirmLabel="Delete forever"
      />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await expect.poll(dialog).not.toBeNull();
    const field = screen.getByRole("textbox");
    expect(field).toHaveAccessibleName(/Type sheenui to confirm/);
    await expect.poll(() => document.activeElement).toBe(field);
    const action = screen.getByRole("button", { name: "Delete forever" });
    expect(action).toBeDisabled();
    await userEvent.keyboard("sheen");
    expect(action).toBeDisabled();
    await userEvent.keyboard("ui");
    await expect.poll(() => action).toBeEnabled();
    await userEvent.click(action);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await expect.poll(dialog).toBeNull();
  });

  it("controlled open state and onOpenChange", async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return <ConfirmDialog open={open} onOpenChange={setOpen} title="Controlled?" />;
    }
    renderUi(<Controlled />, variant);
    await expect.poll(dialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
  });

  it("useConfirm resolves true on confirm and false on cancel", async () => {
    const results: boolean[] = [];
    function Host() {
      const [confirm, confirmDialog] = useConfirm();
      return (
        <>
          <Button
            onClick={async () =>
              results.push(await confirm({ title: "Sure?", confirmLabel: "Yes", cancelLabel: "No" }))
            }
          >
            Ask
          </Button>
          {confirmDialog}
        </>
      );
    }
    renderUi(<Host />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    await userEvent.click(await screen.findByRole("button", { name: "Yes" }));
    await expect.poll(() => results).toEqual([true]);
    await expect.poll(dialog).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Ask" }));
    await userEvent.click(await screen.findByRole("button", { name: "No" }));
    await expect.poll(() => results).toEqual([true, false]);
  });

  it("has no axe violations while open (composed and confirm with a field)", async () => {
    renderUi(<Composed tone="warning" />, variant);
    await userEvent.click(trigger());
    await expect.poll(dialog).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();

    renderUi(
      <ConfirmDialog defaultOpen title="Type to confirm" confirmationText="abc" description="Careful." />,
      variant,
    );
    await expect.poll(dialog).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the dialog still opens and closes", async () => {
  reduceMotion();
  renderUi(<Composed />);
  await userEvent.click(trigger());
  await expect.poll(dialog).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  await expect.poll(dialog).toBeNull();
});
