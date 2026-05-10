"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useHenryStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsClient() {
  const workspace = useHenryStore((s) => s.workspace);
  const update = useHenryStore((s) => s.updateWorkspace);
  const reset = useHenryStore((s) => s.resetDemo);
  const { theme, setTheme } = useTheme();

  const [name, setName] = React.useState(workspace.name);
  const [industry, setIndustry] = React.useState(workspace.industry ?? "");
  const [voice, setVoice] = React.useState(workspace.brand_voice ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-industry">Industry</Label>
            <Input
              id="ws-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-voice">Brand voice</Label>
            <Textarea
              id="ws-voice"
              rows={4}
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            />
          </div>
          <Button
            variant="glow"
            onClick={() => {
              update({
                name: name.trim(),
                industry: industry.trim() || null,
                brand_voice: voice.trim() || null,
              });
              toast.success("Workspace saved.");
            }}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Theme</Label>
            <Select value={theme ?? "system"} onValueChange={setTheme}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Stream replies</p>
              <p className="text-xs text-muted-foreground">
                Show Henry's responses token-by-token.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Save conversation history</p>
              <p className="text-xs text-muted-foreground">
                Persist chat threads to your Supabase project.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Use workspace memory</p>
              <p className="text-xs text-muted-foreground">
                Inject saved memory into every system prompt.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <p className="text-xs text-muted-foreground">
            Provider keys are configured in{" "}
            <span className="rounded bg-muted px-1 py-px font-mono text-[11px]">
              .env.local
            </span>
            . See{" "}
            <span className="rounded bg-muted px-1 py-px font-mono text-[11px]">
              .env.example
            </span>{" "}
            for the full list.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Reset demo data</p>
            <p className="text-xs text-muted-foreground">
              Restores the seeded workspace, tasks, memory and deliverables.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              toast.success("Demo data restored.");
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
