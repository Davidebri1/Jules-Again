import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { ChatDashboard } from './src/components/ChatDashboard';
import { GridOverlay } from './src/components/GridOverlay';
import { CardDetailView } from './src/components/CardDetailView';
import { SettingsPanel } from './src/components/SettingsPanel';
import { ConsensusDrawer } from './src/components/ConsensusDrawer';
import { SmartGenSuiteView } from './src/components/SmartGenSuiteView';
import { FileManagerView } from './src/components/FileManagerView';
import { AuthOverlay } from './src/components/AuthOverlay';
import { MarketplaceView } from './src/components/MarketplaceView';
import { UpgradePage } from './src/components/UpgradePage';
import { HistoryDrawer } from './src/components/HistoryDrawer';
import { useAppStore } from './src/store/useAppStore';

export default function App() {
  const { focusedModelId, currentThemeId, themes } = useAppStore();
  const currentTheme = themes.find(t => t.id === currentThemeId) || themes[0];

  return (
    <View style={styles.container}>
      <ImageBackground
         source={typeof currentTheme?.uri === "string" ? { uri: currentTheme?.uri } : currentTheme?.uri}
         style={StyleSheet.absoluteFill}
         resizeMode="cover"
      />

      <View style={styles.canvasContainer}>
        <ChatDashboard />
      </View>

      <View style={styles.overlayContainer} pointerEvents="box-none">
         {focusedModelId ? <CardDetailView /> : <GridOverlay />}
      </View>

      <HistoryDrawer />
      <SettingsPanel />
      <ConsensusDrawer />
      <SmartGenSuiteView />
      <FileManagerView />
      <AuthOverlay />
      <MarketplaceView />
      <UpgradePage />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvasContainer: { ...StyleSheet.absoluteFill },
  overlayContainer: { ...StyleSheet.absoluteFill }
});
