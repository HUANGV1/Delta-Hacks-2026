// Game logic constants matching frontend
export const EVOLUTION_REQUIREMENTS: Record<string, { level: number; totalSteps: number }> = {
    egg: { level: 0, totalSteps: 0 },
    baby: { level: 1, totalSteps: 500 },
    child: { level: 5, totalSteps: 5000 },
    teen: { level: 15, totalSteps: 25000 },
    adult: { level: 30, totalSteps: 100000 },
    elder: { level: 50, totalSteps: 500000 },
    legendary: { level: 75, totalSteps: 1000000 },
};

export const MINING_EFFICIENCY: Record<string, number> = {
    egg: 0,
    baby: 1.0,
    child: 1.5,
    teen: 2.0,
    adult: 3.0,
    elder: 4.0,
    legendary: 6.0,
};

export const MOOD_THRESHOLDS = {
    ecstatic: 90,
    happy: 70,
    content: 50,
    neutral: 30,
    sad: 15,
    neglected: 0,
};

export const DAILY_STEP_CAP = 100000;
export const STEPS_PER_EXPERIENCE = 10;
export const BASE_COINS_PER_1000_STEPS = 10;

export const CARE_COSTS = {
    feed: 5,
    play: 3,
    heal: 10,
    boost: 15,
};

export function getExperienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.15, level));
}

export function calculateMood(moodPoints: number): string {
    if (moodPoints >= MOOD_THRESHOLDS.ecstatic) return 'ecstatic';
    if (moodPoints >= MOOD_THRESHOLDS.happy) return 'happy';
    if (moodPoints >= MOOD_THRESHOLDS.content) return 'content';
    if (moodPoints >= MOOD_THRESHOLDS.neutral) return 'neutral';
    if (moodPoints >= MOOD_THRESHOLDS.sad) return 'sad';
    return 'neglected';
}

export function getNextEvolution(currentStage: string): string | null {
    const stages = ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
        return stages[currentIndex + 1];
    }
    return null;
}

export function canEvolve(stage: string, level: number, totalSteps: number): boolean {
    const nextStage = getNextEvolution(stage);
    if (!nextStage) return false;

    const requirements = EVOLUTION_REQUIREMENTS[nextStage];
    return level >= requirements.level && totalSteps >= requirements.totalSteps;
}

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
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

export const MARKETPLACE_ITEMS = [
    { id: 'beanie_red', name: 'Red Beanie', type: 'hat', cost: 100, rarity: 'common', description: 'A cozy red beanie' },
    { id: 'sunglasses', name: 'Cool Shades', type: 'glasses', cost: 250, rarity: 'rare', description: 'Block the haters' },
    { id: 'chain_gold', name: 'Gold Chain', type: 'neck', cost: 1000, rarity: 'epic', description: 'Pure 24k gold' },
    { id: 'party_hat', name: 'Party Hat', type: 'hat', cost: 500, rarity: 'uncommon', description: 'Time to celebrate!' },
    { id: 'bow_tie', name: 'Bow Tie', type: 'neck', cost: 150, rarity: 'common', description: 'For formal occasions' },
];
