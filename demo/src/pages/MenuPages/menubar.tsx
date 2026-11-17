import { useState } from "react";
import { cn, useToast } from "@sheenui/theme";
import {
  MenuCheckboxItem,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from "@sheenui/theme";
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "@sheenui/theme";
import { I, icon } from "./shared";

/* =====================================================================
 * Menubar
 * ===================================================================== */

const notes = [
  {
    id: "ideas",
    title: "Product ideas",
    body: "Glass that behaves: blur the backdrop, never the words. Motion that shows where things came from, then gets out of the way when asked.",
  },
  { id: "groceries", title: "Groceries", body: "Oat milk, sourdough, two lemons, fresh basil and the good olive oil." },
  {
    id: "lisbon",
    title: "Lisbon trip",
    body: "Tram 28 before the crowds, pastéis de nata in Belém, sunset at the Miradouro da Senhora do Monte.",
  },
] as const;

type TextSize = "sm" | "md" | "lg";

export function NotesAppDemo() {
  const toast = useToast();
  const [sidebar, setSidebar] = useState(true);
  const [wordCount, setWordCount] = useState(true);
  const [size, setSize] = useState<TextSize>("md");
  const [activeId, setActiveId] = useState<string>("ideas");
  const note = notes.find((n) => n.id === activeId) ?? notes[0];
  const say = (message: string) => () => toast.info(message);
  const words = note.body.split(/\s+/).length;

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <Menubar aria-label="Application menu" className="self-start">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenuItem icon={icon(I.file)} shortcut="mod+n" onClick={say("New note")}>
              New note
            </MenuItem>
            <MenuItem icon={icon(I.folder)} shortcut="shift+mod+n" onClick={say("New folder")}>
              New folder
            </MenuItem>
            <MenuSub>
              <MenuSubTrigger inset>Open recent</MenuSubTrigger>
              <MenuSubContent>
                {notes.map((n) => (
                  <MenuItem key={n.id} onClick={() => setActiveId(n.id)}>
                    {n.title}
                  </MenuItem>
                ))}
              </MenuSubContent>
            </MenuSub>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger icon={icon(I.download)}>Export as</MenuSubTrigger>
              <MenuSubContent>
                {["PDF", "Markdown", "HTML"].map((format) => (
                  <MenuItem key={format} onClick={() => toast.success(`Exported “${note.title}” as ${format}`)}>
                    {format}
                  </MenuItem>
                ))}
              </MenuSubContent>
            </MenuSub>
            <MenuItem icon={icon(I.printer)} shortcut="mod+p" onClick={say("Print")}>
              Print…
            </MenuItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenuItem icon={icon(I.undo)} shortcut="mod+z" onClick={say("Undo")}>
              Undo
            </MenuItem>
            <MenuItem icon={icon(I.redo)} shortcut="shift+mod+z" disabled>
              Redo
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={icon(I.scissors)} shortcut="mod+x" onClick={say("Cut")}>
              Cut
            </MenuItem>
            <MenuItem icon={icon(I.copy)} shortcut="mod+c" onClick={say("Copied")}>
              Copy
            </MenuItem>
            <MenuItem icon={icon(I.paste)} shortcut="mod+v" onClick={say("Pasted")}>
              Paste
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={icon(I.search)} shortcut="mod+f" onClick={say("Find")}>
              Find…
            </MenuItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenuCheckboxItem checked={sidebar} onCheckedChange={setSidebar} shortcut="mod+\">
              Sidebar
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={wordCount} onCheckedChange={setWordCount}>
              Word count
            </MenuCheckboxItem>
            <MenuSeparator />
            <MenuRadioGroup value={size} onValueChange={(v) => setSize(v as TextSize)}>
              <MenuLabel>Text size</MenuLabel>
              <MenuRadioItem value="sm" shortcut="mod+-">
                Small
              </MenuRadioItem>
              <MenuRadioItem value="md" shortcut="mod+0">
                Medium
              </MenuRadioItem>
              <MenuRadioItem value="lg" shortcut="mod+=">
                Large
              </MenuRadioItem>
            </MenuRadioGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenuItem icon={icon(I.keyboard)} shortcut="mod+/" onClick={say("Keyboard shortcuts")}>
              Keyboard shortcuts
            </MenuItem>
            <MenuLinkItem
              icon={icon(I.book)}
              href="https://base-ui.com/react/components/menubar"
              target="_blank"
              rel="noopener"
            >
              Menubar docs
            </MenuLinkItem>
            <MenuSeparator />
            <MenuItem inset onClick={say("Notes 2.4 · made with SheenUI")}>
              About Notes
            </MenuItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="glass-2 flex min-h-60 min-w-0 overflow-hidden rounded-sheen-lg">
        {sidebar && (
          <nav
            aria-label="Notes"
            className="flex w-28 shrink-0 flex-col gap-0.5 border-e border-sheen-border p-1.5 sm:w-44 sm:p-2"
          >
            {notes.map((n) => (
              <button
                key={n.id}
                type="button"
                aria-current={n.id === activeId ? "true" : undefined}
                onClick={() => setActiveId(n.id)}
                className={cn(
                  "min-h-9 truncate rounded-sheen-sm px-2.5 text-start text-xs font-medium text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast) sm:text-sm any-pointer-coarse:min-h-11",
                  "hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                  "aria-current:bg-sheen-accent-soft aria-current:text-sheen-accent forced-colors:aria-current:border forced-colors:aria-current:border-[Highlight]",
                )}
              >
                {n.title}
              </button>
            ))}
          </nav>
        )}
        <article className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-semibold tracking-tight">{note.title}</h3>
          <p
            className={cn(
              "mt-2 text-pretty text-sheen-fg-muted",
              size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg leading-relaxed",
            )}
          >
            {note.body}
          </p>
          {wordCount && <p className="mt-auto pt-4 text-xs text-sheen-fg-muted">{words} words</p>}
        </article>
      </div>
    </div>
  );
}
