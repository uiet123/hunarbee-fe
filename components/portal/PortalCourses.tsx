"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  Loader2,
  MonitorSmartphone,
  Server,
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import {
  clearPortalToken,
  DURATION_LABELS,
  fetchPortalHome,
  formatBatchDate,
  getPortalToken,
  PortalApiError,
  PROGRAM_LABELS,
  type PortalEnrollment,
  type PortalHome,
} from "@/lib/portal";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ── Stagger animation ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Program icon map ── */
const PROGRAM_ICONS: Record<string, React.ElementType> = {
  frontend: MonitorSmartphone,
  backend: Server,
  fullstack: Layers,
};

/* ── Dynamic course modules (to be fetched) ── */
const MODULES: Record<string, { title: string; lessons: number; completed: number }[]> = {};

export function PortalCourses() {
  const router = useRouter();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getPortalToken();
    if (!token) { router.replace("/portal/login"); return; }

    let cancelled = false;
    fetchPortalHome(token)
      .then((data) => { if (!cancelled) { setHome(data); setLoading(false); } })
      .catch((err) => {
        if (cancelled) return;
        clearPortalToken();
        if (err instanceof PortalApiError && err.status === 401) { router.replace("/portal/login"); return; }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  if (loading) {
    return (
      <PortalShell pageTitle="My Courses">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-honey" />
        </div>
      </PortalShell>
    );
  }

  const enrollment = home?.enrollments[0] ?? null;

  return (
    <PortalShell pageTitle="My Courses">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1100px] space-y-6"
      >
        {enrollment ? (
          <CourseView enrollment={enrollment} />
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </PortalShell>
  );
}

/* ── Course View ── */
function CourseView({ enrollment }: { enrollment: PortalEnrollment }) {
  const program = PROGRAM_LABELS[enrollment.programId] ?? enrollment.programId;
  const duration = DURATION_LABELS[enrollment.durationId] ?? enrollment.durationId;
  const Icon = PROGRAM_ICONS[enrollment.programId] ?? Code2;
  const modules = MODULES[enrollment.programId] ?? [];

  const totalLessons = modules.reduce((s, m) => s + m.lessons, 0);
  const completedLessons = modules.reduce((s, m) => s + m.completed, 0);
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <>
      {/* Course Header Card */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-[24px] border border-navy/10 bg-navy p-6 text-white shadow-[var(--shadow-lift)] sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 55% 70% at 85% 25%, rgba(245,184,0,0.14), transparent 55%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-15" aria-hidden />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-honey/20 bg-honey/10">
              <Icon className="h-7 w-7 text-honey" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-honey">
                Currently enrolled
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">
                {program}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {duration}
                </span>
                <span className="h-3.5 w-px bg-surface-elevated/15" />
                <span>Batch: {formatBatchDate(enrollment.preferredBatch)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:text-right">
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-honey">
                {progressPct}%
              </p>
              <p className="text-xs text-white/45">completed</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-6">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated/[0.08]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-honey to-honey-deep"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </div>
          <p className="mt-2 text-xs text-white/40">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>
      </motion.div>

      {/* Modules List */}
      <motion.div variants={fadeUp} className="mt-8">
        <h3 className="mb-4 text-sm font-semibold tracking-wide text-navy">
          COURSE MODULES
        </h3>
        {modules.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod, i) => {
              const modProgress = mod.lessons > 0 ? Math.round((mod.completed / mod.lessons) * 100) : 0;
              const isComplete = mod.completed === mod.lessons;
              const isInProgress = mod.completed > 0 && !isComplete;

              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={cn(
                    "group rounded-[20px] border bg-surface-elevated/90 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                    isComplete ? "border-emerald-200/40" : isInProgress ? "border-honey/20" : "border-navy/8"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
                      isComplete ? "bg-emerald-400/10 text-emerald-500" :
                      isInProgress ? "bg-honey/10 text-honey-deep" :
                      "bg-navy/[0.04] text-slate"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-navy truncate">{mod.title}</h4>
                      </div>
                      <p className="mt-1 text-xs text-slate">
                        {mod.completed}/{mod.lessons} lessons
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/[0.04]">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            isComplete ? "bg-emerald-400" : "bg-gradient-to-r from-honey to-honey-deep"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${modProgress}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-navy/10 bg-surface px-4 py-12 text-center">
            <p className="text-sm text-slate">No course modules assigned yet.</p>
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center justify-center rounded-[24px] border border-navy/8 bg-surface-elevated/90 px-6 py-20 text-center shadow-[var(--shadow-soft)]"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-honey/10">
        <BookOpen className="h-8 w-8 text-honey" />
      </div>
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold text-navy">
        No courses yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate">
        Complete your enrollment to unlock your learning dashboard and course materials.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/apply">
          Apply for internship <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
}
