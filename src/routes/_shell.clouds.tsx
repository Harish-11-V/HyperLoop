import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Cloud, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/context/AppStateContext";
import { driveService } from "@/services/driveService";
import { DemoTag, Panel, PageHeader, ProgressBar, StatusBadge } from "@/components/common/primitives";

export const Route = createFileRoute("/_shell/clouds")({
  head: () => ({
    meta: [
      { title: "Connected Clouds — HyperLoop AI" },
      {
        name: "description",
        content: "Manage the Google Drive connector and see upcoming cloud integrations.",
      },
      { property: "og:title", content: "Connected Clouds — HyperLoop AI" },
      {
        property: "og:description",
        content: "Modular connectors for Google Drive and future cloud providers.",
      },
    ],
  }),
  component: CloudsPage,
});

function CloudsPage() {
  const { providers, toggleProvider } = useAppState();
  const { data: live } = useQuery({
    queryKey: ["drive-overview"],
    queryFn: driveService.getOverview,
    staleTime: 60_000,
  });

  return (
    <div>
      <PageHeader
        title="Connected clouds"
        description="Google Drive is the first connector. Others are planned and not functional yet."
        actions={<DemoTag />}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((p) => {
          const soon = p.status === "coming-soon";
          const connected = p.status === "connected";
          return (
            <Panel key={p.id} className={soon ? "opacity-70" : undefined}>
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl border border-border bg-muted/40">
                  <Cloud className="size-5 text-primary" />
                </span>
                {soon ? (
                  <StatusBadge tone="neutral">Coming soon</StatusBadge>
                ) : connected ? (
                  <StatusBadge tone="success" dot>
                    Connected
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="danger" dot>
                    Disconnected
                  </StatusBadge>
                )}
              </div>
              <h3 className="mt-4 text-sm font-semibold">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              {p.usedGb !== undefined && p.totalGb && connected && (
                <div className="mt-4">
                  <p className="mb-1.5 text-xs">
                    {p.usedGb} GB / {p.totalGb} GB
                  </p>
                  <ProgressBar value={(p.usedGb / p.totalGb) * 100} tone="warning" />
                </div>
              )}
              {!soon && (
                <div className="mt-5 flex gap-2">
                  {connected && (
                    <button
                      onClick={() => toast.success("Sync started", { description: "Simulated in demo mode." })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:border-primary/40"
                    >
                      <RefreshCw className="size-3.5" /> Sync
                    </button>
                  )}
                  <button
                    onClick={() => toggleProvider(p.id)}
                    className={
                      connected
                        ? "rounded-lg border border-destructive/40 px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
                        : "rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                    }
                  >
                    {connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
