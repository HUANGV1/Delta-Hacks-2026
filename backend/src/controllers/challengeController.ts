import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query, run, getOne } from './authController';

// Get challenges
export async function getChallenges(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;

        const challenges = query('SELECT * FROM challenges WHERE user_id = ?', [userId]);

        const formatted = challenges.map(c => ({
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

        res.json({ success: true, challenges: formatted });
    } catch (error) {
        console.error('GetChallenges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Claim challenge reward
export async function claimChallenge(req: AuthRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const { challengeId } = req.params;

        const challenge = getOne('SELECT * FROM challenges WHERE id = ? AND user_id = ?', [challengeId, userId]);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (challenge.completed !== 1) {
            return res.status(400).json({ message: 'Challenge not completed' });
        }

        if (challenge.claimed === 1) {
            return res.status(400).json({ message: 'Already claimed' });
        }

        run('UPDATE challenges SET claimed = 1 WHERE id = ? AND user_id = ?', [challengeId, userId]);

        const gs = getOne('SELECT coins_balance, coins_total_earned FROM game_states WHERE user_id = ?', [userId]);
        run('UPDATE game_states SET coins_balance = ?, coins_total_earned = ? WHERE user_id = ?',
            [(gs.coins_balance || 0) + challenge.reward, (gs.coins_total_earned || 0) + challenge.reward, userId]);

        res.json({
            success: true,
            reward: challenge.reward,
        });
    } catch (error) {
        console.error('ClaimChallenge error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
