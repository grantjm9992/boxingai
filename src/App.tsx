import { useState, useEffect } from 'react';
import './App.css';
import type { BoxingStyle } from './data/boxingMoves';
import type { SkillLevel, TrainingSession } from './types/training';
import { UserSetup } from './components/UserSetup';
import { SessionPlayer } from './components/SessionPlayer';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeBoxingForm } from './services/aiAnalysis';
import type { AnalysisResult } from './services/aiAnalysis';
import { generateTrainingSession, getDefaultSession } from './services/workoutGenerator';
import {
  getUserProfile,
  createUserProfile,
  addWorkoutCompletion,
  incrementAnalysisCount,
  getUserProgress,
  canUseAnalysisToday,
} from './services/userProfile';

type AppMode = 'setup' | 'home' | 'generating' | 'session' | 'results';

function App() {
  const [mode, setMode] = useState<AppMode>('setup');
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [userStyle, setUserStyle] = useState<BoxingStyle>('universal');
  const [userLevel, setUserLevel] = useState<SkillLevel>('beginner');

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserStyle(profile.preferredStyle);
      setUserLevel(profile.skillLevel);
      setMode('home');
    }
  }, []);

  const handleSetupComplete = (style: BoxingStyle, level: SkillLevel) => {
    createUserProfile(style, level);
    setUserStyle(style);
    setUserLevel(level);
    setMode('home');
  };

  const handleStartSession = () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
    } else {
      generateSession();
    }
  };

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      alert('Please enter your Anthropic API key');
      return;
    }
    setShowApiKeyInput(false);
    generateSession();
  };

  const generateSession = async () => {
    setMode('generating');

    try {
      const session = await generateTrainingSession(userStyle, userLevel, apiKey);
      setCurrentSession(session);
      setMode('session');
    } catch (error) {
      console.error('Session generation failed:', error);
      alert('Failed to generate session. Using default workout instead.');
      const session = getDefaultSession(userStyle, userLevel);
      setCurrentSession(session);
      setMode('session');
    }
  };

  const handleWorkoutComplete = async (
    workoutId: string,
    repetition: number,
    frames: string[],
    shouldAnalyze: boolean
  ) => {
    if (shouldAnalyze && frames.length > 0) {
      setIsAnalyzing(true);

      try {
        const result = await analyzeBoxingForm(frames, userStyle, apiKey);
        setAnalysisResult(result);

        // Save completion with analysis
        if (currentSession) {
          addWorkoutCompletion(currentSession.id, {
            workoutId,
            repetitionNumber: repetition,
            completedAt: new Date(),
            frames,
            analysisResult: result,
          });
        }

        incrementAnalysisCount();
        setMode('results');
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed. Please try again later.');

        // Save completion without analysis
        if (currentSession) {
          addWorkoutCompletion(currentSession.id, {
            workoutId,
            repetitionNumber: repetition,
            completedAt: new Date(),
          });
        }
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Save completion without analysis
      if (currentSession) {
        addWorkoutCompletion(currentSession.id, {
          workoutId,
          repetitionNumber: repetition,
          completedAt: new Date(),
        });
      }
    }
  };

  const handleSessionComplete = () => {
    alert('Session complete! Great work!');
    setMode('home');
    setCurrentSession(null);
  };

  const handleSessionExit = () => {
    if (confirm('Are you sure you want to exit the session?')) {
      setMode('home');
      setCurrentSession(null);
    }
  };

  const handleCloseResults = () => {
    // Return to session to continue
    setMode('session');
    setAnalysisResult(null);
  };

  const progress = getUserProgress();
  const canAnalyze = canUseAnalysisToday();

  return (
    <div className="app">
      {mode === 'setup' && <UserSetup onComplete={handleSetupComplete} />}

      {mode === 'home' && (
        <div className="home-screen">
          <div className="home-container">
            <h1>AI Boxing Coach</h1>
            <div className="user-info">
              <span className="info-badge">{userStyle}</span>
              <span className="info-badge">{userLevel}</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{progress.totalWorkouts}</div>
                <div className="stat-label">Workouts Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{progress.totalAnalyses}</div>
                <div className="stat-label">Analyses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {progress.averageScore > 0 ? progress.averageScore.toFixed(1) : '-'}
                </div>
                <div className="stat-label">Avg Score</div>
              </div>
            </div>

            {!canAnalyze && (
              <div className="analysis-limit-notice">
                Daily analysis limit reached. New session available tomorrow.
              </div>
            )}

            <button onClick={handleStartSession} className="btn btn-primary btn-large">
              Generate New Session
            </button>

            <div className="recent-sessions">
              <h2>Recent Sessions</h2>
              {progress.sessionHistory.slice(-3).reverse().map((session, i) => (
                <div key={i} className="session-card">
                  <div className="session-date">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </div>
                  <div className="session-stats">
                    {session.completedWorkouts.length} workouts completed
                  </div>
                </div>
              ))}
              {progress.sessionHistory.length === 0 && (
                <p className="no-sessions">No sessions yet. Start your first one!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'generating' && (
        <div className="generating-screen">
          <div className="generating-message">
            <div className="spinner"></div>
            <h2>Generating Your Training Session</h2>
            <p>Creating a personalized {userLevel} {userStyle}-style workout...</p>
          </div>
        </div>
      )}

      {mode === 'session' && currentSession && (
        <SessionPlayer
          session={currentSession}
          onSessionComplete={handleSessionComplete}
          onSessionExit={handleSessionExit}
          onWorkoutComplete={handleWorkoutComplete}
        />
      )}

      {mode === 'results' && analysisResult && (
        <div className="results-overlay">
          <AnalysisResults result={analysisResult} onClose={handleCloseResults} />
        </div>
      )}

      {isAnalyzing && (
        <div className="analyzing-overlay">
          <div className="analyzing-message">
            <div className="spinner"></div>
            <p>Analyzing your form...</p>
          </div>
        </div>
      )}

      {showApiKeyInput && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Enter Anthropic API Key</h2>
            <p className="modal-description">
              Your API key is needed to generate personalized workouts and analyze your form.
              Get your key at{' '}
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                console.anthropic.com
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="api-key-input"
            />
            <div className="modal-actions">
              <button onClick={handleApiKeySubmit} className="btn btn-primary">
                Continue
              </button>
              <button onClick={() => setShowApiKeyInput(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
            <p className="note">
              Note: Your API key is stored only in your browser session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
