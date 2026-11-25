import { I } from "./shared";

/* =====================================================================
 * Accordion
 * ===================================================================== */

export const faqs = [
  {
    value: "shipping",
    icon: I.truck,
    title: "How long does shipping take?",
    description: "Orders and delivery",
    body: "Orders placed before 2 pm ship the same day. Standard delivery takes three to five business days; express arrives the next business day in most cities.",
  },
  {
    value: "returns",
    icon: I.undo,
    title: "Can I return an item?",
    description: "Free within 30 days",
    body: "Yes. Start a return from your order page within 30 days and drop the parcel at any pickup point. Refunds land on your original payment method within five days.",
  },
  {
    value: "warranty",
    icon: I.shield,
    title: "What does the warranty cover?",
    description: "Two years, parts and labour",
    body: "Every device carries a two-year warranty against manufacturing defects. Accidental damage is covered only with SheenCare.",
  },
  {
    value: "support",
    icon: I.message,
    title: "How do I reach support?",
    description: "Chat, email or phone",
    body: "Chat with us from any page, or email help@sheen.example. Phone support runs 8 am to 8 pm on weekdays.",
  },
] as const;

export const accordionFaqCode = `
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
import { MessageCircle as MessageIcon, Shield as ShieldIcon, Truck as TruckIcon, Undo2 as UndoIcon } from "lucide-react";

const faqs = [
  {
    value: "shipping",
    icon: <TruckIcon />,
    title: "How long does shipping take?",
    description: "Orders and delivery",
    body: "Orders placed before 2 pm ship the same day. Standard delivery takes three to five business days; express arrives the next business day in most cities.",
  },
  {
    value: "returns",
    icon: <UndoIcon />,
    title: "Can I return an item?",
    description: "Free within 30 days",
    body: "Yes. Start a return from your order page within 30 days and drop the parcel at any pickup point. Refunds land on your original payment method within five days.",
  },
  {
    value: "warranty",
    icon: <ShieldIcon />,
    title: "What does the warranty cover?",
    description: "Two years, parts and labour",
    body: "Every device carries a two-year warranty against manufacturing defects. Accidental damage is covered only with SheenCare.",
  },
  {
    value: "support",
    icon: <MessageIcon />,
    title: "How do I reach support?",
    description: "Chat, email or phone",
    body: "Chat with us from any page, or email help@sheen.example. Phone support runs 8 am to 8 pm on weekdays.",
  },
];

export function Example() {
  return (
    <Accordion defaultValue={["shipping"]}>
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger icon={faq.icon} description={faq.description}>
            {faq.title}
          </AccordionTrigger>
          <AccordionPanel>{faq.body}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}`;

export const accordionSeparatedCode = `
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Accordion variant="separated" multiple defaultValue={["plans", "billing"]}>
      <AccordionItem value="plans">
        <AccordionTrigger indicator="plus">Can I switch plans later?</AccordionTrigger>
        <AccordionPanel>Any time. Upgrades apply at once…</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger indicator="plus">When am I billed?</AccordionTrigger>
        <AccordionPanel>On the same day each month…</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="team">
        <AccordionTrigger indicator="plus">Do you offer team discounts?</AccordionTrigger>
        <AccordionPanel>Teams of ten or more get 20% off…</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}`;

export const accordionControlledCode = `
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  GlassCard,
} from "@sheenui/theme";
import { CreditCard as CardIcon, User as UserIcon } from "lucide-react";

export function Example() {
  const [open, setOpen] = useState<string[]>(["profile"]);
  // Every item that can open: the disabled one stays closed.
  const all = ["profile", "notifications", "security"];

  return (
    <>
      <Button size="sm" variant="glass" onClick={() => setOpen(all)}>Expand all</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen([])}>Collapse all</Button>

      <GlassCard className="p-2">
        <Accordion variant="plain" multiple value={open} onValueChange={(value) => setOpen(value as string[])}>
          <AccordionItem value="profile">
            <AccordionTrigger icon={<UserIcon />}>Profile</AccordionTrigger>
            <AccordionPanel>Name, photo and email.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="notifications">
            <AccordionTrigger>Notifications</AccordionTrigger>
            <AccordionPanel>Choose what we email you about.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger>Security</AccordionTrigger>
            <AccordionPanel>Password and two-step sign-in.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="billing" disabled>
            <AccordionTrigger icon={<CardIcon />} description="Ask an owner to unlock">Billing</AccordionTrigger>
            <AccordionPanel>Plans and invoices.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </GlassCard>
    </>
  );
}`;
