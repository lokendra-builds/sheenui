import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { ToastProvider, Toaster, useToast } from "../../src/components/toast/toast";
import { createToastQueue } from "../../src/components/toast/toast-gate";

it("the queue runs held calls once, in order", () => {
  const queue = createToastQueue();
  const order: number[] = [];
  queue.push(() => order.push(1));
  queue.push(() => order.push(2));
  expect(queue.size()).toBe(2);
  queue.flush();
  queue.flush();
  expect(order).toEqual([1, 2]);
  expect(queue.size()).toBe(0);
});

function Fire() {
  const toast = useToast();
  return <button onClick={() => void toast.info("Held toast")}>fire</button>;
}

it("holds a toast raised before the viewport is ready, asks for it, and shows it once ready", async () => {
  const needed = vi.fn();
  const tree = (ready: boolean) => (
    <ToastProvider timeout={0} viewportReady={ready} onViewportNeeded={needed}>
      <Fire />
      {ready ? <Toaster /> : null}
    </ToastProvider>
  );
  const { rerender } = render(tree(false));
  await userEvent.click(screen.getByRole("button", { name: "fire" }));
  expect(needed).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Held toast")).toBeNull();
  rerender(tree(true));
  await expect.poll(() => screen.queryByText("Held toast")).not.toBeNull();
});
