// Round-3 API: logical sides (Drawer, Toaster), ref and root attributes on charts, Button leading/trailing, ColorField and Select labels.
import { afterEach, expect, it } from "vitest";
import { createRef } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { ColorField } from "../../src/components/color-picker/color-picker";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "../../src/components/drawer/drawer";
import { Select } from "../../src/components/select/select";
import { ToastProvider, Toaster, useToast } from "../../src/components/toast/toast";
import { LineChart } from "../../src/components/charts/line-chart";
import { Sparkline } from "../../src/components/charts/sparkline";
import { BarChart } from "../../src/components/charts/bar-chart";
import { DonutChart } from "../../src/components/charts/donut-chart";
import { FunnelChart } from "../../src/components/charts/funnel-chart";
import { renderUi } from "../render";

afterEach(() => {
  document.documentElement.removeAttribute("dir");
});

function Opener({ side }: { side: "start" | "end" | "left" | "right" }) {
  return (
    <Drawer side={side}>
      <DrawerTrigger render={<Button />}>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>T</DrawerTitle>
        <DrawerDescription>D</DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
}

const edge = (value: "start" | "end" | "left" | "right", dir: "ltr" | "rtl") => async () => {
  document.documentElement.setAttribute("dir", dir);
  renderUi(<Opener side={value} />);
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  await expect.poll(() => document.querySelector("[data-side]")?.getAttribute("data-side")).not.toBeUndefined();
  return document.querySelector("[data-side]")?.getAttribute("data-side");
};

it("Drawer side start / end follow the text direction; left / right stay physical", async () => {
  expect(await edge("start", "ltr")()).toBe("left");
});
it("Drawer end in rtl is the left edge", async () => {
  expect(await edge("end", "rtl")()).toBe("left");
});
it("Drawer start in rtl is the right edge", async () => {
  expect(await edge("start", "rtl")()).toBe("right");
});
it("Drawer left stays left in rtl", async () => {
  expect(await edge("left", "rtl")()).toBe("left");
});

function Toasts({ position }: { position: "top-start" | "bottom-end" | "top-left" }) {
  return (
    <ToastProvider timeout={0}>
      <Show />
      <Toaster position={position} />
    </ToastProvider>
  );
}
function Show() {
  const toast = useToast();
  return <Button onClick={() => toast.info("Hi")}>go</Button>;
}
const toastCorner = async (position: "top-start" | "bottom-end" | "top-left", dir: "ltr" | "rtl") => {
  document.documentElement.setAttribute("dir", dir);
  renderUi(<Toasts position={position} />);
  await userEvent.click(screen.getByRole("button", { name: "go" }));
  await expect.poll(() => document.querySelector("[data-position]")).not.toBeNull();
  return document.querySelector("[data-position]")?.getAttribute("data-position");
};

it("Toaster top-start is top-left in ltr and top-right in rtl", async () => {
  expect(await toastCorner("top-start", "rtl")).toBe("top-right");
});
it("Toaster bottom-end is bottom-left in rtl", async () => {
  expect(await toastCorner("bottom-end", "rtl")).toBe("bottom-left");
});
it("Toaster top-left stays physical in rtl", async () => {
  expect(await toastCorner("top-left", "rtl")).toBe("top-left");
});

it("charts forward ref, id, data attributes and handlers to their root element", () => {
  const ref = createRef<HTMLDivElement>();
  const donut = createRef<HTMLDivElement>();
  const spark = createRef<HTMLDivElement>();
  renderUi(
    <>
      <LineChart
        ref={ref}
        id="line-root"
        data-testid="line"
        data={[
          { m: "a", v: 1 },
          { m: "b", v: 2 },
        ]}
        index="m"
        series={[{ key: "v", label: "V" }]}
        aria-label="Line"
      />
      <BarChart
        data-testid="bar"
        data={[{ m: "a", v: 1 }]}
        index="m"
        series={[{ key: "v", label: "V" }]}
        aria-label="Bar"
      />
      <Sparkline ref={spark} data-testid="spark" values={[1, 2, 3]} aria-label="Spark" />
      <DonutChart
        ref={donut}
        data-testid="donut"
        data={[
          { label: "A", value: 2 },
          { label: "B", value: 3 },
        ]}
        aria-label="Donut"
      />
      <FunnelChart
        data-testid="funnel"
        data={[
          { label: "Visit", value: 10 },
          { label: "Buy", value: 4 },
        ]}
        aria-label="Funnel"
      />
    </>,
  );
  expect(ref.current).toBe(screen.getByTestId("line"));
  expect(screen.getByTestId("line")).toHaveAttribute("id", "line-root");
  expect(spark.current).toBe(screen.getByTestId("spark"));
  expect(donut.current).toBe(screen.getByTestId("donut"));
  expect(screen.getByTestId("bar")).toBeInTheDocument();
  expect(screen.getByTestId("funnel")).toBeInTheDocument();
});

it("Button takes leading and trailing icons", () => {
  renderUi(
    <Button leading={<i data-testid="l" />} trailing={<i data-testid="t" />}>
      Go
    </Button>,
  );
  expect(screen.getByTestId("l")).toBeInTheDocument();
  expect(screen.getByTestId("t")).toBeInTheDocument();
});

it("Select labels translate the placeholder and the ungrouped heading", () => {
  renderUi(<Select label="Fruit" labels={{ placeholder: "Choisir" }} items={[{ value: "a", label: "Pomme" }]} />);
  expect(screen.getByRole("combobox", { name: /Fruit/ })).toHaveTextContent("Choisir");
});

it("ColorField takes the swatch button name from labels.open", () => {
  renderUi(<ColorField label="Accent" defaultValue="#7c5cff" labels={{ open: "Ouvrir" }} />);
  expect(screen.getByRole("button", { name: "Ouvrir" })).toBeInTheDocument();
});
