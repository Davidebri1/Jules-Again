import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { ChatDashboard } from './src/components/ChatDashboard';
import { GridOverlay } from './src/components/GridOverlay';
import { CardDetailView } from './src/components/CardDetailView';
import { SettingsPanel, THEMES } from './src/components/SettingsPanel';
import { ConsensusDrawer } from './src/components/ConsensusDrawer';
import { SmartGenSuiteView } from './src/components/SmartGenSuiteView';
import { FileManagerView } from './src/components/FileManagerView';
import { AuthOverlay } from './src/components/AuthOverlay';
import { LinearGradient } from 'expo-linear-gradient';
import { MarketplaceView } from './src/components/MarketplaceView';
import { UpgradePage } from './src/components/UpgradePage';
import { HistoryDrawer } from './src/components/HistoryDrawer';
import { useAppStore } from './src/store/useAppStore';

export default function App() {
  const { focusedModelId, currentThemeId } = useAppStore();

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  return (
    <ImageBackground source={{ uri: currentTheme.uri }} style={styles.container} resizeMode="cover">
      {/* 3D Spatial Canvas (Always in background, transparent to show image) */}
      <View style={styles.canvasContainer}>
        <ChatDashboard />
      </View>

      {/* 2D UI Overlay Switcher (Crisp native text and inputs) */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
         {focusedModelId ? <CardDetailView /> : <GridOverlay />}
      </View>

      {/* Absolute Full Screen Drawers/Panels */}
      <HistoryDrawer />
      <SettingsPanel />
      <ConsensusDrawer />
      <SmartGenSuiteView />
        <FileManagerView />
        <AuthOverlay />
      <MarketplaceView />
      <UpgradePage />

      <StatusBar style="light" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  canvasContainer: {
    ...StyleSheet.absoluteFill,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
  }
});
