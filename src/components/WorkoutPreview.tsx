import type { TrainingSession } from '../types/training';

interface WorkoutPreviewProps {
  session: TrainingSession;
  onStart: () => void;
  onCancel: () => void;
}

export function WorkoutPreview({ session, onStart, onCancel }: WorkoutPreviewProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const totalWorkoutTime = session.workouts.reduce((total, workout) => {
    const workoutTime = (workout.roundDuration * workout.rounds + workout.restDuration * (workout.rounds - 1)) * workout.repetitions;
    return total + workoutTime;
  }, 0);

  return (
    <div className="preview-overlay">
      <div className="preview-modal">
        <div className="preview-header">
          <h2>📋 Session Preview</h2>
          <button onClick={onCancel} className="close-button">✕</button>
        </div>

        <div className="preview-content">
          <div className="session-overview">
            <h3>{session.name}</h3>
            <p className="session-description">{session.description}</p>

            <div className="session-meta">
              <div className="meta-item">
                <span className="meta-label">Style:</span>
                <span className="meta-value">{session.style}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Level:</span>
                <span className="meta-value">{session.level}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total Time:</span>
                <span className="meta-value">~{Math.ceil(totalWorkoutTime / 60)} min</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Workouts:</span>
                <span className="meta-value">{session.workouts.length}</span>
              </div>
            </div>
          </div>

          <div className="workouts-preview-list">
            <h4>Workout Breakdown</h4>
            {session.workouts.map((workout, index) => (
              <div key={workout.id} className="workout-preview-card">
                <div className="workout-preview-header">
                  <div className="workout-number">#{index + 1}</div>
                  <div className="workout-preview-info">
                    <h5>{workout.name}</h5>
                    <p>{workout.description}</p>
                  </div>
                </div>

                <div className="workout-preview-details">
                  <div className="detail-row">
                    <span className="detail-label">Focus:</span>
                    <div className="focus-tags">
                      {workout.focus.map((f, i) => (
                        <span key={i} className="focus-tag">{f}</span>
                      ))}
                    </div>
                  </div>

                  <div className="workout-specs">
                    <div className="spec-item">
                      <div className="spec-icon">⏱</div>
                      <div className="spec-text">
                        <div className="spec-value">{formatDuration(workout.roundDuration)}</div>
                        <div className="spec-label">per round</div>
                      </div>
                    </div>

                    <div className="spec-item">
                      <div className="spec-icon">🔁</div>
                      <div className="spec-text">
                        <div className="spec-value">{workout.rounds}</div>
                        <div className="spec-label">rounds</div>
                      </div>
                    </div>

                    <div className="spec-item">
                      <div className="spec-icon">😮‍💨</div>
                      <div className="spec-text">
                        <div className="spec-value">{formatDuration(workout.restDuration)}</div>
                        <div className="spec-label">rest</div>
                      </div>
                    </div>

                    <div className="spec-item">
                      <div className="spec-icon">🔄</div>
                      <div className="spec-text">
                        <div className="spec-value">{workout.repetitions}x</div>
                        <div className="spec-label">reps</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-footer">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onStart} className="btn btn-primary btn-large">
            🥊 Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
