import { useState, useEffect, useRef } from 'react';
import { BoxingMove, BoxingStyle, getMovesForStyle, getRandomMove } from '../data/boxingMoves';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

interface WorkoutConfig {
  roundDuration: number; // seconds
  restDuration: number; // seconds
  rounds: number;
  calloutInterval: number; // seconds between move callouts
  style: BoxingStyle;
}

interface WorkoutTimerProps {
  config: WorkoutConfig;
  onWorkoutComplete: () => void;
  onWorkoutStop: () => void;
}

type WorkoutState = 'ready' | 'round' | 'rest' | 'complete';

export function WorkoutTimer({ config, onWorkoutComplete, onWorkoutStop }: WorkoutTimerProps) {
  const [state, setState] = useState<WorkoutState>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentMove, setCurrentMove] = useState<BoxingMove | null>(null);
  const { speak, isSupported } = useVoiceCommands();

  const calloutTimerRef = useRef<number | null>(null);
  const mainTimerRef = useRef<number | null>(null);
  const availableMovesRef = useRef<BoxingMove[]>([]);

  useEffect(() => {
    availableMovesRef.current = getMovesForStyle(config.style);
  }, [config.style]);

  const calloutRandomMove = () => {
    const move = getRandomMove(availableMovesRef.current);
    setCurrentMove(move);
    speak(move.name, { rate: 1.2, pitch: 1.1 });
  };

  const startRound = () => {
    setState('round');
    setTimeRemaining(config.roundDuration);
    speak(`Round ${currentRound}! Fight!`, { rate: 1.3, pitch: 1.2 });

    // Call out first move immediately
    setTimeout(calloutRandomMove, 1000);

    // Set up regular callouts
    calloutTimerRef.current = window.setInterval(
      calloutRandomMove,
      config.calloutInterval * 1000
    );
  };

  const startRest = () => {
    setState('rest');
    setTimeRemaining(config.restDuration);
    setCurrentMove(null);
    speak('Rest!', { rate: 1.0, pitch: 0.9 });

    if (calloutTimerRef.current) {
      clearInterval(calloutTimerRef.current);
      calloutTimerRef.current = null;
    }
  };

  const completeWorkout = () => {
    setState('complete');
    setCurrentMove(null);
    speak('Workout complete! Great job!', { rate: 1.0, pitch: 1.0 });

    if (calloutTimerRef.current) {
      clearInterval(calloutTimerRef.current);
      calloutTimerRef.current = null;
    }
    if (mainTimerRef.current) {
      clearInterval(mainTimerRef.current);
      mainTimerRef.current = null;
    }

    onWorkoutComplete();
  };

  const stopWorkout = () => {
    if (calloutTimerRef.current) {
      clearInterval(calloutTimerRef.current);
      calloutTimerRef.current = null;
    }
    if (mainTimerRef.current) {
      clearInterval(mainTimerRef.current);
      mainTimerRef.current = null;
    }
    setState('ready');
    setCurrentRound(1);
    setCurrentMove(null);
    onWorkoutStop();
  };

  useEffect(() => {
    if (state === 'round' || state === 'rest') {
      mainTimerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (state === 'round') {
              if (currentRound < config.rounds) {
                startRest();
              } else {
                completeWorkout();
              }
            } else if (state === 'rest') {
              setCurrentRound(prev => prev + 1);
              startRound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (mainTimerRef.current) {
          clearInterval(mainTimerRef.current);
        }
      };
    }
  }, [state, currentRound]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="workout-timer">
      <div className="timer-display">
        <div className="round-info">
          <h2>Round {currentRound} of {config.rounds}</h2>
          <div className="state-badge" data-state={state}>
            {state === 'round' ? 'FIGHT!' : state === 'rest' ? 'REST' : state === 'complete' ? 'COMPLETE' : 'READY'}
          </div>
        </div>

        <div className="time-display">
          {formatTime(timeRemaining)}
        </div>

        {currentMove && (
          <div className="current-move">
            <div className="move-name">{currentMove.name}</div>
            <div className="move-type">{currentMove.type}</div>
          </div>
        )}
      </div>

      <div className="timer-controls">
        {state === 'ready' && (
          <button onClick={startRound} className="btn btn-primary">
            Start Workout
          </button>
        )}
        {(state === 'round' || state === 'rest') && (
          <button onClick={stopWorkout} className="btn btn-danger">
            Stop Workout
          </button>
        )}
        {state === 'complete' && (
          <button onClick={() => { setCurrentRound(1); setState('ready'); }} className="btn btn-primary">
            New Workout
          </button>
        )}
      </div>

      {!isSupported && (
        <div className="warning">
          Voice commands not supported in this browser
        </div>
      )}
    </div>
  );
}
