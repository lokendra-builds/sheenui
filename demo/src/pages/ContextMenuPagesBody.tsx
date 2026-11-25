import { MenuItem, MenuLinkItem, MenuSeparator } from "@sheenui/theme";
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "@sheenui/theme";
import { Button, CommandPalette } from "@sheenui/theme";
import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { CommandPaletteScene as CommandPaletteSceneData } from "../layout/ShowcaseStage.command-palette";
import { CommandPaletteScene } from "../layout/ShowcaseStage.command-palette.scene";
import type { ContextMenuScene as ContextMenuSceneData } from "../layout/ShowcaseStage.context-menu";
import { ContextMenuScene } from "../layout/ShowcaseStage.context-menu.scene";
import type { MenubarScene as MenubarSceneData } from "../layout/ShowcaseStage.menubar";
import { MenubarScene } from "../layout/ShowcaseStage.menubar.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { CanvasDemo, PhotoGridDemo } from "./MenuPages/context-menu";
import { NotesAppDemo } from "./MenuPages/menubar";
import { AsyncPeopleDemo, PaletteDemo } from "./MenuPages/command-palette";

const manyCommands = Array.from({ length: 3000 }, (_, i) => ({
  id: `cmd-${i + 1}`,
  label: `Command ${String(i + 1).padStart(4, "0")}`,
  group: i < 1500 ? "Alpha" : "Beta",
}));

