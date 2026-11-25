import type { Metadata } from "next";
import { AnalyticsView } from "@/views/analytics";

export const metadata: Metadata = { title: "Analytics | Lumen Console" };

export default function Page() {
  return <AnalyticsView />;
}
