"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Button } from "@/components/sheenui/button/button";
import { CommandPalette, type CommandItem } from "@/components/sheenui/command/command";
import { useMediaQuery } from "@/components/sheenui/hooks/use-media-query";
import { useSheenStyle, useTheme } from "@/components/sheenui/hooks/use-preferences";
import { KbdShortcut } from "@/components/sheenui/kbd/kbd";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/sheenui/drawer/drawer";
import { Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@/components/sheenui/sidebar/sidebar";
import { AppLink, useNavigate, usePathname } from "@/lib/router";
import {
  ChartIcon,
  LogoMark,
  LogoutIcon,
  MenuIcon,
  OverviewIcon,
  SearchIcon,
  SettingsIcon,
  SidebarToggleIcon,
  UsersIcon,
} from "./icons";
import { NAV, PRODUCT, SIGN_IN_HREF } from "./nav";
import { ThemeControls } from "./theme-controls";

const NAV_ICONS = {
  overview: <OverviewIcon />,
  customers: <UsersIcon />,
  analytics: <ChartIcon />,
  settings: <SettingsIcon />,
} as const;

/**
 * The app shell: a collapsible glass sidebar, a glass header (command palette, style and theme
 * switches) and the page. Below 1024px the sidebar is an icon rail; below 640px it is an off-canvas
 * drawer opened from a menu button, so the page gets the full width.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { setStyle } = useSheenStyle();
  const wide = useMediaQuery("(min-width: 1024px)", { serverValue: true });
  const roomy = useMediaQuery("(min-width: 640px)", { serverValue: true });
  const [railed, setRailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // A page change (a link, the command palette) always closes the phone menu.
  useEffect(() => setMenuOpen(false), [pathname]);

  const commands = useMemo<CommandItem[]>(
    () => [
      ...NAV.map((item) => ({
        id: `go-${item.id}`,
        label: item.label,
        group: "Go to",
        icon: NAV_ICONS[item.id],
        keywords: ["page", "open"],
        onSelect: () => navigate(item.href),
      })),
      { id: "theme-light", label: "Light theme", group: "Appearance", keywords: ["day"], onSelect: () => setTheme("light") },
      { id: "theme-dark", label: "Dark theme", group: "Appearance", keywords: ["night"], onSelect: () => setTheme("dark") },
      { id: "theme-system", label: "System theme", group: "Appearance", onSelect: () => setTheme("system") },
      { id: "style-liquid", label: "Liquid Glass style", group: "Appearance", keywords: ["preset"], onSelect: () => setStyle("liquid") },
      { id: "style-aurora", label: "Aurora Neon style", group: "Appearance", keywords: ["preset"], onSelect: () => setStyle("aurora") },
      { id: "sign-out", label: "Sign out", group: "Account", icon: <LogoutIcon />, onSelect: () => navigate(SIGN_IN_HREF) },
    ],
    [navigate, setStyle, setTheme],
  );

  return (
    <div className="flex h-dvh gap-3 p-3 sm:gap-4 sm:p-4">
      <a
        href="#main"
        className="glass-3 fixed start-3 top-3 z-50 -translate-y-24 rounded-sheen-lg px-4 py-2.5 text-sm font-medium focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      {roomy && (
      <Sidebar aria-label="Main" collapsed={!wide || railed} morph className="shrink-0">
        <SidebarHeader>
          <span className="grid size-9 shrink-0 place-items-center">
            <LogoMark />
          </span>
          <span className={wide && !railed ? "truncate font-semibold tracking-tight" : "sr-only"}>{PRODUCT}</span>
        </SidebarHeader>
        <SidebarGroup label="Workspace" defaultOpen>
          {NAV.map((item) => (
            <SidebarItem
              key={item.id}
              href={item.href}
              render={<AppLink />}
              icon={NAV_ICONS[item.id]}
              active={pathname === item.href}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarGroup>
        <SidebarFooter className="flex-col items-stretch gap-1">
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            <Avatar name="Maya Okafor" size="sm" status="online" />
            {wide && !railed && (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">Maya Okafor</span>
                <span className="truncate text-xs text-sheen-fg-muted">maya@example.com</span>
              </span>
            )}
          </div>
          <SidebarItem href={SIGN_IN_HREF} render={<AppLink />} icon={<LogoutIcon />}>
            Sign out
          </SidebarItem>
        </SidebarFooter>
      </Sidebar>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
        <header className="glass-2 flex shrink-0 items-center gap-2 rounded-sheen-xl px-2.5 py-2">
          {!roomy && (
            <Drawer side="left" open={menuOpen} onOpenChange={setMenuOpen}>
              <DrawerTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu" className="min-h-11 min-w-11">
                    <MenuIcon />
                  </Button>
                }
              />
              <DrawerContent showClose>
                <DrawerHeader>
                  <DrawerTitle className="flex items-center gap-2.5">
                    <LogoMark />
                    {PRODUCT}
                  </DrawerTitle>
                  <DrawerDescription className="sr-only">Pages, appearance and account.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                  <nav aria-label="Main" className="flex flex-col gap-1">
                    {NAV.map((item) => (
                      <SidebarItem
                        key={item.id}
                        href={item.href}
                        render={<AppLink />}
                        icon={NAV_ICONS[item.id]}
                        active={pathname === item.href}
                        className="min-h-11"
                      >
                        {item.label}
                      </SidebarItem>
                    ))}
                  </nav>
                </DrawerBody>
                <DrawerFooter className="flex-col items-stretch gap-3">
                  <ThemeControls iconOnly={false} stacked />
                  <div className="flex items-center gap-2.5 px-1">
                    <Avatar name="Maya Okafor" size="sm" status="online" />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">Maya Okafor</span>
                      <span className="truncate text-xs text-sheen-fg-muted" title="maya@example.com">
                        maya@example.com
                      </span>
                    </span>
                  </div>
                  <SidebarItem href={SIGN_IN_HREF} render={<AppLink />} icon={<LogoutIcon />} className="min-h-11">
                    Sign out
                  </SidebarItem>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
          {wide && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={railed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setRailed((value) => !value)}
            >
              <SidebarToggleIcon />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <CommandPalette
              items={commands}
              trigger={
                <Button variant="glass" size="md" aria-label="Search or jump to" className="min-h-11 w-full max-w-sm justify-start">
                  <SearchIcon />
                  <span className="flex-1 truncate text-start text-sheen-fg-muted">{roomy ? "Search or jump to..." : "Search..."}</span>
                  {roomy && <KbdShortcut keys="mod+k" />}
                </Button>
              }
            />
          </div>
          {roomy && <ThemeControls iconOnly={!wide} />}
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-sheen-xl p-1.5 outline-none [scrollbar-width:thin]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
