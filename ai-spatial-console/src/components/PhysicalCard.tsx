import React, { useState, useEffect } from 'react';
import { RoundedBox, Text, MeshTransmissionMaterial } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { ModelProvider, useAppStore } from '../store/useAppStore';

interface PhysicalCardProps {
  model: ModelProvider;
  position: [number, number, number];
  isActive?: boolean;
}

export const PhysicalCard: React.FC<PhysicalCardProps> = ({ model, position, isActive = true }) => {
  const [pressed, setPressed] = useState(false);
  const [showDesc, setShowDesc] = useState(true);
  const setFocusedModelId = useAppStore((state) => state.setFocusedModelId);
  const conversations = useAppStore((state) => state.conversations);
  const latestMessage = conversations[model.id]?.messages.slice(-1)[0]?.content || "Awaiting input...";

  useEffect(() => {
    const timer = setTimeout(() => setShowDesc(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const { springScale } = useSpring({
    springScale: isActive ? (pressed ? [0.95, 0.95, 0.95] : [1, 1, 1]) : [0.8, 0.8, 0.8],
  });

  let cardColor = '#222222';
  if (model.tier === 'free') cardColor = '#10a37f';
  if (model.tier === 'pro') cardColor = '#4285F4';
  if (model.tier === 'elite') cardColor = '#d97757';

  return (
    <a.group position={position} scale={springScale as any}>
      <RoundedBox
        args={[3, 4, 0.2]}
        radius={0.15}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => {
          setPressed(false);
          if (isActive) setFocusedModelId(model.id);
        }}
        onPointerOut={() => setPressed(false)}
      >
        <MeshTransmissionMaterial transmission={1} thickness={0.5} roughness={0.1} color={cardColor} />
      </RoundedBox>

      <Text position={[0, 1.6, 0.11]} fontSize={0.25} color="#fff" anchorX="center">{model.name}</Text>

      {showDesc && (
        <Text position={[0, 1.3, 0.11]} fontSize={0.12} color="#aaa" anchorX="center" maxWidth={2.5} textAlign="center">
          {model.description}
        </Text>
      )}

      {/* Scrollable text isn't native in R3F Text, so we provide a scrollable box via substring logic or simple display */}
      <Text position={[0, -0.2, 0.11]} fontSize={0.11} color="#fff" anchorX="center" maxWidth={2.6} textAlign="left">
         {latestMessage.substring(0, 500)}
      </Text>
    </a.group>
  );
};
