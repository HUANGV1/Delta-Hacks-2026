// Game logic constants and utilities

export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder' | 'legendary';
export type PetMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'sad' | 'neglected';

export const EVOLUTION_REQUIREMENTS: Record<PetStage, { level: number; totalSteps: number }> = {
  egg: { level: 0, totalSteps: 0 },
  baby: { level: 1, totalSteps: 500 },
  child: { level: 5, totalSteps: 5000 },
  teen: { level: 15, totalSteps: 25000 },
  adult: { level: 30, totalSteps: 100000 },
  elder: { level: 50, totalSteps: 500000 },
  legendary: { level: 75, totalSteps: 1000000 },
};

export const MINING_EFFICIENCY: Record<PetStage, number> = {
  egg: 0,
  baby: 1.0,
  child: 1.5,
  teen: 2.0,
  adult: 3.0,
  elder: 4.0,
  legendary: 6.0,
};

export const MOOD_THRESHOLDS: Record<PetMood, number> = {
  ecstatic: 90,
  happy: 70,
  content: 50,
  neutral: 30,
  sad: 15,
  neglected: 0,
};

export const STEPS_PER_EXPERIENCE = 10;
export const BASE_COINS_PER_1000_STEPS = 10;
export const DAILY_STEP_CAP = 30000;
export const HOURLY_STEP_CAP = 5000;

export const CARE_COSTS = {
  feed: 5,
  play: 3,
  heal: 10,
  boost: 15,
};

// Calculate experience needed for a level
export function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level));
}

// Calculate mood based on mood points
export function calculateMood(moodPoints: number): PetMood {
  if (moodPoints >= MOOD_THRESHOLDS.ecstatic) return 'ecstatic';
  if (moodPoints >= MOOD_THRESHOLDS.happy) return 'happy';
  if (moodPoints >= MOOD_THRESHOLDS.content) return 'content';
  if (moodPoints >= MOOD_THRESHOLDS.neutral) return 'neutral';
  if (moodPoints >= MOOD_THRESHOLDS.sad) return 'sad';
  return 'neglected';
}

// Calculate coins earned from steps
export function calculateCoins(steps: number, miningEfficiency: number): number {
  const baseCoins = (steps / 1000) * BASE_COINS_PER_1000_STEPS;
  return baseCoins * miningEfficiency;
}

// Check if pet can evolve
export function canEvolve(
  currentStage: PetStage,
  level: number,
  totalSteps: number
): { canEvolve: boolean; nextStage?: PetStage } {
  const stages: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'];
  const currentIndex = stages.indexOf(currentStage);
  
  if (currentIndex === stages.length - 1) {
    return { canEvolve: false }; // Already at max stage
  }
  
  const nextStage = stages[currentIndex + 1];
  const requirements = EVOLUTION_REQUIREMENTS[nextStage];
  
  if (level >= requirements.level && totalSteps >= requirements.totalSteps) {
    return { canEvolve: true, nextStage };
  }
  
  return { canEvolve: false };
}

// Get streak bonus percentage
export function getStreakBonus(streak: number): number {
  return Math.min(streak * 5, 50); // Max 50% bonus
}

