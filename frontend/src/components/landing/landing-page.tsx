"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Link2,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ScanSearch,
    title: "AI risk analysis",
    description:
      "Turn a job post into a clear 0-100 risk score with an easy-to-read verdict.",
  },
  {
    icon: TriangleAlert,
    title: "Explainable signals",
    description:
      "See the exact red flags and trust signals behind every assessment.",
  },
  {
    icon: Link2,
    title: "Paste text or a URL",
    description:
      "Analyze a full description or let JobGuard safely extract a public listing.",
  },
];

const trustPoints = [
  "No payment or document sharing required",
  "Private-network URLs are blocked",
  "Your analysis history stays account-scoped",
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbf9] text-slate-950">
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.12}
        duration={4}
        className={cn(
          "absolute inset-x-0 top-0 h-[760px] text-emerald-500",
          "[mask-image:linear-gradient(to_bottom,white,transparent)]",
        )}
      />
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-300/25 blur-3xl sm:h-[42rem] sm:w-[42rem]" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          aria-label="JobGuard home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">JobGuard</span>
        </Link>

        <nav className="flex items-center gap-2" aria-label="Primary navigation">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden rounded-full px-5 sm:inline-flex",
            )}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants(),
              "rounded-full bg-slate-950 px-5 text-white shadow-lg hover:bg-slate-800",
            )}
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-28 lg:pt-24">
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: reduceMotion ? 0 : 0.1 }}
          className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
        >
          <motion.div {...reveal} transition={{ duration: 0.45 }}>
            <Badge className="mb-6 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-emerald-800 shadow-sm backdrop-blur">
              <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />
              AI-powered job fraud detection
            </Badge>
          </motion.div>

          <motion.h1
            {...reveal}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-balance text-4xl font-bold tracking-[-0.045em] sm:text-6xl lg:text-7xl lg:leading-[1.02]"
          >
            Know the risk before you{" "}
            <span className="text-emerald-600">apply.</span>
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:mx-0"
          >
            JobGuard scans job descriptions for scam patterns and explains what
            looks suspicious, so you can make a safer, more confident decision.
          </motion.p>

          <motion.div
            {...reveal}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full bg-emerald-600 px-7 text-base font-semibold text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700",
              )}
            >
              Analyze a job
              <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 rounded-full border-slate-200 bg-white/70 px-7 text-base backdrop-blur hover:bg-white",
              )}
            >
              How it works
            </Link>
          </motion.div>

          <motion.p
            {...reveal}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-sm text-slate-500"
          >
            Free to start. No credit card required.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="mx-auto w-full max-w-xl"
        >
          <MagicCard
            mode="orb"
            glowFrom="#10b981"
            glowTo="#22d3ee"
            glowOpacity={0.24}
            className="rounded-[2rem] bg-white/75 p-1 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl"
          >
            <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Latest scan
                  </p>
                  <p className="mt-1 font-semibold">Remote Product Designer</p>
                </div>
                <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100">
                  Suspicious
                </Badge>
              </div>

              <div className="grid gap-6 py-6 sm:grid-cols-[9rem_1fr] sm:items-center">
                <div className="relative mx-auto grid size-32 place-items-center rounded-full bg-[conic-gradient(#f59e0b_0_54%,#e2e8f0_54%_100%)]">
                  <div className="grid size-24 place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <p className="text-3xl font-bold tracking-tight">54</p>
                      <p className="text-xs text-slate-500">risk score</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Signal
                    danger
                    text="Requests personal documents before interview"
                  />
                  <Signal danger text="Unclear company contact details" />
                  <Signal text="Responsibilities are clearly described" />
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                <span className="font-semibold">JobGuard advice:</span> Verify the
                recruiter through the company&apos;s official website before
                sharing any information.
              </div>
            </div>
          </MagicCard>
        </motion.div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 border-y border-slate-200/70 bg-white/70 py-16 backdrop-blur sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Built for clarity
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A second opinion in seconds
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <MagicCard className="h-full rounded-3xl bg-white">
                  <div className="h-full p-6 sm:p-7">
                    <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <feature.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-2">
                <CheckCircle2
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p>© 2026 JobGuard. Make safer career moves.</p>
        <p>Decision support, not a guarantee of legitimacy.</p>
      </footer>
    </main>
  );
}

function Signal({ text, danger = false }: { text: string; danger?: boolean }) {
  const Icon = danger ? TriangleAlert : CheckCircle2;

  return (
    <div className="flex items-start gap-2.5 text-sm leading-5">
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          danger ? "text-rose-500" : "text-emerald-600",
        )}
        aria-hidden="true"
      />
      <span className="text-slate-600">{text}</span>
    </div>
  );
}
