"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  title,
  subtitle,
}: {
  mode: Mode;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    /**
     * TODO(supabase): replace with the real Supabase auth call.
     *   const { error } = await supabase.auth.signInWithPassword({...})
     *   const { error } = await supabase.auth.signUp({...})
     * See src/lib/supabase/client.ts.
     */
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success(
      mode === "login"
        ? "Welcome back. Loading your workspace…"
        : "Workspace created. Henry is meeting you in the dashboard.",
    );
    router.push("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <Button variant="outline" className="w-full">
        Continue with Google
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          or with email
        </span>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Amelia Reed" required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@studio.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" variant="glow" disabled={loading}>
          {loading
            ? "Working…"
            : mode === "login"
              ? "Log in"
              : "Create workspace"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New to Henry?{" "}
            <Link href="/signup" className="text-foreground underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
