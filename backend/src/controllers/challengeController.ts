import { Response } from 'express';
import Challenge from '../models/Challenge';
import GameState from '../models/GameState';
import { AuthRequest } from '../middleware/auth';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';

// Generate daily challenges
const generateDailyChallenges = (userId: number) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const expiresAt = new Date(tomorrow.setHours(0, 0, 0, 0)).getTime();

  return [
    {
      user_id: userId,
      type: 'daily' as const,
      title: 'Daily Steps',
      description: 'Walk 5,000 steps today',
      icon: '👣',
      target: 5000,
      current: 0,
      reward: 10,
      expires_at: expiresAt,
      completed: 0,
      claimed: 0,
    },
    {
      user_id: userId,
      type: 'daily' as const,
      title: 'Active Hour',
      description: 'Walk 1,000 steps in one hour',
      icon: '⏰',
      target: 1000,
      current: 0,
      reward: 5,
      expires_at: expiresAt,
      completed: 0,
      claimed: 0,
    },
  ];
};

// Generate weekly challenges
const generateWeeklyChallenges = (userId: number) => {
  const today = new Date();
  const weekEnd = endOfWeek(today);
  const expiresAt = new Date(weekEnd.setHours(23, 59, 59, 999)).getTime();

  return [
    {
      user_id: userId,
      type: 'weekly' as const,
      title: 'Weekly Warrior',
      description: 'Walk 50,000 steps this week',
      icon: '🏃',
      target: 50000,
      current: 0,
      reward: 50,
      expires_at: expiresAt,
      completed: 0,
      claimed: 0,
    },
    {
      user_id: userId,
      type: 'weekly' as const,
      title: 'Consistency King',
      description: 'Maintain a 5-day streak',
      icon: '🔥',
      target: 5,
      current: 0,
      reward: 30,
      expires_at: expiresAt,
      completed: 0,
      claimed: 0,
    },
  ];
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
export const getChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.userId || '0');
    
    // Get or create daily challenges
    const today = format(new Date(), 'yyyy-MM-dd');
    let dailyChallenges = Challenge.findActiveByUserId(userId).filter(c => c.type === 'daily');

    if (dailyChallenges.length === 0) {
      // Create new daily challenges
      const newDaily = generateDailyChallenges(userId);
      dailyChallenges = Challenge.insertMany(newDaily);
    }

    // Get or create weekly challenges
    let weeklyChallenges = Challenge.findActiveByUserId(userId).filter(c => c.type === 'weekly');

    if (weeklyChallenges.length === 0) {
      // Create new weekly challenges
      const newWeekly = generateWeeklyChallenges(userId);
      weeklyChallenges = Challenge.insertMany(newWeekly);
    }

    // Get special challenges
    const specialChallenges = Challenge.findActiveByUserId(userId).filter(c => c.type === 'special');

    const allChallenges = [...dailyChallenges, ...weeklyChallenges, ...specialChallenges];

    // Update challenge progress based on game state
    const gameStateRow = GameState.findByUserId(userId);
    if (gameStateRow) {
      const gameState = GameState.toAPIFormat(gameStateRow);
      
      for (const challenge of allChallenges) {
        let current = challenge.current;
        
        if (challenge.title === 'Daily Steps' || challenge.title === 'Weekly Warrior') {
          current = gameState.stats.stepsToday;
          if (challenge.type === 'weekly') {
            current = gameState.stats.stepsThisWeek;
          }
        } else if (challenge.title === 'Consistency King') {
          current = gameState.stats.streak;
        }

        const completed = current >= challenge.target ? 1 : 0;
        
        if (current !== challenge.current || completed !== challenge.completed) {
          Challenge.update(challenge.id, {
            current,
            completed,
          });
        }
      }
    }

    // Reload challenges with updates
    const updatedChallenges = Challenge.findActiveByUserId(userId);
    const formatted = updatedChallenges.map(c => Challenge.toAPIFormat(c));

    res.json({ success: true, challenges: formatted });
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
    const userId = parseInt(req.userId || '0');
    const challengeId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    
    const challenge = Challenge.findById(challengeId);

    if (!challenge || challenge.user_id !== userId) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    if (challenge.completed === 0) {
      res.status(400).json({ success: false, message: 'Challenge not completed' });
      return;
    }

    if (challenge.claimed === 1) {
      res.status(400).json({ success: false, message: 'Reward already claimed' });
      return;
    }

    // Add coins to game state
    const gameStateRow = GameState.findByUserId(userId);
    if (!gameStateRow) {
      res.status(404).json({ success: false, message: 'Game state not found' });
      return;
    }

    const gameState = GameState.toAPIFormat(gameStateRow);
    
    GameState.update(userId, {
      coins_balance: gameState.coins.balance + challenge.reward,
      coins_total_earned: gameState.coins.totalEarned + challenge.reward,
    });
    
    Challenge.update(challengeId, { claimed: 1 });

    res.json({ success: true, challenge: Challenge.toAPIFormat(challenge), coinsEarned: challenge.reward });
  } catch (error: any) {
    console.error('Claim challenge error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
