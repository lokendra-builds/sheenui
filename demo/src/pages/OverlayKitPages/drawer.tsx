import { useState } from "react";
import { Avatar, Badge, Button, Input, Switch, useToast } from "@sheenui/theme";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerSnapPoint,
} from "@sheenui/theme";
import { Segmented } from "../../layout/Segmented";
import { Icon, icons } from "./shared";

/* =====================================================================
 * Drawer
 * ===================================================================== */

const shareTargets = [
  { label: "Messages", icon: icons.message },
  { label: "Mail", icon: icons.mail },
  { label: "Chat app", icon: icons.hash },
  { label: "Notes", icon: icons.note },
  { label: "More", icon: icons.more },
] as const;

const places = [
  { name: "Blue Bottle Coffee", kind: "Café", distance: "120 m", rating: 4.7 },
  { name: "Tartine Manufactory", kind: "Bakery", distance: "350 m", rating: 4.6 },
  { name: "Dolores Park", kind: "Park", distance: "600 m", rating: 4.8 },
  { name: "Bi-Rite Creamery", kind: "Ice cream", distance: "650 m", rating: 4.7 },
  { name: "Mission Library", kind: "Library", distance: "800 m", rating: 4.5 },
  { name: "Ritual Coffee", kind: "Café", distance: "900 m", rating: 4.4 },
  { name: "Foreign Cinema", kind: "Restaurant", distance: "1.1 km", rating: 4.6 },
  { name: "Clarion Alley", kind: "Street art", distance: "1.2 km", rating: 4.5 },
  { name: "Valencia Cyclery", kind: "Bike shop", distance: "1.3 km", rating: 4.4 },
  { name: "Mission Dolores", kind: "Landmark", distance: "1.4 km", rating: 4.6 },
  { name: "Alamo Drafthouse", kind: "Cinema", distance: "1.6 km", rating: 4.5 },
  { name: "Heath Ceramics", kind: "Design store", distance: "1.9 km", rating: 4.8 },
] as const;

const snapOptions = [
  { value: "peek", label: "Peek" },
  { value: "half", label: "Half" },
  { value: "full", label: "Full" },
] as const;

type SnapName = (typeof snapOptions)[number]["value"];

