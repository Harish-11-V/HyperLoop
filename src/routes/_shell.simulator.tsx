import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { files } from "@/data/demoData";
import { useAppState } from "@/context/AppStateContext";
import {
  DemoTag,
  MetricCard,
  Panel,
  PanelHeader,
  PageHeader,
  StatusBadge,
} from "@/components/common/primitives";

export const Route = createFileRoute("/_shell/simulator")({
  head: () => ({
    meta: [
      { title: "What-if Simulator — HyperLoop AI" },
      {
        name: "description",
        content: "Simulate archiving files and see projected storage and forecast changes.",
      },
      { property: "og:title", content: "What-if Simulator — HyperLoop AI" },
      {
        property: "og:description",
        content: "See the impact of a cleanup before you make it.",
      },
    ],
  }),
  component: SimulatorPage,
});

const candidates = files.filter((f) => f.classification !== "Business critical" && f.classification !== "Active");

function SimulatorPage() {
  const { snapshot, settings } = useAppState();
  const [picked, setPicked] = useState<Set<string>>(
    new Set(["f-1001", "f-1002", "f-1007"]),
  );
  const [result, setResult] = useState<null | { selected: number; projected: number; days: number }>(null);

  const selectedGb = candidates.filter((f) => picked.has(f.id)).reduce((s, f) => s + f.sizeGb, 0);
  const growth = 3.8;
  const threshold = (snapshot.totalGb * settings.criticalThreshold) / 100;
  const daysNow = Math.max(0, Math.round(((threshold - snapshot.usedGb) / growth) * 30));

  function run() {
    const projected = snapshot.usedGb - selectedGb;
    setResult({
      selected: selectedGb,
      projected,
      days: Math.max(0, Math.round(((threshold - projected) / growth) * 30)),
    });
  }

  const chart = result
    ? [
        { name: "Before", gb: Number(snapshot.usedGb.toFixed(1)) },
        { name: "After", gb: Number(result.projected.toFixed(1)) },
      ]
    : [{ name: "Before", gb: Number(snapshot.usedGb.toFixed(1)) }];

  return (
    <div>
      <PageHeader
        title="What-if simulator"
        description="Choose candidate files, then run a simulation. Nothing is changed in your storage."
        actions={<DemoTag label="Simulation" />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Current" value={snapshot.usedGb.toFixed(1)} unit="GB" />
        <MetricCard label="Selected" value={selectedGb.toFixed(1)} unit="GB" tone="violet" />
        <MetricCard
          label="Projected"
          value={result ? result.projected.toFixed(1) : "—"}
          unit="GB"
          tone="success"
        />
        <MetricCard
          label="Forecast change"
          value={result ? `+${result.days - daysNow}` : "—"}
          unit="days"
          hint={result ? `${daysNow} → ${result.days} days to threshold` : "Run a simulation"}
          tone="warning"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_22rem]">
        <Panel>
          <PanelHeader
            title="Candidate files"
            subtitle="Active and business-critical files are excluded by guardrails"
          />
          <ul className="divide-y divide-border">
            {candidates.map((f) => (
              <li key={f.id}>
                <label className="flex cursor-pointer items-center gap-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={picked.has(f.id)}
                    onChange={() =>
                      setPicked((p) => {
                        const n = new Set(p);
                        n.has(f.id) ? n.delete(f.id) : n.add(f.id);
                        return n;
                      })
                    }
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                  <StatusBadge tone="neutral">{f.classification}</StatusBadge>
                  <span className="w-20 text-right text-xs">{f.sizeGb.toFixed(2)} GB</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={run}
            disabled={picked.size === 0}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <FlaskConical className="size-4" /> Run simulation
          </button>
        </Panel>

        <Panel>
          <PanelHeader title="Before / after" subtitle={`Quota ${snapshot.totalGb} GB`} />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, snapshot.totalGb]} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} unit=" GB" width={58} />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="gb" radius={[6, 6, 0, 0]}>
                {chart.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "var(--color-chart-1)" : "var(--color-chart-5)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {result && (
            <p className="mt-3 text-xs text-muted-foreground">
              Storage improvement:{" "}
              <span className="font-semibold text-success">
                {((result.selected / snapshot.totalGb) * 100).toFixed(1)}%
              </span>
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
