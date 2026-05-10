"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useHenryStore } from "@/lib/store";
import { demoUsage } from "@/lib/demo-data";
import { formatDate, formatRelative } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardClient() {
  const tasks = useHenryStore((s) => s.tasks);
  const deliverables = useHenryStore((s) => s.deliverables);
  const memory = useHenryStore((s) => s.memory);
  const workspace = useHenryStore((s) => s.workspace);

  const active = tasks.filter((t) => t.status !== "completed");
  const completedThisWeek = tasks.filter((t) => t.status === "completed").length;
  const upcoming = active
    .filter((t) => t.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
    )
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Greeting */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-fuchsia-500/5 to-sky-500/10">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Standup
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Morning. Here's what's on your plate at {workspace.name}.
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {active.length} active tasks, {upcoming.length} due this week,{" "}
              {deliverables.length} deliverables filed. I drafted the Q2
              newsletter — review when you're ready.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/chat">
                <MessageSquare className="h-4 w-4" /> Chat with Henry
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks">View tasks</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metric tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={ClipboardList}
          label="Active tasks"
          value={active.length}
          delta={`${completedThisWeek} done this week`}
        />
        <MetricTile
          icon={MessageSquare}
          label="AI messages this week"
          value={demoUsage.messagesThisWeek}
          delta={`+${
            demoUsage.messagesThisWeek - demoUsage.messagesLastWeek
          } vs last week`}
        />
        <MetricTile
          icon={FileText}
          label="Deliverables this month"
          value={demoUsage.deliverablesThisMonth}
          delta="across 4 categories"
        />
        <MetricTile
          icon={TrendingUp}
          label="Hours saved (est.)"
          value={`${demoUsage.hoursSavedEstimate}h`}
          delta="based on chat + tasks"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">
                Open <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {active.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Inbox zero"
                body="You don't have any active tasks. Ask Henry to plan your week."
              />
            ) : (
              active.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border p-3 hover:bg-accent/40 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {t.title}
                      </span>
                      <PriorityBadge p={t.priority} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t.description ?? "No description"}
                    </div>
                  </div>
                  <div className="ml-3 shrink-0 text-right text-xs text-muted-foreground">
                    {t.due_date ? `Due ${formatDate(t.due_date)}` : "No due date"}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nothing due this week"
                body="You're caught up."
              />
            ) : (
              upcoming.map((t) => (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due {formatDate(t.due_date!)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent deliverables */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent deliverables</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/deliverables">
                Open <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {deliverables.slice(0, 4).map((d) => (
              <div
                key={d.id}
                className="rounded-xl border p-3 hover:bg-accent/40 transition"
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
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workspace memory */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Saved memory</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/memory">
                Open <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {memory.slice(0, 4).map((m) => (
              <div key={m.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{m.title}</span>
                  <Badge variant="outline" className="capitalize">
                    {m.category}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {m.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: any;
  label: string;
  value: string | number;
  delta: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs text-muted-foreground">{delta}</span>
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ p }: { p: "low" | "medium" | "high" }) {
  if (p === "high") return <Badge variant="destructive">High</Badge>;
  if (p === "medium") return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed p-8 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <div className="mt-2 text-sm font-medium">{title}</div>
      <div className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</div>
    </div>
  );
}
