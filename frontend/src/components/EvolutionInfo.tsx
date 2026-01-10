import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { EVOLUTION_REQUIREMENTS } from '../types';
import type { PetStage } from '../types';

const stageEmojis: Record<PetStage, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🦅',
  elder: '🦉',
  legendary: '🐉',
};

const stageDescriptions: Record<PetStage, string> = {
  egg: 'Waiting to hatch...',
  baby: 'Just hatched! Small but eager.',
  child: 'Growing stronger every day.',
  teen: 'Full of energy and potential.',
  adult: 'Mature and powerful.',
  elder: 'Wise and experienced.',
  legendary: 'A truly mythical companion.',
};

export function EvolutionInfo() {
  const pet = useGameStore((s) => s.pet);
  
  const stages: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'];
  const currentIndex = stages.indexOf(pet.stage);

  const getProgress = (stage: PetStage) => {
    const reqs = EVOLUTION_REQUIREMENTS[stage];
    if (stage === 'egg') return 100;
    
    const levelProgress = Math.min((pet.level / reqs.level) * 100, 100);
    const stepsProgress = Math.min((pet.totalStepsAllTime / reqs.totalSteps) * 100, 100);
    
    return Math.min(levelProgress, stepsProgress);
  };

  return (
    <motion.div 
      className="evolution-info"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <h3 className="evolution-title">Evolution Path</h3>
      
      <div className="evolution-track">
        {stages.map((stage, i) => {
          const isUnlocked = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const progress = getProgress(stage);
          const reqs = EVOLUTION_REQUIREMENTS[stage];
          
          return (
            <motion.div
              key={stage}
              className={`evolution-stage ${isUnlocked ? 'unlocked' : ''} ${isCurrent ? 'current' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.2 }}
            >
              <motion.div 
                className="stage-icon"
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stageEmojis[stage]}
              </motion.div>
              
              <div className="stage-name">{stage}</div>
              
              {!isUnlocked && (
                <div className="stage-reqs">
                  <span>Lv.{reqs.level}</span>
                  <span>{reqs.totalSteps >= 1000 ? `${(reqs.totalSteps / 1000)}k` : reqs.totalSteps}</span>
                </div>
              )}
              
              {i < stages.length - 1 && (
                <div className="evolution-connector">
                  <motion.div 
                    className="connector-fill"
                    initial={{ width: 0 }}
                    animate={{ width: isUnlocked ? '100%' : `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current stage info */}
      <motion.div 
        className="current-stage-info"
        key={pet.stage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="current-stage-header">
          <span className="current-emoji">{stageEmojis[pet.stage]}</span>
          <span className="current-name">{pet.stage.charAt(0).toUpperCase() + pet.stage.slice(1)}</span>
        </div>
        <p className="current-description">{stageDescriptions[pet.stage]}</p>
        
        {currentIndex < stages.length - 1 && (
          <div className="next-evolution">
            <span className="next-label">Next Evolution</span>
            <div className="next-requirements">
              <span>Level {EVOLUTION_REQUIREMENTS[stages[currentIndex + 1]].level}</span>
              <span>•</span>
              <span>{EVOLUTION_REQUIREMENTS[stages[currentIndex + 1]].totalSteps.toLocaleString()} steps</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
