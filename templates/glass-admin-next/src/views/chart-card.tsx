import type { ReactNode } from "react";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/sheenui/glass-card/glass-card";

/** A glass card with a heading and a chart. Cards sit under the page's h1, so the headings are h2. */
export function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <GlassCard className="min-w-0">
      <GlassCardHeader className="p-5 pb-0">
        <GlassCardTitle headingLevel={2} className="text-base">
          {title}
        </GlassCardTitle>
        <GlassCardDescription>{description}</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="p-5">{children}</GlassCardContent>
    </GlassCard>
  );
}
