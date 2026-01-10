import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import GameState from '../models/GameState';
import { AuthRequest } from '../middleware/auth';
import { initializeAchievements } from './achievementController';

// Generate JWT Token
const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id: id.toString() }, secret, { expiresIn } as jwt.SignOptions);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        msg: err.msg,
        param: err.type === 'field' ? err.path : undefined,
      }));
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errorMessages 
      });
      return;
    }

    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
      return;
    }

    // Check if user exists
    const existingEmail = User.findByEmail(email);
    const existingUsername = User.findByUsername(username);
    
    if (existingEmail) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }
    
    if (existingUsername) {
      res.status(400).json({ success: false, message: 'This username is already taken' });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Initialize achievements
    initializeAchievements(user.id);

    // Initialize game state
    const gameState = GameState.create(user.id, {
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
    });

    res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      gameState: GameState.toAPIFormat(gameState),
    });
  } catch (error: any) {
    console.error('Register error:', error);
    const errorMessage = error.message || 'An unexpected error occurred during registration';
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        msg: err.msg,
        param: err.type === 'field' ? err.path : undefined,
      }));
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errorMessages 
      });
      return;
    }

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
      return;
    }

    // Check for user
    const user = User.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error.message || 'An unexpected error occurred during login';
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.userId || '0');
    const user = User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
