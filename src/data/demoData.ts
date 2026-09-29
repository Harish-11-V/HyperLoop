/**
 * Centralized demo dataset for HyperLoop AI.
 * All values here are synthetic demo data — never presented as live cloud data.
 */

export type HealthStatus = "healthy" | "warning" | "critical";

export interface StorageSnapshot {
  provider: string;
  usedGb: number;
  totalGb: number;
  health: HealthStatus;
  daysUntilCritical: number;
  lastSync: string;
  filesScanned: number;
  changesDetected: number;
}

export interface TrendPoint {
  date: string;
  usedGb: number;
  projectedGb?: number;
}

export interface FileTypeSlice {
  type: string;
  sizeGb: number;
  files: number;
}

export interface FolderUsage {
  folder: string;
  sizeGb: number;
}

export type FileClassification =
  | "Active"
  | "Inactive"
  | "Archive candidate"
  | "Duplicate"
  | "Business critical";

export interface DriveFile {
  id: string;
  name: string;
  type: "Video" | "Image" | "Document" | "PDF" | "Archive" | "Other";
  sizeGb: number;
  modified: string;
  folder: string;
  lastAccessDays: number;
  classification: FileClassification;
  risk: "Low" | "Medium" | "High";
  recommendation: string;
}

export interface Insight {
  id: string;
  title: string;
  category: "Anomaly" | "Opportunity" | "Prediction" | "Observation";
  description: string;
  reason: string;
  evidence: string[];
  impactGb: number;
  confidence: "High" | "Medium" | "Low";
  risk: "Low" | "Medium" | "High";
  action: string;
}

export type RecommendationStatus = "pending" | "approved" | "rejected";

export interface Recommendation {
  id: string;
  title: string;
  files: number;
  recoveryGb: number;
  reason: string;
  confidence: "High" | "Medium" | "Low";
  risk: "Low" | "Medium" | "High";
  status: RecommendationStatus;
  fileIds: string[];
}

export type AgentStageStatus = "done" | "running" | "waiting" | "pending" | "failed";

export interface AgentStage {
  stage:
    | "OBSERVE"
    | "RETRIEVE"
    | "REASON"
    | "PLAN"
    | "APPROVAL"
    | "ACT"
    | "VERIFY"
    | "LEARN";
  status: AgentStageStatus;
  agent: string;
  tool: string;
  action: string;
  result: string;
  timestamp: string;
  durationMs: number;
}

export interface AgentRun {
  id: string;
  title: string;
  startedAt: string;
  status: "completed" | "awaiting approval" | "running" | "failed";
  stages: AgentStage[];
}

export type MigrationStatus =
  | "Completed"
  | "In Progress"
  | "Failed"
  | "Pending Approval"
  | "Verified";

export interface Migration {
  id: string;
  source: string;
  destination: string;
  files: number;
  sizeGb: number;
  started: string;
  completed: string | null;
  status: MigrationStatus;
  verification: "Checksum verified" | "Pending" | "Failed";
  steps: { label: string; state: "done" | "active" | "pending" | "failed" }[];
}

export interface CloudProvider {
  id: string;
  name: string;
  status: "connected" | "available" | "coming-soon";
  usedGb?: number;
  totalGb?: number;
  accent: string;
  note: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  route: string;
  read: boolean;
  severity: "info" | "warning" | "success";
}

export const storageSnapshot: StorageSnapshot = {
  provider: "Google Drive",
  usedGb: 82.4,
  totalGb: 100,
  health: "warning",
  daysUntilCritical: 24,
  lastSync: "12 seconds ago",
  filesScanned: 12482,
  changesDetected: 17,
};

export const storageTrend: TrendPoint[] = [
  { date: "Mar", usedGb: 58.2 },
  { date: "Apr", usedGb: 62.8 },
  { date: "May", usedGb: 66.1 },
  { date: "Jun", usedGb: 70.4 },
  { date: "Jul", usedGb: 74.9 },
  { date: "Aug", usedGb: 78.6 },
  { date: "Sep", usedGb: 82.4 },
];

