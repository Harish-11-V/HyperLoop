import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { migrations, type MigrationStatus } from "@/data/demoData";
import { DemoTag, Panel, PanelHeader, PageHeader, StatusBadge } from "@/components/common/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/migrations")({
  head: () => ({
    meta: [
      { title: "Migration History — HyperLoop AI" },
      {
        name: "description",
        content: "Every copy, verify, confirm and archive operation with verification status.",
      },
      { property: "og:title", content: "Migration History — HyperLoop AI" },
      {
        property: "og:description",
        content: "Auditable history of storage migrations.",
      },
    ],
  }),
  component: MigrationsPage,
});

function tone(s: MigrationStatus) {
  if (s === "Failed") return "danger" as const;
  if (s === "Pending Approval") return "warning" as const;
  if (s === "In Progress") return "info" as const;
  if (s === "Verified") return "violet" as const;
  return "success" as const;
}

function MigrationsPage() {
  const [active, setActive] = useState(migrations[0].id);
  const m = migrations.find((x) => x.id === active)!;

  return (
    <div>
      <PageHeader
        title="Migration history"
        description="Select a migration to inspect its copy → verify → confirm → archive pipeline."
        actions={<DemoTag />}
      />

      <Panel className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              {["ID", "Source", "Destination", "Files", "Size", "Started", "Completed", "Status", "Verification"].map(
                (h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {migrations.map((x) => (
              <tr
                key={x.id}
                onClick={() => setActive(x.id)}
                className={cn(
                  "cursor-pointer border-t border-border transition-colors hover:bg-muted/20",
                  x.id === active && "bg-primary/8",
                )}
              >
                <td className="p-3 font-mono text-xs">{x.id}</td>
                <td className="max-w-[12rem] truncate p-3 text-muted-foreground">{x.source}</td>
                <td className="p-3 text-muted-foreground">{x.destination}</td>
                <td className="p-3">{x.files}</td>
                <td className="p-3">{x.sizeGb.toFixed(1)} GB</td>
                <td className="p-3 text-muted-foreground">{x.started}</td>
                <td className="p-3 text-muted-foreground">{x.completed ?? "—"}</td>
                <td className="p-3">
                  <StatusBadge tone={tone(x.status)}>{x.status}</StatusBadge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{x.verification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader
          title={`${m.id} pipeline`}
          subtitle={`${m.files} files · ${m.sizeGb.toFixed(1)} GB · ${m.source} → ${m.destination}`}
          action={<StatusBadge tone={tone(m.status)}>{m.status}</StatusBadge>}
        />
        <div className="grid gap-3 sm:grid-cols-4">
          {m.steps.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "rounded-xl border p-4",
                s.state === "done" && "border-success/40 bg-success/8",
                s.state === "failed" && "border-destructive/40 bg-destructive/8",
                s.state === "active" && "border-primary/40 bg-primary/8",
                s.state === "pending" && "border-border",
              )}
            >
              <p className="font-mono text-[10px] text-muted-foreground">STEP {i + 1}</p>
              <p className="mt-1 text-sm font-medium">{s.label}</p>
              <p className="mt-1 text-[11px] capitalize text-muted-foreground">{s.state}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
