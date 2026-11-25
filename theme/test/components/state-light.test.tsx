// State light: `data-state` on a surface lights one child layer (aura, light pool, lit edge) from the glow tokens.
// Each component maps its own state to data-state; the layer follows it, and reduced motion / transparency switch it off.

import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../../src/components/dialog/dialog";
import { Input } from "../../src/components/input/input";
import { OtpInput } from "../../src/components/otp-input/otp-input";
import {
  SideDrawer,
  SideDrawerContent,
  SideDrawerHeader,
  SideDrawerTrigger,
} from "../../src/components/side-drawer/side-drawer";
import { SideDrawerForm } from "../../src/components/side-drawer/side-drawer-form";
import { Switch } from "../../src/components/switch/switch";
import { ToastProvider, Toaster, useToast } from "../../src/components/toast/toast";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const layerOf = (el: Element) => el.querySelector<HTMLElement>(':scope > [data-slot="state-light"]');

describeVariants((variant) => {
  it("Button: loading is working; a passed state shows; off by default", async () => {
    const { rerender } = renderUi(<Button stateLight>Save</Button>, variant);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("data-state", "idle");
    expect(layerOf(btn)).toHaveAttribute("aria-hidden", "true");
    rerender(
      <Button stateLight loading>
        Save
      </Button>,
    );
    expect(btn).toHaveAttribute("data-state", "working");
    rerender(
      <Button stateLight data-state="success">
        Save
      </Button>,
    );
    expect(btn).toHaveAttribute("data-state", "success");
    await expect.poll(() => getComputedStyle(layerOf(btn)!).opacity).not.toBe("0");
    rerender(<Button loading>Save</Button>);
    expect(btn).not.toHaveAttribute("data-state");
    expect(layerOf(btn)).toBeNull();
    expect(await runAxe()).toHaveNoViolations();
  });

  it("OtpInput: status maps to data-state and lights the row", async () => {
    const { rerender } = renderUi(<OtpInput length={4} label="Code" />, variant);
    const row = () => document.querySelector<HTMLElement>('[data-slot="otp-input"] [data-status]')!;
    expect(row()).toHaveAttribute("data-state", "idle");
    expect(getComputedStyle(layerOf(row())!).opacity).toBe("0");
    rerender(<OtpInput length={4} label="Code" status="error" errorMessage="Wrong code" />);
    expect(row()).toHaveAttribute("data-state", "error");
    await expect.poll(() => Number(getComputedStyle(layerOf(row())!).opacity)).toBeGreaterThan(0);
    rerender(<OtpInput length={4} label="Code" status="success" successEffect="none" successMessage="Verified" />);
    expect(row()).toHaveAttribute("data-state", "success");
    rerender(<OtpInput length={4} label="Code" status="error" stateLight={false} />);
    expect(row()).not.toHaveAttribute("data-state");
    expect(layerOf(row())).toBeNull();
    expect(await runAxe()).toHaveNoViolations();
  });

  it("Switch: stateLight follows checked", async () => {
    renderUi(<Switch label="Sync" stateLight />, variant);
    const sw = screen.getByRole("switch", { name: "Sync" });
    expect(sw).toHaveAttribute("data-state", "idle");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("data-state", "on");
    expect(layerOf(sw)).not.toBeNull();
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("data-state", "idle");
    expect(await runAxe()).toHaveNoViolations();
  });

  it("Switch: no light by default", () => {
    renderUi(<Switch label="Sync" defaultChecked />, variant);
    const sw = screen.getByRole("switch", { name: "Sync" });
    expect(sw).not.toHaveAttribute("data-state");
    expect(layerOf(sw)).toBeNull();
  });

  it("Toast: type maps to data-state", async () => {
    function Buttons() {
      const toast = useToast();
      return (
        <>
          <Button onClick={() => toast.success("Saved")}>ok</Button>
          <Button onClick={() => toast.error("Failed")}>bad</Button>
          <Button onClick={() => toast.warning("Careful")}>warn</Button>
          <Button onClick={() => toast.info("FYI")}>info</Button>
        </>
      );
    }
    renderUi(
      <ToastProvider timeout={0}>
        <Buttons />
        <Toaster />
      </ToastProvider>,
      variant,
    );
    for (const [name, text, state] of [
      ["info", "FYI", "idle"],
      ["warn", "Careful", "warning"],
      ["bad", "Failed", "error"],
      ["ok", "Saved", "success"],
    ] as const) {
      await userEvent.click(screen.getByRole("button", { name }));
      const toast = (await screen.findByText(text)).closest<HTMLElement>('[data-slot="toast"]')!;
      expect(toast).toHaveAttribute("data-state", state);
      expect(layerOf(toast)).not.toBeNull();
    }
    expect(await runAxe()).toHaveNoViolations();
  });

  it("Dialog: stateLight puts the light on the popup; off by default", async () => {
    renderUi(
      <Dialog>
        <DialogTrigger render={<Button />}>Open</DialogTrigger>
        <DialogContent stateLight>
          <DialogTitle>Hello</DialogTitle>
        </DialogContent>
      </Dialog>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const popup = await screen.findByRole("dialog");
    expect(popup).toHaveAttribute("data-state", "on");
    expect(layerOf(popup)).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });

  it("SideDrawer: a saving form is working, a failed save error", async () => {
    let release: () => void = () => undefined;
    renderUi(
      <SideDrawer>
        <SideDrawerTrigger render={<Button />}>Open panel</SideDrawerTrigger>
        <SideDrawerContent>
          <SideDrawerHeader title="Edit profile" />
          <SideDrawerForm<{ name: string }>
            initialValues={{ name: "Ava" }}
            onSubmit={() => new Promise<void>((resolve) => (release = resolve))}
          >
            {(form) => <Input label="Name" {...form.field("name")} />}
          </SideDrawerForm>
        </SideDrawerContent>
      </SideDrawer>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open panel" }));
    const popup = await screen.findByRole("dialog");
    expect(popup).not.toHaveAttribute("data-state");
    expect(layerOf(popup)).not.toBeNull();
    const field = within(popup).getByRole("textbox", { name: "Name" });
    await userEvent.type(field, "x");
    await userEvent.click(within(popup).getByRole("button", { name: "Save" }));
    await expect.poll(() => popup.getAttribute("data-state")).toBe("working");
    release();
    await expect.poll(() => popup.getAttribute("data-state")).not.toBe("working");
  });
});

describe("state light: reduced motion and transparency", () => {
  it("reduced motion: no breathing and no transition; the light still shows", () => {
    reduceMotion();
    renderUi(
      <Button stateLight loading>
        Save
      </Button>,
    );
    const layer = layerOf(screen.getByRole("button", { name: "Save" }))!;
    const style = getComputedStyle(layer);
    expect(style.animationName).toBe("none");
    expect(parseFloat(style.transitionDuration)).toBeLessThanOrEqual(0.12);
    expect(Number(style.opacity)).toBeGreaterThan(0);
  });

  it("motion welcome: working breathes on opacity only", () => {
    document.documentElement.removeAttribute("data-motion");
    renderUi(
      <Button stateLight loading>
        Save
      </Button>,
    );
    const style = getComputedStyle(layerOf(screen.getByRole("button", { name: "Save" }))!);
    expect(style.transitionProperty).toBe("opacity");
  });

  it("reduced transparency: the layer is not drawn", () => {
    document.documentElement.setAttribute("data-transparency", "reduced");
    renderUi(
      <Button stateLight loading>
        Save
      </Button>,
    );
    expect(getComputedStyle(layerOf(screen.getByRole("button", { name: "Save" }))!).display).toBe("none");
    document.documentElement.removeAttribute("data-transparency");
  });
});
