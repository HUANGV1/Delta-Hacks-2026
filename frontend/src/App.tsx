import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';
import { NotificationToast } from './components/NotificationToast';
import apiService from './services/api';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const initialized = useGameStore((s) => s.initialized);
  const currentScreen = useGameStore((s) => s.currentScreen);
  const tick = useGameStore((s) => s.tick);
  const generateDailyChallenges = useGameStore((s) => s.generateDailyChallenges);
  const setGameState = useGameStore((s) => s.setGameState);
  const setInitialized = useGameStore((s) => s.setInitialized);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getMe();
        if (response.success) {
          // Load game state
          const gameStateResponse = await apiService.getGameState();
          if (gameStateResponse.success && gameStateResponse.data) {
            const gameState = (gameStateResponse.data as any).gameState;
            if (gameState) {
              setGameState(gameState);
              setInitialized(gameState.initialized);
            }
          }
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear it
          apiService.logout();
          setIsAuthenticated(false);
        }
      } catch (error) {
        apiService.logout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setGameState, setInitialized]);

  // Periodic updates
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      tick();
      generateDailyChallenges();
    }, 60000);
    return () => clearInterval(interval);
  }, [tick, generateDailyChallenges, isAuthenticated]);

  // Loading state
  if (loading || isAuthenticated === null) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>StepPal</div>
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  // Show onboarding if not initialized
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
