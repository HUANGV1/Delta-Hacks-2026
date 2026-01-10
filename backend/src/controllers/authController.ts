import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import GameState from '../models/GameState';
import { AuthRequest } from '../middleware/auth';

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Initialize game state
    const gameState = await GameState.create({
      userId: user._id,
      pet: {
        name: 'Pet',
        type: 'phoenix',
        stage: 'egg',
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        mood: 'neutral',
        moodPoints: 50,
        totalStepsAllTime: 0,
        miningEfficiency: 0,
        lastFedTime: 0,
        lastPlayedTime: 0,
        hatched: false,
        evolutionAnimation: false,
        environment: 'meadow',
        hunger: 100,
        energy: 100,
        happiness: 50,
        health: 100,
        unlockables: [],
        cosmetics: {},
      },
      stats: {
        stepsToday: 0,
        stepsThisWeek: 0,
        stepsThisMonth: 0,
        lastStepUpdate: new Date().toISOString().split('T')[0],
        streak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        dailyGoal: 10000,
        weeklyGoal: 70000,
        dailyHistory: [],
        weeklyHistory: [],
      },
      coins: {
        balance: 0,
        pendingReward: 0,
        totalEarned: 0,
        lastClaimTime: 0,
        miningRate: 10,
        miningHistory: [],
      },
      settings: {
        notifications: true,
        soundEffects: true,
        haptics: true,
        theme: 'dark',
        stepSource: 'manual',
        language: 'en',
      },
      initialized: false,
      lastUpdateTime: Date.now(),
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      gameState,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

