import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    getGameState,
    initializeGame,
    addSteps,
    claimCoins,
    petCare,
    hatchEgg,
    updateEnvironment,
    updateSettings,
    openCrate,
    buyItem,
    equipItem,
    resetSteps,
    getLeaderboard,
} from '../controllers/gameStateController';

const router = Router();

router.get('/', authMiddleware, getGameState);
router.post('/initialize', authMiddleware, initializeGame);
router.post('/steps', authMiddleware, addSteps);
router.post('/claim-coins', authMiddleware, claimCoins);
router.post('/care', authMiddleware, petCare);
router.post('/hatch', authMiddleware, hatchEgg);
router.post('/open-crate', authMiddleware, openCrate);
router.put('/environment', authMiddleware, updateEnvironment);
router.put('/settings', authMiddleware, updateSettings);
router.post('/buy-item', authMiddleware, buyItem);
router.post('/equip-item', authMiddleware, equipItem);
router.post('/reset-steps', authMiddleware, resetSteps);
router.get('/leaderboard', authMiddleware, getLeaderboard);

export default router;