export const storageForecast: TrendPoint[] = [
  ...storageTrend.map((p) => ({ ...p })),
  { date: "Oct", usedGb: NaN, projectedGb: 86.5 },
  { date: "Nov", usedGb: NaN, projectedGb: 90.8 },
  { date: "Dec", usedGb: NaN, projectedGb: 95.2 },
  { date: "Jan", usedGb: NaN, projectedGb: 99.4 },
];

export const fileTypeBreakdown: FileTypeSlice[] = [
  { type: "Videos", sizeGb: 38.6, files: 412 },
  { type: "Images", sizeGb: 17.2, files: 5840 },
  { type: "Documents", sizeGb: 11.9, files: 4210 },
  { type: "PDFs", sizeGb: 9.4, files: 1620 },
  { type: "Other", sizeGb: 5.3, files: 400 },
];

export const folderUsage: FolderUsage[] = [
  { folder: "/Media/Raw Footage", sizeGb: 24.8 },
  { folder: "/Projects/2025", sizeGb: 16.1 },
  { folder: "/Design/Exports", sizeGb: 12.4 },
  { folder: "/Archive", sizeGb: 10.2 },
  { folder: "/Shared/Clients", sizeGb: 9.7 },
  { folder: "/Personal", sizeGb: 9.2 },
];

export const activityByDay = [
  { day: "Mon", uploads: 42, deletions: 8, changes: 61 },
  { day: "Tue", uploads: 61, deletions: 11, changes: 84 },
  { day: "Wed", uploads: 38, deletions: 19, changes: 55 },
  { day: "Thu", uploads: 74, deletions: 6, changes: 92 },
  { day: "Fri", uploads: 88, deletions: 14, changes: 108 },
  { day: "Sat", uploads: 22, deletions: 3, changes: 28 },
  { day: "Sun", uploads: 15, deletions: 2, changes: 19 },
];

