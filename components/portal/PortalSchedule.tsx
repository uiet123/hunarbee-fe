"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MonitorPlay,
  Users,
  Video,
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { cn } from "@/lib/utils";

/* ── Stagger animation ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Demo schedule data ── */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ScheduleEvent {
  title: string;
  time: string;
  duration: string;
  type: "session" | "deadline" | "meeting" | "workshop";
  mentor?: string;
  description?: string;
}

const WEEK_EVENTS: Record<string, ScheduleEvent[]> = {
  Mon: [
    {
      title: "React Hooks Deep Dive",
      time: "10:00 AM",
      duration: "1.5 hrs",
      type: "session",
      mentor: "Amit Kumar",
      description: "Understanding useEffect, useMemo, and custom hooks",
    },
  ],
  Tue: [],
  Wed: [
    {
      title: "Assignment #3 Submission",
      time: "11:59 PM",
      duration: "—",
      type: "deadline",
      description: "Build a todo app with useReducer",
    },
    {
      title: "UI/UX Workshop",
      time: "3:00 PM",
      duration: "2 hrs",
      type: "workshop",
      mentor: "Priya Sharma",
      description: "Design systems and component thinking",
    },
  ],
  Thu: [
    {
      title: "1:1 Mentor Session",
      time: "4:00 PM",
      duration: "30 min",
      type: "meeting",
      mentor: "Amit Kumar",
      description: "Weekly progress review and guidance",
    },
  ],
  Fri: [
    {
      title: "TypeScript Masterclass",
      time: "11:00 AM",
      duration: "2 hrs",
      type: "session",
      mentor: "Rohan Mehta",
      description: "Generics, utility types, and advanced patterns",
    },
  ],
  Sat: [
    {
      title: "Peer Code Review",
      time: "10:00 AM",
      duration: "1 hr",
      type: "workshop",
      description: "Review and discuss each other's assignments",
    },
  ],
  Sun: [],
};

const EVENT_STYLES: Record<string, { bg: string; border: string; icon: React.ElementType; badge: string }> = {
  session: { bg: "bg-honey/[0.06]", border: "border-honey/20", icon: MonitorPlay, badge: "bg-honey/10 text-honey-deep" },
  deadline: { bg: "bg-red-50/60", border: "border-red-200/40", icon: Clock, badge: "bg-red-500/10 text-red-500" },
  meeting: { bg: "bg-blue-50/60", border: "border-blue-200/40", icon: Video, badge: "bg-blue-400/10 text-blue-500" },
  workshop: { bg: "bg-purple-50/50", border: "border-purple-200/40", icon: Users, badge: "bg-purple-400/10 text-purple-500" },
};

function getWeekDates(offset: number): { label: string; day: string; date: number; isToday: boolean }[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);

  return DAYS.map((dayLabel, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return { label: dayLabel, day: dayLabel, date: d.getDate(), isToday };
  });
}

function getWeekLabel(offset: number): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export function PortalSchedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const weekDates = getWeekDates(weekOffset);

  const todayDay = DAYS[(new Date().getDay() + 6) % 7];
  const activeDay = selectedDay ?? todayDay;
  const events = WEEK_EVENTS[activeDay] ?? [];

  return (
    <PortalShell pageTitle="Schedule">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1100px] space-y-6"
      >
        {/* Week header */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-honey-deep">
              <CalendarDays className="h-3.5 w-3.5" />
              Weekly view
            </div>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-navy">
              {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : getWeekLabel(weekOffset)}
              <span className="ml-2 text-sm font-normal text-slate">{getWeekLabel(weekOffset)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy/8 bg-surface-elevated text-slate transition hover:border-honey/30 hover:text-navy"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="rounded-xl border border-navy/8 bg-surface-elevated px-3.5 py-2 text-xs font-semibold text-navy transition hover:border-honey/30"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy/8 bg-surface-elevated text-slate transition hover:border-honey/30 hover:text-navy"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Day selector */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-7 gap-2"
        >
          {weekDates.map((d) => {
            const isActive = d.day === activeDay;
            const hasEvents = (WEEK_EVENTS[d.day] ?? []).length > 0;

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDay(d.day)}
                className={cn(
                  "group relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition-all duration-200 sm:px-4 sm:py-4",
                  isActive
                    ? "border-honey/30 bg-honey/[0.08] shadow-sm"
                    : d.isToday
                      ? "border-honey/15 bg-surface-elevated/90"
                      : "border-navy/6 bg-surface-elevated/70 hover:border-navy/12 hover:bg-surface-elevated/95"
                )}
              >
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider sm:text-xs",
                  isActive ? "text-honey-deep" : "text-slate"
                )}>
                  {d.label}
                </span>
                <span className={cn(
                  "font-[family-name:var(--font-display)] text-lg font-bold sm:text-xl",
                  isActive ? "text-navy" : "text-navy/70"
                )}>
                  {d.date}
                </span>
                {d.isToday && (
                  <span className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-honey ring-2 ring-surface-elevated sm:right-2" />
                )}
                {hasEvents && !isActive && (
                  <span className="h-1 w-1 rounded-full bg-honey-deep/50" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Events for selected day */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-navy">
            {activeDay}&apos;s Schedule
          </h3>

          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, i) => {
                const style = EVENT_STYLES[event.type];
                const Icon = style.icon;

                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={cn(
                      "group rounded-[20px] border p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                      style.bg,
                      style.border
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", style.badge)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-navy">{event.title}</h4>
                          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", style.badge)}>
                            {event.type}
                          </span>
                        </div>
                        {event.description && (
                          <p className="mt-1 text-xs text-slate leading-relaxed">{event.description}</p>
                        )}
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" />
                            {event.duration}
                          </span>
                          {event.mentor && (
                            <span className="flex items-center gap-1.5">
                              <Users className="h-3 w-3" />
                              {event.mentor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-navy/6 bg-surface-elevated/70 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/[0.04]">
                <CalendarDays className="h-5 w-5 text-slate" />
              </div>
              <p className="mt-3 text-sm font-medium text-navy/60">No events scheduled</p>
              <p className="mt-1 text-xs text-slate">Enjoy your free day! 🌿</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PortalShell>
  );
}
