import { useState } from 'react';
import { getUserProgress } from '../services/userProfile';
import type { SessionProgress, WorkoutCompletion } from '../types/training';

interface WorkoutHistoryProps {
  onClose: () => void;
}

export function WorkoutHistory({ onClose }: WorkoutHistoryProps) {
  const progress = getUserProgress();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleSession = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (session: SessionProgress): string => {
    const minutes = session.completedWorkouts.length * 3; // Rough estimate
    return `~${minutes} min`;
  };

  const getSessionStats = (session: SessionProgress) => {
    const totalWorkouts = session.completedWorkouts.length;
    const analyzedWorkouts = session.completedWorkouts.filter(w => w.analysisResult).length;
    const avgScore = analyzedWorkouts > 0
      ? session.completedWorkouts
          .filter(w => w.analysisResult)
          .reduce((sum, w) => sum + (w.analysisResult?.overallScore || 0), 0) / analyzedWorkouts
      : 0;

    return { totalWorkouts, analyzedWorkouts, avgScore };
  };

  if (progress.sessionHistory.length === 0) {
    return (
      <div className="history-overlay">
        <div className="history-modal">
          <div className="history-header">
            <h2>📊 Workout History</h2>
            <button onClick={onClose} className="close-button">✕</button>
          </div>
          <div className="history-content">
            <div className="empty-history">
              <p>No workout sessions yet!</p>
              <p className="empty-subtitle">Complete your first session to see it here.</p>
            </div>
          </div>
          <div className="history-footer">
            <button onClick={onClose} className="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h2>📊 Workout History</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="history-stats-summary">
          <div className="summary-stat">
            <div className="summary-value">{progress.totalWorkouts}</div>
            <div className="summary-label">Total Workouts</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value">{progress.totalAnalyses}</div>
            <div className="summary-label">Analyses</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value">
              {progress.averageScore > 0 ? progress.averageScore.toFixed(1) : '-'}
            </div>
            <div className="summary-label">Avg Score</div>
          </div>
        </div>

        <div className="history-content">
          <div className="sessions-list">
            {progress.sessionHistory.slice().reverse().map((session) => {
              const stats = getSessionStats(session);
              const isExpanded = expandedSessionId === session.sessionId;

              return (
                <div key={session.sessionId} className="session-history-card">
                  <div
                    className="session-history-header"
                    onClick={() => toggleSession(session.sessionId)}
                  >
                    <div className="session-history-info">
                      <div className="session-history-date">
                        {formatDate(session.startedAt)}
                      </div>
                      <div className="session-history-meta">
                        <span className="meta-badge">
                          {stats.totalWorkouts} workouts
                        </span>
                        <span className="meta-badge">
                          {formatDuration(session)}
                        </span>
                        {stats.analyzedWorkouts > 0 && (
                          <span className="meta-badge score-badge">
                            Score: {stats.avgScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="expand-icon">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="session-history-details">
                      <h4>Completed Workouts</h4>
                      {session.completedWorkouts.map((workout, index) => (
                        <div key={index} className="workout-completion-card">
                          <div className="completion-header">
                            <span className="completion-number">
                              Workout #{index + 1}
                            </span>
                            <span className="completion-rep">
                              Rep {workout.repetitionNumber}
                            </span>
                          </div>

                          {workout.analysisResult && (
                            <div className="completion-analysis">
                              <div className="analysis-score">
                                <span className="score-label">Score:</span>
                                <span className="score-value">
                                  {workout.analysisResult.overallScore}/10
                                </span>
                              </div>

                              <div className="analysis-feedback">
                                <div className="feedback-section">
                                  <strong>💪 Strengths:</strong>
                                  <ul>
                                    {workout.analysisResult.strengths.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="feedback-section">
                                  <strong>🎯 Areas to Improve:</strong>
                                  <ul>
                                    {workout.analysisResult.improvements.map((imp, i) => (
                                      <li key={i}>{imp}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="feedback-section">
                                  <strong>📝 Form Feedback:</strong>
                                  <p>{workout.analysisResult.formFeedback}</p>
                                </div>

                                <div className="feedback-section">
                                  <strong>🥊 Style Adherence:</strong>
                                  <p>{workout.analysisResult.styleAdherence}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="history-footer">
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}