export const files: DriveFile[] = [
  {
    id: "f-1001",
    name: "launch_event_master_4k.mov",
    type: "Video",
    sizeGb: 3.4,
    modified: "2026-02-11",
    folder: "/Media/Raw Footage",
    lastAccessDays: 214,
    classification: "Archive candidate",
    risk: "Low",
    recommendation: "Archive to cold storage — no access in 7 months.",
  },
  {
    id: "f-1002",
    name: "product_demo_reel_final.mp4",
    type: "Video",
    sizeGb: 2.1,
    modified: "2026-04-02",
    folder: "/Media/Raw Footage",
    lastAccessDays: 168,
    classification: "Archive candidate",
    risk: "Low",
    recommendation: "Archive — superseded by a newer export.",
  },
  {
    id: "f-1003",
    name: "customer_interviews_batch3.mov",
    type: "Video",
    sizeGb: 1.9,
    modified: "2026-01-19",
    folder: "/Media/Raw Footage",
    lastAccessDays: 246,
    classification: "Inactive",
    risk: "Medium",
    recommendation: "Review before archiving — referenced in research docs.",
  },
  {
    id: "f-1004",
    name: "brand_assets_2025_export.zip",
    type: "Archive",
    sizeGb: 1.4,
    modified: "2026-03-08",
    folder: "/Design/Exports",
    lastAccessDays: 132,
    classification: "Duplicate",
    risk: "Low",
    recommendation: "Duplicate of brand_assets_master.zip — safe to remove.",
  },
  {
    id: "f-1005",
    name: "annual_report_2025.pdf",
    type: "PDF",
    sizeGb: 0.24,
    modified: "2026-06-21",
    folder: "/Projects/2025",
    lastAccessDays: 9,
    classification: "Business critical",
    risk: "High",
    recommendation: "Keep — frequently accessed and legally retained.",
  },
  {
    id: "f-1006",
    name: "design_system_v4.fig",
    type: "Document",
    sizeGb: 0.61,
    modified: "2026-08-30",
    folder: "/Design/Exports",
    lastAccessDays: 3,
    classification: "Active",
    risk: "High",
    recommendation: "Keep — active working file.",
  },
  {
    id: "f-1007",
    name: "site_photoshoot_raw_batch.zip",
    type: "Archive",
    sizeGb: 2.8,
    modified: "2025-12-02",
    folder: "/Media/Raw Footage",
    lastAccessDays: 301,
    classification: "Archive candidate",
    risk: "Low",
    recommendation: "Archive — raw originals already exported.",
  },
  {
    id: "f-1008",
    name: "client_onboarding_deck.pdf",
    type: "PDF",
    sizeGb: 0.09,
    modified: "2026-09-12",
    folder: "/Shared/Clients",
    lastAccessDays: 5,
    classification: "Active",
    risk: "Medium",
    recommendation: "Keep — shared with 14 collaborators.",
  },
  {
    id: "f-1009",
    name: "old_backup_2023_full.zip",
    type: "Archive",
    sizeGb: 4.2,
    modified: "2024-11-14",
    folder: "/Archive",
    lastAccessDays: 662,
    classification: "Archive candidate",
    risk: "Low",
    recommendation: "Move to cold storage — superseded backup.",
  },
  {
    id: "f-1010",
    name: "team_offsite_gallery.zip",
    type: "Image",
    sizeGb: 1.2,
    modified: "2026-05-05",
    folder: "/Personal",
    lastAccessDays: 141,
    classification: "Inactive",
    risk: "Low",
    recommendation: "Compress images to recover ~0.7 GB.",
  },
  {
    id: "f-1011",
    name: "quarterly_metrics_q2.xlsx",
    type: "Document",
    sizeGb: 0.04,
    modified: "2026-09-20",
    folder: "/Projects/2025",
    lastAccessDays: 1,
    classification: "Active",
    risk: "High",
    recommendation: "Keep — updated daily.",
  },
  {
    id: "f-1012",
    name: "webinar_recording_series.mp4",
    type: "Video",
    sizeGb: 2.6,
    modified: "2026-02-27",
    folder: "/Media/Raw Footage",
    lastAccessDays: 197,
    classification: "Archive candidate",
    risk: "Medium",
    recommendation: "Archive after confirming the public copy is live.",
  },
];

