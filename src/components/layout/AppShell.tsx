import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { driveService } from "@/services/driveService";
import {
  Activity,
  Bell,
  Bot,
  Boxes,
  Cloud,
  Cpu,
  FlaskConical,
  Folder,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  Search,
  Settings as SettingsIcon,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/context/AppStateContext";
import { StatusBadge } from "@/components/common/primitives";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { NotificationCenter } from "@/components/layout/NotificationCenter";

const NAV = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/monitoring", label: "Live Monitoring", icon: Activity },
      { to: "/analytics", label: "Storage Analytics", icon: Gauge },
      { to: "/forecast", label: "Storage Forecast", icon: TrendingUp },
    ],
  },
  {
    group: "AI",
    items: [
      { to: "/insights", label: "AI Insights", icon: Lightbulb },
      { to: "/chat", label: "Ask HyperLoop", icon: MessageSquare },
      { to: "/recommendations", label: "Recommendations", icon: ListChecks },
      { to: "/agents", label: "Agent Activity", icon: Bot },
    ],
  },
  {
    group: "Storage",
    items: [
      { to: "/files", label: "File Explorer", icon: Folder },
      { to: "/migrations", label: "Migration History", icon: Boxes },
      { to: "/simulator", label: "What-if Simulator", icon: FlaskConical },
    ],
  },
  {
    group: "System",
    items: [
      { to: "/clouds", label: "Connected Clouds", icon: Cloud },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
] as const;

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/monitoring": "Live Monitoring",
  "/analytics": "Storage Analytics",
  "/forecast": "Storage Forecast",
  "/insights": "AI Insights",
  "/chat": "Ask HyperLoop",
  "/recommendations": "Recommendations",
  "/agents": "Agent Activity",
  "/files": "File Explorer",
  "/migrations": "Migration History",
  "/simulator": "What-if Simulator",
  "/clouds": "Connected Clouds",
  "/settings": "Settings",
};

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { snapshot: demoSnapshot, unreadCount, providers } = useAppState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: live } = useQuery({
    queryKey: ["drive-overview"],
    queryFn: driveService.getOverview,
    staleTime: 60_000,
  });
  const snapshot = live
    ? { ...demoSnapshot, provider: "Google Drive · Live", usedGb: live.usedGb, totalGb: Number(live.totalGb.toFixed(0)) }
    : demoSnapshot;
  const [userName, setUserName] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUserName((u?.user_metadata?.["full_name"] as string | undefined) || u?.email || "");
    });
  }, []);
  const initials = (userName || "U").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageTitle = TITLES[pathname] ?? "HyperLoop AI";
  const connected = providers.find((p) => p.status === "connected");

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/12">
          <Cpu className="size-4.5 text-primary" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              HyperLoop <span className="text-gradient-brand">AI</span>
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              Intelligent Cloud Storage
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            {!collapsed && (
              <p className="px-2.5 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center",
                  )}
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-[inset_2px_0_0_0_var(--color-primary)]",
                  }}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-3 rounded-lg border border-border bg-card/50 p-3">
            <p className="text-[11px] text-muted-foreground">{snapshot.provider}</p>
            <p className="mt-1 text-sm font-semibold">
              {snapshot.usedGb.toFixed(1)} GB
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                / {snapshot.totalGb} GB
              </span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(snapshot.usedGb / snapshot.totalGb) * 100}%` }}
              />
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden w-full items-center justify-center gap-2 rounded-lg border border-border px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground lg:flex"
        >
          <PanelLeftClose className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border">
            <button
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 z-10 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <h2 className="hidden text-sm font-semibold sm:block">{pageTitle}</h2>

          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:ml-6"
          >
            <Search className="size-3.5" />
            <span className="truncate">Search files, insights, agents...</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <StatusBadge tone={connected ? "success" : "danger"} dot className="hidden md:inline-flex">
              {connected ? `${connected.name} · Connected` : "No cloud connected"}
            </StatusBadge>

            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border py-1 pr-1 pl-1">
              <span className="grid size-7 place-items-center rounded-md bg-violet/15 text-xs font-semibold text-violet">
                {initials}
              </span>
              <span className="hidden max-w-[140px] truncate text-xs font-medium sm:block">{userName}</span>
              <button
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
