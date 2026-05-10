import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HenryMark } from "@/components/henry-mark";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-henry-mesh p-8">
      <div className="text-center">
        <HenryMark className="mx-auto" />
        <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight">
          404
        </h1>
        <p className="mt-2 text-muted-foreground">
          That page isn't on Henry's calendar.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="glow">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