export const insights: Insight[] = [
  {
    id: "i-01",
    title: "Large inactive media detected",
    category: "Opportunity",
    description:
      "A cluster of high-resolution video files has shown no access activity for over six months.",
    reason:
      "Files exceed 1.5 GB each and have zero read events in the last 180 days.",
    evidence: ["18 files", "11.2 GB combined", "No modification since Apr 2026"],
    impactGb: 11.2,
    confidence: "High",
    risk: "Low",
    action: "Review archive candidates",
  },
  {
    id: "i-02",
    title: "Unusual growth spike in /Design/Exports",
    category: "Anomaly",
    description:
      "This folder grew 3.4 GB in seven days — 4x its normal weekly growth rate.",
    reason: "Repeated full-resolution exports are being saved instead of overwritten.",
    evidence: ["+3.4 GB in 7 days", "42 near-identical exports", "Baseline: 0.8 GB/week"],
    impactGb: 2.9,
    confidence: "Medium",
    risk: "Medium",
    action: "Enable export deduplication",
  },
  {
    id: "i-03",
    title: "Critical threshold projected within 24 days",
    category: "Prediction",
    description:
      "At the current growth rate of 3.8 GB/month, usage reaches the 90% critical threshold in roughly 24 days.",
    reason: "Linear regression over the last 7 months of demo usage history.",
    evidence: ["Current 82.4 GB", "Growth 3.8 GB/month", "Threshold 90 GB"],
    impactGb: 7.6,
    confidence: "High",
    risk: "High",
    action: "Run what-if simulation",
  },
  {
    id: "i-04",
    title: "Duplicate archive bundles found",
    category: "Observation",
    description: "Two brand asset archives share identical content hashes.",
    reason: "Content hash match with different filenames and timestamps.",
    evidence: ["2 files", "1.4 GB reclaimable", "Hash match 100%"],
    impactGb: 1.4,
    confidence: "High",
    risk: "Low",
    action: "Remove duplicate copy",
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "r-01",
    title: "Archive inactive videos",
    files: 5,
    recoveryGb: 12.8,
    reason: "Large video files with no access activity in over 5 months.",
    confidence: "High",
    risk: "Medium",
    status: "pending",
    fileIds: ["f-1001", "f-1002", "f-1007", "f-1009", "f-1012"],
  },
  {
    id: "r-02",
    title: "Remove duplicate brand archive",
    files: 1,
    recoveryGb: 1.4,
    reason: "Exact content-hash duplicate of an existing master archive.",
    confidence: "High",
    risk: "Low",
    status: "pending",
    fileIds: ["f-1004"],
  },
  {
    id: "r-03",
    title: "Compress photo gallery bundle",
    files: 1,
    recoveryGb: 0.7,
    reason: "Lossless recompression can shrink this gallery by roughly 58%.",
    confidence: "Medium",
    risk: "Low",
    status: "pending",
    fileIds: ["f-1010"],
  },
  {
    id: "r-04",
    title: "Move research footage to cold tier",
    files: 1,
    recoveryGb: 1.9,
    reason: "Referenced only by archived research documents.",
    confidence: "Medium",
    risk: "Medium",
    status: "pending",
    fileIds: ["f-1003"],
  },
];

