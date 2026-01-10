import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store';
import apiService from '../services/api';
import type { PetType } from '../types';

const petTypes: { id: PetType; name: string; icon: string; description: string; color: string }[] = [
  { id: 'phoenix', name: 'Phoenix', icon: '🔥', description: 'Born from flames, rises with your activity', color: '#f97316' },
  { id: 'dragon', name: 'Dragon', icon: '🐉', description: 'Ancient and powerful, grows mighty with steps', color: '#8b5cf6' },
  { id: 'spirit', name: 'Spirit', icon: '👻', description: 'Ethereal and mysterious, feeds on movement', color: '#06b6d4' },
  { id: 'nature', name: 'Nature', icon: '🌿', description: 'One with the earth, blooms through walking', color: '#22c55e' },
];

export function Onboarding() {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<PetType>('phoenix');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setGameState = useGameStore((s) => s.setGameState);
  const setInitialized = useGameStore((s) => s.setInitialized);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Call backend API to initialize game
      const response = await apiService.initializeGame(name.trim(), selectedType);
      
      if (response.success && response.data) {
        const gameState = (response.data as any).gameState;
        if (gameState) {
          setGameState(gameState);
          setInitialized(true);
        } else {
          setError('Failed to initialize game');
        }
      } else {
        setError(response.message || 'Failed to initialize game');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      emoji: "👟",
      title: "Welcome to StepPal",
      content: "Your steps power everything. Walk more, and watch your virtual companion grow stronger and happier.",
    },
    {
      emoji: "🐣",
      title: "Raise Your Companion",
      content: "It starts as an egg, but with your daily activity, it will evolve into something truly special.",
    },
    {
      emoji: "🪙",
      title: "Earn StepCoins",
      content: "Every step counts toward rewards. The more evolved your companion, the better your earnings.",
    },
    {
      emoji: "🎯",
      title: "Complete Challenges",
      content: "Daily and weekly challenges keep you motivated with bonus rewards and achievements.",
    },
    {
      emoji: null,
      title: "Choose Your Companion",
      content: null,
    }
  ];

  return (
    <div className="onboarding-container">
      {/* Animated background */}
      <div className="onboarding-bg">
        <motion.div
          className="bg-orb orb-1"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="bg-orb orb-2"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="bg-orb orb-3"
          animate={{
            x: [0, 15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="onboarding-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Progress dots */}
        <div className="onboarding-progress">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              initial={false}
              animate={{ 
                scale: i === step ? 1.2 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="onboarding-content"
          >
            {steps[step].emoji && (
              <motion.div
                className="step-emoji"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {steps[step].emoji}
              </motion.div>
            )}
            
            <h2 className="onboarding-title">{steps[step].title}</h2>
            
            {steps[step].content && (
              <p className="onboarding-text">{steps[step].content}</p>
            )}

            {step === 4 && (
              <form onSubmit={handleSubmit} className="name-form">
                {/* Pet Type Selection */}
                <div className="pet-type-grid">
                  {petTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      type="button"
                      className={`pet-type-btn ${selectedType === type.id ? 'selected' : ''}`}
                      onClick={() => setSelectedType(type.id)}
                      whileTap={{ scale: 0.95 }}
                      style={{ 
                        '--type-color': type.color 
                      } as React.CSSProperties}
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span className="type-name">{type.name}</span>
                    </motion.button>
                  ))}
                </div>
                
                <p className="type-description">
                  {petTypes.find(t => t.id === selectedType)?.description}
                </p>

                {/* Egg Preview */}
                <motion.div 
                  className="egg-preview"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [-3, 3, -3] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="egg-emoji"
                    style={{ 
                      filter: `drop-shadow(0 0 20px ${petTypes.find(t => t.id === selectedType)?.color}40)` 
                    }}
                  >
                    🥚
                  </motion.div>
                </motion.div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name your companion..."
                  maxLength={16}
                  className="name-input"
                  autoFocus
                  disabled={loading}
                />

                {error && (
                  <motion.div
                    className="onboarding-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="start-button"
                  disabled={!name.trim() || loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 'Starting...' : 'Begin Journey'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <motion.div 
            className="onboarding-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {step > 0 && (
              <motion.button
                className="back-button"
                onClick={() => setStep(step - 1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
            )}
            <motion.button
              className="next-button"
              onClick={() => setStep(step + 1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
