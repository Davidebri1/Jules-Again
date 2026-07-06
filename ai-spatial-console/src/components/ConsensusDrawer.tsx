import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const ConsensusDrawer: React.FC = () => {
  const { isConsensusOpen, setConsensusOpen, activeModelIds } = useAppStore();

  if (!isConsensusOpen) return null;

  // Mocking the consensus computation based on active models
  const total = activeModelIds.length;
  // If > 2 models, mock a disagreement. Otherwise 100% agreement.
  const agreed = total > 2 ? total - 1 : total;

  // Color calculation based on proportion
  const proportion = total === 0 ? 0 : agreed / total;
  let scoreColor = '#ff4444'; // Red for low
  if (proportion >= 0.7) scoreColor = '#00C851'; // Emerald Green
  else if (proportion >= 0.4) scoreColor = '#ffbb33'; // Orange/Yellow

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONSENSUS ENGINE</Text>
        <TouchableOpacity onPress={() => setConsensusOpen(false)}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
         {/* Oversized Metric */}
         <View style={styles.metricContainer}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
               {agreed} / {total}
            </Text>
            <Text style={styles.scoreSubtitle}>MODELS IN AGREEMENT</Text>
         </View>

         {/* Centered Consensus Summary */}
         <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>SYNTHESIZED CONSENSUS</Text>
            <Text style={styles.summaryText}>
               Based on the aggregated responses, the overarching conclusion is that Spatial Computing represents a paradigm shift in human-computer interaction, prioritizing physical heuristics over flat digital planes.
            </Text>
         </View>

         {/* Dissenting Views Mapping Area (Mock Spatial Field) */}
         <View style={styles.dissentField}>
            <Text style={styles.dissentTitle}>DISSENTERS & DEVIATIONS</Text>

            {/* Visual mapping field */}
            <View style={styles.mappingArea}>
               {/* Mock Consensus Anchor */}
               <View style={styles.consensusAnchor}>
                  <View style={styles.anchorDot} />
                  <Text style={styles.anchorText}>Consensus Center</Text>
               </View>

               {/* Mock Dissenter mapped visually away from center */}
               {total > 2 && (
                  <View style={[styles.dissenterNode, { left: 40, bottom: 40 }]}>
                     <View style={[styles.nodeDot, { backgroundColor: '#ffbb33' }]} />
                     <Text style={styles.nodeText}>LLM-3</Text>
                     <View style={styles.connectingLine} />
                  </View>
               )}
            </View>
         </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  metricContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: '900',
  },
  scoreSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '600',
    marginTop: -10,
  },
  summaryContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  summaryTitle: {
    color: '#4285F4', // Soft glowing blue as requested
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textShadowColor: 'rgba(66, 133, 244, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  summaryText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  dissentField: {
    flex: 1,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20,
  },
  dissentTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 20,
  },
  mappingArea: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  consensusAnchor: {
    position: 'absolute',
    top: 20,
    left: width / 2 - 60,
    alignItems: 'center',
  },
  anchorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  anchorText: {
    color: '#4285F4',
    fontSize: 10,
    marginTop: 5,
  },
  dissenterNode: {
    position: 'absolute',
    alignItems: 'center',
  },
  nodeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 5,
  },
  connectingLine: {
    position: 'absolute',
    width: 100,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    top: 5,
    left: 5,
    transform: [{ rotate: '-45deg' }], // Mock rotation
    transformOrigin: '0% 0%',
  }
});
