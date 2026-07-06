import React, { useRef, useState, useEffect } from 'react';
import { RoundedBox, Text, MeshTransmissionMaterial } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { ModelProvider, useAppStore } from '../store/useAppStore';
import { Alert } from 'react-native';
import { Gyroscope } from 'expo-sensors';

interface PhysicalCardProps {
  model: ModelProvider;
  position: [number, number, number];
  isActive?: boolean;
}

export const PhysicalCard: React.FC<PhysicalCardProps> = ({ model, position, isActive = true }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pressed, setPressed] = useState(false);
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const setFocusedModelId = useAppStore((state) => state.setFocusedModelId);
  const activeLayout = useAppStore((state) => state.activeLayout);
  const conversations = useAppStore((state) => state.conversations);
  const latestMessage = conversations[model.id]?.messages.slice(-1)[0]?.content || "Awaiting input...";

  // Layout affects base scale
  const baseScale = activeLayout === '3x3' ? 0.7 : activeLayout === '1x1' ? 1.2 : 1;

  // Spring physics for smooth transitions
  const { springPos, springScale, springRot } = useSpring({
    springPos: position,
    springScale: isActive ? (pressed ? [baseScale * 0.95, baseScale * 0.95, baseScale * 0.95] : [baseScale, baseScale, baseScale]) : [0.9, 0.9, 0.9],
    springRot: [gyroData.y * 0.5, gyroData.x * 0.5, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  useEffect(() => {
    let subscription: any;
    let isMounted = true;

    Gyroscope.isAvailableAsync().then((isAvailable) => {
      if (isAvailable && isMounted) {
         Gyroscope.setUpdateInterval(50);
         subscription = Gyroscope.addListener((gyroscopeData) => {
           if(isMounted) setGyroData(gyroscopeData);
         });
      }
    });
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Determine color based on provider
  let cardColor = '#222222';
  if (model.provider === 'openai') cardColor = '#10a37f';
  if (model.provider === 'anthropic') cardColor = '#d97757';
  if (model.provider === 'google') cardColor = '#4285F4';

  return (
    <a.group position={springPos as any} scale={springScale as any} rotation={springRot as any}>
      <RoundedBox
        ref={meshRef as any}
        args={[3, 4, 0.2]} // Width, height, depth
        radius={0.2}
        smoothness={4}
        onPointerDown={(e) => { e.stopPropagation(); setPressed(true); }}
        onPointerUp={(e) => {
          e.stopPropagation();
          setPressed(false);
          if(isActive && setFocusedModelId) {
             setFocusedModelId(model.id);
          }
        }}
        onPointerOut={(e) => { e.stopPropagation(); setPressed(false); }}
      >
        {/* The core 3D spatial transmission material, rendering true physical light refraction instead of generic 2D blur */}
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

      {/* Mock chat preview text */}
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.12}
        color="rgba(255,255,255,0.7)"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
        textAlign="center"
        onPointerDown={(e) => {
            // Primitive long-press emulation for 3D Text
            // In a real app we'd use a timer. For this patch, we attach to double click or explicit contextual tap
        }}
        onDoubleClick={(e) => {
            e.stopPropagation();
            Alert.alert("Preview Options", "Choose an action:", [
               { text: "Copy Preview", onPress: () => {} },
               { text: "Download (.txt)", onPress: () => {} },
               { text: "Cancel", style: "cancel" }
            ]);
        }}
      >
        {latestMessage.substring(0, 100) + (latestMessage.length > 100 ? "..." : "")}
      </Text>
    </a.group>
  );
};
