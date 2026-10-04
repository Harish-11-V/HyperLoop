import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Archive, Search, X } from "lucide-react";
import { toast } from "sonner";
import { files as demoFiles, type DriveFile } from "@/data/demoData";
import { driveService } from "@/services/driveService";
import { DemoTag, Panel, PageHeader, StatusBadge } from "@/components/common/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/files")({
  head: () => ({
    meta: [
      { title: "File Explorer — HyperLoop AI" },
      {
        name: "description",
        content: "Search, filter and inspect files with AI classification and storage impact.",
      },
      { property: "og:title", content: "File Explorer — HyperLoop AI" },
      {
        property: "og:description",
        content: "A cloud file manager with AI classification built in.",
      },
    ],
  }),
  component: FilesPage,
});

const TYPES = ["All", "Video", "Image", "Document", "PDF", "Archive"] as const;
type SortKey = "name" | "sizeGb" | "modified";

function classTone(c: DriveFile["classification"]) {
  if (c === "Archive candidate") return "warning" as const;
  if (c === "Duplicate") return "danger" as const;
  if (c === "Business critical") return "violet" as const;
  if (c === "Active") return "success" as const;
  return "neutral" as const;
}

function FilesPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [sort, setSort] = useState<SortKey>("sizeGb");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<DriveFile | null>(null);
  const [archived, setArchived] = useState<Set<string>>(new Set());

  const { data: live } = useQuery({
    queryKey: ["drive-overview"],
    queryFn: driveService.getOverview,
    staleTime: 60_000,
  });
  const files = live?.files ?? demoFiles;

  const rows = useMemo(() => {
    return files
      .filter((f) => type === "All" || f.type === type)
      .filter((f) => `${f.name} ${f.folder}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) =>
        sort === "sizeGb"
          ? b.sizeGb - a.sizeGb
          : sort === "modified"
            ? b.modified.localeCompare(a.modified)
            : a.name.localeCompare(b.name),
      );
  }, [q, type, sort]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const selectedGb = files
    .filter((f) => selected.has(f.id))
    .reduce((s, f) => s + f.sizeGb, 0);

  function archive(ids: string[]) {
    setArchived((a) => new Set([...a, ...ids]));
    setSelected(new Set());
    toast.success(`${ids.length} file(s) staged for archive`, {
      description: "Demo mode — no files were moved.",
    });
  }

  return (
    <div>
      <PageHeader
        title="File explorer"
        description="Indexed sample of your Google Drive with AI classification."
        actions={<DemoTag />}
      />

      <Panel className="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or folder"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs"
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs"
          >
            <option value="sizeGb">Sort: Size</option>
            <option value="modified">Sort: Modified</option>
            <option value="name">Sort: Name</option>
          </select>
          {selected.size > 0 && (
            <button
              onClick={() => archive([...selected])}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
            >
              <Archive className="size-3.5" /> Archive {selected.size} ({selectedGb.toFixed(1)} GB)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
                    }
                  />
                </th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Size</th>
                <th className="p-3 font-medium">Modified</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">AI classification</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr
                  key={f.id}
                  className={cn(
                    "border-t border-border transition-colors hover:bg-muted/20",
                    selected.has(f.id) && "bg-primary/5",
                  )}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${f.name}`}
                      checked={selected.has(f.id)}
                      onChange={() => toggle(f.id)}
                    />
                  </td>
                  <td className="max-w-[16rem] p-3">
                    <p className="truncate">{f.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{f.folder}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{f.type}</td>
                  <td className="p-3">{f.sizeGb.toFixed(2)} GB</td>
                  <td className="p-3 text-muted-foreground">{f.modified}</td>
                  <td className="p-3">
                    {archived.has(f.id) ? (
                      <StatusBadge tone="info">Staged</StatusBadge>
                    ) : (
                      <StatusBadge tone={f.lastAccessDays > 150 ? "warning" : "success"}>
                        {f.lastAccessDays > 150 ? "Idle" : "Active"}
                      </StatusBadge>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge tone={classTone(f.classification)}>{f.classification}</StatusBadge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setDetail(f)}
                        className="rounded-md border border-border px-2 py-1 text-[11px] hover:border-primary/40"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => archive([f.id])}
                        disabled={archived.has(f.id)}
                        className="rounded-md border border-border px-2 py-1 text-[11px] hover:border-primary/40 disabled:opacity-40"
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-8 text-center text-xs text-muted-foreground">No files match.</p>
          )}
        </div>
      </Panel>

      {detail && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close details"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setDetail(null)}
          />
          <aside className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-border bg-popover p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  File details
                </p>
                <h3 className="mt-1 break-words text-lg font-semibold">{detail.name}</h3>
              </div>
              <button aria-label="Close" onClick={() => setDetail(null)}>
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Type", detail.type],
                ["Size", `${detail.sizeGb.toFixed(2)} GB`],
                ["Folder", detail.folder],
                ["Modified", detail.modified],
                ["Last access", `${detail.lastAccessDays} days ago`],
                ["Storage impact", `${detail.sizeGb.toFixed(2)}% of quota`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 break-words">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AI classification</span>
                <StatusBadge tone={classTone(detail.classification)}>
                  {detail.classification}
                </StatusBadge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Risk</span>
                <StatusBadge tone={detail.risk === "High" ? "danger" : "neutral"}>
                  {detail.risk}
                </StatusBadge>
              </div>
              <p className="text-sm">{detail.recommendation}</p>
            </div>
            <div className="mt-6">
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">History</p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>{detail.modified} — Last modified</li>
                <li>Indexed by MonitorAgent in run #1042</li>
                <li>Classified by AnalysisAgent</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
