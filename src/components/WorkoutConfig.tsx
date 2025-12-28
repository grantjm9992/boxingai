import { useState } from 'react';
import { BoxingStyle, styleDescriptions } from '../data/boxingMoves';

export interface WorkoutSettings {
  roundDuration: number;
  restDuration: number;
  rounds: number;
  calloutInterval: number;
  style: BoxingStyle;
}

interface WorkoutConfigProps {
  onStartWorkout: (settings: WorkoutSettings) => void;
  onStartAnalysis: (settings: WorkoutSettings) => void;
}

export function WorkoutConfig({ onStartWorkout, onStartAnalysis }: WorkoutConfigProps) {
  const [settings, setSettings] = useState<WorkoutSettings>({
    roundDuration: 180, // 3 minutes
    restDuration: 60, // 1 minute
    rounds: 3,
    calloutInterval: 3, // 3 seconds
    style: 'universal',
  });

  const updateSetting = <K extends keyof WorkoutSettings>(
    key: K,
    value: WorkoutSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="workout-config">
      <h1>AI Boxing Coach</h1>
      <p className="subtitle">Train smarter with AI-powered coaching and real-time feedback</p>

      <div className="config-section">
        <h2>Boxing Style</h2>
        <select
          value={settings.style}
          onChange={(e) => updateSetting('style', e.target.value as BoxingStyle)}
          className="select-input"
        >
          <option value="universal">Universal (All Styles)</option>
          <option value="mexican">Mexican Style</option>
          <option value="american">American Style</option>
          <option value="cuban">Cuban Style</option>
          <option value="soviet">Soviet Style</option>
        </select>
        <p className="style-description">{styleDescriptions[settings.style]}</p>
      </div>

      <div className="config-section">
        <h2>Workout Settings</h2>

        <div className="setting-item">
          <label>
            Number of Rounds: {settings.rounds}
            <input
              type="range"
              min="1"
              max="12"
              value={settings.rounds}
              onChange={(e) => updateSetting('rounds', parseInt(e.target.value))}
              className="range-input"
            />
          </label>
        </div>

        <div className="setting-item">
          <label>
            Round Duration: {Math.floor(settings.roundDuration / 60)}:{(settings.roundDuration % 60).toString().padStart(2, '0')}
            <input
              type="range"
              min="60"
              max="300"
              step="30"
              value={settings.roundDuration}
              onChange={(e) => updateSetting('roundDuration', parseInt(e.target.value))}
              className="range-input"
            />
          </label>
        </div>

        <div className="setting-item">
          <label>
            Rest Duration: {settings.restDuration}s
            <input
              type="range"
              min="30"
              max="120"
              step="15"
              value={settings.restDuration}
              onChange={(e) => updateSetting('restDuration', parseInt(e.target.value))}
              className="range-input"
            />
          </label>
        </div>

        <div className="setting-item">
          <label>
            Move Callout Interval: {settings.calloutInterval}s
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={settings.calloutInterval}
              onChange={(e) => updateSetting('calloutInterval', parseInt(e.target.value))}
              className="range-input"
            />
          </label>
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={() => onStartWorkout(settings)}
          className="btn btn-primary btn-large"
        >
          Start Workout
        </button>
        <button
          onClick={() => onStartAnalysis(settings)}
          className="btn btn-secondary btn-large"
        >
          Record & Analyze Form
        </button>
      </div>
    </div>
  );
}
