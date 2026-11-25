import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ToastProvider, Toaster, useToast } from "../../src/components/toast/toast";
import { Button } from "../../src/components/button/button";
import { renderUi } from "../render";

function Harness({ run }: { run: (toast: ReturnType<typeof useToast>) => void }) {
  const toast = useToast();
  return (
    <>
      <Button onClick={() => run(toast)}>Go</Button>
      <Toaster />
    </>
  );
}
const show = (run: (toast: ReturnType<typeof useToast>) => void) => {
  renderUi(
    <ToastProvider>
      <Harness run={run} />
    </ToastProvider>,
  );
  return userEvent.click(screen.getByRole("button", { name: "Go" }));
};

it("warning and loading toasts render; loading shows a named spinner", async () => {
  await show((t) => {
    t.warning("Careful");
    t.loading("Working…");
  });
  await expect.poll(() => screen.queryByText("Careful")).not.toBeNull();
  expect(screen.getByText("Working…")).toBeInTheDocument();
  expect(screen.getByText("Loading")).toBeInTheDocument();
});

it("an action button runs its handler", async () => {
  const undo = vi.fn();
  await show((t) => void t.info("Deleted", undefined, { action: { label: "Undo", onClick: undo }, persistent: true }));
  await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
  expect(undo).toHaveBeenCalledTimes(1);
});

it("update changes a showing toast by id", async () => {
  let id = "";
  await show((t) => {
    id = t.loading("Uploading…", "0 of 3");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => t.update(id, { type: "success", title: "Upload complete", description: "3 of 3" })),
    );
  });
  await expect.poll(() => screen.queryByText("Upload complete")).not.toBeNull();
  expect(screen.queryByText("Uploading…")).toBeNull();
});

it("dismiss(id) closes that toast and leaves the other one showing", async () => {
  await show((t) => {
    const first = t.info("First toast", undefined, { persistent: true });
    t.info("Second toast", undefined, { persistent: true });
    requestAnimationFrame(() => requestAnimationFrame(() => t.dismiss(first)));
  });
  await expect.poll(() => screen.queryByText("First toast")).toBeNull();
  expect(screen.getByText("Second toast")).toBeInTheDocument();
});

it("promise shows loading, then the success message built from the result", async () => {
  let settle: (value: string) => void = () => undefined;
  await show((t) => {
    void t.promise(new Promise<string>((resolve) => (settle = resolve)), {
      loading: "Saving…",
      success: (name) => `${name} saved`,
      error: "Failed",
    });
  });
  await expect.poll(() => screen.queryByText("Saving…")).not.toBeNull();
  settle("report.pdf");
  await expect.poll(() => screen.queryByText("report.pdf saved"), { timeout: 10_000 }).not.toBeNull();
});

it("promise shows the error message when the promise rejects", async () => {
  await show((t) => {
    // The returned promise rejects like the original one does: handle it.
    t.promise(Promise.reject(new Error("nope")), {
      loading: "Saving…",
      success: "Saved",
      error: (e) => `Failed: ${(e as Error).message}`,
    }).catch(() => undefined);
  });
  await expect.poll(() => screen.queryByText("Failed: nope"), { timeout: 10_000 }).not.toBeNull();
});

it("a toast with a position shows only in the Toaster with onlyPositioned", async () => {
  renderUi(
    <ToastProvider>
      <Harness run={(t) => void t.info("Corner toast", undefined, { position: "bottom-left", persistent: true })} />
      <Toaster position="bottom-left" onlyPositioned labels={{ region: "Positioned" }} />
    </ToastProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Go" }));
  await expect.poll(() => screen.queryAllByText("Corner toast")).toHaveLength(1);
});

it("useToast returns the same API object on every render, so it is safe in effect dependencies", () => {
  const seen: unknown[] = [];
  function Probe({ tick }: { tick: number }) {
    seen.push(useToast());
    return <span>{tick}</span>;
  }
  const ui = (tick: number) => (
    <ToastProvider>
      <Probe tick={tick} />
    </ToastProvider>
  );
  const { rerender } = renderUi(ui(1));
  rerender(ui(2));
  rerender(ui(3));
  expect(seen.length).toBeGreaterThanOrEqual(3);
  expect(new Set(seen).size).toBe(1);
});
