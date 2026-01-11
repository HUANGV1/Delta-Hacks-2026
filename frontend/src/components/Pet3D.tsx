import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  MeshDistortMaterial,
  Sparkles,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';
import type { PetStage, PetMood } from '../types';

interface Pet3DProps {
  stage: PetStage;
  mood: PetMood;
  name: string;
  environment: 'meadow' | 'space' | 'cozy' | 'beach';
  onHatch?: () => void;
  cosmetics?: {
    hat?: string;
    glasses?: string;
    neck?: string;
  };
}

// Color palettes for each stage
const stageColors: Record<PetStage, { primary: string; secondary: string; accent: string }> = {
  egg: { primary: '#FFF8E7', secondary: '#FFE4B5', accent: '#FFD700' },
  baby: { primary: '#FFB6C1', secondary: '#FF91A4', accent: '#FF69B4' },
  child: { primary: '#87CEEB', secondary: '#68B8DB', accent: '#4169E1' },
  teen: { primary: '#98FB98', secondary: '#7AE67A', accent: '#32CD32' },
  adult: { primary: '#DDA0DD', secondary: '#C78AC7', accent: '#9932CC' },
  elder: { primary: '#FFD700', secondary: '#FFC000', accent: '#FF8C00' },
  legendary: { primary: '#FF6B6B', secondary: '#FF8E53', accent: '#FFD700' },
};

// Mood affects animation and expression
const moodSettings: Record<PetMood, { bounceSpeed: number; bounceHeight: number; eyeScale: number }> = {
  ecstatic: { bounceSpeed: 2, bounceHeight: 0.3, eyeScale: 1.2 },
  happy: { bounceSpeed: 1.5, bounceHeight: 0.2, eyeScale: 1.1 },
  content: { bounceSpeed: 1, bounceHeight: 0.15, eyeScale: 1 },
  neutral: { bounceSpeed: 0.8, bounceHeight: 0.1, eyeScale: 1 },
  sad: { bounceSpeed: 0.5, bounceHeight: 0.05, eyeScale: 0.9 },
  neglected: { bounceSpeed: 0.3, bounceHeight: 0.02, eyeScale: 0.8 },
};

