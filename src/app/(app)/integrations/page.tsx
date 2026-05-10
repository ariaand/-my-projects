"use client";

import { motion } from "framer-motion";
import { ArrowRight, Plug } from "lucide-react";
import { toast } from "sonner";
import { integrationCards } from "@/lib/demo-data";
import type { IntegrationProvider } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ICONS: Record<IntegrationProvider, string> = {
  gmail: "M",
  google_drive: "▲",
  canva: "C",
  quickbooks: "Q",
  xero: "X",
};

export default function IntegrationsPage() {
  const grouped = integrationCards.reduce<
    Record<string, typeof integrationCards>
  >((acc, c) => {
    acc[c.category] ??= [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Plug className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Integrations</h2>
            <p className="text-sm text-muted-foreground">
              Connect your tools so Henry can work in them, not just talk about
              them. We're rolling these out one provider at a time.
            </p>
          </div>
        </CardContent>
      </Card>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {cat}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Card key={c.provider} className="group">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-fuchsia-500/10 text-primary font-display text-base font-semibold">
                      {ICONS[c.provider]}
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold">{c.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      toast(
                        `Joining the ${c.name} early-access list… we'll email you.`,
                      )
                    }
                  >
                    Request early access <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "connected") return <Badge variant="success">Connected</Badge>;
  if (status === "coming_soon") return <Badge variant="warning">Coming soon</Badge>;
  return <Badge variant="secondary">Not connected</Badge>;
}
