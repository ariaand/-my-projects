import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("henry-skeleton h-4 w-full", className)}
      {...props}
    />
  );
}
