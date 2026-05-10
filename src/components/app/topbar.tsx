"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/app/mobile-nav";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "AI Chat",
  "/tasks": "Tasks",
  "/deliverables": "Deliverables",
  "/memory": "Workspace Memory",
  "/integrations": "Integrations",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname() ?? "";
  const title =
    Object.keys(titles).find((k) => pathname.startsWith(k))?.length
      ? titles[Object.keys(titles).find((k) => pathname.startsWith(k))!]
      : "Henry";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl lg:px-8">
      <MobileNav />
      <h1 className="text-lg font-semibold tracking-tight lg:text-xl">{title}</h1>

      <div className="ml-auto hidden items-center gap-2 md:flex">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ask Henry or search…"
            className="w-72 pl-9"
          />
        </div>
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Link href="/settings" className="ml-1">
          <Avatar>
            <AvatarImage src="" alt="" />
            <AvatarFallback>NS</AvatarFallback>
          </Avatar>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <Link href="/settings">
          <Avatar>
            <AvatarFallback>NS</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
