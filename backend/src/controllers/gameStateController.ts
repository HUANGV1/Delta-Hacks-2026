import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { saveDatabase } from '../config/database';
import { query, run, getOne } from './authController';
import { format, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns';
import {
    MINING_EFFICIENCY,
    DAILY_STEP_CAP,
    STEPS_PER_EXPERIENCE,
    BASE_COINS_PER_1000_STEPS,
    CARE_COSTS,
    getExperienceForLevel,
    calculateMood,
    canEvolve,
    getNextEvolution,
    ACHIEVEMENT_DEFINITIONS,
    MARKETPLACE_ITEMS,
} from '../utils/gameLogic';

// Helper to format game state for frontend
function formatGameState(gs: any, achievements: any[], challenges: any[]) {
    const miningEfficiency = MINING_EFFICIENCY[gs.pet_stage] || 0;
    const moodPoints = gs.pet_mood_points || 50;

    return {
        pet: {
            name: gs.pet_name || '',
            type: gs.pet_type || 'phoenix',
            stage: gs.pet_stage || 'egg',
            level: gs.pet_level || 0,
            experience: gs.pet_experience || 0,
            experienceToNextLevel: getExperienceForLevel(gs.pet_level || 0),
            mood: calculateMood(moodPoints),
            moodPoints,
            totalStepsAllTime: gs.steps_all_time || 0,
            miningEfficiency,
            lastFedTime: gs.pet_last_fed_time || Date.now(),
            lastPlayedTime: gs.pet_last_played_time || Date.now(),
            hatched: gs.pet_hatched === 1,
            evolutionAnimation: false,
            environment: gs.pet_environment || 'meadow',
            hunger: gs.pet_hunger || 80,
            energy: gs.pet_energy || 80,
            happiness: gs.pet_happiness || 70,
            health: gs.pet_health || 100,
            unlockables: [],
            cosmetics: JSON.parse(gs.pet_cosmetics || '{}'),
        },
        inventory: JSON.parse(gs.inventory || '[]'),
        stats: {
            stepsToday: gs.steps_today || 0,
            stepsThisWeek: gs.steps_this_week || 0,
            stepsThisMonth: 0,
            lastStepUpdate: gs.last_step_update || new Date().toISOString(),
            streak: gs.streak || 0,
            longestStreak: gs.longest_streak || 0,
            lastActiveDate: gs.last_active_date || '',
            dailyGoal: gs.daily_goal || 8000,
            weeklyGoal: gs.weekly_goal || 50000,
            dailyHistory: JSON.parse(gs.daily_history || '[]'),
            weeklyHistory: [],
            achievements: achievements.map(a => {
                const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === a.id);
                return {
                    id: a.id,
                    name: def?.name || a.id,
                    description: def?.description || '',
                    icon: def?.icon || '🏆',
                    progress: a.progress || 0,
                    target: def?.target || 1,
                    unlockedAt: a.unlocked_at,
                };
            }),
        },
        coins: {
            balance: gs.coins_balance || 0,
            pendingReward: gs.coins_pending || 0,
            totalEarned: gs.coins_total_earned || 0,
            lastClaimTime: gs.last_claim_time || Date.now(),
            miningRate: BASE_COINS_PER_1000_STEPS,
            miningHistory: JSON.parse(gs.mining_history || '[]'),
        },
        crates: {
            available: gs.crates_available || 0,
            opened: gs.crates_opened || 0,
            stepsTowardNext: gs.steps_toward_next_crate || 0,
            stepsRequired: 3000,
        },
        challenges,
        initialized: gs.initialized === 1,
        lastUpdateTime: gs.last_update_time || Date.now(),
        currentScreen: 'home',
        notifications: [],
        settings: JSON.parse(gs.settings || '{}'),
    };
}

function getFormattedChallenges(userId: number) {
    const challenges = query('SELECT * FROM challenges WHERE user_id = ?', [userId]);
    return challenges.map(c => ({
        id: c.id,
        type: c.type,
        title: c.title,
        description: c.description,
        icon: c.icon,
        target: c.target,
        current: c.current,
        reward: c.reward,
        expiresAt: c.expires_at,
        completed: c.completed === 1,
        claimed: c.claimed === 1,
    }));
}

