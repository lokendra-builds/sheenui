import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { SheenBackdrop } from "@/components/sheenui/backdrop/backdrop";
import { SheenMotionProvider } from "@/components/sheenui/motion/provider";
import { ToastProvider, Toaster } from "@/components/sheenui/toast/toast";
import { App } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SheenMotionProvider>
      <ToastProvider>
        <SheenBackdrop />
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster />
      </ToastProvider>
    </SheenMotionProvider>
  </StrictMode>,
);
