import { Response } from 'express';
import Achievement from '../models/Achievement';
import GameState from '../models/GameState';
import { AuthRequest } from '../middleware/auth';

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
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

// Initialize achievements for a user
export const initializeAchievements = async (userId: string): Promise<void> => {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await Achievement.findOneAndUpdate(
      { userId, achievementId: def.id },
      {
        userId,
        achievementId: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        target: def.target,
        progress: 0,
      },
      { upsert: true, new: true }
    );
  }
};

// Check and update achievements
export const checkAchievements = async (userId: string): Promise<string[]> => {
  const gameState = await GameState.findOne({ userId });
  if (!gameState) return [];

  const unlocked: string[] = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    let achievement = await Achievement.findOne({ userId, achievementId: def.id });
    
    if (!achievement) {
      achievement = await Achievement.create({
        userId,
        achievementId: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        target: def.target,
        progress: 0,
      });
    }

    if (achievement.unlockedAt) continue; // Already unlocked

    // Calculate progress based on achievement type
    let progress = 0;
    
    if (def.id.startsWith('first_steps') || def.id === 'walker' || def.id === 'runner') {
      progress = gameState.stats.stepsToday;
    } else if (def.id === 'marathon') {
      progress = gameState.pet.totalStepsAllTime;
    } else if (def.id.startsWith('streak_')) {
      progress = gameState.stats.streak;
    } else if (def.id === 'hatch') {
      progress = gameState.pet.hatched ? 1 : 0;
    } else if (def.id === 'evolve_child') {
      progress = ['child', 'teen', 'adult', 'elder', 'legendary'].includes(gameState.pet.stage) ? 1 : 0;
    } else if (def.id === 'evolve_adult') {
      progress = ['adult', 'elder', 'legendary'].includes(gameState.pet.stage) ? 1 : 0;
    } else if (def.id === 'evolve_legendary') {
      progress = gameState.pet.stage === 'legendary' ? 1 : 0;
    } else if (def.id.startsWith('coins_')) {
      progress = gameState.coins.totalEarned;
    } else if (def.id.startsWith('level_')) {
      progress = gameState.pet.level;
    }

    achievement.progress = progress;

    if (progress >= def.target && !achievement.unlockedAt) {
      achievement.unlockedAt = Date.now();
      unlocked.push(def.id);
    }

    await achievement.save();
  }

  return unlocked;
};

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Private
export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let achievements = await Achievement.find({ userId: req.userId });

    // Initialize if none exist
    if (achievements.length === 0) {
      await initializeAchievements(req.userId!);
      achievements = await Achievement.find({ userId: req.userId });
    }

    // Update achievements based on current game state
    await checkAchievements(req.userId!);
    achievements = await Achievement.find({ userId: req.userId });

    res.json({ success: true, achievements });
  } catch (error: any) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

