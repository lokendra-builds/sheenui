import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Alert } from "../../src/components/alert/alert";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("shows the title and message, and warns and errors are alerts while info and success are status messages", () => {
    renderUi(
      <>
        <Alert tone="info" title="Heads up">
          Info text
        </Alert>
        <Alert tone="success" title="Saved">
          Success text
        </Alert>
        <Alert tone="warning" title="Careful">
          Warning text
        </Alert>
        <Alert tone="danger" title="Failed">
          Danger text
        </Alert>
      </>,
      variant,
    );
    expect(screen.getAllByRole("alert").map((a) => a.textContent)).toEqual([
      "CarefulWarning text",
      "FailedDanger text",
    ]);
    expect(screen.getAllByRole("status").map((a) => a.getAttribute("data-tone"))).toEqual(["info", "success"]);
    expect(screen.getByText("Info text")).toBeInTheDocument();
  });

  it("role can be overridden, and role none drops the live region", () => {
    renderUi(
      <>
        <Alert tone="danger" role="status">
          Calm
        </Alert>
        <Alert tone="info" role="none" data-testid="plain">
          Static
        </Alert>
      </>,
      variant,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Calm");
    expect(screen.getByTestId("plain")).not.toHaveAttribute("role");
  });

  it("renders an action, hides the icon on request and keeps the action a real tab stop", async () => {
    const onClick = vi.fn();
    renderUi(
      <Alert title="Trial" icon={false} action={<button onClick={onClick}>Upgrade</button>}>
        Ends soon
      </Alert>,
      variant,
    );
    expect(document.querySelector("[data-slot='alert'] svg")).toBeNull();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Upgrade" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("dismissible adds a named close button that hides the alert and reports it", async () => {
    const onOpenChange = vi.fn();
    renderUi(
      <Alert dismissible onOpenChange={onOpenChange} title="Gone soon">
        Bye
      </Alert>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(() => screen.queryByText("Gone soon")).toBeNull();
  });

  it("labels translate the dismiss button; open controls visibility", () => {
    const { rerender } = renderUi(
      <Alert dismissible open labels={{ dismiss: "Fermer" }}>
        Texte
      </Alert>,
      variant,
    );
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
    rerender(
      <Alert dismissible open labels={{ dismiss: "Fermer" }}>
        Texte
      </Alert>,
    );
    expect(screen.getByText("Texte")).toBeInTheDocument();
  });

  it("controlled open={false} renders nothing", () => {
    renderUi(<Alert open={false}>Hidden</Alert>, variant);
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("has no axe violations in every tone", async () => {
    renderUi(
      <div>
        <Alert tone="info" title="Info" dismissible>
          Body
        </Alert>
        <Alert tone="success" title="Success">
          Body
        </Alert>
        <Alert tone="warning" title="Warning" action={<button>Fix</button>}>
          Body
        </Alert>
        <Alert tone="danger" title="Danger">
          Body
        </Alert>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
