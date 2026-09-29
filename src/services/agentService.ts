import { DEMO_MODE, delay, request } from "./apiClient";
import {
  agentRuns,
  insights,
  migrations,
  recommendations,
  type AgentRun,
  type Insight,
  type Migration,
  type Recommendation,
} from "@/data/demoData";

export const agentService = {
  listRuns: (): Promise<AgentRun[]> =>
    DEMO_MODE ? delay(agentRuns) : request("/agents/runs"),
};

export const insightService = {
  list: (): Promise<Insight[]> =>
    DEMO_MODE ? delay(insights) : request("/insights"),
};

export const recommendationService = {
  list: (): Promise<Recommendation[]> =>
    DEMO_MODE ? delay(recommendations) : request("/recommendations"),
  decide: (id: string, decision: "approved" | "rejected") =>
    DEMO_MODE
      ? delay({ id, status: decision })
      : request(`/recommendations/${id}`, {
          method: "POST",
          body: JSON.stringify({ decision }),
        }),
};

export const migrationService = {
  list: (): Promise<Migration[]> =>
    DEMO_MODE ? delay(migrations) : request("/migrations"),
};
