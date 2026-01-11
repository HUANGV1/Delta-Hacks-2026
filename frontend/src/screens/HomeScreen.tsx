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
  BoxIcon,
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
  const crates = useGameStore((s) => s.crates);
  const setGameState = useGameStore((s) => s.setGameState);
  const setScreen = useGameStore((s) => s.setScreen);

  const [showEnvPicker, setShowEnvPicker] = useState(false);
  const [stepInput, setStepInput] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [showCareMenu, setShowCareMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crateReward, setCrateReward] = useState<{ amount: number; rarity: string } | null>(null);

  // Remove unused callApi helper

  const handleAddSteps = async () => {
    const steps = parseInt(stepInput);
    if (isNaN(steps) || steps <= 0 || isLoading) return;

    setIsLoading(true);
    try {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.addSteps(steps);
      if (response.success && response.data) {
        const gameState = (response.data as any).gameState;
        if (gameState) {
          setGameState(gameState);
        }
      }
      setStepInput('');
    } catch (error) {
      console.error('Failed to add steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCoins = async () => {
    if (coins.pendingReward < 1 || isLoading) return;

    setIsLoading(true);
    try {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.claimCoins();
      if (response.success && response.data) {
        const gameState = (response.data as any).gameState;
        if (gameState) {
          setGameState(gameState);
        }
      }
    } catch (error) {
      console.error('Failed to claim coins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCrate = async () => {
    if ((crates?.available || 0) < 1 || isLoading) return;

    setIsLoading(true);
    try {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.openCrate();
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.gameState) {
          setGameState(data.gameState);
        }
        if (data.reward) {
          setCrateReward(data.reward);
        }
      }
    } catch (error) {
      console.error('Failed to open crate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHatchEgg = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.hatchEgg();
      if (response.success && response.data) {
        const gameState = (response.data as any).gameState;
        if (gameState) {
          setGameState(gameState);
        }
      }
    } catch (error) {
      console.error('Failed to hatch egg:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePetCare = async (action: 'feed' | 'play' | 'heal' | 'boost') => {
    if (isLoading) return;

    setIsLoading(true);
    setShowCareMenu(false);
    try {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.petCare(action);
      if (response.success && response.data) {
        const gameState = (response.data as any).gameState;
        if (gameState) {
          setGameState(gameState);
        }
      }
    } catch (error) {
      console.error('Failed to care for pet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEnvironment = async (env: EnvironmentType) => {
    setShowEnvPicker(false);
    try {
      const apiService = (await import('../services/api')).default;
      await apiService.updateEnvironment(env);
      setGameState({ pet: { ...pet, environment: env } });
    } catch (error) {
      console.error('Failed to update environment:', error);
    }
  };

  useEffect(() => {
    if (!isDemo) return;
    const interval = setInterval(async () => {
      const apiService = (await import('../services/api')).default;
      const response = await apiService.addSteps(Math.floor(Math.random() * 100) + 50);
      if (response.success && response.data) {
        const gameState = (response.data as any).gameState;
        if (gameState) {
          setGameState(gameState);
        }
      }
    }, 600);
    return () => clearInterval(interval);
  }, [isDemo, setGameState]);

  const expPercent = (pet.experience / pet.experienceToNextLevel) * 100;
  const dailyPercent = Math.min((stats.stepsToday / stats.dailyGoal) * 100, 100);
  const cratePercent = Math.min(((crates?.stepsTowardNext || 0) / (crates?.stepsRequired || 3000)) * 100, 100);

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
            onHatch={pet.stage === 'egg' ? handleHatchEgg : undefined}
            cosmetics={pet.cosmetics}
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
                      onClick={() => handleSetEnvironment(env.id)}
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
                  onClick={() => handlePetCare('feed')}
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
                  onClick={() => handlePetCare('play')}
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
              onClick={handleClaimCoins}
              whileTap={{ scale: 0.95 }}
            >
              Claim +{Math.floor(coins.pendingReward)}
            </motion.button>
          )}

          {/* Crate Section (Moved to Rewards) */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BoxIcon size={20} color="#8b5cf6" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>Crates</span>
              </div>
              <span className="progress-badge highlight" style={{ fontSize: '0.8rem' }}>{crates?.available || 0} Available</span>
            </div>

            <div className="progress-track" style={{ marginBottom: '8px' }}>
              <motion.div
                className="progress-fill crate"
                animate={{ width: `${cratePercent}%` }}
                transition={{ duration: 0.5 }}
                style={{ background: '#8b5cf6' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>{crates?.stepsTowardNext || 0} / {crates?.stepsRequired || 3000} steps</span>
              {(crates?.available || 0) > 0 && (
                <motion.button
                  onClick={handleOpenCrate}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BoxIcon size={14} /> Open
                </motion.button>
              )}
            </div>
          </div>


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
                onClick={async () => {
                  const apiService = (await import('../services/api')).default;
                  const response = await apiService.addSteps(amt);
                  if (response.success && response.data) {
                    const gameState = (response.data as any).gameState;
                    if (gameState) {
                      setGameState(gameState);
                    }
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
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
      {/* Crate Reward Modal */}
      <AnimatePresence>
        {crateReward && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
            }}
            onClick={() => setCrateReward(null)}
          >
            <motion.div
              className="reward-modal"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1e293b', padding: '32px', borderRadius: '24px',
                textAlign: 'center', maxWidth: '300px', width: '90%',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {crateReward.rarity === 'legendary' ? '💎' :
                  crateReward.rarity === 'epic' ? '🌟' :
                    crateReward.rarity === 'rare' ? '💰' : '🪙'}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                {crateReward.rarity === 'legendary' ? 'MEGA JACKPOT!' :
                  crateReward.rarity === 'epic' ? 'JACKPOT!' :
                    crateReward.rarity === 'rare' ? 'LUCKY!' : 'Crate Opened!'}
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                You found <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{crateReward.amount} StepCoins</span>!
              </p>
              <motion.button
                onClick={() => setCrateReward(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: '#fbbf24', color: 'black', border: 'none',
                  padding: '12px 24px', borderRadius: '12px',
                  fontWeight: 'bold', cursor: 'pointer', width: '100%'
                }}
              >
                Collect
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
