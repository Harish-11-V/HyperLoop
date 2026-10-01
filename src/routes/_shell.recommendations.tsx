import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { files } from "@/data/demoData";
import { useAppState } from "@/context/AppStateContext";
import {
  DemoTag,
  MetricCard,
  Panel,
  PageHeader,
  StatusBadge,
} from "@/components/common/primitives";

export const Route = createFileRoute("/_shell/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — HyperLoop AI" },
      {
        name: "description",
        content:
          "Review, approve or reject AI-generated storage optimization recommendations.",
      },
      { property: "og:title", content: "Recommendations — HyperLoop AI" },
      {
        property: "og:description",
        content: "Human-in-the-loop approval for every storage action.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { recommendations, decideRecommendation, reclaimedGb } = useAppState();
  const [reviewing, setReviewing] = useState<string | null>(null);

  const pending = recommendations.filter((r) => r.status === "pending");
  const potential = pending.reduce((s, r) => s + r.recoveryGb, 0);

  return (
    <div>
      <PageHeader
        title="Recommendations"
        description="Approving a recommendation stages it for migration. Nothing is deleted in demo mode."
        actions={<DemoTag />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending review" value={String(pending.length)} />
        <MetricCard
          label="Potential recovery"
          value={potential.toFixed(1)}
          unit="GB"
          tone="success"
        />
        <MetricCard
          label="Approved this session"
          value={reclaimedGb.toFixed(1)}
          unit="GB"
          tone="violet"
          hint="Reflected in the dashboard quota"
        />
      </div>

      <div className="mt-4 space-y-3">
        {recommendations.map((r) => (
          <Panel key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <StatusBadge
                    tone={
                      r.status === "approved"
                        ? "success"
                        : r.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {r.status}
                  </StatusBadge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{r.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <StatusBadge tone="info">{r.files} files</StatusBadge>
                  <StatusBadge tone="success">
                    {r.recoveryGb.toFixed(1)} GB potential recovery
                  </StatusBadge>
                  <StatusBadge tone="violet">Confidence: {r.confidence}</StatusBadge>
                  <StatusBadge tone={r.risk === "Low" ? "neutral" : "warning"}>
                    Risk: {r.risk}
                  </StatusBadge>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setReviewing(reviewing === r.id ? null : r.id)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40"
                >
                  {reviewing === r.id ? "Hide" : "Review"}
                </button>
                <button
                  disabled={r.status === "approved"}
                  onClick={() => decideRecommendation(r.id, "approved")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-medium text-success-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Check className="size-3.5" /> Approve
                </button>
                <button
                  disabled={r.status === "rejected"}
                  onClick={() => decideRecommendation(r.id, "rejected")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
                >
                  <X className="size-3.5" /> Reject
                </button>
              </div>
            </div>

            {reviewing === r.id && (
              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Candidate files
                </p>
                <ul className="divide-y divide-border">
                  {r.fileIds.map((id) => {
                    const f = files.find((x) => x.id === id);
                    if (!f) return null;
                    return (
                      <li key={id} className="flex items-center justify-between gap-3 py-2">
                        <span className="truncate text-xs">{f.name}</span>
                        <span className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{f.lastAccessDays} days idle</span>
                          <StatusBadge tone="info">{f.sizeGb.toFixed(2)} GB</StatusBadge>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
