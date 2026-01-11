import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getChallenges, claimChallenge } from '../controllers/challengeController';

const router = Router();

router.get('/', authMiddleware, getChallenges);
router.post('/:challengeId/claim', authMiddleware, claimChallenge);

export default router;
