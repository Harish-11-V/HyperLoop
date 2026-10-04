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
  const { data: live, refetch, isFetching } = useQuery({
    queryKey: ["drive-overview"],
    queryFn: driveService.getOverview,
    staleTime: 60_000,
  });

  return (
    <div>
      <PageHeader
        title="Connected clouds"
        description="Google Drive is the first connector. Others are planned and not functional yet."
        actions={<DemoTag label={live ? "Live · Google Drive" : "Demo data"} />}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((p) => {
          const soon = p.status === "coming-soon";
          const isDrive = p.id === "gdrive";
          const connected = isDrive ? live != null || p.status === "connected" : p.status === "connected";
          const usedGb = isDrive && live ? live.usedGb : p.usedGb;
          const totalGb = isDrive && live ? live.totalGb : p.totalGb;
          const note =
            isDrive && live
              ? `Connected as ${live.userEmail || live.userName} — ${live.fileCount} files indexed live.`
              : p.note;
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
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              {usedGb !== undefined && totalGb && connected && (
                <div className="mt-4">
                  <p className="mb-1.5 text-xs">
                    {usedGb.toFixed(1)} GB / {totalGb.toFixed(0)} GB
                  </p>
                  <ProgressBar value={(usedGb / totalGb) * 100} tone="warning" />
                </div>
              )}
              {!soon && (
                <div className="mt-5 flex gap-2">
                  {connected && (
                    <button
                      onClick={() => {
                        void refetch().then(() =>
                          toast.success("Sync complete", {
                            description: "Latest metadata pulled from Google Drive.",
                          }),
                        );
                      }}
                      disabled={isFetching}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:border-primary/40 disabled:opacity-40"
                    >
                      <RefreshCw className={isFetching ? "size-3.5 animate-spin" : "size-3.5"} /> Sync
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
