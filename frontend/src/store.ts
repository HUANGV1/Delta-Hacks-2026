import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, differenceInHours, differenceInDays, isToday, parseISO, startOfDay, startOfWeek } from 'date-fns';
import {
  EVOLUTION_REQUIREMENTS,
  MINING_EFFICIENCY,
  getExperienceForLevel,
  MOOD_THRESHOLDS,
  DAILY_STEP_CAP,
  STEPS_PER_EXPERIENCE,
  BASE_COINS_PER_1000_STEPS,
  CARE_COSTS,
  ACHIEVEMENT_DEFINITIONS,
} from './types';
import type { GameState, PetStage, PetMood, EnvironmentType, ScreenType, Challenge, PetType, Notification } from './types';

interface GameStore extends GameState {
  // Actions
  setGameState: (gameState: Partial<GameState>) => void;
  setInitialized: (initialized: boolean) => void;
  initializeGame: (petName: string, petType: PetType) => void;
  addSteps: (steps: number) => void;
  claimCoins: () => void;
  updateMood: () => void;
  checkEvolution: () => void;
  resetDay: () => void;
  tick: () => void;
  hatchEgg: () => void;
  setEnvironment: (env: EnvironmentType) => void;
  setScreen: (screen: ScreenType) => void;
  feedPet: () => void;
  playWithPet: () => void;
  healPet: () => void;
  boostPet: () => void;
  completeChallenge: (id: string) => void;
  claimChallengeReward: (id: string) => void;
  generateDailyChallenges: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  resetGame: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getInitialState = (): GameState => ({
  pet: {
    name: '',
    type: 'phoenix',
    stage: 'egg',
    level: 0,
    experience: 0,
    experienceToNextLevel: getExperienceForLevel(0),
    mood: 'neutral',
    moodPoints: 50,
    totalStepsAllTime: 0,
    miningEfficiency: 0,
    lastFedTime: Date.now(),
    lastPlayedTime: Date.now(),
    hatched: false,
    evolutionAnimation: false,
    environment: 'meadow',
    hunger: 80,
    energy: 80,
    happiness: 70,
    health: 100,
    unlockables: [],
    cosmetics: {},
  },
  stats: {
    stepsToday: 0,
    stepsThisWeek: 0,
    stepsThisMonth: 0,
    lastStepUpdate: new Date().toISOString(),
    streak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    dailyGoal: 8000,
    weeklyGoal: 50000,
    dailyHistory: [],
    weeklyHistory: [],
    achievements: ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, progress: 0 })),
  },
  coins: {
    balance: 0,
    pendingReward: 0,
    totalEarned: 0,
    lastClaimTime: Date.now(),
    miningRate: BASE_COINS_PER_1000_STEPS,
    miningHistory: [],
  },
  challenges: [],
  initialized: false,
  lastUpdateTime: Date.now(),
  currentScreen: 'home',
  notifications: [],
  settings: {
    notifications: true,
    soundEffects: true,
    haptics: true,
    theme: 'dark',
    stepSource: 'manual',
    language: 'en',
  },
});

function calculateMood(moodPoints: number): PetMood {
  if (moodPoints >= MOOD_THRESHOLDS.ecstatic) return 'ecstatic';
  if (moodPoints >= MOOD_THRESHOLDS.happy) return 'happy';
  if (moodPoints >= MOOD_THRESHOLDS.content) return 'content';
  if (moodPoints >= MOOD_THRESHOLDS.neutral) return 'neutral';
  if (moodPoints >= MOOD_THRESHOLDS.sad) return 'sad';
  return 'neglected';
}

function getNextEvolution(currentStage: PetStage): PetStage | null {
  const stages: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'];
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex < stages.length - 1) {
    return stages[currentIndex + 1];
  }
  return null;
}

function canEvolve(stage: PetStage, level: number, totalSteps: number): boolean {
  const nextStage = getNextEvolution(stage);
  if (!nextStage) return false;
  
  const requirements = EVOLUTION_REQUIREMENTS[nextStage];
  return level >= requirements.level && totalSteps >= requirements.totalSteps;
}

