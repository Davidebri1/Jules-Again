import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAppStore, GridLayout, ModelCategory } from '../store/useAppStore';
import { Settings, User, Sparkles } from 'lucide-react-native';

export const GridOverlay: React.FC = () => {
  const {
    activeLayout, setActiveLayout,
    selectedTab, setSelectedTab,
    availableModels, activeModelIds, toggleActiveModel,
    setSettingsOpen, setConsensusOpen
  } = useAppStore();

  const handleLayoutChange = (layout: GridLayout) => setActiveLayout(layout);

  const categories: { id: ModelCategory, label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'image', label: 'Image' },
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'coding', label: 'Coding' },
  ];

  // Filter models based on the currently selected tab/category
  const displayedModels = useMemo(() => {
    return availableModels.filter(m => m.category === selectedTab);
  }, [availableModels, selectedTab]);

  return (
    <SafeAreaView style={styles.overlay} pointerEvents="box-none">

      {/* Top Bar: Brand, Layout, Profile */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsOpen(true)}>
          <Settings color="#fff" size={20} />
        </TouchableOpacity>

        <View style={styles.gridSelector}>
          {(['1x1', '2x2', '3x3'] as GridLayout[]).map((layout, i) => (
            <TouchableOpacity
              key={layout}
              style={[styles.gridButton, activeLayout === layout && styles.gridButtonActive]}
              onPress={() => handleLayoutChange(layout)}
            >
              <Text style={styles.gridButtonText}>{i === 0 ? '1' : i === 1 ? '4' : '9'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <User color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs and Model Selector Tray */}
      <View style={styles.bottomSection}>
        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tabButton, selectedTab === cat.id && styles.tabButtonActive]}
                onPress={() => setSelectedTab(cat.id)}
              >
                <Text style={[styles.tabText, selectedTab === cat.id && styles.tabTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Model Selector Tray (Dynamic based on selected tab) */}
        <View style={styles.modelTrayContainer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modelTrayScroll}>
              {displayedModels.map(model => {
                 const isActive = activeModelIds.includes(model.id);
                 let borderColor = 'rgba(255,255,255,0.3)';
                 if (model.tier === 'pro') borderColor = '#4285F4'; // Blue for pro
                 if (model.tier === 'elite') borderColor = '#d97757'; // Orange for elite
                 if (model.provider === 'openai') borderColor = '#10a37f'; // OpenAI Green override

                 return (
                  <TouchableOpacity
                    key={model.id}
                    style={[styles.modelBubble, { borderColor, backgroundColor: isActive ? borderColor : 'rgba(0,0,0,0.5)' }]}
                    onPress={() => toggleActiveModel(model.id)}
                  >
                     <Text style={[styles.modelBubbleText, { color: isActive ? '#000' : '#fff' }]}>
                       {model.name.substring(0, 6).toUpperCase()}
                     </Text>
                  </TouchableOpacity>
                 );
              })}
           </ScrollView>
        </View>

        {/* Collide / Chat Stub */}
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.collideButton} onPress={() => setConsensusOpen(true)}>
              <Sparkles color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.collideText}>COLLIDE</Text>
           </TouchableOpacity>
           <View style={styles.inputMock}>
              <Text style={styles.inputTextMock}>Message Active Models...</Text>
           </View>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomSection: {
    paddingBottom: 20,
  },
  tabsContainer: {
    marginBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  modelTrayContainer: {
    marginBottom: 20,
  },
  modelTrayScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  modelBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelBubbleText: {
    fontWeight: '700',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  collideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.2)', // Orange tint
    borderWidth: 1,
    borderColor: 'orange',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  collideText: {
    color: 'orange',
    fontWeight: '800',
    letterSpacing: 1,
  },
  inputMock: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  inputTextMock: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
  }
});
