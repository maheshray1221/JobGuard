"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f7fbf9] text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <AnimatedGridPattern
        numSquares={24}
        maxOpacity={0.1}
        className="absolute inset-0 text-emerald-500 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      />

      <section className="relative z-10 hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-14">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <Link
          href="/"
          className="relative flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-500">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">JobGuard</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative max-w-lg"
        >
          <Badge className="mb-5 rounded-full border-white/10 bg-white/10 px-3 py-1 text-emerald-200">
            <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />
            Safer career decisions
          </Badge>
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] xl:text-5xl">
            Pause. Check the signals. Apply with confidence.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-slate-300">
            JobGuard turns suspicious details into clear, practical guidance
            before you share personal information.
          </p>
        </motion.div>

        <p className="relative text-sm text-slate-500">
          AI guidance, not a guarantee of legitimacy.
        </p>
      </section>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:hidden"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to JobGuard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <MagicCard
              gradientFrom="#10b981"
              gradientTo="#22d3ee"
              gradientOpacity={0.08}
              className="rounded-[2rem] bg-white/85 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:bg-slate-900/90"
            >
              <div className="p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {description}
                </p>
                <div className="mt-7">{children}</div>
              </div>
            </MagicCard>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
