import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  agentRuns,
  files,
  insights,
  migrations,
  recommendations,
} from "@/data/demoData";

interface Hit {
  group: string;
  label: string;
  meta: string;
  route: string;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Hit[] = [];
    files
      .filter((f) => `${f.name} ${f.folder} ${f.type}`.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((f) =>
        out.push({
          group: "Files",
          label: f.name,
          meta: `${f.sizeGb.toFixed(2)} GB · ${f.folder}`,
          route: "/files",
        }),
      );
    recommendations
      .filter((r) => `${r.title} ${r.reason}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((r) =>
        out.push({
          group: "Recommendations",
          label: r.title,
          meta: `${r.recoveryGb.toFixed(1)} GB recovery`,
          route: "/recommendations",
        }),
      );
    insights
      .filter((i) => `${i.title} ${i.description}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((i) =>
        out.push({ group: "Insights", label: i.title, meta: i.category, route: "/insights" }),
      );
    migrations
      .filter((m) => `${m.id} ${m.source} ${m.status}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((m) =>
        out.push({ group: "Migrations", label: m.id, meta: m.status, route: "/migrations" }),
      );
    agentRuns
      .filter((a) => `${a.id} ${a.title}`.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((a) =>
        out.push({
          group: "Agent runs",
          label: `Run #${a.id} — ${a.title}`,
          meta: a.status,
          route: "/agents",
        }),
      );
    return out;
  }, [query]);

  const groups = Array.from(new Set(hits.map((h) => h.group)));

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24">
      <button
        aria-label="Close search"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, recommendations, insights, migrations, agent runs..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!query && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Search across the demo dataset.
            </p>
          )}
          {query && hits.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No matches for “{query}”.
            </p>
          )}
          {groups.map((group) => (
            <div key={group} className="mb-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group}
              </p>
              {hits
                .filter((h) => h.group === group)
                .map((h, i) => (
                  <button
                    key={`${group}-${i}`}
                    onClick={() => {
                      onClose();
                      navigate({ to: h.route });
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/10"
                  >
                    <span className="truncate text-sm">{h.label}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {h.meta}
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
