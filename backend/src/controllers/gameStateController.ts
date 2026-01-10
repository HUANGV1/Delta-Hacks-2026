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
    let gameState = await GameState.findOne({ userId: req.userId });
    
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    // Update mood based on mood points
    gameState.pet.mood = calculateMood(gameState.pet.moodPoints);
    
    // Update mining efficiency based on stage
    gameState.pet.miningEfficiency = MINING_EFFICIENCY[gameState.pet.stage];
    
    await gameState.save();

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
    
    let gameState = await GameState.findOne({ userId: req.userId });
    
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    if (gameState.initialized) {
      res.status(400).json({ success: false, message: 'Game already initialized' });
      return;
    }

    gameState.pet.name = petName || 'Pet';
    gameState.pet.type = petType || 'phoenix';
    gameState.initialized = true;
    gameState.lastUpdateTime = Date.now();

    await gameState.save();

    res.json({ success: true, gameState });
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
    
    if (!steps || steps < 0 || steps > DAILY_STEP_CAP) {
      res.status(400).json({ success: false, message: 'Invalid step count' });
      return;
    }

    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const isToday = gameState.stats.lastStepUpdate === today;

    // Update step history
    let stepHistory = await StepHistory.findOne({ userId: req.userId, date: today });
    if (!stepHistory) {
      stepHistory = await StepHistory.create({
        userId: req.userId!,
        date: today,
        steps: 0,
      });
    }

    // Add steps
    const newSteps = isToday ? steps : Math.min(steps, DAILY_STEP_CAP);
    stepHistory.steps += newSteps;
    await stepHistory.save();

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
    const miningEntry = gameState.coins.miningHistory.find(m => m.date === today);
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
    const dailyEntry = gameState.stats.dailyHistory.find(d => d.date === today);
    if (dailyEntry) {
      dailyEntry.steps = gameState.stats.stepsToday;
    } else {
      gameState.stats.dailyHistory.push({ date: today, steps: gameState.stats.stepsToday });
    }

    gameState.lastUpdateTime = Date.now();
    await gameState.save();

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
    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const claimed = Math.floor(gameState.coins.pendingReward);
    gameState.coins.balance += claimed;
    gameState.coins.totalEarned += claimed;
    gameState.coins.pendingReward = 0;
    gameState.coins.lastClaimTime = Date.now();

    await gameState.save();

    res.json({ success: true, coinsClaimed: claimed, gameState });
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
    
    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const cost = CARE_COSTS[action as keyof typeof CARE_COSTS];
    if (!cost) {
      res.status(400).json({ success: false, message: 'Invalid care action' });
      return;
    }

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

    gameState.lastUpdateTime = Date.now();
    await gameState.save();

    res.json({ success: true, gameState });
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
    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    if (gameState.pet.stage !== 'egg') {
      res.status(400).json({ success: false, message: 'Pet is not an egg' });
      return;
    }

    gameState.pet.stage = 'baby';
    gameState.pet.hatched = true;
    gameState.pet.miningEfficiency = MINING_EFFICIENCY.baby;
    gameState.lastUpdateTime = Date.now();

    await gameState.save();

    res.json({ success: true, gameState });
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
    
    const validEnvironments = ['meadow', 'space', 'cozy', 'beach'];
    if (!validEnvironments.includes(environment)) {
      res.status(400).json({ success: false, message: 'Invalid environment' });
      return;
    }

    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    gameState.pet.environment = environment;
    gameState.lastUpdateTime = Date.now();
    await gameState.save();

    res.json({ success: true, gameState });
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
    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const { notifications, soundEffects, haptics, theme, stepSource, language, dailyGoal } = req.body;

    if (notifications !== undefined) gameState.settings.notifications = notifications;
    if (soundEffects !== undefined) gameState.settings.soundEffects = soundEffects;
    if (haptics !== undefined) gameState.settings.haptics = haptics;
    if (theme) gameState.settings.theme = theme;
    if (stepSource) gameState.settings.stepSource = stepSource;
    if (language) gameState.settings.language = language;
    if (dailyGoal) gameState.stats.dailyGoal = dailyGoal;

    gameState.lastUpdateTime = Date.now();
    await gameState.save();

    res.json({ success: true, gameState });
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

