import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7fbf9] px-4">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          You&apos;re signed in
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          The analysis dashboard is the next frontend milestone.
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-6 rounded-full bg-white px-5",
          )}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
