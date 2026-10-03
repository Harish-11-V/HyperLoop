import { API_BASE_URL, DEMO_MODE, delay, request } from "./apiClient";
import {
  fileTypeBreakdown,
  files,
  migrations,
  recommendations,
  storageSnapshot,
} from "@/data/demoData";

export interface ChatAnswer {
  answer: string;
  sources: string[];
  demo: true | false;
}

const gb = (n: number) => `${n.toFixed(1)} GB`;

function mockAnswer(question: string): ChatAnswer {
  const q = question.toLowerCase();

  if (q.includes("most") || q.includes("consum")) {
    const top = [...fileTypeBreakdown].sort((a, b) => b.sizeGb - a.sizeGb)[0]!;
    return {
      answer: `${top.type} account for the largest share of your demo dataset — ${gb(top.sizeGb)} across ${top.files.toLocaleString()} files. The single biggest folder is /Media/Raw Footage at 24.8 GB.`,
      sources: ["File Metadata", "Folder Index", "Storage History"],
      demo: true,
    };
  }
  if (q.includes("archive") || q.includes("recover") || q.includes("free")) {
    const total = recommendations.reduce((s, r) => s + r.recoveryGb, 0);
    return {
      answer: `Across ${recommendations.length} open recommendations you could recover about ${gb(total)}. The largest single opportunity is archiving 5 inactive video files for ${gb(12.8)}.`,
      sources: ["Recommendation Engine", "File Metadata", "Access Logs"],
      demo: true,
    };
  }
  if (q.includes("growing") || q.includes("growth") || q.includes("why")) {
    return {
      answer:
        "Growth is driven mainly by repeated full-resolution exports in /Design/Exports (+3.4 GB in the last 7 days, about 4x the normal rate) and by new raw footage uploads. Baseline growth is roughly 3.8 GB per month.",
      sources: ["Storage History", "Anomaly Detector", "Folder Index"],
      demo: true,
    };
  }
  if (q.includes("threshold") || q.includes("critical") || q.includes("when")) {
    return {
      answer: `At the current rate you reach the 90% critical threshold in about ${storageSnapshot.daysUntilCritical} days. Usage is ${gb(storageSnapshot.usedGb)} of ${storageSnapshot.totalGb} GB today.`,
      sources: ["Forecast Model (demo regression)", "Storage History"],
      demo: true,
    };
  }
  if (q.includes("migration")) {
    const recent = migrations.slice(0, 3);
    return {
      answer: `Your three most recent migrations: ${recent
        .map((m) => `${m.id} (${m.status}, ${gb(m.sizeGb)})`)
        .join(", ")}.`,
      sources: ["Migration Log", "Verification Records"],
      demo: true,
    };
  }
  if (q.includes("recommend")) {
    return {
      answer:
        "Those files were selected because each exceeds 1.5 GB, has no read activity for more than 150 days, and is not referenced by any shared link or retention policy. Guardrails excluded anything classified as business critical.",
      sources: ["Reasoning Trace — Run #1042", "User Preferences", "File Metadata"],
      demo: true,
    };
  }

  const biggest = [...files].sort((a, b) => b.sizeGb - a.sizeGb)[0]!;
  return {
    answer: `Here is what the demo dataset shows: ${gb(storageSnapshot.usedGb)} of ${storageSnapshot.totalGb} GB used, ${files.length} indexed sample files, and the largest single file is ${biggest.name} at ${gb(biggest.sizeGb)}. Ask about archiving, growth, forecasts, migrations, or recommendations for more detail.`,
    sources: ["File Metadata", "Storage History"],
    demo: true,
  };
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streams a live answer from the /api/chat route (Lovable AI Gateway),
 * grounded in the current storage dataset. Falls back to the local mock
 * service when the live route is unavailable.
 */
async function askLive(
  question: string,
  history: ChatHistoryMessage[],
  onToken: (text: string) => void,
): Promise<ChatAnswer> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [...history, { role: "user" as const, content: question }].slice(-20),
    }),
  });

  if (!response.ok || !response.body) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let answer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    answer += decoder.decode(value, { stream: true });
    onToken(answer);
  }

  return {
    answer,
    sources: ["Live AI (Lovable AI Gateway)", "Storage dataset"],
    demo: false,
  };
}

export const ragService = {
  ask: (question: string): Promise<ChatAnswer> =>
    DEMO_MODE
      ? delay(mockAnswer(question), 650)
      : request("/rag/ask", {
          method: "POST",
          body: JSON.stringify({ question }),
        }),

  askLive,

  mockAnswer,
};
