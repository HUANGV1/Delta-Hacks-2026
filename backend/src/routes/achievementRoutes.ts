import express from 'express';
import { getAchievements } from '../controllers/achievementController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getAchievements);

export default router;

