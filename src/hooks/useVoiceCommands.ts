import { useEffect, useRef, useState } from 'react';
import * as ElevenLabs from '../services/elevenlabsTTS';

export function useVoiceCommands() {
  const [isSupported, setIsSupported] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

  useEffect(() => {
    // Check if ElevenLabs is available
    if (elevenLabsApiKey) {
      setUseElevenLabs(true);
      setIsSupported(true);
    } else if ('speechSynthesis' in window) {
      // Fallback to Web Speech API
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
  }, [elevenLabsApiKey]);

  const speak = async (text: string, options?: { pitch?: number; rate?: number; volume?: number }) => {
    // Cancel any ongoing speech
    cancel();

    if (useElevenLabs && elevenLabsApiKey) {
      try {
        // Use ElevenLabs for realistic voice
        const audioBlob = await ElevenLabs.generateSpeech(text, elevenLabsApiKey, {
          voiceId: ElevenLabs.COACH_VOICES.ADAM, // Deep, energetic voice
          style: 0.9, // Very expressive for aggressive coaching
        });

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        console.error('ElevenLabs TTS failed, falling back to Web Speech:', error);
        // Fallback to Web Speech API
        speakWithWebSpeech(text, options);
      }
    } else {
      // Use Web Speech API fallback
      speakWithWebSpeech(text, options);
    }
  };

  const speakWithWebSpeech = (text: string, options?: { pitch?: number; rate?: number; volume?: number }) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Aggressive coach settings - faster and higher pitched for urgency
    utterance.pitch = options?.pitch ?? 1.3;
    utterance.rate = options?.rate ?? 1.5;
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
    // Cancel ElevenLabs audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Cancel Web Speech if active
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const preloadCallouts = async (callouts: string[]): Promise<void> => {
    if (useElevenLabs && elevenLabsApiKey) {
      try {
        await ElevenLabs.preGenerateCallouts(callouts, elevenLabsApiKey, {
          voiceId: ElevenLabs.COACH_VOICES.ADAM,
          style: 0.9,
        });
        console.log(`Pre-loaded ${ElevenLabs.getCacheSize()} callouts`);
      } catch (error) {
        console.error('Failed to preload callouts:', error);
      }
    }
    // No preloading needed for Web Speech API
  };

  return { speak, cancel, isSupported, preloadCallouts };
}
