"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";

export interface AnalysisResult {
  input: string;
  sourceUrl: string | null;
  riskScore: number;
  verdict: "safe" | "suspicious" | "fake";
  redFlags: string[];
  greenFlags: string[];
}

const verdictConfig = {
  safe: {
    label: "Looks safe",
    color: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    ring: "#10b981",
    advice:
      "The listing shows positive signals, but independently verify the recruiter before sharing sensitive information.",
  },
  suspicious: {
    label: "Suspicious",
    color: "text-amber-700",
    badge: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    ring: "#f59e0b",
    advice:
      "Pause and verify the company, recruiter, and official domain before continuing.",
  },
  fake: {
    label: "High risk",
    color: "text-rose-700",
    badge: "bg-rose-100 text-rose-800 hover:bg-rose-100",
    ring: "#f43f5e",
    advice:
      "Do not send money, documents, banking details, or identity information. Verify the listing independently.",
  },
} as const;

export function RiskResultCard({ result }: { result: AnalysisResult }) {
  const reduceMotion = useReducedMotion();
  const config = verdictConfig[result.verdict];
  const score = Math.min(100, Math.max(0, Math.round(result.riskScore)));

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto mt-7 max-w-3xl"
      aria-labelledby="analysis-result-title"
    >
      <MagicCard
        gradientFrom={config.ring}
        gradientTo="#22d3ee"
        gradientOpacity={0.06}
        className="rounded-[2rem] bg-white shadow-xl shadow-slate-950/5"
      >
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Analysis result
              </p>
              <h2
                id="analysis-result-title"
                className="mt-1 text-2xl font-bold tracking-tight"
              >
                Job risk assessment
              </h2>
            </div>
            <Badge className={cn("w-fit rounded-full px-3 py-1", config.badge)}>
              {result.verdict === "safe" ? (
                <ShieldCheck className="mr-1.5 size-4" aria-hidden="true" />
              ) : (
                <TriangleAlert
                  className="mr-1.5 size-4"
                  aria-hidden="true"
                />
              )}
              {config.label}
            </Badge>
          </div>

          <div className="grid gap-8 py-7 sm:grid-cols-[10rem_1fr] sm:items-center">
            <div
              className="relative mx-auto grid size-36 place-items-center rounded-full"
              style={{
                background: `conic-gradient(${config.ring} 0 ${score}%, #e2e8f0 ${score}% 100%)`,
              }}
              aria-label={`Risk score ${score} out of 100`}
            >
              <div className="grid size-28 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className={cn("text-4xl font-bold", config.color)}>
                    {score}
                  </p>
                  <p className="text-xs text-slate-500">risk score</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <FlagGroup
                title="Warning signs"
                flags={result.redFlags}
                danger
                emptyText="No strong warning signs detected."
              />
              <FlagGroup
                title="Trust signals"
                flags={result.greenFlags}
                emptyText="No clear trust signals detected."
              />
            </div>
          </div>

          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl p-4 text-sm leading-6",
              result.verdict === "fake"
                ? "bg-rose-50 text-rose-950"
                : result.verdict === "suspicious"
                  ? "bg-amber-50 text-amber-950"
                  : "bg-emerald-50 text-emerald-950",
            )}
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-semibold">Recommended action:</span>{" "}
              {config.advice}
            </p>
          </div>
        </div>
      </MagicCard>
    </motion.section>
  );
}

function FlagGroup({
  title,
  flags,
  danger = false,
  emptyText,
}: {
  title: string;
  flags: string[];
  danger?: boolean;
  emptyText: string;
}) {
  const Icon = danger ? TriangleAlert : CheckCircle2;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-2">
        {(flags.length ? flags : [emptyText]).map((flag) => (
          <li key={flag} className="flex items-start gap-2 text-sm leading-5">
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                danger ? "text-rose-500" : "text-emerald-600",
              )}
              aria-hidden="true"
            />
            <span className="text-slate-600">{flag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
