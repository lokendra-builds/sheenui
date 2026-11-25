import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SheenBackdrop } from "@/components/sheenui/backdrop/backdrop";
import { sheenPreferenceScript } from "@/components/sheenui/hooks/use-preferences";
import { SheenMotionProvider } from "@/components/sheenui/motion/provider";
import { ToastProvider, Toaster } from "@/components/sheenui/toast/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumen Console",
  description: "Lumen Console: a glass admin dashboard starter built with SheenUI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-sheen-style="liquid" suppressHydrationWarning>
      <head>
        {/* Restores the saved theme and style before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: sheenPreferenceScript }} />
      </head>
      <body>
        <SheenMotionProvider>
          <ToastProvider>
            <SheenBackdrop />
            {children}
            <Toaster />
          </ToastProvider>
        </SheenMotionProvider>
      </body>
    </html>
  );
}