export const agentRuns: AgentRun[] = [
  {
    id: "1042",
    title: "Storage optimization sweep",
    startedAt: "2026-09-29 14:02",
    status: "awaiting approval",
    stages: [
      {
        stage: "OBSERVE",
        status: "done",
        agent: "MonitorAgent",
        tool: "drive.metadata.scan",
        action: "Scanned Google Drive metadata",
        result: "12,482 files indexed, 17 changes detected",
        timestamp: "14:02:11",
        durationMs: 8400,
      },
      {
        stage: "RETRIEVE",
        status: "done",
        agent: "ContextAgent",
        tool: "rag.vector.search",
        action: "Retrieved user preferences and retention policy",
        result: "6 policy documents, 3 prior decisions",
        timestamp: "14:02:20",
        durationMs: 1900,
      },
      {
        stage: "REASON",
        status: "done",
        agent: "AnalysisAgent",
        tool: "llm.reasoning",
        action: "Identified archive candidates",
        result: "18 candidate files, 11.2 GB potential recovery",
        timestamp: "14:02:22",
        durationMs: 5200,
      },
      {
        stage: "PLAN",
        status: "done",
        agent: "PlannerAgent",
        tool: "plan.builder",
        action: "Generated a staged archive strategy",
        result: "3-step plan: copy → verify → archive",
        timestamp: "14:02:27",
        durationMs: 2100,
      },
      {
        stage: "APPROVAL",
        status: "waiting",
        agent: "GuardrailAgent",
        tool: "policy.gate",
        action: "Requested human approval",
        result: "Waiting for user decision",
        timestamp: "14:02:29",
        durationMs: 0,
      },
      {
        stage: "ACT",
        status: "pending",
        agent: "ExecutionAgent",
        tool: "drive.files.move",
        action: "Execute the archive plan",
        result: "Pending approval",
        timestamp: "—",
        durationMs: 0,
      },
      {
        stage: "VERIFY",
        status: "pending",
        agent: "VerifierAgent",
        tool: "checksum.compare",
        action: "Verify copies before source removal",
        result: "Pending",
        timestamp: "—",
        durationMs: 0,
      },
      {
        stage: "LEARN",
        status: "pending",
        agent: "MemoryAgent",
        tool: "memory.write",
        action: "Record outcome and user feedback",
        result: "Pending",
        timestamp: "—",
        durationMs: 0,
      },
    ],
  },
  {
    id: "1041",
    title: "Duplicate detection pass",
    startedAt: "2026-09-28 09:14",
    status: "completed",
    stages: [
      {
        stage: "OBSERVE",
        status: "done",
        agent: "MonitorAgent",
        tool: "drive.metadata.scan",
        action: "Hashed 12,340 files",
        result: "4 hash collisions found",
        timestamp: "09:14:02",
        durationMs: 11200,
      },
      {
        stage: "REASON",
        status: "done",
        agent: "AnalysisAgent",
        tool: "llm.reasoning",
        action: "Classified duplicates",
        result: "1 safe duplicate, 3 legitimate copies",
        timestamp: "09:14:14",
        durationMs: 3400,
      },
      {
        stage: "ACT",
        status: "done",
        agent: "ExecutionAgent",
        tool: "drive.files.move",
        action: "Moved duplicate to review folder",
        result: "1.4 GB staged",
        timestamp: "09:14:19",
        durationMs: 4100,
      },
      {
        stage: "VERIFY",
        status: "done",
        agent: "VerifierAgent",
        tool: "checksum.compare",
        action: "Verified staged copy",
        result: "Checksum verified",
        timestamp: "09:14:24",
        durationMs: 1500,
      },
    ],
  },
  {
    id: "1040",
    title: "Weekly forecast refresh",
    startedAt: "2026-09-27 06:00",
    status: "completed",
    stages: [
      {
        stage: "OBSERVE",
        status: "done",
        agent: "MonitorAgent",
        tool: "drive.usage.history",
        action: "Collected 7 months of usage history",
        result: "212 data points",
        timestamp: "06:00:03",
        durationMs: 2600,
      },
      {
        stage: "REASON",
        status: "done",
        agent: "ForecastAgent",
        tool: "forecast.regression",
        action: "Recomputed growth projection",
        result: "Critical threshold in ~24 days",
        timestamp: "06:00:06",
        durationMs: 1800,
      },
      {
        stage: "LEARN",
        status: "done",
        agent: "MemoryAgent",
        tool: "memory.write",
        action: "Stored updated baseline",
        result: "Baseline 3.8 GB/month",
        timestamp: "06:00:08",
        durationMs: 700,
      },
    ],
  },
];

export const migrations: Migration[] = [
  {
    id: "MIG-1042",
    source: "Google Drive /Media/Raw Footage",
    destination: "Cold Archive (demo tier)",
    files: 18,
    sizeGb: 11.2,
    started: "2026-09-29 14:02",
    completed: null,
    status: "Pending Approval",
    verification: "Pending",
    steps: [
      { label: "Copy", state: "pending" },
      { label: "Verify", state: "pending" },
      { label: "Confirm", state: "pending" },
      { label: "Archive", state: "pending" },
    ],
  },
  {
    id: "MIG-1041",
    source: "Google Drive /Design/Exports",
    destination: "Cold Archive (demo tier)",
    files: 1,
    sizeGb: 1.4,
    started: "2026-09-28 09:14",
    completed: "2026-09-28 09:22",
    status: "Verified",
    verification: "Checksum verified",
    steps: [
      { label: "Copy", state: "done" },
      { label: "Verify", state: "done" },
      { label: "Confirm", state: "done" },
      { label: "Archive", state: "done" },
    ],
  },
  {
    id: "MIG-1039",
    source: "Google Drive /Archive",
    destination: "Cold Archive (demo tier)",
    files: 6,
    sizeGb: 7.8,
    started: "2026-09-21 11:40",
    completed: "2026-09-21 12:05",
    status: "Completed",
    verification: "Checksum verified",
    steps: [
      { label: "Copy", state: "done" },
      { label: "Verify", state: "done" },
      { label: "Confirm", state: "done" },
      { label: "Archive", state: "done" },
    ],
  },
  {
    id: "MIG-1038",
    source: "Google Drive /Personal",
    destination: "Compressed bundle",
    files: 3,
    sizeGb: 2.1,
    started: "2026-09-15 16:22",
    completed: "2026-09-15 16:29",
    status: "Failed",
    verification: "Failed",
    steps: [
      { label: "Copy", state: "done" },
      { label: "Verify", state: "failed" },
      { label: "Confirm", state: "pending" },
      { label: "Archive", state: "pending" },
    ],
  },
  {
    id: "MIG-1037",
    source: "Google Drive /Projects/2024",
    destination: "Cold Archive (demo tier)",
    files: 22,
    sizeGb: 9.4,
    started: "2026-09-02 08:10",
    completed: "2026-09-02 08:51",
    status: "Completed",
    verification: "Checksum verified",
    steps: [
      { label: "Copy", state: "done" },
      { label: "Verify", state: "done" },
      { label: "Confirm", state: "done" },
      { label: "Archive", state: "done" },
    ],
  },
];

