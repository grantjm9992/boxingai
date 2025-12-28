import { useState } from 'react';
import './App.css';
import { WorkoutConfig, WorkoutSettings } from './components/WorkoutConfig';
import { WorkoutTimer } from './components/WorkoutTimer';
import { VideoRecorder } from './components/VideoRecorder';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeBoxingForm, AnalysisResult } from './services/aiAnalysis';

type AppMode = 'config' | 'workout' | 'analysis' | 'results';

function App() {
  const [mode, setMode] = useState<AppMode>('config');
  const [settings, setSettings] = useState<WorkoutSettings | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleStartWorkout = (workoutSettings: WorkoutSettings) => {
    setSettings(workoutSettings);
    setMode('workout');
  };

  const handleStartAnalysis = (workoutSettings: WorkoutSettings) => {
    setSettings(workoutSettings);
    setShowApiKeyInput(true);
  };

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      alert('Please enter your Anthropic API key');
      return;
    }
    setShowApiKeyInput(false);
    setMode('analysis');
  };

  const handleWorkoutComplete = () => {
    setMode('config');
    setSettings(null);
  };

  const handleWorkoutStop = () => {
    setMode('config');
    setSettings(null);
  };

  const handleRecordingComplete = async (videoBlob: Blob, frames: string[]) => {
    if (!settings) return;

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
  };

  const handleCloseResults = () => {
    setMode('config');
    setAnalysisResult(null);
    setSettings(null);
  };

  const handleBackToConfig = () => {
    setIsRecording(false);
    setMode('config');
    setSettings(null);
  };

  return (
    <div className="app">
      {mode === 'config' && (
        <WorkoutConfig
          onStartWorkout={handleStartWorkout}
          onStartAnalysis={handleStartAnalysis}
        />
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
            }}
            onWorkoutComplete={handleWorkoutComplete}
            onWorkoutStop={handleWorkoutStop}
          />
        </div>
      )}

      {mode === 'analysis' && settings && (
        <div className="analysis-mode">
          <h2>Form Analysis</h2>
          <p className="instruction">
            Record yourself performing boxing techniques. The AI will analyze your form when you stop recording.
          </p>
          <VideoRecorder
            onRecordingComplete={handleRecordingComplete}
            isRecording={isRecording}
            onToggleRecording={() => setIsRecording(!isRecording)}
          />
          <button onClick={handleBackToConfig} className="btn btn-secondary">
            Back to Config
          </button>
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
