import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@sheenui/theme";

import { Brand, Nav } from "./Nav";
import { PreferenceBar } from "./PreferenceBar";

type MobileMenuDialogProps = {
  path: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A link inside was followed to `to`. */
  onNavigate: (to: string) => void;
  /** Where focus goes when the menu closes: the menu button, or false after a navigation (the new page's h1 takes it). */
  returnFocus: () => HTMLElement | false | null;
};

/**
 * The phone menu (a dialog with the docs navigation and the display preferences). It is a lazy
 * chunk of its own (Shell.tsx): Base UI's Dialog and scroll lock are ~15 KB gzip that nobody
 * needs until the menu button is pressed.
 */
export default function MobileMenuDialog({ path, open, onOpenChange, onNavigate, returnFocus }: MobileMenuDialogProps) {
  // Mounted closed, then opened a commit later, so the first open still plays the entrance.
  const [shown, setShown] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the delay is the point: `shown` follows `open` one commit later so the first open still animates in
  useEffect(() => setShown(open), [open]);

  return (
    <Dialog
      open={shown}
      onOpenChange={(next) => {
        setShown(next);
        onOpenChange(next);
      }}
    >
      <DialogContent finalFocus={returnFocus} className="max-h-[85dvh] overflow-y-auto overscroll-contain">
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <Brand />
        <Nav
          path={path}
          label="Documentation menu"
          className="mx-0 me-0 flex-none overflow-visible px-0 pe-0"
          onNavigate={(to) => {
            onNavigate(to);
            onOpenChange(false);
          }}
        />
        <section aria-labelledby="menu-display" className="flex flex-col gap-3 border-t border-sheen-border pt-5">
          <h2 id="menu-display" className="px-1 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-muted uppercase">
            Display
          </h2>
          <PreferenceBar />
        </section>
      </DialogContent>
    </Dialog>
  );
}
