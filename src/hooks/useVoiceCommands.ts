import { useEffect, useRef, useState } from 'react';

export function useVoiceCommands() {
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
    }
  }, []);

  const speak = (text: string, options?: { pitch?: number; rate?: number; volume?: number }) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options?.pitch ?? 1;
    utterance.rate = options?.rate ?? 1.1; // Slightly faster for urgency
    utterance.volume = options?.volume ?? 1;

    synthRef.current.speak(utterance);
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return { speak, cancel, isSupported };
}
