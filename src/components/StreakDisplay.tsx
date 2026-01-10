import { motion } from 'framer-motion';
import { useGameStore } from '../store';

export function StreakDisplay() {
  const stats = useGameStore((s) => s.stats);

  const getStreakFlames = () => {
    if (stats.streak >= 30) return '🔥🔥🔥';
    if (stats.streak >= 14) return '🔥🔥';
    if (stats.streak >= 7) return '🔥';
    return '';
  };

  const getStreakMessage = () => {
    if (stats.streak >= 30) return 'Legendary streak!';
    if (stats.streak >= 14) return 'On fire!';
    if (stats.streak >= 7) return 'One week strong!';
    if (stats.streak >= 3) return 'Building momentum';
    if (stats.streak >= 1) return 'Keep it going';
    return 'Start today';
  };

  const today = new Date().getDay();

  return (
    <motion.div 
      className="streak-display"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <div className="streak-main">
        <motion.div 
          className="streak-number"
          key={stats.streak}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {stats.streak}
        </motion.div>
        <div className="streak-label">
          <span>Day Streak</span>
          {getStreakFlames() && <span className="streak-flames">{getStreakFlames()}</span>}
        </div>
      </div>
      
      <motion.div 
        className="streak-message"
        key={getStreakMessage()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {getStreakMessage()}
      </motion.div>

      <div className="streak-record">
        <span className="record-icon">🏆</span>
        <span>Best: {stats.longestStreak} days</span>
      </div>

      {/* Weekly progress dots */}
      <div className="week-dots">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
          const isToday = i === today;
          const isPast = i < today;
          const hasActivity = isPast || (isToday && stats.stepsToday > 0);
          
          return (
            <motion.div
              key={i}
              className={`week-dot ${hasActivity ? 'active' : ''} ${isToday ? 'today' : ''}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.2 }}
            >
              <span className="dot-day">{day}</span>
              <div className="dot-circle" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
