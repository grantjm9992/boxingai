import { useEffect, useRef, useState } from 'react';

export function useVoiceCommands() {
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      // Wait for voices to load
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];

        // Prefer English voices
        const englishVoice = voices.find(v =>
          v.lang.startsWith('en-') && !v.lang.includes('GB')
        ) || voices.find(v =>
          v.lang.startsWith('en')
        ) || voices[0];

        voiceRef.current = englishVoice || null;
      };

      // Load voices immediately
      loadVoices();

      // Some browsers require waiting for the voiceschanged event
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
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

    // Use English voice if available
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current.lang;
    } else {
      utterance.lang = 'en-US';
    }

    synthRef.current.speak(utterance);
  };

  const cancel = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return { speak, cancel, isSupported };
}
