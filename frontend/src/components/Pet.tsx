import { motion, AnimatePresence } from 'framer-motion';
import type { PetStage, PetMood } from '../types';

interface PetProps {
  stage: PetStage;
  mood: PetMood;
  name: string;
  isEvolving: boolean;
  onHatch?: () => void;
}

const moodColors: Record<PetMood, string> = {
  ecstatic: '#FFD93D',
  happy: '#6BCB77',
  content: '#4D96FF',
  neutral: '#9B9B9B',
  sad: '#6B7AA1',
  neglected: '#5C4742',
};

const stageGradients: Record<PetStage, [string, string]> = {
  egg: ['#F8E8A6', '#E8D496'],
  baby: ['#FFB6C1', '#FF91A4'],
  child: ['#87CEEB', '#68B8DB'],
  teen: ['#98FB98', '#7AE67A'],
  adult: ['#DDA0DD', '#C78AC7'],
  elder: ['#FFD700', '#FFC000'],
  legendary: ['#FF6B6B', '#FF8E53'],
};

// Cute SVG pets for each stage
const EggPet = ({ colors }: { colors: [string, string] }) => (
  <svg viewBox="0 0 100 120" className="pet-svg">
    <defs>
      <linearGradient id="eggGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
      <pattern id="eggPattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.3)" />
      </pattern>
    </defs>
    <ellipse cx="50" cy="65" rx="35" ry="45" fill="url(#eggGrad)" />
    <ellipse cx="50" cy="65" rx="35" ry="45" fill="url(#eggPattern)" />
    <ellipse cx="50" cy="50" rx="25" ry="20" fill="rgba(255,255,255,0.2)" />
    {/* Crack lines */}
    <path d="M 35 45 L 40 55 L 33 60" stroke="#D4C078" strokeWidth="2" fill="none" />
    <path d="M 60 50 L 65 58 L 58 65" stroke="#D4C078" strokeWidth="2" fill="none" />
  </svg>
);

