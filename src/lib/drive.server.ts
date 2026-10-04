import type { DriveFile, FileTypeSlice, FolderUsage } from "@/data/demoData";

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
}

export interface DriveOverview {
  userName: string;
  userEmail: string;
  usedGb: number;
  totalGb: number;
  fileCount: number;
  files: DriveFile[];
  typeBreakdown: FileTypeSlice[];
  folderUsage: FolderUsage[];
}

async function driveGet(path: string, params: Record<string, string>) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_DRIVE_API_KEY"];
  if (!apiKey || !connectionKey) {
    throw new Error("Google Drive is not connected to this project.");
  }
  const url = new URL(`${GATEWAY}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Connection-Api-Key": connectionKey,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Drive gateway request failed [${response.status}]: ${body}`);
    throw new Error(`Google Drive request failed (${response.status}).`);
  }
  return response.json() as Promise<Record<string, unknown>>;
}

function mapType(mimeType: string): DriveFile["type"] {
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType === "application/pdf") return "PDF";
  if (/zip|tar|gzip|x-7z|rar|archive/.test(mimeType)) return "Archive";
  if (
    mimeType.startsWith("text/") ||
    /document|spreadsheet|presentation|msword|officedocument|json|csv/.test(mimeType)
  )
    return "Document";
  return "Other";
}

function classify(daysSinceModified: number): DriveFile["classification"] {
  if (daysSinceModified > 180) return "Archive candidate";
  if (daysSinceModified > 60) return "Inactive";
  return "Active";
}

export async function getDriveOverview(): Promise<DriveOverview> {
  const about = (await driveGet("/about", { fields: "user,storageQuota" })) as {
    user?: { displayName?: string; emailAddress?: string };
    storageQuota?: { usage?: string; limit?: string };
  };

  // Page through files (cap at 3 pages = 600 items for a snappy demo).
  const apiFiles: DriveApiFile[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 3; page++) {
    const res = (await driveGet("/files", {
      fields: "files(id,name,mimeType,size,modifiedTime,parents,webViewLink),nextPageToken",
      pageSize: "200",
      orderBy: "modifiedTime desc",
      ...(pageToken ? { pageToken } : {}),
    })) as { files?: DriveApiFile[]; nextPageToken?: string };
    apiFiles.push(...(res.files ?? []));
    if (!res.nextPageToken) break;
    pageToken = res.nextPageToken;
  }

  const folderNames = new Map<string, string>();
  for (const f of apiFiles) {
    if (f.mimeType === "application/vnd.google-apps.folder") folderNames.set(f.id, f.name);
  }

  const now = Date.now();
  const files: DriveFile[] = apiFiles
    .filter((f) => f.mimeType !== "application/vnd.google-apps.folder")
    .map((f) => {
      const sizeGb = f.size ? Number(f.size) / 1e9 : 0;
      const modified = f.modifiedTime ? f.modifiedTime.slice(0, 10) : "unknown";
      const days = f.modifiedTime
        ? Math.max(0, Math.round((now - new Date(f.modifiedTime).getTime()) / 86_400_000))
        : 0;
      const classification = classify(days);
      const parentId = f.parents?.[0];
      const folder = (parentId && folderNames.get(parentId)) || "/My Drive";
      return {
        id: f.id,
        name: f.name,
        type: mapType(f.mimeType),
        sizeGb,
        modified,
        folder,
        lastAccessDays: days,
        classification,
        risk: "Low" as const,
        recommendation:
          classification === "Archive candidate"
            ? "Not modified in over 6 months — candidate for archive tier."
            : classification === "Inactive"
              ? "Low recent activity — review before archiving."
              : "Recently active — keep in hot storage.",
      };
    });

  const typeMap = new Map<string, { sizeGb: number; files: number }>();
  for (const f of files) {
    const t = typeMap.get(f.type) ?? { sizeGb: 0, files: 0 };
    t.sizeGb += f.sizeGb;
    t.files += 1;
    typeMap.set(f.type, t);
  }
  const typeBreakdown: FileTypeSlice[] = [...typeMap.entries()]
    .map(([type, v]) => ({ type, sizeGb: v.sizeGb, files: v.files }))
    .sort((a, b) => b.sizeGb - a.sizeGb);

  const folderMap = new Map<string, number>();
  for (const f of files) folderMap.set(f.folder, (folderMap.get(f.folder) ?? 0) + f.sizeGb);
  const folderUsage: FolderUsage[] = [...folderMap.entries()]
    .map(([folder, sizeGb]) => ({ folder, sizeGb }))
    .sort((a, b) => b.sizeGb - a.sizeGb)
    .slice(0, 8);

  const usageBytes = Number(about.storageQuota?.usage ?? 0);
  const limitBytes = Number(about.storageQuota?.limit ?? 0);

  return {
    userName: about.user?.displayName ?? "Google Drive user",
    userEmail: about.user?.emailAddress ?? "",
    usedGb: usageBytes / 1e9,
    totalGb: limitBytes > 0 ? limitBytes / 1e9 : Math.max(usageBytes / 1e9, 15),
    fileCount: files.length,
    files,
    typeBreakdown,
    folderUsage,
  };
}
