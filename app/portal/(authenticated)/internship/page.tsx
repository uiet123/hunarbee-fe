"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Play,
  Award,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Inbox,
  AlertCircle,
  Menu,
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import {
  getPortalToken,
  fetchPortalHome,
  clearPortalToken,
  PortalApiError,
  formatBatchDate,
  type PortalHome,
} from "@/lib/portal";
import { cn } from "@/lib/utils";

// ─── Types for Student View ───

type DayType =
  | 'ORIENTATION'
  | 'LEARNING'
  | 'TASK'
  | 'PROJECT'
  | 'MENTOR_REVIEW'
  | 'SUBMISSION'
  | 'ASSESSMENT'
  | 'BREAK';

type ResourceType = 'LINK' | 'VIDEO' | 'PDF' | 'ARTICLE' | 'DOCUMENTATION';

interface StudentResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  description: string;
}

interface StudentTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  estimatedMinutes: number;
  requiresSubmission: boolean;
  requiresMentorReview: boolean;
}

interface StudentDay {
  id: string;
  dayNumber: number;
  title: string;
  type: DayType;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  tasks: StudentTask[];
  resources: StudentResource[];
}

interface StudentWeek {
  id: string;
  title: string;
  goal: string;
  days: StudentDay[];
}

interface StudentPhase {
  id: string;
  title: string;
  description: string;
  weeks: StudentWeek[];
}

interface StudentCurriculum {
  programName: string;
  durationLabel: string;
  phases: StudentPhase[];
}

// ─── Mock Student Curriculums ───

