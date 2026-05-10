import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-henry-mesh opacity-70" />
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-h-dvh flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
