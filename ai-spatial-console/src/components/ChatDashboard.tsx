import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { PhysicalCard } from './PhysicalCard';
import { useAppStore } from '../store/useAppStore';

const ScrollingGrid = () => {
  const { activeModelIdsByTab, selectedTab, availableModels, activeLayout } = useAppStore();
  const activeModelIds = activeModelIdsByTab[selectedTab] || [];
  const activeModels = useMemo(() => activeModelIds.map(id => availableModels.find(m => m.id === id)).filter(Boolean), [activeModelIds, availableModels]);

  const gridPositions = useMemo(() => {
    const spacingX = 4;
    const spacingY = 5;
    let cols = activeLayout === '1x1' ? 1 : activeLayout === '2x2' ? 2 : 3;
    return activeModels.map((_, i) => [ (i % cols) * spacingX - ((cols-1)*spacingX)/2, 0 - Math.floor(i/cols) * spacingY, 0 ]);
  }, [activeLayout, activeModels.length]);

  return (
    <group>
      {activeModels.map((model, i) => (
        <PhysicalCard key={model?.id} model={model as any} position={gridPositions[i] as any} />
      ))}
    </group>
  );
};

export const ChatDashboard: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true }}>
       <ambientLight intensity={0.5} />
       <pointLight position={[10, 10, 10]} intensity={1.5} />
       <Environment preset="city" />
       <ScrollingGrid />
       <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2} />
    </Canvas>
  );
};