const MOCK_FRONTEND_CURRICULUM: StudentCurriculum = {
  programName: "Frontend Development",
  durationLabel: "1 Month (30 Days)",
  phases: [
    {
      id: "fs_ph1",
      title: "Phase 1: Web Foundations",
      description: "Learn HTML5, CSS3, responsive design, and version control tools.",
      weeks: [
        {
          id: "fs_wk1",
          title: "Week 1: Tools & Layouts",
          goal: "Get your local environment configured and build clean layouts.",
          days: [
            {
              id: "fs_d1",
              dayNumber: 1,
              title: "Environment Setup & VS Code",
              type: "ORIENTATION",
              description: "Prepare your local dev environment, Git credentials, and code editor extension configurations.",
              estimatedMinutes: 120,
              objectives: [
                "Install Node.js LTS and verify NPM works",
                "Set up VS Code with recommended linting extensions",
                "Create a personal GitHub repository for assignments",
              ],
              tasks: [
                {
                  id: "fs_task1_1",
                  title: "Install Dev Tools & VS Code Extensions",
                  description: "Install Node.js, Git, and VS Code Extensions (ESLint, Prettier).",
                  instructions: "Download from nodejs.org, verify version, install extensions in VS Code, and capture a terminal screenshot showing 'node -v'.",
                  estimatedMinutes: 30,
                  requiresSubmission: false,
                  requiresMentorReview: false,
                },
                {
                  id: "fs_task1_2",
                  title: "GitHub Profile & Repository Setup",
                  description: "Create your student repository on GitHub.",
                  instructions: "Create a repository called 'hunarbee-frontend-bootcamp'. Initialize with a README.md and .gitignore. Submit the repository link.",
                  estimatedMinutes: 30,
                  requiresSubmission: true,
                  requiresMentorReview: true,
                },
              ],
              resources: [
                { id: "fs_res1_1", title: "Git and GitHub Starter Guide", type: "LINK", url: "https://docs.github.com/en/get-started", description: "Official GitHub starting guide." },
                { id: "fs_res1_2", title: "Prettier VS Code Extension Setup", type: "DOCUMENTATION", url: "https://prettier.io/docs/en/editors.html", description: "Official integration guide." },
              ],
            },
            {
              id: "fs_d2",
              dayNumber: 2,
              title: "HTML5 Semantic Structure",
              type: "LEARNING",
              description: "Learn layout tags like main, section, nav, and why semantic HTML is essential for SEO and accessibility.",
              estimatedMinutes: 150,
              objectives: [
                "Understand the difference between semantic and non-semantic HTML",
                "Build a content outline using proper header levels",
                "Implement metadata tags inside the head section",
              ],
              tasks: [
                {
                  id: "fs_task2_1",
                  title: "Write a Semantic Outline Page",
                  description: "Create an HTML document showing a clean semantic structure.",
                  instructions: "Use header, nav, main, article, section, aside, and footer. Add an image and some paragraphs. Do not style it yet.",
                  estimatedMinutes: 60,
                  requiresSubmission: true,
                  requiresMentorReview: false,
                },
              ],
              resources: [
                { id: "fs_res2_1", title: "MDN HTML Semantics", type: "DOCUMENTATION", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics", description: "MDN reference guide." },
              ],
            },
            {
              id: "fs_d3",
              dayNumber: 3,
              title: "CSS Layouts with Flexbox",
              type: "LEARNING",
              description: "Deep dive into CSS Flexbox properties, layout alignments, and flexible styling rules.",
              estimatedMinutes: 180,
              objectives: [
                "Understand flex container vs flex item properties",
                "Master justify-content, align-items, and flex-wrap properties",
                "Build a responsive nav bar using flexbox",
              ],
              tasks: [
                {
                  id: "fs_task3_1",
                  title: "Responsive Flexbox Navigation",
                  description: "Style your navigation bar using Flexbox alignment rules.",
                  instructions: "Add flex classes, spread nav items across space-between, center vertically, and add a toggle button for mobile views.",
                  estimatedMinutes: 90,
                  requiresSubmission: true,
                  requiresMentorReview: true,
                },
              ],
              resources: [
                { id: "fs_res3_1", title: "Flexbox Froggy Game", type: "VIDEO", url: "https://flexboxfroggy.com/", description: "Interactive CSS puzzle game." },
              ],
            },
          ],
        },
        {
          id: "fs_wk2",
          title: "Week 2: Advanced CSS & Responsive Layouts",
          goal: "Learn CSS Grid, Media Queries, and responsive web design practices.",
          days: [
            {
              id: "fs_d4",
              dayNumber: 4,
              title: "CSS Grid Essentials",
              type: "LEARNING",
              description: "Build 2D layouts using CSS Grid grid-template-columns, grid-template-rows, and template areas.",
              estimatedMinutes: 150,
              objectives: [
                "Configure grid column and row templates",
                "Understand fraction unit (fr) sizing",
                "Place elements inside specific grid areas",
              ],
              tasks: [
                {
                  id: "fs_task4_1",
                  title: "Build a Grid Product Layout",
                  description: "Create a 3-column product list showing items beautifully.",
                  instructions: "Define grid layouts, add template spaces, and align title, rating, price, and CTA card buttons.",
                  estimatedMinutes: 75,
                  requiresSubmission: true,
                  requiresMentorReview: false,
                },
              ],
              resources: [
                { id: "fs_res4_1", title: "CSS Grid Garden Game", type: "LINK", url: "https://cssgridgarden.com/", description: "Interactive grid practice." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "fs_ph2",
      title: "Phase 2: Interactive Web Development",
      description: "Learn JavaScript fundamentals, DOM manipulation, and dynamic state modifications.",
      weeks: [
        {
          id: "fs_wk3",
          title: "Week 3: JavaScript Programming",
          goal: "Learn operations, conditional scripts, loops, and functional program scopes.",
          days: [
            {
              id: "fs_d5",
              dayNumber: 5,
              title: "JS Operations & Function Blocks",
              type: "LEARNING",
              description: "Learn variable scopes (let, const), parameter lists, arrow functions, and array iteration methods.",
              estimatedMinutes: 180,
              objectives: [
                "Understand variable scopes and declarations",
                "Implement conditional if/else blocks and loops",
                "Practice mapping and filtering collections",
              ],
              tasks: [
                {
                  id: "fs_task5_1",
                  title: "JS Algorithm Exercises",
                  description: "Complete 5 standard JavaScript algorithm functions.",
                  instructions: "Complete functions calculating reverse, palindrome checks, maximum item, array filters, and word counters. Submit script source code.",
                  estimatedMinutes: 90,
                  requiresSubmission: true,
                  requiresMentorReview: true,
                },
              ],
              resources: [
                { id: "fs_res5_1", title: "Eloquent JavaScript Book", type: "PDF", url: "https://eloquentjavascript.net/", description: "Free online book for JS." },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const DAY_TYPE_BADGES: Record<DayType, { label: string; bg: string; text: string }> = {
  ORIENTATION: { label: "Orientation", bg: "bg-indigo-500/10 dark:bg-indigo-500/5", text: "text-indigo-600 dark:text-indigo-400" },
  LEARNING: { label: "Learning", bg: "bg-blue-500/10 dark:bg-blue-500/5", text: "text-blue-600 dark:text-blue-400" },
  TASK: { label: "Task", bg: "bg-amber-500/10 dark:bg-amber-500/5", text: "text-amber-600 dark:text-amber-400" },
  PROJECT: { label: "Project", bg: "bg-purple-500/10 dark:bg-purple-500/5", text: "text-purple-600 dark:text-purple-400" },
  MENTOR_REVIEW: { label: "Mentor Review", bg: "bg-teal-500/10 dark:bg-teal-500/5", text: "text-teal-600 dark:text-teal-400" },
  SUBMISSION: { label: "Submission", bg: "bg-emerald-500/10 dark:bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400" },
  ASSESSMENT: { label: "Assessment", bg: "bg-orange-500/10 dark:bg-orange-500/5", text: "text-orange-600 dark:text-orange-400" },
  BREAK: { label: "Break", bg: "bg-slate-500/10 dark:bg-slate-500/5", text: "text-slate-600 dark:text-slate-400" },
};

const RESOURCE_ICONS: Record<ResourceType, React.ElementType> = {
  LINK: ExternalLink,
  VIDEO: Play,
  PDF: FileText,
  ARTICLE: BookOpen,
  DOCUMENTATION: FileText,
};

export default function StudentInternshipPage() {
  const router = useRouter();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [loading, setLoading] = useState(true);

  // Curriculum State
  const [curriculum, setCurriculum] = useState<StudentCurriculum>(MOCK_FRONTEND_CURRICULUM);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const [expandedDayId, setExpandedDayId] = useState<string | null>("fs_d1");

  // Student Progress local storage state: map of taskId -> { checked: boolean, status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' }
  const [progress, setProgress] = useState<Record<string, { checked: boolean; status: string }>>({});

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

          // Customize curriculum based on programId if matching backend is found
          // (Mock fallback maps nicely)
          const activeEnrollment = data.enrollments[0];
          if (activeEnrollment) {
            // Load completion progress from localStorage specific to student enrollment
            const savedProgress = localStorage.getItem(`hunarbee_student_progress_${activeEnrollment.id}`);
            if (savedProgress) {
              try {
                setProgress(JSON.parse(savedProgress));
              } catch {
                // ignore
              }
            }
          }
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

  const activeEnrollment = home?.enrollments[0] || null;

  const saveProgress = (updated: Record<string, { checked: boolean; status: string }>) => {
    setProgress(updated);
    if (activeEnrollment) {
      localStorage.setItem(`hunarbee_student_progress_${activeEnrollment.id}`, JSON.stringify(updated));
    }
  };

  const toggleTaskChecked = (taskId: string) => {
    const current = progress[taskId] || { checked: false, status: "NOT_SUBMITTED" };
    const updated = {
      ...progress,
      [taskId]: {
        ...current,
        checked: !current.checked,
      },
    };
    saveProgress(updated);
  };

  const handleSubmittingTask = (taskId: string) => {
    const current = progress[taskId] || { checked: false, status: "NOT_SUBMITTED" };
    const updated = {
      ...progress,
      [taskId]: {
        ...current,
        checked: true, // Auto check when submitted
        status: "SUBMITTED",
      },
    };
    saveProgress(updated);
  };

  const handleSimulateReview = (taskId: string) => {
    const current = progress[taskId] || { checked: true, status: "SUBMITTED" };
    const updated = {
      ...progress,
      [taskId]: {
        ...current,
        status: "APPROVED",
      },
    };
    saveProgress(updated);
  };

  if (loading) {
    return (
      <div className="flex py-32 items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-honey mx-auto" />
          <p className="text-xs text-slate">Loading internship curriculum…</p>
        </div>
      </div>
    );
  }

  const activePhase = curriculum.phases[activePhaseIdx];
  const activeWeek = activePhase?.weeks[activeWeekIdx];

  // Calculate totals for progress reporting
  let totalTasks = 0;
  let completedTasks = 0;

  curriculum.phases.forEach((p) => {
    p.weeks.forEach((w) => {
      w.days.forEach((d) => {
        d.tasks.forEach((t) => {
          totalTasks++;
          if (progress[t.id]?.checked) {
            completedTasks++;
          }
        });
      });
    });
  });

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PortalShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-navy">My Internship</h2>
            <p className="text-sm text-slate">
              {curriculum.programName} · <span className="font-semibold text-navy/70">{curriculum.durationLabel}</span>
            </p>
            {activeEnrollment && (
              <p className="text-xs text-slate/60">
                Batch: {activeEnrollment.preferredBatch ? formatBatchDate(activeEnrollment.preferredBatch) : "Flexible Start"}
              </p>
            )}
          </div>

          {/* Progress Tracker Widget */}
          <div className="flex items-center gap-4 border-l border-navy/5 pl-0 md:pl-6 shrink-0">
            <div className="relative h-16 w-16 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-navy/[0.05]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-honey-deep"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progressPercent}, 100` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-navy">
                {progressPercent}%
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate uppercase tracking-wider">Overall Progress</p>
              <p className="text-sm font-bold text-navy mt-0.5">
                {completedTasks} of {totalTasks} Tasks Completed
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left Column: Navigation Sidebar */}
          <div className="space-y-4">
            {/* Phase Selector Tabs */}
            <div className="rounded-2xl border border-navy/10 bg-white p-2.5 shadow-sm space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate tracking-wider mb-2 px-2.5 pt-1">
                Internship Phases
              </p>
              {curriculum.phases.map((phase, idx) => {
                const isActive = activePhaseIdx === idx;
                return (
                  <button
                    key={phase.id}
                    onClick={() => {
                      setActivePhaseIdx(idx);
                      setActiveWeekIdx(0);
                    }}
                    className={cn(
                      "w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition flex items-center justify-between",
                      isActive
                        ? "bg-honey/10 text-honey-deep font-bold"
                        : "text-slate hover:bg-navy/[0.03] hover:text-navy"
                    )}
                  >
                    <span className="truncate">{phase.title.split(":")[1]?.trim() || phase.title}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>

            {/* Weeks Navigation */}
            {activePhase && (
              <div className="rounded-2xl border border-navy/10 bg-white p-2.5 shadow-sm space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate tracking-wider mb-2 px-2.5 pt-1">
                  Active Phase Weeks
                </p>
                {activePhase.weeks.map((week, idx) => {
                  const isActive = activeWeekIdx === idx;
                  return (
                    <button
                      key={week.id}
                      onClick={() => setActiveWeekIdx(idx)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition flex items-center gap-2",
                        isActive
                          ? "bg-navy text-white font-bold"
                          : "text-slate hover:bg-navy/[0.03] hover:text-navy"
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/10 text-[9px] font-bold border border-current">
                        W{idx + 1}
                      </span>
                      <span className="truncate">{week.title.split(":")[1]?.trim() || week.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Main Days Curriculum Flow */}
          <div className="space-y-4">
            {activeWeek ? (
              <>
                {/* Week Header */}
                <div className="rounded-2xl bg-gradient-to-r from-navy/5 to-transparent px-5 py-4 border border-navy/5">
                  <h3 className="text-sm font-bold text-navy uppercase tracking-wider">{activeWeek.title}</h3>
                  {activeWeek.goal && <p className="text-xs text-slate mt-1 italic">{activeWeek.goal}</p>}
                </div>

                {/* Days Accordion */}
                <div className="space-y-3">
                  {activeWeek.days.map((day) => {
                    const isExpanded = expandedDayId === day.id;
                    const badge = DAY_TYPE_BADGES[day.type];
                    return (
                      <div
                        key={day.id}
                        className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden"
                      >
                        {/* Day Header Trigger */}
                        <button
                          onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-navy/[0.01] transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy text-white text-xs font-bold shadow-sm">
                              {day.dayNumber}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-navy truncate">{day.title}</h4>
                              <p className="text-[10px] text-slate mt-0.5">{day.tasks.length} tasks · {day.estimatedMinutes} mins</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", badge.bg, badge.text)}>
                              {badge.label}
                            </span>
                            <ChevronDown className={cn("h-4 w-4 text-slate transition-transform", isExpanded && "rotate-180")} />
                          </div>
                        </button>

                        {/* Day Details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden border-t border-navy/5"
                            >
                              <div className="p-5 space-y-5 bg-surface-elevated/20">
                                {day.description && (
                                  <p className="text-xs text-slate leading-relaxed">{day.description}</p>
                                )}

                                {/* Objectives */}
                                {day.objectives.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-slate tracking-wider">Learning Objectives</p>
                                    <ul className="grid sm:grid-cols-2 gap-2">
                                      {day.objectives.map((obj, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-navy">
                                          <CheckCircle2 className="h-3.5 w-3.5 text-honey shrink-0 mt-0.5" />
                                          <span>{obj}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Tasks */}
                                {day.tasks.length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase text-slate tracking-wider">Day Tasks</p>
                                    <div className="space-y-2.5">
                                      {day.tasks.map((task) => {
                                        const state = progress[task.id] || { checked: false, status: "NOT_SUBMITTED" };
                                        return (
                                          <div
                                            key={task.id}
                                            className={cn(
                                              "rounded-xl border p-4 transition-all",
                                              state.checked
                                                ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                                                : "border-navy/10 bg-white"
                                            )}
                                          >
                                            <div className="flex items-start gap-3 justify-between">
                                              <div className="flex items-start gap-3 min-w-0">
                                                <input
                                                  type="checkbox"
                                                  checked={state.checked}
                                                  onChange={() => toggleTaskChecked(task.id)}
                                                  className="mt-1 h-4.5 w-4.5 rounded border-navy/20 accent-honey cursor-pointer shrink-0"
                                                />
                                                <div className="min-w-0">
                                                  <p className={cn("text-xs font-bold text-navy", state.checked && "line-through text-slate")}>
                                                    {task.title}
                                                  </p>
                                                  <p className="text-[11px] text-slate mt-1 leading-relaxed">{task.description}</p>
                                                  {task.instructions && (
                                                    <div className="mt-2 text-[10px] text-slate/80 bg-navy/[0.02] p-2 rounded-lg border border-navy/5 font-medium">
                                                      <span className="font-bold text-navy">Instructions:</span> {task.instructions}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Badges and Actions */}
                                              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                                                <span className="text-[9px] font-semibold text-slate bg-navy/5 px-2 py-0.5 rounded flex items-center gap-1">
                                                  <Clock className="h-2.5 w-2.5" /> {task.estimatedMinutes}m
                                                </span>
                                                {task.requiresSubmission && (
                                                  <>
                                                    {state.status === "NOT_SUBMITTED" && (
                                                      <Button
                                                        onClick={() => handleSubmittingTask(task.id)}
                                                        size="sm"
                                                        className="h-6 px-2.5 text-[9px]"
                                                      >
                                                        Submit Work
                                                      </Button>
                                                    )}
                                                    {state.status === "SUBMITTED" && (
                                                      <div className="flex flex-col items-end gap-1">
                                                        <span className="rounded-full bg-honey/10 px-2 py-0.5 text-[9px] font-bold text-honey-deep">
                                                          Submitted
                                                        </span>
                                                        <button
                                                          onClick={() => handleSimulateReview(task.id)}
                                                          className="text-[8px] text-blue-500 hover:underline"
                                                        >
                                                          Simulate Grade
                                                        </button>
                                                      </div>
                                                    )}
                                                    {state.status === "APPROVED" && (
                                                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                                                        <Award className="h-3 w-3" /> Graded (95/100)
                                                      </span>
                                                    )}
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Resources */}
                                {day.resources.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-slate tracking-wider">References & Resources</p>
                                    <div className="flex flex-wrap gap-2">
                                      {day.resources.map((res) => {
                                        const Icon = RESOURCE_ICONS[res.type] || ExternalLink;
                                        return (
                                          <a
                                            key={res.id}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-500/10 transition"
                                            title={res.description}
                                          >
                                            <Icon className="h-3.5 w-3.5 shrink-0" />
                                            <span>{res.title}</span>
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-slate">
                No active week selected. Click on a week in the navigation to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

// Reusable mini Loader
function Loader2({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
