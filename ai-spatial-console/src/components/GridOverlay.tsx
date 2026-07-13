import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Audio } from 'expo-av';
import {
  ModelCategory,
  useAppStore,
  GridLayout,
  abbreviateName
} from "../store/useAppStore";
import {
  Settings,
  Clock,
  User,
  Globe,
  Sparkles,
  Send,
  Paperclip,
  Search,
  LayoutGrid,
  Mic
} from "lucide-react-native";

import { generateResponse } from "../utils/api";
import { processSmartGen } from '../utils/smartGen';

export const GridOverlay: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLayoutTrayOpen, setIsLayoutTrayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const {
    activeLayout,
    setActiveLayout,
    deductCredits,
    deductMessage,
    setUpgradeOpen,
    addMessage,
    conversations,
    setFileManagerOpen,
    selectedTab,
    setSelectedTab,
    availableModels,
    activeModelIdsByTab,
    toggleActiveModel,
    setSettingsOpen,
    setConsensusOpen,
    setHistoryOpen,
    setMarketplaceOpen,
    setAuthOpen,
    isPrivateMode
  } = useAppStore();

  const activeModelIds = activeModelIdsByTab[selectedTab] || [];

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required for voice commands.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setRecording(null);
    await recording.stopAndUnloadAsync();
    Alert.alert("Voice Captured", "Transcribing spatial intent...");
    setInputText("Spatial transition to neon dusk...");
  }

  const handleLayoutChange = (layout: GridLayout) => {
    setActiveLayout(layout);
    setIsLayoutTrayOpen(false);
  };

  const categories: { id: ModelCategory; label: string }[] = [
    { id: "general", label: "General" },
    { id: "image", label: "Image" },
    { id: "video", label: "Video" },
    { id: "music", label: "Music" },
    { id: "coding", label: "Coding" },
  ];

  const handleSendGlobal = async () => {
    if (!inputText.trim() || isGenerating) return;
    if (activeModelIds.length === 0) {
      Alert.alert("No Models Selected", "Select at least one model.");
      return;
    }

    const activeModels = activeModelIds
      .map((id) => availableModels.find((m) => m.id === id))
      .filter((m): m is any => m !== undefined);

    if (selectedTab === "general") {
      if (!deductMessage()) {
        setUpgradeOpen(true);
        return;
      }
    } else {
      const totalCost = activeModels.reduce((sum, m) => sum + m.baseCreditCost, 0);
      if (!deductCredits(totalCost)) {
        setUpgradeOpen(true);
        return;
      }
    }

    let userMessage = inputText.trim();
    setInputText("");
    const fullMessage = userMessage;
    setIsGenerating(true);

    await Promise.all(
      activeModels.map(async (model) => {
        addMessage(model.id, "user", fullMessage);
        const history = conversations[model.id]?.messages || [];
        const res = await generateResponse(model, [...history, { role: 'user', content: fullMessage, id: 'new', timestamp: Date.now() }]);
        const msgId = addMessage(model.id, "assistant", res);
        processSmartGen(model.id, msgId, res);
      })
    );

    setIsGenerating(false);
  };

  const displayedModels = useMemo(() => {
    return availableModels.filter((m) =>
       m.category === selectedTab &&
       m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableModels, selectedTab, searchQuery]);

  return (
    <SafeAreaView style={styles.overlay} pointerEvents="box-none">
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsOpen(true)}>
            <Settings color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryOpen(true)}>
            <Clock color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsLayoutTrayOpen(!isLayoutTrayOpen)}>
             <LayoutGrid color="#fff" size={20} />
          </TouchableOpacity>
          {isLayoutTrayOpen && (
             <View style={styles.layoutTray}>
                {["1x1", "2x2", "3x3"].map((l) => (
                   <TouchableOpacity key={l} style={[styles.trayItem, activeLayout === l && styles.trayItemActive]} onPress={() => handleLayoutChange(l as any)}>
                      <Text style={styles.trayText}>{l}</Text>
                   </TouchableOpacity>
                ))}
             </View>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setMarketplaceOpen(true)}>
            <Globe color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setAuthOpen(true)}>
            <User color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.searchContainer}>
           <Search color="#636366" size={16} />
           <TextInput
              style={styles.searchInput}
              placeholder="Search Models..."
              placeholderTextColor="#636366"
              value={searchQuery}
              onChangeText={setSearchQuery}
           />
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tabButton, selectedTab === cat.id && styles.tabButtonActive]}
                onPress={() => setSelectedTab(cat.id)}
              >
                <Text style={[styles.tabText, selectedTab === cat.id && styles.tabTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.modelTrayContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modelTrayScroll}>
            {displayedModels.map((model) => {
              const isActive = activeModelIds.includes(model.id);
              let color = "#4285F4";
              if (model.tier === "elite") color = "#d97757";
              if (model.tier === "free") color = "#10a37f";

              return (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.modelBubble, { borderColor: color, backgroundColor: isActive ? color : "#1a1a1c" }]}
                  onPress={() => toggleActiveModel(model.id)}
                >
                  <View style={[styles.toggleLight, { backgroundColor: isActive ? "#fff" : "#444" }]} />
                  <Text style={[styles.modelBubbleText, { color: isActive ? "#000" : "#fff" }]}>
                    {abbreviateName(model.name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.collideButton} onPress={() => setConsensusOpen(true)}>
              <Sparkles color="orange" size={20} />
           </TouchableOpacity>

           <View style={styles.inputContainer}>
              <TouchableOpacity onPress={() => setFileManagerOpen(true)}>
                 <Paperclip color="#8e8e93" size={20} />
              </TouchableOpacity>
              <TextInput
                 style={styles.input}
                 placeholder={isPrivateMode ? "Private Message..." : "Message Models..."}
                 placeholderTextColor="#636366"
                 value={inputText}
                 onChangeText={setInputText}
                 multiline
              />
              <TouchableOpacity onPress={recording ? stopRecording : startRecording} style={{ marginRight: 10 }}>
                 <Mic color={recording ? "red" : "#8e8e93"} size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendGlobal} style={styles.sendButton}>
                 <Send color="#000" size={18} />
              </TouchableOpacity>
           </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "space-between" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#0a0a0c", borderBottomWidth: 1, borderBottomColor: "#1c1c1e" },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1c1c1e", justifyContent: "center", alignItems: "center" },
  layoutTray: { position: 'absolute', top: 50, backgroundColor: '#1c1c1e', borderRadius: 12, padding: 5, flexDirection: 'row', gap: 5, zIndex: 1000, borderWidth: 1, borderColor: '#3a3a3c' },
  trayItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  trayItemActive: { backgroundColor: '#4285F4' },
  trayText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  bottomSection: { backgroundColor: "#0a0a0c", paddingBottom: 30, borderTopWidth: 1, borderTopColor: "#1c1c1e" },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', marginHorizontal: 20, marginTop: 10, paddingHorizontal: 15, borderRadius: 12, height: 36 },
  searchInput: { flex: 1, color: '#fff', fontSize: 13, marginLeft: 10 },
  tabsContainer: { paddingVertical: 10 },
  tabsScroll: { paddingHorizontal: 20, gap: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#1c1c1e" },
  tabButtonActive: { backgroundColor: "#4285F4" },
  tabText: { color: "#8e8e93", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  modelTrayContainer: { marginBottom: 15 },
  modelTrayScroll: { paddingHorizontal: 20, gap: 12 },
  modelBubble: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  toggleLight: { width: 6, height: 6, borderRadius: 3 },
  modelBubbleText: { fontWeight: "bold", fontSize: 10 },
  actionRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  collideButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#33261a", borderWidth: 1, borderColor: "orange", justifyContent: "center", alignItems: "center" },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: "#1c1c1e", borderRadius: 25, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, color: "#fff", marginLeft: 10, fontSize: 15 },
  sendButton: { backgroundColor: "#fff", width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" }
});
