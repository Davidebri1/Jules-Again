import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, Brain, FolderOpen, CheckSquare, Bell, Code, Plus } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const SmartGenSuiteView: React.FC = () => {
  const { isSmartGenOpen, setSmartGenOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState('Memories');
  const transX = useSharedValue(SCREEN_WIDTH);

  React.useEffect(() => {
    transX.value = withSpring(isSmartGenOpen ? 0 : SCREEN_WIDTH);
  }, [isSmartGenOpen]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: transX.value }] }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SMART GEN SUITE</Text>
          <TouchableOpacity onPress={() => setSmartGenOpen(false)}><X color="#fff" size={24} /></TouchableOpacity>
        </View>
        <View style={styles.content}>
           <View style={styles.sidebar}>
              {[Brain, FolderOpen, CheckSquare, Bell, Code].map((Icon, i) => (
                 <TouchableOpacity key={i} style={styles.tabBtn} onPress={() => setActiveTab(['Memories', 'Projects', 'Tasks', 'Reminders', 'Artifacts'][i])}>
                    <Icon color="#fff" size={24} />
                 </TouchableOpacity>
              ))}
           </View>
           <View style={styles.main}>
              <Text style={styles.title}>{activeTab.toUpperCase()}</Text>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                 <View style={styles.card}><Text style={styles.cardTitle}>Sample Auto-Gen</Text><Text style={styles.cardText}>Derived from your context window.</Text></View>
              </ScrollView>
              <View style={styles.footer}><Text style={styles.footerText}>*Smart Gen uses non-private inputs to automate context tracking.</Text></View>
           </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 150 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  content: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 70, backgroundColor: '#161618', alignItems: 'center', paddingTop: 20, gap: 25 },
  tabBtn: { padding: 12 },
  main: { flex: 1, padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  card: { backgroundColor: '#1c1c1e', padding: 18, borderRadius: 16, marginBottom: 15 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardText: { color: '#8e8e93', fontSize: 14, marginTop: 8 },
  footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#1c1c1e', paddingTop: 15 },
  footerText: { color: '#636366', fontSize: 11, fontStyle: 'italic' }
});
