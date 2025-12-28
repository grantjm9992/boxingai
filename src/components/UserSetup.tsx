import { useState } from 'react';
import type { BoxingStyle } from '../data/boxingMoves';
import { styleDescriptions } from '../data/boxingMoves';
import type { SkillLevel } from '../types/training';

interface UserSetupProps {
  onComplete: (style: BoxingStyle, level: SkillLevel) => void;
}

export function UserSetup({ onComplete }: UserSetupProps) {
  const [selectedStyle, setSelectedStyle] = useState<BoxingStyle>('universal');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('beginner');

  const handleSubmit = () => {
    onComplete(selectedStyle, selectedLevel);
  };

  return (
    <div className="user-setup">
      <div className="setup-container">
        <h1>Welcome to AI Boxing Coach</h1>
        <p className="setup-subtitle">
          Let's personalize your training experience
        </p>

        <div className="setup-section">
          <h2>Choose Your Boxing Style</h2>
          <div className="style-grid">
            {(['universal', 'mexican', 'american', 'cuban', 'soviet'] as BoxingStyle[]).map(style => (
              <div
                key={style}
                className={`style-card ${selectedStyle === style ? 'selected' : ''}`}
                onClick={() => setSelectedStyle(style)}
              >
                <div className="style-name">{style.charAt(0).toUpperCase() + style.slice(1)}</div>
                <div className="style-desc">{styleDescriptions[style]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <h2>Select Your Skill Level</h2>
          <div className="level-buttons">
            <button
              onClick={() => setSelectedLevel('beginner')}
              className={`btn btn-level ${selectedLevel === 'beginner' ? 'selected' : ''}`}
            >
              <div className="level-name">Beginner</div>
              <div className="level-desc">New to boxing or fundamentals</div>
            </button>
            <button
              onClick={() => setSelectedLevel('intermediate')}
              className={`btn btn-level ${selectedLevel === 'intermediate' ? 'selected' : ''}`}
            >
              <div className="level-name">Intermediate</div>
              <div className="level-desc">Comfortable with basics, building combos</div>
            </button>
            <button
              onClick={() => setSelectedLevel('advanced')}
              className={`btn btn-level ${selectedLevel === 'advanced' ? 'selected' : ''}`}
            >
              <div className="level-name">Advanced</div>
              <div className="level-desc">Experienced, seeking high-intensity training</div>
            </button>
          </div>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary btn-large">
          Start Training
        </button>
      </div>
    </div>
  );
}
