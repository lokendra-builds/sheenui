// BentoGrid, BentoCell and the five live demos (chart, toasts, OTP, glass switches, avatars) plus FeatureBento.

import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  BentoAvatarDemo,
  BentoCell,
  BentoChartDemo,
  BentoGrid,
  BentoOtpDemo,
  BentoSwitchDemo,
  BentoToastDemo,
  FeatureBento,
  useBentoCellVisible,
} from "../../src/blocks/bento-grid";
import { settle, frames } from "../helpers";
import { renderUi, runAxe } from "../render";

afterEach(() => {
  vi.restoreAllMocks();
});

const wide = (ui: React.ReactElement) => <div style={{ width: 1000 }}>{ui}</div>;

describe("BentoGrid + BentoCell", () => {
  it("a cell is a labelled group with a heading, description, icon and visual; the heading level is configurable", async () => {
    renderUi(
      wide(
        <BentoGrid className="outer" gridClassName="inner">
          <BentoCell
            title="Fast"
            description="Very fast"
            icon={<i data-testid="icon" />}
            visual={<i data-testid="visual" />}
            headingLevel={4}
            colSpan={2}
            rowSpan={2}
            orientation="horizontal"
            visualClassName="vis"
          />
          <BentoCell title="Plain" />
        </BentoGrid>,
      ),
    );
    expect(document.querySelector("[data-slot=bento-grid]")).toHaveClass("outer");
    expect(screen.getByRole("heading", { level: 4, name: "Fast" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Plain" })).toBeInTheDocument();
    expect(screen.getByText("Very fast")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    // The visual mounts once the cell is on screen.
    expect(await screen.findByTestId("visual")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /Fast/ })).toBeInTheDocument();
  });

  it('a cell with href has one link whose text is the call to action ("Learn more" unless set)', () => {
    renderUi(
      wide(
        <BentoGrid>
          <BentoCell title="Docs" description="Read" href="/docs" cta="Open the docs" />
          <BentoCell title="Blog" href="/blog" />
        </BentoGrid>,
      ),
    );
    expect(screen.getByRole("link", { name: /Open the docs/ })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("link", { name: /Learn more/ })).toHaveAttribute("href", "/blog");
  });

  it("useBentoCellVisible is true by default and follows the cell on screen", async () => {
    function Probe() {
      return <output data-testid="vis">{String(useBentoCellVisible())}</output>;
    }
    renderUi(wide(<Probe />));
    expect(screen.getByTestId("vis")).toHaveTextContent("true");
    renderUi(
      wide(
        <BentoGrid>
          <BentoCell title="Inside" visual={<Probe />} index={3} />
        </BentoGrid>,
      ),
    );
    await expect.poll(() => screen.getAllByTestId("vis").map((n) => n.textContent)).toContain("true");
  });

  it("works with reduced motion", () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(
      wide(
        <BentoGrid>
          <BentoCell title="Calm" description="No springs" />
        </BentoGrid>,
      ),
    );
    expect(screen.getByRole("heading", { name: "Calm" })).toBeInTheDocument();
  });
});

describe("BentoChartDemo", () => {
  it("shows the total and change for the middle period, and switching periods updates both and the trend's name", async () => {
    renderUi(wide(<BentoChartDemo />));
    const group = screen.getByRole("radiogroup", { name: "Period" });
    expect(within(group).getByRole("radio", { name: "Last 30 days" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("img", { name: /Revenue trend, last 30 days, up 12\.4%/ })).toBeInTheDocument();
    expect(document.body.textContent).toContain("$48.3K");
    await userEvent.click(within(group).getByRole("radio", { name: "Last 90 days" }));
    expect(screen.getByRole("img", { name: /last 90 days, down 3\.6%/ })).toBeInTheDocument();
    expect(document.body.textContent).toContain("$139.9K");
    await userEvent.click(within(group).getByRole("radio", { name: "Last 7 days" }));
    expect(screen.getByRole("img", { name: /last 7 days, up 8\.2%/ })).toBeInTheDocument();
  });

  it("radios work from the keyboard (arrows), and custom data, currency, locale and labels are honoured", async () => {
    renderUi(
      wide(
        <BentoChartDemo
          data={{
            "1d": { total: 1000, change: 0, values: [1, 2, 3] },
            "2w": { total: 2000, change: -10, values: [3, 2, 1] },
          }}
          currency="EUR"
          locale="de-DE"
          labels={{ metric: "Umsatz", period: "Zeitraum", periodName: (k) => `Zeit ${k}`, periodShort: (k) => k }}
        />,
      ),
    );
    const group = screen.getByRole("radiogroup", { name: "Zeitraum" });
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-label"))).toEqual(["Zeit 1d", "Zeit 2w"]);
    expect(screen.getByText("Umsatz")).toBeInTheDocument();
    radios[1]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => radios[0]!.getAttribute("aria-checked")).toBe("true");
    expect(document.body.textContent).toMatch(/1\s?Tsd|1\.000|1000/);
  });

  it("renders nothing when it has no data", () => {
    const { container } = renderUi(<BentoChartDemo data={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("with reduced motion the total is there at once", () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(wide(<BentoChartDemo />));
    expect(document.body.textContent).toContain("$48.3K");
  });
});

describe("BentoToastDemo", () => {
  it("sends sample notifications into a stack; the group is labelled and each notification keeps its text", async () => {
    renderUi(wide(<BentoToastDemo />));
    const stack = screen.getByRole("group", { name: "Sample notifications" });
    await expect
      .poll(() => within(stack).queryAllByText(/Deploy finished|New comment|Payment received/).length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
    const before = stack.textContent;
    await userEvent.click(screen.getByRole("button", { name: "Send notification" }));
    await expect.poll(() => stack.textContent, { timeout: 4000 }).not.toBe(before);
  });

  it("many sends keep only the newest few, and hovering or focusing the stack fans it out", async () => {
    renderUi(
      wide(
        <BentoToastDemo
          notifications={[{ tone: "danger", title: "Only one", description: "Repeat" }]}
          labels={{ region: "Alerts", send: "Push" }}
        />,
      ),
    );
    const stack = screen.getByRole("group", { name: "Alerts" });
    const push = screen.getByRole("button", { name: "Push" });
    for (let i = 0; i < 6; i++) await userEvent.click(push);
    await userEvent.hover(stack);
    await expect.poll(() => within(stack).queryAllByText("Only one").length, { timeout: 4000 }).toBeGreaterThan(0);
    await userEvent.unhover(stack);
  });

  it("works with reduced motion", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(wide(<BentoToastDemo />));
    await userEvent.click(screen.getByRole("button", { name: "Send notification" }));
    expect(screen.getByRole("group", { name: "Sample notifications" })).toBeInTheDocument();
  });
});

describe("BentoOtpDemo", () => {
  it("the right code verifies and offers Try again, which resets and refocuses the first slot", async () => {
    renderUi(wide(<BentoOtpDemo />));
    const group = screen.getByRole("group");
    expect(within(group).getAllByRole("textbox").length + group.querySelectorAll("input").length).toBeGreaterThan(0);
    const first = group.querySelector<HTMLInputElement>("input:not([aria-hidden=true])")!;
    first.focus();
    await userEvent.keyboard("2468");
    expect(await screen.findByText("Verified. Welcome in.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await expect.poll(() => screen.queryByText("Verified. Welcome in.")).toBeNull();
    expect(screen.getByText("Hint: the code is 2468")).toBeInTheDocument();
    await expect.poll(() => document.activeElement?.tagName).toBe("INPUT");
  });

  it("a wrong code says so, and typing again clears it; a custom code and labels work", async () => {
    renderUi(wide(<BentoOtpDemo code="123456" labels={{ error: "Nope", hint: (c) => `Code ${c}`, label: "OTP" }} />));
    expect(screen.getByText("Code 123456")).toBeInTheDocument();
    const slots = document.querySelectorAll<HTMLInputElement>("input:not([aria-hidden=true])");
    expect(slots.length).toBeGreaterThanOrEqual(6);
    slots[0]!.focus();
    await userEvent.keyboard("000000");
    expect(await screen.findByText("Nope")).toBeInTheDocument();
    await userEvent.keyboard("{Backspace}");
    await expect.poll(() => screen.queryByText("Nope")).toBeNull();
  });
});

describe("BentoSwitchDemo", () => {
  it("three switches control a live glass preview; tint depends on frost", async () => {
    renderUi(wide(<BentoSwitchDemo />));
    const preview = screen.getByRole("img", { name: "Glass preview" });
    const tile = () => preview.querySelector("span.relative")!;
    expect(tile()).toHaveClass("glass-2", "glass-tint");
    const frost = screen.getByRole("switch", { name: "Frosted glass" });
    const tint = screen.getByRole("switch", { name: "Accent tint" });
    const float = screen.getByRole("switch", { name: "Float" });
    expect(frost).toBeChecked();
    await userEvent.click(tint);
    expect(tile()).not.toHaveClass("glass-tint");
    await userEvent.click(tint);
    await userEvent.click(frost);
    expect(tile()).not.toHaveClass("glass-2");
    expect(tint).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(float);
    expect(tile().className).not.toContain("sheen-float");
    expect(float).not.toBeChecked();
  });

  it("labels translate everything", () => {
    renderUi(
      wide(
        <BentoSwitchDemo
          labels={{ preview: "Vorschau", frost: "Milchglas", tint: "Tönung", float: "Schweben", sample: "Ab" }}
        />,
      ),
    );
    expect(screen.getByRole("img", { name: "Vorschau" })).toHaveTextContent("Ab");
    expect(screen.getByRole("switch", { name: "Milchglas" })).toBeInTheDocument();
  });
});

describe("BentoAvatarDemo", () => {
  it("names who is editing, grows with Invite teammate, and resets once everyone is in", async () => {
    renderUi(wide(<BentoAvatarDemo people={["Maya Chen", "Leo Park", "Ava Singh", "Noah Kim"]} extra={5} />));
    const group = screen.getByRole("group");
    expect(group).toHaveAccessibleName("Maya, Leo and 1 more are editing");
    expect(within(group).getByText("and 5 more people")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Invite teammate" }));
    await expect
      .poll(() => screen.getByRole("group").getAttribute("aria-label"))
      .toBe("Maya, Leo and 2 more are editing");
    const reset = await screen.findByRole("button", { name: "Reset" });
    await userEvent.click(reset);
    await expect
      .poll(() => screen.getByRole("group").getAttribute("aria-label"))
      .toBe("Maya, Leo and 1 more are editing");
  });

  it("with no extras, few people and custom labels it reads naturally", () => {
    const view = renderUi(wide(<BentoAvatarDemo people={["Maya Chen"]} extra={0} />));
    expect(screen.getByRole("group")).toHaveAccessibleName("Maya is editing");
    view.unmount();
    renderUi(
      wide(
        <BentoAvatarDemo
          people={["A One", "B Two", "C Three", "D Four"]}
          extra={0}
          labels={{ invite: "Einladen", here: (n) => `${n.length} da` }}
        />,
      ),
    );
    expect(screen.getByRole("button", { name: "Einladen" })).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveAccessibleName("3 da");
  });
});

describe("FeatureBento", () => {
  /** Cells mount their demos when they scroll into view: visit each one. */
  async function reveal() {
    for (const h of screen.getAllByRole("heading", { level: 3 })) {
      h.scrollIntoView({ block: "center" });
      await frames(8);
    }
  }

  it("is a titled section with five cells, each holding a working demo", async () => {
    renderUi(wide(<FeatureBento title="Everything" description="All of it" />));
    expect(screen.getByRole("heading", { level: 2, name: "Everything" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    await reveal();
    expect(screen.getByRole("radiogroup", { name: "Period" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send notification" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Frosted glass" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite teammate" })).toBeInTheDocument();
  });

  it("headingLevel 3 pushes the cells to level 4, and labels override the cell texts", () => {
    renderUi(wide(<FeatureBento title="Everything" description="All" headingLevel={3} />));
    expect(screen.getByRole("heading", { level: 3, name: "Everything" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(5);
  });

  it("has no axe violations", async () => {
    renderUi(wide(<FeatureBento title="Everything" description="All of it" />));
    await reveal();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  }, 20000);
});
