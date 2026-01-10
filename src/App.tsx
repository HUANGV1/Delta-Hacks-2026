import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';
import { NotificationToast } from './components/NotificationToast';
import { 
  HomeScreen, 
  ActivityScreen, 
  EvolutionScreen, 
  RewardsScreen, 
  ChallengesScreen, 
  ProfileScreen 
} from './screens';
import './App.css';

function App() {
  const initialized = useGameStore((s) => s.initialized);
  const currentScreen = useGameStore((s) => s.currentScreen);
  const tick = useGameStore((s) => s.tick);
  const generateDailyChallenges = useGameStore((s) => s.generateDailyChallenges);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
      generateDailyChallenges();
    }, 60000);
    return () => clearInterval(interval);
  }, [tick, generateDailyChallenges]);

  if (!initialized) {
    return <Onboarding />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen key="home" />;
      case 'activity':
        return <ActivityScreen key="activity" />;
      case 'evolution':
        return <EvolutionScreen key="evolution" />;
      case 'rewards':
        return <RewardsScreen key="rewards" />;
      case 'challenges':
        return <ChallengesScreen key="challenges" />;
      case 'profile':
        return <ProfileScreen key="profile" />;
      default:
        return <HomeScreen key="home" />;
    }
  };

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="screen-container"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      
      <BottomNav />
      <NotificationToast />
    </div>
  );
}

export default App;
