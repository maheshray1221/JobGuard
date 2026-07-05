"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader({
  active,
}: {
  active: "dashboard" | "history";
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="relative z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="font-bold tracking-tight">JobGuard</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
          <ThemeToggle />
          <Link
            href="/dashboard"
            aria-current={active === "dashboard" ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-full px-3 sm:px-4",
              active === "dashboard" && "bg-emerald-50 text-emerald-800",
            )}
          >
            <LayoutDashboard aria-hidden="true" />
            <span className="hidden md:inline">Analyze</span>
          </Link>
          <Link
            href="/history"
            aria-current={active === "history" ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-full px-3 sm:px-4",
              active === "history" && "bg-emerald-50 text-emerald-800",
            )}
          >
            <History aria-hidden="true" />
            <span className="hidden md:inline">History</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="rounded-full px-3 text-slate-600 sm:px-4"
          >
            <LogOut aria-hidden="true" />
            <span className="hidden md:inline">Sign out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
