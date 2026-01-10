import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import { 
  SunIcon, 
  CalendarIcon, 
  StarIcon, 
  TrophyIcon, 
  CheckIcon
} from '../components/Icons';

export function ChallengesScreen() {
  const challenges = useGameStore((s) => s.challenges);
  const stats = useGameStore((s) => s.stats);
  const claimChallengeReward = useGameStore((s) => s.claimChallengeReward);

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
  const specialChallenges = challenges.filter(c => c.type === 'special');

  const formatTimeLeft = (expiresAt: number) => {
    const now = Date.now();
    if (expiresAt < now) return 'Expired';
    
    const hours = differenceInHours(expiresAt, now);
    const minutes = differenceInMinutes(expiresAt, now) % 60;
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalReward = challenges.filter(c => c.completed && !c.claimed).reduce((sum, c) => sum + c.reward, 0);

  // Unlocked achievements
  const unlockedAchievements = stats.achievements.filter(a => a.unlockedAt);
  const progressAchievements = stats.achievements.filter(a => !a.unlockedAt && a.progress > 0);

  return (
    <div className="challenges-screen">
      <header className="screen-header simple">
        <h1 className="screen-title">Challenges</h1>
      </header>

      <div className="challenges-content">
        {/* Summary */}
        <section className="challenges-summary">
          <div className="summary-stat">
            <div className="summary-value">{completedCount}/{challenges.length}</div>
            <div className="summary-label">Completed</div>
          </div>
          {totalReward > 0 && (
            <div className="summary-reward">
              <span className="reward-text">{totalReward} unclaimed</span>
            </div>
          )}
        </section>

        {/* Daily Challenges */}
        <section className="challenge-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon"><SunIcon size={18} color="#fbbf24" /></span>
              Daily Challenges
            </h2>
            <span className="time-badge">Resets daily</span>
          </div>
          
          <div className="challenge-list">
            {dailyChallenges.map((challenge, i) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onClaim={() => claimChallengeReward(challenge.id)}
                formatTimeLeft={formatTimeLeft}
                delay={i * 0.05}
              />
            ))}
          </div>
        </section>

        {/* Weekly Challenges */}
        <section className="challenge-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon"><CalendarIcon size={18} color="#8b5cf6" /></span>
              Weekly Challenges
            </h2>
            <span className="time-badge">Resets weekly</span>
          </div>
          
          <div className="challenge-list">
            {weeklyChallenges.map((challenge, i) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onClaim={() => claimChallengeReward(challenge.id)}
                formatTimeLeft={formatTimeLeft}
                delay={i * 0.05}
              />
            ))}
          </div>
        </section>

        {/* Special Challenges */}
        <section className="challenge-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon"><StarIcon size={18} color="#f472b6" /></span>
              Special Challenges
            </h2>
          </div>
          
          <div className="challenge-list">
            {specialChallenges.map((challenge, i) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onClaim={() => claimChallengeReward(challenge.id)}
                formatTimeLeft={formatTimeLeft}
                delay={i * 0.05}
              />
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="achievements-section">
          <h2 className="section-title">
            <span className="title-icon"><TrophyIcon size={18} color="#fbbf24" /></span>
            Achievements
          </h2>
          
          {unlockedAchievements.length > 0 && (
            <div className="achievement-group">
              <h3 className="group-title">Unlocked ({unlockedAchievements.length})</h3>
              <div className="achievement-grid">
                {unlockedAchievements.map((achievement) => (
                  <motion.div 
                    key={achievement.id}
                    className="achievement-card unlocked"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="achievement-icon"><TrophyIcon size={20} color="#fbbf24" /></div>
                    <div className="achievement-info">
                      <div className="achievement-name">{achievement.name}</div>
                      <div className="achievement-desc">{achievement.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {progressAchievements.length > 0 && (
            <div className="achievement-group">
              <h3 className="group-title">In Progress</h3>
              <div className="achievement-grid">
                {progressAchievements.slice(0, 4).map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="achievement-card progress"
                  >
                    <div className="achievement-icon"><StarIcon size={20} color="#737373" /></div>
                    <div className="achievement-info">
                      <div className="achievement-name">{achievement.name}</div>
                      <div className="achievement-progress">
                        <div className="progress-track small">
                          <div 
                            className="progress-fill secondary"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                        <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: {
    id: string;
    icon: string;
    title: string;
    description: string;
    target: number;
    current: number;
    reward: number;
    expiresAt: number;
    completed: boolean;
    claimed: boolean;
  };
  onClaim: () => void;
  formatTimeLeft: (expiresAt: number) => string;
  delay: number;
}

function ChallengeCard({ challenge, onClaim, formatTimeLeft, delay }: ChallengeCardProps) {
  const progress = Math.min((challenge.current / challenge.target) * 100, 100);
  
  return (
    <motion.div 
      className={`challenge-card ${challenge.completed ? 'completed' : ''} ${challenge.claimed ? 'claimed' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="challenge-icon"><TargetIcon size={24} /></div>
      
      <div className="challenge-content">
        <div className="challenge-header">
          <h4 className="challenge-title">{challenge.title}</h4>
          <span className="challenge-reward">
            +{challenge.reward}
          </span>
        </div>
        
        <p className="challenge-desc">{challenge.description}</p>
        
        <div className="challenge-progress">
          <div className="progress-track">
            <motion.div 
              className={`progress-fill ${challenge.completed ? 'complete' : 'daily'}`}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-info">
            <span className="progress-numbers">
              {challenge.current.toLocaleString()} / {challenge.target.toLocaleString()}
            </span>
            {!challenge.completed && !challenge.claimed && (
              <span className="time-left">{formatTimeLeft(challenge.expiresAt)}</span>
            )}
          </div>
        </div>
      </div>
      
      {challenge.completed && !challenge.claimed && (
        <motion.button
          className="claim-challenge-btn"
          onClick={onClaim}
          whileTap={{ scale: 0.95 }}
        >
          Claim
        </motion.button>
      )}
      
      {challenge.claimed && (
        <div className="claimed-badge"><CheckIcon size={16} color="#000" /></div>
      )}
    </motion.div>
  );
}

function TargetIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill={color}/>
    </svg>
  );
}
