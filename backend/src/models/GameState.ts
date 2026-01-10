import mongoose, { Document, Schema } from 'mongoose';

export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder' | 'legendary';
export type PetMood = 'ecstatic' | 'happy' | 'content' | 'neutral' | 'sad' | 'neglected';
export type EnvironmentType = 'meadow' | 'space' | 'cozy' | 'beach';
export type PetType = 'phoenix' | 'dragon' | 'spirit' | 'nature';

interface PetState {
  name: string;
  type: PetType;
  stage: PetStage;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  mood: PetMood;
  moodPoints: number;
  totalStepsAllTime: number;
  miningEfficiency: number;
  lastFedTime: number;
  lastPlayedTime: number;
  hatched: boolean;
  evolutionAnimation: boolean;
  environment: EnvironmentType;
  hunger: number;
  energy: number;
  happiness: number;
  health: number;
  unlockables: string[];
  cosmetics: {
    accessory?: string;
    background?: string;
    trail?: string;
  };
}

interface UserStats {
  stepsToday: number;
  stepsThisWeek: number;
  stepsThisMonth: number;
  lastStepUpdate: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  dailyGoal: number;
  weeklyGoal: number;
  dailyHistory: { date: string; steps: number }[];
  weeklyHistory: { week: string; steps: number }[];
}

interface CoinState {
  balance: number;
  pendingReward: number;
  totalEarned: number;
  lastClaimTime: number;
  miningRate: number;
  miningHistory: { date: string; amount: number }[];
}

interface AppSettings {
  notifications: boolean;
  soundEffects: boolean;
  haptics: boolean;
  theme: 'dark' | 'light' | 'auto';
  stepSource: 'manual' | 'healthkit' | 'googlefit';
  language: string;
}

export interface IGameState extends Document {
  userId: mongoose.Types.ObjectId;
  pet: PetState;
  stats: UserStats;
  coins: CoinState;
  settings: AppSettings;
  initialized: boolean;
  lastUpdateTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const PetStateSchema = new Schema<PetState>({
  name: { type: String, required: true, default: 'Pet' },
  type: { type: String, enum: ['phoenix', 'dragon', 'spirit', 'nature'], required: true, default: 'phoenix' },
  stage: { type: String, enum: ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'], default: 'egg' },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  experienceToNextLevel: { type: Number, default: 100 },
  mood: { type: String, enum: ['ecstatic', 'happy', 'content', 'neutral', 'sad', 'neglected'], default: 'neutral' },
  moodPoints: { type: Number, default: 50, min: 0, max: 100 },
  totalStepsAllTime: { type: Number, default: 0 },
  miningEfficiency: { type: Number, default: 1.0 },
  lastFedTime: { type: Number, default: 0 },
  lastPlayedTime: { type: Number, default: 0 },
  hatched: { type: Boolean, default: false },
  evolutionAnimation: { type: Boolean, default: false },
  environment: { type: String, enum: ['meadow', 'space', 'cozy', 'beach'], default: 'meadow' },
  hunger: { type: Number, default: 100, min: 0, max: 100 },
  energy: { type: Number, default: 100, min: 0, max: 100 },
  happiness: { type: Number, default: 50, min: 0, max: 100 },
  health: { type: Number, default: 100, min: 0, max: 100 },
  unlockables: { type: [String], default: [] },
  cosmetics: {
    accessory: { type: String, default: undefined },
    background: { type: String, default: undefined },
    trail: { type: String, default: undefined },
  },
}, { _id: false });

const UserStatsSchema = new Schema<UserStats>({
  stepsToday: { type: Number, default: 0 },
  stepsThisWeek: { type: Number, default: 0 },
  stepsThisMonth: { type: Number, default: 0 },
  lastStepUpdate: { type: String, default: new Date().toISOString().split('T')[0] },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: new Date().toISOString().split('T')[0] },
  dailyGoal: { type: Number, default: 10000 },
  weeklyGoal: { type: Number, default: 70000 },
  dailyHistory: [{
    date: String,
    steps: Number,
  }],
  weeklyHistory: [{
    week: String,
    steps: Number,
  }],
}, { _id: false });

const CoinStateSchema = new Schema<CoinState>({
  balance: { type: Number, default: 0 },
  pendingReward: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  lastClaimTime: { type: Number, default: 0 },
  miningRate: { type: Number, default: 10 },
  miningHistory: [{
    date: String,
    amount: Number,
  }],
}, { _id: false });

const AppSettingsSchema = new Schema<AppSettings>({
  notifications: { type: Boolean, default: true },
  soundEffects: { type: Boolean, default: true },
  haptics: { type: Boolean, default: true },
  theme: { type: String, enum: ['dark', 'light', 'auto'], default: 'dark' },
  stepSource: { type: String, enum: ['manual', 'healthkit', 'googlefit'], default: 'manual' },
  language: { type: String, default: 'en' },
}, { _id: false });

const GameStateSchema = new Schema<IGameState>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    pet: { type: PetStateSchema, required: true },
    stats: { type: UserStatsSchema, required: true },
    coins: { type: CoinStateSchema, required: true },
    settings: { type: AppSettingsSchema, required: true },
    initialized: { type: Boolean, default: false },
    lastUpdateTime: { type: Number, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
GameStateSchema.index({ userId: 1 });

export default mongoose.model<IGameState>('GameState', GameStateSchema);

