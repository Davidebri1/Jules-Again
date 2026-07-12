import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const ConsensusDrawer: React.FC = () => {
  const { isConsensusOpen, setConsensusOpen, activeModelIdsByCategory, selectedTab, availableModels } = useAppStore();

  const activeModels = useMemo(() => {
    return (activeModelIdsByCategory[selectedTab] || []).map(id => availableModels.find(m => m.id === id)).filter(Boolean);
  }, [activeModelIdsByCategory, selectedTab, availableModels]);

  if (!isConsensusOpen) return null;

  const total = activeModels.length;
  const agreed = total > 1 ? total - 1 : total;
  const proportion = total === 0 ? 0 : agreed / total;
  let scoreColor = proportion >= 0.7 ? '#00C851' : proportion >= 0.4 ? '#ffbb33' : '#ff4444';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONSENSUS ENGINE</Text>
        <TouchableOpacity onPress={() => setConsensusOpen(false)}><X color="#fff" size={24} /></TouchableOpacity>
      </View>

      <View style={styles.content}>
         <View style={styles.metricContainer}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{agreed} / {total}</Text>
            <Text style={styles.scoreSubtitle}>MODELS IN AGREEMENT</Text>
         </View>

         <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
               {total === 0 ? "Select models to compute." : "The overarching conclusion emphasizes spatial heuristics as the primary interaction vector."}
            </Text>
         </View>

         <View style={styles.mappingArea}>
            <View style={styles.consensusAnchor}><View style={styles.anchorDot} /><Text style={styles.anchorText}>Consensus Center</Text></View>

            {/* Improved Push/Pull Logic Simulation */}
            {activeModels.map((m, i) => {
               if (!m) return null;
               // Simulate spatial distribution: dissenters move to corners, consensus models stay closer to center
               const isDissenter = i === activeModels.length - 1 && total > 1;
               const leftPos = isDissenter ? (i % 2 === 0 ? 20 : width - 120) : (width / 2 - 50 + (i * 20));
               const bottomPos = isDissenter ? 20 : 100 + (i * 10);

               return (
                  <View key={m.id} style={[styles.node, { left: leftPos, bottom: bottomPos }]}>
                     <View style={[styles.nodeDot, { backgroundColor: isDissenter ? '#ff4444' : scoreColor }]} />
                     <Text style={styles.nodeText}>{m.name.substring(0, 8)}</Text>
                     <View style={[styles.connectingLine, { height: bottomPos, transform: [{rotate: isDissenter ? '45deg' : '0deg'}] }]} />
                  </View>
               );
            })}
         </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  content: { flex: 1, alignItems: 'center', padding: 20 },
  metricContainer: { alignItems: 'center', marginBottom: 40 },
  scoreText: { fontSize: 72, fontWeight: '900' },
  scoreSubtitle: { color: '#8e8e93', fontSize: 14, fontWeight: '600' },
  summaryContainer: { width: '100%', alignItems: 'center', marginBottom: 40 },
  summaryText: { color: '#4285F4', fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
  mappingArea: { flex: 1, width: '100%', borderWidth: 1, borderColor: '#1c1c1e', borderRadius: 12, position: 'relative', overflow: 'hidden' },
  consensusAnchor: { position: 'absolute', top: 20, alignSelf: 'center', alignItems: 'center', zIndex: 10 },
  anchorDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4285F4' },
  anchorText: { color: '#4285F4', fontSize: 10, marginTop: 5 },
  node: { position: 'absolute', alignItems: 'center' },
  nodeDot: { width: 12, height: 12, borderRadius: 6 },
  nodeText: { color: '#fff', fontSize: 10, marginTop: 5, fontWeight: 'bold' },
  connectingLine: { position: 'absolute', width: 1, backgroundColor: 'rgba(255,255,255,0.1)', top: -50, zIndex: -1 }
});
