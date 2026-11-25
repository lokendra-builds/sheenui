import { useState } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Tooltip,
  TooltipProvider,
} from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import type { TooltipScene as TooltipSceneData } from "../layout/ShowcaseStage.tooltip";
import { TooltipScene } from "../layout/ShowcaseStage.tooltip.scene";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { PopoverScene as PopoverSceneData } from "../layout/ShowcaseStage.popover";
import { PopoverScene } from "../layout/ShowcaseStage.popover.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

const icon = (d: string) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/** The "Tooltip" docs page (/components/tooltip): live examples, props and notes. */
export function TooltipPage() {
  return (
    <Page
      eyebrow="Component"
      title="Tooltip"
      description="A small glass label on hover or keyboard focus. Inside a TooltipProvider, moving between tooltips is instant."
      source="theme/src/components/tooltip/tooltip.tsx"
    >
      <ShowcaseStage<TooltipSceneData>
        label="Tooltip demo"
        story={() => import("../layout/ShowcaseStage.tooltip")}
        initial={{ open: -1 }}
        minHeight="19rem"
      >
        {(scene) => <TooltipScene scene={scene} />}
      </ShowcaseStage>

      <Example
        title="Icon toolbar"
        code={`
import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";
import { Bold as BoldIcon, Italic as ItalicIcon } from "lucide-react";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Bold">
        <Button variant="glass" size="icon" aria-label="Bold"><BoldIcon /></Button>
      </Tooltip>
      <Tooltip content="Italic" side="bottom">
        <Button variant="glass" size="icon" aria-label="Italic"><ItalicIcon /></Button>
      </Tooltip>
    </TooltipProvider>
  );
}`}
      >
        <TooltipProvider>
          <div className="glass-1 flex gap-1 rounded-sheen-full p-1">
            <Tooltip content="Bold">
              <Button variant="ghost" size="icon" aria-label="Bold" className="rounded-sheen-full">
                {icon("M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z")}
              </Button>
            </Tooltip>
            <Tooltip content="Italic">
              <Button variant="ghost" size="icon" aria-label="Italic" className="rounded-sheen-full">
                {icon("M14 5h-4M14 19h-4M14 5l-4 14")}
              </Button>
            </Tooltip>
            <Tooltip content="Underline" side="bottom">
              <Button variant="ghost" size="icon" aria-label="Underline" className="rounded-sheen-full">
                {icon("M7 4v7a5 5 0 0 0 10 0V4M5 20h14")}
              </Button>
            </Tooltip>
          </div>
        </TooltipProvider>
      </Example>

      <Example
        title="Sides and delay"
        description="side picks the edge it opens on. delay is how long the pointer must rest before it opens; 0 shows it at once. A TooltipProvider makes moving between tooltips instant."
        stageClassName="min-h-56"
        code={`
import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Opens above (the default)">
        <Button variant="glass">Top</Button>
      </Tooltip>
      <Tooltip content="Opens to the right" side="right">
        <Button variant="glass">Right</Button>
      </Tooltip>
      <Tooltip content="Opens at once" delay={0}>
        <Button variant="glass">No delay</Button>
      </Tooltip>
      <Tooltip content="Waits a full second" delay={1000} side="bottom">
        <Button variant="glass">Slow</Button>
      </Tooltip>
    </TooltipProvider>
  );
}`}
      >
        <TooltipProvider>
          <Tooltip content="Opens above (the default)">
            <Button variant="glass">Top</Button>
          </Tooltip>
          <Tooltip content="Opens to the right" side="right">
            <Button variant="glass">Right</Button>
          </Tooltip>
          <Tooltip content="Opens at once" delay={0}>
            <Button variant="glass">No delay</Button>
          </Tooltip>
          <Tooltip content="Waits a full second" delay={1000} side="bottom">
            <Button variant="glass">Slow</Button>
          </Tooltip>
        </TooltipProvider>
      </Example>
      <PropsTable of={PROPS.Tooltip} />
      <KeyboardTable
        rows={[
          ["Tab / Shift + Tab", "Focusing the trigger shows the tooltip; leaving it hides it."],
          ["Escape", "Dismiss the tooltip while keeping focus on the trigger."],
        ]}
      />
      <A11yNotes
        items={[
          "Tooltip adds no tab stop of its own; the trigger keeps its own. The bubble has role=“tooltip” and, while it is open, the trigger points to it with aria-describedby (added to any description it already has), so the text is announced as its description. It describes, it does not name: an icon-only trigger still needs its own aria-label.",
          "Keep it to a short label. Anything interactive belongs in a Popover; essential text must not live only in a tooltip.",
          "The bubble stays open while the pointer moves onto it (so it can be read while magnified) but holds no controls. On touch screens a long press (about half a second) shows it for a couple of seconds, and lifting the finger does not activate the trigger; a plain tap never shows it, so never hide the only label of a control in a tooltip. Under reduced motion it only fades.",
        ]}
      />
    </Page>
  );
}

