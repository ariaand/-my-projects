"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  LayoutDashboard,
  MessageSquare,
  Plug,
  Settings,
  Sparkles,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HenryMark } from "@/components/henry-mark";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat", icon: MessageSquare, badge: "Live" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/deliverables", label: "Deliverables", icon: FileText },
  { href: "/memory", label: "Workspace Memory", icon: BookOpen },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-card/50 backdrop-blur-xl">
      <div className="px-5 py-5">
        <Link href="/dashboard" className="block">
          <HenryMark />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <Badge variant="default" className="text-[10px]">
                  {badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border bg-gradient-to-br from-primary/10 via-fuchsia-500/5 to-sky-500/10 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Demo mode
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          You're viewing seeded data. Add Supabase + AI keys in
          <span className="mx-1 rounded bg-muted px-1 py-px font-mono">
            .env.local
          </span>
          to go live.
        </p>
      </div>
    </aside>
  );
}
