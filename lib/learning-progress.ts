export interface LearningProgress {
  id: string;
  enrollmentId: string;
  learningContentId: string;
  watchedSeconds: number;
  progressPercentage: number;
  completed: boolean;
  completedAt?: string;
  lastWatchedAt: string;
}

const PROGRESS_STORAGE_PREFIX = "hunarbee_learning_progress_";

function getProgressKey(enrollmentId: string): string {
  return `${PROGRESS_STORAGE_PREFIX}${enrollmentId}`;
}

function readAllProgress(enrollmentId: string): Record<string, LearningProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getProgressKey(enrollmentId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllProgress(enrollmentId: string, data: Record<string, LearningProgress>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getProgressKey(enrollmentId), JSON.stringify(data));
}

export async function getLearningProgress(
  enrollmentId: string,
  learningContentId: string
): Promise<LearningProgress | null> {
  const all = readAllProgress(enrollmentId);
  return all[learningContentId] || null;
}

export async function getAllLearningProgress(
  enrollmentId: string
): Promise<Record<string, LearningProgress>> {
  return readAllProgress(enrollmentId);
}

export async function saveLearningProgress(
  enrollmentId: string,
  learningContentId: string,
  progressData: Partial<Omit<LearningProgress, "enrollmentId" | "learningContentId">>
): Promise<LearningProgress> {
  const all = readAllProgress(enrollmentId);
  const existing = all[learningContentId];
  const now = new Date().toISOString();

  const updated: LearningProgress = {
    id: existing?.id || `lp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    enrollmentId,
    learningContentId,
    watchedSeconds: progressData.watchedSeconds !== undefined ? progressData.watchedSeconds : (existing?.watchedSeconds || 0),
    progressPercentage: progressData.progressPercentage !== undefined ? progressData.progressPercentage : (existing?.progressPercentage || 0),
    completed: progressData.completed !== undefined ? progressData.completed : (existing?.completed || false),
    completedAt: progressData.completed ? (existing?.completedAt || now) : existing?.completedAt,
    lastWatchedAt: now,
  };

  all[learningContentId] = updated;
  writeAllProgress(enrollmentId, all);

  return updated;
}
