import type { Metadata } from "next";
import { OverviewView } from "@/views/overview";

export const metadata: Metadata = { title: "Overview | Lumen Console" };

export default function Page() {
  return <OverviewView />;
}
