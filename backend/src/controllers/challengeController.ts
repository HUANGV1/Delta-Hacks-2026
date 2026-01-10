import { Response } from 'express';
import Challenge from '../models/Challenge';
import GameState from '../models/GameState';
import { AuthRequest } from '../middleware/auth';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';

// Generate daily challenges
const generateDailyChallenges = (userId: string) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const expiresAt = new Date(tomorrow.setHours(0, 0, 0, 0)).getTime();

  return [
    {
      userId,
      type: 'daily' as const,
      title: 'Daily Steps',
      description: 'Walk 5,000 steps today',
      icon: '👣',
      target: 5000,
      current: 0,
      reward: 10,
      expiresAt,
      completed: false,
      claimed: false,
    },
    {
      userId,
      type: 'daily' as const,
      title: 'Active Hour',
      description: 'Walk 1,000 steps in one hour',
      icon: '⏰',
      target: 1000,
      current: 0,
      reward: 5,
      expiresAt,
      completed: false,
      claimed: false,
    },
  ];
};

// Generate weekly challenges
const generateWeeklyChallenges = (userId: string) => {
  const today = new Date();
  const weekEnd = endOfWeek(today);
  const expiresAt = new Date(weekEnd.setHours(23, 59, 59, 999)).getTime();

  return [
    {
      userId,
      type: 'weekly' as const,
      title: 'Weekly Warrior',
      description: 'Walk 50,000 steps this week',
      icon: '🏃',
      target: 50000,
      current: 0,
      reward: 50,
      expiresAt,
      completed: false,
      claimed: false,
    },
    {
      userId,
      type: 'weekly' as const,
      title: 'Consistency King',
      description: 'Maintain a 5-day streak',
      icon: '🔥',
      target: 5,
      current: 0,
      reward: 30,
      expiresAt,
      completed: false,
      claimed: false,
    },
  ];
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
export const getChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get or create daily challenges
    const today = format(new Date(), 'yyyy-MM-dd');
    let dailyChallenges = await Challenge.find({
      userId: req.userId,
      type: 'daily',
      expiresAt: { $gte: Date.now() },
    });

    if (dailyChallenges.length === 0) {
      // Create new daily challenges
      const newDaily = generateDailyChallenges(req.userId!);
      const created = await Challenge.insertMany(newDaily);
      dailyChallenges = await Challenge.find({ _id: { $in: created.map(c => c._id) } });
    }

    // Get or create weekly challenges
    const weekStart = startOfWeek(new Date());
    let weeklyChallenges = await Challenge.find({
      userId: req.userId,
      type: 'weekly',
      expiresAt: { $gte: Date.now() },
    });

    if (weeklyChallenges.length === 0) {
      // Create new weekly challenges
      const newWeekly = generateWeeklyChallenges(req.userId!);
      const created = await Challenge.insertMany(newWeekly);
      weeklyChallenges = await Challenge.find({ _id: { $in: created.map(c => c._id) } });
    }

    // Get special challenges
    const specialChallenges = await Challenge.find({
      userId: req.userId,
      type: 'special',
      expiresAt: { $gte: Date.now() },
    });

    const allChallenges = [...dailyChallenges, ...weeklyChallenges, ...specialChallenges];

    // Update challenge progress based on game state
    const gameState = await GameState.findOne({ userId: req.userId });
    if (gameState) {
      for (const challenge of allChallenges) {
        if (challenge.title === 'Daily Steps' || challenge.title === 'Weekly Warrior') {
          challenge.current = gameState.stats.stepsToday;
          if (challenge.type === 'weekly') {
            challenge.current = gameState.stats.stepsThisWeek;
          }
        } else if (challenge.title === 'Consistency King') {
          challenge.current = gameState.stats.streak;
        }

        if (challenge.current >= challenge.target && !challenge.completed) {
          challenge.completed = true;
        }

        await challenge.save();
      }
    }

    res.json({ success: true, challenges: allChallenges });
  } catch (error: any) {
    console.error('Get challenges error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Claim challenge reward
// @route   POST /api/challenges/:id/claim
// @access  Private
export const claimChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    if (!challenge.completed) {
      res.status(400).json({ success: false, message: 'Challenge not completed' });
      return;
    }

    if (challenge.claimed) {
      res.status(400).json({ success: false, message: 'Reward already claimed' });
      return;
    }

    // Add coins to game state
    const gameState = await GameState.findOne({ userId: req.userId });
    if (!gameState) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    gameState.coins.balance += challenge.reward;
    gameState.coins.totalEarned += challenge.reward;
    challenge.claimed = true;

    await Promise.all([gameState.save(), challenge.save()]);

    res.json({ success: true, challenge, coinsEarned: challenge.reward });
  } catch (error: any) {
    console.error('Claim challenge error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

