import { getDB } from '../config/database';
import type { PetStage, PetMood } from '../utils/gameLogic';

export type EnvironmentType = 'meadow' | 'space' | 'cozy' | 'beach';
export type PetType = 'phoenix' | 'dragon' | 'spirit' | 'nature';

export interface IGameState {
  id: number;
  user_id: number;
  pet_name: string;
  pet_type: PetType;
  pet_stage: PetStage;
  pet_level: number;
  pet_experience: number;
  pet_experience_to_next_level: number;
  pet_mood: PetMood;
  pet_mood_points: number;
  pet_total_steps_all_time: number;
  pet_mining_efficiency: number;
  pet_last_fed_time: number;
  pet_last_played_time: number;
  pet_hatched: number; // SQLite uses 0/1 for boolean
  pet_evolution_animation: number;
  pet_environment: EnvironmentType;
  pet_hunger: number;
  pet_energy: number;
  pet_happiness: number;
  pet_health: number;
  pet_unlockables: string; // JSON string
  pet_cosmetics: string; // JSON string
  stats_steps_today: number;
  stats_steps_this_week: number;
  stats_steps_this_month: number;
  stats_last_step_update: string;
  stats_streak: number;
  stats_longest_streak: number;
  stats_last_active_date: string;
  stats_daily_goal: number;
  stats_weekly_goal: number;
  stats_daily_history: string; // JSON string
  stats_weekly_history: string; // JSON string
  coins_balance: number;
  coins_pending_reward: number;
  coins_total_earned: number;
  coins_last_claim_time: number;
  coins_mining_rate: number;
  coins_mining_history: string; // JSON string
  settings_notifications: number;
  settings_sound_effects: number;
  settings_haptics: number;
  settings_theme: string;
  settings_step_source: string;
  settings_language: string;
  initialized: number;
  last_update_time: number;
  created_at: string;
  updated_at: string;
}

export class GameState {
  static findByUserId(userId: number): IGameState | null {
    const db = getDB();
    return db.prepare('SELECT * FROM game_states WHERE user_id = ?').get(userId) as IGameState | null;
  }