export function ShareSheetDemo() {
  const toast = useToast();
  return (
    <Drawer>
      <DrawerTrigger render={<Button leading={<Icon d={icons.share} className="size-4" />} />}>Share</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share “Q3 roadmap”</DrawerTitle>
          <DrawerDescription>Anyone in Acme with the link can view and comment.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-5 pb-4">
          {/* Five columns from 360px; on the narrowest phones a sideways-scrolling row (like iOS) whose last icon peeks in. */}
          <ul className="-mx-5 flex snap-x scroll-px-5 gap-1 overflow-x-auto px-5 py-1 [scrollbar-width:none] min-[360px]:mx-0 min-[360px]:grid min-[360px]:grid-cols-5 min-[360px]:overflow-visible min-[360px]:px-0">
            {shareTargets.map((target) => (
              <li key={target.label} className="w-16 shrink-0 snap-start min-[360px]:w-auto min-[360px]:min-w-0">
                <DrawerClose
                  onClick={() => toast.success(`Shared via ${target.label}`)}
                  className="group flex w-full flex-col items-center gap-1.5 rounded-sheen-md py-1.5 text-xs text-sheen-fg-muted min-[360px]:text-2xs min-[400px]:text-xs transition-colors hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
                >
                  <span className="glass-1 flex size-12 items-center justify-center rounded-sheen-full text-sheen-fg transition-[scale] duration-(--sheen-duration-snappy) ease-sheen-snappy motion-ok:group-active:scale-90">
                    <Icon d={target.icon} />
                  </span>
                  <span className="w-full truncate text-center">{target.label}</span>
                </DrawerClose>
              </li>
            ))}
          </ul>
          <Input
            label="Link"
            readOnly
            defaultValue="https://example.com/d/q3-roadmap"
            onFocus={(event) => event.currentTarget.select()}
            trailing={
              <Button
                size="sm"
                variant="ghost"
                className="-me-2"
                onClick={() => {
                  // `navigator.clipboard` is missing in insecure contexts, which the DOM typings do not show.
                  const nav: { clipboard?: Clipboard } = navigator;
                  void nav.clipboard?.writeText("https://example.com/d/q3-roadmap").catch(() => undefined);
                  toast.success("Link copied");
                }}
              >
                Copy
              </Button>
            }
          />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="glass" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function NearbySheetDemo() {
  const toast = useToast();
  const [snap, setSnap] = useState<DrawerSnapPoint | null>("half");
  const current = (typeof snap === "string" && snapOptions.some((o) => o.value === snap) ? snap : "half") as SnapName;

  return (
    <Drawer
      snapPoints={["peek", "half", "full"]}
      defaultSnapPoint="half"
      snapPoint={snap}
      onSnapPointChange={setSnap}
      onOpenChange={(open) => open && setSnap("half")}
    >
      <DrawerTrigger render={<Button variant="glass" leading={<Icon d={icons.pin} className="size-4" />} />}>
        Nearby places
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-3">
          <div className="flex flex-col gap-1">
            <DrawerTitle>Nearby</DrawerTitle>
            {/* On a short (landscape) screen the description is read out but not shown, so rows fit. */}
            <DrawerDescription className="[@media(max-height:30rem)]:sr-only">
              12 places within 2 km. Drag the handle, or pick a height.
            </DrawerDescription>
          </div>
          <Segmented size="sm" label="Sheet height" options={snapOptions} value={current} onValueChange={setSnap} />
        </DrawerHeader>
        <DrawerBody className="px-3 pb-4">
          <ul className="flex flex-col">
            {places.map((place) => (
              <li key={place.name}>
                <button
                  type="button"
                  onClick={() => toast.info(`Directions to ${place.name}`, `${place.distance} away`)}
                  className="flex w-full items-center gap-3 rounded-sheen-md px-2 py-2.5 text-start transition-colors hover:bg-sheen-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-sheen-full bg-sheen-accent-soft text-sheen-accent">
                    <Icon d={icons.pin} className="size-4.5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{place.name}</span>
                    <span className="truncate text-xs text-sheen-fg-muted">
                      {place.kind} · {place.distance}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-sheen-fg-muted tabular-nums">
                    <Icon d={icons.star} className="size-3.5 text-sheen-warning" />
                    {place.rating.toFixed(1)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

const navItems = [
  { label: "Home", icon: icons.home, badge: undefined },
  { label: "Inbox", icon: icons.inbox, badge: "12" },
  { label: "Reports", icon: icons.chart, badge: undefined },
  { label: "Settings", icon: icons.gear, badge: undefined },
] as const;

const notifications = [
  { who: "Mira Okafor", what: "commented on Q3 roadmap", when: "2 min" },
  { who: "Deploy bot", what: "shipped v2.4.0 to production", when: "18 min" },
  { who: "Sam Rivera", what: "invited you to Design crit", when: "1 h" },
] as const;

export function SideSheetsDemo() {
  const toast = useToast();
  const [active, setActive] = useState("Home");

  return (
    <>
      <Drawer side="left">
        <DrawerTrigger render={<Button variant="glass" />}>Menu (left)</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Acme</DrawerTitle>
            <DrawerDescription>Workspace · 8 members</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="px-3">
            <nav aria-label="Main">
              <ul className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <DrawerClose
                      onClick={() => setActive(item.label)}
                      aria-current={active === item.label ? "page" : undefined}
                      className="flex h-11 w-full items-center gap-3 rounded-sheen-md px-3 text-sm font-medium text-sheen-fg-muted transition-colors hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus aria-[current=page]:bg-sheen-accent-soft aria-[current=page]:text-sheen-accent"
                    >
                      <Icon d={item.icon} className="size-4.5" />
                      <span className="flex-1 text-start">{item.label}</span>
                      {item.badge && <Badge tone="accent">{item.badge}</Badge>}
                    </DrawerClose>
                  </li>
                ))}
              </ul>
            </nav>
          </DrawerBody>
          <DrawerFooter className="flex-row items-center sm:justify-start">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name="Ada Lovelace" status="online" size="sm" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">Ada Lovelace</span>
                <span className="truncate text-xs text-sheen-fg-muted">Admin</span>
              </span>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer side="right">
        <DrawerTrigger render={<Button variant="glass" />}>Settings (right, inset)</DrawerTrigger>
        <DrawerContent inset>
          <DrawerHeader>
            <DrawerTitle>Notification settings</DrawerTitle>
            <DrawerDescription>Choose what reaches you, and where.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-5 py-3">
            <Input label="Email" type="email" defaultValue="ada@example.com" />
            <Switch label="Mentions" description="When someone @mentions you." defaultChecked />
            <Switch label="Comments" description="Replies on documents you follow." defaultChecked />
            <Switch label="Weekly digest" description="A summary every Monday." />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
            <DrawerClose render={<Button onClick={() => toast.success("Settings saved")} />}>Save</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer side="top">
        <DrawerTrigger render={<Button variant="glass" leading={<Icon d={icons.bell} className="size-4" />} />}>
          Top
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>3 new since this morning.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="pb-4">
            <ul className="flex flex-col divide-y divide-sheen-border">
              {notifications.map((n) => (
                <li key={n.what} className="flex items-start gap-3 py-3">
                  <Avatar name={n.who} size="sm" />
                  <p className="min-w-0 flex-1 text-sm">
                    <span className="font-medium">{n.who}</span> <span className="text-sheen-fg-muted">{n.what}</span>
                  </p>
                  <span className="shrink-0 text-xs text-sheen-fg-muted">{n.when}</span>
                </li>
              ))}
            </ul>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

const cart = [
  { name: "Glass desk lamp", price: 89 },
  { name: "Linen notebook", price: 18 },
  { name: "Ceramic mug", price: 24 },
] as const;

const deliveryOptions = [
  { id: "standard", label: "Standard", detail: "3–5 days", price: "Free" },
  { id: "express", label: "Express", detail: "Tomorrow", price: "$9" },
  { id: "pickup", label: "Pick up", detail: "Valencia St store, today", price: "Free" },
] as const;

export function NestedSheetsDemo() {
  const toast = useToast();
  const [delivery, setDelivery] = useState<(typeof deliveryOptions)[number]["id"]>("standard");
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const chosen = deliveryOptions.find((o) => o.id === delivery) ?? deliveryOptions[0];

  return (
    <Drawer>
      <DrawerTrigger render={<Button leading={<Icon d={icons.bag} className="size-4" />} />}>Cart (3)</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Your cart</DrawerTitle>
          <DrawerDescription>3 items · ${total}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4 pb-4">
          <ul className="flex flex-col divide-y divide-sheen-border">
            {cart.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>{item.name}</span>
                <span className="font-medium tabular-nums">${item.price}</span>
              </li>
            ))}
          </ul>

          <Drawer>
            <DrawerTrigger className="glass-1 flex min-h-11 w-full items-center gap-3 rounded-sheen-md px-3.5 py-2.5 text-start text-sm transition-colors hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus">
              <Icon d={icons.truck} className="size-4.5 text-sheen-fg-muted" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">Delivery: {chosen.label}</span>
                <span className="truncate text-xs text-sheen-fg-muted">{chosen.detail}</span>
              </span>
              <span className="text-xs font-medium text-sheen-accent">Change</span>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Delivery</DrawerTitle>
                <DrawerDescription>The cart steps back while you choose.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="pb-4">
                <ul className="flex flex-col gap-2">
                  {deliveryOptions.map((option) => (
                    <li key={option.id}>
                      <DrawerClose
                        data-selected={delivery === option.id ? "" : undefined}
                        onClick={() => setDelivery(option.id)}
                        className="flex min-h-14 w-full items-center gap-3 rounded-sheen-md border border-sheen-border px-3.5 py-2.5 text-start text-sm transition-colors hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus data-selected:border-sheen-accent-border data-selected:bg-sheen-accent-soft"
                      >
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium">
                            {option.label}
                            {delivery === option.id && <span className="sr-only"> (selected)</span>}
                          </span>
                          <span className="text-xs text-sheen-fg-muted">{option.detail}</span>
                        </span>
                        <span className="font-medium tabular-nums">{option.price}</span>
                      </DrawerClose>
                    </li>
                  ))}
                </ul>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose
            render={<Button fullWidth onClick={() => toast.success("Order placed", `${chosen.label} delivery`)} />}
          >
            Pay ${total}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
