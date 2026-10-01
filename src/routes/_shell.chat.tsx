import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { suggestedPrompts } from "@/data/demoData";
import { ragService } from "@/services/ragService";
import { DemoTag, Panel, PageHeader, StatusBadge } from "@/components/common/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/chat")({
  head: () => ({
    meta: [
      { title: "Ask HyperLoop — HyperLoop AI" },
      {
        name: "description",
        content:
          "Ask questions about your cloud storage and get grounded answers with source references.",
      },
      { property: "og:title", content: "Ask HyperLoop — HyperLoop AI" },
      {
        property: "og:description",
        content: "A retrieval-grounded assistant for your cloud storage.",
      },
    ],
  }),
  component: ChatPage,
});

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      text: "Hello. I can explain what is consuming your storage, what can be archived, and when you will hit your threshold. Answers in this build come from a mock service over the demo dataset — not from a live language model.",
      sources: ["Demo dataset"],
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    const res = await ragService.ask(text);
    setMessages((m) => [
      ...m,
      { id: Date.now() + 1, role: "assistant", text: res.answer, sources: res.sources },
    ]);
    setBusy(false);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <div>
      <PageHeader
        title="Ask HyperLoop"
        description="Ask questions about your cloud storage."
        actions={<DemoTag label="Mock AI service" />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <Panel className="flex h-[32rem] flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg border",
                    m.role === "assistant"
                      ? "border-primary/30 bg-primary/12 text-primary"
                      : "border-violet/30 bg-violet/12 text-violet",
                  )}
                >
                  {m.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
                </span>
                <div className={cn("max-w-[42rem]", m.role === "user" && "text-right")}>
                  <div
                    className={cn(
                      "inline-block rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "assistant"
                        ? "bg-muted/40 text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                  {m.sources && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                        Sources:
                      </span>
                      {m.sources.map((s) => (
                        <StatusBadge key={s} tone="info">
                          {s}
                        </StatusBadge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <p className="pl-11 text-xs text-muted-foreground">
                HyperLoop is retrieving context…
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about usage, archiving, growth or migrations…"
              className="w-full rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </Panel>

        <Panel>
          <p className="text-xs font-semibold tracking-wide">Suggested questions</p>
          <div className="mt-3 space-y-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => void send(p)}
                className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Responses are produced by a local mock service over the demo dataset. The
            request path is already shaped for a FastAPI → RAG → LLM backend.
          </p>
        </Panel>
      </div>
    </div>
  );
}
