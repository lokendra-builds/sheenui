import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import { AppShell } from "@/shell/app-shell";

// One chunk per page, so the charts and the data table load only where they are used.
const OverviewView = lazy(() => import("@/views/overview").then((m) => ({ default: m.OverviewView })));
const CustomersView = lazy(() => import("@/views/customers").then((m) => ({ default: m.CustomersView })));
const AnalyticsView = lazy(() => import("@/views/analytics").then((m) => ({ default: m.AnalyticsView })));
const SettingsView = lazy(() => import("@/views/settings").then((m) => ({ default: m.SettingsView })));
const SignInView = lazy(() => import("@/views/sign-in").then((m) => ({ default: m.SignInView })));

function ShellLayout() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

export function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="sign-in" element={<SignInView />} />
        <Route element={<ShellLayout />}>
          <Route path="overview" element={<OverviewView />} />
          <Route path="customers" element={<CustomersView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