/** The "Popover" docs page (/components/popover): live examples, props and notes. */
export function PopoverPage() {
  const [renameOpen, setRenameOpen] = useState(false);
  const [docName, setDocName] = useState("Q3 roadmap");

  return (
    <Page
      eyebrow="Component"
      title="Popover"
      description="A glass panel anchored to a button, for small forms and details. Escape or clicking outside closes it."
      source="theme/src/components/popover/popover.tsx"
    >
      <ShowcaseStage<PopoverSceneData>
        label="Popover demo"
        story={() => import("../layout/ShowcaseStage.popover")}
        initial={{ open: false, name: "Q3 roadmap", draft: "Q3 roadmap" }}
        minHeight="20rem"
      >
        {(scene, ctx) => <PopoverScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Share link"
        stageClassName="min-h-80"
        code={`
import {
  Button,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@sheenui/theme";

export function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="glass" />}>Share</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
        <Input readOnly defaultValue="https://example.com/blocks" />
        <PopoverClose render={<Button size="sm" />}>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}`}
      >
        <Popover>
          <PopoverTrigger render={<Button variant="glass" />}>Share</PopoverTrigger>
          <PopoverContent className="flex flex-col gap-3">
            <div>
              <PopoverTitle>Share this page</PopoverTitle>
              <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
            </div>
            <Input readOnly aria-label="Link" defaultValue="https://example.com/blocks" />
            <div className="flex justify-end">
              <PopoverClose render={<Button size="sm" />}>Done</PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      </Example>

      <Example
        title="Placement and a controlled panel"
        description="side and align place the panel; open and onOpenChange let your code close it after saving."
        stageClassName="min-h-80"
        code={`
import { useState } from "react";
import { Button, Input, Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Q3 roadmap");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="glass" />}>{name}</PopoverTrigger>
      <PopoverContent side="right" align="start" className="flex w-72 flex-col gap-3">
        <PopoverTitle>Rename</PopoverTitle>
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
      </PopoverContent>
    </Popover>
  );
}`}
      >
        <Popover open={renameOpen} onOpenChange={setRenameOpen}>
          <PopoverTrigger render={<Button variant="glass" />}>{docName}</PopoverTrigger>
          <PopoverContent side="right" align="start" className="flex w-72 flex-col gap-3">
            <PopoverTitle>Rename</PopoverTitle>
            <Input label="Name" value={docName} onChange={(event) => setDocName(event.target.value)} />
            <Button size="sm" onClick={() => setRenameOpen(false)}>
              Save
            </Button>
          </PopoverContent>
        </Popover>
      </Example>
      <Example
        title="Bottom sheet on phones"
        phonePreview
        description="mobile='sheet' presents the panel as a bottom sheet under 640px wide, modal with a drag handle and swipe-to-dismiss. The default, 'popup', keeps the anchored panel. Press “Preview on a phone” to try it on a desktop screen (or narrow the window)."
        code={`
import { Button, Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Popover mobile="sheet">
      <PopoverTrigger render={<Button variant="glass">Details</Button>} />
      <PopoverContent>
        <PopoverTitle>Billing</PopoverTitle>
        <PopoverDescription>Next invoice on 1 Dec.</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}`}
      >
        <Popover mobile="sheet">
          <PopoverTrigger render={<Button variant="glass">Details</Button>} />
          <PopoverContent>
            <PopoverTitle>Billing</PopoverTitle>
            <PopoverDescription>Next invoice on 1 Dec.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </Example>

      <PropsTable
        of={PROPS.Popover}
        rows={[
          [
            "Popover open / defaultOpen",
            "boolean",
            "false",
            "Controls whether the popover is open (`open`), or sets its initial state (`defaultOpen`).",
          ],
          ["PopoverTrigger render", "ReactElement", "", "Render as your own element, e.g. render={<Button />}."],
          [
            "PopoverContent side",
            '"top" | "bottom" | "left" | "right"',
            '"bottom"',
            "Side of the trigger it opens on.",
          ],
          ["PopoverContent align", '"start" | "center" | "end"', '"center"', "Sets the alignment along that side."],
          ["PopoverContent sideOffset", "number (px)", "8", "Gap between the trigger and the popover."],
          [
            "Popover ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example onOpenChange, onOpenChangeComplete, actionsRef, modal, triggerId, defaultTriggerId).",
          ],
          [
            "PopoverTrigger ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example nativeButton, id, className, style, handle, payload).",
          ],
          [
            "PopoverContent ...props",
            "Base UI props",
            "",
            "The rest is passed to the underlying Base UI part (for example style, className, render, initialFocus, finalFocus).",
          ],
        ]}
      />
      <PropsTable of={PROPS.PopoverContent} title="PopoverContent props" as="h3" />
      <KeyboardTable
        rows={[
          ["Enter / Space", "Open or close it from the trigger; focus moves into the panel."],
          ["Tab / Shift + Tab", "Cycle inside the panel."],
          ["Escape", "Close it and return focus to the trigger."],
        ]}
      />
      <A11yNotes
        items={[
          "The trigger gets aria-expanded and aria-haspopup; the panel is labeled by PopoverTitle when you render one.",
          "Use a Popover for interactive content; use a Tooltip for a short label and a HoverCard for a preview.",
          "Under reduced motion the panel only fades.",
        ]}
      />
    </Page>
  );
}