function Accessories({ cosmetics, scale = 1 }: { cosmetics?: Pet3DProps['cosmetics']; scale?: number }) {
  if (!cosmetics) return null;

  return (
    <group>
      {/* Hat */}
      {cosmetics.hat === 'beanie_red' && (
        <mesh position={[0, 0.5 * scale, 0]} scale={scale}>
          <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
      )}
      {cosmetics.hat === 'party_hat' && (
        <group position={[0, 0.6 * scale, 0]} rotation={[0, 0, -0.2]} scale={scale}>
          <mesh position={[0, 0.2, 0]}>
            <coneGeometry args={[0.2, 0.5, 32]} />
            <meshStandardMaterial color="#3B82F6" />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <torusGeometry args={[0.2, 0.05, 16, 32]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
        </group>
      )}

      {/* Glasses */}
      {cosmetics.glasses === 'sunglasses' && (
        <group position={[0, 0.2 * scale, 0.9 * scale]} scale={scale}>
          <mesh position={[-0.15, 0, 0]}>
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.05]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      )}

      {/* Neck */}
      {cosmetics.neck === 'chain_gold' && (
        <mesh position={[0, -0.4 * scale, 0.5 * scale]} rotation={[0.5, 0, 0]} scale={scale}>
          <torusGeometry args={[0.4, 0.08, 16, 32]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
      {cosmetics.neck === 'bow_tie' && (
        <group position={[0, -0.4 * scale, 0.8 * scale]} scale={scale}>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Egg Component
function Egg({ colors, onClick }: { colors: typeof stageColors.egg; onClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group onClick={onClick}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} scale={[1, 1.3, 1]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={colors.primary}
            speed={2}
            distort={0.1}
            radius={1}
          />
        </mesh>
        {/* Egg spots */}
        {[...Array(5)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 1.2) * 0.7,
              Math.cos(i * 1.5) * 0.8 - 0.2,
              Math.cos(i * 1.2) * 0.7
            ]}
            scale={0.15}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={colors.accent} />
          </mesh>
        ))}
        {/* Crack effect */}
        <mesh position={[0.3, 0.5, 0.8]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.4, 0.02, 0.02]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      </Float>
    </group>
  );
}

// Baby Pet - Small, round, cute
function BabyPet({ colors, mood, cosmetics }: { colors: typeof stageColors.baby; mood: PetMood; cosmetics?: Pet3DProps['cosmetics'] }) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = moodSettings[mood];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * settings.bounceSpeed) * settings.bounceHeight;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Body */}
        <mesh scale={[1, 0.9, 0.9]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={1.5} distort={0.15} />
        </mesh>

        {/* Belly */}
        <mesh position={[0, -0.1, 0.6]} scale={[0.6, 0.5, 0.3]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.6} transparent />
        </mesh>

        {/* Eyes */}
        <group position={[0, 0.2, 0.8]} scale={settings.eyeScale}>
          {/* Left eye */}
          <mesh position={[-0.25, 0, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.22, 0, 0.12]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
          <mesh position={[-0.2, 0.03, 0.18]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          {/* Right eye */}
          <mesh position={[0.25, 0, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.28, 0, 0.12]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
          <mesh position={[0.3, 0.03, 0.18]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Blush */}
        <mesh position={[-0.5, 0, 0.6]} scale={[0.15, 0.08, 0.05]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FF9999" opacity={0.6} transparent />
        </mesh>
        <mesh position={[0.5, 0, 0.6]} scale={[0.15, 0.08, 0.05]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FF9999" opacity={0.6} transparent />
        </mesh>

        {/* Mouth */}
        {(mood === 'happy' || mood === 'ecstatic') && (
          <mesh position={[0, -0.15, 0.9]} rotation={[0.3, 0, 0]} scale={[0.2, 0.1, 0.05]}>
            <torusGeometry args={[0.5, 0.3, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
        )}

        {/* Feet */}
        <mesh position={[-0.4, -0.9, 0.2]} scale={[0.25, 0.1, 0.3]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.4, -0.9, 0.2]} scale={[0.25, 0.1, 0.3]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Accessories */}
        <group position={[0, 0.6, 0]}>
          <Accessories cosmetics={cosmetics} scale={0.8} />
        </group>
      </group>
    </Float>
  );
}

// Child Pet - Slightly larger, with ears
function ChildPet({ colors, mood, cosmetics }: { colors: typeof stageColors.child; mood: PetMood; cosmetics?: Pet3DProps['cosmetics'] }) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = moodSettings[mood];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * settings.bounceSpeed) * settings.bounceHeight;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Body */}
        <mesh position={[0, -0.3, 0]} scale={[0.9, 1, 0.85]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={1} distort={0.1} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.8, 0]} scale={0.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={1} distort={0.05} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.5, 1.4, 0]} rotation={[0, 0, -0.3]} scale={[0.2, 0.4, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
        <mesh position={[-0.45, 1.35, 0]} rotation={[0, 0, -0.3]} scale={[0.1, 0.25, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFCCCC" />
        </mesh>
        <mesh position={[0.5, 1.4, 0]} rotation={[0, 0, 0.3]} scale={[0.2, 0.4, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.primary} />
        </mesh>
        <mesh position={[0.45, 1.35, 0]} rotation={[0, 0, 0.3]} scale={[0.1, 0.25, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFCCCC" />
        </mesh>

        {/* Belly */}
        <mesh position={[0, -0.3, 0.6]} scale={[0.5, 0.6, 0.2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.5} transparent />
        </mesh>

        {/* Eyes */}
        <group position={[0, 0.85, 0.6]} scale={settings.eyeScale}>
          <mesh position={[-0.25, 0, 0]}>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.22, 0, 0.1]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
          <mesh position={[-0.2, 0.02, 0.15]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          <mesh position={[0.25, 0, 0]}>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.28, 0, 0.1]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
          <mesh position={[0.3, 0.02, 0.15]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Nose */}
        <mesh position={[0, 0.7, 0.75]} scale={[0.1, 0.08, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FF9999" />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.8, -0.2, 0]} rotation={[0, 0, 0.5]} scale={[0.2, 0.35, 0.2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.8, -0.2, 0]} rotation={[0, 0, -0.5]} scale={[0.2, 0.35, 0.2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.35, -1.2, 0.15]} scale={[0.28, 0.12, 0.35]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.35, -1.2, 0.15]} scale={[0.28, 0.12, 0.35]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Accessories */}
        <group position={[0, 1.2, 0]}>
          <Accessories cosmetics={cosmetics} scale={0.85} />
        </group>
      </group>
    </Float>
  );
}

// Teen Pet - More dynamic, with accessories
function TeenPet({ colors, mood, cosmetics }: { colors: typeof stageColors.teen; mood: PetMood; cosmetics?: Pet3DProps['cosmetics'] }) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = moodSettings[mood];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * settings.bounceSpeed) * settings.bounceHeight;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Body */}
        <mesh position={[0, -0.2, 0]} scale={[0.85, 1.1, 0.8]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.8} distort={0.08} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1, 0]} scale={0.85}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.8} distort={0.05} />
        </mesh>

        {/* Leaf antenna */}
        <mesh position={[0, 1.9, 0]} rotation={[0.2, 0, 0]} scale={[0.15, 0.3, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
        <mesh position={[0, 1.7, 0]} scale={[0.04, 0.15, 0.04]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color="#2E7D32" />
        </mesh>

        {/* Belly */}
        <mesh position={[0, -0.2, 0.55]} scale={[0.45, 0.55, 0.2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.45} transparent />
        </mesh>

        {/* Eyes */}
        <group position={[0, 1.05, 0.65]} scale={settings.eyeScale}>
          <mesh position={[-0.28, 0, 0]} scale={[1, 1.1, 1]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.25, 0, 0.12]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
          <mesh position={[-0.23, 0.03, 0.18]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          <mesh position={[0.28, 0, 0]} scale={[1, 1.1, 1]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.31, 0, 0.12]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#2D2D2D" />
          </mesh>
          <mesh position={[0.33, 0.03, 0.18]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Blush marks */}
        <group position={[0, 0.9, 0.7]}>
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0.3, 0]} scale={[0.08, 0.03, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FF9999" />
          </mesh>
          <mesh position={[-0.55, -0.05, 0]} rotation={[0, 0.3, 0]} scale={[0.08, 0.03, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FF9999" />
          </mesh>
          <mesh position={[0.55, 0, 0]} rotation={[0, -0.3, 0]} scale={[0.08, 0.03, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FF9999" />
          </mesh>
          <mesh position={[0.55, -0.05, 0]} rotation={[0, -0.3, 0]} scale={[0.08, 0.03, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#FF9999" />
          </mesh>
        </group>

        {/* Arms */}
        <mesh position={[-0.85, -0.1, 0]} rotation={[0, 0, 0.6]} scale={[0.18, 0.4, 0.18]}>
          <capsuleGeometry args={[1, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.85, -0.1, 0]} rotation={[0, 0, -0.6]} scale={[0.18, 0.4, 0.18]}>
          <capsuleGeometry args={[1, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.35, -1.25, 0.2]} scale={[0.3, 0.12, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.35, -1.25, 0.2]} scale={[0.3, 0.12, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Accessories */}
        <group position={[0, 1.4, 0]}>
          <Accessories cosmetics={cosmetics} scale={0.9} />
        </group>
      </group>
    </Float>
  );
}

// Adult Pet - Majestic with wings
function AdultPet({ colors, mood, cosmetics }: { colors: typeof stageColors.adult; mood: PetMood; cosmetics?: Pet3DProps['cosmetics'] }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);
  const settings = moodSettings[mood];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * settings.bounceSpeed) * settings.bounceHeight;
    }
    if (wingsRef.current) {
      wingsRef.current.children.forEach((wing, i) => {
        const direction = i === 0 ? 1 : -1;
        wing.rotation.y = direction * (0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.15);
      });
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Wings */}
        <group ref={wingsRef}>
          <mesh position={[-0.9, 0.3, -0.3]} rotation={[0.2, -0.3, 0.1]} scale={[0.6, 0.8, 0.1]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" opacity={0.5} transparent />
          </mesh>
          <mesh position={[0.9, 0.3, -0.3]} rotation={[0.2, 0.3, -0.1]} scale={[0.6, 0.8, 0.1]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" opacity={0.5} transparent />
          </mesh>
        </group>

        {/* Body */}
        <mesh position={[0, -0.15, 0]} scale={[0.9, 1.15, 0.85]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.6} distort={0.06} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.1, 0]} scale={0.9}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.6} distort={0.04} />
        </mesh>

        {/* Crown */}
        <group position={[0, 1.85, 0]}>
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, -0.2]} scale={[0.08, 0.2, 0.08]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.1, 0]} scale={[0.1, 0.25, 0.1]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[0, 0, 0.2]} scale={[0.08, 0.2, 0.08]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>

        {/* Belly */}
        <mesh position={[0, -0.15, 0.6]} scale={[0.5, 0.6, 0.2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.4} transparent />
        </mesh>

        {/* Eyes */}
        <group position={[0, 1.15, 0.7]} scale={settings.eyeScale}>
          <mesh position={[-0.3, 0, 0]} scale={[1, 1.15, 1]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.27, 0, 0.14]}>
            <sphereGeometry args={[0.13, 32, 32]} />
            <meshStandardMaterial color="#4A0080" />
          </mesh>
          <mesh position={[-0.25, 0.03, 0.2]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          <mesh position={[0.3, 0, 0]} scale={[1, 1.15, 1]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.33, 0, 0.14]}>
            <sphereGeometry args={[0.13, 32, 32]} />
            <meshStandardMaterial color="#4A0080" />
          </mesh>
          <mesh position={[0.35, 0.03, 0.2]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Sparkle */}
        <Sparkles count={20} scale={3} size={3} speed={0.4} color="#FFD700" />

        {/* Arms */}
        <mesh position={[-0.95, 0, 0]} rotation={[0, 0, 0.5]} scale={[0.2, 0.45, 0.2]}>
          <capsuleGeometry args={[1, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.95, 0, 0]} rotation={[0, 0, -0.5]} scale={[0.2, 0.45, 0.2]}>
          <capsuleGeometry args={[1, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.4, -1.3, 0.2]} scale={[0.32, 0.14, 0.42]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.4, -1.3, 0.2]} scale={[0.32, 0.14, 0.42]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Tail */}
        <mesh position={[0, -0.5, -0.8]} rotation={[-0.5, 0, 0]} scale={[0.15, 0.4, 0.15]}>
          <capsuleGeometry args={[1, 1, 8, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Accessories */}
        <group position={[0, 1.5, 0]}>
          <Accessories cosmetics={cosmetics} scale={1} />
        </group>
      </group>
    </Float>
  );
}

// Elder Pet - Wise with magical elements
function ElderPet({ colors, mood, cosmetics }: { colors: typeof stageColors.elder; mood: PetMood; cosmetics?: Pet3DProps['cosmetics'] }) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = moodSettings[mood];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * settings.bounceSpeed) * settings.bounceHeight;
    }
  });

  return (
    <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Aura ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.05, 16, 100]} />
          <meshStandardMaterial color="#FFD700" opacity={0.3} transparent emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>

        {/* Wings */}
        <mesh position={[-1, 0.3, -0.3]} rotation={[0.1, -0.4, 0.1]} scale={[0.7, 0.9, 0.1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFD700" opacity={0.4} transparent />
        </mesh>
        <mesh position={[1, 0.3, -0.3]} rotation={[0.1, 0.4, -0.1]} scale={[0.7, 0.9, 0.1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFD700" opacity={0.4} transparent />
        </mesh>

        {/* Body */}
        <mesh position={[0, -0.1, 0]} scale={[0.95, 1.2, 0.9]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.4} distort={0.05} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.15, 0]} scale={0.95}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.4} distort={0.03} />
        </mesh>

        {/* Wise beard */}
        <mesh position={[0, 0.6, 0.7]} scale={[0.4, 0.5, 0.2]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.35, 1.35, 0.7]} rotation={[0, 0, 0.3]} scale={[0.2, 0.05, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.35, 1.35, 0.7]} rotation={[0, 0, -0.3]} scale={[0.2, 0.05, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>

        {/* Eyes */}
        <group position={[0, 1.2, 0.75]} scale={settings.eyeScale * 0.9}>
          <mesh position={[-0.28, 0, 0]}>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.25, 0, 0.1]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#B8860B" />
          </mesh>

          <mesh position={[0.28, 0, 0]}>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.31, 0, 0.1]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="#B8860B" />
          </mesh>
        </group>

        {/* Staff */}
        <group position={[1.3, 0, 0]}>
          <mesh position={[0, 0, 0]} scale={[0.08, 2, 0.08]}>
            <cylinderGeometry args={[1, 1, 1, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 1.1, 0]} scale={0.2}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
          </mesh>
        </group>

        <Sparkles count={30} scale={4} size={4} speed={0.3} color="#FFD700" />

        {/* Feet */}
        <mesh position={[-0.4, -1.35, 0.2]} scale={[0.35, 0.15, 0.45]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>
        <mesh position={[0.4, -1.35, 0.2]} scale={[0.35, 0.15, 0.45]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} />
        </mesh>

        {/* Accessories */}
        <group position={[0, 1.55, 0]}>
          <Accessories cosmetics={cosmetics} scale={1.1} />
        </group>
      </group>
    </Float>
  );
}

// Legendary Pet - Ultimate form with rainbow effects
function LegendaryPet({ colors, mood, cosmetics }: { colors: typeof stageColors.legendary; mood: PetMood; cosmetics?: Pet3DProps['cosmetics'] }) {
  const groupRef = useRef<THREE.Group>(null);
  const settings = moodSettings[mood];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * settings.bounceSpeed) * settings.bounceHeight;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const rainbowColors = useMemo(() => ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'], []);

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Aura rings */}
        {[1.6, 1.9, 2.2].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.3]} position={[0, 0, 0]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color={rainbowColors[i]}
              opacity={0.4 - i * 0.1}
              transparent
              emissive={rainbowColors[i]}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}

        {/* Majestic wings */}
        <mesh position={[-1.1, 0.5, -0.4]} rotation={[0.2, -0.5, 0.2]} scale={[0.8, 1.1, 0.1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFD700" opacity={0.5} transparent emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[1.1, 0.5, -0.4]} rotation={[0.2, 0.5, -0.2]} scale={[0.8, 1.1, 0.1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFD700" opacity={0.5} transparent emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>

        {/* Body with gradient effect */}
        <mesh position={[0, -0.05, 0]} scale={[1, 1.25, 0.95]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.3} distort={0.04} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color={colors.primary} speed={0.3} distort={0.03} />
        </mesh>

        {/* Crown */}
        <group position={[0, 2.1, 0]}>
          {[-0.35, -0.15, 0.05, 0.25, 0.45].map((x, i) => (
            <mesh key={i} position={[x, i % 2 === 0 ? 0 : 0.15, 0]} rotation={[0, 0, (i - 2) * 0.1]} scale={[0.08, 0.2 + (i === 2 ? 0.1 : 0), 0.08]}>
              <coneGeometry args={[1, 1, 4]} />
              <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.2} emissive="#FFD700" emissiveIntensity={0.3} />
            </mesh>
          ))}
          <mesh position={[0.05, 0.35, 0.1]} scale={0.12}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Belly */}
        <mesh position={[0, -0.05, 0.65]} scale={[0.55, 0.65, 0.2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.35} transparent />
        </mesh>

        {/* Rainbow eyes */}
        <group position={[0, 1.3, 0.8]} scale={settings.eyeScale}>
          <mesh position={[-0.32, 0, 0]} scale={[1, 1.2, 1]}>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.28, 0, 0.15]}>
            <sphereGeometry args={[0.14, 32, 32]} />
            <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[-0.26, 0.04, 0.22]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          <mesh position={[0.32, 0, 0]} scale={[1, 1.2, 1]}>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.36, 0, 0.15]}>
            <sphereGeometry args={[0.14, 32, 32]} />
            <meshStandardMaterial color="#4D96FF" emissive="#4D96FF" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.38, 0.04, 0.22]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        <Sparkles count={50} scale={5} size={5} speed={0.5} color="#FFD700" />
        <Stars radius={3} depth={2} count={100} factor={2} saturation={1} fade speed={1} />

        {/* Tail */}
        <group position={[0, -0.3, -1]}>
          {rainbowColors.map((color, i) => (
            <mesh key={i} position={[0, 0.1 * i, -0.2 * i]} rotation={[-0.3 - i * 0.1, 0, 0]} scale={[0.12 - i * 0.015, 0.3, 0.12 - i * 0.015]}>
              <capsuleGeometry args={[1, 0.5, 8, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>

        {/* Accessories */}
        <group position={[0, 1.65, 0]}>
          <Accessories cosmetics={cosmetics} scale={1.2} />
        </group>

        {/* Feet */}
        <mesh position={[-0.45, -1.4, 0.25]} scale={[0.38, 0.16, 0.48]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} emissive={colors.accent} emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.45, -1.4, 0.25]} scale={[0.38, 0.16, 0.48]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={colors.secondary} emissive={colors.accent} emissiveIntensity={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

// Environment backgrounds
function MeadowEnvironment() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <Environment preset="park" background blur={0.8} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#7CB342" />
      </mesh>

      {/* Flowers */}
      {[...Array(20)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 8,
            -2.3,
            (Math.random() - 0.5) * 8
          ]}
          scale={0.1 + Math.random() * 0.1}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={['#FF69B4', '#FFD700', '#FF6B6B', '#9B59B6'][i % 4]} />
        </mesh>
      ))}
    </>
  );
}