/** The "Context menu" docs page (/overlays/context-menu): live examples, props and notes. */
export function ContextMenuPage() {
  return (
    <Page
      eyebrow="Overlay"
      title="Context menu"
      description="Right-click, long-press on touch screens, or Shift+F10 on a focused area: the same glass menu opens where you pressed. It uses the dropdown menu's parts, so one list of actions can serve both."
      source={["theme/src/components/context-menu/context-menu.tsx", "theme/src/components/menu/menu.tsx"]}
    >
      <ShowcaseStage<ContextMenuSceneData>
        label="Context menu demo"
        story={() => import("../layout/ShowcaseStage.context-menu")}
        initial={{ open: false, hot: null, picked: "" }}
        minHeight="24rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <ContextMenuScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Photo grid"
        description="Right-click (or long-press) a photo. Every action is also behind the visible ⋯ button: a context menu should be a shortcut, never the only way in."
        stageClassName="min-h-72"
        code={`
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  CopyIcon,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@sheenui/theme";
import { Ellipsis as DotsIcon, Pencil as PencilIcon, Share2 as ShareIcon, Trash2 as TrashIcon } from "lucide-react";

function PhotoActions({ name }: { name: string }) {
  return (
    <>
      <MenuItem icon={<PencilIcon />} shortcut="enter" onClick={() => console.log("rename", name)}>
        Rename
      </MenuItem>
      <MenuItem icon={<CopyIcon />} shortcut="mod+d">Duplicate</MenuItem>
      <MenuSub>
        <MenuSubTrigger icon={<ShareIcon />}>Share</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Copy link</MenuItem>
          <MenuItem>Email</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuItem icon={<TrashIcon />} tone="danger">Move to bin</MenuItem>
    </>
  );
}

export function Example() {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger tabIndex={0} role="group" aria-label="Aurora.jpg" aria-describedby="hint">
          <img src="aurora.jpg" alt="" />
        </ContextMenuTrigger>
        <ContextMenuContent><PhotoActions name="Aurora.jpg" /></ContextMenuContent>
      </ContextMenu>

      {/* The same actions behind a visible button */}
      <Menu>
        <MenuTrigger render={<Button variant="glass" size="icon" aria-label="Actions for Aurora.jpg" />}>
          <DotsIcon />
        </MenuTrigger>
        <MenuContent align="end"><PhotoActions name="Aurora.jpg" /></MenuContent>
      </Menu>
    </>
  );
}`}
      >
        <PhotoGridDemo />
      </Example>

      <Example
        title="Canvas"
        description="A submenu that adds shapes where you pressed (right-click, long-press or Shift+F10), toggles that keep the menu open, a zoom choice and a disabled item. It opens at the pointer and flips to stay on screen near the edges."
        stageClassName="p-3 sm:p-6"
        code={`
import { useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuCheckboxItem,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@sheenui/theme";
import { Plus as PlusIcon } from "lucide-react";

// onOpenChange gets the event that opened the menu: a MouseEvent for a right-click or
// Shift+F10, the TouchEvent for a long-press (iOS sends no contextmenu event).
export function Example() {
  const point = useRef({ x: 0, y: 0 });
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState("100");
  const addSquare = () => console.log("add square at", point.current);

  function rememberPoint(open: boolean, { event }: { event: Event }) {
    const at = event instanceof TouchEvent ? event.touches[0] : (event as MouseEvent);
    if (open && at) point.current = { x: at.clientX, y: at.clientY };
  }

  return (
    <ContextMenu onOpenChange={rememberPoint}>
      <ContextMenuTrigger tabIndex={0} role="group" aria-label="Canvas">
        Right-click, press Shift+F10 or long-press here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuSub>
          <MenuSubTrigger icon={<PlusIcon />}>Add shape</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem onClick={addSquare}>Square</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem shortcut="mod+v" disabled>Paste</MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem checked={snap} onCheckedChange={setSnap}>Snap to grid</MenuCheckboxItem>
        <MenuRadioGroup value={zoom} onValueChange={(value) => setZoom(value as string)}>
          <MenuLabel>Zoom</MenuLabel>
          <MenuRadioItem value="100">100%</MenuRadioItem>
        </MenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}`}
      >
        <CanvasDemo />
      </Example>

      <section className="flex flex-col gap-8">
        <h2 id="api" className="text-xl font-semibold tracking-tight">
          API
        </h2>
        <PropsTable
          as="h3"
          title="ContextMenu"
          rows={[
            [
              "open / defaultOpen / onOpenChange",
              "boolean / (open, details) => void",
              "",
              "Controlled or uncontrolled open state. details.event is what opened it: a MouseEvent (right-click, Shift+F10) or a TouchEvent (long-press).",
            ],
            ["disabled", "boolean", "false", "Let the browser's own menu through."],
            ["children", "ReactNode", "", "Takes a ContextMenuTrigger and a ContextMenuContent."],
            [
              "...props",
              "Base UI props",
              "",
              "The rest is passed to the underlying Base UI part (for example closeParentOnEsc, orientation, loopFocus, highlightItemOnHover, onOpenChangeComplete, onItemHighlighted).",
            ],
          ]}
        />
        <PropsTable
          as="h3"
          title="ContextMenuTrigger"
          rows={[
            [
              "tabIndex",
              "number",
              "",
              "Set 0 on a non-control area so keyboard users can focus it and press Shift+F10 or the Menu key. The menu then opens at the focused element, not the screen corner.",
            ],
            [
              "className / render",
              "string / ReactElement",
              "",
              "Style it, or render it as your own element. Text selection and the iOS callout are off while long-pressing.",
            ],
            ["...props", "Base UI props", "", "The rest is passed to the underlying Base UI part (for example style)."],
          ]}
        />
        <PropsTable as="h3" title="ContextMenuContent" of={PROPS.ContextMenuContent} />
      </section>
      <KeyboardTable
        rows={[
          ["Right-click / Long-press / Shift + F10 / Menu key", "Open the menu at the pointer or the focused element."],
          ["Arrow Down / Arrow Up", "Move between items; the list wraps."],
          ["Home / End", "Jump to the first or last item."],
          ["Type a letter", "Jump to the next item that starts with it (typeahead)."],
          ["Enter / Space", "Run the highlighted item (a checkbox or radio item toggles and keeps the menu open)."],
          ["Escape", "Close and return focus to the trigger."],
        ]}
      />
      <A11yNotes
        items={[
          "A context menu is a shortcut, never the only way to an action: also show the same actions in a visible menu button.",
          'Give the trigger an accessible name that mentions the shortcut; role="menu" with menuitem children, and focus moves into the menu on open.',
          "Text selection and the iOS callout are disabled on the trigger so a long press opens the menu.",
        ]}
      />
    </Page>
  );
}