  static create(userId: number, initialState: any): IGameState {
    const db = getDB();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    const result = db.prepare(`
      INSERT INTO game_states (
        user_id, pet_name, pet_type, pet_stage, pet_level, pet_experience, pet_experience_to_next_level,
        pet_mood, pet_mood_points, pet_total_steps_all_time, pet_mining_efficiency,
        pet_last_fed_time, pet_last_played_time, pet_hatched, pet_evolution_animation,
        pet_environment, pet_hunger, pet_energy, pet_happiness, pet_health,
        pet_unlockables, pet_cosmetics,
        stats_steps_today, stats_steps_this_week, stats_steps_this_month,
        stats_last_step_update, stats_streak, stats_longest_streak, stats_last_active_date,
        stats_daily_goal, stats_weekly_goal, stats_daily_history, stats_weekly_history,
        coins_balance, coins_pending_reward, coins_total_earned, coins_last_claim_time,
        coins_mining_rate, coins_mining_history,
        settings_notifications, settings_sound_effects, settings_haptics,
        settings_theme, settings_step_source, settings_language,
        initialized, last_update_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      initialState.pet?.name || 'Pet',
      initialState.pet?.type || 'phoenix',
      initialState.pet?.stage || 'egg',
      initialState.pet?.level || 1,
      initialState.pet?.experience || 0,
      initialState.pet?.experienceToNextLevel || 100,
      initialState.pet?.mood || 'neutral',
      initialState.pet?.moodPoints || 50,
      initialState.pet?.totalStepsAllTime || 0,
      initialState.pet?.miningEfficiency || 0,
      initialState.pet?.lastFedTime || 0,
      initialState.pet?.lastPlayedTime || 0,
      initialState.pet?.hatched ? 1 : 0,
      initialState.pet?.evolutionAnimation ? 1 : 0,
      initialState.pet?.environment || 'meadow',
      initialState.pet?.hunger || 100,
      initialState.pet?.energy || 100,
      initialState.pet?.happiness || 50,
      initialState.pet?.health || 100,
      JSON.stringify(initialState.pet?.unlockables || []),
      JSON.stringify(initialState.pet?.cosmetics || {}),
      initialState.stats?.stepsToday || 0,
      initialState.stats?.stepsThisWeek || 0,
      initialState.stats?.stepsThisMonth || 0,
      initialState.stats?.lastStepUpdate || today,
      initialState.stats?.streak || 0,
      initialState.stats?.longestStreak || 0,
      initialState.stats?.lastActiveDate || today,
      initialState.stats?.dailyGoal || 10000,
      initialState.stats?.weeklyGoal || 70000,
      JSON.stringify(initialState.stats?.dailyHistory || []),
      JSON.stringify(initialState.stats?.weeklyHistory || []),
      initialState.coins?.balance || 0,
      initialState.coins?.pendingReward || 0,
      initialState.coins?.totalEarned || 0,
      initialState.coins?.lastClaimTime || 0,
      initialState.coins?.miningRate || 10,
      JSON.stringify(initialState.coins?.miningHistory || []),
      initialState.settings?.notifications ? 1 : 0,
      initialState.settings?.soundEffects ? 1 : 0,
      initialState.settings?.haptics ? 1 : 0,
      initialState.settings?.theme || 'dark',
      initialState.settings?.stepSource || 'manual',
      initialState.settings?.language || 'en',
      initialState.initialized ? 1 : 0,
      now
    );
    
    return this.findByUserId(userId)!;
  }

  static update(userId: number, updates: Partial<IGameState>): IGameState | null {
    const db = getDB();
    const setClause: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        setClause.push(`${key} = ?`);
        // Convert objects/arrays to JSON strings, keep primitives as-is
        if (value !== null && (typeof value === 'object' || Array.isArray(value))) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClause.length === 0) {
      return this.findByUserId(userId);
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    
    db.prepare(`UPDATE game_states SET ${setClause.join(', ')} WHERE user_id = ?`).run(...values);
    
    return this.findByUserId(userId);
  }

  // Helper to convert DB row to API format
  static toAPIFormat(row: IGameState): any {
    return {
      pet: {
        name: row.pet_name,
        type: row.pet_type,
        stage: row.pet_stage,
        level: row.pet_level,
        experience: row.pet_experience,
        experienceToNextLevel: row.pet_experience_to_next_level,
        mood: row.pet_mood,
        moodPoints: row.pet_mood_points,
        totalStepsAllTime: row.pet_total_steps_all_time,
        miningEfficiency: row.pet_mining_efficiency,
        lastFedTime: row.pet_last_fed_time,
        lastPlayedTime: row.pet_last_played_time,
        hatched: row.pet_hatched === 1,
        evolutionAnimation: row.pet_evolution_animation === 1,
        environment: row.pet_environment,
        hunger: row.pet_hunger,
        energy: row.pet_energy,
        happiness: row.pet_happiness,
        health: row.pet_health,
        unlockables: JSON.parse(row.pet_unlockables || '[]'),
        cosmetics: JSON.parse(row.pet_cosmetics || '{}'),
      },
      stats: {
        stepsToday: row.stats_steps_today,
        stepsThisWeek: row.stats_steps_this_week,
        stepsThisMonth: row.stats_steps_this_month,
        lastStepUpdate: row.stats_last_step_update,
        streak: row.stats_streak,
        longestStreak: row.stats_longest_streak,
        lastActiveDate: row.stats_last_active_date,
        dailyGoal: row.stats_daily_goal,
        weeklyGoal: row.stats_weekly_goal,
        dailyHistory: JSON.parse(row.stats_daily_history || '[]'),
        weeklyHistory: JSON.parse(row.stats_weekly_history || '[]'),
        achievements: [], // Will be loaded separately
      },
      coins: {
        balance: row.coins_balance,
        pendingReward: row.coins_pending_reward,
        totalEarned: row.coins_total_earned,
        lastClaimTime: row.coins_last_claim_time,
        miningRate: row.coins_mining_rate,
        miningHistory: JSON.parse(row.coins_mining_history || '[]'),
      },
      settings: {
        notifications: row.settings_notifications === 1,
        soundEffects: row.settings_sound_effects === 1,
        haptics: row.settings_haptics === 1,
        theme: row.settings_theme,
        stepSource: row.settings_step_source,
        language: row.settings_language,
      },
      initialized: row.initialized === 1,
      lastUpdateTime: row.last_update_time,
    };
  }
}

export default GameState;
