import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import { useAppStore, GridLayout, ModelCategory } from "../store/useAppStore";
import {
  Settings,
  User,
  Sparkles,
  Clock,
  Globe,
  Mic,
  Send,
  X,
  EyeOff,
  Plus,
  Paperclip,
  Search,
} from "lucide-react-native";

import { generateResponse } from "../utils/api";

export const GridOverlay: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWebEnabled, setIsWebEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const {
    activeLayout,
    setActiveLayout,
    userProfile,
    deductCredits,
    refundCredits,
    deductMessage,
    setUpgradeOpen,
    addMessage,
    conversations,
    pendingContextFiles,
    pendingSourceFile,
    removeContextFile,
    setSourceFile,
    clearPendingAttachments,
    setAuthOpen,
    isPrivateMode,
    setPrivateMode,
    archiveConversation,
    setFileManagerOpen,
    selectedTab,
    setSelectedTab,
    availableModels,
    activeModelIds,
    toggleActiveModel,
    setSettingsOpen,
    setConsensusOpen,
    setHistoryOpen,
    setMarketplaceOpen,
  } = useAppStore();

  const handleLayoutChange = (layout: GridLayout) => setActiveLayout(layout);

  const categories: { id: ModelCategory; label: string }[] = [
    { id: "general", label: "General" },
    { id: "image", label: "Image" },
    { id: "video", label: "Video" },
    { id: "audio", label: "Audio" },
    { id: "coding", label: "Coding" },
  ];

  const handleSendGlobal = async () => {
    if (!inputText.trim() || isGenerating) return;
    if (activeModelIds.length === 0) {
      Alert.alert(
        "No Models Selected",
        "Please select at least one model to message.",
      );
      return;
    }

    // 1. Filter Active Models by Current Tab
    const activeModels = activeModelIds
      .map((id) => availableModels.find((m) => m.id === id))
      .filter(
        (m): m is import("../store/useAppStore").ModelProvider =>
          m !== undefined && m.category === selectedTab,
      );

    if (activeModels.length === 0) {
      Alert.alert(
        "No Models Selected",
        "Please select at least one model in this tab to message.",
      );
      return;
    }

    // 2. Validate Balance & Message Limits based on Tab
    if (selectedTab === "general") {
      // General tab uses Message Limits
      if (userProfile.tier === "free" && !deductMessage()) {
        Alert.alert(
          "Message Limit Reached",
          "Please upgrade to Pro or Elite for unlimited general messaging.",
        );
        setUpgradeOpen(true);
        return;
      }
      // Pro/Elite have unlimited general messaging
    } else {
      // Media tabs use Credits
      const totalCost = activeModels.reduce(
        (sum, model) => sum + model.baseCreditCost,
        0,
      );
      if (!deductCredits(totalCost)) {
        Alert.alert(
          "Insufficient Credits",
          "You do not have enough credits to generate this.",
        );
        setUpgradeOpen(true);
        return;
      }
    }

    const userMessage = inputText.trim();
    setInputText("");
    setIsGenerating(true);
    clearPendingAttachments();

    // 3. Dispatch in Parallel
    await Promise.allSettled(
      activeModels.map(async (model) => {
        // Save to store immediately
        addMessage(model.id, "user", userMessage);

        const convo = conversations[model.id];
        const msgs = convo ? convo.messages : [];
        const apiMessages = [
          ...msgs,
          {
            id: "temp",
            role: "user" as const,
            content: userMessage,
            timestamp: Date.now(),
          },
        ];

        try {
          const responseContent = await generateResponse(model, apiMessages);
          addMessage(model.id, "assistant", responseContent);
        } catch (e) {
          // Refund cost of this specific model on failure
          let refundAmt = model.baseCreditCost;
          if (model.category === "general" && userProfile.tier !== "free")
            refundAmt = 0;
          refundCredits(refundAmt);
          addMessage(model.id, "assistant", "Network Error: Credits Refunded.");
        }
      }),
    );

    setIsGenerating(false);
  };

  // Filter models based on the currently selected tab/category
  const displayedModels = useMemo(() => {
    return availableModels.filter((m) => m.category === selectedTab);
  }, [availableModels, selectedTab]);

  return (
    <SafeAreaView style={styles.overlay} pointerEvents="box-none">
      {/* Top Bar: Brand, Layout, Profile */}
      <BlurView intensity={20} tint="dark" style={styles.topBar}>
        {/* Specular edge light */}
        <View style={styles.specularTopEdge} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search color={isSearchOpen ? "#4285F4" : "#fff"} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setHistoryOpen(true)}
          >
            <Clock color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.gridSelector}>
          {(["1x1", "2x2", "3x3"] as GridLayout[]).map((layout, i) => (
            <TouchableOpacity
              key={layout}
              style={[
                styles.gridButton,
                activeLayout === layout && styles.gridButtonActive,
              ]}
              onPress={() => handleLayoutChange(layout)}
            >
              <Text style={styles.gridButtonText}>
                {i === 0 ? "1x1" : i === 1 ? "2x2" : "3x3"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setMarketplaceOpen(true)}
        >
          <Globe color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setAuthOpen(true)}
        >
          <User color="#fff" size={20} />
        </TouchableOpacity>
      </BlurView>

      {isSearchOpen && (
        <View style={styles.searchContainer}>
          <Search color="rgba(255,255,255,0.4)" size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations, files, memories..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X color="rgba(255,255,255,0.4)" size={16} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tabs and Model Selector Tray */}
      <BlurView intensity={30} tint="dark" style={styles.bottomSection}>
        {/* Specular edge light */}
        <View style={styles.specularTopEdge} />
        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.tabButton,
                  selectedTab === cat.id && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab(cat.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === cat.id && styles.tabTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Model Selector Tray (Dynamic based on selected tab) */}
        {selectedTab !== "general" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              style={styles.marketPill}
              onPress={() => {
                useAppStore.getState().setMarketCategory(selectedTab);
                setMarketplaceOpen(true);
              }}
            >
              <Globe color="#fff" size={12} />
              <Text style={styles.marketPillText}>
                Browse{" "}
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}{" "}
                Market
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.modelTrayContainer}>
          <View style={styles.modelTrayScroll}>
            {displayedModels.map((model) => {
              const isActive = activeModelIds.includes(model.id);
              let borderColor = "rgba(255,255,255,0.3)";
              if (model.tier === "pro") borderColor = "#4285F4"; // Blue for pro
              if (model.tier === "elite") borderColor = "#d97757"; // Orange for elite
              if (model.provider === "openai") borderColor = "#10a37f"; // OpenAI Green override

              return (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelBubble,
                    {
                      borderColor,
                      backgroundColor: isActive
                        ? borderColor
                        : "rgba(0,0,0,0.5)",
                    },
                  ]}
                  onPress={() => toggleActiveModel(model.id)}
                >
                  <Text
                    style={[
                      styles.modelBubbleText,
                      { color: isActive ? "#000" : "#fff" },
                    ]}
                  >
                    {model.name.substring(0, 6).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Collide / Chat Stub */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.collideButton}
            onPress={() => setConsensusOpen(true)}
          >
            <Sparkles color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.collideText}>COLLIDE</Text>
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
                activeModelIds.forEach((id) => archiveConversation(id))
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
                style={styles.inputTextMock}
                placeholder={
                  isPrivateMode
                    ? "Private Message..."
                    : "Message Active Models..."
                }
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <View style={styles.inputRightActions}>
                {isGenerating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : inputText.trim() ? (
                  <TouchableOpacity
                    style={styles.iconButtonSmall}
                    onPress={handleSendGlobal}
                  >
                    <Send color="#fff" size={16} />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.iconButtonSmall}
                      onPress={() => setIsWebEnabled(!isWebEnabled)}
                    >
                      <Globe
                        color={
                          isWebEnabled ? "#10a37f" : "rgba(255,255,255,0.7)"
                        }
                        size={16}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButtonSmall}
                      onPress={() => setPrivateMode(!isPrivateMode)}
                    >
                      <EyeOff
                        color={
                          isPrivateMode ? "#ff453a" : "rgba(255,255,255,0.7)"
                        }
                        size={16}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.iconButtonSmall,
                        isRecording && {
                          backgroundColor: "rgba(255, 69, 58, 0.2)",
                          borderRadius: 12,
                        },
                      ]}
                      onPress={() => setIsRecording(!isRecording)}
                    >
                      <Mic
                        color={
                          isRecording ? "#ff453a" : "rgba(255,255,255,0.7)"
                        }
                        size={16}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  specularTopEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)", // Darker base for inner bevel
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)", // Specular top edge
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.5)", // Shadowed bottom edge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 14,
  },
  gridSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 4,
  },
  gridButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  gridButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  gridButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  tabButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#fff",
  },
  marketPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(66, 133, 244, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  marketPillText: {
    color: "#4285F4",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modelTrayContainer: {
    marginBottom: 20,
  },
  modelTrayScroll: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  modelBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelBubbleText: {
    fontWeight: "700",
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  collideButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 165, 0, 0.2)", // Orange tint
    borderWidth: 1,
    borderColor: "orange",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  collideText: {
    color: "orange",
    fontWeight: "800",
    letterSpacing: 1,
  },

  holdingArea: {
    flexDirection: "row",
    marginBottom: 8,
    paddingHorizontal: 20,
    maxHeight: 40,
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 4,
  },
  attachmentPillText: {
    color: "#fff",
    fontSize: 10,
  },
  attachmentPillSource: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(66, 133, 244, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#4285F4",
    gap: 4,
  },
  attachmentPillTextSource: {
    color: "#4285F4",
    fontSize: 10,
    fontWeight: "700",
  },

  newConvoBtn: {
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // align with inputMock
  },
  inputMock: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "space-between",
  },
  inputTextMock: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
    maxHeight: 100,
  },
  inputRightActions: {
    flexDirection: "row",
    gap: 5,
  },
  iconButtonSmall: {
    padding: 5,
  },
});