function SpaceEnvironment() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#8B5CF6" />
      <pointLight position={[5, 0, 5]} intensity={0.5} color="#06B6D4" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" background />

      {/* Floating platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#1E1B4B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.55, 0]}>
        <torusGeometry args={[3, 0.1, 16, 100]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.5} />
      </mesh>
    </>
  );
}

function CozyEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#FFA500" />
      <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.6} penumbra={1} color="#FFE4B5" />
      <Environment preset="apartment" background blur={0.9} />

      {/* Cozy rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.48, 0]}>
        <ringGeometry args={[3.5, 4, 32]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
    </>
  );
}

function BeachEnvironment() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#FFF8DC" />
      <Environment preset="sunset" background blur={0.6} />

      {/* Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#F4A460" />
      </mesh>

      {/* Shells */}
      {[...Array(10)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 6,
            -2.4,
            (Math.random() - 0.5) * 6
          ]}
          rotation={[0, Math.random() * Math.PI, 0]}
          scale={0.08 + Math.random() * 0.05}
        >
          <sphereGeometry args={[1, 8, 4]} />
          <meshStandardMaterial color="#FFF8DC" />
        </mesh>
      ))}
    </>
  );
}

const environments = {
  meadow: MeadowEnvironment,
  space: SpaceEnvironment,
  cozy: CozyEnvironment,
  beach: BeachEnvironment,
};

