/**
 * ElevenLabs Text-to-Speech Service
 * Provides realistic, aggressive voice synthesis for boxing coach callouts
 */

// Voice IDs for different aggressive male voices
export const COACH_VOICES = {
  COACH: 'dbcih6CX6V58wprWOdS8', // User's preferred coach voice - DEFAULT
  ADAM: 'pNInz6obpgDQGcFmaJgB', // Deep, energetic
  JOSH: 'TxGEqnHWrfWFTfGW9XjX', // Deep, resonant - sports commentator style
  ANTONI: 'ErXwobaYiN019PkySvjV', // Well-rounded, clear
  CALLUM: 'N2lVS1w4EtoT3dr4eOWO', // Masculine, hoarse
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

// Audio cache for pre-generated callouts
const audioCache = new Map<string, Blob>();

/**
 * Generates a cache key for the given text and voice
 */
function getCacheKey(text: string, voiceId: CoachVoice): string {
  return `${voiceId}:${text.toLowerCase().trim()}`;
}

/**
 * Generates speech audio from text using ElevenLabs API (with caching)
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
  const voiceId = options.voiceId || COACH_VOICES.COACH;
  const cacheKey = getCacheKey(text, voiceId);

  // Check cache first
  const cached = audioCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate new audio
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

  const audioBlob = await response.blob();

  // Cache the result
  audioCache.set(cacheKey, audioBlob);

  return audioBlob;
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

/**
 * Pre-generates and caches multiple callouts in parallel
 * @param callouts Array of text callouts to pre-generate
 * @param apiKey ElevenLabs API key
 * @param options Voice options
 * @returns Promise that resolves when all callouts are cached
 */
export async function preGenerateCallouts(
  callouts: string[],
  apiKey: string,
  options: ElevenLabsTTSOptions = {}
): Promise<void> {
  // Generate all callouts in parallel
  const promises = callouts.map(text =>
    generateSpeech(text, apiKey, options).catch(error => {
      console.warn(`Failed to pre-generate callout "${text}":`, error);
      return null;
    })
  );

  await Promise.all(promises);
}

/**
 * Clears the audio cache (useful for switching voices or freeing memory)
 */
export function clearCache(): void {
  audioCache.clear();
}

/**
 * Gets the current cache size (number of cached callouts)
 */
export function getCacheSize(): number {
  return audioCache.size;
}
