import { useState, useRef, useEffect } from 'react';

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob, frames: string[]) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export function VideoRecorder({ onRecordingComplete, isRecording, onToggleRecording }: VideoRecorderProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const framesRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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
      setError('');
    } catch (err) {
      setError('Failed to access camera. Please grant permission.');
      console.error('Camera error:', err);
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

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (mediaRecorderRef.current?.state === 'recording') {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
      if (!streamRef.current) return;
    }

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

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete(videoBlob, framesRef.current);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Capture a frame every 0.5 seconds for analysis
      frameIntervalRef.current = window.setInterval(captureFrame, 500);
    } catch (err) {
      setError('Failed to start recording');
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

  return (
    <div className="video-recorder">
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

      {error && <div className="error">{error}</div>}

      {hasPermission && (
        <div className="recorder-controls">
          <button
            onClick={onToggleRecording}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      )}
    </div>
  );
}
