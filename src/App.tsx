import { useState } from 'react';
import './App.css';
import { WorkoutConfig } from './components/WorkoutConfig';
import type { WorkoutSettings } from './components/WorkoutConfig';
import { WorkoutTimer } from './components/WorkoutTimer';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeBoxingForm } from './services/aiAnalysis';
import type { AnalysisResult } from './services/aiAnalysis';

type AppMode = 'config' | 'workout' | 'results';

function App() {
  const [mode, setMode] = useState<AppMode>('config');
  const [settings, setSettings] = useState<WorkoutSettings | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleStartWorkout = (workoutSettings: WorkoutSettings) => {
    setSettings(workoutSettings);

    if (workoutSettings.enableAnalysis) {
      // Show API key input if analysis is enabled
      setShowApiKeyInput(true);
    } else {
      // Start workout without analysis
      setMode('workout');
    }
  };

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      alert('Please enter your Anthropic API key');
      return;
    }
    setShowApiKeyInput(false);
    setMode('workout');
  };

  const handleWorkoutComplete = async (frames: string[]) => {
    if (!settings) return;

    // If analysis is enabled and we have frames
    if (settings.enableAnalysis && frames.length > 0) {
      setIsAnalyzing(true);

      try {
        const result = await analyzeBoxingForm(frames, settings.style, apiKey);
        setAnalysisResult(result);
        setMode('results');
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed. Please check your API key and try again.');
        setMode('config');
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // No analysis, just return to config
      setMode('config');
      setSettings(null);
    }
  };

  const handleWorkoutStop = () => {
    setMode('config');
    setSettings(null);
  };

  const handleCloseResults = () => {
    setMode('config');
    setAnalysisResult(null);
    setSettings(null);
  };

  return (
    <div className="app">
      {mode === 'config' && (
        <WorkoutConfig onStartWorkout={handleStartWorkout} />
      )}

      {mode === 'workout' && settings && (
        <div className="workout-mode">
          <WorkoutTimer
            config={{
              roundDuration: settings.roundDuration,
              restDuration: settings.restDuration,
              rounds: settings.rounds,
              calloutInterval: settings.calloutInterval,
              style: settings.style,
              enableRecording: settings.enableAnalysis,
            }}
            onWorkoutComplete={handleWorkoutComplete}
            onWorkoutStop={handleWorkoutStop}
          />
          {isAnalyzing && (
            <div className="analyzing-overlay">
              <div className="analyzing-message">
                <div className="spinner"></div>
                <p>Analyzing your form...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'results' && analysisResult && (
        <AnalysisResults result={analysisResult} onClose={handleCloseResults} />
      )}

      {showApiKeyInput && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Enter Anthropic API Key</h2>
            <p className="modal-description">
              Your API key is needed to analyze your boxing form using Claude AI.
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
              Note: Your API key is only stored in your browser session and never sent to any server except Anthropic.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
