"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Play,
  Award,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  X,
  Lock,
  Unlock
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
import type { LearningProgress } from "@/lib/learning-progress";

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

interface StudentTaskPrerequisite {
  id: string;
  type: 'REQUIRED_LEARNING_CONTENT' | 'VIDEO_COMPLETED' | 'READING_COMPLETED' | 'QUIZ_PASSED' | 'PREVIOUS_TASK_COMPLETED';
  targetId: string;
}

interface StudentTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  estimatedMinutes: number;
  requiresSubmission: boolean;
  requiresMentorReview: boolean;
  prerequisites?: StudentTaskPrerequisite[];
}

interface StudentLearningContent {
  id: string;
  order: number;
  type: 'VIDEO' | 'ARTICLE' | 'DOCUMENTATION' | 'PDF';
  title: string;
  description: string;
  url: string;
  isRequired: boolean;
  videoLessonId?: string;
  completionThreshold?: number;
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
  learningContent?: StudentLearningContent[];
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

// ─── Mock Student Curriculums with Video and Prerequisite setup ───

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
              learningContent: [
                {
                  id: "lc_vid_01",
                  order: 1,
                  type: "VIDEO",
                  title: "Introduction to React & JSX",
                  description: "Watch this video to learn component models and JSX basics.",
                  url: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                  isRequired: true,
                  videoLessonId: "vid_react_intro",
                  completionThreshold: 90
                },
                {
                  id: "lc_doc_01",
                  order: 2,
                  type: "DOCUMENTATION",
                  title: "Vite Getting Started Documentation",
                  description: "Learn how to configure Vite for web development.",
                  url: "https://vite.dev/guide/",
                  isRequired: false
                }
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
                  prerequisites: [
                    {
                      id: "pr_t1_1",
                      type: "REQUIRED_LEARNING_CONTENT",
                      targetId: "lc_vid_01"
                    }
                  ]
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
              learningContent: [
                {
                  id: "lc_vid_02",
                  order: 1,
                  type: "VIDEO",
                  title: "useState in Practice",
                  description: "Master component state updates and form control patterns.",
                  url: "https://www.w3schools.com/html/mov_bbb.mp4",
                  isRequired: true,
                  videoLessonId: "vid_react_state",
                  completionThreshold: 90
                }
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
                  prerequisites: [
                    {
                      id: "pr_t2_1",
                      type: "VIDEO_COMPLETED",
                      targetId: "lc_vid_02"
                    }
                  ]
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
              learningContent: [
                {
                  id: "lc_vid_03_reused",
                  order: 1,
                  type: "VIDEO",
                  title: "Introduction to React & JSX (Reused - Optional)",
                  description: "Optional recap of components and JSX basics.",
                  url: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                  isRequired: false,
                  videoLessonId: "vid_react_intro",
                  completionThreshold: 50
                }
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
                  prerequisites: [
                    {
                      id: "pr_t3_unsupported",
                      type: "QUIZ_PASSED",
                      targetId: "quiz_101"
                    }
                  ]
                },
              ],
              resources: [
                { id: "fs_res3_1", title: "Flexbox Froggy Game", type: "VIDEO", url: "https://flexboxfroggy.com/", description: "Interactive CSS puzzle game." },
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

  // Student Task Submit Progress local storage state: map of taskId -> { checked: boolean, status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' }
  const [progress, setProgress] = useState<Record<string, { checked: boolean; status: string }>>({});

  // Student Learning Video Progress map from contentId -> LearningProgress
  const [learningProgress, setLearningProgress] = useState<Record<string, LearningProgress>>({});
  
  // Active playing video
  const [activeVideo, setActiveVideo] = useState<StudentLearningContent | null>(null);

  const activeEnrollment = home?.enrollments[0] || null;

  const loadLearningProgress = async (enrollId: string) => {
    try {
      const LPService = await import("@/lib/learning-progress");
      const all = await LPService.getAllLearningProgress(enrollId);
      setLearningProgress(all);
    } catch (e) {
      console.error(e);
    }
  };

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
            loadLearningProgress(activeEnrollment.id);

            // Fetch dynamic curriculum templates from backend
            fetch("http://localhost:5000/api/programs/curriculum-templates")
              .then((res) => res.json())
              .then((resData) => {
                if (!cancelled && resData?.success && Array.isArray(resData.data) && resData.data.length > 0) {
                  const loadedTemplates = resData.data;
                  const progIdNormalized = activeEnrollment.programId.startsWith("prog_")
                    ? activeEnrollment.programId
                    : `prog_${activeEnrollment.programId}`;

                  const expectedDays = activeEnrollment.durationId.includes("3") ? 90 : 30;
                  
                  const matchedTmpl = loadedTemplates.find((t: any) => {
                    const matchesProg = t.programId === progIdNormalized || t.programId === activeEnrollment.programId;
                    const matchesDur = t.durationDays === expectedDays || t.planId === activeEnrollment.durationId;
                    return matchesProg && matchesDur;
                  });

                  if (matchedTmpl) {
                    const version = matchedTmpl.versions.find((v: any) => v.id === matchedTmpl.currentPublishedVersionId)
                      || [...matchedTmpl.versions].sort((a: any, b: any) => b.version - a.version)[0];
                    
                    if (version) {
                      const mappedCurriculum: StudentCurriculum = {
                        programName: matchedTmpl.templateName,
                        durationLabel: `${matchedTmpl.durationDays} Days`,
                        phases: version.phases,
                      };
                      setCurriculum(mappedCurriculum);

                      // Auto expand first day of first week of first phase if available
                      const firstDay = version.phases[0]?.weeks[0]?.days[0];
                      if (firstDay) {
                        setExpandedDayId(firstDay.id);
                      }
                    }
                  }
                }
              })
              .catch((e) => console.error("Failed to fetch curriculum templates", e));
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

  // Helper check to determine if task is locked based on prerequisite rules
  const isTaskLocked = (task: StudentTask, dayLearningContent: StudentLearningContent[] = []) => {
    const prereqs = task.prerequisites || [];
    if (prereqs.length === 0) return false;

    for (const prereq of prereqs) {
      if (prereq.type === "REQUIRED_LEARNING_CONTENT") {
        const lc = dayLearningContent.find((item) => item.id === prereq.targetId);
        if (!lc) continue;
        if (!lc.isRequired) continue; // must be required content
        const lp = learningProgress[lc.id];
        if (!lp || !lp.completed) {
          return true; // locked
        }
      } else if (prereq.type === "VIDEO_COMPLETED") {
        const lc = dayLearningContent.find((item) => item.id === prereq.targetId);
        if (!lc || lc.type !== "VIDEO") continue;
        const lp = learningProgress[lc.id];
        if (!lp || !lp.completed) {
          return true; // locked
        }
      } else {
        // QUIZ_PASSED, READING_COMPLETED, PREVIOUS_TASK_COMPLETED are unsupported in this phase and lock the task
        return true;
      }
    }
    return false;
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
                    const dayLearning = day.learningContent || [];

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
                              <p className="text-[10px] text-slate mt-0.5">
                                {dayLearning.length} items · {day.tasks.length} tasks · {day.estimatedMinutes} mins
                              </p>
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

                                {/* Learning Content Section */}
                                {dayLearning.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-slate tracking-wider">Required Learning & Lectures</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      {dayLearning.map((lc) => {
                                        const lp = learningProgress[lc.id];
                                        const isCompleted = lp?.completed || false;
                                        const progressPct = lp?.progressPercentage || 0;

                                        return (
                                          <div
                                            key={lc.id}
                                            className={cn(
                                              "rounded-xl border p-4 flex flex-col justify-between transition-all bg-white",
                                              isCompleted ? "border-emerald-500/20 bg-emerald-500/[0.01]" : "border-navy/10"
                                            )}
                                          >
                                            <div>
                                              <div className="flex items-start justify-between gap-2">
                                                <h5 className="text-xs font-bold text-navy leading-snug line-clamp-1">{lc.title}</h5>
                                                <span className={cn(
                                                  "rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider shrink-0",
                                                  lc.type === "VIDEO" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                                                )}>
                                                  {lc.type}
                                                </span>
                                              </div>
                                              <p className="text-[11px] text-slate mt-1 line-clamp-2 leading-relaxed">{lc.description}</p>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between border-t border-navy/5 pt-2.5">
                                              <div className="text-[10px] font-medium text-slate">
                                                {lc.isRequired ? (
                                                  <span className="text-red-500 font-bold">* Required</span>
                                                ) : (
                                                  <span className="text-slate/60">Optional</span>
                                                )}
                                              </div>

                                              {lc.type === "VIDEO" ? (
                                                <div className="flex items-center gap-2">
                                                  {isCompleted ? (
                                                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                      <CheckCircle2 className="h-3.5 w-3.5 fill-current" /> Completed
                                                    </span>
                                                  ) : (
                                                    <span className="text-[10px] text-slate font-semibold">
                                                      {progressPct}% Complete
                                                    </span>
                                                  )}
                                                  <Button
                                                    size="sm"
                                                    onClick={() => setActiveVideo(lc)}
                                                    className="h-6 px-2.5 text-[9px] flex items-center gap-1"
                                                  >
                                                    <Play className="h-2.5 w-2.5 fill-current pl-0.5" />
                                                    Watch Lesson
                                                  </Button>
                                                </div>
                                              ) : (
                                                <a
                                                  href={lc.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline"
                                                >
                                                  Open Resource <ExternalLink className="h-3 w-3" />
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Tasks */}
                                {day.tasks.length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase text-slate tracking-wider">Day Tasks</p>
                                    <div className="space-y-2.5">
                                      {day.tasks.map((task) => {
                                        const state = progress[task.id] || { checked: false, status: "NOT_SUBMITTED" };
                                        const locked = isTaskLocked(task, day.learningContent || []);

                                        return (
                                          <div
                                            key={task.id}
                                            className={cn(
                                              "rounded-xl border p-4 transition-all relative overflow-hidden",
                                              locked
                                                ? "border-slate-200 bg-slate-50/50 opacity-75"
                                                : state.checked
                                                ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                                                : "border-navy/10 bg-white"
                                            )}
                                          >
                                            <div className="flex items-start gap-3 justify-between">
                                              <div className="flex items-start gap-3 min-w-0">
                                                <input
                                                  type="checkbox"
                                                  checked={state.checked}
                                                  disabled={locked}
                                                  onChange={() => toggleTaskChecked(task.id)}
                                                  className="mt-1 h-4.5 w-4.5 rounded border-navy/20 accent-honey cursor-pointer shrink-0 disabled:cursor-not-allowed"
                                                />
                                                <div className="min-w-0">
                                                  <p className={cn(
                                                    "text-xs font-bold text-navy flex items-center gap-1.5",
                                                    state.checked && "line-through text-slate"
                                                  )}>
                                                    {locked ? <Lock className="h-3.5 w-3.5 text-slate shrink-0" /> : <Unlock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                                                    {task.title}
                                                  </p>
                                                  <p className="text-[11px] text-slate mt-1 leading-relaxed">{task.description}</p>
                                                  
                                                  {!locked && task.instructions && (
                                                    <div className="mt-2 text-[10px] text-slate/80 bg-navy/[0.02] p-2 rounded-lg border border-navy/5 font-medium">
                                                      <span className="font-bold text-navy">Instructions:</span> {task.instructions}
                                                    </div>
                                                  )}

                                                  {/* Prerequisites Indicators list */}
                                                  {task.prerequisites && task.prerequisites.length > 0 && (
                                                    <div className="mt-3 p-3 rounded-xl border border-navy/5 bg-navy/[0.02] space-y-1.5">
                                                      <p className="text-[9px] font-bold text-slate uppercase tracking-wider">Required Prerequisites</p>
                                                      {task.prerequisites.map((prereq) => {
                                                        const lc = day.learningContent?.find((item) => item.id === prereq.targetId);
                                                        const lp = lc ? learningProgress[lc.id] : null;
                                                        const isCompleted = lp?.completed || false;
                                                        const progressPct = lp?.progressPercentage || 0;
                                                        const isUnsupported = !["REQUIRED_LEARNING_CONTENT", "VIDEO_COMPLETED"].includes(prereq.type);

                                                        let label = lc?.title || `Content #${prereq.targetId}`;
                                                        if (prereq.type === "REQUIRED_LEARNING_CONTENT") {
                                                          label = `Required: ${label}`;
                                                        } else if (prereq.type === "VIDEO_COMPLETED") {
                                                          label = `Watch Video: ${label}`;
                                                        } else {
                                                          label = `Prerequisite (${prereq.type})`;
                                                        }

                                                        return (
                                                          <div key={prereq.id} className="flex items-center justify-between text-xs font-medium">
                                                            <span className="flex items-center gap-1.5 text-navy">
                                                              {isCompleted ? (
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 fill-current" />
                                                              ) : (
                                                                <AlertCircle className="h-3.5 w-3.5 text-slate/40 shrink-0" />
                                                              )}
                                                              <span className={cn(isCompleted && "text-slate/60 line-through")}>{label}</span>
                                                            </span>
                                                            {!isCompleted && (
                                                              <span className={cn(
                                                                "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                                                                isUnsupported ? "bg-red-500/10 text-red-500" : "bg-navy/5 text-slate"
                                                              )}>
                                                                {isUnsupported ? "Unsupported" : `${progressPct}% complete`}
                                                              </span>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Badges and Actions */}
                                              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                                                <span className="text-[9px] font-semibold text-slate bg-navy/5 px-2 py-0.5 rounded flex items-center gap-1">
                                                  <Clock className="h-2.5 w-2.5" /> {task.estimatedMinutes}m
                                                </span>
                                                {locked ? (
                                                  <span className="rounded-full bg-slate-200 border border-slate-300 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                                                    🔒 Task Locked
                                                  </span>
                                                ) : (
                                                  task.requiresSubmission && (
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
                                                  )
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

      {/* Student Video Lesson Player Modal */}
      {activeVideo && activeEnrollment && (
        <StudentVideoPlayer
          learningContent={activeVideo}
          enrollmentId={activeEnrollment.id}
          onCompleted={() => {
            if (activeEnrollment) {
              loadLearningProgress(activeEnrollment.id);
            }
          }}
          onClose={() => {
            setActiveVideo(null);
            if (activeEnrollment) {
              loadLearningProgress(activeEnrollment.id);
            }
          }}
        />
      )}
    </PortalShell>
  );
}

// ─── Student Video Player Component with playback speed and scrubbing simulation ───

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  return null;
}

interface StudentVideoPlayerProps {
  learningContent: StudentLearningContent;
  enrollmentId: string;
  onCompleted: () => void;
  onClose: () => void;
}

function StudentVideoPlayer({
  learningContent,
  enrollmentId,
  onCompleted,
  onClose,
}: StudentVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoDuration, setVideoDuration] = useState(120);
  const [currentTime, setCurrentTime] = useState(0);

  const ytEmbed = getYoutubeEmbedUrl(learningContent.url);

  // Load progress
  useEffect(() => {
    let active = true;
    import("@/lib/learning-progress").then((LPService) => {
      if (!active) return;
      LPService.getLearningProgress(enrollmentId, learningContent.id).then((lp) => {
        if (!active) return;
        if (lp) {
          setProgress(lp);
          setCurrentTime(lp.watchedSeconds);
          if (videoRef.current && !ytEmbed) {
            videoRef.current.currentTime = lp.watchedSeconds;
          }
        } else {
          LPService.saveLearningProgress(enrollmentId, learningContent.id, {
            watchedSeconds: 0,
            progressPercentage: 0,
            completed: false,
          }).then((newLp) => {
            if (active) setProgress(newLp);
          });
        }
      });
    });
    return () => {
      active = false;
    };
  }, [enrollmentId, learningContent.id, ytEmbed]);

  // Simulate playback loop specifically for YouTube embeds when playing
  useEffect(() => {
    if (!ytEmbed) return;
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = Math.min(prev + playbackSpeed, videoDuration);
        const nextPercentage = Math.round((next / videoDuration) * 100);
        const threshold = learningContent.completionThreshold || 90;
        const nextCompleted = nextPercentage >= threshold;

        import("@/lib/learning-progress").then((LPService) => {
          LPService.saveLearningProgress(enrollmentId, learningContent.id, {
            watchedSeconds: next,
            progressPercentage: nextPercentage,
            completed: nextCompleted,
          }).then((savedLp) => {
            setProgress(savedLp);
            if (nextCompleted && !progress?.completed) {
              onCompleted();
            }
          });
        });

        if (next >= videoDuration) {
          setIsPlaying(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, videoDuration, ytEmbed, learningContent.completionThreshold, enrollmentId, learningContent.id, progress?.completed, onCompleted]);

  // Sync play/pause state (direct MP4 video player)
  useEffect(() => {
    if (ytEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, ytEmbed]);

  // Sync speed state (direct MP4 video player)
  useEffect(() => {
    if (ytEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed, ytEmbed]);

  const handleTimeUpdate = () => {
    if (ytEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    const curTime = video.currentTime;
    setCurrentTime(curTime);

    const nextPercentage = Math.round((curTime / videoDuration) * 100);
    const threshold = learningContent.completionThreshold || 90;
    const nextCompleted = nextPercentage >= threshold;

    import("@/lib/learning-progress").then((LPService) => {
      LPService.saveLearningProgress(enrollmentId, learningContent.id, {
        watchedSeconds: curTime,
        progressPercentage: nextPercentage,
        completed: nextCompleted,
      }).then((savedLp) => {
        setProgress(savedLp);
        if (nextCompleted && !progress?.completed) {
          onCompleted();
        }
      });
    });
  };

  const handleLoadedMetadata = () => {
    if (ytEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration || 120);
    if (progress) {
      video.currentTime = progress.watchedSeconds;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCurrentTime(value);
    
    if (!ytEmbed) {
      const video = videoRef.current;
      if (video) {
        video.currentTime = value;
      }
    }

    const nextPercentage = Math.round((value / videoDuration) * 100);
    const threshold = learningContent.completionThreshold || 90;
    const nextCompleted = nextPercentage >= threshold;

    import("@/lib/learning-progress").then((LPService) => {
      LPService.saveLearningProgress(enrollmentId, learningContent.id, {
        watchedSeconds: value,
        progressPercentage: nextPercentage,
        completed: nextCompleted,
      }).then((savedLp) => {
        setProgress(savedLp);
        if (nextCompleted && !progress?.completed) {
          onCompleted();
        }
      });
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const pct = progress?.progressPercentage || 0;
  const threshold = learningContent.completionThreshold || 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h4 className="text-sm font-bold truncate max-w-md">{learningContent.title}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Threshold: {threshold}% completion required</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center border-b border-slate-800">
          {ytEmbed ? (
            isPlaying ? (
              <iframe
                src={`${ytEmbed}&t=${Math.floor(currentTime)}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xs text-slate-400 font-bold mb-2">YouTube Lesson Embed</p>
                <p className="text-[10px] text-slate-500 max-w-sm mb-4">{learningContent.description}</p>
                <button
                  onClick={() => setIsPlaying(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-honey text-navy shadow-lg hover:scale-105 transition-transform"
                >
                  <Play className="h-6 w-6 fill-current pl-0.5" />
                </button>
              </div>
            )
          ) : (
            <>
              <video
                ref={videoRef}
                src={learningContent.url}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-honey text-navy shadow-lg pointer-events-auto hover:scale-105 transition-transform"
                  >
                    <Play className="h-7 w-7 fill-current pl-1" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Custom Player Controls */}
        <div className="p-4 bg-slate-900 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-honey transition p-1 hover:bg-slate-800 rounded-lg shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current pl-0.5" />
              )}
            </button>
            <div className="text-[10px] text-slate-300 font-mono shrink-0">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </div>

            {/* Slider bar */}
            <input
              type="range"
              min="0"
              max={videoDuration}
              value={currentTime}
              onChange={handleSliderChange}
              className="flex-1 h-1.5 rounded-full bg-slate-850 accent-honey outline-none cursor-pointer"
            />

            {/* Speed selection */}
            <div className="flex gap-1">
              {[0.5, 1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-850 border transition",
                    playbackSpeed === speed ? "border-honey text-honey" : "border-slate-800 text-slate-400"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="font-semibold text-white">Progress:</span> {pct}% watched
            </div>
            <div>
              {progress?.completed ? (
                <span className="bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  ✓ Lesson Completed
                </span>
              ) : (
                <span className="bg-honey/15 border border-honey/30 px-2 py-0.5 rounded text-[10px] font-bold text-honey flex items-center gap-1">
                  In Progress
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pause(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

// Reusable Loader
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
