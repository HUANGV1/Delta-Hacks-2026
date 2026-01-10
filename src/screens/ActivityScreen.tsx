import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { format, subDays } from 'date-fns';
import {
  FootprintsIcon,
  FireIcon,
  MapPinIcon,
  ClockIcon,
  BoltIcon
} from '../components/Icons';

export function ActivityScreen() {
  const stats = useGameStore((s) => s.stats);
  const pet = useGameStore((s) => s.pet);

  // Generate last 7 days data for chart
  const weekData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const historyEntry = stats.dailyHistory.find(d => d.date === dateStr);
      return {
        day: format(date, 'EEE'),
        date: dateStr,
        steps: historyEntry?.steps || (dateStr === format(today, 'yyyy-MM-dd') ? stats.stepsToday : 0),
        isToday: dateStr === format(today, 'yyyy-MM-dd'),
      };
    });
    return days;
  }, [stats.dailyHistory, stats.stepsToday]);

  const maxSteps = Math.max(...weekData.map(d => d.steps), stats.dailyGoal);
  const weeklyTotal = weekData.reduce((sum, d) => sum + d.steps, 0);
  const weeklyAverage = Math.round(weeklyTotal / 7);
  const dailyPercent = Math.min((stats.stepsToday / stats.dailyGoal) * 100, 100);
  const weeklyPercent = Math.min((weeklyTotal / stats.weeklyGoal) * 100, 100);

  // Calculate calories (rough estimate: 0.04 cal per step)
  const caloriesTotal = Math.round(pet.totalStepsAllTime * 0.04);
  const caloriesToday = Math.round(stats.stepsToday * 0.04);

  // Calculate distance (rough estimate: 0.0008 km per step)
  const distanceTotal = (pet.totalStepsAllTime * 0.0008).toFixed(1);
  const distanceToday = (stats.stepsToday * 0.0008).toFixed(1);

  return (
    <div className="activity-screen">
      <header className="screen-header simple">
        <h1 className="screen-title">Activity</h1>
      </header>

      <div className="activity-content">
        {/* Today's Stats */}
        <section className="activity-section">
          <h2 className="section-label">Today</h2>
          <div className="today-stats">
            <div className="big-stat-card">
              <div className="big-stat-icon"><FootprintsIcon size={32} color="#8b5cf6" /></div>
              <div className="big-stat-value">{stats.stepsToday.toLocaleString()}</div>
              <div className="big-stat-label">steps</div>
              <div className="big-stat-progress">
                <div className="progress-track large">
                  <motion.div 
                    className="progress-fill daily"
                    animate={{ width: `${dailyPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="progress-text">{Math.round(dailyPercent)}% of goal</span>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-tile">
                <span className="tile-icon"><FireIcon size={20} /></span>
                <span className="tile-value">{caloriesToday}</span>
                <span className="tile-label">calories</span>
              </div>
              <div className="stat-tile">
                <span className="tile-icon"><MapPinIcon size={20} color="#14b8a6" /></span>
                <span className="tile-value">{distanceToday}</span>
                <span className="tile-label">km</span>
              </div>
              <div className="stat-tile">
                <span className="tile-icon"><ClockIcon size={20} color="#a855f7" /></span>
                <span className="tile-value">{Math.round(stats.stepsToday / 100)}</span>
                <span className="tile-label">minutes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Chart */}
        <section className="activity-section">
          <div className="section-header">
            <h2 className="section-label">This Week</h2>
            <span className="section-badge">{weeklyTotal.toLocaleString()} steps</span>
          </div>

          <div className="week-chart">
            <div className="chart-bars">
              {weekData.map((day, i) => (
                <div key={day.date} className="chart-bar-container">
                  <motion.div 
                    className={`chart-bar ${day.isToday ? 'today' : ''} ${day.steps >= stats.dailyGoal ? 'goal-met' : ''}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((day.steps / maxSteps) * 100, 5)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    {day.steps > 0 && (
                      <span className="bar-value">{(day.steps / 1000).toFixed(1)}k</span>
                    )}
                  </motion.div>
                  <span className={`bar-label ${day.isToday ? 'today' : ''}`}>{day.day}</span>
                </div>
              ))}
            </div>
            <div className="chart-goal-line" style={{ bottom: `${(stats.dailyGoal / maxSteps) * 100}%` }}>
              <span className="goal-label">Goal: {(stats.dailyGoal / 1000).toFixed(0)}k</span>
            </div>
          </div>

          <div className="week-summary">
            <div className="summary-item">
              <span className="summary-label">Weekly Goal</span>
              <div className="summary-progress">
                <div className="progress-track">
                  <motion.div 
                    className="progress-fill secondary"
                    animate={{ width: `${weeklyPercent}%` }}
                  />
                </div>
                <span className="summary-text">{Math.round(weeklyPercent)}%</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-label">Daily Average</span>
              <span className="summary-value">{weeklyAverage.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* All Time Stats */}
        <section className="activity-section">
          <h2 className="section-label">All Time</h2>
          <div className="alltime-grid">
            <div className="alltime-card">
              <div className="alltime-icon"><FootprintsIcon size={24} color="#8b5cf6" /></div>
              <div className="alltime-value">{pet.totalStepsAllTime.toLocaleString()}</div>
              <div className="alltime-label">Total Steps</div>
            </div>
            <div className="alltime-card">
              <div className="alltime-icon"><FireIcon size={24} /></div>
              <div className="alltime-value">{caloriesTotal.toLocaleString()}</div>
              <div className="alltime-label">Calories Burned</div>
            </div>
            <div className="alltime-card">
              <div className="alltime-icon"><MapPinIcon size={24} color="#14b8a6" /></div>
              <div className="alltime-value">{distanceTotal}</div>
              <div className="alltime-label">Kilometers</div>
            </div>
            <div className="alltime-card highlight">
              <div className="alltime-icon"><BoltIcon size={24} /></div>
              <div className="alltime-value">{stats.longestStreak}</div>
              <div className="alltime-label">Best Streak</div>
            </div>
          </div>
        </section>

        {/* Streak Info */}
        <section className="activity-section">
          <div className="streak-card">
            <div className="streak-flame"><FireIcon size={36} /></div>
            <div className="streak-info">
              <div className="streak-value">{stats.streak} Day Streak</div>
              <div className="streak-sub">Keep walking daily to maintain your streak!</div>
            </div>
            {stats.streak > 0 && (
              <div className="streak-bonus">
                <span>+{Math.min(stats.streak * 5, 50)}%</span>
                <span>bonus</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
