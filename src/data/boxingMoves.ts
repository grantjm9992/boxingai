export type MoveType = 'punch' | 'defense' | 'combination';

export interface BoxingMove {
  name: string;
  type: MoveType;
  description: string;
  styles: BoxingStyle[];
}

export type BoxingStyle = 'mexican' | 'american' | 'cuban' | 'soviet' | 'universal';

export const boxingMoves: BoxingMove[] = [
  // Punches
  { name: 'Jab', type: 'punch', description: 'Quick straight punch with lead hand', styles: ['universal'] },
  { name: 'Cross', type: 'punch', description: 'Straight punch with rear hand', styles: ['universal'] },
  { name: 'Lead Hook', type: 'punch', description: 'Hook with lead hand', styles: ['universal'] },
  { name: 'Rear Hook', type: 'punch', description: 'Hook with rear hand', styles: ['universal'] },
  { name: 'Lead Uppercut', type: 'punch', description: 'Uppercut with lead hand', styles: ['universal'] },
  { name: 'Rear Uppercut', type: 'punch', description: 'Uppercut with rear hand', styles: ['universal'] },
  { name: 'Body Jab', type: 'punch', description: 'Jab to the body', styles: ['mexican', 'soviet', 'universal'] },
  { name: 'Body Cross', type: 'punch', description: 'Cross to the body', styles: ['mexican', 'soviet', 'universal'] },
  { name: 'Overhand Right', type: 'punch', description: 'Looping power punch over guard', styles: ['american', 'mexican', 'universal'] },
  { name: 'Shovel Hook', type: 'punch', description: 'Hybrid uppercut-hook to body', styles: ['mexican', 'universal'] },

  // Defense
  { name: 'Slip Left', type: 'defense', description: 'Head movement to the left', styles: ['universal'] },
  { name: 'Slip Right', type: 'defense', description: 'Head movement to the right', styles: ['universal'] },
  { name: 'Duck', type: 'defense', description: 'Bend at knees to avoid punch', styles: ['universal'] },
  { name: 'Roll', type: 'defense', description: 'Circular head movement under punches', styles: ['mexican', 'universal'] },
  { name: 'Block High', type: 'defense', description: 'Gloves up to block head shots', styles: ['universal'] },
  { name: 'Block Low', type: 'defense', description: 'Elbows down to block body shots', styles: ['universal'] },
  { name: 'Parry', type: 'defense', description: 'Deflect punch with hand', styles: ['cuban', 'soviet', 'universal'] },
  { name: 'Pull Back', type: 'defense', description: 'Lean back to avoid punch', styles: ['american', 'universal'] },
  { name: 'Shoulder Roll', type: 'defense', description: 'Defensive shoulder rotation', styles: ['american', 'universal'] },
  { name: 'Step Back', type: 'defense', description: 'Move backwards out of range', styles: ['cuban', 'soviet', 'universal'] },

  // Combinations
  { name: 'One-Two', type: 'combination', description: 'Jab-Cross', styles: ['universal'] },
  { name: 'One-Two-Hook', type: 'combination', description: 'Jab-Cross-Lead Hook', styles: ['universal'] },
  { name: 'Double Jab-Cross', type: 'combination', description: 'Jab-Jab-Cross', styles: ['cuban', 'soviet', 'universal'] },
  { name: 'Hook-Cross-Hook', type: 'combination', description: 'Lead Hook-Cross-Rear Hook', styles: ['mexican', 'universal'] },
  { name: 'Body-Head', type: 'combination', description: 'Body shot followed by head shot', styles: ['mexican', 'universal'] },
];

export const styleDescriptions: Record<BoxingStyle, string> = {
  mexican: 'Aggressive pressure fighting with heavy body punching and head movement',
  american: 'Versatile style mixing power punching with defensive shoulder rolls',
  cuban: 'Technical amateur-based style emphasizing footwork, distance, and counter-punching',
  soviet: 'Systematic approach with emphasis on jabs, straight punches, and ring control',
  universal: 'Fundamental techniques used across all styles',
};

export function getMovesForStyle(style: BoxingStyle): BoxingMove[] {
  return boxingMoves.filter(move =>
    move.styles.includes(style) || move.styles.includes('universal')
  );
}

export function getRandomMove(moves: BoxingMove[]): BoxingMove {
  return moves[Math.floor(Math.random() * moves.length)];
}
