import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { EVOLUTION_REQUIREMENTS, MINING_EFFICIENCY, STAGE_NAMES } from '../types';
import { StarIcon, FootprintsIcon, BoltIcon, CheckIcon } from '../components/Icons';
import type { PetStage } from '../types';

const STAGE_ORDER: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder', 'legendary'];

const STAGE_ICONS: Record<PetStage, React.ReactNode> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🦜',
  adult: '🦅',
  elder: '🦉',
  legendary: '🐉',
};

const STAGE_DESCRIPTIONS: Record<PetStage, string> = {
  egg: 'A mysterious egg waiting to hatch. Keep walking to bring it to life!',
  baby: 'Just hatched! Your companion is small but eager to grow.',
  child: 'Growing stronger every day. Starting to show its personality.',
  teen: 'Full of energy and ready for adventure!',
  adult: 'Fully grown and powerful. A loyal companion.',
  elder: 'Wise and experienced. Commands respect.',
  legendary: 'A mythical being of immense power. The ultimate form!',
};

export function EvolutionScreen() {
  const pet = useGameStore((s) => s.pet);
  
  const currentStageIndex = STAGE_ORDER.indexOf(pet.stage);
  
  const getStageStatus = (stage: PetStage) => {
    const stageIndex = STAGE_ORDER.indexOf(stage);
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'locked';
  };

  const getProgress = (stage: PetStage) => {
    const req = EVOLUTION_REQUIREMENTS[stage];
    const levelProgress = Math.min((pet.level / req.level) * 100, 100);
    const stepsProgress = Math.min((pet.totalStepsAllTime / req.totalSteps) * 100, 100);
    return Math.min(levelProgress, stepsProgress);
  };

  return (
    <div className="evolution-screen">
      <header className="screen-header simple">
        <h1 className="screen-title">Evolution</h1>
      </header>

      <div className="evolution-content">
        {/* Current Stage Hero */}
        <section className="current-stage-hero">
          <motion.div 
            className="stage-icon-large"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {STAGE_ICONS[pet.stage]}
          </motion.div>
          <h2 className="current-stage-name">{STAGE_NAMES[pet.stage]}</h2>
          <p className="current-stage-desc">{STAGE_DESCRIPTIONS[pet.stage]}</p>
          
          <div className="stage-stats">
            <div className="stage-stat">
              <span className="stage-stat-value">Lv.{pet.level}</span>
              <span className="stage-stat-label">Level</span>
            </div>
            <div className="stage-stat-divider" />
            <div className="stage-stat">
              <span className="stage-stat-value">{pet.miningEfficiency}x</span>
              <span className="stage-stat-label">Mining Power</span>
            </div>
            <div className="stage-stat-divider" />
            <div className="stage-stat">
              <span className="stage-stat-value">{pet.totalStepsAllTime.toLocaleString()}</span>
              <span className="stage-stat-label">Total Steps</span>
            </div>
          </div>
        </section>

        {/* Evolution Path */}
        <section className="evolution-path">
          <h3 className="section-title">Evolution Path</h3>
          
          <div className="evolution-timeline">
            {STAGE_ORDER.map((stage, index) => {
              const status = getStageStatus(stage);
              const requirements = EVOLUTION_REQUIREMENTS[stage];
              const progress = getProgress(stage);
              const isNext = index === currentStageIndex + 1;
              
              return (
                <motion.div 
                  key={stage}
                  className={`evolution-node ${status} ${isNext ? 'next' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="node-connector">
                    {index > 0 && (
                      <div className={`connector-line ${status === 'completed' || status === 'current' ? 'filled' : ''}`} />
                    )}
                  </div>
                  
                  <div className="node-content">
                    <div className={`node-icon ${status}`}>
                      {status === 'completed' && <span className="check"><CheckIcon size={16} color="white" /></span>}
                      <span className="icon">{STAGE_ICONS[stage]}</span>
                    </div>
                    
                    <div className="node-info">
                      <div className="node-header">
                        <h4 className="node-name">{STAGE_NAMES[stage]}</h4>
                        {status === 'current' && <span className="current-badge">Current</span>}
                        {isNext && <span className="next-badge">Next</span>}
                      </div>
                      
                      {status !== 'completed' && stage !== 'egg' && (
                        <div className="node-requirements">
                          <div className="req-item">
                            <span className="req-icon"><StarIcon size={14} color="#a855f7" /></span>
                            <span className={`req-text ${pet.level >= requirements.level ? 'met' : ''}`}>
                              Level {requirements.level}
                              {pet.level >= requirements.level && ' ✓'}
                            </span>
                          </div>
                          <div className="req-item">
                            <span className="req-icon"><FootprintsIcon size={14} color="#8b5cf6" /></span>
                            <span className={`req-text ${pet.totalStepsAllTime >= requirements.totalSteps ? 'met' : ''}`}>
                              {requirements.totalSteps.toLocaleString()} steps
                              {pet.totalStepsAllTime >= requirements.totalSteps && ' ✓'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {status === 'locked' && (
                        <div className="node-progress">
                          <div className="progress-track small">
                            <motion.div 
                              className="progress-fill secondary"
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="progress-text">{Math.round(progress)}%</span>
                        </div>
                      )}
                      
                      <div className="node-reward">
                        <span className="reward-icon"><BoltIcon size={14} /></span>
                        <span className="reward-text">{MINING_EFFICIENCY[stage]}x mining power</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Next Evolution Info */}
        {currentStageIndex < STAGE_ORDER.length - 1 && (
          <section className="next-evolution">
            <div className="next-evo-card">
              <div className="next-evo-header">
                <span className="next-evo-icon">{STAGE_ICONS[STAGE_ORDER[currentStageIndex + 1]]}</span>
                <div className="next-evo-info">
                  <h4>Next: {STAGE_NAMES[STAGE_ORDER[currentStageIndex + 1]]}</h4>
                  <p>{STAGE_DESCRIPTIONS[STAGE_ORDER[currentStageIndex + 1]]}</p>
                </div>
              </div>
              
              <div className="next-evo-progress">
                <div className="evo-req">
                  <div className="evo-req-header">
                    <span>Level Progress</span>
                    <span>{pet.level} / {EVOLUTION_REQUIREMENTS[STAGE_ORDER[currentStageIndex + 1]].level}</span>
                  </div>
                  <div className="progress-track">
                    <motion.div 
                      className="progress-fill daily"
                      animate={{ 
                        width: `${Math.min((pet.level / EVOLUTION_REQUIREMENTS[STAGE_ORDER[currentStageIndex + 1]].level) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="evo-req">
                  <div className="evo-req-header">
                    <span>Steps Progress</span>
                    <span>{pet.totalStepsAllTime.toLocaleString()} / {EVOLUTION_REQUIREMENTS[STAGE_ORDER[currentStageIndex + 1]].totalSteps.toLocaleString()}</span>
                  </div>
                  <div className="progress-track">
                    <motion.div 
                      className="progress-fill secondary"
                      animate={{ 
                        width: `${Math.min((pet.totalStepsAllTime / EVOLUTION_REQUIREMENTS[STAGE_ORDER[currentStageIndex + 1]].totalSteps) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
