import type { AnalysisResult } from '../services/aiAnalysis';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onClose: () => void;
}

export function AnalysisResults({ result, onClose }: AnalysisResultsProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#22c55e'; // green
    if (score >= 6) return '#eab308'; // yellow
    if (score >= 4) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="analysis-results">
      <div className="results-header">
        <h2>Training Analysis</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="overall-score" style={{ borderColor: getScoreColor(result.overallScore) }}>
        <div className="score-label">Overall Score</div>
        <div className="score-value" style={{ color: getScoreColor(result.overallScore) }}>
          {result.overallScore}/10
        </div>
      </div>

      <div className="feedback-section">
        <h3>Form Feedback</h3>
        <p>{result.formFeedback}</p>
      </div>

      <div className="feedback-section">
        <h3>Style Adherence</h3>
        <p>{result.styleAdherence}</p>
      </div>

      <div className="strengths-section">
        <h3>✓ Strengths</h3>
        <ul>
          {result.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="improvements-section">
        <h3>↑ Areas to Improve</h3>
        <ul>
          {result.improvements.map((improvement, index) => (
            <li key={index}>{improvement}</li>
          ))}
        </ul>
      </div>

      <button onClick={onClose} className="btn btn-primary">
        Close
      </button>
    </div>
  );
}
