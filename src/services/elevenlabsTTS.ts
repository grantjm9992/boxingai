/**
 * ElevenLabs Text-to-Speech Service
 * Provides realistic, aggressive voice synthesis for boxing coach callouts
 */

// Voice IDs for different aggressive male voices
export const COACH_VOICES = {
  ADAM: 'pNInz6obpgDQGcFmaJgB', // Deep, energetic - DEFAULT
  ANTONI: 'ErXwobaYiN019PkySvjV', // Well-rounded, clear
  ARNOLD: 'VR6AewLTigWG4xSOukaG', // Crisp, strong
} as const;

export type CoachVoice = typeof COACH_VOICES[keyof typeof COACH_VOICES];

interface ElevenLabsTTSOptions {
  voiceId?: CoachVoice;
  stability?: number; // 0-1, higher = more stable/consistent
  similarityBoost?: number; // 0-1, higher = closer to original voice
  style?: number; // 0-1, higher = more expressive/exaggerated
  useSpeakerBoost?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<ElevenLabsTTSOptions, 'voiceId'>> = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.8, // High style for aggressive coaching
  useSpeakerBoost: true,
};

/**
 * Generates speech audio from text using ElevenLabs API
 * @param text The text to convert to speech
 * @param apiKey ElevenLabs API key
 * @param options Voice settings
 * @returns Audio blob ready for playback
 */
export async function generateSpeech(
  text: string,
  apiKey: string,
  options: ElevenLabsTTSOptions = {}
): Promise<Blob> {
  const voiceId = options.voiceId || COACH_VOICES.ADAM;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5', // Fastest model for real-time
        voice_settings: {
          stability: options.stability ?? DEFAULT_OPTIONS.stability,
          similarity_boost: options.similarityBoost ?? DEFAULT_OPTIONS.similarityBoost,
          style: options.style ?? DEFAULT_OPTIONS.style,
          use_speaker_boost: options.useSpeakerBoost ?? DEFAULT_OPTIONS.useSpeakerBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return await response.blob();
}

/**
 * Plays audio from a blob
 * @param audioBlob The audio blob to play
 * @returns Promise that resolves when audio finishes playing
 */
export function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };

    audio.play().catch(reject);
  });
}

/**
 * Speaks text using ElevenLabs with aggressive coach voice
 * @param text The text to speak
 * @param apiKey ElevenLabs API key
 * @param options Voice options
 * @returns Promise that resolves when speech finishes
 */
export async function speak(
  text: string,
  apiKey: string,
  options: ElevenLabsTTSOptions = {}
): Promise<void> {
  const audioBlob = await generateSpeech(text, apiKey, options);
  await playAudio(audioBlob);
}
