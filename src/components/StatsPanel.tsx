import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { DAILY_STEP_CAP } from '../types';

export function StatsPanel() {
  const pet = useGameStore((s) => s.pet);
  const stats = useGameStore((s) => s.stats);

  const expPercent = (pet.experience / pet.experienceToNextLevel) * 100;
  const dailyPercent = Math.min((stats.stepsToday / stats.dailyGoal) * 100, 100);
  const cappedPercent = (stats.stepsToday / DAILY_STEP_CAP) * 100;

  return (
    <motion.div 
      className="stats-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Level & Experience */}
      <div className="stat-block">
        <div className="stat-header">
          <span className="stat-label">Level {pet.level}</span>
          <span className="stat-value">{pet.experience.toLocaleString()} / {pet.experienceToNextLevel.toLocaleString()} XP</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill exp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${expPercent}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      {/* Daily Steps */}
      <div className="stat-block">
        <div className="stat-header">
          <span className="stat-label">Today's Steps</span>
          <span className="stat-value">{stats.stepsToday.toLocaleString()} / {stats.dailyGoal.toLocaleString()}</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill steps-fill"
            initial={{ width: 0 }}
            animate={{ width: `${dailyPercent}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
          {stats.stepsToday >= stats.dailyGoal && (
            <motion.span 
              className="goal-achieved"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              ✓
            </motion.span>
          )}
        </div>
        {stats.stepsToday > stats.dailyGoal && (
          <div className="overflow-bar">
            <motion.div 
              className="progress-fill overflow-fill"
              animate={{ width: `${Math.min(cappedPercent, 100)}%` }}
            />
            <span className="cap-label">Daily limit: {DAILY_STEP_CAP.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Mood */}
      <div className="stat-block mood-block">
        <div className="stat-header">
          <span className="stat-label">Mood</span>
          <span className="stat-value mood-value">{pet.mood}</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill mood-fill"
            animate={{ width: `${pet.moodPoints}%` }}
            transition={{ duration: 0.5 }}
            style={{
              background: pet.moodPoints > 70 
                ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                : pet.moodPoints > 40 
                  ? 'linear-gradient(90deg, #eab308, #facc15)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)'
            }}
          />
        </div>
      </div>

      {/* Total Steps & Mining */}
      <div className="stat-block total-steps">
        <div className="stat-row">
          <span className="stat-icon">👣</span>
          <div>
            <span className="stat-mini-label">Total Steps</span>
            <span className="stat-big-value">{pet.totalStepsAllTime.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="stat-block mining-block">
        <div className="stat-row">
          <span className="stat-icon">⚡</span>
          <div>
            <span className="stat-mini-label">Mining Power</span>
            <span className="stat-big-value">{pet.miningEfficiency.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