export const cloudProviders: CloudProvider[] = [
  {
    id: "gdrive",
    name: "Google Drive",
    status: "connected",
    usedGb: 82.4,
    totalGb: 100,
    accent: "primary",
    note: "Primary connector — metadata scanning active in demo mode.",
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    status: "coming-soon",
    accent: "info",
    note: "Connector planned — not functional in this build.",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    status: "coming-soon",
    accent: "info",
    note: "Connector planned — not functional in this build.",
  },
  {
    id: "s3",
    name: "AWS S3",
    status: "coming-soon",
    accent: "warning",
    note: "Object storage connector planned for archive tiers.",
  },
  {
    id: "azure",
    name: "Azure Blob Storage",
    status: "coming-soon",
    accent: "violet",
    note: "Object storage connector planned for archive tiers.",
  },
];

export const notifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Storage reached 82%",
    body: "Google Drive crossed the 80% warning threshold.",
    time: "4 min ago",
    route: "/monitoring",
    read: false,
    severity: "warning",
  },
  {
    id: "n-2",
    title: "8.7 GB of archive candidates detected",
    body: "HyperLoop identified inactive media eligible for archiving.",
    time: "22 min ago",
    route: "/recommendations",
    read: false,
    severity: "info",
  },
  {
    id: "n-3",
    title: "Agent run #1042 awaiting approval",
    body: "The archive plan needs a human decision before execution.",
    time: "1 h ago",
    route: "/agents",
    read: false,
    severity: "info",
  },
  {
    id: "n-4",
    title: "Migration MIG-1041 verified",
    body: "Checksum verification completed successfully.",
    time: "Yesterday",
    route: "/migrations",
    read: true,
    severity: "success",
  },
  {
    id: "n-5",
    title: "Google Drive synchronization completed",
    body: "12,482 files scanned in the latest sweep.",
    time: "Yesterday",
    route: "/clouds",
    read: true,
    severity: "success",
  },
];

export const monitoringEvents = [
  { time: "14:04:51", event: "New file detected", detail: "q3_pitch_v2.key (48 MB) in /Projects/2025" },
  { time: "14:04:12", event: "File modified", detail: "quarterly_metrics_q2.xlsx" },
  { time: "14:03:38", event: "Folder growth alert", detail: "/Design/Exports +420 MB in 1 h" },
  { time: "14:02:29", event: "Agent run started", detail: "Run #1042 — storage optimization sweep" },
  { time: "14:01:02", event: "Sync completed", detail: "12,482 files scanned, 17 changes" },
  { time: "13:58:44", event: "Large upload", detail: "webinar_session_09.mp4 (1.1 GB)" },
];

export const suggestedPrompts = [
  "What is consuming most of my storage?",
  "Which files could I archive?",
  "Why is my storage growing?",
  "How much storage can I recover?",
  "When might I reach the critical threshold?",
  "Why did you recommend these files?",
  "Show me my recent migrations.",
];
