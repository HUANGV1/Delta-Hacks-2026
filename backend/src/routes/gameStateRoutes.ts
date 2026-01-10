import express from 'express';
import { body } from 'express-validator';
import {
  getGameState,
  initializeGame,
  addSteps,
  claimCoins,
  petCare,
  hatchEgg,
  updateEnvironment,
  updateSettings,
} from '../controllers/gameStateController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getGameState);

router.post(
  '/initialize',
  [
    body('petName').optional().isString().trim(),
    body('petType').optional().isIn(['phoenix', 'dragon', 'spirit', 'nature']),
  ],
  initializeGame
);

router.post(
  '/steps',
  [body('steps').isInt({ min: 0, max: 30000 }).withMessage('Invalid step count')],
  addSteps
);

router.post('/claim-coins', claimCoins);

router.post(
  '/care',
  [body('action').isIn(['feed', 'play', 'heal', 'boost']).withMessage('Invalid care action')],
  petCare
);

router.post('/hatch', hatchEgg);

router.put(
  '/environment',
  [body('environment').isIn(['meadow', 'space', 'cozy', 'beach']).withMessage('Invalid environment')],
  updateEnvironment
);

router.put('/settings', updateSettings);

export default router;

