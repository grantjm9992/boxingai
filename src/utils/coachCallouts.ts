import type { BoxingMove } from '../data/boxingMoves';

// Common boxing combinations that flow naturally
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

// Defensive patterns
const DEFENSIVE_PATTERNS = [
  ['Slip Left', 'Slip Right'],
  ['Roll', 'Lead Hook'],
  ['Duck', 'Cross'],
  ['Parry', 'Cross'],
  ['Block High', 'Body Cross'],
];

// Power patterns for intensity bursts
const POWER_PATTERNS = [
  ['Lead Hook', 'Rear Hook', 'Lead Hook'],
  ['Cross', 'Lead Hook', 'Cross'],
  ['Overhand Right', 'Lead Hook'],
  ['Lead Uppercut', 'Rear Uppercut'],
];

export class CoachCalloutSystem {
  private availableMoves: BoxingMove[];
  private lastPattern: string[] = [];
  private calloutCount = 0;

  constructor(moves: BoxingMove[]) {
    this.availableMoves = moves;
  }

  getNextCallout(): string {
    this.calloutCount++;

    // 70% of the time, use combination patterns
    if (Math.random() < 0.7) {
      return this.getComboPattern();
    }

    // 20% of the time, use defensive patterns
    if (Math.random() < 0.66) { // 0.66 of remaining 30% = ~20% total
      return this.getDefensivePattern();
    }

    // 10% of the time, single move
    return this.getSingleMove();
  }

  private getComboPattern(): string {
    // Every 6-8 callouts, throw in a power pattern
    if (this.calloutCount % 7 === 0) {
      const pattern = this.selectRandomPattern(POWER_PATTERNS);
      return this.formatPattern(pattern);
    }

    const pattern = this.selectRandomPattern(COMBO_PATTERNS);
    return this.formatPattern(pattern);
  }

  private getDefensivePattern(): string {
    const pattern = this.selectRandomPattern(DEFENSIVE_PATTERNS);
    return this.formatPattern(pattern);
  }

  private getSingleMove(): string {
    const move = this.availableMoves[Math.floor(Math.random() * this.availableMoves.length)];
    return move.name;
  }

  private selectRandomPattern(patterns: string[][]): string[] {
    // Try to avoid repeating the same pattern twice in a row
    let pattern: string[];
    let attempts = 0;

    do {
      pattern = patterns[Math.floor(Math.random() * patterns.length)];
      attempts++;
    } while (
      attempts < 5 &&
      this.lastPattern.length > 0 &&
      this.arraysEqual(pattern, this.lastPattern)
    );

    this.lastPattern = pattern;
    return pattern;
  }

  private formatPattern(moves: string[]): string {
    // Filter to only include moves that are available in the current style
    const availableMoveNames = this.availableMoves.map(m => m.name);
    const validMoves = moves.filter(m => availableMoveNames.includes(m));

    // If no valid moves, fall back to single move
    if (validMoves.length === 0) {
      return this.getSingleMove();
    }

    // Return the combo as a single string
    if (validMoves.length === 1) {
      return validMoves[0];
    }

    // For combinations, join with dashes
    return validMoves.join(' - ');
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, idx) => val === b[idx]);
  }

  reset() {
    this.lastPattern = [];
    this.calloutCount = 0;
  }
}
