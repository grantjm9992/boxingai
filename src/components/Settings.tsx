import { useState, useEffect } from 'react';

export interface UserSettings {
  voiceVolume: number; // 0-1
  voiceEnabled: boolean;
  bellSoundEnabled: boolean;
  useElevenLabs: boolean; // false = use Web Speech API
  theme: 'light' | 'dark';
}

const DEFAULT_SETTINGS: UserSettings = {
  voiceVolume: 1.0,
  voiceEnabled: true,
  bellSoundEnabled: true,
  useElevenLabs: true,
  theme: 'light',
};

const SETTINGS_STORAGE_KEY = 'boxingai_settings';

export function loadSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="settings-content">
          {/* Voice Settings */}
          <div className="settings-section">
            <h3>🔊 Voice Settings</h3>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) => updateSetting('voiceEnabled', e.target.checked)}
                />
                <span>Enable voice commands</span>
              </label>
            </div>

            {settings.voiceEnabled && (
              <>
                <div className="setting-item">
                  <label>
                    Voice Volume: {Math.round(settings.voiceVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.voiceVolume}
                    onChange={(e) => updateSetting('voiceVolume', parseFloat(e.target.value))}
                    className="range-input"
                  />
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.useElevenLabs}
                      onChange={(e) => updateSetting('useElevenLabs', e.target.checked)}
                    />
                    <span>Use ElevenLabs AI voice (requires API key)</span>
                  </label>
                  {!settings.useElevenLabs && (
                    <p className="setting-note">Using Web Speech API (robotic voice)</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sound Settings */}
          <div className="settings-section">
            <h3>🔔 Sound Settings</h3>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.bellSoundEnabled}
                  onChange={(e) => updateSetting('bellSoundEnabled', e.target.checked)}
                />
                <span>Enable boxing bell sound at round start</span>
              </label>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="settings-section">
            <h3>🎨 Appearance</h3>

            <div className="setting-item">
              <label>Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark')}
                className="select-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark (Coming Soon)</option>
              </select>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="settings-section">
            <button
              onClick={() => {
                if (confirm('Reset all settings to default?')) {
                  setSettings(DEFAULT_SETTINGS);
                }
              }}
              className="btn btn-secondary"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
