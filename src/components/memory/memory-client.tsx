"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Pin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHenryStore } from "@/lib/store";
import type { MemoryItem } from "@/lib/types";
import { formatRelative } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const CATEGORIES: MemoryItem["category"][] = [
  "business",
  "brand",
  "services",
  "pricing",
  "client",
  "links",
  "other",
];

export function MemoryClient() {
  const memory = useHenryStore((s) => s.memory);
  const update = useHenryStore((s) => s.updateMemory);
  const remove = useHenryStore((s) => s.removeMemory);
  const [open, setOpen] = React.useState(false);

  const sorted = [...memory].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">What Henry remembers</h2>
              <p className="text-sm text-muted-foreground">
                Saved facts about your business, brand voice, services, pricing
                and clients. Pinned items are surfaced in every reply.
              </p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="glow">
                <Plus className="h-4 w-4" /> Add memory
              </Button>
            </DialogTrigger>
            <NewMemoryDialog onClose={() => setOpen(false)} />
          </Dialog>
        </CardContent>
      </Card>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center p-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No memory yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Save your brand voice, service menu, pricing, ICP and key links so
              Henry can write like your team.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((m) => (
            <Card key={m.id} className="group">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {m.category}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => update(m.id, { pinned: !m.pinned })}
                      aria-label={m.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin
                        className={`h-4 w-4 ${
                          m.pinned ? "fill-primary text-primary" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        remove(m.id);
                        toast.success("Memory removed.");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold">{m.title}</h3>
                <p className="line-clamp-4 text-sm text-muted-foreground">
                  {m.content}
                </p>
                <p className="pt-2 text-xs text-muted-foreground">
                  Updated {formatRelative(m.updated_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function NewMemoryDialog({ onClose }: { onClose: () => void }) {
  const add = useHenryStore((s) => s.addMemory);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] =
    React.useState<MemoryItem["category"]>("business");
  const [pinned, setPinned] = React.useState(false);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a memory</DialogTitle>
        <DialogDescription>
          Henry will reference this in every chat reply.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="m-title">Title</Label>
          <Input
            id="m-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Service menu & pricing"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-content">Content</Label>
          <Textarea
            id="m-content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Brand sprint $6,500 (2 weeks). Identity system $12,000 (4 weeks)…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as MemoryItem["category"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-end gap-2 pb-1">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm">Pin to system prompt</span>
          </label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="glow"
          disabled={!title.trim() || !content.trim()}
          onClick={() => {
            add({
              title: title.trim(),
              content: content.trim(),
              category,
              pinned,
            });
            toast.success("Memory saved.");
            onClose();
          }}
        >
          Save memory
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
