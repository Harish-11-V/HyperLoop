import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAppState, type Settings } from "@/context/AppStateContext";
import { Panel, PanelHeader, PageHeader } from "@/components/common/primitives";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HyperLoop AI" },
      {
        name: "description",
        content: "Storage policies, AI preferences, automation and notification settings.",
      },
      { property: "og:title", content: "Settings — HyperLoop AI" },
      {
        property: "og:description",
        content: "Configure how HyperLoop monitors and acts on your storage.",
      },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3 first:border-0">
      <div>
        <p className="text-sm">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings } = useAppState();
  const toggle = (key: keyof Settings) => (
    <Switch
      checked={settings[key] as boolean}
      onCheckedChange={(v) => updateSettings({ [key]: v } as Partial<Settings>)}
    />
  );
  const num = (key: "criticalThreshold" | "warningThreshold") => (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={50}
        max={99}
        value={settings[key]}
        onChange={(e) => updateSettings({ [key]: Number(e.target.value) })}
        className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-right text-sm"
      />
      <span className="text-xs text-muted-foreground">%</span>
    </div>
  );

  return (
    <div>
      <PageHeader title="Settings" description="Changes apply instantly across the app in this session." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Account" />
          <Row label="Name">
            <span className="text-sm text-muted-foreground">Harish Kumar V</span>
          </Row>
          <Row label="Plan">
            <span className="text-sm text-muted-foreground">Demo workspace</span>
          </Row>
        </Panel>

        <Panel>
          <PanelHeader title="Storage policies" />
          <Row label="Warning threshold">{num("warningThreshold")}</Row>
          <Row label="Critical threshold">{num("criticalThreshold")}</Row>
          <Row label="Auto-analysis" hint="Run analysis after every sync">
            {toggle("autoAnalysis")}
          </Row>
        </Panel>

        <Panel>
          <PanelHeader title="AI preferences & automation" />
          <Row label="Recommendation aggressiveness" hint={`${settings.aggressiveness}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.aggressiveness}
              onChange={(e) => updateSettings({ aggressiveness: Number(e.target.value) })}
              className="w-40 accent-[var(--color-primary)]"
            />
          </Row>
          <Row label="Autonomous mode" hint="Let agents act on low-risk items without approval">
            {toggle("autonomousMode")}
          </Row>
        </Panel>

        <Panel>
          <PanelHeader title="Security" />
          <Row label="Require approval for migration">{toggle("approveMigration")}</Row>
          <Row label="Require approval for deletion">{toggle("approveDeletion")}</Row>
        </Panel>

        <Panel>
          <PanelHeader title="Notifications" />
          <Row label="In-app alerts">{toggle("inAppAlerts")}</Row>
          <Row label="Email alerts">{toggle("emailAlerts")}</Row>
        </Panel>

        <Panel>
          <PanelHeader title="Data source" />
          <Row
            label="Demo mode"
            hint={settings.demoMode ? "Using local demo data" : "API mode — FastAPI backend not yet available"}
          >
            {toggle("demoMode")}
          </Row>
          <Row label="Appearance">
            <span className="text-sm text-muted-foreground">Dark console</span>
          </Row>
        </Panel>
      </div>
    </div>
  );
}
