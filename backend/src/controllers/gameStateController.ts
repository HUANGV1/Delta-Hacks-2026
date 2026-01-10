import { Response } from 'express';
import GameState from '../models/GameState';
import StepHistory from '../models/StepHistory';
import { AuthRequest } from '../middleware/auth';
import {
  calculateCoins,
  calculateMood,
  canEvolve,
  getExperienceForLevel,
  MINING_EFFICIENCY,
  STEPS_PER_EXPERIENCE,
  DAILY_STEP_CAP,
  CARE_COSTS,
} from '../utils/gameLogic';
import { format, addDays } from 'date-fns';

// @desc    Get game state
// @route   GET /api/gamestate
// @access  Private
export const getGameState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.userId || '0');
    const gameStateRow = GameState.findByUserId(userId);
    
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    let gameState = GameState.toAPIFormat(gameStateRow);

    // Update mood based on mood points
    gameState.pet.mood = calculateMood(gameState.pet.moodPoints);
    
    // Update mining efficiency based on stage
    const stage = gameState.pet.stage as keyof typeof MINING_EFFICIENCY;
    gameState.pet.miningEfficiency = MINING_EFFICIENCY[stage];
    
    // Save updates
    GameState.update(userId, {
      pet_mood: gameState.pet.mood,
      pet_mining_efficiency: gameState.pet.miningEfficiency,
    });

    res.json({ success: true, gameState });
  } catch (error: any) {
    console.error('Get game state error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Initialize game
// @route   POST /api/gamestate/initialize
// @access  Private
export const initializeGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petName, petType } = req.body;
    const userId = parseInt(req.userId || '0');
    
    let gameStateRow = GameState.findByUserId(userId);
    
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    if (gameStateRow.initialized === 1) {
      res.status(400).json({ success: false, message: 'Game already initialized' });
      return;
    }

    GameState.update(userId, {
      pet_name: petName || 'Pet',
      pet_type: petType || 'phoenix',
      initialized: 1,
      last_update_time: Date.now(),
    });

    const updated = GameState.findByUserId(userId)!;
    res.json({ success: true, gameState: GameState.toAPIFormat(updated) });
  } catch (error: any) {
    console.error('Initialize game error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Add steps
// @route   POST /api/gamestate/steps
// @access  Private
export const addSteps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { steps } = req.body;
    const userId = parseInt(req.userId || '0');
    
    if (!steps || steps < 0 || steps > DAILY_STEP_CAP) {
      res.status(400).json({ success: false, message: 'Invalid step count' });
      return;
    }

    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    let gameState = GameState.toAPIFormat(gameStateRow);
    const today = format(new Date(), 'yyyy-MM-dd');
    const isToday = gameState.stats.lastStepUpdate === today;

    // Update step history
    let stepHistory = StepHistory.findByUserIdAndDate(userId, today);
    if (!stepHistory) {
      stepHistory = StepHistory.create({
        user_id: userId,
        date: today,
        steps: 0,
        calories: 0,
        distance: 0,
      });
    }

    // Add steps
    const newSteps = isToday ? steps : Math.min(steps, DAILY_STEP_CAP);
    StepHistory.upsert({
      user_id: userId,
      date: today,
      steps: stepHistory.steps + newSteps,
      calories: stepHistory.calories + (newSteps * 0.04),
      distance: stepHistory.distance + (newSteps * 0.0008),
    });

    // Update game state
    if (isToday) {
      gameState.stats.stepsToday += newSteps;
    } else {
      // New day - reset daily stats
      gameState.stats.stepsToday = newSteps;
      gameState.stats.lastStepUpdate = today;
      
      // Check streak
      const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
      if (gameState.stats.lastActiveDate === yesterday) {
        gameState.stats.streak += 1;
      } else if (gameState.stats.lastActiveDate !== today) {
        gameState.stats.streak = 1;
      }
      gameState.stats.lastActiveDate = today;
      
      if (gameState.stats.streak > gameState.stats.longestStreak) {
        gameState.stats.longestStreak = gameState.stats.streak;
      }
    }

    // Update total steps
    gameState.pet.totalStepsAllTime += newSteps;

    // Calculate experience
    const experienceGained = Math.floor(newSteps / STEPS_PER_EXPERIENCE);
    gameState.pet.experience += experienceGained;

    // Level up check
    while (gameState.pet.experience >= gameState.pet.experienceToNextLevel) {
      gameState.pet.experience -= gameState.pet.experienceToNextLevel;
      gameState.pet.level += 1;
      gameState.pet.experienceToNextLevel = getExperienceForLevel(gameState.pet.level);
    }

    // Update mood (steps increase mood)
    gameState.pet.moodPoints = Math.min(100, gameState.pet.moodPoints + (newSteps / 100));
    gameState.pet.mood = calculateMood(gameState.pet.moodPoints);

    // Calculate coins
    const coinsEarned = calculateCoins(newSteps, gameState.pet.miningEfficiency);
    gameState.coins.pendingReward += coinsEarned;

    // Update mining history
    const miningEntry = gameState.coins.miningHistory.find((m: { date: string; amount: number }) => m.date === today);
    if (miningEntry) {
      miningEntry.amount += coinsEarned;
    } else {
      gameState.coins.miningHistory.push({ date: today, amount: coinsEarned });
    }

    // Check evolution
    const evolutionCheck = canEvolve(
      gameState.pet.stage,
      gameState.pet.level,
      gameState.pet.totalStepsAllTime
    );
    if (evolutionCheck.canEvolve && evolutionCheck.nextStage) {
      gameState.pet.stage = evolutionCheck.nextStage;
      gameState.pet.miningEfficiency = MINING_EFFICIENCY[evolutionCheck.nextStage];
      gameState.pet.evolutionAnimation = true;
    }

    // Update stats
    gameState.stats.stepsThisWeek += newSteps;
    gameState.stats.stepsThisMonth += newSteps;

    // Update daily history
    const dailyEntry = gameState.stats.dailyHistory.find((d: { date: string; steps: number }) => d.date === today);
    if (dailyEntry) {
      dailyEntry.steps = gameState.stats.stepsToday;
    } else {
      gameState.stats.dailyHistory.push({ date: today, steps: gameState.stats.stepsToday });
    }

    // Save to database
    GameState.update(userId, {
      pet_stage: gameState.pet.stage,
      pet_level: gameState.pet.level,
      pet_experience: gameState.pet.experience,
      pet_experience_to_next_level: gameState.pet.experienceToNextLevel,
      pet_mood: gameState.pet.mood,
      pet_mood_points: gameState.pet.moodPoints,
      pet_total_steps_all_time: gameState.pet.totalStepsAllTime,
      pet_mining_efficiency: gameState.pet.miningEfficiency,
      pet_evolution_animation: gameState.pet.evolutionAnimation ? 1 : 0,
      stats_steps_today: gameState.stats.stepsToday,
      stats_steps_this_week: gameState.stats.stepsThisWeek,
      stats_steps_this_month: gameState.stats.stepsThisMonth,
      stats_last_step_update: gameState.stats.lastStepUpdate,
      stats_streak: gameState.stats.streak,
      stats_longest_streak: gameState.stats.longestStreak,
      stats_last_active_date: gameState.stats.lastActiveDate,
      stats_daily_history: JSON.stringify(gameState.stats.dailyHistory),
      coins_pending_reward: gameState.coins.pendingReward,
      coins_mining_history: JSON.stringify(gameState.coins.miningHistory),
      last_update_time: Date.now(),
    });

    res.json({ success: true, gameState });
  } catch (error: any) {
    console.error('Add steps error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Claim coins
// @route   POST /api/gamestate/claim-coins
// @access  Private
export const claimCoins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.userId || '0');
    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const gameState = GameState.toAPIFormat(gameStateRow);
    const claimed = Math.floor(gameState.coins.pendingReward);
    
    GameState.update(userId, {
      coins_balance: gameState.coins.balance + claimed,
      coins_total_earned: gameState.coins.totalEarned + claimed,
      coins_pending_reward: 0,
      coins_last_claim_time: Date.now(),
    });

    const updated = GameState.findByUserId(userId)!;
    res.json({ success: true, coinsClaimed: claimed, gameState: GameState.toAPIFormat(updated) });
  } catch (error: any) {
    console.error('Claim coins error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Pet care actions
// @route   POST /api/gamestate/care
// @access  Private
export const petCare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action } = req.body; // 'feed', 'play', 'heal', 'boost'
    const userId = parseInt(req.userId || '0');
    
    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const cost = CARE_COSTS[action as keyof typeof CARE_COSTS];
    if (!cost) {
      res.status(400).json({ success: false, message: 'Invalid care action' });
      return;
    }

    let gameState = GameState.toAPIFormat(gameStateRow);

    if (gameState.coins.balance < cost) {
      res.status(400).json({ success: false, message: 'Insufficient coins' });
      return;
    }

    gameState.coins.balance -= cost;

    switch (action) {
      case 'feed':
        gameState.pet.hunger = Math.min(100, gameState.pet.hunger + 30);
        gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 10);
        gameState.pet.lastFedTime = Date.now();
        break;
      case 'play':
        gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 25);
        gameState.pet.energy = Math.max(0, gameState.pet.energy - 10);
        gameState.pet.lastPlayedTime = Date.now();
        break;
      case 'heal':
        gameState.pet.health = 100;
        break;
      case 'boost':
        gameState.pet.hunger = 100;
        gameState.pet.energy = 100;
        gameState.pet.happiness = 100;
        gameState.pet.health = 100;
        break;
    }

    // Update mood based on stats
    const avgStat = (gameState.pet.hunger + gameState.pet.energy + gameState.pet.happiness + gameState.pet.health) / 4;
    gameState.pet.moodPoints = Math.min(100, avgStat);
    gameState.pet.mood = calculateMood(gameState.pet.moodPoints);

    // Save to database
    GameState.update(userId, {
      coins_balance: gameState.coins.balance,
      pet_hunger: gameState.pet.hunger,
      pet_energy: gameState.pet.energy,
      pet_happiness: gameState.pet.happiness,
      pet_health: gameState.pet.health,
      pet_mood_points: gameState.pet.moodPoints,
      pet_mood: gameState.pet.mood,
      pet_last_fed_time: gameState.pet.lastFedTime,
      pet_last_played_time: gameState.pet.lastPlayedTime,
      last_update_time: Date.now(),
    });

    const updated = GameState.findByUserId(userId)!;
    res.json({ success: true, gameState: GameState.toAPIFormat(updated) });
  } catch (error: any) {
    console.error('Pet care error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Hatch egg
// @route   POST /api/gamestate/hatch
// @access  Private
export const hatchEgg = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.userId || '0');
    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    if (gameStateRow.pet_stage !== 'egg') {
      res.status(400).json({ success: false, message: 'Pet is not an egg' });
      return;
    }

    GameState.update(userId, {
      pet_stage: 'baby',
      pet_hatched: 1,
      pet_mining_efficiency: MINING_EFFICIENCY.baby,
      last_update_time: Date.now(),
    });

    const updated = GameState.findByUserId(userId)!;
    res.json({ success: true, gameState: GameState.toAPIFormat(updated) });
  } catch (error: any) {
    console.error('Hatch egg error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update environment
// @route   PUT /api/gamestate/environment
// @access  Private
export const updateEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { environment } = req.body;
    const userId = parseInt(req.userId || '0');
    
    const validEnvironments = ['meadow', 'space', 'cozy', 'beach'];
    if (!validEnvironments.includes(environment)) {
      res.status(400).json({ success: false, message: 'Invalid environment' });
      return;
    }

    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    GameState.update(userId, {
      pet_environment: environment,
      last_update_time: Date.now(),
    });

    const updated = GameState.findByUserId(userId)!;
    res.json({ success: true, gameState: GameState.toAPIFormat(updated) });
  } catch (error: any) {
    console.error('Update environment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update settings
// @route   PUT /api/gamestate/settings
// @access  Private
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.userId || '0');
    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const { notifications, soundEffects, haptics, theme, stepSource, language, dailyGoal } = req.body;
    const updates: any = {};

    if (notifications !== undefined) updates.settings_notifications = notifications ? 1 : 0;
    if (soundEffects !== undefined) updates.settings_sound_effects = soundEffects ? 1 : 0;
    if (haptics !== undefined) updates.settings_haptics = haptics ? 1 : 0;
    if (theme) updates.settings_theme = theme;
    if (stepSource) updates.settings_step_source = stepSource;
    if (language) updates.settings_language = language;
    if (dailyGoal) updates.stats_daily_goal = dailyGoal;

    updates.last_update_time = Date.now();

    GameState.update(userId, updates);

    const updated = GameState.findByUserId(userId)!;
    res.json({ success: true, gameState: GameState.toAPIFormat(updated) });
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
