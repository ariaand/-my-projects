import Link from "next/link";
import { HenryMark } from "@/components/henry-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-henry-mesh opacity-80" />
      <div className="flex flex-col p-8 lg:p-12">
        <Link href="/">
          <HenryMark />
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="hidden lg:flex relative items-center justify-center border-l bg-card/50 backdrop-blur-xl p-12">
        <div className="max-w-md space-y-6 text-left">
          <blockquote className="font-display text-2xl tracking-tight">
            “Henry plans my week, drafts my client work, and follows up on its
            own. It feels like hiring a senior teammate.”
          </blockquote>
          <div className="text-sm">
            <div className="font-medium">Amelia R.</div>
            <div className="text-muted-foreground">Founder, brand studio</div>
          </div>
          <div className="rounded-2xl border bg-background/60 p-4 text-sm">
            <div className="text-muted-foreground">Today's stand-up from Henry</div>
            <p className="mt-2">
              You have 3 tasks due today. The Q2 newsletter is drafted and
              waiting. April reconciliation flagged 2 mismatches — want me to
              fix them?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