// Get game state
export async function getGameState(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;

        const gs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        if (!gs) {
            return res.status(404).json({ message: 'Game state not found' });
        }

        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(gs, achievements, challenges),
        });
    } catch (error) {
        console.error('GetGameState error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Initialize game
export async function initializeGame(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { petName, petType } = req.body;

        if (!petName) {
            return res.status(400).json({ message: 'Pet name is required' });
        }

        const now = Date.now();

        run(`
      UPDATE game_states SET
        pet_name = ?,
        pet_type = ?,
        initialized = 1,
        last_update_time = ?
      WHERE user_id = ?
    `, [petName, petType || 'phoenix', now, userId]);

        // Generate daily challenges
        generateChallengesForUser(userId);

        const gs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(gs, achievements, challenges),
        });
    } catch (error) {
        console.error('InitializeGame error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Add steps
export async function addSteps(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { steps } = req.body;

        if (!steps || steps <= 0) {
            return res.status(400).json({ message: 'Valid step count required' });
        }

        const gs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);

        if (!gs) {
            return res.status(404).json({ message: 'Game state not found' });
        }

        const today = format(new Date(), 'yyyy-MM-dd');
        let stepsToday = gs.steps_today || 0;
        let stepsThisWeek = gs.steps_this_week || 0;
        let streak = gs.streak || 0;
        let dailyHistory = JSON.parse(gs.daily_history || '[]');

        // Check if new day
        if (gs.last_step_update) {
            const lastUpdate = parseISO(gs.last_step_update);
            if (!isToday(lastUpdate)) {
                if (stepsToday > 0) {
                    const yesterdayDate = format(lastUpdate, 'yyyy-MM-dd');
                    const existingIdx = dailyHistory.findIndex((d: any) => d.date === yesterdayDate);
                    if (existingIdx >= 0) {
                        dailyHistory[existingIdx].steps = stepsToday;
                    } else {
                        dailyHistory.push({ date: yesterdayDate, steps: stepsToday });
                    }
                    dailyHistory = dailyHistory.slice(-30);
                }

                const daysSinceLastActive = differenceInDays(startOfDay(new Date()), startOfDay(lastUpdate));
                if (daysSinceLastActive === 1 && stepsToday >= (gs.daily_goal || 8000) * 0.5) {
                    streak += 1;
                } else if (daysSinceLastActive > 1) {
                    streak = 1;
                }

                stepsToday = 0;
                if (new Date().getDay() === 0 && lastUpdate.getDay() !== 0) {
                    stepsThisWeek = 0;
                }
            }
        } else {
            streak = 1;
        }

        const remainingCap = Math.max(0, DAILY_STEP_CAP - stepsToday);
        const effectiveSteps = Math.min(steps, remainingCap);

        if (effectiveSteps <= 0) {
            return res.json({ success: true, message: 'Daily cap reached', gameState: null });
        }

        const miningEfficiency = MINING_EFFICIENCY[gs.pet_stage] || 0;
        const experienceGain = Math.floor(effectiveSteps / STEPS_PER_EXPERIENCE);
        const coinsEarned = (effectiveSteps / 1000) * BASE_COINS_PER_1000_STEPS * miningEfficiency;

        const moodBoost = Math.min(30, effectiveSteps / 200);
        const newMoodPoints = Math.min(100, (gs.pet_mood_points || 50) + moodBoost);

        let newExperience = (gs.pet_experience || 0) + experienceGain;
        let newLevel = gs.pet_level || 0;
        let expToNext = getExperienceForLevel(newLevel);

        while (newExperience >= expToNext && gs.pet_hatched === 1) {
            newExperience -= expToNext;
            newLevel += 1;
            expToNext = getExperienceForLevel(newLevel);
        }

        const newTotalSteps = (gs.steps_all_time || 0) + effectiveSteps;
        const newStepsToday = stepsToday + effectiveSteps;
        const newStepsThisWeek = stepsThisWeek + effectiveSteps;

        // Crate Logic
        let cratesAvailable = gs.crates_available || 0;
        let stepsTowardNextCrate = (gs.steps_toward_next_crate || 0) + effectiveSteps;
        const CRATE_STEP_THRESHOLD = 3000;

        while (stepsTowardNextCrate >= CRATE_STEP_THRESHOLD) {
            stepsTowardNextCrate -= CRATE_STEP_THRESHOLD;
            cratesAvailable += 1;
        }

        let newStage = gs.pet_stage;
        if (gs.pet_hatched === 1 && canEvolve(gs.pet_stage, newLevel, newTotalSteps)) {
            const nextStage = getNextEvolution(gs.pet_stage);
            if (nextStage) {
                newStage = nextStage;
            }
        }

        const newEnergy = Math.max(0, (gs.pet_energy || 80) - Math.floor(effectiveSteps / 2000));
        const newHunger = Math.max(0, (gs.pet_hunger || 80) - Math.floor(effectiveSteps / 3000));
        const newLongestStreak = Math.max(gs.longest_streak || 0, streak);

        run(`
      UPDATE game_states SET
        pet_experience = ?,
        pet_level = ?,
        pet_mood_points = ?,
        pet_stage = ?,
        pet_energy = ?,
        pet_hunger = ?,
        steps_today = ?,
        steps_this_week = ?,
        steps_all_time = ?,
        streak = ?,
        longest_streak = ?,
        last_step_update = ?,
        last_active_date = ?,
        daily_history = ?,
        coins_pending = ?,
        crates_available = ?,
        steps_toward_next_crate = ?,
        last_update_time = ?
      WHERE user_id = ?
    `, [
            newExperience,
            newLevel,
            Math.round(newMoodPoints),
            newStage,
            newEnergy,
            newHunger,
            newStepsToday,
            newStepsThisWeek,
            newTotalSteps,
            streak,
            newLongestStreak,
            new Date().toISOString(),
            today,
            JSON.stringify(dailyHistory),
            (gs.coins_pending || 0) + coinsEarned,
            cratesAvailable,
            stepsTowardNextCrate,
            Date.now(),
            userId
        ]);

        // Update challenges
        run(`
      UPDATE challenges SET current = ?, completed = CASE WHEN ? >= target THEN 1 ELSE 0 END
      WHERE user_id = ? AND claimed = 0 AND (title LIKE '%step%' OR title LIKE '%Walk%' OR title LIKE '%Target%' OR title LIKE '%Master%')
    `, [newStepsToday, newStepsToday, userId]);

        updateAchievements(userId, { totalSteps: newTotalSteps, stepsToday: newStepsToday, streak, level: newLevel });

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('AddSteps error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Open Crate
export async function openCrate(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;

        const gs = getOne('SELECT coins_balance, coins_total_earned, crates_available, crates_opened FROM game_states WHERE user_id = ?', [userId]);

        if (!gs || (gs.crates_available || 0) < 1) {
            return res.status(400).json({ message: 'No crates available' });
        }

        // Crate Reward Logic
        const random = Math.random();
        let rewardAmount = 50;
        let rarity = 'common';

        // 0.0001 (0.01%) -> 500 coins
        if (random < 0.0001) {
            rewardAmount = 500;
            rarity = 'legendary';
        }
        // 0.0001 + 0.0049 = 0.005 (0.5%) -> 200 coins
        else if (random < 0.005) {
            rewardAmount = 200;
            rarity = 'epic';
        }
        // 0.005 + 0.015 = 0.02 (1.5% + 0.5% = 2%) -> 175 coins
        else if (random < 0.02) {
            rewardAmount = 175;
            rarity = 'rare';
        }
        // 0.02 + 0.03 + 0.05 = 0.10 (8% + 2% = 10%) -> 150 coins (Combining 3% and 5% requests)
        else if (random < 0.10) {
            rewardAmount = 150;
            rarity = 'rare';
        }
        // 0.10 + 0.10 = 0.20 (10% + 10% = 20%) -> 100 coins
        else if (random < 0.20) {
            rewardAmount = 100;
            rarity = 'uncommon';
        }
        // Remaining 80% -> 50 coins
        else {
            rewardAmount = 50;
            rarity = 'common';
        }


        run(`
      UPDATE game_states SET
        coins_balance = ?,
        coins_total_earned = ?,
        crates_available = ?,
        crates_opened = ?,
        last_update_time = ?
      WHERE user_id = ?
    `, [
            (gs.coins_balance || 0) + rewardAmount,
            (gs.coins_total_earned || 0) + rewardAmount,
            (gs.crates_available || 0) - 1,
            (gs.crates_opened || 0) + 1,
            Date.now(),
            userId
        ]);

        updateAchievements(userId, { totalCoins: (gs.coins_total_earned || 0) + rewardAmount });

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            reward: {
                amount: rewardAmount,
                rarity: rarity
            },
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('OpenCrate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Claim coins
export async function claimCoins(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;

        const gs = getOne('SELECT coins_pending, coins_balance, coins_total_earned, mining_history FROM game_states WHERE user_id = ?', [userId]);

        if (!gs || gs.coins_pending < 1) {
            return res.status(400).json({ message: 'No coins to claim' });
        }

        const claimAmount = Math.floor(gs.coins_pending);
        const today = format(new Date(), 'yyyy-MM-dd');

        let miningHistory = JSON.parse(gs.mining_history || '[]');
        const existingIdx = miningHistory.findIndex((m: any) => m.date === today);
        if (existingIdx >= 0) {
            miningHistory[existingIdx].amount += claimAmount;
        } else {
            miningHistory.push({ date: today, amount: claimAmount });
        }
        miningHistory = miningHistory.slice(-30);

        run(`
      UPDATE game_states SET
        coins_balance = ?,
        coins_pending = ?,
        coins_total_earned = ?,
        last_claim_time = ?,
        mining_history = ?
      WHERE user_id = ?
    `, [
            (gs.coins_balance || 0) + claimAmount,
            (gs.coins_pending || 0) - claimAmount,
            (gs.coins_total_earned || 0) + claimAmount,
            Date.now(),
            JSON.stringify(miningHistory),
            userId
        ]);

        updateAchievements(userId, { totalCoins: (gs.coins_total_earned || 0) + claimAmount });

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            claimed: claimAmount,
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('ClaimCoins error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Pet care
export async function petCare(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { action } = req.body;

        if (!action || !['feed', 'play', 'heal', 'boost'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const cost = CARE_COSTS[action as keyof typeof CARE_COSTS];

        const gs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);

        if (gs.coins_balance < cost) {
            return res.status(400).json({ message: 'Insufficient coins' });
        }

        const now = Date.now();
        let hunger = gs.pet_hunger;
        let energy = gs.pet_energy;
        let happiness = gs.pet_happiness;
        let health = gs.pet_health;
        let moodPoints = gs.pet_mood_points;
        let lastFed = gs.pet_last_fed_time;
        let lastPlayed = gs.pet_last_played_time;

        switch (action) {
            case 'feed':
                hunger = Math.min(100, hunger + 30);
                happiness = Math.min(100, happiness + 10);
                moodPoints = Math.min(100, moodPoints + 15);
                lastFed = now;
                break;
            case 'play':
                happiness = Math.min(100, happiness + 25);
                energy = Math.max(0, energy - 10);
                moodPoints = Math.min(100, moodPoints + 20);
                lastPlayed = now;
                break;
            case 'heal':
                health = 100;
                moodPoints = Math.min(100, moodPoints + 10);
                break;
            case 'boost':
                energy = 100;
                hunger = 100;
                happiness = 100;
                moodPoints = 100;
                break;
        }

        run(`
      UPDATE game_states SET
        coins_balance = ?,
        pet_hunger = ?,
        pet_energy = ?,
        pet_happiness = ?,
        pet_health = ?,
        pet_mood_points = ?,
        pet_last_fed_time = ?,
        pet_last_played_time = ?,
        last_update_time = ?
      WHERE user_id = ?
    `, [
            gs.coins_balance - cost,
            hunger,
            energy,
            happiness,
            health,
            moodPoints,
            lastFed,
            lastPlayed,
            now,
            userId
        ]);

        run(`UPDATE challenges SET current = 1, completed = 1 WHERE user_id = ? AND claimed = 0 AND title LIKE '%Care%'`, [userId]);

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('PetCare error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Hatch egg
export async function hatchEgg(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;

        run(`
      UPDATE game_states SET
        pet_stage = 'baby',
        pet_level = 1,
        pet_hatched = 1,
        last_update_time = ?
      WHERE user_id = ? AND pet_hatched = 0
    `, [Date.now(), userId]);

        run(`UPDATE achievements SET progress = 1, unlocked_at = ? WHERE user_id = ? AND id = 'hatch'`, [Date.now(), userId]);

        const gs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(gs, achievements, challenges),
        });
    } catch (error) {
        console.error('HatchEgg error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update environment
export async function updateEnvironment(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { environment } = req.body;

        if (!environment || !['meadow', 'space', 'cozy', 'beach'].includes(environment)) {
            return res.status(400).json({ message: 'Invalid environment' });
        }

        run('UPDATE game_states SET pet_environment = ?, last_update_time = ? WHERE user_id = ?', [environment, Date.now(), userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('UpdateEnvironment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update settings
export async function updateSettings(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const settings = req.body;

        const gs = getOne('SELECT settings FROM game_states WHERE user_id = ?', [userId]);

        const currentSettings = JSON.parse(gs.settings || '{}');
        const newSettings = { ...currentSettings, ...settings };

        run('UPDATE game_states SET settings = ?, last_update_time = ? WHERE user_id = ?', [JSON.stringify(newSettings), Date.now(), userId]);

        res.json({ success: true, settings: newSettings });
    } catch (error) {
        console.error('UpdateSettings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Helper functions
function generateChallengesForUser(userId: number) {
    const now = Date.now();
    const endOfDay = new Date().setHours(23, 59, 59, 999);
    const endOfWeek = now + 7 * 24 * 60 * 60 * 1000;

    const challenges = [
        { id: `daily_morning_${now}`, type: 'daily', title: 'Morning Walk', description: 'Take 2,000 steps before noon', icon: '🌅', target: 2000, reward: 25, expires_at: endOfDay },
        { id: `daily_target_${now}`, type: 'daily', title: 'Daily Target', description: 'Reach your daily step goal', icon: '🎯', target: 8000, reward: 50, expires_at: endOfDay },
        { id: `daily_care_${now}`, type: 'daily', title: 'Care for Your Pet', description: 'Feed or play with your pet today', icon: '❤️', target: 1, reward: 15, expires_at: endOfDay },
        { id: `weekly_marathon_${now}`, type: 'weekly', title: 'Weekly Marathon', description: 'Walk 50,000 steps this week', icon: '🏃', target: 50000, reward: 200, expires_at: endOfWeek },
        { id: `weekly_streak_${now}`, type: 'weekly', title: 'Perfect Week', description: 'Maintain a 7-day streak', icon: '🔥', target: 7, reward: 150, expires_at: endOfWeek },
        { id: `special_master_${now}`, type: 'special', title: 'Step Master', description: 'Take 15,000 steps in a single day', icon: '⚡', target: 15000, reward: 100, expires_at: now + 72 * 60 * 60 * 1000 },
    ];

    run('DELETE FROM challenges WHERE user_id = ?', [userId]);

    for (const c of challenges) {
        run('INSERT INTO challenges (id, user_id, type, title, description, icon, target, reward, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [c.id, userId, c.type, c.title, c.description, c.icon, c.target, c.reward, c.expires_at]);
    }
}

function updateAchievements(userId: number, data: { totalSteps?: number; stepsToday?: number; streak?: number; level?: number; totalCoins?: number }) {
    const now = Date.now();

    if (data.totalSteps !== undefined) {
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [Math.min(data.totalSteps, 100), userId, 'first_steps']);
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.totalSteps, userId, 'marathon']);
    }

    if (data.stepsToday !== undefined) {
        const current = query('SELECT id, progress FROM achievements WHERE user_id = ? AND id IN (?, ?)', [userId, 'walker', 'runner']);
        for (const a of current) {
            if (data.stepsToday > a.progress) {
                run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.stepsToday, userId, a.id]);
            }
        }
    }

    if (data.streak !== undefined) {
        const current = query('SELECT id, progress FROM achievements WHERE user_id = ? AND id IN (?, ?, ?)', [userId, 'streak_3', 'streak_7', 'streak_30']);
        for (const a of current) {
            if (data.streak > a.progress) {
                run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.streak, userId, a.id]);
            }
        }
    }

    if (data.level !== undefined) {
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.level, userId, 'level_10']);
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.level, userId, 'level_25']);
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.level, userId, 'level_50']);
    }

    if (data.totalCoins !== undefined) {
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.totalCoins, userId, 'coins_100']);
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.totalCoins, userId, 'coins_1000']);
        run('UPDATE achievements SET progress = ? WHERE user_id = ? AND id = ?', [data.totalCoins, userId, 'coins_10000']);
    }

    // Check unlocks
    const targets: Record<string, number> = {
        first_steps: 100, walker: 5000, runner: 10000, marathon: 42000,
        streak_3: 3, streak_7: 7, streak_30: 30,
        level_10: 10, level_25: 25, level_50: 50,
        coins_100: 100, coins_1000: 1000, coins_10000: 10000
    };

    for (const [id, target] of Object.entries(targets)) {
        const a = getOne('SELECT progress, unlocked_at FROM achievements WHERE user_id = ? AND id = ?', [userId, id]);
        if (a && a.progress >= target && !a.unlocked_at) {
            run('UPDATE achievements SET unlocked_at = ? WHERE user_id = ? AND id = ?', [now, userId, id]);
        }
    }
}

