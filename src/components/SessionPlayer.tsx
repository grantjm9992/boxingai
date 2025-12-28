import { useState, useEffect } from 'react';
import type { TrainingSession, SessionProgress } from '../types/training';
import { WorkoutTimer } from './WorkoutTimer';
import {
  getSessionProgress,
  createNewSessionProgress,
  saveSessionProgress,
  canUseAnalysisToday,
} from '../services/userProfile';

interface SessionPlayerProps {
  session: TrainingSession;
  onSessionComplete: () => void;
  onSessionExit: () => void;
  onWorkoutComplete: (
    workoutId: string,
    repetition: number,
    frames: string[],
    shouldAnalyze: boolean
  ) => void;
}

export function SessionPlayer({
  session,
  onSessionComplete,
  onSessionExit,
  onWorkoutComplete,
}: SessionPlayerProps) {
  const [progress, setProgress] = useState<SessionProgress>(() =>
    getSessionProgress(session.id) || createNewSessionProgress(session.id)
  );

  const [selectedRepForAnalysis, setSelectedRepForAnalysis] = useState<number | null>(null);
  const [showRepSelection, setShowRepSelection] = useState(false);
  const [canAnalyze] = useState(canUseAnalysisToday());

  const currentWorkout = session.workouts[progress.currentWorkoutIndex];
  const isLastWorkout = progress.currentWorkoutIndex === session.workouts.length - 1;
  const isLastRepetition = progress.currentRepetition === currentWorkout.repetitions;

  useEffect(() => {
    saveSessionProgress(progress);
  }, [progress]);

  const handleWorkoutComplete = (frames: string[]) => {
    const shouldAnalyze =
      canAnalyze &&
      selectedRepForAnalysis !== null &&
      selectedRepForAnalysis === progress.currentRepetition;

    onWorkoutComplete(
      currentWorkout.id,
      progress.currentRepetition,
      frames,
      shouldAnalyze
    );

    // Move to next repetition or workout
    if (isLastRepetition) {
      if (isLastWorkout) {
        // Session complete
        setProgress(prev => ({
          ...prev,
          isComplete: true,
        }));
        onSessionComplete();
      } else {
        // Move to next workout
        setProgress(prev => ({
          ...prev,
          currentWorkoutIndex: prev.currentWorkoutIndex + 1,
          currentRepetition: 1,
        }));
        setSelectedRepForAnalysis(null);
        setShowRepSelection(false);
      }
    } else {
      // Next repetition of same workout
      setProgress(prev => ({
        ...prev,
        currentRepetition: prev.currentRepetition + 1,
      }));
    }
  };

  const handleRepSelectionConfirm = () => {
    setShowRepSelection(false);
  };

  const getWorkoutProgress = () => {
    const totalWorkouts = session.workouts.reduce((sum, w) => sum + w.repetitions, 0);
    const completedWorkouts = progress.completedWorkouts.length;
    return {
      current: completedWorkouts + 1,
      total: totalWorkouts,
      percentage: Math.round(((completedWorkouts) / totalWorkouts) * 100),
    };
  };

  const workoutProgress = getWorkoutProgress();

  return (
    <div className="session-player">
      <div className="session-header">
        <div className="session-info">
          <h1>{session.name}</h1>
          <p>{session.description}</p>
          <div className="session-meta">
            <span className="style-badge">{session.style}</span>
            <span className="level-badge">{session.level}</span>
            <span className="duration-badge">~{Math.round(session.totalDuration)} min</span>
          </div>
        </div>

        <div className="session-progress-bar">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${workoutProgress.percentage}%` }}
            />
          </div>
          <span className="progress-text">
            {workoutProgress.current} / {workoutProgress.total} workouts
          </span>
        </div>

        <button onClick={onSessionExit} className="btn btn-secondary">
          Exit Session
        </button>
      </div>

      <div className="current-workout-info">
        <h2>
          {currentWorkout.name}
          <span className="rep-indicator">
            Rep {progress.currentRepetition} of {currentWorkout.repetitions}
          </span>
        </h2>
        <p>{currentWorkout.description}</p>
        <div className="workout-focus">
          <strong>Focus:</strong> {currentWorkout.focus.join(', ')}
        </div>

        {canAnalyze && progress.currentRepetition === 1 && (
          <div className="analysis-selection">
            <p className="analysis-info">
              ✓ Analysis available for this workout. Choose which repetition to analyze:
            </p>
            <div className="rep-buttons">
              {Array.from({ length: currentWorkout.repetitions }, (_, i) => i + 1).map(rep => (
                <button
                  key={rep}
                  onClick={() => setSelectedRepForAnalysis(rep)}
                  className={`btn btn-rep ${selectedRepForAnalysis === rep ? 'selected' : ''}`}
                >
                  Rep {rep}
                </button>
              ))}
              <button
                onClick={() => setSelectedRepForAnalysis(null)}
                className={`btn btn-rep ${selectedRepForAnalysis === null ? 'selected' : ''}`}
              >
                None
              </button>
            </div>
          </div>
        )}

        {!canAnalyze && (
          <div className="analysis-limit-warning">
            Daily analysis limit reached. Complete this workout without analysis.
          </div>
        )}

        {selectedRepForAnalysis !== null && (
          <div className="analysis-selected">
            Analysis will run on Rep {selectedRepForAnalysis}
            {progress.currentRepetition === selectedRepForAnalysis && ' (This rep!)'}
          </div>
        )}
      </div>

      {showRepSelection ? (
        <div className="rep-selection-screen">
          <h3>Select Repetition for Analysis</h3>
          <p>You can analyze one repetition of this workout. Which one would you like?</p>
          <div className="rep-buttons">
            {Array.from({ length: currentWorkout.repetitions }, (_, i) => i + 1).map(rep => (
              <button
                key={rep}
                onClick={() => setSelectedRepForAnalysis(rep)}
                className={`btn btn-rep ${selectedRepForAnalysis === rep ? 'selected' : ''}`}
              >
                Rep {rep}
              </button>
            ))}
            <button
              onClick={() => setSelectedRepForAnalysis(null)}
              className={`btn btn-rep ${selectedRepForAnalysis === null ? 'selected' : ''}`}
            >
              Skip Analysis
            </button>
          </div>
          <button
            onClick={handleRepSelectionConfirm}
            disabled={selectedRepForAnalysis === null}
            className="btn btn-primary"
          >
            Continue
          </button>
        </div>
      ) : (
        <WorkoutTimer
          config={{
            roundDuration: currentWorkout.roundDuration,
            restDuration: currentWorkout.restDuration,
            rounds: currentWorkout.rounds,
            calloutInterval: currentWorkout.calloutInterval,
            style: session.style,
            enableRecording:
              canAnalyze &&
              selectedRepForAnalysis !== null &&
              selectedRepForAnalysis === progress.currentRepetition,
          }}
          onWorkoutComplete={handleWorkoutComplete}
          onWorkoutStop={onSessionExit}
        />
      )}
    </div>
  );
}
