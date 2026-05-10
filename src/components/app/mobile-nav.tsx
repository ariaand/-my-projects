"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HenryMark } from "@/components/henry-mark";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "AI Chat" },
  { href: "/tasks", label: "Tasks" },
  { href: "/deliverables", label: "Deliverables" },
  { href: "/memory", label: "Workspace Memory" },
  { href: "/integrations", label: "Integrations" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() ?? "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[6%] left-1/2 max-w-sm -translate-x-1/2 translate-y-0 sm:rounded-2xl">
        <HenryMark />
        <nav className="mt-2 grid gap-1">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
