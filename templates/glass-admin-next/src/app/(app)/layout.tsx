import type { ReactNode } from "react";
import { AppShell } from "@/shell/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
