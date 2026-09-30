import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AppStateProvider } from "@/context/AppStateContext";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
