import type { BoxingStyle } from '../data/boxingMoves';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Workout {
  id: string;
  name: string;
  description: string;
  focus: string[]; // e.g., ['Jab', 'Cross']
  roundDuration: number; // seconds
  restDuration: number;
  rounds: number;
  calloutInterval: number;
  repetitions: number; // Number of times to repeat this workout
}

export interface TrainingSession {
  id: string;
  name: string;
  description: string;
  style: BoxingStyle;
  level: SkillLevel;
  totalDuration: number; // Total minutes
  workouts: Workout[];
  generatedAt: Date;
}

export interface WorkoutCompletion {
  workoutId: string;
  repetitionNumber: number;
  completedAt: Date;
  frames?: string[]; // Only if this rep was analyzed
  analysisResult?: {
    overallScore: number;
    strengths: string[];
    improvements: string[];
    formFeedback: string;
    styleAdherence: string;
  };
}

export interface SessionProgress {
  sessionId: string;
  startedAt: Date;
  completedWorkouts: WorkoutCompletion[];
  currentWorkoutIndex: number;
  currentRepetition: number;
  isComplete: boolean;
}

export interface UserProfile {
  id: string;
  preferredStyle: BoxingStyle;
  skillLevel: SkillLevel;
  createdAt: Date;
  lastAnalysisDate?: Date; // Track daily analysis limit
  dailyAnalysisCount: number;
}

export interface UserProgress {
  sessionHistory: SessionProgress[];
  totalWorkouts: number;
  totalAnalyses: number;
  averageScore: number;
}

// Constants
export const ANALYSIS_LIMIT_PER_DAY = 1;
export const DEFAULT_REPETITIONS = 3;
export const TARGET_SESSION_DURATION = 30; // minutes
