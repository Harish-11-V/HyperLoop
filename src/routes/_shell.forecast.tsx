import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";
import { storageForecast } from "@/data/demoData";
import { useAppState } from "@/context/AppStateContext";
import {
  DemoTag,
  MetricCard,
  Panel,
  PanelHeader,
  PageHeader,
  ProgressBar,
} from "@/components/common/primitives";
import { UsageAreaChart } from "@/components/common/charts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/forecast")({
  head: () => ({
    meta: [
      { title: "Storage Forecast — HyperLoop AI" },
      {
        name: "description",
        content:
          "Projected storage growth and estimated time until the critical threshold is reached.",
      },
      { property: "og:title", content: "Storage Forecast — HyperLoop AI" },
      {
        property: "og:description",
        content: "Predict future storage pressure before it becomes an incident.",
      },
    ],
  }),
  component: ForecastPage,
});

function ForecastPage() {
  const { snapshot, settings } = useAppState();
  const [growthRate, setGrowthRate] = useState(3.8);

  const thresholdGb = (snapshot.totalGb * settings.criticalThreshold) / 100;
  const daysToThreshold = Math.max(
    0,
    Math.round(((thresholdGb - snapshot.usedGb) / growthRate) * 30),
  );

  const projected = storageForecast.map((p) =>
    p.projectedGb
      ? { ...p, projectedGb: Number((p.projectedGb * (growthRate / 3.8)).toFixed(1)) }
      : p,
  );

  return (
    <div>
      <PageHeader
        title="Storage forecast"
        description="A demo regression over the available usage history — not a trained ML prediction."
        actions={<DemoTag label="Demo prediction" />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current usage"
          value={snapshot.usedGb.toFixed(1)}
          unit={`/ ${snapshot.totalGb} GB`}
        />
        <MetricCard
          label="Historical growth"
          value="3.8"
          unit="GB / month"
          hint="Average over 7 months of demo history"
        />
        <MetricCard
          label="Projected threshold"
          value={thresholdGb.toFixed(0)}
          unit="GB"
          hint={`Critical at ${settings.criticalThreshold}%`}
          tone="warning"
        />
        <MetricCard
          label="Days until threshold"
          value={String(daysToThreshold)}
          hint={`At ${growthRate.toFixed(1)} GB / month`}
          tone={daysToThreshold < 30 ? "danger" : "success"}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Historical vs projected"
            subtitle="Dashed line is the projection"
          />
          <UsageAreaChart data={projected} height={300} projected />
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Growth scenario"
              subtitle="Adjust the assumed monthly growth rate"
            />
            <input
              type="range"
              min={1}
              max={10}
              step={0.2}
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>1 GB/mo</span>
              <span className="font-medium text-foreground">
                {growthRate.toFixed(1)} GB/mo
              </span>
              <span>10 GB/mo</span>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs text-muted-foreground">
                Pressure at threshold
              </p>
              <ProgressBar
                value={(snapshot.usedGb / thresholdGb) * 100}
                tone={daysToThreshold < 30 ? "danger" : "warning"}
              />
            </div>
            <Link
              to="/simulator"
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2",
                "text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90",
              )}
            >
              Simulate a cleanup
            </Link>
          </Panel>

          <Panel>
            <div className="flex gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                The forecast is based on recent storage growth patterns in the available
                demo dataset. It is a linear projection, clearly distinct from a trained
                machine-learning prediction, and should not be read as live cloud data.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
