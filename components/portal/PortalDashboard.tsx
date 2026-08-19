"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Loader2,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import {
  clearPortalToken,
  DURATION_LABELS,
  fetchPortalHome,
  firstName,
  formatBatchDate,
  formatFallbackLabel,
  getPortalToken,
  PortalApiError,
  PROGRAM_LABELS,
  type PortalEnrollment,
  type PortalHome,
} from "@/lib/portal";
import { cn } from "@/lib/utils";

/* ── Stagger animation variants ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Journey steps ── */
const JOURNEY = [
  { id: "enrolled", label: "Enrolled", desc: "Seat confirmed", icon: CheckCircle2 },
  { id: "onboarding", label: "Onboarding", desc: "Setup & intro", icon: Compass },
  { id: "learning", label: "Learning", desc: "Skill building", icon: BookOpen },
  { id: "project", label: "Live Project", desc: "Real deliverables", icon: Rocket },
  { id: "certificate", label: "Certificate", desc: "Completion", icon: Trophy },
] as const;

/* ── Quick stats config (now computed dynamically in component) ── */

/* ── Upcoming schedule (to be dynamic) ── */
const UPCOMING: unknown[] = [];

/* ── Announcements (to be dynamic) ── */
const ANNOUNCEMENTS: unknown[] = [];

