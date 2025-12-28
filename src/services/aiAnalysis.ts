import Anthropic from '@anthropic-ai/sdk';
import type { BoxingStyle } from '../data/boxingMoves';
import { styleDescriptions } from '../data/boxingMoves';

export interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  formFeedback: string;
  styleAdherence: string;
}

// Note: In production, the API key should be handled by a backend server
// This is a client-side implementation for demonstration
export async function analyzeBoxingForm(
  frames: string[],
  style: BoxingStyle,
  apiKey: string
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  const client = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
  });

  // Sample frames evenly (max 5 frames to analyze)
  const sampleSize = Math.min(5, frames.length);
  const step = Math.floor(frames.length / sampleSize);
  const sampledFrames = [];

  for (let i = 0; i < sampleSize; i++) {
    const index = Math.min(i * step, frames.length - 1);
    sampledFrames.push(frames[index]);
  }

  const styleDescription = styleDescriptions[style];

  const prompt = `You are an expert boxing coach analyzing a fighter's form and technique.

The fighter is training in the ${style.toUpperCase()} style, which is characterized by: ${styleDescription}

Analyze the provided images of the fighter performing boxing techniques. Evaluate:

1. **Stance and Guard**: Body positioning, foot placement, hand positioning
2. **Punch Technique**: Form, rotation, weight transfer, extension
3. **Defensive Movement**: Head movement, body positioning, guard maintenance
4. **Style Adherence**: How well they embody the ${style} boxing style
5. **Balance and Footwork**: Weight distribution, foot positioning, movement

Provide your analysis in the following JSON format:
{
  "overallScore": <number 1-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area to improve 1", "area to improve 2", "area to improve 3"],
  "formFeedback": "detailed paragraph about overall form",
  "styleAdherence": "paragraph about how well they're executing the ${style} style"
}

Be specific, constructive, and encouraging. Focus on actionable feedback.`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            ...sampledFrames.map(frame => ({
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/jpeg' as const,
                data: frame.split(',')[1], // Remove data:image/jpeg;base64, prefix
              },
            })),
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw error;
  }
}
