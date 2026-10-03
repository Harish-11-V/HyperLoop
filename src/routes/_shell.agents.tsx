import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { agentRuns, type AgentStageStatus } from "@/data/demoData";
import {
  DemoTag,
  Panel,
  PanelHeader,
  PageHeader,
  StatusBadge,
} from "@/components/common/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/agents")({
  head: () => ({
    meta: [
      { title: "Agent Activity — HyperLoop AI" },
      {
        name: "description",
        content:
          "Inspect each agent run step by step: observe, retrieve, reason, plan, approve, act, verify and learn.",
      },
      { property: "og:title", content: "Agent Activity — HyperLoop AI" },
      {
        property: "og:description",
        content: "Make the agentic workflow visible and auditable.",
      },
    ],
  }),
  component: AgentsPage,
});

const dotClass: Record<AgentStageStatus, string> = {
  done: "bg-success border-success",
  running: "bg-primary border-primary animate-pulse",
  waiting: "bg-warning border-warning animate-pulse",
  pending: "bg-transparent border-muted-foreground/50",
  failed: "bg-destructive border-destructive",
};

function AgentsPage() {
  const [runId, setRunId] = useState(agentRuns[0]!.id);
  const [openStage, setOpenStage] = useState<string | null>("OBSERVE");
  const run = agentRuns.find((r) => r.id === runId)!;

  return (
    <div>
      <PageHeader
        title="Agent activity"
        description="Every HyperLoop decision is produced by a traceable agent run."
        actions={<DemoTag />}
      />

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Panel className="h-fit">
          <PanelHeader title="Agent runs" subtitle="Most recent first" />
          <div className="space-y-2">
            {agentRuns.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRunId(r.id);
                  setOpenStage(r.stages[0]!.stage);
                }}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                  r.id === runId
                    ? "border-primary/40 bg-primary/10"
                    : "border-border hover:border-primary/30",
                )}
              >
                <p className="text-xs font-medium">Run #{r.id}</p>
                <p className="truncate text-[11px] text-muted-foreground">{r.title}</p>
                <div className="mt-1.5">
                  <StatusBadge
                    tone={
                      r.status === "completed"
                        ? "success"
                        : r.status === "failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {r.status}
                  </StatusBadge>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title={`Run #${run.id} — ${run.title}`}
            subtitle={`Started ${run.startedAt}`}
            action={
              <StatusBadge
                tone={run.status === "completed" ? "success" : "warning"}
                dot
              >
                {run.status}
              </StatusBadge>
            }
          />

          <ol className="relative ml-2 border-l border-border pl-6">
            {run.stages.map((s) => {
              const expanded = openStage === s.stage;
              return (
                <li key={s.stage} className="relative pb-5 last:pb-0">
                  <span
                    className={cn(
                      "absolute top-1 -left-[1.9rem] size-3 rounded-full border-2",
                      dotClass[s.status],
                    )}
                  />
                  <button
                    onClick={() => setOpenStage(expanded ? null : s.stage)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                      {s.stage}
                    </span>
                    <span className="truncate text-sm font-medium">{s.action}</span>
                    <ChevronRight
                      className={cn(
                        "ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform",
                        expanded && "rotate-90",
                      )}
                    />
                  </button>

                  {expanded && (
                    <div className="mt-2.5 grid gap-x-6 gap-y-2 rounded-xl border border-border bg-muted/20 p-4 text-xs sm:grid-cols-2">
                      <Field label="Agent" value={s.agent} />
                      <Field label="Tool" value={s.tool} mono />
                      <Field label="Timestamp" value={s.timestamp} mono />
                      <Field
                        label="Duration"
                        value={s.durationMs ? `${(s.durationMs / 1000).toFixed(1)} s` : "—"}
                      />
                      <div className="sm:col-span-2">
                        <Field label="Result" value={s.result} />
                      </div>
                      <div className="sm:col-span-2">
                        <StatusBadge
                          tone={
                            s.status === "done"
                              ? "success"
                              : s.status === "waiting"
                                ? "warning"
                                : s.status === "failed"
                                  ? "danger"
                                  : "neutral"
                          }
                        >
                          {s.status}
                        </StatusBadge>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-0.5", mono && "font-mono text-[11px]")}>{value}</p>
    </div>
  );
}
