import { DEMO_MODE, delay, request } from "./apiClient";
import {
  activityByDay,
  fileTypeBreakdown,
  files,
  folderUsage,
  storageForecast,
  storageSnapshot,
  storageTrend,
  type DriveFile,
  type StorageSnapshot,
} from "@/data/demoData";

export const storageService = {
  getSnapshot: (): Promise<StorageSnapshot> =>
    DEMO_MODE ? delay(storageSnapshot) : request("/storage/snapshot"),
  getTrend: (range: "7d" | "30d" | "90d" | "1y" = "90d") => {
    const sliceMap = { "7d": 2, "30d": 3, "90d": 5, "1y": 7 } as const;
    return DEMO_MODE
      ? delay(storageTrend.slice(-sliceMap[range]))
      : request(`/storage/trend?range=${range}`);
  },
  getForecast: () =>
    DEMO_MODE ? delay(storageForecast) : request("/storage/forecast"),
  getFileTypes: () =>
    DEMO_MODE ? delay(fileTypeBreakdown) : request("/storage/file-types"),
  getFolders: () =>
    DEMO_MODE ? delay(folderUsage) : request("/storage/folders"),
  getActivity: () =>
    DEMO_MODE ? delay(activityByDay) : request("/storage/activity"),
};

export const fileService = {
  list: (): Promise<DriveFile[]> =>
    DEMO_MODE ? delay(files) : request("/files"),
  get: (id: string): Promise<DriveFile | undefined> =>
    DEMO_MODE ? delay(files.find((f) => f.id === id)) : request(`/files/${id}`),
};
