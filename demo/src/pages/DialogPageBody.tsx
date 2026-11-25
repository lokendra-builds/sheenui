import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  useToast,
} from "@sheenui/theme";

import { Page, PropsTable } from "../layout/Page";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { DialogScene as DialogSceneData } from "../layout/ShowcaseStage.dialog";
import { DialogScene } from "../layout/ShowcaseStage.dialog.scene";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";

/** The "Dialog" docs page (/components/dialog): live examples, props and notes. */
export function DialogPage() {
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  // The first example plays itself once when it scrolls into view (and on "Replay"): the dialog opens, then closes.
  // While it plays it is non-modal and takes no focus, so it never steals focus or locks the page; any real
  // interaction (a click on the trigger, Escape) hands it back to normal.
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const playProfile = () => {
    setDemoPlaying(true);
    setProfileOpen(true);
    // Close first and stay non-modal until the exit has finished, so focus never returns to the trigger.
    let settle = 0;
    const timer = window.setTimeout(() => {
      setProfileOpen(false);
      settle = window.setTimeout(() => setDemoPlaying(false), 600);
    }, 2400);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(settle);
      setProfileOpen(false);
      settle = window.setTimeout(() => setDemoPlaying(false), 600);
    };
  };

  return (
    <Page
      eyebrow="Component"
      title="Dialog"
      description="A strong-glass modal that springs in. Focus is trapped inside, Escape closes it, and focus returns to the trigger, all from Base UI."
      source="theme/src/components/dialog/dialog.tsx"
    >
      <ShowcaseStage<DialogSceneData>
        label="Dialog demo"
        story={() => import("../layout/ShowcaseStage.dialog")}
        initial={{ open: false, step: 0 }}
        minHeight="21rem"
        onInterrupt="keep"
      >
        {(scene, ctx) => <DialogScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Edit profile"
        autoplayMode="manual"
        autoplay={playProfile}
        code={`
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@sheenui/theme";

export function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes are saved to your account.</DialogDescription>
        </DialogHeader>
        <Input label="Name" defaultValue="Ada Lovelace" />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`}
      >
        <Dialog
          open={profileOpen}
          modal={!demoPlaying}
          onOpenChange={(next) => {
            setDemoPlaying(false);
            setProfileOpen(next);
          }}
        >
          <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
          <DialogContent initialFocus={!demoPlaying} finalFocus={!demoPlaying}>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Changes are saved to your account.</DialogDescription>
            </DialogHeader>
            <Input label="Name" defaultValue="Ada Lovelace" />
            <Input label="Username" defaultValue="ada-lovelace" leading={<span className="text-xs">@</span>} />
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <DialogClose render={<Button onClick={() => toast.success("Profile saved")} />}>Save</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example
        title="Controlled, with a form"
        description="Open state lives in your component, so any button (or code) can open it and a successful submit can close it."
        code={`
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  useToast,
} from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite a teammate</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join the workspace.</DialogDescription>
          </DialogHeader>
          <form
            id="invite-form"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              toast.success("Invitation sent");
            }}
          >
            <Input label="Email" type="email" required placeholder="name@example.com" />
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" form="invite-form">Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
      >
        <Button onClick={() => setInviteOpen(true)}>Invite a teammate</Button>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>They get an email with a link to join the workspace.</DialogDescription>
            </DialogHeader>
            <form
              id="invite-form"
              onSubmit={(event) => {
                event.preventDefault();
                setInviteOpen(false);
                toast.success("Invitation sent");
              }}
            >
              <Input label="Email" type="email" required placeholder="name@example.com" />
            </form>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button type="submit" form="invite-form">
                Send invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example
        title="Bottom sheet on phones"
        phonePreview
        description="mobile='sheet' presents the dialog as a bottom sheet under 640px wide: full width, a drag handle you can swipe down, content scrolling inside a 85dvh cap, safe-area padding. Escape, the close button and focus return work as before. The default, 'popup', keeps the centred window. Press “Preview on a phone” to try it on a desktop screen (or narrow the window)."
        code={`
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Dialog mobile="sheet">
      <DialogTrigger render={<Button>Share</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this file</DialogTitle>
          <DialogDescription>Anyone with the link can view it.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`}
      >
        <Dialog mobile="sheet">
          <DialogTrigger render={<Button>Share</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share this file</DialogTitle>
              <DialogDescription>Anyone with the link can view it.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Done</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <PropsTable
        of={PROPS.Dialog}
        rows={[
          ["Dialog open / defaultOpen", "boolean", "false", "Controlled or uncontrolled open state."],
          ["Dialog onOpenChange", "(open) => void", "", "Called when the dialog opens or closes."],
          [
            "DialogTrigger / DialogClose render",
            "ReactElement",
            "",
            "Render as your own element, e.g. render={<Button />}.",
          ],
          [
            "DialogContent initialFocus / finalFocus",
            "ref | function | boolean",
            "first control / trigger",
            "Where focus goes when the dialog opens and closes (Base UI).",
          ],
        ]}
      />
      <PropsTable of={PROPS.DialogContent} title="DialogContent props" as="h3" />
      <KeyboardTable
        rows={[
          ["Enter / Space", "Open it from the trigger; focus moves inside."],
          ["Tab / Shift + Tab", "Cycle through the controls inside; focus cannot leave while it is open."],
          ["Escape", "Close it and return focus to the trigger."],
        ]}
      />
      <A11yNotes
        items={[
          'Built on Base UI\'s Dialog: role="dialog", named by DialogTitle and described by DialogDescription; the page behind is inert while it is open.',
          "Focus is trapped, starts on the first control (or initialFocus) and returns to the trigger on close.",
          "Always render a DialogTitle; showClose adds a labeled close button. Under reduced motion the dialog only fades.",
        ]}
      />
    </Page>
  );
}
