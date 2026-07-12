import React, { useRef, useState, useEffect } from 'react';
import { RoundedBox, Text, MeshTransmissionMaterial, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { ModelProvider, useAppStore } from '../store/useAppStore';

interface PhysicalCardProps {
  model: ModelProvider;
  position: [number, number, number];
  isActive?: boolean;
}

export const PhysicalCard: React.FC<PhysicalCardProps> = ({ model, position, isActive = true }) => {
  const [pressed, setPressed] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
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
        {/* High-fidelity glass material for absolute transparency and light refraction */}
        <MeshTransmissionMaterial
          transmission={1.0}
          thickness={0.5}
          roughness={0.05}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          ior={1.2}
          color={cardColor}
          transparent
          opacity={0.3}
        />
      </RoundedBox>

      <Text
        position={[0, 1.6, 0.11]}
        fontSize={0.25}
        color="#fff"
        anchorX="center"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
      >
        {model.name}
      </Text>

      {/* Description Html Overlay */}
      <Html position={[0, 1.1, 0.11]} transform center>
         <div
           style={{
             color: '#dddddd',
             fontSize: '10px',
             fontFamily: 'sans-serif',
             background: 'rgba(0,0,0,0.5)',
             padding: '4px 8px',
             borderRadius: '8px',
             cursor: 'pointer',
             maxWidth: '120px',
             textAlign: 'center',
             whiteSpace: isDescExpanded ? 'normal' : 'nowrap',
             overflow: isDescExpanded ? 'visible' : 'hidden',
             textOverflow: isDescExpanded ? 'clip' : 'ellipsis',
             userSelect: 'none'
           }}
           onPointerDown={(e) => { e.stopPropagation(); setIsDescExpanded(!isDescExpanded); }}
         >
           {model.description}
         </div>
      </Html>

      <Text
        position={[0, 0.7, 0.11]}
        fontSize={0.15}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
      >
        {model.tier.toUpperCase()}
      </Text>

      <Text position={[0, -0.2, 0.11]} fontSize={0.11} color="#fff" anchorX="center" maxWidth={2.6} textAlign="left">
         {latestMessage.substring(0, 500)}
      </Text>
    </a.group>
  );
};
