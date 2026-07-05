"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarDays, ExternalLink, FileText } from "lucide-react";
import {
  RiskResultCard,
  type AnalysisResult,
} from "@/components/dashboard/risk-result-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError, apiFetch } from "@/lib/api";

interface AnalysisDetail extends AnalysisResult {
  _id: string;
  inputType: "paste" | "url";
  jobDescription: string;
  createdAt: string;
}

export function HistoryDetailPage({
  analysisId,
}: {
  analysisId: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [record, setRecord] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiFetch<AnalysisDetail>(`/api/analysis/history/${analysisId}`)
      .then((response) => {
        if (active) setRecord(response.data);
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
            : "Could not load this analysis.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [analysisId, router]);

  return (
    <main className="min-h-screen bg-[#f7fbf9] text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <DashboardHeader active="history" />
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to history
        </Link>

        {loading ? (
          <DetailSkeleton />
        ) : error || !record ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
            <h1 className="text-xl font-semibold">Analysis unavailable</h1>
            <p className="mt-2 text-sm text-rose-700">
              {error || "This analysis could not be found."}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="rounded-full bg-white capitalize"
                >
                  <FileText className="mr-1.5 size-3.5" aria-hidden="true" />
                  {record.inputType}
                </Badge>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">
                  Saved analysis
                </h1>
              </div>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="size-4" aria-hidden="true" />
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(record.createdAt))}
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Submitted listing</h2>
                {record.sourceUrl && (
                  <a
                    href={record.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
                  >
                    Open source
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
              <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {record.input}
              </p>
            </div>

            <RiskResultCard result={record} />
          </motion.div>
        )}
      </section>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="mt-6 h-36 rounded-3xl" />
      <Skeleton className="mt-6 h-96 rounded-[2rem]" />
    </div>
  );
}
