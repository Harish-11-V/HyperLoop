import { createFileRoute } from "@tanstack/react-router";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { createResponsesCall } from "@/lib/ai/responses.server";
import {
  fileTypeBreakdown,
  folderUsage,
  migrations,
  recommendations,
  storageForecast,
  storageSnapshot,
  storageTrend,
} from "@/data/demoData";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

function buildSystemPrompt(): string {
  const context = {
    storageSnapshot,
    recentTrend: storageTrend.slice(-8),
    forecast: storageForecast,
    fileTypeBreakdown,
    folderUsage,
    openRecommendations: recommendations.map((r) => ({
      title: r.title,
      status: r.status,
      recoveryGb: r.recoveryGb,
    })),
    recentMigrations: migrations.slice(0, 5).map((m) => ({
      id: m.id,
      status: m.status,
      sizeGb: m.sizeGb,
    })),
  };

  return [
    "You are HyperLoop, an AI storage-operations assistant inside the HyperLoop AI console.",
    "Answer questions about the user's cloud storage using ONLY the dataset below.",
    "Be concise (2-5 sentences), specific, and cite the exact numbers from the data.",
    "If the data cannot answer a question, say so plainly and suggest what the app can show instead.",
    "Never invent files, sizes, or events that are not in the dataset.",
    "",
    "CURRENT STORAGE DATASET (JSON):",
    JSON.stringify(context),
  ].join("\n");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "AI is not configured on this deployment." },
            { status: 500 },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }
        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Invalid messages payload." }, { status: 400 });
        }

        const messages: ModelMessage[] = parsed.data.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        try {
          const call = createResponsesCall(
            request,
            { apiKey, system: buildSystemPrompt() },
            messages,
          );
          return call.response();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "The AI service could not answer.";
          return Response.json({ error: message }, { status: 502 });
        }
      },
    },
  },
});
