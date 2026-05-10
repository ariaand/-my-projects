"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Bot, Sparkles, User2 } from "lucide-react";
import { toast } from "sonner";
import { useHenryStore } from "@/lib/store";
import type { ChatRole, DeliverableKind, TaskPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface UIMessage {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
}

const SUGGESTIONS = [
  "Draft a Q2 client newsletter using my brand voice.",
  "Write an SOP for onboarding a new client in 7 days.",
  "Reconcile April Stripe payouts and summarize for my accountant.",
  "Plan my week — top 5 priorities ordered.",
];

export function ChatClient() {
  const workspace = useHenryStore((s) => s.workspace);
  const memory = useHenryStore((s) => s.memory);
  const addTask = useHenryStore((s) => s.addTask);
  const addDeliverable = useHenryStore((s) => s.addDeliverable);

  const [messages, setMessages] = React.useState<UIMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hey — I'm Henry. I have your brand voice and saved memory. Ask me to draft, plan, summarize, or run something.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: UIMessage = {
      id: `m_${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantId = `m_${Date.now()}_a`;
    const assistantStub: UIMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      pending: true,
    };
    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, assistantStub]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace: {
            name: workspace.name,
            industry: workspace.industry,
            brand_voice: workspace.brand_voice,
          },
          memory,
          messages: nextHistory.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Henry is unreachable (${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: acc, pending: true } : m,
          ),
        );
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: acc, pending: false } : m,
        ),
      );
      handleSideEffects(acc);
    } catch (err) {
      const message = (err as Error).message ?? "Something went wrong.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `[Henry: ${message}]`, pending: false }
            : m,
        ),
      );
      toast.error(message);
    } finally {
      setStreaming(false);
    }
  }

  function handleSideEffects(text: string) {
    /**
     * Henry's system prompt asks the model to end deliverables with
     *   "Filed as: <title> in Deliverables"
     * and tasks with
     *   "New task: <title> · priority <low|medium|high> · due <date>"
     * We parse those lines and persist them to the store.
     */
    const filedMatch = text.match(/Filed as:\s*(.+?)\s+in Deliverables/i);
    if (filedMatch) {
      const title = filedMatch[1].trim();
      const kind = inferKind(title, text);
      addDeliverable({ title, kind, body: text, tags: [] });
      toast.success(`Filed deliverable: ${title}`);
    }

    const taskRegex =
      /New task:\s*(.+?)\s*·\s*priority\s*(low|medium|high)\s*·\s*due\s*([^\n]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = taskRegex.exec(text)) !== null) {
      const [, title, p, dueRaw] = m;
      const dueIso = parseDueDate(dueRaw);
      addTask({
        title: title.trim(),
        priority: p.toLowerCase() as TaskPriority,
        due_date: dueIso,
      });
      toast.success(`Created task: ${title.trim()}`);
    }
  }

  return (
    <div className="grid h-[calc(100dvh-9rem)] grid-rows-[1fr_auto] gap-4">
      <Card className="overflow-hidden">
        <ScrollArea className="h-full" type="always">
          <div ref={scrollRef} className="space-y-6 p-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <Message key={m.id} message={m} />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Card>

      <div className="space-y-3">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-accent transition"
              >
                <Sparkles className="mr-1 inline h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
        )}
        <Card className="p-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask Henry to draft, plan, summarize, or run something…"
              className="min-h-[56px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              variant="glow"
              disabled={streaming || input.trim().length === 0}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex items-start gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted",
        )}
      >
        <pre className="whitespace-pre-wrap font-sans text-sm">
          {message.content || (message.pending ? "Thinking…" : "")}
        </pre>
        {message.pending && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
            <span>Henry is working…</span>
          </div>
        )}
        {!message.pending && message.role === "assistant" && (
          <SideEffectChips text={message.content} />
        )}
      </div>
      {isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/10">
          <User2 className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}

function SideEffectChips({ text }: { text: string }) {
  const filed = /Filed as:/i.test(text);
  const taskCount = (text.match(/New task:/gi) ?? []).length;
  if (!filed && taskCount === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {filed && <Badge variant="success">Deliverable saved</Badge>}
      {taskCount > 0 && (
        <Badge variant="warning">
          {taskCount} task{taskCount === 1 ? "" : "s"} created
        </Badge>
      )}
    </div>
  );
}

function inferKind(title: string, body: string): DeliverableKind {
  const t = `${title} ${body}`.toLowerCase();
  if (/newsletter|subject:|email/.test(t)) return "email";
  if (/sop|process|procedure|onboarding/.test(t)) return "sop";
  if (/financial|p&l|reconcil|stripe|cash/.test(t)) return "financial_summary";
  if (/post|caption|linkedin|tweet/.test(t)) return "social_post";
  if (/marketing plan|campaign/.test(t)) return "marketing_plan";
  if (/note|brief/.test(t)) return "client_note";
  if (/report/.test(t)) return "report";
  return "other";
}

function parseDueDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || /flexible|tbd|none|n\/a/i.test(trimmed)) return null;
  const iso = trimmed.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (iso) return new Date(iso).toISOString();
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