// Buy Item
export async function buyItem(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { itemId } = req.body;

        const item = MARKETPLACE_ITEMS.find(i => i.id === itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const gs = getOne('SELECT coins_balance, inventory FROM game_states WHERE user_id = ?', [userId]);
        if (!gs) {
            return res.status(404).json({ message: 'Game state not found' });
        }

        const balance = gs.coins_balance || 0;
        if (balance < item.cost) {
            return res.status(400).json({ message: 'Insufficient coins' });
        }

        const inventory = JSON.parse(gs.inventory || '[]');
        if (inventory.some((i: any) => i.id === itemId)) {
            return res.status(400).json({ message: 'Item already owned' });
        }

        inventory.push({ ...item, acquiredAt: Date.now() });
        const newBalance = balance - item.cost;

        run('UPDATE game_states SET coins_balance = ?, inventory = ? WHERE user_id = ?', [newBalance, JSON.stringify(inventory), userId]);

        console.log(`[Backend] Item bought: ${itemId} by user ${userId}`);

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('BuyItem error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Equip Item
export async function equipItem(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { itemId, slot } = req.body;

        const gs = getOne('SELECT inventory, pet_cosmetics FROM game_states WHERE user_id = ?', [userId]);
        if (!gs) {
            return res.status(404).json({ message: 'Game state not found' });
        }

        const inventory = JSON.parse(gs.inventory || '[]');
        const cosmetics = JSON.parse(gs.pet_cosmetics || '{}');

        // Verify ownership if equipping
        if (itemId) {
            if (!inventory.some((i: any) => i.id === itemId)) {
                return res.status(400).json({ message: 'Item not owned' });
            }
            cosmetics[slot] = itemId;
        } else {
            // Unequip
            delete cosmetics[slot];
        }

        run('UPDATE game_states SET pet_cosmetics = ? WHERE user_id = ?', [JSON.stringify(cosmetics), userId]);

        // Calculate Net Worth based on equipped items
        let netWorth = 0;
        const equippedItems = Object.values(cosmetics);

        equippedItems.forEach((id: any) => {
            const item = MARKETPLACE_ITEMS.find(i => i.id === id);
            if (item) {
                netWorth += item.cost;
            }
        });

        run('UPDATE game_states SET net_worth = ? WHERE user_id = ?', [netWorth, userId]);

        console.log(`[Backend] Item equipped: ${itemId} in slot ${slot} for user ${userId}. New cosmetics:`, cosmetics, `Net Worth: ${netWorth}`);

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('EquipItem error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get Leaderboard
export async function getLeaderboard(req: AuthRequest, res: Response) {
    try {
        const { search } = req.query;
        let queryStr = `
            SELECT 
                u.username, 
                gs.pet_name, 
                gs.pet_stage, 
                gs.net_worth,
                gs.pet_type,
                gs.user_id
            FROM game_states gs
            JOIN users u ON gs.user_id = u.id
        `;

        const params: any[] = [];

        if (search) {
            queryStr += ` WHERE u.username LIKE ?`;
            params.push(`%${search}%`);
        }

        queryStr += ` ORDER BY gs.net_worth DESC LIMIT 50`;

        const leaderboard = query(queryStr, params);

        res.json({
            success: true,
            leaderboard,
        });
    } catch (error) {
        console.error('GetLeaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Reset Steps (Debug/Admin)
export async function resetSteps(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;

        run(`
      UPDATE game_states SET
        steps_today = 0,
        steps_this_week = 0,
        steps_all_time = 0,
        streak = 0,
        daily_history = '[]',
        last_update_time = ?
      WHERE user_id = ?
    `, [Date.now(), userId]);

        // Also reset achievements related to steps? User just asked to "reset steps to 0".
        // Assuming they want a fresh start on steps.
        run(`UPDATE achievements SET progress = 0, unlocked_at = NULL WHERE user_id = ? AND (id LIKE '%steps%' OR id = 'walker' OR id = 'runner' OR id = 'marathon')`, [userId]);

        const updatedGs = getOne('SELECT * FROM game_states WHERE user_id = ?', [userId]);
        const achievements = query('SELECT * FROM achievements WHERE user_id = ?', [userId]);
        const challenges = getFormattedChallenges(userId);

        res.json({
            success: true,
            gameState: formatGameState(updatedGs, achievements, challenges),
        });
    } catch (error) {
        console.error('ResetSteps error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
