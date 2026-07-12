import React, { useMemo, useState } from "react";
import { Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore, GridLayout, ModelCategory } from "../store/useAppStore";
import {
  Settings,
  User,
  Sparkles,
  Clock,
  Globe,
  Mic,
  Send,
  Grid,
  X,
  EyeOff,
  Plus,
  Paperclip,
  Search,
  LayoutGrid,
} from "lucide-react-native";

import { generateResponse } from "../utils/api";

export const GridOverlay: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWebEnabled, setIsWebEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGridTrayOpen, setIsGridTrayOpen] = useState(false);
  const {
    activeLayout,
    setActiveLayout,
    userProfile,
    deductCredits,
    deductMessage,
    setUpgradeOpen,
    addMessage,
    conversations,
    pendingContextFiles,
    pendingSourceFile,
    removeContextFile,
    setSourceFile,
    setAuthOpen,
    isPrivateMode,
    setPrivateMode,
    archiveConversation,
    setFileManagerOpen,
    selectedTab,
    setSelectedTab,
    availableModels,
    activeModelIdsByCategory,
    toggleActiveModel,
    setSettingsOpen,
    setConsensusOpen,
    setHistoryOpen,
    setMarketplaceOpen,
  } = useAppStore();

  const activeModelIds = activeModelIdsByTab[selectedTab] || [];

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
    if ((activeModelIdsByCategory[selectedTab] || []).length === 0) {
      Alert.alert(
        "No Models Selected",
        "Please select at least one model to message.",
      );
      return;
    }

    // 1. Filter Active Models by Current Tab
    const activeModels = (activeModelIdsByCategory[selectedTab] || [])
      .map((id) => availableModels.find((m) => m.id === id))
      .filter((m): m is any => m !== undefined);

    if (selectedTab === "general") {
      if (!deductMessage()) {
        Alert.alert("Limit Reached", "Free users get 10 messages/day. Upgrade for more.");
        setUpgradeOpen(true);
        return;
      }
    } else {
      const totalCost = activeModels.reduce((sum, m) => sum + m.baseCreditCost, 0);
      if (!deductCredits(totalCost)) {
        Alert.alert("Insufficient Credits", "You need credits for this tab.");
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
        addMessage(model.id, "assistant", res);
      })
    );

    setIsGenerating(false);
  };

  const displayedModels = useMemo(() => {
    return availableModels.filter((m) => m.category === selectedTab);
  }, [availableModels, selectedTab]);

  return (
    <SafeAreaView style={styles.overlay} pointerEvents="box-none">
      {/* Top Bar - OPAQUE */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsOpen(true)}>
            <Settings color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setHistoryOpen(true)}>
            <Clock color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsGridTrayOpen(!isGridTrayOpen)}
          >
            <Grid color={isGridTrayOpen ? "#4285F4" : "#fff"} size={20} />
          </TouchableOpacity>
          {isGridTrayOpen && (
            <View style={[styles.gridSelector, { marginLeft: 8 }]}>
              {(["1x1", "2x2", "3x3"] as GridLayout[]).map((layout, i) => (
                <TouchableOpacity
                  key={layout}
                  style={[
                    styles.gridButton,
                    activeLayout === layout && styles.gridButtonActive,
                  ]}
                  onPress={() => {
                      handleLayoutChange(layout);
                      setIsGridTrayOpen(false);
                  }}
                >
                  <Text style={styles.gridButtonText}>
                    {i === 0 ? "1" : i === 1 ? "2" : "3"}
                  </Text>
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
        {/* Category Tabs */}
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

        {/* Model Tray - One Row, Scrollable, Opaque */}
        <View style={styles.modelTrayContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modelTrayScroll}>
            {displayedModels.map((model) => {
              const isActive = (activeModelIdsByCategory[selectedTab] || []).includes(model.id);
              let borderColor = "rgba(255,255,255,0.3)";
              if (model.tier === "pro") borderColor = "#4285F4"; // Blue for pro
              if (model.tier === "elite") borderColor = "#d97757"; // Orange for elite
              if (model.provider === "openai") borderColor = "#10a37f"; // OpenAI Green override

              return (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.modelBubble, { borderColor: color, backgroundColor: isActive ? color : "#1a1a1c" }]}
                  onPress={() => toggleActiveModel(model.id)}
                >
                  <View style={[styles.toggleLight, { backgroundColor: isActive ? "#fff" : "#444" }]} />
                  <Text style={[styles.modelBubbleText, { color: isActive ? "#000" : "#fff" }]}>
                    {model.name.substring(0, 6).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.collideButton} onPress={() => setConsensusOpen(true)}>
              <Sparkles color="orange" size={20} />
           </TouchableOpacity>

          {(pendingContextFiles.length > 0 || pendingSourceFile) && (
            <ScrollView
              horizontal
              style={styles.holdingArea}
              showsHorizontalScrollIndicator={false}
            >
              {pendingSourceFile && (
                <View style={styles.attachmentPillSource}>
                  <Text style={styles.attachmentPillTextSource}>
                    Source: {pendingSourceFile.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSourceFile(null)}>
                    <X color="#4285F4" size={14} />
                  </TouchableOpacity>
                </View>
              )}
              {pendingContextFiles.map((f) => (
                <View key={f.id} style={styles.attachmentPill}>
                  <Text style={styles.attachmentPillText}>{f.name}</Text>
                  <TouchableOpacity onPress={() => removeContextFile(f.id)}>
                    <X color="#fff" size={14} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <View
            style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}
          >
            <TouchableOpacity
              style={styles.newConvoBtn}
              onPress={() =>
                (activeModelIdsByCategory[selectedTab] || []).forEach((id) => archiveConversation(id))
              }
            >
              <Plus color="#000" size={20} />
            </TouchableOpacity>

            <LinearGradient
              colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
              style={[
                styles.inputMock,
                isPrivateMode && { borderColor: "rgba(255, 69, 58, 0.4)" },
              ]}
            >
              <TouchableOpacity
                style={styles.iconButtonSmall}
                onPress={() => setFileManagerOpen(true)}
              >
                <Paperclip color="rgba(255,255,255,0.7)" size={16} />
              </TouchableOpacity>
              <TextInput
                 style={styles.input}
                 placeholder={isPrivateMode ? "Private Message..." : "Message Models..."}
                 placeholderTextColor="#636366"
                 value={inputText}
                 onChangeText={setInputText}
                 multiline
              />
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
  modelBubbleText: { fontWeight: "bold", fontSize: 12 },
  actionRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  collideButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#33261a", borderWidth: 1, borderColor: "orange", justifyContent: "center", alignItems: "center" },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: "#1c1c1e", borderRadius: 25, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, color: "#fff", marginLeft: 10, fontSize: 15 },
  sendButton: { backgroundColor: "#fff", width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" }
});
