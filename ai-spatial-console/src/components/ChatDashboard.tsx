import React, { useMemo, Suspense } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { PhysicalCard } from './PhysicalCard';
import { useAppStore } from '../store/useAppStore';

export const ChatDashboard: React.FC = () => {
  const activeModelIds = useAppStore((state) => state.activeModelIds);
  const availableModels = useAppStore((state) => state.availableModels);
  const activeLayout = useAppStore((state) => state.activeLayout);

  const activeModels = useMemo(() => {
    return activeModelIds.map(id => availableModels.find(m => m.id === id)).filter(Boolean);
  }, [activeModelIds, availableModels]);

  // Calculate grid positions based on layout
  const gridPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const spacingX = 3.5;
    const spacingY = 4.5;

    let cols = 2;
    let rows = 2;

    if (activeLayout === '1x1') {
      cols = 1; rows = 1;
    } else if (activeLayout === '3x3') {
      cols = 3; rows = 3;
    }

    const startX = -((cols - 1) * spacingX) / 2;
    const startY = ((rows - 1) * spacingY) / 2;

    for (let i = 0; i < activeModels.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      if (row < rows) {
        positions.push([startX + col * spacingX, startY - row * spacingY, 0]);
      } else {
        // Push extra cards backward into bokeh depth
        positions.push([startX + col * spacingX, startY - row * spacingY, -5]);
      }
    }
    return positions;
  }, [activeLayout, activeModels.length]);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ flex: 1 }}
    >
      <Suspense fallback={null}>
        {/* We do NOT attach a background color here to allow the 2D app background image to show through */}

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={2}
          castShadow
          shadow-mapSize={2048}
        />
        <spotLight
          position={[-5, 5, 10]}
          intensity={1}
          angle={0.5}
          penumbra={1}
          castShadow
        />

        {/* Environment for reflections on the PBR materials */}
        <Environment preset="city" />

        {/* Render Cards */}
        {activeModels.map((model, index) => (
          model ? (
            <PhysicalCard
              key={model.id}
              model={model as any}
              position={gridPositions[index] || [0, 0, -10]}
              isActive={index < (activeLayout === '1x1' ? 1 : activeLayout === '2x2' ? 4 : 9)}
            />
          ) : null
        ))}

        {/* Shadows below cards */}
        <ContactShadows
          position={[0, -4.5, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={10}
        />
      </Suspense>
    </Canvas>
  );
};
