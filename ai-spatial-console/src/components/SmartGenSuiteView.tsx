import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAppStore, Message } from '../store/useAppStore';
import { X, Brain, FolderOpen, CheckSquare, Bell, Code } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const SmartGenSuiteView: React.FC = () => {
  const { isSmartGenOpen, setSmartGenOpen, conversations } = useAppStore();
  const [activeTab, setActiveTab] = useState('Memories');
  const transX = useSharedValue(SCREEN_WIDTH);

  React.useEffect(() => {
    transX.value = withSpring(isSmartGenOpen ? 0 : SCREEN_WIDTH);
  }, [isSmartGenOpen]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: transX.value }] }));

  // Collect all smart gen events from across all conversations
  const allEvents = Object.values(conversations).flatMap(c =>
     c.messages.filter(m => m.smartGenEvent).map(m => ({ ...m.smartGenEvent, modelId: c.modelId, timestamp: m.timestamp }))
  );

  const filteredEvents = allEvents.filter(e => {
     if (activeTab === 'Memories') return e.type === 'memory';
     if (activeTab === 'Tasks') return e.type === 'task';
     if (activeTab === 'Reminders') return e.type === 'reminder';
     if (activeTab === 'Artifacts') return e.type === 'artifact';
     return false;
  });

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SMART GEN SUITE</Text>
          <TouchableOpacity onPress={() => setSmartGenOpen(false)}><X color="#fff" size={24} /></TouchableOpacity>
        </View>
        <View style={styles.content}>
           <View style={styles.sidebar}>
              {[
                 { id: 'Memories', Icon: Brain },
                 { id: 'Tasks', Icon: CheckSquare },
                 { id: 'Reminders', Icon: Bell },
                 { id: 'Artifacts', Icon: Code }
              ].map(({ id, Icon }) => (
                 <TouchableOpacity key={id} style={[styles.tabBtn, activeTab === id && styles.activeTabBtn]} onPress={() => setActiveTab(id)}>
                    <Icon color={activeTab === id ? "#4285F4" : "#fff"} size={24} />
                 </TouchableOpacity>
              ))}
           </View>
           <View style={styles.main}>
              <Text style={styles.title}>{activeTab.toUpperCase()}</Text>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                 {filteredEvents.length === 0 ? (
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} detected yet. Continue chatting to auto-populate.</Text>
                 ) : (
                    filteredEvents.map((event, i) => (
                       <View key={i} style={styles.card}>
                          <Text style={styles.cardTitle}>{event.description}</Text>
                          <Text style={styles.cardMeta}>Derived from {event.modelId} • {new Date(event.timestamp!).toLocaleTimeString()}</Text>
                       </View>
                    ))
                 )}
              </ScrollView>
              <View style={styles.footer}><Text style={styles.footerText}>*Smart Gen uses a specialized 8KB classification loop to track context.*</Text></View>
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
  activeTabBtn: { backgroundColor: '#1c1c1e', borderRadius: 12 },
  main: { flex: 1, padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  emptyText: { color: '#636366', textAlign: 'center', marginTop: 40, fontSize: 14 },
  card: { backgroundColor: '#1c1c1e', padding: 18, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#3a3a3c' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#636366', fontSize: 10, marginTop: 8, fontWeight: 'bold' },
  footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#1c1c1e', paddingTop: 15 },
  footerText: { color: '#636366', fontSize: 11, fontStyle: 'italic' }
});
