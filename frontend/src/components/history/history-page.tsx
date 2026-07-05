"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Link2,
  SearchX,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Verdict = "safe" | "suspicious" | "fake";
type Filter = "all" | Verdict;

interface HistoryRecord {
  _id: string;
  input: string;
  inputType: "paste" | "url";
  sourceUrl: string | null;
  riskScore: number;
  verdict: Verdict;
  redFlags: string[];
  greenFlags: string[];
  createdAt: string;
}

const verdictStyles: Record<
  Verdict,
  { label: string; badge: string; score: string }
> = {
  safe: {
    label: "Safe",
    badge: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    score: "text-emerald-700",
  },
  suspicious: {
    label: "Suspicious",
    badge: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    score: "text-amber-700",
  },
  fake: {
    label: "High risk",
    badge: "bg-rose-100 text-rose-800 hover:bg-rose-100",
    score: "text-rose-700",
  },
};

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "safe", label: "Safe" },
  { value: "suspicious", label: "Suspicious" },
  { value: "fake", label: "High risk" },
];

export function HistoryPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiFetch<HistoryRecord[]>("/api/analysis/history")
      .then((response) => {
        if (active) setRecords(response.data);
      })
      .catch((requestError) => {
        if (!active) return;
        if (
          requestError instanceof ApiClientError &&
          requestError.status === 401
        ) {
          router.replace("/login");
          return;
        }
        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Could not load your analysis history.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const visibleRecords = useMemo(
    () =>
      filter === "all"
        ? records
        : records.filter((record) => record.verdict === filter),
    [filter, records],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbf9]">
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.07}
        className="absolute inset-x-0 top-0 h-[500px] text-emerald-500 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      />
      <DashboardHeader active="history" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Your checks
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Analysis history
            </h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Revisit previous results and compare the signals you found.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-emerald-600 px-5 text-sm font-medium text-white shadow-lg shadow-emerald-600/15 transition-colors hover:bg-emerald-700 sm:self-auto"
          >
            Analyze another job
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <div className="mt-8 flex max-w-full gap-2 overflow-x-auto pb-2">
          {filters.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? "default" : "outline"}
              onClick={() => setFilter(item.value)}
              className={cn(
                "shrink-0 rounded-full px-4",
                filter === item.value
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "bg-white",
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <HistorySkeleton />
        ) : error ? (
          <StateCard
            icon={SearchX}
            title="History unavailable"
            description={error}
          />
        ) : visibleRecords.length === 0 ? (
          <StateCard
            icon={BriefcaseBusiness}
            title={records.length ? "No matching analyses" : "No analyses yet"}
            description={
              records.length
                ? "Try a different verdict filter."
                : "Analyze your first job listing to start building a history."
            }
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.06 },
              },
            }}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            {visibleRecords.map((record) => (
              <HistoryCard key={record._id} record={record} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}

function HistoryCard({ record }: { record: HistoryRecord }) {
  const style = verdictStyles[record.verdict];
  const InputIcon = record.inputType === "url" ? Link2 : FileText;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Link
        href={`/history/${record._id}`}
        className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <MagicCard
          gradientFrom={
            record.verdict === "safe"
              ? "#10b981"
              : record.verdict === "suspicious"
                ? "#f59e0b"
                : "#f43f5e"
          }
          gradientTo="#22d3ee"
          gradientOpacity={0.05}
          className="h-full rounded-3xl bg-white shadow-sm transition-shadow group-hover:shadow-xl"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <InputIcon className="size-5" aria-hidden="true" />
              </span>
              <Badge className={cn("rounded-full px-3", style.badge)}>
                {style.label}
              </Badge>
            </div>

            <p className="mt-5 line-clamp-2 min-h-12 text-sm font-medium leading-6 text-slate-800">
              {record.input}
            </p>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                }).format(new Date(record.createdAt))}
              </div>
              <div className="text-right">
                <p className={cn("text-2xl font-bold", style.score)}>
                  {Math.round(record.riskScore)}
                </p>
                <p className="text-[11px] text-slate-400">risk score</p>
              </div>
            </div>
          </div>
        </MagicCard>
      </Link>
    </motion.article>
  );
}

function HistorySkeleton() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-3xl border bg-white p-6">
          <div className="flex justify-between">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-3/4" />
          <div className="mt-5 flex justify-between border-t pt-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StateCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof SearchX;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
