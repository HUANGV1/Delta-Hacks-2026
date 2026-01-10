// Pet evolution stages with distinct characteristics
export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder' | 'legendary';

export type PetMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'sad' | 'neglected';

export type EnvironmentType = 'meadow' | 'space' | 'cozy' | 'beach';

export type PetType = 'phoenix' | 'dragon' | 'spirit' | 'nature';

export type ScreenType = 'home' | 'activity' | 'evolution' | 'rewards' | 'challenges' | 'profile';

export interface PetState {
  name: string;
  type: PetType;
  stage: PetStage;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  mood: PetMood;
  moodPoints: number; // 0-100, decays over time without activity
  totalStepsAllTime: number;
  miningEfficiency: number; // Multiplier based on evolution stage
  lastFedTime: number; // Timestamp
  lastPlayedTime: number;
  hatched: boolean;
  evolutionAnimation: boolean;
  environment: EnvironmentType;
  hunger: number; // 0-100
  energy: number; // 0-100
  happiness: number; // 0-100
  health: number; // 0-100
  unlockables: string[];
  cosmetics: {
    accessory?: string;
    background?: string;
    trail?: string;
  };
}

export interface UserStats {
  stepsToday: number;
  stepsThisWeek: number;
  stepsThisMonth: number;
  lastStepUpdate: string; // ISO date string
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string
  dailyGoal: number;
  weeklyGoal: number;
  dailyHistory: { date: string; steps: number }[];
  weeklyHistory: { week: string; steps: number }[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  target: number;
}

export interface Challenge {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  reward: number;
  expiresAt: number;
  completed: boolean;
  claimed: boolean;
}

export interface CoinState {
  balance: number;
  pendingReward: number;
  totalEarned: number;
  lastClaimTime: number;
  miningRate: number; // Coins per 1000 steps, affected by pet level
  miningHistory: { date: string; amount: number }[];
}

export interface GameState {
  pet: PetState;
  stats: UserStats;
  coins: CoinState;
  challenges: Challenge[];
  initialized: boolean;
  lastUpdateTime: number;
  currentScreen: ScreenType;
  notifications: Notification[];
  settings: AppSettings;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'evolution' | 'reward' | 'challenge' | 'reminder';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface AppSettings {
  notifications: boolean;
  soundEffects: boolean;
  haptics: boolean;
  theme: 'dark' | 'light' | 'auto';
  stepSource: 'manual' | 'healthkit' | 'googlefit';
  language: string;
}

// Evolution requirements
export const EVOLUTION_REQUIREMENTS: Record<PetStage, { level: number; totalSteps: number }> = {
  egg: { level: 0, totalSteps: 0 },
  baby: { level: 1, totalSteps: 500 },
  child: { level: 5, totalSteps: 5000 },
  teen: { level: 15, totalSteps: 25000 },
  adult: { level: 30, totalSteps: 100000 },
  elder: { level: 50, totalSteps: 500000 },
  legendary: { level: 75, totalSteps: 1000000 },
};

export const STAGE_NAMES: Record<PetStage, string> = {
  egg: 'Dormant Egg',
  baby: 'Hatchling',
  child: 'Young',
  teen: 'Adolescent',
  adult: 'Mature',
  elder: 'Elder',
  legendary: 'Legendary',
};

// Mining efficiency by stage
export const MINING_EFFICIENCY: Record<PetStage, number> = {
  egg: 0,
  baby: 1.0,
  child: 1.5,
  teen: 2.0,
  adult: 3.0,
  elder: 4.0,
  legendary: 6.0,
};

// Experience curve - steps needed to level up (cumulative feeling)
export function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level));
}

// Mood thresholds
export const MOOD_THRESHOLDS: Record<PetMood, number> = {
  ecstatic: 90,
  happy: 70,
  content: 50,
  neutral: 30,
  sad: 15,
  neglected: 0,
};

// Step caps to prevent abuse
export const DAILY_STEP_CAP = 30000;
export const HOURLY_STEP_CAP = 5000;
export const STEPS_PER_EXPERIENCE = 10; // 10 steps = 1 XP
export const BASE_COINS_PER_1000_STEPS = 10;

// Pet care costs
export const CARE_COSTS = {
  feed: 5,
  play: 3,
  heal: 10,
  boost: 15,
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Take your first 100 steps', icon: '👶', target: 100 },
  { id: 'walker', name: 'Daily Walker', description: 'Reach 5,000 steps in a day', icon: '🚶', target: 5000 },
  { id: 'runner', name: 'Runner', description: 'Reach 10,000 steps in a day', icon: '🏃', target: 10000 },
  { id: 'marathon', name: 'Marathon', description: 'Walk 42,000 steps total', icon: '🎽', target: 42000 },
  { id: 'streak_3', name: 'Consistent', description: 'Maintain a 3-day streak', icon: '🔥', target: 3 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', target: 7 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💫', target: 30 },
  { id: 'hatch', name: 'New Beginning', description: 'Hatch your first egg', icon: '🐣', target: 1 },
  { id: 'evolve_child', name: 'Growing Up', description: 'Evolve to Child stage', icon: '🌱', target: 1 },
  { id: 'evolve_adult', name: 'Full Grown', description: 'Evolve to Adult stage', icon: '🦅', target: 1 },
  { id: 'evolve_legendary', name: 'Legendary', description: 'Reach Legendary status', icon: '🐉', target: 1 },
  { id: 'coins_100', name: 'Penny Saver', description: 'Earn 100 StepCoins', icon: '🪙', target: 100 },
  { id: 'coins_1000', name: 'Coin Collector', description: 'Earn 1,000 StepCoins', icon: '💰', target: 1000 },
  { id: 'coins_10000', name: 'Wealthy', description: 'Earn 10,000 StepCoins', icon: '🤑', target: 10000 },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', icon: '⭐', target: 10 },
  { id: 'level_25', name: 'Dedicated', description: 'Reach level 25', icon: '🌟', target: 25 },
  { id: 'level_50', name: 'Expert', description: 'Reach level 50', icon: '✨', target: 50 },
];
