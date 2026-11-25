import { useState } from "react";
import { GlassCard, cn, useToast } from "@sheenui/theme";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@sheenui/theme";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@sheenui/theme";
import { DemoLink, I, icon } from "./shared";

/* =====================================================================
 * Toolbar
 * ===================================================================== */

type BlockStyle = "paragraph" | "h1" | "h2" | "quote";

const blockLabels: Record<BlockStyle, string> = {
  paragraph: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  quote: "Quote",
};

export const toolbarEditorCode = `
import { useState } from "react";
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@sheenui/theme";
import { AlignCenter as AlignCenterIcon, AlignLeft as AlignLeftIcon, AlignRight as AlignRightIcon, Bold as BoldIcon, ChevronDown as ChevronIcon, Italic as ItalicIcon, Link as LinkIcon, Redo2 as RedoIcon, Underline as UnderlineIcon, Undo2 as UndoIcon } from "lucide-react";

type Block = "paragraph" | "h1";
const blockLabels: Record<Block, string> = { paragraph: "Paragraph", h1: "Heading 1" };

export function Example() {
  const [marks, setMarks] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState<string[]>(["left"]);
  const [block, setBlock] = useState<Block>("paragraph");

  return (
    <Toolbar aria-label="Formatting">
      <ToolbarGroup aria-label="History">
        <ToolbarButton tooltip="Undo" shortcut="mod+z"><UndoIcon /></ToolbarButton>
        <ToolbarButton tooltip="Redo" shortcut="shift+mod+z" disabled><RedoIcon /></ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <Menu>
        <ToolbarButton render={<MenuTrigger />}>{blockLabels[block]} <ChevronIcon /></ToolbarButton>
        <MenuContent>
          <MenuRadioGroup value={block} onValueChange={setBlock}>
            <MenuRadioItem value="paragraph">Paragraph</MenuRadioItem>
            <MenuRadioItem value="h1">Heading 1</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <ToolbarSeparator />
      <ToolbarToggleGroup multiple value={marks} onValueChange={setMarks} aria-label="Text style">
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
        <ToolbarToggle value="underline" tooltip="Underline" shortcut="mod+u"><UnderlineIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      {/* Single choice: one accent pill glides between the options; required keeps one pressed. */}
      <ToolbarToggleGroup required value={align} onValueChange={setAlign} aria-label="Alignment">
        <ToolbarToggle value="left" tooltip="Align left"><AlignLeftIcon /></ToolbarToggle>
        <ToolbarToggle value="center" tooltip="Align center"><AlignCenterIcon /></ToolbarToggle>
        <ToolbarToggle value="right" tooltip="Align right"><AlignRightIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Insert link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
      <ToolbarSpacer />
      <ToolbarLink href={"/history"}>Edited 2m ago</ToolbarLink>
    </Toolbar>
  );
}`;

