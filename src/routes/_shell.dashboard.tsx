import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Boxes,
  Database,
  FlaskConical,
  HardDrive,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  agentRuns,
  fileTypeBreakdown,
  files,
  migrations,
  storageTrend,
} from "@/data/demoData";
import { useAppState } from "@/context/AppStateContext";
import { driveService } from "@/services/driveService";
import {
  DemoTag,
  MetricCard,
  Panel,
  PanelHeader,
  PageHeader,
  ProgressBar,
  StatusBadge,
  healthTone,
} from "@/components/common/primitives";
import { TypeDonut, UsageAreaChart } from "@/components/common/charts";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HyperLoop AI" },
      {
        name: "description",
        content:
          "Storage usage, health, forecast and AI recommendations for your connected cloud storage.",
      },
      { property: "og:title", content: "Dashboard — HyperLoop AI" },
      {
        property: "og:description",
        content: "Autonomous agentic AI for intelligent cloud storage management.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { snapshot, recommendations, settings } = useAppState();
  const { data: live } = useQuery({
    queryKey: ["drive-overview"],
    queryFn: driveService.getOverview,
    staleTime: 60_000,
  });
  const usedGb = live?.usedGb ?? snapshot.usedGb;
  const totalGb = live?.totalGb ?? snapshot.totalGb;
  const filesScanned = live?.fileCount ?? snapshot.filesScanned;
  const pct = (usedGb / totalGb) * 100;
  const health =
    pct >= settings.criticalThreshold
      ? "critical"
      : pct >= settings.warningThreshold
        ? "warning"
        : "healthy";
  const topRec = recommendations.find((r) => r.status === "pending") ?? recommendations[0]!;
  const largest = [...files].sort((a, b) => b.sizeGb - a.sizeGb).slice(0, 5);
  const latestRun = agentRuns[0]!;

  return (
    <div>
      <PageHeader
        title="Storage command center"
        description="Observe → Understand → Predict → Reason → Plan → Act → Verify → Learn."
        actions={
          <>
            <DemoTag />
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <FlaskConical className="size-3.5" /> Run simulation
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Storage used"
          value={snapshot.usedGb.toFixed(1)}
          unit={`/ ${snapshot.totalGb} GB`}
          hint={`${pct.toFixed(1)}% of quota`}
          icon={<HardDrive className="size-4" />}
        />
        <MetricCard
          label="Storage health"
          value={health === "healthy" ? "Healthy" : health === "warning" ? "Warning" : "Critical"}
          hint={`Warning at ${settings.warningThreshold}% · Critical at ${settings.criticalThreshold}%`}
          icon={<ShieldCheck className="size-4" />}
          tone={healthTone(health)}
        />
        <MetricCard
          label="Forecast"
          value={`${snapshot.daysUntilCritical}`}
          unit="days"
          hint="Estimated time to critical threshold"
          icon={<TrendingUp className="size-4" />}
          tone="violet"
        />
        <MetricCard
          label="Indexed files"
          value={snapshot.filesScanned.toLocaleString()}
          hint={`${snapshot.changesDetected} changes in the last sweep`}
          icon={<Database className="size-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Storage trend"
            subtitle="Monthly consumption across the demo dataset"
            action={<DemoTag label="7 months" />}
          />
          <UsageAreaChart data={storageTrend} />
        </Panel>

        <Panel>
          <PanelHeader title="File type distribution" subtitle="Share of used storage" />
          <TypeDonut data={fileTypeBreakdown} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Largest files"
            subtitle="Highest storage impact in the indexed sample"
            action={
              <Link to="/files" className="text-xs text-primary hover:underline">
                Open explorer
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="pb-2 font-medium">File</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Modified</th>
                </tr>
              </thead>
              <tbody>
                {largest.map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="max-w-[16rem] truncate py-2.5 pr-3">{f.name}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{f.type}</td>
                    <td className="py-2.5 pr-3">{f.sizeGb.toFixed(2)} GB</td>
                    <td className="py-2.5 text-muted-foreground">{f.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="AI recommendation"
              action={<Sparkles className="size-4 text-violet" />}
            />
            <p className="text-sm">
              You could recover approximately{" "}
              <span className="font-semibold text-accent">
                {topRec.recoveryGb.toFixed(1)} GB
              </span>{" "}
              by applying “{topRec.title.toLowerCase()}” across {topRec.files} files.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{topRec.reason}</p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge tone="info">Confidence: {topRec.confidence}</StatusBadge>
              <StatusBadge tone="warning">Risk: {topRec.risk}</StatusBadge>
            </div>
            <Link
              to="/recommendations"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Review recommendations <ArrowRight className="size-3" />
            </Link>
          </Panel>

          <Panel>
            <PanelHeader title="Quota" subtitle="Current consumption against thresholds" />
            <ProgressBar value={pct} tone={healthTone(health)} />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>0 GB</span>
              <span>Warning {settings.warningThreshold}%</span>
              <span>{snapshot.totalGb} GB</span>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title={`Recent agent activity — Run #${latestRun.id}`}
            subtitle={latestRun.title}
            action={
              <Link to="/agents" className="text-xs text-primary hover:underline">
                Open timeline
              </Link>
            }
          />
          <ol className="space-y-2.5">
            {latestRun.stages.slice(0, 5).map((s) => (
              <li key={s.stage} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    s.status === "done"
                      ? "size-2 rounded-full bg-success"
                      : s.status === "waiting"
                        ? "size-2 animate-pulse rounded-full bg-warning"
                        : "size-2 rounded-full bg-muted-foreground/40"
                  }
                />
                <span className="w-24 shrink-0 font-mono text-[11px] tracking-wider text-muted-foreground">
                  {s.stage}
                </span>
                <span className="truncate">{s.result}</span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel>
          <PanelHeader
            title="Recent migrations"
            action={<Boxes className="size-4 text-muted-foreground" />}
          />
          <div className="space-y-3">
            {migrations.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{m.id}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {m.files} files · {m.sizeGb.toFixed(1)} GB
                  </p>
                </div>
                <StatusBadge
                  tone={
                    m.status === "Failed"
                      ? "danger"
                      : m.status === "Pending Approval"
                        ? "warning"
                        : "success"
                  }
                >
                  {m.status}
                </StatusBadge>
              </div>
            ))}
          </div>
          <Link
            to="/migrations"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            View history <ArrowRight className="size-3" />
          </Link>
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { to: "/analytics", label: "Analyze storage", icon: Database },
          { to: "/chat", label: "Ask HyperLoop", icon: MessageSquare },
          { to: "/simulator", label: "Run simulation", icon: FlaskConical },
          { to: "/recommendations", label: "Review recommendations", icon: Sparkles },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="glass-card flex items-center justify-between px-4 py-3.5 transition-colors hover:border-primary/40"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <a.icon className="size-4 text-primary" />
              {a.label}
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
