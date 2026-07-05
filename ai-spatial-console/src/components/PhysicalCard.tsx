import React, { useRef, useState, useEffect } from 'react';
import { RoundedBox, Text, MeshTransmissionMaterial } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { ModelProvider } from '../store/useAppStore';
import { Gyroscope } from 'expo-sensors';

interface PhysicalCardProps {
  model: ModelProvider;
  position: [number, number, number];
  isActive?: boolean;
}

export const PhysicalCard: React.FC<PhysicalCardProps> = ({ model, position, isActive = true }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  // Spring physics for smooth transitions
  const { springPos, springScale, springRot } = useSpring({
    springPos: position,
    springScale: isActive ? (hovered ? [1.02, 1.02, 1.02] : [1, 1, 1]) : [0.9, 0.9, 0.9],
    springRot: [gyroData.y * 0.5, gyroData.x * 0.5, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  useEffect(() => {
    let subscription: any;
    Gyroscope.isAvailableAsync().then((isAvailable) => {
      if (isAvailable) {
         Gyroscope.setUpdateInterval(50);
         subscription = Gyroscope.addListener((gyroscopeData) => {
           setGyroData(gyroscopeData);
         });
      }
    });
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);


  // Determine color based on provider
  let cardColor = '#222222';
  if (model.provider === 'openai') cardColor = '#10a37f';
  if (model.provider === 'anthropic') cardColor = '#d97757';

  return (
    <a.group position={springPos as any} scale={springScale as any} rotation={springRot as any}>
      <RoundedBox
        ref={meshRef as any}
        args={[3, 4, 0.2]} // Width, height, depth
        radius={0.2}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshTransmissionMaterial
          buffer={null as any}
          color={cardColor}
          transmission={0.8}
          thickness={0.5}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.5}
          attenuationDistance={1}
          attenuationColor="#ffffff"
        />
      </RoundedBox>

      {/* Embedded Text */}
      <Text
        position={[0, 1.5, 0.11]} // Slightly in front of the card
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
      >
        {model.name}
        <meshStandardMaterial attach="material" color="#ffffff" roughness={0.5} metalness={0.5} />
      </Text>

      <Text
        position={[0, 1.1, 0.11]}
        fontSize={0.15}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
      >
        {model.tier.toUpperCase()}
      </Text>
    </a.group>
  );
};
