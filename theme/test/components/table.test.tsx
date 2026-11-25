import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/table/table";
import { describeVariants, renderUi, runAxe } from "../render";

function Example({ wide = false, ...props }: { wide?: boolean } & Partial<React.ComponentProps<typeof Table>>) {
  return (
    <div style={{ width: 240 }}>
      <Table {...props}>
        <TableCaption>Plan limits</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Plan</TableHead>
            <TableHead scope="col">Seats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell style={wide ? { minWidth: 600 } : undefined}>Free</TableCell>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

describeVariants((variant) => {
  it("className and ref belong to the outer region; tableClassName and other attributes to the <table>", () => {
    let region: HTMLDivElement | null = null;
    renderUi(
      <Example
        className="outer-x"
        tableClassName="inner-x"
        id="plans"
        ref={(node) => {
          region = node;
        }}
      />,
      variant,
    );
    const table = screen.getByRole("table");
    expect(table).toHaveClass("inner-x");
    expect(table).not.toHaveClass("outer-x");
    expect(table).toHaveAttribute("id", "plans");
    expect(region).toHaveClass("outer-x");
    expect(region).toBe(table.parentElement);
  });

  it("is a tab stop only while it overflows, and then a region named by the caption", async () => {
    const view = renderUi(<Example />, variant);
    const region = screen.getByRole("table").parentElement!;
    await expect.poll(() => region.hasAttribute("tabindex")).toBe(false);
    expect(region).not.toHaveAttribute("role");
    view.rerender(<Example wide />);
    await expect.poll(() => region.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("region", { name: "Plan limits" })).toBe(region);
    view.rerender(<Example wide regionLabel="Limits" />);
    await expect.poll(() => region.getAttribute("aria-label")).toBe("Limits");
  });

  it("has no axe violations", async () => {
    const view = renderUi(<Example wide />, variant);
    expect(await runAxe(view.container)).toHaveNoViolations();
  });
});
