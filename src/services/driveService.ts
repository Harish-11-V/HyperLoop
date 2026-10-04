import { getDriveOverviewFn } from "@/lib/drive.functions";
import type { DriveOverview } from "@/lib/drive.server";

/**
 * Live Google Drive data. Returns null when the connection is unavailable so
 * pages can fall back to the demo dataset.
 */
export const driveService = {
  getOverview: async (): Promise<DriveOverview | null> => {
    try {
      return await getDriveOverviewFn();
    } catch (error) {
      console.warn("Live Google Drive data unavailable, using demo data:", error);
      return null;
    }
  },
};
