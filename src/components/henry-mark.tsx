import { cn } from "@/lib/utils";

export function HenryMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="henry-grad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="hsl(262 83% 65%)" />
            <stop offset="50%" stopColor="hsl(199 89% 60%)" />
            <stop offset="100%" stopColor="hsl(330 81% 65%)" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#henry-grad)" />
        <path
          d="M10 9V23M22 9V23M10 16H22"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-base tracking-tight">Henry</span>
    </span>
  );
}
