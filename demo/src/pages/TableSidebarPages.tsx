import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@sheenui/theme";
import {
  AspectFigure,
  InputGroupField,
  ResizablePersisted,
  aspectFigureCode,
  inputGroupFieldCode,
  resizablePersistedCode,
} from "./PrimitiveExamples";
import { AspectGallery, ResizableWorkbench, aspectGalleryCode, resizableWorkbenchCode } from "./PrimitiveShowcases";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import type { TableScene as TableSceneData } from "../layout/ShowcaseStage.table";
import { TableScene } from "../layout/ShowcaseStage.table.scene";
import type { ResizableScene as ResizableSceneData } from "../layout/ShowcaseStage.resizable";
import { ResizableScene } from "../layout/ShowcaseStage.resizable.scene";
import type { AspectRatioScene as AspectRatioSceneData } from "../layout/ShowcaseStage.aspect-ratio";
import { AspectRatioScene } from "../layout/ShowcaseStage.aspect-ratio.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { InputGroupScene as InputGroupSceneData } from "../layout/ShowcaseStage.input-group";
import { InputGroupScene } from "../layout/ShowcaseStage.input-group.scene";
import * as PROPS from "../generated/component-props";
import { lazyBlock } from "../layout/lazy-block";

/** Page bodies that pull in Base UI popup code load as islands while the page hydrates. */
const island = { eager: true, minHeight: "80vh" };

/* ------------------------------------------------------------------ Table */

const tableCode = `
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@sheenui/theme";
export function Example() {
  return (
    <Table regionLabel="Plan limits table" tableClassName="min-w-64">
      <TableCaption>Plan limits</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Plan</TableHead>
          <TableHead scope="col" className="text-end">Seats</TableHead>
          <TableHead scope="col" className="text-end">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableHead scope="row">Free</TableHead><TableCell className="text-end">1</TableCell><TableCell className="text-end">$0</TableCell></TableRow>
        <TableRow><TableHead scope="row">Team</TableHead><TableCell className="text-end">10</TableCell><TableCell className="text-end">$29</TableCell></TableRow>
        <TableRow><TableHead scope="row">Business</TableHead><TableCell className="text-end">50</TableCell><TableCell className="text-end">$99</TableCell></TableRow>
      </TableBody>
      <TableFooter>
        <TableRow><TableCell colSpan={3} className="text-sheen-fg-muted">Prices per month, billed yearly.</TableCell></TableRow>
      </TableFooter>
    </Table>
  );
}`;

