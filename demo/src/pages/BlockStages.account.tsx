import { wait } from "../demo-utils";
import { useState } from "react";

import { lazyBlock } from "../layout/lazy-block";
import { BlockStage } from "../layout/ShowcaseStage.block.scene";
import { all, press, type } from "../layout/ShowcaseStage.block.drive";
import { DEMO_LOCALE, useDemoNow } from "../demo-clock";
import { NotificationPanel, sampleNotifications } from "./BlockAccountPages/notification-center";

// The same lazy islands the pages' own examples use (one chunk each, outside the initial JS).
const AuthSplit = lazyBlock(() => import("../../../theme/src/blocks/auth-split").then((m) => m.AuthSplit), {
  minHeight: "32rem",
  eager: true,
});
const SettingsPage = lazyBlock(() => import("../../../theme/src/blocks/settings-page").then((m) => m.SettingsPage), {
  minHeight: "40rem",
  eager: true,
});

const profile = {
  name: "Ada Lovelace",
  username: "ada",
  email: "ada@example.com",
  bio: "Writing the first program, one punch card at a time.",
  notifications: { mentions: true, comments: true, digest: true },
};

/** The stage at the top of /blocks/signup-page: the form is filled in and the account is created. */
export function AuthSplitStage() {
  return (
    <BlockStage
      label="Sign-up page demo"
      story="pay"
      width={980}
      height={901}
      fit={520}
      actions={[
        all(type("Full name", "Maya Rivera", 30), type("Work email", "maya@example.com", 30)),
        all(type("Password", "correct-horse-9", 30), press("I agree")),
        press("Create account"),
      ]}
    >
      {(_step, reduced) => <AuthSplit headingLevel="none" onSubmit={() => wait(reduced ? 0 : 1000)} />}
    </BlockStage>
  );
}
AuthSplitStage.isShowcaseStage = true;

/** The stage at the top of /blocks/notification-center: the unread tab is opened and everything is marked read. */
export function NotificationCenterStage() {
  const now = useDemoNow();
  const [items] = useState(sampleNotifications);
  return (
    <BlockStage
      label="Notification center demo"
      story="two"
      width={460}
      height={480}
      actions={[press("Unread"), press("Mark all as read")]}
    >
      <NotificationPanel
        defaultNotifications={items}
        headingLevel="none"
        viewAllHref="#"
        now={now}
        locale={DEMO_LOCALE}
        className="h-[30rem]"
      />
    </BlockStage>
  );
}
NotificationCenterStage.isShowcaseStage = true;

/** The stage at the top of /blocks/settings-page: a field is edited, a switch flipped and the changes are saved. */
export function SettingsPageStage() {
  return (
    <BlockStage
      label="Settings page demo"
      story="pay"
      width={900}
      height={600}
      fit={460}
      fade
      actions={[type("Display name", "Ada Lovelace-King", 30), press("Product updates"), press("Save changes")]}
    >
      {(_step, reduced) => (
        <div className="h-full w-full overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin]">
          <SettingsPage defaultValues={profile} headingLevel="none" onSave={() => wait(reduced ? 0 : 800)} />
        </div>
      )}
    </BlockStage>
  );
}
SettingsPageStage.isShowcaseStage = true;
