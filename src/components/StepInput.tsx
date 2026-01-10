import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { DAILY_STEP_CAP } from '../types';

export function StepInput() {
  const addSteps = useGameStore((s) => s.addSteps);
  const stepsToday = useGameStore((s) => s.stats.stepsToday);
  const [inputValue, setInputValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedSteps, setAddedSteps] = useState(0);
  const [isDemo, setIsDemo] = useState(false);

  // Demo mode - simulates walking
  useEffect(() => {
    if (!isDemo) return;
    
    const interval = setInterval(() => {
      const randomSteps = Math.floor(Math.random() * 80) + 40;
      addSteps(randomSteps);
    }, 800);

    return () => clearInterval(interval);
  }, [isDemo, addSteps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const steps = parseInt(inputValue);
    if (isNaN(steps) || steps <= 0) return;
    
    const cappedSteps = Math.min(steps, DAILY_STEP_CAP - stepsToday);
    if (cappedSteps <= 0) {
      return;
    }

    addSteps(cappedSteps);
    setAddedSteps(cappedSteps);
    setShowSuccess(true);
    setInputValue('');
    
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const quickAdd = (amount: number) => {
    const cappedSteps = Math.min(amount, DAILY_STEP_CAP - stepsToday);
    if (cappedSteps <= 0) return;
    
    addSteps(cappedSteps);
    setAddedSteps(cappedSteps);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const remainingCap = DAILY_STEP_CAP - stepsToday;
  const isAtCap = remainingCap <= 0;

  return (
    <motion.div 
      className="step-input-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="input-title">Log Steps</h3>
      
      <p className="input-subtitle">
        Sync your fitness tracker or add steps manually
      </p>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="input-wrapper">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter steps..."
            min="1"
            max={remainingCap}
            className="step-input"
            disabled={isAtCap}
          />
          <motion.button
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!inputValue || isAtCap}
          >
            Add
          </motion.button>
        </div>
      </form>

      {/* Quick add buttons */}
      <div className="quick-add-buttons">
        <span className="quick-label">Quick:</span>
        {[500, 1000, 2500, 5000].map((amount) => (
          <motion.button
            key={amount}
            className="quick-button"
            onClick={() => quickAdd(amount)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isAtCap}
          >
            +{amount >= 1000 ? `${amount/1000}k` : amount}
          </motion.button>
        ))}
      </div>

      {/* Demo mode toggle */}
      <motion.button
        className={`demo-button ${isDemo ? 'active' : ''}`}
        onClick={() => setIsDemo(!isDemo)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isDemo ? '⏸ Stop Simulation' : '▶ Simulate Walking'}
      </motion.button>
      
      <AnimatePresence>
        {isDemo && (
          <motion.p 
            className="demo-notice"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            Simulating steps...
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAtCap && (
          <motion.div 
            className="cap-warning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            🎉 Daily limit reached! Great job today.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="step-success"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <span className="success-icon">👟</span>
            <span>+{addedSteps.toLocaleString()} steps</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
