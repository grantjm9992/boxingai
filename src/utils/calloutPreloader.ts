import type { BoxingMove } from '../data/boxingMoves';

// All possible combination patterns from CoachCalloutSystem
const COMBO_PATTERNS = [
  ['Jab', 'Cross'],
  ['Jab', 'Cross', 'Lead Hook'],
  ['Jab', 'Cross', 'Lead Hook', 'Cross'],
  ['Double Jab', 'Cross'],
  ['Jab', 'Body Cross'],
  ['Jab', 'Cross', 'Lead Uppercut'],
  ['Lead Hook', 'Cross', 'Lead Hook'],
  ['Jab', 'Slip Right', 'Cross'],
  ['Jab', 'Cross', 'Roll', 'Lead Hook'],
  ['Body Jab', 'Body Cross', 'Lead Hook'],
  ['Jab', 'Cross', 'Duck', 'Rear Uppercut'],
  ['Double Jab', 'Cross', 'Lead Hook'],
  ['Lead Hook', 'Cross', 'Rear Hook'],
  ['Jab', 'Slip Left', 'Lead Hook'],
];

const DEFENSIVE_PATTERNS = [
  ['Slip Left', 'Slip Right'],
  ['Roll', 'Lead Hook'],
  ['Duck', 'Cross'],
  ['Parry', 'Cross'],
  ['Block High', 'Body Cross'],
];

const POWER_PATTERNS = [
  ['Lead Hook', 'Rear Hook', 'Lead Hook'],
  ['Cross', 'Lead Hook', 'Cross'],
  ['Overhand Right', 'Lead Hook'],
  ['Lead Uppercut', 'Rear Uppercut'],
];

/**
 * Generates all possible callouts that might be used during a workout
 * @param availableMoves The moves available for the current boxing style
 * @param maxRounds Maximum number of rounds (for round announcements)
 * @returns Array of all callout strings to pre-generate
 */
export function generateAllCallouts(
  availableMoves: BoxingMove[],
  maxRounds: number = 12
): string[] {
  const callouts = new Set<string>();

  // Round announcements
  for (let i = 1; i <= maxRounds; i++) {
    callouts.add(`Round ${i}! Fight!`);
  }

  // Rest period
  callouts.add('Rest!');
  callouts.add('Time!');

  // All individual moves
  availableMoves.forEach(move => {
    callouts.add(move.name);
  });

  const availableMoveNames = availableMoves.map(m => m.name);

  // Helper to add pattern callouts
  const addPatterns = (patterns: string[][]) => {
    patterns.forEach(pattern => {
      const validMoves = pattern.filter(m => availableMoveNames.includes(m));
      if (validMoves.length > 0) {
        if (validMoves.length === 1) {
          callouts.add(validMoves[0]);
        } else {
          callouts.add(validMoves.join(' - '));
        }
      }
    });
  };

  // Add all combination patterns
  addPatterns(COMBO_PATTERNS);
  addPatterns(DEFENSIVE_PATTERNS);
  addPatterns(POWER_PATTERNS);

  return Array.from(callouts);
}

/**
 * Generates callouts specific to a workout configuration
 * @param availableMoves The moves available for the current boxing style
 * @param rounds Number of rounds in the workout
 * @returns Array of callout strings to pre-generate for this specific workout
 */
export function generateWorkoutCallouts(
  availableMoves: BoxingMove[],
  rounds: number
): string[] {
  return generateAllCallouts(availableMoves, rounds);
}
