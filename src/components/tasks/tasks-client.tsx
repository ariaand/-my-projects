"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useHenryStore } from "@/lib/store";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLUMNS: { id: TaskStatus; label: string; icon: any }[] = [
  { id: "pending", label: "Pending", icon: Circle },
  { id: "in_progress", label: "In Progress", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

export function TasksClient() {
  const tasks = useHenryStore((s) => s.tasks);
  const [tab, setTab] = React.useState<"board" | "list">("board");
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {tasks.filter((t) => t.status !== "completed").length} active ·{" "}
            {tasks.filter((t) => t.status === "completed").length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "board" | "list")}>
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="glow">
                <Plus className="h-4 w-4" /> New task
              </Button>
            </DialogTrigger>
            <NewTaskDialog onClose={() => setOpen(false)} />
          </Dialog>
        </div>
      </div>

      {tab === "board" ? <Board tasks={tasks} /> : <List tasks={tasks} />}
    </motion.div>
  );
}

function Board({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <Card key={col.id} className="bg-muted/30">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <col.icon className="h-4 w-4" /> {col.label}
                </div>
                <Badge variant="secondary">{colTasks.length}</Badge>
              </div>
              {colTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background p-6 text-center text-xs text-muted-foreground">
                  Nothing here.
                </div>
              ) : (
                colTasks.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function List({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 p-4 hover:bg-accent/40 transition"
          >
            <div className="flex min-w-0 items-center gap-3">
              <StatusToggle task={t} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      t.status === "completed" &&
                        "line-through text-muted-foreground",
                    )}
                  >
                    {t.title}
                  </span>
                  <PriorityBadge p={t.priority} />
                </div>
                {t.description && (
                  <div className="truncate text-xs text-muted-foreground">
                    {t.description}
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {t.due_date && (
                <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                  <CalendarClock className="h-3.5 w-3.5" /> {formatDate(t.due_date)}
                </span>
              )}
              <RowMenu task={t} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="border bg-background">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <StatusToggle task={task} />
            <div>
              <div
                className={cn(
                  "text-sm font-medium",
                  task.status === "completed" &&
                    "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </div>
              {task.description && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {task.description}
                </div>
              )}
            </div>
          </div>
          <RowMenu task={task} />
        </div>
        <div className="flex items-center justify-between">
          <PriorityBadge p={task.priority} />
          {task.due_date && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusToggle({ task }: { task: Task }) {
  const update = useHenryStore((s) => s.updateTaskStatus);
  const next: Record<TaskStatus, TaskStatus> = {
    pending: "in_progress",
    in_progress: "completed",
    completed: "pending",
  };
  return (
    <button
      aria-label="Cycle status"
      onClick={() => update(task.id, next[task.status])}
      className="grid h-5 w-5 place-items-center rounded-full border text-muted-foreground hover:text-foreground"
    >
      {task.status === "completed" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : task.status === "in_progress" ? (
        <Clock className="h-3.5 w-3.5 text-amber-500" />
      ) : (
        <Circle className="h-3 w-3" />
      )}
    </button>
  );
}

function RowMenu({ task }: { task: Task }) {
  const remove = useHenryStore((s) => s.removeTask);
  const update = useHenryStore((s) => s.updateTask);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Task actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => update(task.id, { priority: "high" })}>
          Mark high priority
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => update(task.id, { priority: "low" })}>
          Mark low priority
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            remove(task.id);
            toast.success("Task deleted.");
          }}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriorityBadge({ p }: { p: TaskPriority }) {
  if (p === "high") return <Badge variant="destructive">High</Badge>;
  if (p === "medium") return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

function NewTaskDialog({ onClose }: { onClose: () => void }) {
  const add = useHenryStore((s) => s.addTask);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [due, setDue] = React.useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a task</DialogTitle>
        <DialogDescription>
          Henry will pick this up next time you ask it to plan your week.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write April financial summary"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context for Henry."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due">Due date</Label>
            <Input
              id="due"
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="glow"
          disabled={!title.trim()}
          onClick={() => {
            add({
              title: title.trim(),
              description: description.trim() || undefined,
              priority,
              due_date: due ? new Date(due).toISOString() : null,
            });
            toast.success("Task created.");
            onClose();
          }}
        >
          Create task
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