const generateDailyChallenges = (): Challenge[] => {
  const now = Date.now();
  const endOfDay = new Date().setHours(23, 59, 59, 999);
  
  return [
    {
      id: generateId(),
      type: 'daily',
      title: 'Morning Walk',
      description: 'Take 2,000 steps before noon',
      icon: '🌅',
      target: 2000,
      current: 0,
      reward: 25,
      expiresAt: endOfDay,
      completed: false,
      claimed: false,
    },
    {
      id: generateId(),
      type: 'daily',
      title: 'Daily Target',
      description: 'Reach your daily step goal',
      icon: '🎯',
      target: 8000,
      current: 0,
      reward: 50,
      expiresAt: endOfDay,
      completed: false,
      claimed: false,
    },
    {
      id: generateId(),
      type: 'daily',
      title: 'Care for Your Pet',
      description: 'Feed or play with your pet today',
      icon: '❤️',
      target: 1,
      current: 0,
      reward: 15,
      expiresAt: endOfDay,
      completed: false,
      claimed: false,
    },
    {
      id: generateId(),
      type: 'weekly',
      title: 'Weekly Marathon',
      description: 'Walk 50,000 steps this week',
      icon: '🏃',
      target: 50000,
      current: 0,
      reward: 200,
      expiresAt: startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() + 7 * 24 * 60 * 60 * 1000,
      completed: false,
      claimed: false,
    },
    {
      id: generateId(),
      type: 'weekly',
      title: 'Perfect Week',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      target: 7,
      current: 0,
      reward: 150,
      expiresAt: startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() + 7 * 24 * 60 * 60 * 1000,
      completed: false,
      claimed: false,
    },
    {
      id: generateId(),
      type: 'special',
      title: 'Step Master',
      description: 'Take 15,000 steps in a single day',
      icon: '⚡',
      target: 15000,
      current: 0,
      reward: 100,
      expiresAt: now + 72 * 60 * 60 * 1000,
      completed: false,
      claimed: false,
    },
  ];
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setGameState: (gameState: Partial<GameState>) => {
        set((state) => ({
          ...state,
          ...gameState,
        }));
      },

      setInitialized: (initialized: boolean) => {
        set({ initialized });
      },

      initializeGame: (petName: string, petType: PetType) => {
        set({
          ...getInitialState(),
          pet: {
            ...getInitialState().pet,
            name: petName,
            type: petType,
          },
          challenges: generateDailyChallenges(),
          initialized: true,
          lastUpdateTime: Date.now(),
        });
      },

      hatchEgg: () => {
        const state = get();
        set({
          pet: {
            ...state.pet,
            stage: 'baby',
            level: 1,
            hatched: true,
            miningEfficiency: MINING_EFFICIENCY.baby,
            evolutionAnimation: true,
          },
        });
        
        // Update achievement
        const achievements = [...state.stats.achievements];
        const hatchAchievement = achievements.find(a => a.id === 'hatch');
        if (hatchAchievement) {
          hatchAchievement.progress = 1;
          hatchAchievement.unlockedAt = Date.now();
        }
        set(s => ({ stats: { ...s.stats, achievements } }));
        
        get().addNotification({
          type: 'evolution',
          title: 'Your Pet Has Hatched!',
          message: `${state.pet.name} is now a Hatchling. Keep walking to help it grow!`,
        });
        
        setTimeout(() => {
          set((s) => ({
            pet: { ...s.pet, evolutionAnimation: false },
          }));
        }, 2000);
      },

      addSteps: (steps: number) => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Reset if it's a new day
        let stepsToday = state.stats.stepsToday;
        let stepsThisWeek = state.stats.stepsThisWeek;
        let streak = state.stats.streak;
        let dailyHistory = [...state.stats.dailyHistory];
        
        if (state.stats.lastStepUpdate) {
          const lastUpdate = parseISO(state.stats.lastStepUpdate);
          if (!isToday(lastUpdate)) {
            // Save yesterday's steps
            if (stepsToday > 0) {
              const yesterdayDate = format(lastUpdate, 'yyyy-MM-dd');
              const existingIdx = dailyHistory.findIndex(d => d.date === yesterdayDate);
              if (existingIdx >= 0) {
                dailyHistory[existingIdx].steps = stepsToday;
              } else {
                dailyHistory.push({ date: yesterdayDate, steps: stepsToday });
              }
              // Keep only last 30 days
              dailyHistory = dailyHistory.slice(-30);
            }
            
            const daysSinceLastActive = differenceInDays(startOfDay(new Date()), startOfDay(lastUpdate));
            
            if (daysSinceLastActive === 1 && state.stats.stepsToday >= state.stats.dailyGoal * 0.5) {
              streak += 1;
            } else if (daysSinceLastActive > 1) {
              streak = 1;
            }
            
            stepsToday = 0;
            
            // Reset weekly steps on Sunday
            if (new Date().getDay() === 0 && lastUpdate.getDay() !== 0) {
              stepsThisWeek = 0;
            }
          }
        } else {
          streak = 1;
        }
        
        // Apply daily cap with diminishing returns
        const remainingCap = Math.max(0, DAILY_STEP_CAP - stepsToday);
        const effectiveSteps = Math.min(steps, remainingCap);
        
        if (effectiveSteps <= 0) return;
        
        // Calculate experience gain
        const experienceGain = Math.floor(effectiveSteps / STEPS_PER_EXPERIENCE);
        
        // Calculate pending coins
        const coinsEarned = (effectiveSteps / 1000) * BASE_COINS_PER_1000_STEPS * state.pet.miningEfficiency;
        
        // Update mood - activity makes pet happier
        const moodBoost = Math.min(30, effectiveSteps / 200);
        const newMoodPoints = Math.min(100, state.pet.moodPoints + moodBoost);
        
        let newExperience = state.pet.experience + experienceGain;
        let newLevel = state.pet.level;
        let expToNext = state.pet.experienceToNextLevel;
        
        // Level up loop
        while (newExperience >= expToNext && state.pet.hatched) {
          newExperience -= expToNext;
          newLevel += 1;
          expToNext = getExperienceForLevel(newLevel);
          
          get().addNotification({
            type: 'achievement',
            title: 'Level Up!',
            message: `${state.pet.name} reached level ${newLevel}!`,
          });
        }
        
        const newTotalSteps = state.pet.totalStepsAllTime + effectiveSteps;
        const newStepsToday = stepsToday + effectiveSteps;
        
        // Update challenges
        const challenges = state.challenges.map(c => {
          if (c.claimed) return c;
          let current = c.current;
          
          if (c.title.includes('steps') || c.title.includes('Walk') || c.title.includes('Target') || c.title.includes('Marathon') || c.title.includes('Master')) {
            if (c.type === 'daily') {
              current = newStepsToday;
            } else if (c.type === 'weekly') {
              current = stepsThisWeek + effectiveSteps;
            } else {
              current = newStepsToday;
            }
          }
          
          return {
            ...c,
            current,
            completed: current >= c.target,
          };
        });
        
        // Update achievements
        const achievements = state.stats.achievements.map(a => {
          let progress = a.progress;
          
          if (a.id === 'first_steps') progress = Math.min(a.target, newTotalSteps);
          if (a.id === 'walker') progress = Math.max(progress, newStepsToday);
          if (a.id === 'runner') progress = Math.max(progress, newStepsToday);
          if (a.id === 'marathon') progress = newTotalSteps;
          if (a.id === 'streak_3' || a.id === 'streak_7' || a.id === 'streak_30') progress = Math.max(progress, streak);
          if (a.id === 'level_10' || a.id === 'level_25' || a.id === 'level_50') progress = newLevel;
          
          const wasNotUnlocked = !a.unlockedAt;
          const nowUnlocked = progress >= a.target;
          
          if (wasNotUnlocked && nowUnlocked) {
            get().addNotification({
              type: 'achievement',
              title: 'Achievement Unlocked!',
              message: `${a.icon} ${a.name}: ${a.description}`,
            });
          }
          
          return {
            ...a,
            progress,
            unlockedAt: (wasNotUnlocked && nowUnlocked) ? Date.now() : a.unlockedAt,
          };
        });
        
        // Boost energy and reduce hunger slightly
        const newEnergy = Math.max(0, state.pet.energy - effectiveSteps / 2000);
        const newHunger = Math.max(0, state.pet.hunger - effectiveSteps / 3000);
        
        set({
          pet: {
            ...state.pet,
            experience: newExperience,
            level: newLevel,
            experienceToNextLevel: expToNext,
            moodPoints: newMoodPoints,
            mood: calculateMood(newMoodPoints),
            totalStepsAllTime: newTotalSteps,
            lastFedTime: Date.now(),
            energy: newEnergy,
            hunger: newHunger,
          },
          stats: {
            ...state.stats,
            stepsToday: newStepsToday,
            stepsThisWeek: stepsThisWeek + effectiveSteps,
            lastStepUpdate: new Date().toISOString(),
            streak: Math.max(streak, 1),
            longestStreak: Math.max(state.stats.longestStreak, streak),
            lastActiveDate: today,
            dailyHistory,
            achievements,
          },
          coins: {
            ...state.coins,
            pendingReward: state.coins.pendingReward + coinsEarned,
          },
          challenges,
          lastUpdateTime: Date.now(),
        });
        
        // Check for evolution after adding steps
        get().checkEvolution();
      },

      claimCoins: () => {
        const state = get();
        if (state.coins.pendingReward <= 0) return;
        
        const claimAmount = Math.floor(state.coins.pendingReward);
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const miningHistory = [...state.coins.miningHistory];
        const existingIdx = miningHistory.findIndex(m => m.date === today);
        if (existingIdx >= 0) {
          miningHistory[existingIdx].amount += claimAmount;
        } else {
          miningHistory.push({ date: today, amount: claimAmount });
        }
        
        // Update coin achievements
        const totalAfterClaim = state.coins.totalEarned + claimAmount;
        const achievements = state.stats.achievements.map(a => {
          if (a.id === 'coins_100' || a.id === 'coins_1000' || a.id === 'coins_10000') {
            const wasNotUnlocked = !a.unlockedAt;
            const nowUnlocked = totalAfterClaim >= a.target;
            
            if (wasNotUnlocked && nowUnlocked) {
              get().addNotification({
                type: 'achievement',
                title: 'Achievement Unlocked!',
                message: `${a.icon} ${a.name}: ${a.description}`,
              });
            }
            
            return {
              ...a,
              progress: totalAfterClaim,
              unlockedAt: (wasNotUnlocked && nowUnlocked) ? Date.now() : a.unlockedAt,
            };
          }
          return a;
        });
        
        set({
          coins: {
            ...state.coins,
            balance: state.coins.balance + claimAmount,
            pendingReward: state.coins.pendingReward - claimAmount,
            totalEarned: totalAfterClaim,
            lastClaimTime: Date.now(),
            miningHistory: miningHistory.slice(-30),
          },
          stats: { ...state.stats, achievements },
        });
      },

      updateMood: () => {
        const state = get();
        if (!state.pet.hatched) return;
        
        const hoursSinceActivity = differenceInHours(new Date(), state.pet.lastFedTime);
        
        // Mood decays slowly without activity
        const moodDecay = Math.min(hoursSinceActivity * 2, 50);
        const newMoodPoints = Math.max(0, state.pet.moodPoints - moodDecay);
        
        // Stats decay over time
        const hungerDecay = Math.min(hoursSinceActivity * 3, 30);
        const energyDecay = Math.min(hoursSinceActivity * 2, 20);
        
        set({
          pet: {
            ...state.pet,
            moodPoints: newMoodPoints,
            mood: calculateMood(newMoodPoints),
            hunger: Math.max(0, state.pet.hunger - hungerDecay),
            energy: Math.max(0, state.pet.energy - energyDecay),
          },
        });
      },

      checkEvolution: () => {
        const state = get();
        if (!state.pet.hatched) return;
        
        if (canEvolve(state.pet.stage, state.pet.level, state.pet.totalStepsAllTime)) {
          const nextStage = getNextEvolution(state.pet.stage);
          if (nextStage) {
            set({
              pet: {
                ...state.pet,
                stage: nextStage,
                miningEfficiency: MINING_EFFICIENCY[nextStage],
                evolutionAnimation: true,
              },
            });
            
            get().addNotification({
              type: 'evolution',
              title: 'Evolution!',
              message: `${state.pet.name} evolved to ${nextStage}! Mining efficiency increased to ${MINING_EFFICIENCY[nextStage]}x`,
            });
            
            // Update evolution achievements
            const achievements = state.stats.achievements.map(a => {
              if (a.id === 'evolve_child' && nextStage === 'child') {
                return { ...a, progress: 1, unlockedAt: Date.now() };
              }
              if (a.id === 'evolve_adult' && nextStage === 'adult') {
                return { ...a, progress: 1, unlockedAt: Date.now() };
              }
              if (a.id === 'evolve_legendary' && nextStage === 'legendary') {
                return { ...a, progress: 1, unlockedAt: Date.now() };
              }
              return a;
            });
            set(s => ({ stats: { ...s.stats, achievements } }));
            
            setTimeout(() => {
              set((s) => ({
                pet: { ...s.pet, evolutionAnimation: false },
              }));
            }, 3000);
          }
        }
      },

      resetDay: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            stepsToday: 0,
          },
        }));
      },

      tick: () => {
        get().updateMood();
      },

      setEnvironment: (env: EnvironmentType) => {
        set((state) => ({
          pet: { ...state.pet, environment: env },
        }));
      },

      setScreen: (screen: ScreenType) => {
        set({ currentScreen: screen });
      },

      feedPet: () => {
        const state = get();
        if (state.coins.balance < CARE_COSTS.feed) return;
        
        set({
          pet: {
            ...state.pet,
            hunger: Math.min(100, state.pet.hunger + 30),
            happiness: Math.min(100, state.pet.happiness + 10),
            moodPoints: Math.min(100, state.pet.moodPoints + 15),
            mood: calculateMood(Math.min(100, state.pet.moodPoints + 15)),
            lastFedTime: Date.now(),
          },
          coins: {
            ...state.coins,
            balance: state.coins.balance - CARE_COSTS.feed,
          },
          challenges: state.challenges.map(c => 
            c.title.includes('Care') && !c.claimed 
              ? { ...c, current: 1, completed: true }
              : c
          ),
        });
      },

      playWithPet: () => {
        const state = get();
        if (state.coins.balance < CARE_COSTS.play) return;
        
        set({
          pet: {
            ...state.pet,
            happiness: Math.min(100, state.pet.happiness + 25),
            energy: Math.max(0, state.pet.energy - 10),
            moodPoints: Math.min(100, state.pet.moodPoints + 20),
            mood: calculateMood(Math.min(100, state.pet.moodPoints + 20)),
            lastPlayedTime: Date.now(),
          },
          coins: {
            ...state.coins,
            balance: state.coins.balance - CARE_COSTS.play,
          },
          challenges: state.challenges.map(c => 
            c.title.includes('Care') && !c.claimed 
              ? { ...c, current: 1, completed: true }
              : c
          ),
        });
      },

      healPet: () => {
        const state = get();
        if (state.coins.balance < CARE_COSTS.heal) return;
        
        set({
          pet: {
            ...state.pet,
            health: 100,
            moodPoints: Math.min(100, state.pet.moodPoints + 10),
            mood: calculateMood(Math.min(100, state.pet.moodPoints + 10)),
          },
          coins: {
            ...state.coins,
            balance: state.coins.balance - CARE_COSTS.heal,
          },
        });
      },

      boostPet: () => {
        const state = get();
        if (state.coins.balance < CARE_COSTS.boost) return;
        
        set({
          pet: {
            ...state.pet,
            energy: 100,
            hunger: 100,
            happiness: 100,
            moodPoints: 100,
            mood: 'ecstatic',
          },
          coins: {
            ...state.coins,
            balance: state.coins.balance - CARE_COSTS.boost,
          },
        });
      },

      completeChallenge: (id: string) => {
        set((state) => ({
          challenges: state.challenges.map(c =>
            c.id === id ? { ...c, completed: true } : c
          ),
        }));
      },

      claimChallengeReward: (id: string) => {
        const state = get();
        const challenge = state.challenges.find(c => c.id === id);
        if (!challenge || !challenge.completed || challenge.claimed) return;
        
        set({
          challenges: state.challenges.map(c =>
            c.id === id ? { ...c, claimed: true } : c
          ),
          coins: {
            ...state.coins,
            balance: state.coins.balance + challenge.reward,
            totalEarned: state.coins.totalEarned + challenge.reward,
          },
        });
        
        get().addNotification({
          type: 'reward',
          title: 'Challenge Complete!',
          message: `You earned ${challenge.reward} StepCoins!`,
        });
      },

      generateDailyChallenges: () => {
        const state = get();
        // Check if challenges are expired
        const now = Date.now();
        const expiredDaily = state.challenges.filter(c => c.type === 'daily' && c.expiresAt < now);
        
        if (expiredDaily.length > 0) {
          const newChallenges = generateDailyChallenges();
          set({ challenges: newChallenges });
        }
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      addNotification: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // Keep max 50 notifications
        }));
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      resetGame: () => {
        set(getInitialState());
      },
    }),
    {
      name: 'steppal-storage',
    }
  )
);
