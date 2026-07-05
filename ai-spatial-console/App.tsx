import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { ChatDashboard } from './src/components/ChatDashboard';
import { GridOverlay } from './src/components/GridOverlay';
import { CardDetailView } from './src/components/CardDetailView';
import { useAppStore } from './src/store/useAppStore';

export default function App() {
  const focusedModelId = useAppStore((state) => state.focusedModelId);

  // In the future this requires dynamic theme switching with provided assets
  const mockBackgroundImage = { uri: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2940&auto=format&fit=crop' };

  return (
    <ImageBackground source={mockBackgroundImage} style={styles.container} resizeMode="cover">
      {/* 3D Spatial Canvas (Always in background, transparent to show image) */}
      <View style={styles.canvasContainer}>
        <ChatDashboard />
      </View>

      {/* 2D UI Overlay Switcher (Crisp native text and inputs) */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
         {focusedModelId ? <CardDetailView /> : <GridOverlay />}
      </View>

      <StatusBar style="light" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvasContainer: {
    ...StyleSheet.absoluteFill,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
  }
});
