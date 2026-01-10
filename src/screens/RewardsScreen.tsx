import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { format, subDays } from 'date-fns';
import { MINING_EFFICIENCY } from '../types';
import { 
  CoinsIcon, 
  BoltIcon, 
  ChartIcon, 
  TargetIcon, 
  FootprintsIcon,
  ArrowUpIcon,
  SparklesIcon
} from '../components/Icons';
import type { PetStage } from '../types';

const STAGE_ORDER: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'];

const STAGE_ICONS: Record<PetStage, React.ReactNode> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🦜',
  adult: '🦅',
  elder: '🦉',
  legendary: '🐉',
};

export function RewardsScreen() {
  const coins = useGameStore((s) => s.coins);
  const pet = useGameStore((s) => s.pet);
  const stats = useGameStore((s) => s.stats);
  const claimCoins = useGameStore((s) => s.claimCoins);

  // Mining history chart
  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const historyEntry = coins.miningHistory.find(m => m.date === dateStr);
      return {
        day: format(date, 'EEE'),
        date: dateStr,
        amount: historyEntry?.amount || 0,
        isToday: dateStr === format(today, 'yyyy-MM-dd'),
      };
    });
  }, [coins.miningHistory]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 10);
  const weeklyTotal = chartData.reduce((sum, d) => sum + d.amount, 0);

  // Calculate current mining rate
  const currentMiningRate = pet.miningEfficiency * 10; // coins per 1000 steps

  // Estimated earnings
  const dailyEstimate = Math.round((stats.dailyGoal / 1000) * currentMiningRate);

  return (
    <div className="rewards-screen">
      <header className="screen-header simple">
        <h1 className="screen-title">Rewards</h1>
      </header>

      <div className="rewards-content">
        {/* Balance Card */}
        <section className="balance-card-large">
          <div className="balance-bg-pattern" />
          <div className="balance-content">
            <div className="balance-label">StepCoin Balance</div>
            <div className="balance-amount">
              <span className="balance-icon"><CoinsIcon size={40} color="#fbbf24" filled /></span>
              <span className="balance-value">{coins.balance.toLocaleString()}</span>
            </div>
            
            {coins.pendingReward >= 0.1 && (
              <div className="pending-section">
                <div className="pending-amount">
                  +{coins.pendingReward.toFixed(1)} pending
                </div>
                {coins.pendingReward >= 1 && (
                  <motion.button
                    className="claim-btn-large"
                    onClick={claimCoins}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    Claim {Math.floor(coins.pendingReward)} Coins
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Mining Stats */}
        <section className="mining-stats">
          <div className="mining-stat-card">
            <div className="mining-stat-icon"><BoltIcon size={24} /></div>
            <div className="mining-stat-info">
              <div className="mining-stat-value">{pet.miningEfficiency}x</div>
              <div className="mining-stat-label">Mining Power</div>
            </div>
          </div>
          <div className="mining-stat-card">
            <div className="mining-stat-icon"><ChartIcon size={24} color="#14b8a6" /></div>
            <div className="mining-stat-info">
              <div className="mining-stat-value">{currentMiningRate}</div>
              <div className="mining-stat-label">Coins/1k steps</div>
            </div>
          </div>
          <div className="mining-stat-card highlight">
            <div className="mining-stat-icon"><TargetIcon size={24} color="#8b5cf6" /></div>
            <div className="mining-stat-info">
              <div className="mining-stat-value">~{dailyEstimate}</div>
              <div className="mining-stat-label">Daily Potential</div>
            </div>
          </div>
        </section>

        {/* Mining Power Breakdown */}
        <section className="mining-breakdown">
          <h3 className="section-title">Mining Power by Evolution</h3>
          <div className="power-breakdown">
            {STAGE_ORDER.filter(s => s !== 'egg').map((stage) => {
              const isCurrent = stage === pet.stage;
              const isUnlocked = STAGE_ORDER.indexOf(stage) <= STAGE_ORDER.indexOf(pet.stage);
              
              return (
                <div 
                  key={stage} 
                  className={`power-row ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="power-stage">
                    <span className="power-icon">
                      {STAGE_ICONS[stage]}
                    </span>
                    <span className="power-name">{stage}</span>
                    {isCurrent && <span className="current-tag">Current</span>}
                  </div>
                  <div className="power-value">
                    <span className="power-multiplier">{MINING_EFFICIENCY[stage]}x</span>
                    <span className="power-rate">{MINING_EFFICIENCY[stage] * 10} coins/1k</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weekly Earnings Chart */}
        <section className="earnings-chart">
          <div className="chart-header">
            <h3 className="section-title">Weekly Earnings</h3>
            <span className="chart-total">{weeklyTotal.toLocaleString()}</span>
          </div>
          
          <div className="coin-chart">
            <div className="chart-bars coins">
              {chartData.map((day, i) => (
                <div key={day.date} className="chart-bar-container">
                  <motion.div 
                    className={`chart-bar coin ${day.isToday ? 'today' : ''}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((day.amount / maxAmount) * 100, 5)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    {day.amount > 0 && (
                      <span className="bar-value">{day.amount}</span>
                    )}
                  </motion.div>
                  <span className={`bar-label ${day.isToday ? 'today' : ''}`}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lifetime Stats */}
        <section className="lifetime-stats">
          <h3 className="section-title">Lifetime Stats</h3>
          <div className="lifetime-grid">
            <div className="lifetime-item">
              <div className="lifetime-icon"><CoinsIcon size={24} color="#fbbf24" /></div>
              <div className="lifetime-value">{coins.totalEarned.toLocaleString()}</div>
              <div className="lifetime-label">Total Earned</div>
            </div>
            <div className="lifetime-item">
              <div className="lifetime-icon"><ChartIcon size={24} color="#14b8a6" /></div>
              <div className="lifetime-value">
                {pet.totalStepsAllTime > 0 
                  ? (coins.totalEarned / (pet.totalStepsAllTime / 1000)).toFixed(1)
                  : '0'}
              </div>
              <div className="lifetime-label">Avg per 1k Steps</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <h3 className="section-title">How Mining Works</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon"><FootprintsIcon size={24} /></div>
              <div className="info-text">
                <strong>Walk to Mine</strong>
                <p>Every step you take generates StepCoins based on your pet's mining power.</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon"><ArrowUpIcon size={24} color="#14b8a6" /></div>
              <div className="info-text">
                <strong>Evolve for More</strong>
                <p>As your pet evolves, mining efficiency increases up to 6x!</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon"><SparklesIcon size={24} color="#fbbf24" /></div>
              <div className="info-text">
                <strong>Claim Rewards</strong>
                <p>Accumulated coins need to be claimed. Don't let them pile up!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
