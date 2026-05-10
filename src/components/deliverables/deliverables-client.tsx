"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Copy, FileText, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHenryStore } from "@/lib/store";
import type { DeliverableKind } from "@/lib/types";
import { formatRelative } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const KINDS: { id: "all" | DeliverableKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "report", label: "Reports" },
  { id: "social_post", label: "Social" },
  { id: "email", label: "Emails" },
  { id: "sop", label: "SOPs" },
  { id: "client_note", label: "Client notes" },
  { id: "marketing_plan", label: "Marketing" },
  { id: "financial_summary", label: "Finance" },
];

export function DeliverablesClient() {
  const deliverables = useHenryStore((s) => s.deliverables);
  const remove = useHenryStore((s) => s.removeDeliverable);
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState<(typeof KINDS)[number]["id"]>("all");
  const [activeId, setActiveId] = React.useState<string | null>(
    deliverables[0]?.id ?? null,
  );

  const filtered = deliverables.filter((d) => {
    if (kind !== "all" && d.kind !== kind) return false;
    if (
      q &&
      !`${d.title} ${d.body} ${d.tags.join(" ")}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )
      return false;
    return true;
  });

  const active = filtered.find((d) => d.id === activeId) ?? filtered[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deliverables…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as any)}>
        <TabsList className="flex flex-wrap">
          {KINDS.map((k) => (
            <TabsTrigger key={k.id} value={k.id} className="capitalize">
              {k.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={kind}>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <Card>
                <ScrollArea className="h-[68dvh]">
                  <div className="divide-y">
                    {filtered.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setActiveId(d.id)}
                        className={`block w-full text-left p-4 hover:bg-accent/40 transition ${
                          active?.id === d.id ? "bg-accent/60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="capitalize">
                            {d.kind.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelative(d.created_at)}
                          </span>
                        </div>
                        <div className="mt-2 line-clamp-1 text-sm font-medium">
                          {d.title}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {d.body}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              <Card>
                {active ? (
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {active.kind.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelative(active.created_at)}
                          </span>
                        </div>
                        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
                          {active.title}
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(active.body);
                            toast.success("Copied to clipboard.");
                          }}
                        >
                          <Copy className="h-4 w-4" /> Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            remove(active.id);
                            toast.success("Deliverable deleted.");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-relaxed font-sans">
                      {active.body}
                    </pre>
                  </CardContent>
                ) : (
                  <div className="grid h-full place-items-center p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      Pick a deliverable to view it.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="grid place-items-center p-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">No deliverables yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ask Henry in chat to draft a report, email, SOP or social post — it'll
          file the result here automatically.
        </p>
      </CardContent>
    </Card>
  );
}
