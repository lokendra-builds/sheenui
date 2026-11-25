import { useState } from "react";
import { Button, GlassCard, Input, Switch } from "@sheenui/theme";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
import { I, icon } from "./shared";

export function AccordionControlledDemo() {
  // Every item that can open: the disabled Billing item stays closed.
  const all = ["profile", "notifications", "security"];
  const [open, setOpen] = useState<string[]>(["profile"]);
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="glass" onClick={() => setOpen(all)}>
          Expand all
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen([])}>
          Collapse all
        </Button>
        <p aria-live="polite" className="ms-auto text-xs text-sheen-fg-muted">
          {open.length === 0 ? "All sections closed" : `Open: ${open.join(", ")}`}
        </p>
      </div>
      <GlassCard className="p-2">
        <Accordion variant="plain" multiple value={open} onValueChange={(value) => setOpen(value as string[])}>
          <AccordionItem value="profile">
            <AccordionTrigger icon={icon(I.user)}>Profile</AccordionTrigger>
            <AccordionPanel contentClassName="flex flex-col gap-3">
              <Input label="Display name" defaultValue="Ada Lovelace" />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="notifications">
            <AccordionTrigger icon={icon(I.bell)}>Notifications</AccordionTrigger>
            <AccordionPanel contentClassName="flex flex-col gap-3">
              <Switch label="Email me when someone mentions me" defaultChecked />
              <Switch label="Weekly digest" />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger icon={icon(I.lock)} description="Two-factor is on">
              Security
            </AccordionTrigger>
            <AccordionPanel>Sign-ins from new devices ask for a code from your authenticator app.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="billing" disabled>
            <AccordionTrigger icon={icon(I.card)} description="Ask an owner to unlock">
              Billing
            </AccordionTrigger>
            <AccordionPanel>Only workspace owners can change billing.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </GlassCard>
    </div>
  );
}
