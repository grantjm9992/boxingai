import Anthropic from '@anthropic-ai/sdk';
import type { BoxingStyle } from '../data/boxingMoves';
import { styleDescriptions } from '../data/boxingMoves';
import type { SkillLevel, TrainingSession } from '../types/training';
import { TARGET_SESSION_DURATION, DEFAULT_REPETITIONS } from '../types/training';

export async function generateTrainingSession(
  style: BoxingStyle,
  level: SkillLevel,
  apiKey: string
): Promise<TrainingSession> {
  const client = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const styleDescription = styleDescriptions[style];

  const prompt = `You are an expert boxing coach creating a personalized 30-minute training session.

**User Profile:**
- Boxing Style: ${style.toUpperCase()}
- Style Characteristics: ${styleDescription}
- Skill Level: ${level.toUpperCase()}

**Session Requirements:**
- Total Duration: ~${TARGET_SESSION_DURATION} minutes
- Create 3-5 progressive workouts that build on each other
- Each workout should have ${DEFAULT_REPETITIONS} repetitions
- Focus on technique progression (e.g., Jab → Jab-Cross → Jab-Cross-Hook)
- **CRITICAL: Round duration MUST be 120-180 seconds (2-3 minutes). Prefer 120 seconds. NEVER exceed 180 seconds.**

**Skill Level Guidelines:**
${level === 'beginner' ? `
- Focus on fundamental techniques
- Rounds: 120 seconds (2 minutes) with adequate rest (60-90 seconds)
- Simple combinations (1-2 punch sequences)
- Emphasis on form and basic footwork
` : level === 'intermediate' ? `
- Mix of fundamentals and combinations
- Rounds: 120-150 seconds (2-2.5 minutes) with normal rest (60 seconds)
- Complex combinations (3-4 punch sequences)
- Include defensive movements
` : `
- Advanced combinations and techniques
- Rounds: 150-180 seconds (2.5-3 minutes) with shorter rest (45-60 seconds)
- Complex combinations with defensive counters
- High pace and variety
`}

**Output Format (JSON):**
{
  "sessionName": "Descriptive session name",
  "sessionDescription": "Brief overview of the session focus",
  "workouts": [
    {
      "name": "Workout name (e.g., 'Jab Fundamentals')",
      "description": "What this workout focuses on",
      "focus": ["Primary technique", "Secondary technique"],
      "roundDuration": <seconds>,
      "restDuration": <seconds>,
      "rounds": <number>,
      "calloutInterval": <seconds between callouts, 2-4 recommended>
    },
    // ... more workouts
  ]
}

Create a progressive, engaging session that matches the ${style} style and ${level} level.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);

        // Create the training session with enforced duration limits
        const session: TrainingSession = {
          id: `session-${Date.now()}`,
          name: result.sessionName,
          description: result.sessionDescription,
          style,
          level,
          totalDuration: calculateTotalDuration(result.workouts),
          workouts: result.workouts.map((w: any, index: number) => ({
            id: `workout-${Date.now()}-${index}`,
            name: w.name,
            description: w.description,
            focus: w.focus,
            // Enforce max 180 seconds (3 minutes), min 60 seconds
            roundDuration: Math.min(180, Math.max(60, w.roundDuration)),
            restDuration: w.restDuration,
            rounds: w.rounds,
            calloutInterval: w.calloutInterval,
            repetitions: DEFAULT_REPETITIONS,
          })),
          generatedAt: new Date(),
        };

        return session;
      }
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Workout generation error:', error);
    throw error;
  }
}

function calculateTotalDuration(workouts: any[]): number {
  return workouts.reduce((total: number, workout: any) => {
    const workoutTime = (workout.roundDuration * workout.rounds +
                         workout.restDuration * (workout.rounds - 1)) / 60;
    return total + workoutTime * DEFAULT_REPETITIONS;
  }, 0);
}

// Fallback pre-generated sessions if AI generation fails
export function getDefaultSession(style: BoxingStyle, level: SkillLevel): TrainingSession {
  const sessions = {
    beginner: {
      name: 'Beginner Fundamentals',
      description: 'Master the basics with focused jab and cross practice',
      workouts: [
        {
          id: 'workout-1',
          name: 'Jab Fundamentals',
          description: 'Learn proper jab technique and timing',
          focus: ['Jab'],
          roundDuration: 120,
          restDuration: 60,
          rounds: 2,
          calloutInterval: 3,
          repetitions: DEFAULT_REPETITIONS,
        },
        {
          id: 'workout-2',
          name: 'Jab-Cross Combination',
          description: 'Combine jab and cross for your first combo',
          focus: ['Jab', 'Cross'],
          roundDuration: 150,
          restDuration: 60,
          rounds: 2,
          calloutInterval: 3,
          repetitions: DEFAULT_REPETITIONS,
        },
        {
          id: 'workout-3',
          name: 'Three-Punch Combo',
          description: 'Add the lead hook to your arsenal',
          focus: ['Jab', 'Cross', 'Lead Hook'],
          roundDuration: 180,
          restDuration: 60,
          rounds: 2,
          calloutInterval: 3,
          repetitions: DEFAULT_REPETITIONS,
        },
      ],
    },
    intermediate: {
      name: 'Intermediate Power Building',
      description: 'Develop power and combination fluidity',
      workouts: [
        {
          id: 'workout-1',
          name: 'Power Combinations',
          description: 'Focus on generating power through rotation',
          focus: ['Cross', 'Lead Hook', 'Rear Hook'],
          roundDuration: 180,
          restDuration: 60,
          rounds: 3,
          calloutInterval: 3,
          repetitions: DEFAULT_REPETITIONS,
        },
        {
          id: 'workout-2',
          name: 'Defensive Counters',
          description: 'Slip and counter with combinations',
          focus: ['Slip', 'Roll', 'Counter Punching'],
          roundDuration: 180,
          restDuration: 60,
          rounds: 3,
          calloutInterval: 3,
          repetitions: DEFAULT_REPETITIONS,
        },
      ],
    },
    advanced: {
      name: 'Advanced Technical Session',
      description: 'High-intensity combinations with defensive flow',
      workouts: [
        {
          id: 'workout-1',
          name: 'Complex Combinations',
          description: 'Multi-punch sequences with feints',
          focus: ['Combinations', 'Feints', 'Angles'],
          roundDuration: 180,
          restDuration: 45,
          rounds: 3,
          calloutInterval: 2,
          repetitions: DEFAULT_REPETITIONS,
        },
        {
          id: 'workout-2',
          name: 'Pressure Fighting',
          description: 'Continuous combinations with movement',
          focus: ['Pressure', 'Body Work', 'Cut Off'],
          roundDuration: 180,
          restDuration: 45,
          rounds: 3,
          calloutInterval: 2,
          repetitions: DEFAULT_REPETITIONS,
        },
      ],
    },
  };

  const sessionTemplate = sessions[level];
  const totalDuration = sessionTemplate.workouts.reduce((total, workout) => {
    const workoutTime = (workout.roundDuration * workout.rounds +
                         workout.restDuration * (workout.rounds - 1)) / 60;
    return total + workoutTime * DEFAULT_REPETITIONS;
  }, 0);

  return {
    id: `session-${Date.now()}`,
    name: sessionTemplate.name,
    description: sessionTemplate.description,
    style,
    level,
    totalDuration,
    workouts: sessionTemplate.workouts,
    generatedAt: new Date(),
  };
}
