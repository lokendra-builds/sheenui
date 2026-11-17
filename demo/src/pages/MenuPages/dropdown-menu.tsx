import { useState } from "react";
import { Avatar, Badge, Button, cn, useToast } from "@sheenui/theme";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@sheenui/theme";
import { I, icon } from "./shared";

const chevronDown = icon(I.chevron, "size-4 text-sheen-fg-muted");

/* =====================================================================
 * Dropdown menu
 * ===================================================================== */

export function AccountMenuDemo() {
  const toast = useToast();
  const run = (label: string) => () => toast.info(label);
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant="glass"
            className="h-11 gap-2.5 pe-3 ps-1.5"
            leading={<Avatar name="Ada Lovelace" size="sm" />}
            trailing={chevronDown}
          />
        }
      >
        Ada Lovelace
      </MenuTrigger>
      <MenuContent className="w-72">
        <MenuHeader>
          {/* Flat initials here: the popup fades as it opens, and glass inside a fading parent loses its blur. */}
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sheen-accent-soft text-sm font-semibold text-sheen-accent"
          >
            AL
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">Ada Lovelace</span>
            <span className="truncate text-xs text-sheen-fg-muted">ada@example.com</span>
          </div>
        </MenuHeader>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem icon={icon(I.user)} shortcut="shift+mod+p" onClick={run("Profile")}>
            Profile
          </MenuItem>
          <MenuItem
            icon={icon(I.card)}
            shortcut="mod+b"
            trailing={<Badge tone="accent">Pro</Badge>}
            onClick={run("Billing")}
          >
            Billing
          </MenuItem>
          <MenuItem icon={icon(I.sliders)} shortcut="mod+," onClick={run("Settings")}>
            Settings
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger icon={icon(I.userPlus)}>Invite people</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem icon={icon(I.mail)} onClick={run("Invite by email")}>
              Email
            </MenuItem>
            <MenuItem icon={icon(I.message)} onClick={run("Invite by message")}>
              Message
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={icon(I.link)} onClick={() => toast.success("Invite link copied")}>
              Copy invite link
            </MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem icon={icon(I.cloud)} disabled trailing={<span className="text-xs text-sheen-fg-muted">Soon</span>}>
          API keys
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          icon={icon(I.logout)}
          tone="danger"
          shortcut="shift+mod+q"
          onClick={() => toast.error("Signed out", "See you soon, Ada.")}
        >
          Log out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

type Density = "compact" | "comfortable" | "spacious";

export function ViewOptionsDemo() {
  const [show, setShow] = useState({ toolbar: true, minimap: true, status: false });
  const [density, setDensity] = useState<Density>("comfortable");
  const toggle = (key: keyof typeof show) => (checked: boolean) => setShow((s) => ({ ...s, [key]: checked }));
  const lines = density === "compact" ? 6 : density === "comfortable" ? 5 : 4;

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <Menu>
        <MenuTrigger render={<Button variant="glass" trailing={chevronDown} />}>View</MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuLabel>Show</MenuLabel>
            <MenuCheckboxItem checked={show.toolbar} onCheckedChange={toggle("toolbar")} shortcut="shift+mod+t">
              Toolbar
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={show.minimap} onCheckedChange={toggle("minimap")} shortcut="shift+mod+m">
              Minimap
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={show.status} onCheckedChange={toggle("status")}>
              Status bar
            </MenuCheckboxItem>
            <MenuCheckboxItem disabled description="Needs a folder">
              Breadcrumbs
            </MenuCheckboxItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuRadioGroup value={density} onValueChange={(v) => setDensity(v as Density)}>
            <MenuLabel>Density</MenuLabel>
            <MenuRadioItem value="compact">Compact</MenuRadioItem>
            <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
            <MenuRadioItem value="spacious">Spacious</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>

      {/* A tiny editor that follows the menu, so every toggle has a visible result. */}
      <div aria-hidden className="glass-2 flex w-full flex-col overflow-hidden rounded-sheen-lg text-2xs">
        {show.toolbar && (
          <div className="flex gap-1.5 border-b border-sheen-border px-3 py-2">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-3 rounded-[3px] bg-sheen-hover" />
            ))}
          </div>
        )}
        <div className="flex gap-3 p-3">
          <div
            className={cn(
              "flex flex-1 flex-col",
              density === "compact" ? "gap-1" : density === "comfortable" ? "gap-2" : "gap-3.5",
            )}
          >
            {Array.from({ length: lines }, (_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full bg-sheen-fg-subtle/35"
                style={{ width: `${[92, 70, 84, 56, 78, 64][i]}%` }}
              />
            ))}
          </div>
          {show.minimap && <div className="w-8 rounded-[4px] bg-sheen-accent-soft" />}
        </div>
        {show.status && (
          <div className="border-t border-sheen-border px-3 py-1.5 text-sheen-fg-muted">Ln 12, Col 4 · UTF-8</div>
        )}
      </div>
      <p className="text-sm text-sheen-fg-muted" aria-live="polite">
        {Object.entries(show)
          .filter(([, on]) => on)
          .map(([k]) => k)
          .join(", ") || "Nothing"}{" "}
        shown · {density}
      </p>
    </div>
  );
}

const files = [
  { name: "Q3 roadmap.pdf", size: "2.4 MB" },
  { name: "Brand assets.zip", size: "48 MB" },
  { name: "Onboarding notes.md", size: "12 KB" },
];

export function RowActionsDemo() {
  const toast = useToast();
  return (
    <ul className="glass-2 flex w-full max-w-md flex-col rounded-sheen-lg p-1.5">
      {files.map((f) => (
        <li key={f.name} className="flex items-center gap-3 rounded-sheen-md px-2.5 py-2">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-sheen-sm bg-sheen-accent-soft text-sheen-accent"
          >
            {icon(I.file)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{f.name}</span>
            <span className="text-xs text-sheen-fg-muted">{f.size}</span>
          </span>
          <Menu>
            <MenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Actions for ${f.name}`} />}>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d={I.dots} />
              </svg>
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem icon={icon(I.pencil)} shortcut="enter" onClick={() => toast.info(`Rename ${f.name}`)}>
                Rename
              </MenuItem>
              <MenuItem icon={icon(I.copy)} shortcut="mod+d" onClick={() => toast.success(`Duplicated ${f.name}`)}>
                Duplicate
              </MenuItem>
              <MenuLinkItem icon={icon(I.external)} href="https://github.com/" target="_blank" rel="noopener">
                Open on GitHub
              </MenuLinkItem>
              <MenuSub>
                <MenuSubTrigger icon={icon(I.folder)}>Move to</MenuSubTrigger>
                <MenuSubContent>
                  {["Design", "Engineering", "Archive"].map((folder) => (
                    <MenuItem key={folder} icon={icon(I.folder)} onClick={() => toast.success(`Moved to ${folder}`)}>
                      {folder}
                    </MenuItem>
                  ))}
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem
                icon={icon(I.trash)}
                tone="danger"
                shortcut="mod+backspace"
                onClick={() => toast.error(`Deleted ${f.name}`)}
              >
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>
        </li>
      ))}
    </ul>
  );
}
