import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { STAGE_NAMES, CARE_COSTS } from '../types';
import {
  AppleIcon,
  ZapIcon,
  HeartIcon,
  GamepadIcon,
  PillIcon,
  SparklesIcon,
  CalendarIcon,
  TrophyIcon,
  FootprintsIcon,
  CoinsIcon,
  BellIcon,
  SpeakerIcon,
  VibrateIcon,
  InfoIcon
} from '../components/Icons';

export function ProfileScreen() {
  const pet = useGameStore((s) => s.pet);
  const stats = useGameStore((s) => s.stats);
  const coins = useGameStore((s) => s.coins);
  const settings = useGameStore((s) => s.settings);
  const feedPet = useGameStore((s) => s.feedPet);
  const playWithPet = useGameStore((s) => s.playWithPet);
  const healPet = useGameStore((s) => s.healPet);
  const boostPet = useGameStore((s) => s.boostPet);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetGame = useGameStore((s) => s.resetGame);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'pet' | 'settings'>('pet');

  const unlockedAchievements = stats.achievements.filter(a => a.unlockedAt).length;
  const totalAchievements = stats.achievements.length;

  // Calculate days since started (rough estimate)
  const daysSinceStart = stats.dailyHistory.length || 1;

  const STAGE_ICONS: Record<string, string> = {
    egg: '🥚',
    baby: '🐣',
    child: '🐥',
    teen: '🦜',
    adult: '🦅',
    elder: '🦉',
    legendary: '🐉',
  };

  return (
    <div className="profile-screen">
      <header className="screen-header simple">
        <h1 className="screen-title">Profile</h1>
      </header>

      <div className="profile-content">
        {/* Pet Card */}
        <section className="profile-pet-card">
          <div className="pet-avatar">
            <span className="avatar-emoji">{STAGE_ICONS[pet.stage]}</span>
          </div>
          <div className="pet-profile-info">
            <h2 className="pet-profile-name">{pet.name}</h2>
            <span className="pet-profile-stage">{STAGE_NAMES[pet.stage]} • Level {pet.level}</span>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === 'pet' ? 'active' : ''}`}
            onClick={() => setActiveTab('pet')}
          >
            Pet Care
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'pet' ? (
            <motion.div
              key="pet"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="tab-content"
            >
              {/* Pet Stats */}
              <section className="pet-stats-section">
                <h3 className="section-title">Pet Status</h3>
                <div className="pet-stats-grid">
                  <div className="pet-stat-item">
                    <div className="stat-header">
                      <span className="stat-icon"><AppleIcon size={18} color="#f97316" /></span>
                      <span className="stat-name">Hunger</span>
                      <span className="stat-percent">{Math.round(pet.hunger)}%</span>
                    </div>
                    <div className="stat-bar">
                      <div className="stat-fill hunger" style={{ width: `${pet.hunger}%` }} />
                    </div>
                  </div>
                  <div className="pet-stat-item">
                    <div className="stat-header">
                      <span className="stat-icon"><ZapIcon size={18} color="#eab308" /></span>
                      <span className="stat-name">Energy</span>
                      <span className="stat-percent">{Math.round(pet.energy)}%</span>
                    </div>
                    <div className="stat-bar">
                      <div className="stat-fill energy" style={{ width: `${pet.energy}%` }} />
                    </div>
                  </div>
                  <div className="pet-stat-item">
                    <div className="stat-header">
                      <span className="stat-icon"><HeartIcon size={18} color="#a855f7" /></span>
                      <span className="stat-name">Happiness</span>
                      <span className="stat-percent">{Math.round(pet.happiness)}%</span>
                    </div>
                    <div className="stat-bar">
                      <div className="stat-fill happiness" style={{ width: `${pet.happiness}%` }} />
                    </div>
                  </div>
                  <div className="pet-stat-item">
                    <div className="stat-header">
                      <span className="stat-icon"><HeartIcon size={18} color="#ef4444" filled /></span>
                      <span className="stat-name">Health</span>
                      <span className="stat-percent">{Math.round(pet.health)}%</span>
                    </div>
                    <div className="stat-bar">
                      <div className="stat-fill health" style={{ width: `${pet.health}%` }} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Care Actions */}
              <section className="care-actions">
                <h3 className="section-title">Care Actions</h3>
                <div className="care-grid">
                  <motion.button
                    className="care-action-btn"
                    onClick={feedPet}
                    disabled={coins.balance < CARE_COSTS.feed}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="care-icon"><AppleIcon size={28} color="#f97316" /></span>
                    <span className="care-name">Feed</span>
                    <span className="care-cost">{CARE_COSTS.feed}</span>
                    <span className="care-effect">+30 Hunger, +10 Happiness</span>
                  </motion.button>
                  
                  <motion.button
                    className="care-action-btn"
                    onClick={playWithPet}
                    disabled={coins.balance < CARE_COSTS.play}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="care-icon"><GamepadIcon size={28} color="#8b5cf6" /></span>
                    <span className="care-name">Play</span>
                    <span className="care-cost">{CARE_COSTS.play}</span>
                    <span className="care-effect">+25 Happiness, -10 Energy</span>
                  </motion.button>
                  
                  <motion.button
                    className="care-action-btn"
                    onClick={healPet}
                    disabled={coins.balance < CARE_COSTS.heal || pet.health >= 100}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="care-icon"><PillIcon size={28} color="#14b8a6" /></span>
                    <span className="care-name">Heal</span>
                    <span className="care-cost">{CARE_COSTS.heal}</span>
                    <span className="care-effect">Restore full health</span>
                  </motion.button>
                  
                  <motion.button
                    className="care-action-btn boost"
                    onClick={boostPet}
                    disabled={coins.balance < CARE_COSTS.boost}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="care-icon"><SparklesIcon size={28} color="#fbbf24" /></span>
                    <span className="care-name">Super Boost</span>
                    <span className="care-cost">{CARE_COSTS.boost}</span>
                    <span className="care-effect">Max all stats!</span>
                  </motion.button>
                </div>
              </section>

              {/* Journey Stats */}
              <section className="journey-stats">
                <h3 className="section-title">Your Journey</h3>
                <div className="journey-grid">
                  <div className="journey-item">
                    <div className="journey-icon"><CalendarIcon size={24} color="#8b5cf6" /></div>
                    <div className="journey-value">{daysSinceStart}</div>
                    <div className="journey-label">Days Active</div>
                  </div>
                  <div className="journey-item">
                    <div className="journey-icon"><TrophyIcon size={24} color="#fbbf24" /></div>
                    <div className="journey-value">{unlockedAchievements}/{totalAchievements}</div>
                    <div className="journey-label">Achievements</div>
                  </div>
                  <div className="journey-item">
                    <div className="journey-icon"><FootprintsIcon size={24} color="#14b8a6" /></div>
                    <div className="journey-value">{(pet.totalStepsAllTime / 1000).toFixed(1)}k</div>
                    <div className="journey-label">Total Steps</div>
                  </div>
                  <div className="journey-item">
                    <div className="journey-icon"><CoinsIcon size={24} color="#fbbf24" /></div>
                    <div className="journey-value">{coins.totalEarned.toLocaleString()}</div>
                    <div className="journey-label">Coins Earned</div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="tab-content"
            >
              {/* Settings */}
              <section className="settings-section">
                <h3 className="section-title">Preferences</h3>
                
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon"><BellIcon size={20} color="#a855f7" /></span>
                      <span className="setting-name">Notifications</span>
                    </div>
                    <button 
                      className={`toggle-btn ${settings.notifications ? 'on' : 'off'}`}
                      onClick={() => updateSettings({ notifications: !settings.notifications })}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon"><SpeakerIcon size={20} color="#14b8a6" /></span>
                      <span className="setting-name">Sound Effects</span>
                    </div>
                    <button 
                      className={`toggle-btn ${settings.soundEffects ? 'on' : 'off'}`}
                      onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon"><VibrateIcon size={20} color="#fbbf24" /></span>
                      <span className="setting-name">Haptic Feedback</span>
                    </div>
                    <button 
                      className={`toggle-btn ${settings.haptics ? 'on' : 'off'}`}
                      onClick={() => updateSettings({ haptics: !settings.haptics })}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Goals */}
              <section className="settings-section">
                <h3 className="section-title">Daily Goal</h3>
                <div className="goal-options">
                  {[5000, 8000, 10000, 15000].map((goal) => (
                    <button
                      key={goal}
                      className={`goal-btn ${stats.dailyGoal === goal ? 'active' : ''}`}
                      onClick={() => {
                        useGameStore.setState(s => ({
                          stats: { ...s.stats, dailyGoal: goal }
                        }));
                      }}
                    >
                      {(goal / 1000)}k steps
                    </button>
                  ))}
                </div>
              </section>

              {/* About */}
              <section className="settings-section">
                <h3 className="section-title">About</h3>
                <div className="about-info">
                  <div className="about-row">
                    <span>Version</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="about-row">
                    <span>Step Source</span>
                    <span className="capitalize">{settings.stepSource}</span>
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="settings-section danger">
                <h3 className="section-title danger">Danger Zone</h3>
                <motion.button
                  className="reset-btn"
                  onClick={() => setShowResetConfirm(true)}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset All Data
                </motion.button>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon"><InfoIcon size={48} color="#ef4444" /></div>
              <h3 className="modal-title">Reset All Data?</h3>
              <p className="modal-text">
                This will permanently delete all your progress, including your pet, coins, and achievements. This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button 
                  className="modal-btn cancel"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="modal-btn danger"
                  onClick={() => {
                    resetGame();
                    setShowResetConfirm(false);
                  }}
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
