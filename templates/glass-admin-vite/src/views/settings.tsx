"use client";

import { SettingsPage } from "@/components/sheenui/blocks/settings-page";
import { useToast } from "@/components/sheenui/toast/toast";

/** The account form. `onSave` is where your API call goes; throw to show an error in the save bar. */
export function SettingsView() {
  const toast = useToast();
  return (
    <div className="pb-2">
      <SettingsPage
        title="Settings"
        description="Your profile, notifications and how the console looks."
        defaultValues={{
          name: "Maya Okafor",
          username: "maya",
          email: "maya@example.com",
          bio: "Runs revenue operations at Lumen Console.",
          avatar: null,
          notifications: { mentions: true, product: false },
        }}
        onSave={async () => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          toast.success("Settings saved", "This is a demo: nothing was sent anywhere.");
        }}
        onDeleteAccount={() => void toast.info("Demo only", "No account was deleted.")}
      />
    </div>
  );
}
