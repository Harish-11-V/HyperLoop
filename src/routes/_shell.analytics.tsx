import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  activityByDay,
  fileTypeBreakdown,
  files,
  folderUsage,
  storageTrend,
} from "@/data/demoData";
import {
  DemoTag,
  MetricCard,
  Panel,
  PanelHeader,
  PageHeader,
  StatusBadge,
} from "@/components/common/primitives";
import {
  ActivityLineChart,
  FolderBarChart,
  TypeDonut,
  UsageAreaChart,
} from "@/components/common/charts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Storage Analytics — HyperLoop AI" },
      {
        name: "description",
        content:
          "Growth trends, file type mix, folder consumption and inactive file analysis.",
      },
      { property: "og:title", content: "Storage Analytics — HyperLoop AI" },
      {
        property: "og:description",
        content: "Deep analytics across file types, folders and storage growth.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const RANGES = [
  { id: "7d", label: "7 days", points: 2 },
  { id: "30d", label: "30 days", points: 3 },
  { id: "90d", label: "90 days", points: 5 },
  { id: "1y", label: "1 year", points: 7 },
] as const;

function AnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[2]!);
  const trend = storageTrend.slice(-range.points);
  const growth = trend[trend.length - 1]!.usedGb - trend[0]!.usedGb;
  const inactive = files.filter((f) => f.lastAccessDays > 150);
  const inactiveGb = inactive.reduce((s, f) => s + f.sizeGb, 0);
  const recent = [...files].sort((a, b) => a.lastAccessDays - b.lastAccessDays).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Storage analytics"
        description="Understand what is consuming storage and how consumption is changing over time."
        actions={
          <>
            <DemoTag />
            <div className="flex rounded-lg border border-border p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs transition-colors",
                    range.id === r.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={`Growth (${range.label})`}
          value={`+${growth.toFixed(1)}`}
          unit="GB"
          hint="Compared to the start of the window"
        />
        <MetricCard
          label="Largest category"
          value="Videos"
          hint={`${fileTypeBreakdown[0]!.sizeGb} GB across ${fileTypeBreakdown[0]!.files} files`}
          tone="violet"
        />
        <MetricCard
          label="Inactive files"
          value={String(inactive.length)}
          hint={`${inactiveGb.toFixed(1)} GB untouched for 150+ days`}
          tone="warning"
        />
        <MetricCard
          label="Top folder"
          value="24.8"
          unit="GB"
          hint="/Media/Raw Footage"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Storage growth" subtitle={`Window: ${range.label}`} />
          <UsageAreaChart data={trend} />
        </Panel>
        <Panel>
          <PanelHeader title="Storage by file type" />
          <TypeDonut data={fileTypeBreakdown} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Storage by folder" subtitle="Top consuming locations" />
          <FolderBarChart data={folderUsage} />
        </Panel>
        <Panel>
          <PanelHeader
            title="Activity trend"
            subtitle="Uploads, changes and deletions per day"
          />
          <ActivityLineChart data={activityByDay} height={260} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Inactive files" subtitle="No access in the last 150 days" />
          <ul className="divide-y divide-border">
            {inactive.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="truncate text-sm">{f.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {f.lastAccessDays}d
                  </span>
                  <StatusBadge tone="warning">{f.sizeGb.toFixed(2)} GB</StatusBadge>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <PanelHeader title="Recently touched" subtitle="Most recent activity" />
          <ul className="divide-y divide-border">
            {recent.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="truncate text-sm">{f.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{f.modified}</span>
                  <StatusBadge tone="success">{f.classification}</StatusBadge>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
