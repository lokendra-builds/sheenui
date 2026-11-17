import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Alert } from "../../src/components/alert/alert";
import { AspectRatio } from "../../src/components/aspect-ratio/aspect-ratio";
import { ButtonGroup } from "../../src/components/button-group/button-group";
import { Button } from "../../src/components/button/button";
import { Collapsible } from "../../src/components/collapsible/collapsible";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../src/components/input-group/input-group";
import { NavigationMenu, NavigationMenuList } from "../../src/components/navigation-menu/navigation-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../src/components/resizable/resizable";
import { Sidebar, SidebarItem } from "../../src/components/sidebar/sidebar";
import { Spinner } from "../../src/components/spinner/spinner";
import { Table, TableBody, TableCell, TableRow } from "../../src/components/table/table";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("AspectRatio keeps its ratio at any width and forwards className, ref and render", () => {
    const ref = createRef<HTMLDivElement>();
    renderUi(
      <div style={{ width: 320 }}>
        <AspectRatio ratio={16 / 9} className="rounded-sheen-lg" ref={ref} data-testid="box" />
        <AspectRatio ratio={1} render={<figure />} data-testid="fig" />
      </div>,
      variant,
    );
    const box = screen.getByTestId("box");
    const { width, height } = box.getBoundingClientRect();
    expect(Math.round((width / height) * 100)).toBe(Math.round((16 / 9) * 100));
    expect(box).toHaveClass("rounded-sheen-lg");
    expect(ref.current).toBe(box);
    expect(screen.getByTestId("fig").tagName).toBe("FIGURE");
  });

  it("InputGroup: addons and input in one labelled group; size, invalid and focus", async () => {
    renderUi(
      <InputGroup size="lg" invalid data-testid="group">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" aria-invalid />
        <InputGroupAddon align="end">.com</InputGroupAddon>
      </InputGroup>,
      variant,
    );
    const group = screen.getByTestId("group");
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveAttribute("data-invalid");
    expect(Math.round(group.getBoundingClientRect().height)).toBe(48);
    await userEvent.tab();
    expect(screen.getByRole("textbox", { name: "Domain" })).toHaveFocus();
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByText(".com")).toHaveAttribute("data-align", "end");
  });

  it("Resizable: arrow keys move the handle inside the limits; Home and End jump; layout is reported", async () => {
    const onLayoutChange = vi.fn();
    renderUi(
      <ResizablePanelGroup className="h-40 w-[400px]" onLayoutChange={onLayoutChange}>
        <ResizablePanel defaultSize={40} minSize={20} maxSize={70} data-testid="a">
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel data-testid="b">B</ResizablePanel>
      </ResizablePanelGroup>,
      variant,
    );
    const handle = screen.getByRole("separator", { name: "Resize panels" });
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("aria-valuenow", "40");
    expect(handle).toHaveAttribute("aria-valuemin", "20");
    expect(handle).toHaveAttribute("aria-valuemax", "70");
    await userEvent.tab();
    expect(handle).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("45");
    expect(onLayoutChange).toHaveBeenLastCalledWith([45, 55]);
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("20");
    await userEvent.keyboard("{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "20");
    await userEvent.keyboard("{End}");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("70");
    await userEvent.keyboard("{Home}");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("20");
  });

  it("Resizable: a vertical group uses the up and down arrows, controlled layout wins, labels translate", async () => {
    const { rerender } = renderUi(
      <ResizablePanelGroup
        orientation="vertical"
        layout={[50, 50]}
        className="h-48 w-40"
        labels={{ resize: "Redimensionner" }}
      >
        <ResizablePanel>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>B</ResizablePanel>
      </ResizablePanelGroup>,
      variant,
    );
    const handle = screen.getByRole("separator", { name: "Redimensionner" });
    expect(handle).toHaveAttribute("aria-orientation", "horizontal");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    // Controlled: the owner has not updated `layout`, so the size stays.
    expect(handle).toHaveAttribute("aria-valuenow", "50");
    rerender(
      <ResizablePanelGroup
        orientation="vertical"
        layout={[60, 40]}
        className="h-48 w-40"
        labels={{ resize: "Redimensionner" }}
      >
        <ResizablePanel>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(handle).toHaveAttribute("aria-valuenow", "60");
  });

  it("Resizable: a panel wrapped in your own component still registers, sizes and resizes", async () => {
    function Files() {
      return (
        <ResizablePanel defaultSize={30} data-testid="files">
          Files
        </ResizablePanel>
      );
    }
    renderUi(
      <ResizablePanelGroup className="h-32 w-[400px]">
        <Files />
        <ResizableHandle />
        <ResizablePanel>Editor</ResizablePanel>
      </ResizablePanelGroup>,
      variant,
    );
    const handle = screen.getByRole("separator");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("30");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("35");
    expect(Math.round(screen.getByTestId("files").getBoundingClientRect().width / 4)).toBe(35);
  });

  it("Resizable: a panel mounted later takes a share and gets its own handle in order", async () => {
    function Group() {
      const [extra, setExtra] = useState(false);
      return (
        <>
          <button onClick={() => setExtra(true)}>Add panel</button>
          <ResizablePanelGroup className="h-32 w-[400px]">
            <ResizablePanel defaultSize={50} data-testid="a">
              A
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel data-testid="b">B</ResizablePanel>
            {extra && <ResizableHandle />}
            {extra && <ResizablePanel data-testid="c">C</ResizablePanel>}
          </ResizablePanelGroup>
        </>
      );
    }
    renderUi(<Group />, variant);
    await expect.poll(() => screen.getAllByRole("separator")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Add panel" }));
    await expect.poll(() => screen.getAllByRole("separator")).toHaveLength(2);
    await expect.poll(() => screen.getByTestId("c").getAttribute("data-size")).not.toBe("0");
    const sizes = ["a", "b", "c"].map((id) => Number(screen.getByTestId(id).getAttribute("data-size")));
    expect(sizes.reduce((x, y) => x + y, 0)).toBeGreaterThanOrEqual(99);
    expect(sizes.every((n) => n > 0)).toBe(true);
    const [first, second] = screen.getAllByRole("separator");
    expect(first).toHaveAttribute("aria-controls", screen.getByTestId("a").id);
    expect(second).toHaveAttribute("aria-controls", screen.getByTestId("b").id);
  });

  it("Resizable: your pointer handlers run and never replace the drag", async () => {
    const onPointerUp = vi.fn();
    const onPointerMove = vi.fn();
    const onLayoutChange = vi.fn();
    renderUi(
      <ResizablePanelGroup className="h-32 w-[400px]" onLayoutChange={onLayoutChange}>
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle onPointerUp={onPointerUp} onPointerMove={onPointerMove} />
        <ResizablePanel>B</ResizablePanel>
      </ResizablePanelGroup>,
      variant,
    );
    const handle = screen.getByRole("separator");
    await expect.poll(() => handle.getAttribute("aria-valuenow")).toBe("50");
    const rect = handle.getBoundingClientRect();
    fireEvent.pointerDown(handle, {
      pointerId: 7,
      clientX: rect.x,
      clientY: rect.y + 5,
      pointerType: "mouse",
      buttons: 1,
    });
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: rect.x + 40, clientY: rect.y + 5, pointerType: "mouse" });
    expect(onPointerMove).toHaveBeenCalled();
    expect(onLayoutChange).toHaveBeenCalled();
    fireEvent.pointerUp(handle, { pointerId: 7, clientX: rect.x + 40, clientY: rect.y + 5, pointerType: "mouse" });
    expect(onPointerUp).toHaveBeenCalledTimes(1);
    // The drag ended: further moves change nothing.
    const calls = onLayoutChange.mock.calls.length;
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: rect.x + 120, clientY: rect.y + 5, pointerType: "mouse" });
    expect(onLayoutChange.mock.calls.length).toBe(calls);
  });

  it("the layout primitives are axe-clean", async () => {
    renderUi(
      <div>
        <ResizablePanelGroup className="h-24 w-64">
          <ResizablePanel>A</ResizablePanel>
          <ResizableHandle withGrip />
          <ResizablePanel>B</ResizablePanel>
        </ResizablePanelGroup>
        <InputGroup>
          <InputGroupInput aria-label="Amount" />
          <InputGroupAddon align="end">USD</InputGroupAddon>
        </InputGroup>
        <AspectRatio ratio={2}>
          <span>content</span>
        </AspectRatio>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });

  it("API rules: className lands on the outer element and ref reaches it, for the whole new family", () => {
    const refs = Array.from({ length: 8 }, () => createRef<never>());
    renderUi(
      <div>
        <Alert className="x-alert" ref={refs[0]}>
          a
        </Alert>
        <Spinner className="x-spinner" ref={refs[1]} />
        <Collapsible className="x-collapsible" ref={refs[2]} />
        <NavigationMenu className="x-nav" ref={refs[3]} aria-label="n">
          <NavigationMenuList />
        </NavigationMenu>
        <Sidebar className="x-sidebar" ref={refs[4]}>
          <SidebarItem href="#a">a</SidebarItem>
        </Sidebar>
        <Table className="x-table" ref={refs[5]}>
          <TableBody>
            <TableRow>
              <TableCell>c</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ButtonGroup className="x-group" ref={refs[6]}>
          <Button>b</Button>
        </ButtonGroup>
        <Button className="x-button" ref={refs[7]}>
          c
        </Button>
      </div>,
      variant,
    );
    ["x-alert", "x-spinner", "x-collapsible", "x-nav", "x-sidebar", "x-table", "x-group", "x-button"].forEach(
      (cls, i) => {
        const el = document.querySelector(`.${cls}`);
        expect(el, cls).not.toBeNull();
        expect(refs[i]!.current, cls).toBe(el);
      },
    );
  });
});
