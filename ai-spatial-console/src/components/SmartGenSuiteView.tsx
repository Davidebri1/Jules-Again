import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { Calendar, ChevronLeft as CalLeft, ChevronRight as CalRight } from 'lucide-react-native';
import { X, Brain, FolderOpen, CheckSquare, Bell, Code, Plus } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

type ToolTab = 'Memories' | 'Projects' | 'Tasks' | 'Reminders' | 'Artifacts';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Define specific mock data structure based on tool type to simulate auto-generation
const MOCK_DATA = {
  Memories: [
    { id: 1, title: 'Prefers Dark Theme Interfaces', desc: 'Noted during UI discussion with GPT-4o regarding spatial canvas design.', tags: ['UX Preference', 'Auto-Gen', 'GPT-4o'], time: '1h ago' },
    { id: 2, title: 'Working on React Native 3D Stack', desc: 'Extracted from queries about Three.js, React Three Fiber, and Expo Web compatibility.', tags: ['Context: Development', 'Auto-Gen', 'Cross-Model'], time: '3h ago' }
  ],
  Projects: [
    { id: 1, title: 'Spatial Console Initialization', desc: 'Auto-created workspace gathering all conversations related to the 3D multi-model chat app.', tags: ['Active Workspace', 'Auto-Gen', 'System'], time: '2h ago' },
    { id: 2, title: 'Marketplace Integration', desc: 'Contains generated UI mockups and related backend structural plans from Claude.', tags: ['Draft', 'Auto-Gen', 'Claude'], time: '4h ago' }
  ],
  Tasks: [
    { id: 1, title: 'Implement Post-Processing Shaders', desc: 'Generated from TODO comment in ChatDashboard.tsx snippet shared with Gemini.', tags: ['Pending', 'Code: Frontend', 'Gemini'], time: '30m ago' },
    { id: 2, title: 'Verify Android Build Compatibility', desc: 'Extracted from user prompt concerning cross-platform constraints.', tags: ['High Priority', 'Auto-Gen', 'System'], time: '5h ago' }
  ],
  Reminders: [
    { id: 1, title: 'Review API Key Usage Limits', desc: 'Suggested based on frequent switching between Elite tier models (GPT-4o, Claude 3 Opus).', tags: ['Billing', 'Auto-Gen'], time: '10m ago' },
    { id: 2, title: 'Deploy Web Version for Testing', desc: 'Derived from successful local test run context.', tags: ['DevOps', 'Auto-Gen'], time: '1d ago' }
  ],
  Artifacts: [
    { id: 1, title: 'physics_config_v2.json', desc: 'Saved output from Sonnet regarding mass/spring configuration for R3F animations.', tags: ['JSON', 'Auto-Saved', 'Sonnet'], time: '1h ago' },
    { id: 2, title: 'GlassMaterialShader.glsl', desc: 'Custom shader code block extracted and converted to artifact from GPT-4o conversation.', tags: ['GLSL', 'Auto-Saved', 'GPT-4o'], time: '4h ago' }
  ]
};

