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
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { nameStageMenu, useHotItem } from "./ShowcaseStage.hot";
import type { StageContext } from "./ShowcaseStage";
import type { MenubarScene } from "./ShowcaseStage.menubar";

/** The live Menubar on its stage: File opens, hovering across opens View, and a View choice changes the note. */
export function MenubarScene({ scene, ctx }: { scene: MenubarScene; ctx: StageContext }) {
  const [menu, setMenu] = useFollow(scene.menu);
  const [size, setSize] = useFollow(scene.size);
  useHotItem("menubar", menu === "view", scene.hot === null ? null : scene.hot + 2);
  const set = (name: MenubarScene["menu"]) => (open: boolean) => setMenu(open ? name : menu === name ? "" : menu);
  return (
    <div className="sheen-stage-col">
      <Menubar aria-label="Notes menu" modal={false}>
        <MenubarMenu open={menu === "file"} onOpenChange={set("file")}>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent data-stage-menu="menubar" ref={nameStageMenu} className="w-52">
            <MenuItem shortcut="mod+n">New note</MenuItem>
            <MenuItem shortcut="mod+o">Open…</MenuItem>
            <MenuSeparator />
            <MenuItem shortcut="mod+p">Print…</MenuItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu open={menu === "view"} onOpenChange={set("view")}>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent data-stage-menu="menubar" ref={nameStageMenu} className="w-52">
            <MenuCheckboxItem checked shortcut="mod+\\">
              Sidebar
            </MenuCheckboxItem>
            <MenuSeparator />
            <MenuRadioGroup
              value={size}
              onValueChange={(v) => {
                setSize(v as "sm" | "md");
                ctx.setState("success");
              }}
            >
              <MenuLabel>Text size</MenuLabel>
              <MenuRadioItem value="sm" shortcut="mod+-">
                Small
              </MenuRadioItem>
              <MenuRadioItem value="md" shortcut="mod+0">
                Medium
              </MenuRadioItem>
            </MenuRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className={size === "md" ? "text-base text-sheen-fg" : "text-xs text-sheen-fg-muted"}>
        Shopping list: oat milk, limes, basil.
      </p>
    </div>
  );
}