/** The "Menubar" docs page (/overlays/menubar): live examples, props and notes. */
export function MenubarPage() {
  return (
    <Page
      eyebrow="Overlay"
      title="Menubar"
      description="A desktop-style menu bar: File, Edit, View. Tab reaches it once, ← → walk the menus (and switch the open one), and once a menu is open, hovering a neighbor opens that instead. The open menu's tint glides along the bar."
      source={["theme/src/components/menubar/menubar.tsx", "theme/src/components/menu/menu.tsx"]}
    >
      <ShowcaseStage<MenubarSceneData>
        label="Menubar demo"
        story={() => import("../layout/ShowcaseStage.menubar")}
        initial={{ menu: "", hot: null, size: "sm" }}
        minHeight="24rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <MenubarScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Notes app"
        description="View toggles the sidebar, the word count and the text size; File → Open recent switches notes. Everything else shows a toast."
        frame="notes.app"
        stageClassName="min-h-80"
        code={`
import { useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenuCheckboxItem,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@sheenui/theme";
import { File as FileIcon, Printer as PrinterIcon } from "lucide-react";

export function Example() {
  const [sidebar, setSidebar] = useState(true);
  const [size, setSize] = useState("md");

  return (
    <Menubar aria-label="Application menu">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenuItem icon={<FileIcon />} shortcut="mod+n">New note</MenuItem>
          <MenuSub>
            <MenuSubTrigger inset>Open recent</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Meeting notes</MenuItem>
              <MenuItem>Shopping list</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuItem icon={<PrinterIcon />} shortcut="mod+p">Print…</MenuItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenuCheckboxItem checked={sidebar} onCheckedChange={setSidebar} shortcut="mod+\\">
            Sidebar
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuRadioGroup value={size} onValueChange={setSize}>
            <MenuLabel>Text size</MenuLabel>
            <MenuRadioItem value="sm" shortcut="mod+-">Small</MenuRadioItem>
            <MenuRadioItem value="md" shortcut="mod+0">Medium</MenuRadioItem>
          </MenuRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}`}
      >
        <NotesAppDemo />
      </Example>

      <Example
        title="Edit and Help menus"
        description="Shortcut hints, a disabled item and a link item. The hints are display only: wire the handlers yourself."
        stageClassName="min-h-64 items-start"
        code={`
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
} from "@sheenui/theme";

export function Example() {
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenuItem shortcut="mod+z">Undo</MenuItem>
          <MenuItem shortcut="shift+mod+z" disabled>Redo</MenuItem>
          <MenuSeparator />
          <MenuItem shortcut="mod+x">Cut</MenuItem>
          <MenuItem shortcut="mod+c">Copy</MenuItem>
          <MenuItem shortcut="mod+v">Paste</MenuItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenuLinkItem href="#documentation">Documentation</MenuLinkItem>
          <MenuItem>Keyboard shortcuts</MenuItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}`}
      >
        <Menubar aria-label="Editor">
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenuItem shortcut="mod+z">Undo</MenuItem>
              <MenuItem shortcut="shift+mod+z" disabled>
                Redo
              </MenuItem>
              <MenuSeparator />
              <MenuItem shortcut="mod+x">Cut</MenuItem>
              <MenuItem shortcut="mod+c">Copy</MenuItem>
              <MenuItem shortcut="mod+v">Paste</MenuItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Help</MenubarTrigger>
            <MenubarContent>
              <MenuLinkItem href="#documentation">Documentation</MenuLinkItem>
              <MenuItem>Keyboard shortcuts</MenuItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Example>

      <section className="flex flex-col gap-8">
        <h2 id="api" className="text-xl font-semibold tracking-tight">
          API
        </h2>
        <PropsTable
          as="h3"
          title="Menubar"
          rows={[
            ["orientation", '"horizontal" | "vertical"', '"horizontal"', "Which arrow keys move between menus."],
            ["loopFocus", "boolean", "true", "Arrow keys wrap from the last menu to the first."],
            ["modal", "boolean", "true", "Lock page scroll and outside clicks while a menu is open."],
            ["disabled", "boolean", "false", "Disable the whole bar."],
            ["className", "string", "", "Classes for the glass bar. It scrolls sideways if the menus don't fit."],
            [
              "Menubar ...props",
              "Base UI props",
              "",
              "The rest is passed to the underlying Base UI part (for example style, render).",
            ],
            [
              "Menu ...props",
              "Base UI props",
              "",
              "The rest is passed to the underlying Base UI part (for example defaultOpen, loopFocus, highlightItemOnHover, modal, onOpenChange, onOpenChangeComplete).",
            ],
          ]}
        />
        <PropsTable
          as="h3"
          title="MenubarMenu · MenubarTrigger · MenubarContent"
          of={PROPS.MenubarContent}
          rows={[
            ["MenubarMenu", "Menu props (open, onOpenChange…)", "", "Holds one menu in the bar."],
            ["MenubarTrigger disabled", "boolean", "false", "Disables this menu so it cannot be opened."],
          ]}
        />
      </section>
      <KeyboardTable
        rows={[
          ["Tab", "Reach the bar once."],
          ["Arrow Left / Arrow Right", "Move between menus; while one is open, switch the open menu."],
          ["Arrow Down / Enter / Space", "Open the focused menu."],
          ["Arrow Down / Arrow Up", "Move between items; the list wraps."],
          ["Home / End", "Jump to the first or last item."],
          ["Type a letter", "Jump to the next item that starts with it (typeahead)."],
          ["Enter / Space", "Run the highlighted item (a checkbox or radio item toggles and keeps the menu open)."],
          ["Escape", "Close the menu and return focus to its trigger."],
        ]}
      />
      <A11yNotes
        items={[
          'role="menubar" with menu triggers (aria-haspopup, aria-expanded); name it with aria-label.',
          "Items are 44 px tall on touch screens, and the bar scrolls sideways instead of wrapping on narrow screens.",
          "Shortcut hints are shown as keys and exposed through aria-keyshortcuts.",
        ]}
      />
    </Page>
  );
}

