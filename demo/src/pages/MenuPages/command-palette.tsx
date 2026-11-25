import { useEffect, useState } from "react";
import { Badge, Button, useTheme, useToast } from "@sheenui/theme";
import { CommandPalette, type CommandItem } from "@sheenui/theme";
import { KbdShortcut } from "@sheenui/theme";
import { I, icon } from "./shared";

/* =====================================================================
 * Command palette
 * ===================================================================== */

function useDemoCommands(): CommandItem[] {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const go = (where: string) => () => toast.info(`Opening ${where}`);
  const languages = [
    { id: "en", label: "English" },
    { id: "es", label: "Español", keywords: ["spanish"] },
    { id: "de", label: "Deutsch", keywords: ["german"] },
    { id: "fr", label: "Français", keywords: ["french"] },
    { id: "hi", label: "हिन्दी", keywords: ["hindi"] },
    { id: "ja", label: "日本語", keywords: ["japanese"] },
  ];
  const themes = [
    { id: "light", label: "Light", icon: icon(I.sun) },
    { id: "dark", label: "Dark", icon: icon(I.moon) },
    { id: "system", label: "Match system", icon: icon(I.monitor) },
  ] as const;

  return [
    {
      id: "dashboard",
      label: "Dashboard",
      group: "Navigation",
      icon: icon(I.home),
      hint: "Jump to",
      onSelect: go("Dashboard"),
    },
    {
      id: "projects",
      label: "Projects",
      group: "Navigation",
      icon: icon(I.folder),
      hint: "Jump to",
      onSelect: go("Projects"),
    },
    {
      id: "inbox",
      label: "Inbox",
      group: "Navigation",
      icon: icon(I.inbox),
      hint: <Badge tone="accent">3 new</Badge>,
      onSelect: go("Inbox"),
    },
    {
      id: "settings",
      label: "Settings",
      description: "Profile, notifications, billing",
      keywords: ["preferences", "account", "config"],
      group: "Navigation",
      icon: icon(I.sliders),
      shortcut: "mod+,",
      onSelect: go("Settings"),
    },
    {
      id: "new-project",
      label: "New project",
      group: "Actions",
      icon: icon(I.plus),
      shortcut: "shift+mod+n",
      onSelect: () => toast.success("Project created"),
    },
    {
      id: "invite",
      label: "Invite teammate",
      group: "Actions",
      icon: icon(I.userPlus),
      shortcut: "mod+i",
      keywords: ["share", "add member"],
      onSelect: () => toast.success("Invite sent"),
    },
    {
      id: "copy-link",
      label: "Copy page link",
      group: "Actions",
      icon: icon(I.link),
      shortcut: "shift+mod+c",
      onSelect: () => toast.success("Link copied"),
    },
    {
      id: "theme",
      label: "Change theme…",
      group: "Actions",
      icon: icon(I.sun),
      keywords: ["dark mode", "light mode", "appearance"],
      placeholder: "Choose a theme…",
      items: themes.map((t) => ({
        id: `theme-${t.id}`,
        label: t.label,
        icon: t.icon,
        hint: theme === t.id ? "Current" : undefined,
        onSelect: () => {
          setTheme(t.id);
          toast.success(`Theme: ${t.label}`);
        },
      })),
    },
    {
      id: "language",
      label: "Change language…",
      group: "Actions",
      icon: icon(I.globe),
      keywords: ["locale", "translate"],
      placeholder: "Search languages…",
      items: languages.map((l) => ({
        ...l,
        id: `lang-${l.id}`,
        onSelect: () => toast.success(`Language: ${l.label}`),
      })),
    },
    {
      id: "export",
      label: "Export workspace",
      group: "Actions",
      icon: icon(I.download),
      hint: "Pro plan",
      disabled: true,
    },
    {
      id: "shortcuts",
      label: "Keyboard shortcuts",
      group: "Help",
      icon: icon(I.keyboard),
      shortcut: "mod+/",
      onSelect: go("Keyboard shortcuts"),
    },
    {
      id: "docs",
      label: "Documentation",
      group: "Help",
      icon: icon(I.book),
      keywords: ["guide", "manual"],
      onSelect: go("Documentation"),
    },
    {
      id: "support",
      label: "Contact support",
      group: "Help",
      icon: icon(I.message),
      keywords: ["help", "chat"],
      onSelect: go("Support"),
    },
  ];
}

export function PaletteDemo() {
  const items = useDemoCommands();
  return (
    <CommandPalette
      items={items}
      recentStorageKey="sheen-demo:command-recent"
      trigger={
        <Button
          variant="glass"
          className="w-full max-w-xs justify-start text-sheen-fg-muted"
          leading={icon(I.search)}
          trailing={<KbdShortcut keys="mod+k" className="ms-auto" />}
        >
          Search or jump to…
        </Button>
      }
    />
  );
}

const people = [
  ["Ada Lovelace", "Analyst"],
  ["Grace Hopper", "Compiler pioneer"],
  ["Alan Turing", "Mathematician"],
  ["Katherine Johnson", "Orbital mechanics"],
  ["Margaret Hamilton", "Flight software lead"],
  ["Barbara Liskov", "Language designer"],
  ["Radia Perlman", "Network engineer"],
  ["Frances Allen", "Optimizing compilers"],
  ["Edsger Dijkstra", "Algorithms"],
  ["Hedy Lamarr", "Frequency hopping"],
  ["Annie Easley", "Rocket software"],
  ["Donald Knuth", "Typesetting"],
] as const;

function toPerson([name, role]: (typeof people)[number]): CommandItem {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("");
  return {
    id: name,
    label: name,
    description: role,
    group: "People",
    icon: <span className="text-2xs font-semibold text-sheen-accent">{initials}</span>,
  };
}

export function AsyncPeopleDemo() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandItem[]>(() => people.slice(0, 6).map(toPerson));
  const [loading, setLoading] = useState(false);

  // Pretend each search goes to a server (400ms).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const q = query.trim().toLowerCase();
      const found = q
        ? people.filter(([name, role]) => `${name} ${role}`.toLowerCase().includes(q))
        : people.slice(0, 6);
      setResults(found.map(toPerson));
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <CommandPalette
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setQuery("");
      }}
      shortcut={false}
      trigger={
        <Button variant="glass" leading={icon(I.user)}>
          Find a person
        </Button>
      }
      items={results}
      query={query}
      onQueryChange={(q) => {
        setQuery(q);
        setLoading(true);
      }}
      filter={false}
      loading={loading}
      maxRecent={0}
      onSelect={(item) => toast.success(`Assigned to ${item.label}`)}
      labels={{ placeholder: "Search people…", inputLabel: "Search people", title: "Find a person" }}
    />
  );
}
