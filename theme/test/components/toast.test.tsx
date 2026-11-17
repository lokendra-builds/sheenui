import { expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { ToastProvider, Toaster, useToast, type ToastPosition } from "../../src/components/toast/toast";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Demo({ position, timeout }: { position?: ToastPosition; timeout?: number }) {
  return (
    <ToastProvider timeout={timeout}>
      <Buttons />
      <Toaster position={position} />
    </ToastProvider>
  );
}

function Buttons() {
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast.info("Heads up", "Something happened")}>info</Button>
      <Button onClick={() => toast.success("Saved", "Your changes are in")}>success</Button>
      <Button onClick={() => toast.error("Failed")}>error</Button>
      <Button onClick={() => toast.dismiss()}>dismiss-all</Button>
    </>
  );
}

const viewport = () => document.querySelector<HTMLElement>("[data-position]");

describeVariants((variant) => {
  it("shows a toast with title and description from useToast().info/success/error", async () => {
    renderUi(<Demo timeout={0} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "info" }));
    await expect.poll(viewport).not.toBeNull();
    await expect.poll(() => within(viewport()!).queryByText("Heads up")).not.toBeNull();
    expect(within(viewport()!).getByText("Something happened")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "success" }));
    await expect.poll(() => within(viewport()!).queryByText("Saved")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "error" }));
    await expect.poll(() => within(viewport()!).queryByText("Failed")).not.toBeNull();
    // Base UI hides the close buttons from AT until the stack is expanded or one has focus.
    expect(within(viewport()!).getAllByLabelText("Dismiss").length).toBeGreaterThanOrEqual(3);
  });

  it("the Dismiss button removes a toast and keyboard users can reach it", async () => {
    renderUi(<Demo timeout={0} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "success" }));
    await expect.poll(() => screen.queryByText("Saved")).not.toBeNull();
    // Tab from the toast itself to its Dismiss button (which becomes visible to AT once focused).
    screen.getByRole("dialog").focus();
    await userEvent.tab();
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    expect(dismiss).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => screen.queryByText("Saved")).toBeNull();
  });

  it("toast.dismiss() with no id closes every toast", async () => {
    renderUi(<Demo timeout={0} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "info" }));
    await userEvent.click(screen.getByRole("button", { name: "error" }));
    await expect.poll(() => screen.queryByText("Failed")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "dismiss-all" }));
    await expect.poll(() => screen.queryByText("Heads up")).toBeNull();
    await expect.poll(() => screen.queryByText("Failed")).toBeNull();
  });

  it("auto-dismisses after the provider timeout", async () => {
    renderUi(<Demo timeout={400} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "info" }));
    await expect.poll(() => screen.queryByText("Heads up")).not.toBeNull();
    await expect.poll(() => screen.queryByText("Heads up"), { timeout: 4000 }).toBeNull();
  });

  it.each<ToastPosition>(["top-right", "top-center", "top-left", "bottom-right", "bottom-center", "bottom-left"])(
    "position=%s is reflected on the viewport",
    async (position) => {
      renderUi(<Demo position={position} timeout={0} />, variant);
      await userEvent.click(screen.getByRole("button", { name: "info" }));
      await expect.poll(() => viewport()?.getAttribute("data-position")).toBe(position);
    },
  );

  it("has no axe violations with a stack of toasts", async () => {
    renderUi(<Demo timeout={0} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "info" }));
    await userEvent.click(screen.getByRole("button", { name: "success" }));
    await expect.poll(() => screen.queryByText("Saved")).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });

  it("gives each toast type its own status glow and keeps the glass rim on the toast's own box", async () => {
    renderUi(<Demo timeout={0} />, variant);
    await userEvent.click(screen.getByRole("button", { name: "success" }));
    await expect.poll(() => screen.queryByText("Saved")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "error" }));
    await expect.poll(() => screen.queryByText("Failed")).not.toBeNull();
    await settle();
    const glowOf = (title: string) => {
      const root = screen.getByText(title).closest<HTMLElement>("[data-slot='toast']")!;
      const content = root.firstElementChild!;
      // The glow is a gradient on the content, fed by --glow; it never touches opacity or the glass wrapper.
      expect(getComputedStyle(content).backgroundImage).toContain("radial-gradient");
      expect(getComputedStyle(root).opacity).toBe("1");
      return getComputedStyle(root).getPropertyValue("--glow").trim();
    };
    const success = glowOf("Saved");
    const danger = glowOf("Failed");
    expect(success).not.toBe("");
    expect(danger).not.toBe("");
    expect(success).not.toBe(danger);
    // The hover bridge is ::before, so the lit rim (::after) fills the toast and is not squeezed into a bar.
    const root = screen.getByText("Saved").closest<HTMLElement>("[data-slot='toast']")!;
    expect(getComputedStyle(root, "::after").position).toBe("absolute");
    expect(getComputedStyle(root, "::before").position).toBe("absolute");
    const rimHeight = parseFloat(getComputedStyle(root, "::after").height);
    expect(rimHeight).toBeGreaterThan(root.offsetHeight - 6);
    expect(rimHeight).toBeLessThanOrEqual(root.offsetHeight);
  });
});
