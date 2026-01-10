import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store';

export function CoinDisplay() {
  const coins = useGameStore((s) => s.coins);
  const claimCoins = useGameStore((s) => s.claimCoins);
  const [showClaimed, setShowClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);

  const handleClaim = () => {
    if (coins.pendingReward < 1) return;
    
    const amount = Math.floor(coins.pendingReward);
    setClaimedAmount(amount);
    setShowClaimed(true);
    claimCoins();
    
    setTimeout(() => setShowClaimed(false), 1500);
  };

  return (
    <motion.div 
      className="coin-display"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Main Balance */}
      <div className="coin-balance">
        <motion.div 
          className="coin-icon"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          🪙
        </motion.div>
        <div className="coin-info">
          <span className="coin-label">StepCoins</span>
          <motion.span 
            className="coin-amount"
            key={coins.balance}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {coins.balance.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* Pending Reward */}
      <AnimatePresence>
        {coins.pendingReward >= 0.1 && (
          <motion.div 
            className="pending-reward"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pending-info">
              <span className="pending-label">Pending:</span>
              <motion.span 
                className="pending-amount"
                key={Math.floor(coins.pendingReward)}
              >
                +{coins.pendingReward.toFixed(1)}
              </motion.span>
            </div>
            <motion.button
              className="claim-button"
              onClick={handleClaim}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={coins.pendingReward < 1}
            >
              Claim
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Animation */}
      <AnimatePresence>
        {showClaimed && (
          <motion.div
            className="claimed-popup"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
          >
            +{claimedAmount} 🪙
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Earned */}
      <div className="total-earned">
        Total earned: {coins.totalEarned.toLocaleString()}
      </div>
    </motion.div>
  );
}
