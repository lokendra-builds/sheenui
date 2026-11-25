import {
  Avatar,
  Badge,
  Button,
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@sheenui/theme";

import { useFollow } from "./ShowcaseStage.follow";
import { nameStageMenu, useHotItem } from "./ShowcaseStage.hot";
import type { StageContext } from "./ShowcaseStage";
import type { DropdownMenuScene } from "./ShowcaseStage.dropdown-menu";

/** The live account Menu on its stage: it opens under the button (the page stays usable) and Billing is chosen. */
export function DropdownMenuScene({ scene, ctx }: { scene: DropdownMenuScene; ctx: StageContext }) {
  const [open, setOpen] = useFollow(scene.open);
  const [picked, setPicked] = useFollow(scene.picked);
  useHotItem("dropdown", open, scene.hot);
  const pick = (name: string) => () => {
    setPicked(name);
    ctx.setState("success");
  };
  return (
    <div className="sheen-stage-col">
      <p className="sheen-stage-title">Account</p>
      <p className="sheen-stage-sub sheen-stage-slot">
        {picked ? <span className="sheen-stage-chip">Opened {picked}</span> : "Signed in as Ada."}
      </p>
      <Menu open={open} onOpenChange={setOpen} modal={false}>
        <MenuTrigger render={<Button variant="glass" leading={<Avatar name="Ada Lovelace" size="sm" />} />}>
          Ada Lovelace
        </MenuTrigger>
        <MenuContent data-stage-menu="dropdown" ref={nameStageMenu} className="w-64">
          <MenuHeader>
            <b>Ada Lovelace</b>
            <span>ada@example.com</span>
          </MenuHeader>
          <MenuSeparator />
          <MenuItem shortcut="shift+mod+p" onClick={pick("Profile")}>
            Profile
          </MenuItem>
          <MenuItem shortcut="mod+b" trailing={<Badge tone="accent">Pro</Badge>} onClick={pick("Billing")}>
            Billing
          </MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger" onClick={pick("Log out")}>
            Log out
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
