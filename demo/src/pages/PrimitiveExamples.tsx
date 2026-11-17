import { useState } from "react";
import {
  AspectRatio,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Sidebar,
  SidebarGroup,
  SidebarItem,
} from "@sheenui/theme";

/* Second examples for the Aspect ratio, Input group, Resizable and Sidebar pages (PrimitivePages.tsx). */

/* ---------------------------------------------------------- Aspect ratio */

export const aspectFigureCode = `
import { AspectRatio } from "@sheenui/theme";

export function Example() {
  return (
    <figure className="flex w-64 flex-col gap-2">
      <AspectRatio ratio={4 / 3} render={<div />} className="rounded-sheen-lg bg-gradient-to-br from-violet-400 to-teal-300" />
      <figcaption className="text-sm text-sheen-fg-muted">A 4:3 placeholder: the space is reserved before the image loads.</figcaption>
    </figure>
  );
}`;

export function AspectFigure() {
  return (
    <figure className="flex w-64 flex-col gap-2">
      <AspectRatio
        ratio={4 / 3}
        render={<div />}
        className="rounded-sheen-lg bg-gradient-to-br from-violet-400 to-teal-300"
      />
      <figcaption className="text-sm text-sheen-fg-muted">
        A 4:3 placeholder: the space is reserved before the image loads.
      </figcaption>
    </figure>
  );
}

/* ----------------------------------------------------------- Input group */

export const inputGroupFieldCode = `
import { useState } from "react";
import { Field, FieldControl, FieldError, FieldLabel, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";

export function Example() {
  const [slug, setSlug] = useState("");
  const invalid = slug.length > 0 && !/^[a-z0-9-]+$/.test(slug);

  return (
    <Field invalid={invalid} className="max-w-sm">
      <FieldLabel>Workspace address</FieldLabel>
      <InputGroup invalid={invalid}>
        <InputGroupAddon>
          <InputGroupText>example.com/</InputGroupText>
        </InputGroupAddon>
        <FieldControl>
          <InputGroupInput value={slug} onChange={(event) => setSlug(event.target.value)} />
        </FieldControl>
      </InputGroup>
      <FieldError>Use lowercase letters, numbers and dashes.</FieldError>
    </Field>
  );
}`;

export function InputGroupField() {
  const [slug, setSlug] = useState("");
  const invalid = slug.length > 0 && !/^[a-z0-9-]+$/.test(slug);

  return (
    <Field invalid={invalid} className="w-full max-w-sm">
      <FieldLabel>Workspace address</FieldLabel>
      <InputGroup invalid={invalid}>
        <InputGroupAddon>
          <InputGroupText>example.com/</InputGroupText>
        </InputGroupAddon>
        <FieldControl>
          <InputGroupInput value={slug} onChange={(event) => setSlug(event.target.value)} />
        </FieldControl>
      </InputGroup>
      <FieldError>Use lowercase letters, numbers and dashes.</FieldError>
    </Field>
  );
}

/* ------------------------------------------------------------- Resizable */

export const resizablePersistedCode = `
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@sheenui/theme";

const KEY = "my-app:layout";

export function Example() {
  const [layout, setLayout] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? (JSON.parse(saved) as number[]) : [30, 70];
    } catch {
      return [30, 70];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(layout));
    } catch {
      /* private mode: the layout just resets next visit */
    }
  }, [layout]);

  return (
    <ResizablePanelGroup layout={layout} onLayoutChange={setLayout} className="h-48 rounded-sheen-lg border border-sheen-border">
      <ResizablePanel minSize={15} maxSize={60}>
        <p className="p-4 text-sm">Sidebar: {Math.round(layout[0] ?? 0)}%</p>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel>
        <p className="p-4 text-sm">Content: {Math.round(layout[1] ?? 0)}%</p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}`;

export function ResizablePersisted() {
  const [layout, setLayout] = useState<number[]>([30, 70]);
  return (
    <ResizablePanelGroup
      layout={layout}
      onLayoutChange={setLayout}
      className="h-48 w-full rounded-sheen-lg border border-sheen-border"
    >
      <ResizablePanel minSize={15} maxSize={60}>
        <p className="p-4 text-sm">Sidebar: {Math.round(layout[0] ?? 0)}%</p>
      </ResizablePanel>
      <ResizableHandle withGrip />
      <ResizablePanel>
        <p className="p-4 text-sm">Content: {Math.round(layout[1] ?? 0)}%</p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/* --------------------------------------------------------------- Sidebar */

export const sidebarPhoneCode = `
import { Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

// Below lg, show the same sidebar in a Drawer that opens from a menu button; from lg up render <Sidebar> in the layout as usual.
export function PhoneNav() {
  return (
    <Drawer side="start">
      <DrawerTrigger render={<Button variant="glass" />}>Menu</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Pages of the workspace</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Sidebar aria-label="Workspace">
            <SidebarGroup label="Projects" defaultOpen>
              <SidebarItem href="#alpha" active>Alpha</SidebarItem>
              <SidebarItem href="#beta">Beta</SidebarItem>
            </SidebarGroup>
            <SidebarItem href="#settings">Settings</SidebarItem>
          </Sidebar>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}`;

export function SidebarPhone() {
  return (
    <Drawer side="start">
      <DrawerTrigger render={<Button variant="glass" />}>Menu</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Pages of the workspace</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Sidebar aria-label="Workspace">
            <SidebarGroup label="Projects" defaultOpen>
              <SidebarItem href="#alpha" active>
                Alpha
              </SidebarItem>
              <SidebarItem href="#beta">Beta</SidebarItem>
            </SidebarGroup>
            <SidebarItem href="#settings">Settings</SidebarItem>
          </Sidebar>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
