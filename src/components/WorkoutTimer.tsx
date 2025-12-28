import { useState, useEffect, useRef } from 'react';
import type { BoxingMove, BoxingStyle } from '../data/boxingMoves';
import { getMovesForStyle, getRandomMove } from '../data/boxingMoves';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

interface WorkoutConfig {
  roundDuration: number; // seconds
  restDuration: number; // seconds
  rounds: number;
  calloutInterval: number; // seconds between move callouts
  style: BoxingStyle;
  enableRecording: boolean;
}

interface WorkoutTimerProps {
  config: WorkoutConfig;
  onWorkoutComplete: (frames: string[]) => void;
  onWorkoutStop: () => void;
}

type WorkoutState = 'ready' | 'round' | 'rest' | 'complete';

export function WorkoutTimer({ config, onWorkoutComplete, onWorkoutStop }: WorkoutTimerProps) {
  const [state, setState] = useState<WorkoutState>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentMove, setCurrentMove] = useState<BoxingMove | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const { speak, isSupported } = useVoiceCommands();

  const calloutTimerRef = useRef<number | null>(null);
  const mainTimerRef = useRef<number | null>(null);
  const availableMovesRef = useRef<BoxingMove[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const framesRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    availableMovesRef.current = getMovesForStyle(config.style);
  }, [config.style]);

  useEffect(() => {
    if (config.enableRecording) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [config.enableRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      framesRef.current.push(frameData);
    }
  };

  const startRecording = () => {
    if (!streamRef.current || !config.enableRecording) return;

    chunksRef.current = [];
    framesRef.current = [];

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Capture a frame every 0.5 seconds for analysis
      frameIntervalRef.current = window.setInterval(captureFrame, 500);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const calloutRandomMove = () => {
    const move = getRandomMove(availableMovesRef.current);
    setCurrentMove(move);
    speak(move.name, { rate: 1.2, pitch: 1.1 });
  };

  const startRound = () => {
    setState('round');
    setTimeRemaining(config.roundDuration);
    speak(`Round ${currentRound}! Fight!`, { rate: 1.3, pitch: 1.2 });

    // Start recording on first round
    if (currentRound === 1 && config.enableRecording) {
      startRecording();
    }

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

    // Stop recording and pass frames
    if (config.enableRecording) {
      stopRecording();
      onWorkoutComplete(framesRef.current);
    } else {
      onWorkoutComplete([]);
    }
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

    if (config.enableRecording) {
      stopRecording();
    }

    setState('ready');
    setCurrentRound(1);
    setCurrentMove(null);
    framesRef.current = [];
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

  const isRecording = state === 'round' || state === 'rest';

  return (
    <div className="workout-timer">
      {config.enableRecording && (
        <>
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-preview"
            />
            {isRecording && <div className="recording-indicator">● REC</div>}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}

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

      {config.enableRecording && !hasPermission && state === 'ready' && (
        <div className="warning">
          Camera permission required for form analysis
        </div>
      )}
    </div>
  );
}
