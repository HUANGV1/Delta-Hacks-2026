import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { Pet3D } from '../components/Pet3D';
import { CARE_COSTS } from '../types';
import { 
  FireIcon, 
  CoinsIcon, 
  FootprintsIcon, 
  TargetIcon, 
  BoltIcon, 
  HeartIcon,
  LeafIcon,
  RocketIcon,
  MoonIcon,
  BeachIcon,
  AppleIcon,
  GamepadIcon,
  ZapIcon
} from '../components/Icons';
import type { EnvironmentType } from '../types';

const environments: { id: EnvironmentType; icon: React.FC<{ size?: number; color?: string }>; label: string }[] = [
  { id: 'meadow', icon: LeafIcon, label: 'Meadow' },
  { id: 'space', icon: RocketIcon, label: 'Space' },
  { id: 'cozy', icon: MoonIcon, label: 'Cozy' },
  { id: 'beach', icon: BeachIcon, label: 'Beach' },
];

export function HomeScreen() {
  const pet = useGameStore((s) => s.pet);
  const stats = useGameStore((s) => s.stats);
  const coins = useGameStore((s) => s.coins);
  const hatchEgg = useGameStore((s) => s.hatchEgg);
  const setEnvironment = useGameStore((s) => s.setEnvironment);
  const addSteps = useGameStore((s) => s.addSteps);
  const claimCoins = useGameStore((s) => s.claimCoins);
  const feedPet = useGameStore((s) => s.feedPet);
  const playWithPet = useGameStore((s) => s.playWithPet);
  
  const [showEnvPicker, setShowEnvPicker] = useState(false);
  const [stepInput, setStepInput] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [showCareMenu, setShowCareMenu] = useState(false);

  useEffect(() => {
    if (!isDemo) return;
    const interval = setInterval(() => {
      addSteps(Math.floor(Math.random() * 100) + 50);
    }, 600);
    return () => clearInterval(interval);
  }, [isDemo, addSteps]);

  const handleAddSteps = () => {
    const steps = parseInt(stepInput);
    if (!isNaN(steps) && steps > 0) {
      addSteps(steps);
      setStepInput('');
    }
  };

  const expPercent = (pet.experience / pet.experienceToNextLevel) * 100;
  const dailyPercent = Math.min((stats.stepsToday / stats.dailyGoal) * 100, 100);
  
  const moodColor: Record<string, string> = {
    ecstatic: '#22c55e',
    happy: '#4ade80',
    content: '#a3e635',
    neutral: '#facc15',
    sad: '#fb923c',
    neglected: '#ef4444',
  };

  const CurrentEnvIcon = environments.find(e => e.id === pet.environment)?.icon || LeafIcon;

  return (
    <div className="home-screen">
      {/* Header */}
      <header className="screen-header">
        <div className="header-left">
          <div className="header-stat streak">
            <span className="stat-icon"><FireIcon size={16} /></span>
            <span className="stat-value">{stats.streak}</span>
          </div>
        </div>
        <div className="header-center">
          <h1 className="brand-name">StepPal</h1>
        </div>
        <div className="header-right">
          <motion.div 
            className="header-coins" 
            whileTap={{ scale: 0.95 }}
          >
            <span className="coins-icon"><CoinsIcon size={18} color="#fbbf24" /></span>
            <span className="coins-value">{coins.balance.toLocaleString()}</span>
          </motion.div>
        </div>
      </header>

      {/* Pet View */}
      <section className="pet-section">
        <div className="pet-view">
          <Pet3D
            stage={pet.stage}
            mood={pet.mood}
            name={pet.name}
            environment={pet.environment}
            onHatch={pet.stage === 'egg' ? hatchEgg : undefined}
          />
          
          {/* Environment Picker */}
          <motion.button
            className="floating-btn env-btn"
            onClick={() => setShowEnvPicker(!showEnvPicker)}
            whileTap={{ scale: 0.9 }}
          >
            <CurrentEnvIcon size={18} />
          </motion.button>

          {/* Mood Badge */}
          <div 
            className="floating-btn mood-badge" 
            style={{ borderColor: moodColor[pet.mood] }}
          >
            <HeartIcon size={18} color={moodColor[pet.mood]} filled />
          </div>

          {/* Care Button */}
          {pet.hatched && (
            <motion.button
              className="floating-btn care-btn"
              onClick={() => setShowCareMenu(!showCareMenu)}
              whileTap={{ scale: 0.9 }}
            >
              <HeartIcon size={18} filled />
            </motion.button>
          )}

          <AnimatePresence>
            {showEnvPicker && (
              <motion.div
                className="floating-menu env-dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                {environments.map((env) => {
                  const EnvIcon = env.icon;
                  return (
                    <button
                      key={env.id}
                      className={`menu-item ${pet.environment === env.id ? 'active' : ''}`}
                      onClick={() => { setEnvironment(env.id); setShowEnvPicker(false); }}
                    >
                      <EnvIcon size={18} />
                      <span>{env.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCareMenu && (
              <motion.div
                className="floating-menu care-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
              >
                <button
                  className="menu-item care-item"
                  onClick={() => { feedPet(); setShowCareMenu(false); }}
                  disabled={coins.balance < CARE_COSTS.feed}
                >
                  <AppleIcon size={18} />
                  <div className="care-info">
                    <span>Feed</span>
                    <span className="care-cost">{CARE_COSTS.feed}</span>
                  </div>
                </button>
                <button
                  className="menu-item care-item"
                  onClick={() => { playWithPet(); setShowCareMenu(false); }}
                  disabled={coins.balance < CARE_COSTS.play}
                >
                  <GamepadIcon size={18} />
                  <div className="care-info">
                    <span>Play</span>
                    <span className="care-cost">{CARE_COSTS.play}</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pet Info Bar */}
        <div className="pet-info-bar">
          <div className="pet-identity">
            <h2 className="pet-name">{pet.name}</h2>
            <span className="pet-stage">{pet.stage} • Lv.{pet.level}</span>
          </div>
          
          {/* Pet Stats */}
          {pet.hatched && (
            <div className="pet-quick-stats">
              <div className="mini-stat" title="Hunger">
                <span className="mini-icon"><AppleIcon size={14} color="#f97316" /></span>
                <div className="mini-bar">
                  <div className="mini-fill" style={{ width: `${pet.hunger}%`, background: '#f97316' }} />
                </div>
              </div>
              <div className="mini-stat" title="Energy">
                <span className="mini-icon"><ZapIcon size={14} color="#eab308" /></span>
                <div className="mini-bar">
                  <div className="mini-fill" style={{ width: `${pet.energy}%`, background: '#eab308' }} />
                </div>
              </div>
              <div className="mini-stat" title="Happiness">
                <span className="mini-icon"><HeartIcon size={14} color="#a855f7" /></span>
                <div className="mini-bar">
                  <div className="mini-fill" style={{ width: `${pet.happiness}%`, background: '#a855f7' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats & Actions */}
      <section className="home-dashboard">
        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon"><FootprintsIcon size={20} /></div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stats.stepsToday.toLocaleString()}</div>
              <div className="stat-card-label">Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon"><TargetIcon size={20} /></div>
            <div className="stat-card-content">
              <div className="stat-card-value">{Math.round(dailyPercent)}%</div>
              <div className="stat-card-label">Daily Goal</div>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-card-icon"><BoltIcon size={20} /></div>
            <div className="stat-card-content">
              <div className="stat-card-value">{pet.miningEfficiency.toFixed(1)}x</div>
              <div className="stat-card-label">Mining Power</div>
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="progress-cards">
          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-title">Daily Progress</span>
              <span className="progress-badge">{stats.stepsToday.toLocaleString()} / {stats.dailyGoal.toLocaleString()}</span>
            </div>
            <div className="progress-track">
              <motion.div 
                className="progress-fill daily"
                animate={{ width: `${dailyPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-title">Experience</span>
              <span className="progress-badge secondary">Level {pet.level}</span>
            </div>
            <div className="progress-track">
              <motion.div 
                className="progress-fill xp"
                animate={{ width: `${expPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="progress-sub">{pet.experience.toLocaleString()} / {pet.experienceToNextLevel.toLocaleString()} XP</div>
          </div>
        </div>

        {/* Rewards Card */}
        <div className="rewards-card">
          <div className="rewards-info">
            <div className="rewards-balance">
              <span className="rewards-icon"><CoinsIcon size={32} color="#fbbf24" filled /></span>
              <div className="rewards-details">
                <span className="rewards-amount">{coins.balance.toLocaleString()}</span>
                <span className="rewards-label">StepCoins</span>
              </div>
            </div>
            {coins.pendingReward >= 0.1 && (
              <div className="pending-rewards">
                +{coins.pendingReward.toFixed(1)} pending
              </div>
            )}
          </div>
          {coins.pendingReward >= 1 && (
            <motion.button
              className="claim-btn"
              onClick={claimCoins}
              whileTap={{ scale: 0.95 }}
            >
              Claim +{Math.floor(coins.pendingReward)}
            </motion.button>
          )}
        </div>

        {/* Step Input */}
        <div className="step-input-section">
          <h3 className="section-title">Log Steps</h3>
          <div className="input-row">
            <input
              type="number"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              placeholder="Enter steps..."
              className="step-input"
            />
            <motion.button
              className="btn-primary"
              onClick={handleAddSteps}
              whileTap={{ scale: 0.95 }}
              disabled={!stepInput}
            >
              Add
            </motion.button>
          </div>
          <div className="quick-add-btns">
            {[500, 1000, 2500, 5000].map((amt) => (
              <motion.button
                key={amt}
                className="quick-add-btn"
                onClick={() => addSteps(amt)}
                whileTap={{ scale: 0.95 }}
              >
                +{amt >= 1000 ? `${amt/1000}k` : amt}
              </motion.button>
            ))}
          </div>
          <motion.button
            className={`demo-btn ${isDemo ? 'active' : ''}`}
            onClick={() => setIsDemo(!isDemo)}
            whileTap={{ scale: 0.98 }}
          >
            {isDemo ? 'Stop Simulation' : 'Simulate Walking'}
          </motion.button>
        </div>
      </section>
    </div>
  );
}
