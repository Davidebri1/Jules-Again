import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAppStore, GridLayout, ModelCategory } from '../store/useAppStore';
import { Settings, User, Sparkles, Clock, Globe, Mic, Send } from 'lucide-react-native';

import { generateResponse } from '../utils/api';


export const GridOverlay: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    activeLayout, setActiveLayout,
    userProfile, deductCredits, refundCredits, setUpgradeOpen,
    addMessage, conversations,
    selectedTab, setSelectedTab,
    availableModels, activeModelIds, toggleActiveModel,
    setSettingsOpen, setConsensusOpen, setHistoryOpen, setMarketplaceOpen
  } = useAppStore();

  const handleLayoutChange = (layout: GridLayout) => setActiveLayout(layout);

  const categories: { id: ModelCategory, label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'image', label: 'Image' },
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'coding', label: 'Coding' },
  ];


  const handleSendGlobal = async () => {
     if (!inputText.trim() || isGenerating) return;
     if (activeModelIds.length === 0) {
        Alert.alert("No Models Selected", "Please select at least one model to message.");
        return;
     }

     // 1. Calculate Total Credit Cost
     const activeModels = activeModelIds.map(id => availableModels.find(m => m.id === id)).filter(m => m !== undefined);
     const totalCost = activeModels.reduce((sum, model) => {
        // Handle free tier overrides (Pro/Elite users get general models free)
        let cost = model.baseCreditCost;
        if (model.category === 'general' && userProfile.tier !== 'free') cost = 0;
        if (model.category === 'coding' && userProfile.tier === 'elite' && (model.id === 'qwen-coder' || model.id === 'deepseek-coder')) cost = 0;
        return sum + cost;
     }, 0);

     // 2. Validate Balance
     if (!deductCredits(totalCost)) {
         setUpgradeOpen(true);
         return;
     }

     const userMessage = inputText.trim();
     setInputText('');
     setIsGenerating(true);

     // 3. Dispatch in Parallel
     await Promise.allSettled(activeModels.map(async (model) => {
         // Save to store immediately
         addMessage(model.id, 'user', userMessage);

         const convo = conversations[model.id];
         const msgs = convo ? convo.messages : [];
         const apiMessages = [...msgs, { id: 'temp', role: 'user' as const, content: userMessage, timestamp: Date.now() }];

         try {
            const responseContent = await generateResponse(model, apiMessages);
            addMessage(model.id, 'assistant', responseContent);
         } catch (e) {
            // Refund cost of this specific model on failure
            let refundAmt = model.baseCreditCost;
            if (model.category === 'general' && userProfile.tier !== 'free') refundAmt = 0;
            refundCredits(refundAmt);
            addMessage(model.id, 'assistant', 'Network Error: Credits Refunded.');
         }
     }));

     setIsGenerating(false);
  };

  // Filter models based on the currently selected tab/category
  const displayedModels = useMemo(() => {
    return availableModels.filter(m => m.category === selectedTab);
  }, [availableModels, selectedTab]);

  return (
    <SafeAreaView style={styles.overlay} pointerEvents="box-none">

      {/* Top Bar: Brand, Layout, Profile */}
      <View style={styles.topBar}>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsOpen(true)}>
            <Settings color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryOpen(true)}>
            <Clock color="#fff" size={20} />
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity style={styles.iconButton} onPress={() => setMarketplaceOpen(true)}>
          <Globe color="#fff" size={20} />
        </TouchableOpacity>
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
              <TouchableOpacity style={styles.iconButtonSmall}><Sparkles color="rgba(255,255,255,0.7)" size={16} /></TouchableOpacity>
              <TextInput
                 style={styles.inputTextMock}
                 placeholder="Message Active Models..."
                 placeholderTextColor="rgba(255,255,255,0.4)"
                 value={inputText}
                 onChangeText={setInputText}
                 multiline
              />
              <View style={styles.inputRightActions}>
                {isGenerating ? (
                   <ActivityIndicator color="#fff" size="small" />
                ) : inputText.trim() ? (
                   <TouchableOpacity style={styles.iconButtonSmall} onPress={handleSendGlobal}>
                      <Send color="#fff" size={16} />
                   </TouchableOpacity>
                ) : (
                   <>
                     <TouchableOpacity style={styles.iconButtonSmall}><Globe color="rgba(255,255,255,0.7)" size={16} /></TouchableOpacity>
                     <TouchableOpacity style={styles.iconButtonSmall}><Settings color="rgba(255,255,255,0.7)" size={16} /></TouchableOpacity>
                     <TouchableOpacity style={styles.iconButtonSmall}><Mic color="rgba(255,255,255,0.7)" size={16} /></TouchableOpacity>
                   </>
                )}
              </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'space-between'
  },
  inputTextMock: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
    maxHeight: 100,
  },
  inputRightActions: {
    flexDirection: 'row',
    gap: 5,
  },
  iconButtonSmall: {
    padding: 5,
  }
});
