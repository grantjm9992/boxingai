import type { BoxingStyle } from '../data/boxingMoves';
import type {
  UserProfile,
  UserProgress,
  SessionProgress,
  WorkoutCompletion,
  SkillLevel,
} from '../types/training';
import { ANALYSIS_LIMIT_PER_DAY } from '../types/training';

const USER_PROFILE_KEY = 'boxingai_user_profile';
const USER_PROGRESS_KEY = 'boxingai_user_progress';

// User Profile Management
export function getUserProfile(): UserProfile | null {
  const stored = localStorage.getItem(USER_PROFILE_KEY);
  if (!stored) return null;

  const profile = JSON.parse(stored);
  // Convert date strings back to Date objects
  profile.createdAt = new Date(profile.createdAt);
  if (profile.lastAnalysisDate) {
    profile.lastAnalysisDate = new Date(profile.lastAnalysisDate);
  }
  return profile;
}

export function createUserProfile(
  style: BoxingStyle,
  level: SkillLevel
): UserProfile {
  const profile: UserProfile = {
    id: `user-${Date.now()}`,
    preferredStyle: style,
    skillLevel: level,
    createdAt: new Date(),
    dailyAnalysisCount: 0,
  };

  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const profile = getUserProfile();
  if (!profile) {
    throw new Error('No user profile found');
  }

  const updated = { ...profile, ...updates };
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
  return updated;
}

// Analysis Limit Management
export function canUseAnalysisToday(): boolean {
  const profile = getUserProfile();
  if (!profile) return true; // New user, allow

  const today = new Date().toDateString();
  const lastAnalysisDate = profile.lastAnalysisDate
    ? new Date(profile.lastAnalysisDate).toDateString()
    : null;

  // Reset count if it's a new day
  if (lastAnalysisDate !== today) {
    updateUserProfile({ dailyAnalysisCount: 0, lastAnalysisDate: new Date() });
    return true;
  }

  return profile.dailyAnalysisCount < ANALYSIS_LIMIT_PER_DAY;
}

export function incrementAnalysisCount(): void {
  const profile = getUserProfile();
  if (!profile) return;

  const today = new Date();
  updateUserProfile({
    dailyAnalysisCount: profile.dailyAnalysisCount + 1,
    lastAnalysisDate: today,
  });
}

// Progress Tracking
export function getUserProgress(): UserProgress {
  const stored = localStorage.getItem(USER_PROGRESS_KEY);
  if (!stored) {
    return {
      sessionHistory: [],
      totalWorkouts: 0,
      totalAnalyses: 0,
      averageScore: 0,
    };
  }

  const progress = JSON.parse(stored);
  // Convert date strings back to Date objects
  progress.sessionHistory = progress.sessionHistory.map((session: any) => ({
    ...session,
    startedAt: new Date(session.startedAt),
    completedWorkouts: session.completedWorkouts.map((workout: any) => ({
      ...workout,
      completedAt: new Date(workout.completedAt),
    })),
  }));

  return progress;
}

export function saveSessionProgress(session: SessionProgress): void {
  const progress = getUserProgress();

  // Find existing session or add new one
  const existingIndex = progress.sessionHistory.findIndex(
    s => s.sessionId === session.sessionId
  );

  if (existingIndex >= 0) {
    progress.sessionHistory[existingIndex] = session;
  } else {
    progress.sessionHistory.push(session);
  }

  // Recalculate totals
  progress.totalWorkouts = progress.sessionHistory.reduce(
    (total, s) => total + s.completedWorkouts.length,
    0
  );

  const analysedWorkouts = progress.sessionHistory.flatMap(s =>
    s.completedWorkouts.filter(w => w.analysisResult)
  );

  progress.totalAnalyses = analysedWorkouts.length;
  progress.averageScore =
    analysedWorkouts.length > 0
      ? analysedWorkouts.reduce(
          (sum, w) => sum + (w.analysisResult?.overallScore || 0),
          0
        ) / analysedWorkouts.length
      : 0;

  localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progress));
}

export function getSessionProgress(sessionId: string): SessionProgress | null {
  const progress = getUserProgress();
  return (
    progress.sessionHistory.find(s => s.sessionId === sessionId) || null
  );
}

export function createNewSessionProgress(sessionId: string): SessionProgress {
  return {
    sessionId,
    startedAt: new Date(),
    completedWorkouts: [],
    currentWorkoutIndex: 0,
    currentRepetition: 1,
    isComplete: false,
  };
}

export function addWorkoutCompletion(
  sessionId: string,
  completion: WorkoutCompletion
): void {
  const progress = getUserProgress();
  const session = progress.sessionHistory.find(s => s.sessionId === sessionId);

  if (!session) {
    const newSession = createNewSessionProgress(sessionId);
    newSession.completedWorkouts.push(completion);
    saveSessionProgress(newSession);
  } else {
    session.completedWorkouts.push(completion);
    saveSessionProgress(session);
  }
}

export function clearAllData(): void {
  localStorage.removeItem(USER_PROFILE_KEY);
  localStorage.removeItem(USER_PROGRESS_KEY);
}