/** The "Table" docs page (/components/table). */
export function TablePage() {
  return (
    <Page
      eyebrow="Data display"
      title="Table"
      description="Plain, styled table primitives for small static tables: a plan comparison, a spec sheet. Real <table> elements in a glass region that scrolls sideways on narrow screens. For sorting, filtering or paging use the data table."
      source="theme/src/components/table/table.tsx"
      keyboard={[["Tab", "Focuses the scrolling region; the arrow keys then scroll it sideways without a mouse."]]}
      a11y={[
        'Native table semantics: use TableCaption (or aria-label) to name the table, and scope="col" or scope="row" on TableHead.',
        "The glass wrapper is a focusable region named by regionLabel, so a table wider than the screen can be scrolled from the keyboard (WCAG 2.1.1).",
        "Row hover tint is decoration only; nothing depends on it. Text keeps 4.5:1 on the glass.",
      ]}
    >
      <ShowcaseStage<TableSceneData>
        label="Table demo"
        story={() => import("../layout/ShowcaseStage.table")}
        initial={{ paid: 0 }}
        minHeight="27rem"
      >
        {(scene, ctx) => <TableScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Plan limits"
        description="Compose Table, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead and TableCell like HTML."
        code={tableCode}
      >
        <Table regionLabel="Plan limits table" tableClassName="min-w-64">
          <TableCaption>Plan limits</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Plan</TableHead>
              <TableHead scope="col" className="text-end">
                Seats
              </TableHead>
              <TableHead scope="col" className="text-end">
                Price
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableHead scope="row">Free</TableHead>
              <TableCell className="text-end">1</TableCell>
              <TableCell className="text-end">$0</TableCell>
            </TableRow>
            <TableRow>
              <TableHead scope="row">Team</TableHead>
              <TableCell className="text-end">10</TableCell>
              <TableCell className="text-end">$29</TableCell>
            </TableRow>
            <TableRow>
              <TableHead scope="row">Business</TableHead>
              <TableCell className="text-end">50</TableCell>
              <TableCell className="text-end">$99</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-sheen-fg-muted">
                Prices per month, billed yearly.
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Example>
      <PropsTable
        rows={[
          [
            "Table regionLabel",
            "string",
            "the text of the TableCaption",
            "Accessible name of the scrolling region while the table overflows; defaults to the caption's text.",
          ],
          [
            "Table className",
            "string",
            "",
            "Extra classes for the outer glass region that scrolls sideways (the root element).",
          ],
          [
            "Table tableClassName",
            "string",
            "",
            "Extra classes for the <table> itself. Other table attributes are forwarded.",
          ],
          [
            "TableCaption / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell",
            "element props",
            "",
            "Each is the matching HTML element with glass styling; props and className pass through.",
          ],
        ]}
      />
    </Page>
  );
}

/* ---------------------------------------------------------------- Sidebar */

/** The Sidebar page body: its own chunk (see island), so its demos stay out of the route's initial JavaScript. */
export const SidebarPage = lazyBlock(() => import("./SidebarPageBody").then((m) => m.SidebarPage), island);

/* ------------------------------------------------------------ AspectRatio */

/** The "Aspect ratio" docs page (/layout/aspect-ratio). */
export function AspectRatioPage() {
  return (
    <Page
      eyebrow="Layout"
      title="Aspect ratio"
      description="A box that keeps a fixed width-to-height ratio at any width, so images, video and maps reserve their space before they load and the page never jumps."
      source="theme/src/components/aspect-ratio/aspect-ratio.tsx"
      keyboard={[
        ["Tab", "Not focusable: it is a plain container. Anything focusable inside it keeps its own tab stop."],
      ]}
      a11y={[
        "No role of its own. Give the media inside it text: alt on an image, a title or caption on a video or map.",
        "It reserves space, which prevents layout shift (CLS) while content loads.",
        "Pass render to use another element, such as a figure. className and ref go on the box.",
      ]}
    >
      <ShowcaseStage<AspectRatioSceneData>
        label="Aspect ratio demo"
        story={() => import("../layout/ShowcaseStage.aspect-ratio")}
        initial={{ ratio: 16 / 9 }}
        minHeight="27rem"
      >
        {(scene, ctx) => <AspectRatioScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Screenshots, a video poster and a profile card"
        description="ratio is width divided by height. Images fill the box (size-full object-cover); overlays are positioned inside it. Every tile keeps its ratio at any width, so nothing jumps while images load."
        code={aspectGalleryCode}
      >
        <AspectGallery />
      </Example>
      <Example
        title="A figure with a caption"
        description="Reserve the space first, then fill it. Put the AspectRatio inside a figure so the caption belongs to it; the box keeps its ratio whatever the width of the figure."
        code={aspectFigureCode}
      >
        <AspectFigure />
      </Example>
      <PropsTable of={PROPS.AspectRatio} />
    </Page>
  );
}

/* ------------------------------------------------------------- InputGroup */

const inputGroupCode = `
import { Button, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Domain" placeholder="example" />
        <InputGroupAddon align="end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup size="lg">
        <InputGroupInput aria-label="Amount" inputMode="decimal" placeholder="0.00" />
        <InputGroupAddon align="end">USD</InputGroupAddon>
      </InputGroup>
      <InputGroup size="sm" invalid>
        <InputGroupInput aria-label="Coupon" aria-invalid defaultValue="SPRING" />
        <InputGroupAddon align="end">
          <Button variant="ghost" size="sm">Apply</Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}`;

/** The "Input group" docs page (/forms/input-group). */
export function InputGroupPage() {
  return (
    <Page
      eyebrow="Form"
      title="Input group"
      description="One field with things attached: a prefix, a suffix, a unit or a button, inside the same glass edge and sharing one focus ring."
      source="theme/src/components/input-group/input-group.tsx"
      keyboard={[
        ["Tab", "Focuses the input, then any button inside an addon."],
        ["Typing", "Works as in any text input; the addons are not focusable text."],
      ]}
      a11y={[
        'The group is role="group". Name the input with aria-label or a Field label: addon text is read as part of the page but is not the input\'s name unless you link it with aria-describedby.',
        "invalid shows the danger edge; set aria-invalid on the input too, so the state is not carried by colour alone.",
        "Icons in an addon should be aria-hidden; text such as https:// is read in order with the field.",
        "Height follows the shared control scale (sm 32px, md 40px, lg 48px; 44px for sm and md on touch screens).",
      ]}
    >
      <ShowcaseStage<InputGroupSceneData>
        label="Input group demo"
        story={() => import("../layout/ShowcaseStage.input-group")}
        initial={{ text: "", copied: false }}
        minHeight="14rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <InputGroupScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Prefix, suffix, unit and button"
        description="Compose InputGroupAddon and InputGroupInput in reading order. Use Input's leading and trailing for a single icon."
        code={inputGroupCode}
      >
        <div className="flex w-full max-w-sm flex-col gap-4">
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput aria-label="Domain" placeholder="example" />
            <InputGroupAddon align="end">
              <InputGroupText>.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup size="lg">
            <InputGroupInput aria-label="Amount" inputMode="decimal" placeholder="0.00" />
            <InputGroupAddon align="end">USD</InputGroupAddon>
          </InputGroup>
          <InputGroup size="sm" invalid>
            <InputGroupInput aria-label="Coupon" aria-invalid defaultValue="SPRING" />
            <InputGroupAddon align="end">
              <Button variant="ghost" size="sm">
                Apply
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </Example>
      <Example
        title="Inside a Field"
        description="Field wires the label, the description and the error to the input: wrap the InputGroupInput in FieldControl, and set invalid on both the Field and the group so the danger edge and the message agree."
        code={inputGroupFieldCode}
      >
        <InputGroupField />
      </Example>
      <PropsTable of={PROPS.InputGroup} title="InputGroup props" />
      <PropsTable of={PROPS.InputGroupAddon} title="InputGroupAddon props" as="h3" />
      <PropsTable
        title="Other parts"
        as="h3"
        rows={[
          ["InputGroupText", "span props", "", "Shows plain text inside an addon."],
          ["InputGroupInput", "input props", "", "The text field, as tall as the group, forwarding ref."],
        ]}
      />
    </Page>
  );
}

/* -------------------------------------------------------------- Resizable */

/** The "Resizable" docs page (/layout/resizable). */
export function ResizablePage() {
  return (
    <Page
      eyebrow="Layout"
      title="Resizable panels"
      description="Panels with draggable, keyboard-resizable handles between them: a file tree beside an editor, a list beside a detail pane, a console under a canvas. Groups nest."
      source="theme/src/components/resizable/resizable.tsx"
      keyboard={[
        ["Tab", "Focuses a handle."],
        ["← / →", "Move the focused handle (↑ / ↓ in a vertical group) by keyboardStep percent."],
        ["Shift + arrow", "Move it five times as far."],
        ["Home / End", "Send the handle to the limit of its range."],
        [
          "Step buttons",
          "Two buttons on the handle make the panel before it larger or smaller with a single press (the non-drag alternative); always visible on touch screens, shown on keyboard focus elsewhere.",
        ],
        ["Double click / double tap", "Puts the divider back where it started."],
      ]}
      a11y={[
        'Each handle is a role="separator" (the ARIA window splitter pattern) with aria-orientation, aria-valuenow (percent of the panel before it), aria-valuemin, aria-valuemax and aria-controls, named by labels.resize.',
        "Every drag has a keyboard equivalent; the grab area is 44px on touch screens and works with mouse, touch and pen.",
        "Panels never shrink below minSize or grow past maxSize, so content is not lost. In right-to-left pages the arrow keys and the drag follow the reading direction.",
        "Resizing follows the pointer directly; there is no animation, so reduced motion changes nothing.",
      ]}
    >
      <ShowcaseStage<ResizableSceneData>
        label="Resizable panels demo"
        story={() => import("../layout/ShowcaseStage.resizable")}
        initial={{ left: 50 }}
        minHeight="15rem"
      >
        {(scene, ctx) => <ResizableScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Editor, preview and console"
        description="Drag a handle, or focus it and use the arrow keys. The middle pane holds a vertical group; every panel respects its minimum size."
        code={resizableWorkbenchCode}
      >
        <ResizableWorkbench />
      </Example>
      <Example
        title="Controlled and remembered"
        description="Pass layout and onLayoutChange to own the sizes, for example to save them in localStorage and restore them on the next visit. The sizes are percentages that add up to 100."
        code={resizablePersistedCode}
      >
        <ResizablePersisted />
      </Example>
      <PropsTable of={PROPS.ResizablePanelGroup} title="ResizablePanelGroup props" />
      <PropsTable of={PROPS.ResizablePanel} title="ResizablePanel props" as="h3" />
      <PropsTable of={PROPS.ResizableHandle} title="ResizableHandle props" as="h3" />
    </Page>
  );
}
