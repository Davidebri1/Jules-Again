import React, { useRef, useState } from 'react';
import { RoundedBox, Text, MeshTransmissionMaterial } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

interface SpatialAssetProps {
  file: any;
  position: [number, number, number];
}

export const SpatialAsset: React.FC<SpatialAssetProps> = ({ file, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setFileManagerOpen = useAppStore(state => state.setFileManagerOpen);

  const { springPos, springScale, springRot } = useSpring({
    springPos: position,
    springScale: hovered ? [1.1, 1.1, 1.1] : [0.8, 0.8, 0.8],
    springRot: hovered ? [0, 0, 0] : [0, Math.random() * 0.5 - 0.25, Math.random() * 0.2 - 0.1],
    config: { mass: 1, tension: 280, friction: 60 },
  });

  return (
    <a.group
      position={springPos as any}
      scale={springScale as any}
      rotation={springRot as any}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={(e) => { e.stopPropagation(); setFileManagerOpen(true); }}
    >
      <RoundedBox
        ref={meshRef as any}
        args={[2, 2.5, 0.1]}
        radius={0.05}
        smoothness={4}
      >
        <MeshTransmissionMaterial
          buffer={null as any}
          color={file.type.includes('image') ? "#4285F4" : file.type.includes('video') ? "#d97757" : "#10a37f"}
          transmission={0.6}
          thickness={0.2}
          roughness={0.1}
          ior={1.2}
          attenuationDistance={2}
          attenuationColor="#ffffff"
        />
      </RoundedBox>

      {/* Placeholder Icon Graphic mapping */}
      <Text
        position={[0, 0.5, 0.06]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {file.type.includes('image') ? "Img" : file.type.includes('video') ? "Vid" : "Doc"}
      </Text>

      <Text
        position={[0, -0.8, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="center"
      >
        {file.name}
      </Text>
    </a.group>
  );
};
