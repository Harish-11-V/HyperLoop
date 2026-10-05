import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AppStateProvider } from "@/context/AppStateContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_shell")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
