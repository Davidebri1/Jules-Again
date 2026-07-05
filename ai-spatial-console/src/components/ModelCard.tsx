import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ModelProvider, useAppStore } from '../store/useAppStore';

interface ModelCardProps {
  model: ModelProvider;
  width: number;
  height: number;
  left: number;
  top: number;
  isVisible: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, width, height, left, top, isVisible }) => {
  const setFocusedModelId = useAppStore((state) => state.setFocusedModelId);
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(width, { damping: 20, stiffness: 150 }),
      height: withSpring(height, { damping: 20, stiffness: 150 }),
      left: withSpring(left, { damping: 20, stiffness: 150 }),
      top: withSpring(top, { damping: 20, stiffness: 150 }),
      opacity: withTiming(isVisible ? 1 : 0, { duration: 300 }),
      transform: [
        { scale: withSpring(pressed.value ? 0.95 : 1) }
      ],
      zIndex: isVisible ? 1 : 0,
    };
  });

  // Color logic
  let glowColor = 'rgba(255,255,255,0.1)';
  if (model.provider === 'openai') glowColor = 'rgba(16, 163, 127, 0.2)';
  if (model.provider === 'anthropic') glowColor = 'rgba(217, 119, 87, 0.2)';
  if (model.provider === 'google') glowColor = 'rgba(66, 133, 244, 0.2)';

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]} pointerEvents={isVisible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback
        onPressIn={() => { pressed.value = true; }}
        onPressOut={() => { pressed.value = false; }}
        onPress={() => {
          if (isVisible) setFocusedModelId(model.id);
        }}
      >
        <View style={styles.touchableArea}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

          <LinearGradient
            colors={['rgba(255,255,255,0.1)', glowColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{model.name}</Text>
            {model.description && (
              <Text style={styles.description} numberOfLines={1}>{model.description}</Text>
            )}

            <View style={styles.chatPreview}>
               <Text style={styles.previewText} numberOfLines={3}>Awaiting input...</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  touchableArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },
  chatPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
  }
});