// Main Scene Component
function PetScene({ stage, mood, environment, onHatch, cosmetics }: Omit<Pet3DProps, 'name'>) {
  const colors = stageColors[stage];
  const EnvironmentComponent = environments[environment];

  const renderPet = () => {
    switch (stage) {
      case 'egg':
        return <Egg colors={colors} onClick={onHatch} />;
      case 'baby':
        return <BabyPet colors={colors} mood={mood} cosmetics={cosmetics} />;
      case 'child':
        return <ChildPet colors={colors} mood={mood} cosmetics={cosmetics} />;
      case 'teen':
        return <TeenPet colors={colors} mood={mood} cosmetics={cosmetics} />;
      case 'adult':
        return <AdultPet colors={colors} mood={mood} cosmetics={cosmetics} />;
      case 'elder':
        return <ElderPet colors={colors} mood={mood} cosmetics={cosmetics} />;
      case 'legendary':
        return <LegendaryPet colors={colors} mood={mood} cosmetics={cosmetics} />;
      default:
        return <BabyPet colors={colors} mood={mood} cosmetics={cosmetics} />;
    }
  };

  return (
    <>
      <EnvironmentComponent />
      <group position={[0, -0.5, 0]}>
        {renderPet()}
      </group>
    </>
  );
}

// Main Export Component
export function Pet3D({ stage, mood, name, environment, onHatch, cosmetics }: Pet3DProps) {
  return (
    <div className="pet-3d-container">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <PetScene stage={stage} mood={mood} environment={environment} onHatch={onHatch} cosmetics={cosmetics} />
      </Canvas>

      <div className="pet-3d-info">
        <span className="pet-3d-name">{name}</span>
        <span className="pet-3d-stage">{stage}</span>
      </div>

      {stage === 'egg' && (
        <div className="pet-3d-hint">Tap to hatch</div>
      )}
    </div>
  );
}