export function PortalDashboard() {
  const router = useRouter();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getPortalToken();
    if (!token) {
      router.replace("/portal/login");
      return;
    }

    let cancelled = false;
    fetchPortalHome(token)
      .then((data) => {
        if (!cancelled) {
          setHome(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        clearPortalToken();
        if (err instanceof PortalApiError && err.status === 401) {
          router.replace("/portal/login");
          return;
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <PortalShell pageTitle="Dashboard">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-honey" />
        </div>
      </PortalShell>
    );
  }

  const enrollment = home?.enrollments[0] ?? null;
  const name = home ? firstName(home.user.name) : "Student";

  // Calculate dynamic internship progress
  let totalDays = 30; // default 1 month
  let daysLeft = 0;
  let completionPct = 0;

  if (enrollment) {
    if (enrollment.durationId === "2-months") totalDays = 60;
    else if (enrollment.durationId === "3-months") totalDays = 90;

    const startDate = new Date(enrollment.preferredBatch.split("T")[0]);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysPassed < 0) {
      daysLeft = 0; // Internship hasn't started yet
      completionPct = 0;
    } else if (daysPassed >= totalDays) {
      daysLeft = 0; // Internship finished
      completionPct = 100;
    } else {
      daysLeft = totalDays - daysPassed;
      completionPct = Math.round((daysPassed / totalDays) * 100);
    }
  }

  const dynamicStats = [
    { label: "Completion", value: `${completionPct}%`, icon: Target, color: "from-honey/20 to-honey/5" },
    { label: "Days Left", value: daysLeft.toString(), icon: Clock, color: "from-blue-400/15 to-blue-400/5" },
    { label: "Assignments", value: "2/14", icon: Zap, color: "from-emerald-400/15 to-emerald-400/5" },
    { label: "Streak", value: "5 days", icon: TrendingUp, color: "from-purple-400/15 to-purple-400/5" },
  ];

  return (
    <PortalShell pageTitle="Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1100px] space-y-6"
      >
        {/* ── Welcome Hero Card ── */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-[24px] border border-navy/10 bg-navy p-6 text-white shadow-[var(--shadow-lift)] sm:p-8"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 90% 20%, rgba(245,184,0,0.15), transparent 55%), radial-gradient(ellipse 40% 50% at 10% 80%, rgba(70,110,160,0.12), transparent 50%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 honeycomb-bg opacity-20" aria-hidden />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-honey">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Keep going, {name}!
              <span className="block text-lg font-medium text-white/55 sm:text-xl mt-1">
                Your internship journey is right on track.
              </span>
            </h2>
          </div>

          {/* Decorative floating element */}
          <div className="pointer-events-none absolute right-6 top-6 h-20 w-20 animate-subtle-float opacity-20 sm:h-28 sm:w-28">
            <GraduationCap className="h-full w-full text-honey" strokeWidth={0.8} />
          </div>
        </motion.div>

        {/* ── Quick Stats ── */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {dynamicStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group rounded-[20px] border border-navy/8 bg-surface-elevated/90 p-4 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-honey/25 hover:shadow-[var(--shadow-lift)] sm:p-5"
              >
                <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", stat.color)}>
                  <Icon className="h-[18px] w-[18px] text-navy/70" />
                </div>
                <p className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-navy sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* ── Main Grid: Enrollment + Journey ── */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.85fr]">
          {/* Enrollment Card */}
          <motion.div
            variants={fadeUp}
            className="rounded-[24px] border border-navy/8 bg-surface-elevated/90 p-6 shadow-[var(--shadow-soft)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-honey-deep">
              Active enrollment
            </p>
            {enrollment ? (
              <EnrollmentPanel enrollment={enrollment} completionPct={completionPct} />
            ) : (
              <div className="mt-4">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-navy">
                  No enrollment yet
                </h3>
                <p className="mt-2 text-sm text-slate">
                  Complete payment on the apply page to unlock your internship seat.
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/apply">
                    Apply now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Journey Timeline */}
          <motion.div
            variants={fadeUp}
            className="rounded-[24px] border border-navy/10 bg-navy p-6 text-white shadow-[var(--shadow-lift)] sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-honey">
              Your journey
            </p>
            <ul className="mt-5 space-y-3">
              {JOURNEY.map((step, index) => {
                const Icon = step.icon;
                const done = index === 0 && Boolean(enrollment);
                const current = index === 1 && Boolean(enrollment);
                const isLast = index === JOURNEY.length - 1;

                return (
                  <li key={step.id} className="relative flex items-start gap-3">
                    {/* Connector line */}
                    {!isLast && (
                      <div className={cn(
                        "absolute left-5 top-10 h-[calc(100%+0px)] w-[2px]",
                        done ? "bg-honey/30" : "bg-surface-elevated/[0.08]"
                      )} />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all",
                        done
                          ? "border-honey/40 bg-honey/15 text-honey"
                          : current
                            ? "border-honey/30 bg-honey/10 text-honey animate-pulse-glow"
                            : "border-white/10 bg-surface-elevated/5 text-white/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="pt-1.5">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          done || current ? "text-white" : "text-white/40"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-white/35">
                        {done ? "✓ Complete" : current ? "In progress" : step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>

        {/* ── Bottom Grid: Schedule + Announcements ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Schedule */}
          <motion.div
            variants={fadeUp}
            className="rounded-[24px] border border-navy/8 bg-surface-elevated/90 p-6 shadow-[var(--shadow-soft)] sm:p-7"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-honey-deep">
                Upcoming
              </p>
              <Link
                href="/portal/schedule"
                className="text-xs font-semibold text-honey hover:text-honey-deep transition-colors"
              >
                View all →
              </Link>
            </div>
            {UPCOMING.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {UPCOMING.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 rounded-2xl border border-navy/6 bg-surface px-4 py-3.5 transition-all hover:border-honey/20 hover:shadow-sm"
                  >
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                      item.type === "Live Session" ? "bg-honey/10 text-honey-deep" :
                      item.type === "Deadline" ? "bg-red-500/10 text-red-400" :
                      "bg-blue-400/10 text-blue-500"
                    )}>
                      {item.type === "Live Session" ? <BookOpen className="h-4 w-4" /> :
                       item.type === "Deadline" ? <Clock className="h-4 w-4" /> :
                       <CalendarDays className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy truncate">{item.title}</p>
                      <p className="text-xs text-slate">{item.time}</p>
                    </div>
                    <span className={cn(
                      "hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                      item.type === "Live Session" ? "bg-honey/10 text-honey-deep" :
                      item.type === "Deadline" ? "bg-red-500/10 text-red-400" :
                      "bg-blue-400/10 text-blue-500"
                    )}>
                      {item.type}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-navy/10 bg-surface px-4 py-8 text-center">
                <p className="text-sm text-slate">No upcoming schedule.</p>
              </div>
            )}
          </motion.div>

          {/* Announcements */}
          <motion.div
            variants={fadeUp}
            className="rounded-[24px] border border-navy/8 bg-surface-elevated/90 p-6 shadow-[var(--shadow-soft)] sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-honey-deep">
              Announcements
            </p>
            {ANNOUNCEMENTS.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {ANNOUNCEMENTS.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-navy/6 bg-surface px-4 py-4 transition-all hover:border-honey/20 hover:shadow-sm"
                  >
                    <p className="text-sm font-medium text-navy leading-relaxed">{item.text}</p>
                    <p className="mt-2 text-xs text-slate">{item.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-navy/10 bg-surface px-4 py-8 text-center">
                <p className="text-sm text-slate">No new announcements.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </PortalShell>
  );
}

/* ── Enrollment Panel ── */
function EnrollmentPanel({ enrollment, completionPct }: { enrollment: PortalEnrollment, completionPct: number }) {
  const program = PROGRAM_LABELS[enrollment.programId] ?? formatFallbackLabel(enrollment.programId);
  const duration = DURATION_LABELS[enrollment.durationId] ?? formatFallbackLabel(enrollment.durationId);

  return (
    <div className="mt-4">
      <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-navy sm:text-3xl">
        {program}
      </h3>
      <p className="mt-2 text-sm text-slate">
        You&apos;re enrolled and ready for the next onboarding steps.
      </p>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate">Overall progress</span>
          <span className="font-bold text-honey-deep">{completionPct}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-navy/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-honey to-honey-deep"
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/6 bg-surface px-4 py-3.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate">
            Duration
          </dt>
          <dd className="mt-1 text-base font-semibold text-navy">{duration}</dd>
        </div>
        <div className="rounded-2xl border border-navy/6 bg-surface px-4 py-3.5">
          <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate">
            <CalendarDays className="h-3 w-3" />
            Batch
          </dt>
          <dd className="mt-1 text-base font-semibold text-navy">
            {formatBatchDate(enrollment.preferredBatch)}
          </dd>
        </div>
        <div className="rounded-2xl border border-navy/6 bg-surface px-4 py-3.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate">
            Status
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-base font-semibold capitalize text-navy">
            <span className="h-2 w-2 rounded-full bg-honey" />
            {enrollment.status}
          </dd>
        </div>
      </dl>
    </div>
  );
}