export function ToolbarEditorDemo() {
  const toast = useToast();
  const [marks, setMarks] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState<string[]>(["left"]);
  const [block, setBlock] = useState<BlockStyle>("paragraph");
  const alignment = align[0] ?? "left";
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <Toolbar aria-label="Formatting">
        <ToolbarGroup aria-label="History">
          <ToolbarButton tooltip="Undo" shortcut="mod+z" onClick={() => toast.info("Undo")}>
            {icon(I.undo)}
          </ToolbarButton>
          <ToolbarButton tooltip="Redo" shortcut="shift+mod+z" disabled>
            {icon(I.redo)}
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <Menu>
          <ToolbarButton render={<MenuTrigger />} className="min-w-28 justify-between">
            {blockLabels[block]}
            {icon(I.chevron)}
          </ToolbarButton>
          <MenuContent className="w-44">
            <MenuRadioGroup value={block} onValueChange={(value) => setBlock(value as BlockStyle)}>
              {(Object.keys(blockLabels) as BlockStyle[]).map((key) => (
                <MenuRadioItem key={key} value={key}>
                  {blockLabels[key]}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <ToolbarSeparator />
        <ToolbarToggleGroup multiple value={marks} onValueChange={setMarks} aria-label="Text style">
          <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b">
            {icon(I.bold)}
          </ToolbarToggle>
          <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i">
            {icon(I.italic)}
          </ToolbarToggle>
          <ToolbarToggle value="underline" tooltip="Underline" shortcut="mod+u">
            {icon(I.underline)}
          </ToolbarToggle>
          <ToolbarToggle value="strike" tooltip="Strikethrough" shortcut="shift+mod+x">
            {icon(I.strike)}
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarToggleGroup required value={align} onValueChange={setAlign} aria-label="Alignment">
          <ToolbarToggle value="left" tooltip="Align left">
            {icon(I.alignLeft)}
          </ToolbarToggle>
          <ToolbarToggle value="center" tooltip="Align center">
            {icon(I.alignCenter)}
          </ToolbarToggle>
          <ToolbarToggle value="right" tooltip="Align right">
            {icon(I.alignRight)}
          </ToolbarToggle>
          <ToolbarToggle value="justify" tooltip="Justify">
            {icon(I.alignJustify)}
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Insert">
          <ToolbarButton tooltip="Insert link" shortcut="mod+k" onClick={() => toast.info("Insert link")}>
            {icon(I.link)}
          </ToolbarButton>
          <ToolbarButton tooltip="Insert image" onClick={() => toast.info("Insert image")}>
            {icon(I.image)}
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarLink render={<DemoLink to="/history" />}>Edited 2m ago</ToolbarLink>
      </Toolbar>
      <GlassCard level={1} sheen={false} className="min-h-32 p-5">
        <p
          className={cn(
            "text-pretty text-sheen-fg",
            block === "h1" && "text-2xl font-semibold tracking-tight",
            block === "h2" && "text-lg font-semibold",
            block === "paragraph" && "text-sm leading-relaxed",
            block === "quote" && "border-s-2 border-sheen-accent ps-4 text-base text-sheen-fg-muted italic",
            marks.includes("bold") && "font-bold",
            marks.includes("italic") && "italic",
            marks.includes("underline") && "underline underline-offset-4",
            marks.includes("strike") && "line-through",
            alignment === "center" && "text-center",
            alignment === "right" && "text-end",
            alignment === "justify" && "text-justify",
          )}
        >
          Glass works when it stays readable: a blur strong enough to quiet the backdrop, a rim of light to give it an
          edge, and text that keeps its contrast whatever passes behind.
        </p>
      </GlassCard>
    </div>
  );
}

export const toolbarFloatingCode = `
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { Bold as BoldIcon, MessageSquare as CommentIcon, Italic as ItalicIcon, Link as LinkIcon, Sparkles as SparkleIcon } from "lucide-react";

export function Example() {
  return (
    <Toolbar variant="floating" size="sm" aria-label="Selection">
      <ToolbarToggleGroup multiple aria-label="Text style">
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarButton tooltip="Link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
      <ToolbarButton tooltip="Comment"><CommentIcon /></ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton><SparkleIcon /> Ask AI</ToolbarButton>
    </Toolbar>
  );
}`;

export const toolbarVerticalCode = `
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { Hand as HandIcon, Minus as MinusIcon, Pen as PenIcon, Plus as PlusIcon, MousePointer2 as PointerIcon, Square as SquareIcon, Type as TypeIcon } from "lucide-react";

export function Example() {
  const [tool, setTool] = useState<string[]>(["select"]);

  return (
    <Toolbar orientation="vertical" aria-label="Tools">
      <ToolbarToggleGroup required value={tool} onValueChange={setTool} aria-label="Tool">
        <ToolbarToggle value="select" tooltip="Select" shortcut="v"><PointerIcon /></ToolbarToggle>
        <ToolbarToggle value="hand" tooltip="Hand" shortcut="h"><HandIcon /></ToolbarToggle>
        <ToolbarToggle value="pen" tooltip="Pen" shortcut="p"><PenIcon /></ToolbarToggle>
        <ToolbarToggle value="shape" tooltip="Rectangle" shortcut="r"><SquareIcon /></ToolbarToggle>
        <ToolbarToggle value="text" tooltip="Text" shortcut="t"><TypeIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Zoom in" shortcut="mod+="><PlusIcon /></ToolbarButton>
      <ToolbarButton tooltip="Zoom out" shortcut="mod+-"><MinusIcon /></ToolbarButton>
    </Toolbar>
  );
}`;

export const toolbarScrollCode = `
import { Toolbar, ToolbarButton, ToolbarInput } from "@sheenui/theme";

export function Example() {
  // One row that scrolls sideways on narrow screens, with fades on the edges that have more.

  return (
    <>
      <Toolbar overflow="scroll" aria-label="Formatting">
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton>Italic</ToolbarButton>
        <ToolbarButton>Underline</ToolbarButton>
      </Toolbar>

      {/* A search field: at most one, and last (arrow keys move its caret). */}
      <ToolbarInput aria-label="Search in document" placeholder="Search" />
    </>
  );
}`;

export function ToolbarVerticalDemo() {
  const tools = [
    { value: "select", label: "Select", key: "v", d: I.pointer },
    { value: "hand", label: "Hand", key: "h", d: I.hand },
    { value: "pen", label: "Pen", key: "p", d: I.pen },
    { value: "shape", label: "Rectangle", key: "r", d: I.square },
    { value: "text", label: "Text", key: "t", d: I.type },
  ];
  const [tool, setTool] = useState<string[]>(["select"]);
  const [zoom, setZoom] = useState(100);
  const current = tools.find((t) => t.value === tool[0]);
  return (
    <div className="flex w-full max-w-xl items-stretch gap-4">
      <Toolbar orientation="vertical" aria-label="Tools" className="self-start">
        <ToolbarToggleGroup required value={tool} onValueChange={setTool} aria-label="Tool">
          {tools.map((t) => (
            <ToolbarToggle key={t.value} value={t.value} tooltip={t.label} shortcut={t.key}>
              {icon(t.d)}
            </ToolbarToggle>
          ))}
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton tooltip="Zoom in" shortcut="mod+=" onClick={() => setZoom((z) => Math.min(400, z + 25))}>
          {icon(I.plus)}
        </ToolbarButton>
        <ToolbarButton tooltip="Zoom out" shortcut="mod+-" onClick={() => setZoom((z) => Math.max(25, z - 25))}>
          {icon(I.minus)}
        </ToolbarButton>
      </Toolbar>
      <div className="relative flex min-h-64 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-sheen-lg border border-dashed border-sheen-fg-subtle/40 p-4 text-center">
        <p className="text-sm font-medium text-sheen-fg">{current ? `${current.label} tool` : "No tool"}</p>
        <p className="text-xs text-sheen-fg-muted tabular-nums">Zoom {zoom}%</p>
      </div>
    </div>
  );
}