const BabyPet = ({ mood, colors }: { mood: PetMood; colors: [string, string] }) => (
  <svg viewBox="0 0 100 100" className="pet-svg">
    <defs>
      <linearGradient id="babyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="50" cy="60" rx="30" ry="28" fill="url(#babyGrad)" />
    {/* Belly */}
    <ellipse cx="50" cy="65" rx="18" ry="16" fill="rgba(255,255,255,0.4)" />
    {/* Eyes */}
    <g className="pet-eyes">
      <circle cx="40" cy="50" r="8" fill="white" />
      <circle cx="60" cy="50" r="8" fill="white" />
      <circle cx="42" cy="50" r="5" fill="#2D2D2D" />
      <circle cx="62" cy="50" r="5" fill="#2D2D2D" />
      <circle cx="43" cy="48" r="2" fill="white" />
      <circle cx="63" cy="48" r="2" fill="white" />
    </g>
    {/* Blush */}
    <ellipse cx="32" cy="58" rx="5" ry="3" fill="rgba(255,150,150,0.5)" />
    <ellipse cx="68" cy="58" rx="5" ry="3" fill="rgba(255,150,150,0.5)" />
    {/* Mouth based on mood */}
    {mood === 'happy' || mood === 'ecstatic' ? (
      <path d="M 43 65 Q 50 72 57 65" stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
    ) : mood === 'sad' || mood === 'neglected' ? (
      <path d="M 43 70 Q 50 65 57 70" stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
    ) : (
      <ellipse cx="50" cy="67" rx="4" ry="3" fill="#2D2D2D" />
    )}
    {/* Little feet */}
    <ellipse cx="38" cy="88" rx="8" ry="5" fill={colors[1]} />
    <ellipse cx="62" cy="88" rx="8" ry="5" fill={colors[1]} />
  </svg>
);

const ChildPet = ({ mood, colors }: { mood: PetMood; colors: [string, string] }) => (
  <svg viewBox="0 0 100 110" className="pet-svg">
    <defs>
      <linearGradient id="childGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="50" cy="65" rx="28" ry="30" fill="url(#childGrad)" />
    {/* Head */}
    <circle cx="50" cy="35" r="25" fill="url(#childGrad)" />
    {/* Belly */}
    <ellipse cx="50" cy="70" rx="16" ry="18" fill="rgba(255,255,255,0.4)" />
    {/* Ears */}
    <ellipse cx="30" cy="20" rx="8" ry="12" fill={colors[0]} />
    <ellipse cx="70" cy="20" rx="8" ry="12" fill={colors[0]} />
    <ellipse cx="30" cy="20" rx="4" ry="8" fill="rgba(255,200,200,0.6)" />
    <ellipse cx="70" cy="20" rx="4" ry="8" fill="rgba(255,200,200,0.6)" />
    {/* Eyes */}
    <g className="pet-eyes">
      <circle cx="40" cy="35" r="7" fill="white" />
      <circle cx="60" cy="35" r="7" fill="white" />
      <circle cx="42" cy="35" r="4" fill="#2D2D2D" />
      <circle cx="62" cy="35" r="4" fill="#2D2D2D" />
      <circle cx="43" cy="33" r="1.5" fill="white" />
      <circle cx="63" cy="33" r="1.5" fill="white" />
    </g>
    {/* Nose */}
    <ellipse cx="50" cy="42" rx="4" ry="3" fill="#FF9999" />
    {/* Mouth */}
    {mood === 'happy' || mood === 'ecstatic' ? (
      <path d="M 44 48 Q 50 55 56 48" stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
    ) : mood === 'sad' || mood === 'neglected' ? (
      <path d="M 44 52 Q 50 47 56 52" stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
    ) : (
      <line x1="46" y1="50" x2="54" y2="50" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
    )}
    {/* Arms */}
    <ellipse cx="22" cy="65" rx="6" ry="10" fill={colors[1]} />
    <ellipse cx="78" cy="65" rx="6" ry="10" fill={colors[1]} />
    {/* Feet */}
    <ellipse cx="38" cy="95" rx="10" ry="6" fill={colors[1]} />
    <ellipse cx="62" cy="95" rx="10" ry="6" fill={colors[1]} />
  </svg>
);

const TeenPet = ({ mood, colors }: { mood: PetMood; colors: [string, string] }) => (
  <svg viewBox="0 0 100 120" className="pet-svg">
    <defs>
      <linearGradient id="teenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="50" cy="75" rx="25" ry="30" fill="url(#teenGrad)" />
    {/* Head */}
    <circle cx="50" cy="35" r="28" fill="url(#teenGrad)" />
    {/* Belly */}
    <ellipse cx="50" cy="80" rx="15" ry="18" fill="rgba(255,255,255,0.35)" />
    {/* Leaf/antenna */}
    <path d="M 50 7 Q 55 0 60 10 Q 55 15 50 7" fill="#7CB342" />
    <line x1="50" y1="7" x2="50" y2="15" stroke="#7CB342" strokeWidth="2" />
    {/* Eyes */}
    <g className="pet-eyes">
      <ellipse cx="38" cy="35" rx="9" ry="10" fill="white" />
      <ellipse cx="62" cy="35" rx="9" ry="10" fill="white" />
      <circle cx="40" cy="35" r="5" fill="#2D2D2D" />
      <circle cx="64" cy="35" r="5" fill="#2D2D2D" />
      <circle cx="41" cy="33" r="2" fill="white" />
      <circle cx="65" cy="33" r="2" fill="white" />
    </g>
    {/* Blush marks */}
    <g opacity="0.5">
      <line x1="25" y1="42" x2="28" y2="42" stroke="#FF9999" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="45" x2="28" y2="45" stroke="#FF9999" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="42" x2="75" y2="42" stroke="#FF9999" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="45" x2="75" y2="45" stroke="#FF9999" strokeWidth="2" strokeLinecap="round" />
    </g>
    {/* Mouth */}
    {mood === 'happy' || mood === 'ecstatic' ? (
      <path d="M 42 50 Q 50 60 58 50" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ) : mood === 'sad' || mood === 'neglected' ? (
      <path d="M 42 55 Q 50 48 58 55" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ) : (
      <ellipse cx="50" cy="52" rx="5" ry="4" fill="#2D2D2D" />
    )}
    {/* Arms */}
    <ellipse cx="24" cy="70" rx="7" ry="14" fill={colors[1]} />
    <ellipse cx="76" cy="70" rx="7" ry="14" fill={colors[1]} />
    {/* Feet */}
    <ellipse cx="38" cy="105" rx="12" ry="7" fill={colors[1]} />
    <ellipse cx="62" cy="105" rx="12" ry="7" fill={colors[1]} />
  </svg>
);

const AdultPet = ({ mood, colors }: { mood: PetMood; colors: [string, string] }) => (
  <svg viewBox="0 0 120 140" className="pet-svg">
    <defs>
      <linearGradient id="adultGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Wings */}
    <ellipse cx="25" cy="60" rx="18" ry="25" fill="rgba(255,255,255,0.3)" />
    <ellipse cx="95" cy="60" rx="18" ry="25" fill="rgba(255,255,255,0.3)" />
    {/* Body */}
    <ellipse cx="60" cy="85" rx="30" ry="35" fill="url(#adultGrad)" />
    {/* Head */}
    <circle cx="60" cy="40" r="30" fill="url(#adultGrad)" />
    {/* Belly */}
    <ellipse cx="60" cy="90" rx="18" ry="22" fill="rgba(255,255,255,0.35)" />
    {/* Crown/horns */}
    <path d="M 45 12 L 48 22 L 42 22 Z" fill="#FFD700" />
    <path d="M 60 8 L 63 20 L 57 20 Z" fill="#FFD700" />
    <path d="M 75 12 L 78 22 L 72 22 Z" fill="#FFD700" />
    {/* Eyes */}
    <g className="pet-eyes">
      <ellipse cx="48" cy="38" rx="10" ry="11" fill="white" />
      <ellipse cx="72" cy="38" rx="10" ry="11" fill="white" />
      <circle cx="50" cy="38" r="6" fill="#4A0080" />
      <circle cx="74" cy="38" r="6" fill="#4A0080" />
      <circle cx="51" cy="36" r="2.5" fill="white" />
      <circle cx="75" cy="36" r="2.5" fill="white" />
    </g>
    {/* Sparkle near eye */}
    <g filter="url(#glow)" opacity="0.8">
      <path d="M 82 28 L 84 32 L 88 30 L 84 34 L 86 38 L 82 34 L 78 36 L 82 32 Z" fill="#FFD700" />
    </g>
    {/* Mouth */}
    {mood === 'happy' || mood === 'ecstatic' ? (
      <path d="M 50 55 Q 60 68 70 55" stroke="#2D2D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : mood === 'sad' || mood === 'neglected' ? (
      <path d="M 50 62 Q 60 52 70 62" stroke="#2D2D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : (
      <ellipse cx="60" cy="58" rx="6" ry="5" fill="#2D2D2D" />
    )}
    {/* Arms */}
    <ellipse cx="28" cy="80" rx="8" ry="18" fill={colors[1]} />
    <ellipse cx="92" cy="80" rx="8" ry="18" fill={colors[1]} />
    {/* Feet */}
    <ellipse cx="45" cy="120" rx="14" ry="8" fill={colors[1]} />
    <ellipse cx="75" cy="120" rx="14" ry="8" fill={colors[1]} />
    {/* Tail */}
    <path d="M 90 100 Q 110 95 105 80" stroke={colors[1]} strokeWidth="8" fill="none" strokeLinecap="round" />
  </svg>
);

const ElderPet = ({ mood, colors }: { mood: PetMood; colors: [string, string] }) => (
  <svg viewBox="0 0 130 150" className="pet-svg">
    <defs>
      <linearGradient id="elderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
      <filter id="elderGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Aura */}
    <circle cx="65" cy="70" r="55" fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth="10" />
    {/* Wings */}
    <ellipse cx="20" cy="65" rx="20" ry="30" fill="rgba(255,215,0,0.3)" />
    <ellipse cx="110" cy="65" rx="20" ry="30" fill="rgba(255,215,0,0.3)" />
    {/* Body */}
    <ellipse cx="65" cy="90" rx="32" ry="38" fill="url(#elderGrad)" />
    {/* Head */}
    <circle cx="65" cy="42" r="32" fill="url(#elderGrad)" />
    {/* Belly with pattern */}
    <ellipse cx="65" cy="95" rx="20" ry="25" fill="rgba(255,255,255,0.3)" />
    {/* Wise beard */}
    <path d="M 50 60 Q 45 75 50 85 Q 65 95 80 85 Q 85 75 80 60" fill="rgba(255,255,255,0.6)" />
    {/* Wise eyebrows */}
    <path d="M 40 28 Q 50 25 55 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M 90 28 Q 80 25 75 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Eyes */}
    <g className="pet-eyes">
      <ellipse cx="52" cy="40" rx="8" ry="9" fill="white" />
      <ellipse cx="78" cy="40" rx="8" ry="9" fill="white" />
      <circle cx="54" cy="40" r="5" fill="#B8860B" />
      <circle cx="80" cy="40" r="5" fill="#B8860B" />
      <circle cx="55" cy="38" r="2" fill="white" />
      <circle cx="81" cy="38" r="2" fill="white" />
    </g>
    {/* Stars around */}
    <g filter="url(#elderGlow)">
      <path d="M 15 30 L 17 35 L 22 33 L 17 37 L 19 42 L 15 38 L 11 40 L 15 36 Z" fill="#FFD700" />
      <path d="M 115 35 L 117 40 L 122 38 L 117 42 L 119 47 L 115 43 L 111 45 L 115 41 Z" fill="#FFD700" />
      <path d="M 65 5 L 67 10 L 72 8 L 67 12 L 69 17 L 65 13 L 61 15 L 65 11 Z" fill="#FFD700" />
    </g>
    {/* Mouth */}
    {mood === 'happy' || mood === 'ecstatic' ? (
      <path d="M 55 52 Q 65 60 75 52" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M 58 54 L 72 54" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
    )}
    {/* Staff */}
    <line x1="110" y1="45" x2="120" y2="130" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
    <circle cx="110" cy="42" r="8" fill="#FFD700" filter="url(#elderGlow)" />
    {/* Feet */}
    <ellipse cx="50" cy="128" rx="14" ry="8" fill={colors[1]} />
    <ellipse cx="80" cy="128" rx="14" ry="8" fill={colors[1]} />
  </svg>
);

const LegendaryPet = ({ mood, colors }: { mood: PetMood; colors: [string, string] }) => (
  <svg viewBox="0 0 150 170" className="pet-svg">
    <defs>
      <linearGradient id="legendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
      <filter id="legendGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="25%" stopColor="#FFD93D" />
        <stop offset="50%" stopColor="#6BCB77" />
        <stop offset="75%" stopColor="#4D96FF" />
        <stop offset="100%" stopColor="#9B59B6" />
      </linearGradient>
    </defs>
    {/* Magical aura rings */}
    <circle cx="75" cy="85" r="70" fill="none" stroke="url(#rainbowGrad)" strokeWidth="2" opacity="0.3" />
    <circle cx="75" cy="85" r="60" fill="none" stroke="url(#rainbowGrad)" strokeWidth="2" opacity="0.4" />
    <circle cx="75" cy="85" r="50" fill="none" stroke="url(#rainbowGrad)" strokeWidth="2" opacity="0.5" />
    {/* Majestic wings */}
    <path d="M 20 60 Q 0 40 10 20 Q 25 35 30 55 Q 25 70 20 60" fill="rgba(255,215,0,0.4)" filter="url(#legendGlow)" />
    <path d="M 130 60 Q 150 40 140 20 Q 125 35 120 55 Q 125 70 130 60" fill="rgba(255,215,0,0.4)" filter="url(#legendGlow)" />
    {/* Body */}
    <ellipse cx="75" cy="100" rx="35" ry="42" fill="url(#legendGrad)" />
    {/* Head */}
    <circle cx="75" cy="50" r="35" fill="url(#legendGrad)" />
    {/* Belly */}
    <ellipse cx="75" cy="105" rx="22" ry="28" fill="rgba(255,255,255,0.3)" />
    {/* Crown */}
    <path d="M 50 18 L 55 30 L 62 20 L 68 32 L 75 15 L 82 32 L 88 20 L 95 30 L 100 18" 
          stroke="#FFD700" strokeWidth="3" fill="none" filter="url(#legendGlow)" />
    <circle cx="75" cy="15" r="5" fill="#FF6B6B" filter="url(#legendGlow)" />
    {/* Majestic eyes */}
    <g className="pet-eyes">
      <ellipse cx="60" cy="48" rx="12" ry="13" fill="white" />
      <ellipse cx="90" cy="48" rx="12" ry="13" fill="white" />
      {/* Rainbow iris */}
      <circle cx="62" cy="48" r="7" fill="url(#rainbowGrad)" />
      <circle cx="92" cy="48" r="7" fill="url(#rainbowGrad)" />
      <circle cx="62" cy="48" r="3" fill="#2D2D2D" />
      <circle cx="92" cy="48" r="3" fill="#2D2D2D" />
      <circle cx="64" cy="45" r="3" fill="white" />
      <circle cx="94" cy="45" r="3" fill="white" />
    </g>
    {/* Floating stars */}
    <g filter="url(#legendGlow)">
      <path d="M 25 50 L 27 55 L 32 53 L 27 57 L 29 62 L 25 58 L 21 60 L 25 56 Z" fill="#FFD700" />
      <path d="M 125 55 L 127 60 L 132 58 L 127 62 L 129 67 L 125 63 L 121 65 L 125 61 Z" fill="#FFD700" />
      <path d="M 40 25 L 42 30 L 47 28 L 42 32 L 44 37 L 40 33 L 36 35 L 40 31 Z" fill="#FF6B6B" />
      <path d="M 110 20 L 112 25 L 117 23 L 112 27 L 114 32 L 110 28 L 106 30 L 110 26 Z" fill="#FF6B6B" />
    </g>
    {/* Mouth - always majestic */}
    {mood === 'happy' || mood === 'ecstatic' ? (
      <path d="M 60 70 Q 75 85 90 70" stroke="#2D2D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M 65 72 Q 75 78 85 72" stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    )}
    {/* Magical tail */}
    <path d="M 110 110 Q 135 100 140 80 Q 145 95 130 115" fill="url(#rainbowGrad)" opacity="0.7" />
    {/* Feet with glow */}
    <ellipse cx="55" cy="142" rx="16" ry="9" fill={colors[1]} filter="url(#legendGlow)" />
    <ellipse cx="95" cy="142" rx="16" ry="9" fill={colors[1]} filter="url(#legendGlow)" />
  </svg>
);

const petComponents: Record<PetStage, React.FC<{ mood: PetMood; colors: [string, string] }>> = {
  egg: ({ colors }) => <EggPet colors={colors} />,
  baby: ({ mood, colors }) => <BabyPet mood={mood} colors={colors} />,
  child: ({ mood, colors }) => <ChildPet mood={mood} colors={colors} />,
  teen: ({ mood, colors }) => <TeenPet mood={mood} colors={colors} />,
  adult: ({ mood, colors }) => <AdultPet mood={mood} colors={colors} />,
  elder: ({ mood, colors }) => <ElderPet mood={mood} colors={colors} />,
  legendary: ({ mood, colors }) => <LegendaryPet mood={mood} colors={colors} />,
};

export function Pet({ stage, mood, name, isEvolving, onHatch }: PetProps) {
  const PetComponent = petComponents[stage];
  const colors = stageGradients[stage];
  const moodColor = moodColors[mood];

  const bounceAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const eggWiggle = {
    rotate: [-3, 3, -3],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const evolutionAnimation = {
    scale: [1, 1.3, 0.8, 1.2, 1],
    rotate: [0, 10, -10, 5, 0],
    transition: {
      duration: 1.5,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="pet-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          className="pet-wrapper"
          initial={{ scale: 0, opacity: 0 }}
          animate={isEvolving ? evolutionAnimation : { scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0, rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {isEvolving && (
            <motion.div
              className="evolution-flash"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 3] }}
              transition={{ duration: 1.5 }}
            />
          )}
          
          <motion.div
            className="pet-sprite"
            animate={stage === 'egg' ? eggWiggle : bounceAnimation}
            onClick={stage === 'egg' ? onHatch : undefined}
            style={{ cursor: stage === 'egg' ? 'pointer' : 'default' }}
          >
            <PetComponent mood={mood} colors={colors} />
          </motion.div>

          {/* Mood indicator */}
          <motion.div 
            className="mood-indicator"
            style={{ backgroundColor: moodColor }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {mood === 'ecstatic' && '✨'}
            {mood === 'happy' && '😊'}
            {mood === 'content' && '🙂'}
            {mood === 'neutral' && '😐'}
            {mood === 'sad' && '😢'}
            {mood === 'neglected' && '💔'}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className="pet-name"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {name}
        <span className="pet-stage-label">{stage}</span>
      </motion.div>

      {stage === 'egg' && (
        <motion.p 
          className="hatch-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to hatch
        </motion.p>
      )}
    </div>
  );
}

