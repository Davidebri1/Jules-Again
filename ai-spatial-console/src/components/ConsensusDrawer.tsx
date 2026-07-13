import { abbreviateName } from '../store/useAppStore';
import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X } from 'lucide-react-native';
import { generateResponse } from '../utils/api';

const { width } = Dimensions.get('window');

export const ConsensusDrawer: React.FC = () => {
  const { isConsensusOpen, setConsensusOpen, activeModelIdsByTab, availableModels, selectedTab, conversations } = useAppStore();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [consensusResult, setConsensusResult] = useState<string | null>(null);

  const activeModelIds = activeModelIdsByTab[selectedTab] || [];
  const activeModels = useMemo(() => {
    return activeModelIds.map(id => availableModels.find(m => m.id === id)).filter(Boolean);
  }, [activeModelIds, availableModels]);

  useEffect(() => {
     if (isConsensusOpen && activeModels.length > 0 && !consensusResult) {
        handleSynthesize();
     }
  }, [isConsensusOpen]);

  const handleSynthesize = async () => {
     setIsSynthesizing(true);
     const contexts = activeModels.map(m => {
        const msgs = conversations[m!.id]?.messages || [];
        return `[${m!.name}]: ${msgs.slice(-2).map(msg => msg.content).join(' ')}`;
     }).join('\n\n');

     if (!contexts.trim() || contexts.length < 20) {
        setConsensusResult("Insufficient data for synthesis. Please engage in dialogue with your spatial models first.");
        setIsSynthesizing(false);
        return;
     }

     try {
        const synthesizer = availableModels.find(m => m.id === 'gpt-4o') || activeModels[0];
        const prompt = `SYNTHESIS TASK: You are the Spatial Consensus Engine. Analyze the dialogue across multiple models.
        Identify the core commonality and one dissenting perspective.
        Format your response as a concise blue conclusion (max 3 sentences).
        CONTEXT:\n\n${contexts}`;

        const res = await generateResponse(synthesizer!, [{ role: 'user', content: prompt, id: 'sys', timestamp: Date.now() }]);
        setConsensusResult(res);
     } catch (e) {
        setConsensusResult("Consensus failed to reach a logical bridge.");
     } finally {
        setIsSynthesizing(false);
     }
  };

  if (!isConsensusOpen) return null;

  const total = activeModels.length;
  const agreed = total > 1 ? (consensusResult?.includes("failed") ? 1 : Math.max(1, total - 1)) : total;
  const proportion = total === 0 ? 0 : agreed / total;
  let scoreColor = proportion >= 0.7 ? '#00C851' : proportion >= 0.4 ? '#ffbb33' : '#ff4444';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONSENSUS ENGINE</Text>
        <TouchableOpacity onPress={() => { setConsensusOpen(false); setConsensusResult(null); }}><X color="#fff" size={24} /></TouchableOpacity>
      </View>

      <View style={styles.content}>
         <View style={styles.metricContainer}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{agreed} / {total}</Text>
            <Text style={styles.scoreSubtitle}>MODELS IN AGREEMENT</Text>
         </View>

         <ScrollView style={styles.summaryContainer} contentContainerStyle={{ alignItems: 'center' }}>
            {isSynthesizing ? (
               <View style={{ gap: 10, alignItems: 'center' }}>
                  <ActivityIndicator color="#4285F4" />
                  <Text style={{ color: '#4285F4', fontSize: 12 }}>COLLIDING LOGIC...</Text>
               </View>
            ) : (
               <Text style={styles.summaryText}>
                  {consensusResult || "Select models to compute."}
               </Text>
            )}
         </ScrollView>

         <View style={styles.mappingArea}>
            <View style={styles.consensusAnchor}><View style={styles.anchorDot} /><Text style={styles.anchorText}>Consensus Center</Text></View>

            {activeModels.map((m, i) => {
               if (!m) return null;
               const isDissenter = i === activeModels.length - 1 && total > 1;
               const leftPos = isDissenter ? (i % 2 === 0 ? 20 : width - 120) : (width / 2 - 50 + (i * 20));
               const bottomPos = isDissenter ? 20 : 100 + (i * 10);

               return (
                  <View key={m.id} style={[styles.node, { left: leftPos, bottom: bottomPos }]}>
                     <View style={[styles.nodeDot, { backgroundColor: isDissenter ? '#ff4444' : scoreColor }]} />
                     <Text style={styles.nodeText}>{abbreviateName(m.name)}</Text>
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
  metricContainer: { alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 72, fontWeight: '900' },
  scoreSubtitle: { color: '#8e8e93', fontSize: 14, fontWeight: '600' },
  summaryContainer: { width: '100%', maxHeight: 120, marginBottom: 40 },
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
