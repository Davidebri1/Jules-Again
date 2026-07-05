import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import { ModelCard } from './ModelCard';

export const ChatDashboard: React.FC = () => {
  const activeModels = useAppStore((state) => state.activeModels);
  const activeLayout = useAppStore((state) => state.activeLayout);
  const { width, height } = useWindowDimensions();

  // Grid logic
  const cols = activeLayout === '1x1' ? 1 : activeLayout === '2x2' ? 2 : 3;
  const rows = activeLayout === '1x1' ? 1 : activeLayout === '2x2' ? 2 : 3;

  // Account for padding and spacing
  const SPACING = 15;
  const PADDING_TOP = 80;
  const PADDING_BOTTOM = 250;

  const availableWidth = width - (SPACING * (cols + 1));
  const availableHeight = height - PADDING_TOP - PADDING_BOTTOM - (SPACING * (rows - 1));

  const cardWidth = availableWidth / cols;
  const cardHeight = availableHeight / rows;

  return (
    <View style={styles.container}>
      {activeModels.map((model, index) => {
        // Calculate position
        const col = index % cols;
        const row = Math.floor(index / cols);

        // Hide cards that don't fit in the current layout grid
        const isVisible = row < rows;

        const left = SPACING + (col * (cardWidth + SPACING));
        const top = PADDING_TOP + (row * (cardHeight + SPACING));

        return (
          <ModelCard
            key={model.id}
            model={model}
            width={cardWidth}
            height={cardHeight}
            left={left}
            top={top}
            isVisible={isVisible}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // background image will be handled by a ThemeProvider later
    backgroundColor: '#0a0a0a',
  },
});