/** The "Command palette (⌘K)" docs page (/overlays/command-palette): live examples, props and notes. */
export function CommandPalettePage() {
  return (
    <Page
      eyebrow="Overlay"
      title="Command palette"
      description="Press ⌘K (Ctrl+K on Windows and Linux) anywhere on this page. A glass search over every command: fuzzy matching with the matched letters lit up, recent picks first, nested pages, and a highlight that glides with the arrow keys."
      source={[
        "theme/src/components/command/command.tsx",
        "theme/src/components/command/fuzzy.ts",
        "theme/src/components/command/use-command-shortcut.ts",
      ]}
    >
      <ShowcaseStage<CommandPaletteSceneData>
        label="Command palette demo"
        story={() => import("../layout/ShowcaseStage.command-palette")}
        initial={{ open: false, query: "", went: "" }}
        minHeight="22rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <CommandPaletteScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="⌘K anywhere"
        description='Try "dsh" for Dashboard, "prefs" (a hidden keyword) for Settings, or "dark" to reach a theme inside the "Change theme…" page straight from the top. Enter runs a command; Escape or Backspace in an empty field steps back out of a page. Your last picks show under Recent next time.'
        code={`
import { useState } from "react";
import { Button, CommandPalette, KbdShortcut, useCommandShortcut, type CommandItem } from "@sheenui/theme";
import { House as HomeIcon, Search as SearchIcon } from "lucide-react";

export function Example() {
  const [open, setOpen] = useState(false);
  const setTheme = (theme: "light" | "dark") => document.documentElement.setAttribute("data-theme", theme);

  const commands: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", group: "Navigation", icon: <HomeIcon />, onSelect: () => location.assign("/") },
    {
      id: "settings",
      label: "Settings",
      keywords: ["preferences", "account"],
      group: "Navigation",
      shortcut: "mod+,",
      onSelect: () => location.assign("/settings"),
    },
    {
      id: "theme",
      label: "Change theme…",
      group: "Actions",
      placeholder: "Choose a theme…",
      items: [
        { id: "theme-light", label: "Light", onSelect: () => setTheme("light") },
        { id: "theme-dark", label: "Dark", onSelect: () => setTheme("dark") },
      ],
    },
    { id: "export", label: "Export workspace", group: "Actions", disabled: true },
  ];

  // Only need the shortcut? The hook works on its own ("mod+k" by default):
  useCommandShortcut(() => setOpen((value) => !value));

  // ⌘K / Ctrl+K toggles the palette; focus returns to the trigger on close.
  return (
    <CommandPalette
      items={commands}
      open={open}
      onOpenChange={setOpen}
      recentStorageKey="my-app:recent-commands"
      trigger={
        <Button variant="glass" leading={<SearchIcon />} trailing={<KbdShortcut keys="mod+k" className="ms-auto" />}>
          Search or jump to…
        </Button>
      }
    />
  );
}`}
      >
        <PaletteDemo />
      </Example>

      <Example
        title="Thousands of commands"
        description="Long lists are windowed on their own (virtualized defaults to auto, above 200 results), so the palette stays fast with a big command list. This one lists 3,000 commands and sets maxResults high enough to search them all: arrow down, press Page Down, or type a number."
        code={`
import { Button, CommandPalette } from "@sheenui/theme";

const commands = Array.from({ length: 3000 }, (_, i) => ({
  id: \`cmd-\${i + 1}\`,
  label: \`Command \${String(i + 1).padStart(4, "0")}\`,
  group: i < 1500 ? "Alpha" : "Beta",
}));

export function Example() {
  return (
    <CommandPalette
      items={commands}
      maxResults={3000}
      shortcut={false}
      trigger={<Button variant="glass">Browse 3,000 commands</Button>}
    />
  );
}`}
      >
        <CommandPalette
          items={manyCommands}
          maxResults={3000}
          shortcut={false}
          trigger={<Button variant="glass">Browse 3,000 commands</Button>}
        />
      </Example>

      <Example
        title="Your own results"
        description="filter={false} shows the items you pass, as they are: search a server in onQueryChange and set loading meanwhile. Matches are still highlighted. This one has no global shortcut (shortcut={false})."
        code={`
import { useState } from "react";
import { Button, CommandPalette } from "@sheenui/theme";

type Person = { id: string; name: string; role: string };

// Your data hook: queries your API for the text typed so far.
declare function usePeopleSearch(query: string): { data: Person[]; isLoading: boolean };

export function Example() {
  const [query, setQuery] = useState("");
  const { data: people, isLoading } = usePeopleSearch(query);

  return (
    <CommandPalette
      trigger={<Button variant="glass">Find a person</Button>}
      shortcut={false}
      items={people.map((p) => ({ id: p.id, label: p.name, description: p.role, group: "People" }))}
      query={query}
      onQueryChange={setQuery}
      filter={false}
      loading={isLoading}
      maxRecent={0}
      labels={{ placeholder: "Search people…", inputLabel: "Search people" }}
    />
  );
}`}
      >
        <AsyncPeopleDemo />
      </Example>

      <section className="flex flex-col gap-8">
        <h2 id="api" className="text-xl font-semibold tracking-tight">
          API
        </h2>
        <PropsTable as="h3" title="CommandPalette" of={PROPS.CommandPalette} />
        <PropsTable
          as="h3"
          title="CommandItem"
          rows={[
            ["id", "string", "", "Unique across the tree (recents and keys use it)."],
            ["label / description", "string", "", "What is shown and searched."],
            ["keywords", "string[]", "", "Extra words that find it but aren't shown."],
            ["group", "string", "", "Heading it is listed under."],
            [
              "icon / hint / shortcut",
              "ReactNode / ReactNode / string",
              "",
              "Icon tile, trailing text or badge (shown on every screen) and a shortcut hint (display only; hidden on phones).",
            ],
            ["onSelect", "(item) => void", "", "Runs when chosen. The palette then closes unless keepOpen."],
            [
              "items / placeholder",
              "CommandItem[] / string",
              "",
              "Turns the command into a nested page, with its own placeholder.",
            ],
            [
              "disabled / keepOpen / recordRecent",
              "boolean",
              "false / false / true",
              "Skip it, stay open after running, list it under Recent.",
            ],
          ]}
        />
        <PropsTable
          as="h3"
          title="useCommandShortcut(callback, options)"
          rows={[
            ["keys", "string | string[]", '"mod+k"', 'Shortcut such as "mod+k", "/" or "shift+mod+p".'],
            ["enabled", "boolean", "true", "Keeps listening only while true."],
            ["allowInInputs", "boolean", "true", 'Fire while typing in a field. Turn off for bare keys like "/".'],
            ["preventDefault", "boolean", "true", "Stop the browser's own action for the shortcut."],
          ]}
        />
      </section>
      <KeyboardTable
        rows={[
          ["Cmd / Ctrl + K", "Open or close the palette from anywhere."],
          ["Arrow Down / Arrow Up (or Ctrl + N / P)", "Move through the results."],
          ["Page Up / Page Down", "Jump through the results."],
          ["Enter", "Run the highlighted command."],
          ["Escape", "Go back one page, then close."],
          ["Backspace in an empty field", "Go back one page."],
        ]}
      />
      <A11yNotes
        items={[
          "The field is an ARIA combobox that owns a listbox (aria-activedescendant), so focus never leaves it.",
          "The result count is announced politely and usage instructions are read on open; the dialog is named by labels.title.",
          "Shortcut hints expose aria-keyshortcuts. Focus returns to the trigger on close. Every string is translatable.",
        ]}
      />
    </Page>
  );
}
