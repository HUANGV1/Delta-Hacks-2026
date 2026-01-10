import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { 
  HomeIcon, 
  ChartIcon, 
  StarIcon, 
  CoinsIcon, 
  TargetIcon, 
  UserIcon 
} from './Icons';
import type { ScreenType } from '../types';

interface NavItem {
  id: ScreenType;
  icon: React.FC<{ size?: number; color?: string; filled?: boolean }>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: HomeIcon, label: 'Home' },
  { id: 'activity', icon: ChartIcon, label: 'Activity' },
  { id: 'evolution', icon: StarIcon, label: 'Evolve' },
  { id: 'rewards', icon: CoinsIcon, label: 'Rewards' },
  { id: 'challenges', icon: TargetIcon, label: 'Goals' },
  { id: 'profile', icon: UserIcon, label: 'Profile' },
];

export function BottomNav() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const setScreen = useGameStore((s) => s.setScreen);
  const challenges = useGameStore((s) => s.challenges);
  const coins = useGameStore((s) => s.coins);

  const unclaimedChallenges = challenges.filter(c => c.completed && !c.claimed).length;
  const hasPendingCoins = coins.pendingReward >= 1;

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const showBadge = (item.id === 'challenges' && unclaimedChallenges > 0) ||
                           (item.id === 'rewards' && hasPendingCoins);
          const IconComponent = item.icon;
          
          return (
            <motion.button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setScreen(item.id)}
              whileTap={{ scale: 0.9 }}
            >
              <div className="nav-icon-wrapper">
                <span className="nav-icon">
                  <IconComponent size={22} filled={isActive} />
                </span>
                {showBadge && (
                  <span className="nav-badge">
                    {item.id === 'challenges' ? unclaimedChallenges : '!'}
                  </span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
              {isActive && (
                <motion.div 
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