export const SmartGenSuiteView: React.FC = () => {
  const { isSmartGenOpen, setSmartGenOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<ToolTab>('Memories');

  // Animated sliding value
  const translateX = useSharedValue(SCREEN_WIDTH);

  React.useEffect(() => {
    if (isSmartGenOpen) {
      translateX.value = withSpring(0, { mass: 0.8, damping: 15, stiffness: 100 });
    } else {
      translateX.value = withSpring(SCREEN_WIDTH, { mass: 0.8, damping: 15, stiffness: 100 });
    }
  }, [isSmartGenOpen, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const tabs: { id: ToolTab, icon: any }[] = [
     { id: 'Memories', icon: Brain },
     { id: 'Projects', icon: FolderOpen },
     { id: 'Tasks', icon: CheckSquare },
     { id: 'Reminders', icon: Bell },
     { id: 'Artifacts', icon: Code },
  ];

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents={isSmartGenOpen ? "auto" : "none"}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SMART GEN SUITE</Text>
          <TouchableOpacity onPress={() => setSmartGenOpen(false)}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
           {/* Sidebar Tabs */}
           <View style={styles.sidebar}>
              {tabs.map(tab => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                    <TouchableOpacity
                       key={tab.id}
                       style={[styles.tabButton, isActive && styles.tabButtonActive]}
                       onPress={() => setActiveTab(tab.id)}
                    >
                       <Icon color={isActive ? "#fff" : "rgba(255,255,255,0.4)"} size={24} />
                       {isActive && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                 );
              })}
           </View>

           {/* Main Content Area */}
           <View style={styles.mainArea}>
              <View style={styles.areaHeader}>
                <Text style={styles.areaTitle}>{activeTab.toUpperCase()}</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Plus color="#fff" size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                 {/* Render Tool Specific Data */}
                 {MOCK_DATA[activeTab].map(item => (
                   <View key={item.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>{item.title}</Text>
                        <Text style={styles.entryTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.entryText}>
                         {item.desc}
                      </Text>
                      <View style={styles.badgeRow}>
                        {item.tags.map((tag, idx) => (
                           <View key={idx} style={[
                               styles.badge,
                               tag.includes('GPT') && { backgroundColor: 'rgba(16, 163, 127, 0.2)', borderColor: 'rgba(16, 163, 127, 0.4)' },
                               tag.includes('Claude') && { backgroundColor: 'rgba(217, 119, 87, 0.2)', borderColor: 'rgba(217, 119, 87, 0.4)' },
                               tag.includes('Cross-Model') && { backgroundColor: 'rgba(66, 133, 244, 0.2)', borderColor: 'rgba(66, 133, 244, 0.4)' }
                           ]}>
                              <Text style={[
                                  styles.badgeText,
                                  tag.includes('GPT') && { color: '#10a37f' },
                                  tag.includes('Claude') && { color: '#d97757' },
                                  tag.includes('Cross-Model') && { color: '#4285F4' }
                              ]}>{tag}</Text>
                           </View>
                        ))}
                      </View>
                   </View>
                 ))}
              </ScrollView>

              <View style={styles.footerNote}>
                 <Text style={styles.footerText}>
                    *Smart Gen Suite items are autogenerated (auto-named, auto-tagged) based on context derived from all non-private mode inputs, including conversation history, files, and other generated tools.
                 </Text>
              </View>
           </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  calendarMonth: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  calDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  calCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calCellToday: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  calCellText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  calCellTextToday: {
    color: '#fff',
    fontWeight: '800',
  },
  calEventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff453a',
    marginTop: 2,
  },

  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,15,18,0.98)', // Deep slate with high opacity
    zIndex: 150,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 70,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    paddingTop: 20,
    gap: 25,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabButton: {
     padding: 12,
     position: 'relative',
  },
  tabButtonActive: {
     backgroundColor: 'rgba(255,255,255,0.08)',
     borderRadius: 12,
  },
  activeIndicator: {
    position: 'absolute',
    left: -10,
    top: 10,
    bottom: 10,
    width: 3,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  mainArea: {
    flex: 1,
    padding: 20,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  areaTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 15,
    paddingBottom: 20,
  },
  entryCard: {
     backgroundColor: 'rgba(255,255,255,0.03)',
     padding: 18,
     borderRadius: 16,
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.08)',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTitle: {
     color: '#fff',
     fontSize: 16,
     fontWeight: '700',
  },
  entryTime: {
     color: 'rgba(255,255,255,0.4)',
     fontSize: 12,
  },
  entryText: {
     color: 'rgba(255,255,255,0.6)',
     fontSize: 14,
     lineHeight: 20,
     marginBottom: 15,
  },
  badgeRow: {
     flexDirection: 'row',
     gap: 10,
  },
  badge: {
     backgroundColor: 'rgba(255,255,255,0.08)',
     paddingHorizontal: 10,
     paddingVertical: 4,
     borderRadius: 12,
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: {
     color: 'rgba(255,255,255,0.7)',
     fontSize: 11,
     fontWeight: '600',
  },
  footerNote: {
     marginTop: 20,
     paddingTop: 15,
     borderTopWidth: 1,
     borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
     color: 'rgba(255,255,255,0.3)',
     fontSize: 11,
     fontStyle: 'italic',
     lineHeight: 16,
  }
});
