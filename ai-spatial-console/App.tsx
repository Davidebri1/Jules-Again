import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { ChatDashboard } from './src/components/ChatDashboard';
import { useAppStore, GridLayout } from './src/store/useAppStore';

export default function App() {
  const { activeLayout, setActiveLayout } = useAppStore();

  const handleLayoutChange = (layout: GridLayout) => {
    setActiveLayout(layout);
  };

  return (
    <View style={styles.container}>
      {/* 3D Spatial Canvas */}
      <View style={styles.canvasContainer}>
        <ChatDashboard />
      </View>

      {/* 2D UI Overlay */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Text style={styles.brandText}>SPATIAL CONSOLE</Text>

          {/* Grid Layout Selector Tray */}
          <View style={styles.gridSelector}>
            <TouchableOpacity
              style={[styles.gridButton, activeLayout === '1x1' && styles.gridButtonActive]}
              onPress={() => handleLayoutChange('1x1')}
            >
              <Text style={styles.gridButtonText}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gridButton, activeLayout === '2x2' && styles.gridButtonActive]}
              onPress={() => handleLayoutChange('2x2')}
            >
              <Text style={styles.gridButtonText}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gridButton, activeLayout === '3x3' && styles.gridButtonActive]}
              onPress={() => handleLayoutChange('3x3')}
            >
              <Text style={styles.gridButtonText}>9</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomBar}>
           {/* Placeholder for input / persistent drawer button */}
           <View style={styles.inputBarMock}>
              <Text style={styles.inputTextMock}>Message AI Spatial Console...</Text>
           </View>
        </View>
      </SafeAreaView>

      <StatusBar style="light" />
    </View>
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
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  brandText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.8,
  },
  gridSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
  },
  gridButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 40,
  },
  inputBarMock: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  inputTextMock: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
  }
});
