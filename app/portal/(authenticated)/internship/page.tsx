"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Play,
  Award,
  X,
  Lock,
  Unlock,
  Menu,
  GraduationCap
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import {
  getPortalToken,
  fetchPortalHome,
  clearPortalToken,
  PortalApiError,
  formatBatchDate,
  type PortalHome
} from "@/lib/portal";
import { cn } from "@/lib/utils";
import type { LearningProgress } from "@/lib/learning-progress";

// ─── Types ───

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
  type?: 'PRACTICE' | 'BUILD' | 'ASSESSMENT' | 'MENTOR_REVIEW';
  isRequired?: boolean;
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
  order: number;
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

interface CurriculumVersionRaw {
  id: string;
  version: number;
  phases: StudentPhase[];
}

interface CurriculumTemplateRaw {
  id: string;
  templateName: string;
  programId: string;
  planId: string;
  durationDays: number;
  currentPublishedVersionId: string | null;
  versions: CurriculumVersionRaw[];
}

export default function StudentInternshipPage() {
  const router = useRouter();
  const [home, setHome] = useState<PortalHome | null>(null);
  const [loading, setLoading] = useState(true);

  // Curriculum State
  const [curriculum, setCurriculum] = useState<StudentCurriculum | null>(null);
  const [allDaysList, setAllDaysList] = useState<StudentDay[]>([]);
  
  // Navigation / Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewDay, setPreviewDay] = useState<StudentDay | null>(null);

  // Student Task Submit Progress local storage state: map of taskId -> { checked: boolean, status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' }
  const [progress, setProgress] = useState<Record<string, { checked: boolean; status: string }>>({});
  const [learningProgress, setLearningProgress] = useState<Record<string, LearningProgress>>({});
  const [activeVideo, setActiveVideo] = useState<StudentLearningContent | null>(null);

  // Submission form state
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [notes, setNotes] = useState("");

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
                  const loadedTemplates = resData.data as CurriculumTemplateRaw[];
                  const progIdNormalized = activeEnrollment.programId.startsWith("prog_")
                    ? activeEnrollment.programId
                    : `prog_${activeEnrollment.programId}`;

                  const expectedDays = activeEnrollment.durationId.includes("3") ? 90 : 30;
                  
                  const matchedTmpl = loadedTemplates.find((t) => {
                    const matchesProg = t.programId === progIdNormalized || t.programId === activeEnrollment.programId;
                    const matchesDur = t.durationDays === expectedDays || t.planId === activeEnrollment.durationId;
                    return matchesProg && matchesDur;
                  });

                  if (matchedTmpl) {
                    const version = matchedTmpl.versions.find((v) => v.id === matchedTmpl.currentPublishedVersionId)
                      || [...matchedTmpl.versions].sort((a, b) => b.version - a.version)[0];
                    
                    if (version) {
                      const mappedCurriculum: StudentCurriculum = {
                        programName: matchedTmpl.templateName,
                        durationLabel: `${matchedTmpl.durationDays} Days`,
                        phases: version.phases,
                      };
                      setCurriculum(mappedCurriculum);

                      // Flatten all days in order
                      const flatDays: StudentDay[] = [];
                      version.phases.forEach((p) => {
                        p.weeks.forEach((w) => {
                          w.days.forEach((d) => {
                            flatDays.push(d);
                          });
                        });
                      });
                      setAllDaysList(flatDays);
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
    setSubmittingTaskId(taskId);
    setGithubUrl("");
    setLiveUrl("");
    setNotes("");
  };

  const submitTaskForm = () => {
    if (!submittingTaskId) return;
    const current = progress[submittingTaskId] || { checked: false, status: "NOT_SUBMITTED" };
    const updated = {
      ...progress,
      [submittingTaskId]: {
        ...current,
        checked: true, // Auto check when submitted
        status: "SUBMITTED",
      },
    };
    saveProgress(updated);
    setSubmittingTaskId(null);
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
        if (!lc.isRequired) continue;
        const lp = learningProgress[lc.id];
        if (!lp || !lp.completed) {
          return true;
        }
      } else if (prereq.type === "VIDEO_COMPLETED") {
        const lc = dayLearningContent.find((item) => item.id === prereq.targetId);
        if (!lc || lc.type !== "VIDEO") continue;
        const lp = learningProgress[lc.id];
        if (!lp || !lp.completed) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  };

  // Mark Article/Docs as read
  const handleMarkAsRead = async (lcId: string) => {
    if (!activeEnrollment) return;
    try {
      const LPService = await import("@/lib/learning-progress");
      await LPService.saveLearningProgress(activeEnrollment.id, lcId, {
        completed: true,
        progressPercentage: 100,
      });
      loadLearningProgress(activeEnrollment.id);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Step Check Helpers ───

  const isLearnComplete = (day: StudentDay) => {
    const required = (day.learningContent || []).filter((lc) => lc.isRequired);
    if (required.length === 0) return true;
    return required.every((lc) => learningProgress[lc.id]?.completed);
  };

  const isPracticeComplete = (day: StudentDay) => {
    const requiredPractice = (day.tasks || []).filter((t) => t.type === "PRACTICE" && t.isRequired !== false);
    if (requiredPractice.length === 0) return true;
    return requiredPractice.every((t) => progress[t.id]?.checked);
  };

  const isBuildComplete = (day: StudentDay) => {
    const requiredBuild = (day.tasks || []).filter((t) => (t.type === "BUILD" || (!t.type && t.requiresSubmission)) && t.isRequired !== false);
    if (requiredBuild.length === 0) return true;
    return requiredBuild.every((t) => progress[t.id]?.checked);
  };

  const isSubmitComplete = (day: StudentDay) => {
    const requiredBuild = (day.tasks || []).filter((t) => (t.type === "BUILD" || (!t.type && t.requiresSubmission)) && t.isRequired !== false);
    const submissionRequired = requiredBuild.filter((t) => t.requiresSubmission);
    if (submissionRequired.length === 0) return true;
    return submissionRequired.every((t) => {
      const status = progress[t.id]?.status;
      return status === "SUBMITTED" || status === "APPROVED";
    });
  };

  const isDayCompleted = (day: StudentDay) => {
    return (
      isLearnComplete(day) &&
      isPracticeComplete(day) &&
      isBuildComplete(day) &&
      isSubmitComplete(day)
    );
  };

  const isDayUnlocked = (day: StudentDay, index: number) => {
    if (index <= 0) return true;
    return isDayCompleted(allDaysList[index - 1]);
  };

  if (loading) {
    return (
      <div className="flex py-32 items-center justify-center bg-surface-elevated min-h-screen">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-honey mx-auto" />
          <p className="text-xs text-slate">Loading internship curriculum…</p>
        </div>
      </div>
    );
  }

  if (!curriculum || allDaysList.length === 0) {
    return (
      <PortalShell>
        <div className="mx-auto max-w-6xl space-y-6 flex py-32 items-center justify-center min-h-[calc(100vh-140px)]">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-navy">Curriculum pending</h2>
            <p className="text-xs text-slate">No curriculum assigned yet. Please check back later.</p>
          </div>
        </div>
      </PortalShell>
    );
  }

  // ─── autoritatives state calculations ───
  const totalDays = allDaysList.length;
  const startDateStr = activeEnrollment?.startDate || activeEnrollment?.preferredBatch || "";
  
  let calendarDayNumber = 1;
  let internshipStarted = false;
  let internshipCompleted = false;
  let expectedEndDateFormatted = "";

  if (startDateStr) {
    const start = new Date(startDateStr);
    if (!isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      calendarDayNumber = diffDays + 1;
      internshipStarted = diffDays >= 0;

      const end = new Date(start);
      end.setDate(start.getDate() + (totalDays - 1));
      expectedEndDateFormatted = end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else {
      expectedEndDateFormatted = "Flexible";
      internshipStarted = true;
    }
  }

  // Find Current Mission Day (first unlocked and incomplete)
  let currentMissionIdx = -1;
  let currentMissionDay: StudentDay | null = null;

  for (let i = 0; i < allDaysList.length; i++) {
    const day = allDaysList[i];
    const completed = isDayCompleted(day);
    const unlocked = isDayUnlocked(day, i);
    if (!completed && unlocked) {
      currentMissionDay = day;
      currentMissionIdx = i;
      break;
    }
  }

  // Check if fully completed
  const completedDaysCount = allDaysList.filter(isDayCompleted).length;
  if (completedDaysCount === totalDays) {
    internshipCompleted = true;
  }

  // If no day is current mission because they are all locked (should not happen chronologically), fallback to Day 1
  if (!currentMissionDay && !internshipCompleted) {
    currentMissionDay = allDaysList[0];
    currentMissionIdx = 0;
  }

  // Overall metric counters
  let totalRequiredLessons = 0;
  let completedRequiredLessons = 0;
  let totalRequiredTasks = 0;
  let completedRequiredTasks = 0;

  allDaysList.forEach((d) => {
    (d.learningContent || []).forEach((lc) => {
      if (lc.isRequired) {
        totalRequiredLessons++;
        if (learningProgress[lc.id]?.completed) {
          completedRequiredLessons++;
        }
      }
    });

    (d.tasks || []).forEach((t) => {
      if (t.isRequired !== false) {
        totalRequiredTasks++;
        if (progress[t.id]?.checked) {
          completedRequiredTasks++;
        }
      }
    });
  });

  const activeDay = previewDay || currentMissionDay || allDaysList[0];

  // Stepper state for Active Day
  const learnDone = isLearnComplete(activeDay);
  const practiceDone = isPracticeComplete(activeDay);
  const buildDone = isBuildComplete(activeDay);
  const submitDone = isSubmitComplete(activeDay);

  const practiceTasks = (activeDay.tasks || []).filter((t) => t.type === "PRACTICE");
  const buildTasks = (activeDay.tasks || []).filter((t) => t.type === "BUILD" || (!t.type && t.requiresSubmission));
  const hasPracticeStep = practiceTasks.length > 0;
  const hasBuildStep = buildTasks.length > 0;

  const buildRequiresSubmission = buildTasks.some((t) => t.requiresSubmission);
  const hasSubmitStep = buildTasks.length > 0 && buildRequiresSubmission;

  return (
    <PortalShell>
      <div className="mx-auto max-w-5xl space-y-6 pb-16">
        
        {/* Personalized Welcoming Card */}
        <div className="rounded-2xl border border-navy/5 bg-surface-elevated p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-navy flex items-center gap-2">
              Good morning, {home?.user.name.split(" ")[0]} 👋
            </h2>
            <p className="text-sm font-semibold text-slate uppercase tracking-wider">
              {curriculum.programName}
            </p>
            {startDateStr && (
              <div className="text-xs text-slate space-y-0.5 mt-2">
                <p>Started: <span className="font-semibold text-navy">{formatBatchDate(startDateStr)}</span></p>
                <p>Expected Completion: <span className="font-semibold text-navy">{expectedEndDateFormatted}</span></p>
              </div>
            )}
          </div>

          {/* Separation of Calendar and Progression labels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-l border-navy/5 pl-0 md:pl-6 shrink-0 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate uppercase tracking-wider text-[10px]">Calendar</span>
              <p className="text-sm font-bold text-navy">
                {!internshipStarted
                  ? "Not Started Yet"
                  : calendarDayNumber > totalDays
                  ? "Completed"
                  : `Day ${calendarDayNumber} of ${totalDays}`}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold text-slate uppercase tracking-wider text-[10px]">Current Mission</span>
              <p className="text-sm font-bold text-honey-deep">
                {internshipCompleted
                  ? "Fully Complete!"
                  : currentMissionDay
                  ? `Day ${currentMissionDay.dayNumber}`
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="font-semibold text-slate uppercase tracking-wider text-[10px]">Internship Progress</span>
              <p className="text-sm font-bold text-navy">
                {completedDaysCount} of {totalDays} Days Done
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress Metrics Accordion */}
        <div className="rounded-2xl border border-navy/5 bg-surface-elevated p-4 shadow-sm flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-slate">
          <div>
            Required Lessons: <span className="text-navy font-bold">{completedRequiredLessons} of {totalRequiredLessons}</span> completed
          </div>
          <div>
            Required Tasks: <span className="text-navy font-bold">{completedRequiredTasks} of {totalRequiredTasks}</span> checked
          </div>
        </div>

        {/* Outer State Messages */}
        {!internshipStarted && startDateStr && (
          <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-center text-sm font-semibold text-blue-600">
            Your internship starts on {formatBatchDate(startDateStr)}
          </div>
        )}

        {internshipCompleted && (
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6 text-center space-y-2">
            <h3 className="text-lg font-bold text-emerald-800">🎉 Congratulations!</h3>
            <p className="text-sm text-emerald-700">You have completed all days and requirements of your internship.</p>
          </div>
        )}

        {/* Workspace Layout */}
        <div className="space-y-6">
          
          {/* Header Action bar: View Curriculum Trigger */}
          <div className="flex justify-between items-center bg-surface-elevated border border-navy/5 p-3 rounded-xl">
            <div className="text-xs font-bold text-navy">
              {previewDay ? (
                <span className="text-red-500 flex items-center gap-1.5 animate-pulse">
                  ⚠️ Previewing Day {previewDay.dayNumber}
                </span>
              ) : (
                <span>📍 Today&apos;s Mission: Day {activeDay.dayNumber}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {previewDay && (
                <Button
                  onClick={() => setPreviewDay(null)}
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs font-bold text-navy border border-navy/10 bg-surface"
                >
                  Go to Today&apos;s Mission
                </Button>
              )}
              
              <Button
                onClick={() => setIsDrawerOpen(true)}
                size="sm"
                className="h-8 text-xs font-bold bg-navy text-white hover:bg-navy-soft"
              >
                <Menu className="h-4.5 w-4.5 mr-1" /> View Curriculum
              </Button>
            </div>
          </div>

          {/* Active Day Content Panel */}
          <div className="space-y-6">
            
            {/* Mission Hero Header Card */}
            <div className="rounded-2xl border border-navy/5 bg-surface-elevated p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-honey-deep">
                  {previewDay ? "Curriculum Preview" : "Today's Mission"}
                </span>
                <h3 className="text-lg font-extrabold text-navy mt-1">
                  Day {activeDay.dayNumber}: {activeDay.title}
                </h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed">
                  {activeDay.description || "Learn today's objectives and complete the tasks to progress."}
                </p>
              </div>

              {/* Day Workflow Stepper Panel */}
              <div className="border-t border-navy/5 pt-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold">
                  {/* LEARN Step Indicator */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition",
                      learnDone ? "bg-emerald-500 text-white" : "bg-honey/15 text-honey-deep"
                    )}>
                      {learnDone ? "✓" : "1"}
                    </span>
                    <span className={learnDone ? "text-slate/60 line-through" : "text-navy"}>LEARN</span>
                  </div>

                  {/* PRACTICE Step Indicator */}
                  {hasPracticeStep && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition",
                        practiceDone ? "bg-emerald-500 text-white" : "bg-navy/5 text-slate"
                      )}>
                        {practiceDone ? "✓" : "2"}
                      </span>
                      <span className={practiceDone ? "text-slate/60 line-through" : "text-navy"}>
                        PRACTICE {practiceTasks.every(t => t.isRequired === false) && <span className="text-[9px] text-slate font-medium">(Optional)</span>}
                      </span>
                    </div>
                  )}

                  {/* BUILD Step Indicator */}
                  {hasBuildStep && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition",
                        buildDone ? "bg-emerald-500 text-white" : "bg-navy/5 text-slate"
                      )}>
                        {buildDone ? "✓" : hasPracticeStep ? "3" : "2"}
                      </span>
                      <span className={buildDone ? "text-slate/60 line-through" : "text-navy"}>
                        BUILD {buildTasks.every(t => t.isRequired === false) && <span className="text-[9px] text-slate font-medium">(Optional)</span>}
                      </span>
                    </div>
                  )}

                  {/* SUBMIT Step Indicator */}
                  {hasSubmitStep && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition",
                        submitDone ? "bg-emerald-500 text-white" : "bg-navy/5 text-slate"
                      )}>
                        {submitDone ? "✓" : hasPracticeStep ? "4" : "3"}
                      </span>
                      <span className={submitDone ? "text-slate/60 line-through" : "text-navy"}>SUBMIT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stepper Part 1: LEARN Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate">① LEARN</h4>
              
              {activeDay.learningContent && activeDay.learningContent.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeDay.learningContent.map((lc) => {
                    const lp = learningProgress[lc.id];
                    const isCompleted = lp?.completed || false;
                    const progressPct = lp?.progressPercentage || 0;

                    return (
                      <div
                        key={lc.id}
                        className={cn(
                          "rounded-xl border p-4 flex flex-col justify-between transition-all bg-surface-elevated",
                          isCompleted ? "border-emerald-500/10 bg-emerald-500/[0.01]" : "border-navy/5"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-bold text-navy leading-snug">{lc.title}</h5>
                            <span className={cn(
                              "rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider shrink-0",
                              lc.type === "VIDEO" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                            )}>
                              {lc.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate leading-relaxed">{lc.description}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-navy/5 pt-2.5">
                          <span className="text-[9px] font-bold">
                            {lc.isRequired ? <span className="text-red-500">* Required</span> : <span className="text-slate/40">Optional</span>}
                          </span>

                          {lc.type === "VIDEO" ? (
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                  ✓ Completed
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate font-semibold">
                                  {progressPct}% Complete
                                </span>
                              )}
                              <Button
                                size="sm"
                                onClick={() => activeEnrollment && setActiveVideo(lc)}
                                className="h-6 px-2.5 text-[9px] flex items-center gap-1"
                              >
                                <Play className="h-2.5 w-2.5 fill-current" /> Watch Lesson
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {!isCompleted && lc.isRequired && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleMarkAsRead(lc.id)}
                                  className="h-6 px-2.5 text-[9px] font-bold border border-navy/10"
                                >
                                  Mark as Completed
                                </Button>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mr-2">
                                  ✓ Completed
                                </span>
                              )}
                              <a
                                href={lc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline"
                              >
                                Open Resource <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-navy/10 p-4 text-center text-xs text-slate">
                  No learning resources for this day. Complete any practice or build tasks to continue.
                </div>
              )}
            </div>

            {/* Stepper Part 2: PRACTICE Section */}
            {hasPracticeStep && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate">
                  ② PRACTICE {practiceTasks.every(t => t.isRequired === false) && <span className="text-[10px] font-medium text-slate/50">(Optional step)</span>}
                </h4>
                
                <div className="space-y-2">
                  {practiceTasks.map((task) => {
                    const state = progress[task.id] || { checked: false, status: "NOT_SUBMITTED" };
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "rounded-xl border p-4 transition-all bg-surface-elevated flex items-start gap-3 justify-between border-navy/5",
                          state.checked && "border-emerald-500/10 bg-emerald-500/[0.01]"
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={state.checked}
                            onChange={() => toggleTaskChecked(task.id)}
                            className="mt-1 h-4 w-4 rounded border-navy/20 accent-honey cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <p className={cn("text-xs font-bold text-navy", state.checked && "line-through text-slate/50")}>
                              {task.title}
                            </p>
                            <p className="text-[11px] text-slate mt-0.5 leading-relaxed">{task.description}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate/50 shrink-0 ml-4">
                          {task.isRequired !== false ? "Required" : "Optional"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stepper Part 3: BUILD Section */}
            {hasBuildStep && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate">
                  {hasPracticeStep ? "③ BUILD" : "② BUILD"} {buildTasks.every(t => t.isRequired === false) && <span className="text-[10px] font-medium text-slate/50">(Optional step)</span>}
                </h4>
                
                <div className="space-y-3">
                  {buildTasks.map((task) => {
                    const state = progress[task.id] || { checked: false, status: "NOT_SUBMITTED" };
                    const locked = !learnDone || isTaskLocked(task, activeDay.learningContent || []);

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "rounded-xl border p-5 transition-all bg-surface-elevated relative overflow-hidden",
                          locked
                            ? "border-navy/5 opacity-60 bg-navy/[0.01]"
                            : state.checked
                            ? "border-emerald-500/10 bg-emerald-500/[0.01]"
                            : "border-navy/5"
                        )}
                      >
                        <div className="flex items-start gap-4 justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={state.checked}
                              disabled={locked}
                              onChange={() => toggleTaskChecked(task.id)}
                              className="mt-1 h-4 w-4 rounded border-navy/20 accent-honey cursor-pointer shrink-0 disabled:cursor-not-allowed"
                            />
                            <div className="min-w-0">
                              <p className={cn(
                                "text-xs font-bold text-navy flex items-center gap-1.5",
                                state.checked && "line-through text-slate/50"
                              )}>
                                {locked ? <Lock className="h-3.5 w-3.5 text-slate shrink-0" /> : <Unlock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                                {task.title}
                              </p>
                              <p className="text-[11px] text-slate mt-1 leading-relaxed">{task.description}</p>
                              
                              {!locked && task.instructions && (
                                <div className="mt-3 text-[10px] text-slate/85 bg-navy/[0.02] p-2.5 rounded-lg border border-navy/5">
                                  <span className="font-bold text-navy">Instructions:</span> {task.instructions}
                                </div>
                              )}

                              {locked && task.prerequisites && task.prerequisites.length > 0 && (
                                <div className="mt-3 text-[9px] text-slate font-bold uppercase tracking-wider">
                                  🔒 Locked until prerequisites are complete
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4 text-right">
                            <span className="text-[9px] font-bold text-slate/50 bg-navy/5 px-2 py-0.5 rounded flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> {task.estimatedMinutes}m
                            </span>
                            <span className="text-[9px] font-semibold text-slate bg-navy/5 px-2 py-0.5 rounded">
                              {task.isRequired !== false ? "Required" : "Optional"}
                            </span>
                          </div>
                        </div>

                        {/* Submission status for individual Build tasks */}
                        {!locked && task.requiresSubmission && (
                          <div className="mt-4 pt-3 border-t border-navy/5 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-navy">Submission Status:</span>
                            <div>
                              {state.status === "NOT_SUBMITTED" && (
                                <Button
                                  onClick={() => handleSubmittingTask(task.id)}
                                  size="sm"
                                  className="h-6 px-2.5 text-[9px] font-bold"
                                >
                                  Submit Work
                                </Button>
                              )}
                              {state.status === "SUBMITTED" && (
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-honey/10 px-2 py-0.5 text-[9px] font-bold text-honey-deep">
                                    Submitted · Under Review
                                  </span>
                                  <button
                                    onClick={() => handleSimulateReview(task.id)}
                                    className="text-[8px] font-bold text-blue-500 hover:underline"
                                  >
                                    Simulate Review
                                  </button>
                                </div>
                              )}
                              {state.status === "APPROVED" && (
                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                                  <Award className="h-3.5 w-3.5" /> Graded (Pass)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stepper Part 4: SUBMIT Section */}
            {hasSubmitStep && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate">
                  {hasPracticeStep ? "④ SUBMIT" : "③ SUBMIT"}
                </h4>
                
                {buildTasks.filter(t => t.requiresSubmission && t.isRequired !== false).map((task) => {
                  const state = progress[task.id] || { checked: false, status: "NOT_SUBMITTED" };
                  const buildNotChecked = !state.checked;
                  const isSubmitted = state.status === "SUBMITTED" || state.status === "APPROVED";

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "rounded-xl border p-5 bg-surface-elevated border-navy/5",
                        buildNotChecked && "opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-navy/5 pb-2.5 mb-4">
                        <h5 className="text-xs font-bold text-navy">Submit: {task.title}</h5>
                        {buildNotChecked ? (
                          <span className="text-[10px] text-slate/50 font-bold flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" /> Complete BUILD task first
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            ✓ Submitted
                          </span>
                        ) : (
                          <span className="text-[10px] text-honey-deep font-bold flex items-center gap-1">
                            ● Available for Submission
                          </span>
                        )}
                      </div>

                      {/* Submission Input Fields */}
                      {!buildNotChecked && !isSubmitted && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate mb-1">GitHub Repository Link</label>
                            <input
                              type="text"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                              placeholder="https://github.com/username/repo"
                              className="w-full text-xs bg-white rounded-lg border border-navy/10 px-3 py-2 outline-none focus:border-honey"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate mb-1">Live URL (optional)</label>
                            <input
                              type="text"
                              value={liveUrl}
                              onChange={(e) => setLiveUrl(e.target.value)}
                              placeholder="https://my-app.vercel.app"
                              className="w-full text-xs bg-white rounded-lg border border-navy/10 px-3 py-2 outline-none focus:border-honey"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate mb-1">Additional Notes</label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Explain details of your submission..."
                              className="w-full text-xs bg-white rounded-lg border border-navy/10 px-3 py-2 outline-none focus:border-honey min-h-[60px]"
                            />
                          </div>
                          <Button
                            onClick={() => {
                              handleSubmittingTask(task.id);
                              submitTaskForm();
                            }}
                            className="h-8 text-xs font-bold w-full bg-navy text-white hover:bg-navy-soft"
                          >
                            Submit Task
                          </Button>
                        </div>
                      )}

                      {isSubmitted && (
                        <div className="text-xs text-slate space-y-1.5">
                          <p>Status: <span className="font-bold text-navy">{state.status}</span></p>
                          <p>Thank you! Your task is currently under review by a mentor.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Next Day Preview Card */}
            {currentMissionIdx !== -1 && currentMissionIdx < totalDays - 1 && (
              <div className="rounded-2xl border border-navy/5 bg-surface-elevated/40 p-5 mt-8 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate">Up Next</span>
                <h4 className="text-sm font-extrabold text-navy">
                  Day {allDaysList[currentMissionIdx + 1].dayNumber}: {allDaysList[currentMissionIdx + 1].title}
                </h4>
                <p className="text-[11px] text-slate">
                  {allDaysList[currentMissionIdx + 1].description}
                </p>
                <Button
                  onClick={() => setPreviewDay(allDaysList[currentMissionIdx + 1])}
                  variant="secondary"
                  size="sm"
                  className="h-7 text-[10px] font-bold border border-navy/10 bg-white"
                >
                  Preview Next Day
                </Button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Curriculum View Navigation Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative z-10 w-full max-w-sm bg-surface-elevated shadow-2xl h-full flex flex-col border-l border-navy/5"
            >
              <div className="flex items-center justify-between border-b border-navy/5 p-4 bg-surface-elevated">
                <div className="flex items-center gap-2 text-navy">
                  <GraduationCap className="h-5 w-5 text-honey-deep" />
                  <h3 className="text-sm font-extrabold">View Curriculum</h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="rounded-lg p-1 text-slate hover:bg-navy/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Timeline List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 portal-scrollbar">
                {curriculum.phases.map((phase) => (
                  <div key={phase.id} className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate border-b border-navy/5 pb-1">
                      {phase.title}
                    </h4>
                    
                    <div className="space-y-1">
                      {phase.weeks.map((week) => (
                        <div key={week.id} className="space-y-1 pl-2">
                          <h5 className="text-[10px] font-bold text-navy/70 uppercase">
                            {week.title}
                          </h5>
                          
                          <div className="space-y-1 border-l border-navy/5 pl-2">
                            {week.days.map((day) => {
                              const isCompleted = isDayCompleted(day);
                              // Search index of this day in the flat list
                              const flatIdx = allDaysList.findIndex(d => d.id === day.id);
                              const isUnlocked = isDayUnlocked(day, flatIdx);
                              const isToday = currentMissionDay && day.id === currentMissionDay.id;

                              return (
                                <button
                                  key={day.id}
                                  onClick={() => {
                                    setPreviewDay(day);
                                    setIsDrawerOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left rounded-lg p-2 text-xs flex items-center justify-between border transition",
                                    isToday
                                      ? "bg-honey/15 border-honey text-honey-deep font-bold"
                                      : isCompleted
                                      ? "bg-emerald-500/5 border-transparent text-emerald-600"
                                      : !isUnlocked
                                      ? "bg-navy/[0.01] border-transparent text-slate/40 cursor-not-allowed"
                                      : "hover:bg-navy/[0.03] border-transparent text-navy"
                                  )}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-bold">Day {day.dayNumber}:</span>
                                    <span className="truncate">{day.title}</span>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-1.5 ml-2">
                                    {isCompleted ? (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">✓ Done</span>
                                    ) : isToday ? (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-honey-deep">Current</span>
                                    ) : !isUnlocked ? (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate/40">Locked</span>
                                    ) : (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-navy/60">Available</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Video Lesson Player Modal */}
      {activeVideo && activeEnrollment && (
        <StudentVideoPlayer
          learningContent={activeVideo}
          enrollmentId={activeEnrollment.id}
          onCompleted={() => {
            loadLearningProgress(activeEnrollment.id);
          }}
          onClose={() => {
            setActiveVideo(null);
            loadLearningProgress(activeEnrollment.id);
          }}
        />
      )}
    </PortalShell>
  );
}

// ─── Student Video Player Component ───

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

  const videoUrl = learningContent.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const ytEmbed = getYoutubeEmbedUrl(videoUrl);

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
      <div className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h4 className="text-xs font-bold truncate max-w-md">{learningContent.title}</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Threshold: {threshold}% completion required</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Canvas */}
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
                src={videoUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              />

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

            <input
              type="range"
              min="0"
              max={videoDuration}
              value={currentTime}
              onChange={handleSliderChange}
              className="flex-1 h-1.5 rounded-full bg-slate-800 accent-honey outline-none cursor-pointer"
            />

            <div className="flex gap-1">
              {[0.5, 1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border transition",
                    playbackSpeed === speed ? "border-honey text-honey" : "border-slate-800 text-slate-400"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-850 pt-2.5">
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
