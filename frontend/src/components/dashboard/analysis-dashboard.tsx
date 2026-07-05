"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ClipboardPaste,
  History,
  Link2,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { RiskResultCard, type AnalysisResult } from "./risk-result-card";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  username: string;
  email: string;
}

export function AnalysisDashboard() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiFetch<User>("/api/auth/me")
      .then((response) => {
        if (active) setUser(response.data);
      })
      .catch(() => {
        if (active) router.replace("/login");
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedInput = input.trim();

    if (cleanedInput.length < 30) {
      setError("Add a complete job description or URL of at least 30 characters.");
      return;
    }

    setError("");
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await apiFetch<AnalysisResult>(
        "/api/analysis/analyze",
        {
          method: "POST",
          body: JSON.stringify({ input: cleanedInput }),
        },
      );
      setResult(response.data);
      toast.success("Analysis complete");
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Could not analyze this listing. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  if (checkingSession) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbf9] text-slate-950">
      <AnimatedGridPattern
        numSquares={24}
        maxOpacity={0.08}
        className="absolute inset-x-0 top-0 h-[620px] text-emerald-500 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      />
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] size-[34rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />

      <header className="relative z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
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
            <Link
              href="/history"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full px-3 sm:px-4",
              )}
            >
              <History aria-hidden="true" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="rounded-full px-3 text-slate-600 sm:px-4"
            >
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-emerald-800 shadow-sm">
            <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />
            Welcome{user?.username ? `, ${user.username}` : ""}
          </Badge>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-[-0.035em] sm:text-5xl">
            Is this job opportunity safe?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-7 text-slate-600">
            Paste the complete description or a public URL. JobGuard will look
            for fraud patterns and explain the result.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-9 max-w-3xl"
        >
          <MagicCard
            mode="orb"
            glowFrom="#10b981"
            glowTo="#22d3ee"
            glowOpacity={0.15}
            className="rounded-[2rem] bg-white/85 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl"
          >
            <form className="p-5 sm:p-7" onSubmit={handleAnalyze}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="job-input" className="font-semibold">
                  Job description or URL
                </label>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  {input.trim().startsWith("http") ||
                  input.trim().startsWith("www.") ? (
                    <Link2 className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ClipboardPaste className="size-3.5" aria-hidden="true" />
                  )}
                  Auto-detected
                </span>
              </div>
              <Textarea
                id="job-input"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Paste a complete job description or public listing URL..."
                className="min-h-44 resize-y rounded-2xl border-slate-200 bg-white p-4 text-base leading-7 shadow-inner focus-visible:ring-emerald-600 sm:min-h-52"
                aria-describedby={error ? "analysis-error" : "input-help"}
                aria-invalid={Boolean(error)}
                disabled={analyzing}
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {error ? (
                    <p
                      id="analysis-error"
                      role="alert"
                      className="text-sm text-rose-600"
                    >
                      {error}
                    </p>
                  ) : (
                    <p id="input-help" className="text-sm text-slate-500">
                      {input.trim().length} characters · minimum 30
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={analyzing}
                  className="h-11 rounded-full bg-emerald-600 px-6 text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700"
                >
                  {analyzing ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles aria-hidden="true" />
                  )}
                  {analyzing ? "Analyzing..." : "Analyze job"}
                  {!analyzing && <ArrowRight aria-hidden="true" />}
                </Button>
              </div>
            </form>
          </MagicCard>
        </motion.div>

        {analyzing && <AnalysisLoading />}
        {result && <RiskResultCard result={result} />}
      </section>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7fbf9]">
      <div className="border-b bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="mx-auto h-9 w-3/4" />
        <Skeleton className="mx-auto mt-4 h-5 w-2/3" />
        <Skeleton className="mt-10 h-80 rounded-[2rem]" />
      </div>
    </main>
  );
}

function AnalysisLoading() {
  return (
    <div
      className="mx-auto mt-6 max-w-3xl rounded-3xl border border-emerald-100 bg-white/80 p-5"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <LoaderCircle
          className="size-5 animate-spin text-emerald-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold">Checking the signals</p>
          <p className="text-sm text-slate-500">
            This usually takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
