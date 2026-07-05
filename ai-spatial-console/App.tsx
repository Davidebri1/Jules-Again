import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ChatDashboard } from './src/components/ChatDashboard';
import { GridOverlay } from './src/components/GridOverlay';
import { CardDetailView } from './src/components/CardDetailView';
import { useAppStore } from './src/store/useAppStore';

export default function App() {
  const focusedModelId = useAppStore((state) => state.focusedModelId);

  return (
    <View style={styles.container}>
      {/* 2D Grid Canvas */}
      <View style={styles.canvasContainer}>
        <ChatDashboard />
      </View>

      {/* UI Overlay Switcher */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
         {focusedModelId ? <CardDetailView /> : <GridOverlay />}
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  canvasContainer: {
    ...StyleSheet.absoluteFill,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
  }
});
