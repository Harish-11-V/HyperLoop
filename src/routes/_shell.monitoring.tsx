import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Pause, Play, RefreshCw, Wifi } from "lucide-react";
import { monitoringEvents } from "@/data/demoData";
import { useAppState } from "@/context/AppStateContext";
import {
  DemoTag,
  MetricCard,
  Panel,
  PanelHeader,
  PageHeader,
  ProgressBar,
  StatusBadge,
} from "@/components/common/primitives";
import { UsageAreaChart } from "@/components/common/charts";

export const Route = createFileRoute("/_shell/monitoring")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — HyperLoop AI" },
      {
        name: "description",
        content:
          "Simulated live monitoring of cloud storage usage, sync status and detected changes.",
      },
      { property: "og:title", content: "Live Monitoring — HyperLoop AI" },
      {
        property: "og:description",
        content: "Watch storage events, sync status and detected changes in near real time.",
      },
    ],
  }),
  component: MonitoringPage,
});

function seedSeries(base: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    date: `T-${11 - i}`,
    usedGb: Number((base - (11 - i) * 0.04).toFixed(2)),
  }));
}

function MonitoringPage() {
  const { snapshot } = useAppState();
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [series, setSeries] = useState(() => seedSeries(snapshot.usedGb));
  const [scanned, setScanned] = useState(snapshot.filesScanned);
  const [changes, setChanges] = useState(snapshot.changesDetected);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setTick((t) => t + 3);
      setScanned((s) => s + Math.floor(Math.random() * 40));
      setChanges((c) => (Math.random() > 0.7 ? c + 1 : c));
      setSeries((prev) => {
        const last = prev[prev.length - 1]!.usedGb;
        const next = Number((last + (Math.random() - 0.35) * 0.05).toFixed(2));
        return [...prev.slice(1), { date: "now", usedGb: next }].map((p, i, arr) => ({
          ...p,
          date: i === arr.length - 1 ? "now" : `T-${arr.length - 1 - i}`,
        }));
      });
    }, 3000);
    return () => clearInterval(id);
  }, [live]);

  const pct = (snapshot.usedGb / snapshot.totalGb) * 100;

  return (
    <div>
      <PageHeader
        title="Live monitoring"
        description="Storage state, synchronization and detected changes. Updates on this page are simulated for demo mode — no live cloud connection is active."
        actions={
          <>
            <DemoTag label="Simulated stream" />
            <button
              onClick={() => setLive((l) => !l)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40"
            >
              {live ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {live ? "Pause stream" : "Resume stream"}
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Monitoring"
          value={live ? "Active" : "Paused"}
          hint={live ? `Last scan ${tick} seconds ago` : "Stream paused by user"}
          icon={<Activity className="size-4" />}
          tone={live ? "success" : "warning"}
        />
        <MetricCard
          label="Files scanned"
          value={scanned.toLocaleString()}
          hint="Cumulative in this session"
          icon={<RefreshCw className="size-4" />}
        />
        <MetricCard
          label="Changes detected"
          value={String(changes)}
          hint="Creates, edits and deletes"
          icon={<Activity className="size-4" />}
          tone="violet"
        />
        <MetricCard
          label="API connection"
          value="Demo"
          hint="FastAPI backend not connected"
          icon={<Wifi className="size-4" />}
          tone="warning"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Real-time usage"
            subtitle="Rolling window of simulated storage samples"
          />
          <UsageAreaChart data={series} height={240} />
        </Panel>

        <Panel>
          <PanelHeader title="Current state" subtitle={snapshot.provider} />
          <p className="text-3xl font-semibold tracking-tight">
            {snapshot.usedGb.toFixed(1)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {snapshot.totalGb} GB
            </span>
          </p>
          <div className="mt-3">
            <ProgressBar value={pct} tone={pct > 80 ? "warning" : "info"} />
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Available</dt>
              <dd>{(snapshot.totalGb - snapshot.usedGb).toFixed(1)} GB</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last synchronization</dt>
              <dd>{live ? `${tick}s ago` : snapshot.lastSync}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Connector</dt>
              <dd>
                <StatusBadge tone="success" dot>
                  Connected
                </StatusBadge>
              </dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader title="Recent storage events" subtitle="Newest first" />
        <ul className="divide-y divide-border">
          {monitoringEvents.map((e) => (
            <li key={e.time} className="flex items-start gap-4 py-2.5">
              <span className="w-20 shrink-0 font-mono text-[11px] text-muted-foreground">
                {e.time}
              </span>
              <span className="w-44 shrink-0 text-xs font-medium">{e.event}</span>
              <span className="truncate text-xs text-muted-foreground">{e.detail}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
