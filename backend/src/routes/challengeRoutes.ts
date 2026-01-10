import express from 'express';
import { getChallenges, claimChallenge } from '../controllers/challengeController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getChallenges);
router.post('/:id/claim', claimChallenge);

export default router;

