import { createServerFn } from "@tanstack/react-start";
import { getDriveOverview } from "./drive.server";

/**
 * Live Google Drive overview for the console. Public read-only endpoint for
 * the demo build — the Drive connection itself is read-only scoped.
 */
export const getDriveOverviewFn = createServerFn({ method: "GET" }).handler(async () => {
  return getDriveOverview();
});
