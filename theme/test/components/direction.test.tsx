import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { useResolvedDirection } from "../../src/hooks/use-direction";

function Probe({ prop }: { prop?: "ltr" | "rtl" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const dir = useResolvedDirection(prop, ref);
  return (
    <span ref={ref} data-testid="probe">
      {dir}
    </span>
  );
}
function Plain() {
  return <span data-testid="plain">{useResolvedDirection()}</span>;
}

describe("one direction source", () => {
  it("honours the nearest dir ancestor and follows a runtime flip", async () => {
    render(
      <div dir="rtl" data-testid="box">
        <Probe />
      </div>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("rtl");
    act(() => screen.getByTestId("box").setAttribute("dir", "ltr"));
    await expect.poll(() => screen.getByTestId("probe").textContent).toBe("ltr");
  });

  it("an inner dir wins over an outer one", () => {
    render(
      <div dir="rtl">
        <div dir="ltr">
          <Probe />
        </div>
      </div>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("ltr");
  });

  it("the prop wins, then the DirectionProvider, then <html dir> for a surface without a ref", async () => {
    render(
      <DirectionProvider direction="rtl">
        <Probe prop="ltr" />
        <Plain />
      </DirectionProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("ltr");
    expect(screen.getByTestId("plain")).toHaveTextContent("rtl");
    document.documentElement.setAttribute("dir", "rtl");
    try {
      render(<Plain />);
      await expect.poll(() => screen.getAllByTestId("plain").at(-1)?.textContent).toBe("rtl");
    } finally {
      document.documentElement.removeAttribute("dir");
    }
  });
});
