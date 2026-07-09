import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";

let MediaLibrary: any;
if (Platform.OS !== 'web') {
  MediaLibrary = require('expo-media-library');
}

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import Markdown from "react-native-markdown-display";
import { useAppStore } from "../store/useAppStore";
import {
  ChevronLeft,
  MoreHorizontal,
  Mic,
  Paperclip,
  Send,
  Layers,
  Globe,
  Zap,
  Search,
  EyeOff,
  Sliders,
  X,
  Sparkles,
  Plus,
} from "lucide-react-native";
import { generateResponse } from "../utils/api";

export const CardDetailView: React.FC = () => {
  const {
    focusedModelId,
    setFocusedModelId,
    availableModels,
    conversations,
    addMessage,
    setSmartGenOpen,
    isSmartGenEnabled,
    isPrivateMode,
    setPrivateMode,
    setFileManagerOpen,
    pendingContextFiles,
    pendingSourceFile,
    setSourceFile,
    removeContextFile,
    userProfile,
    deductMessage,
    deductCredits,
    setUpgradeOpen,
  } = useAppStore();

  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [isWebEnabled, setIsWebEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const model = availableModels.find((m) => m.id === focusedModelId);
  const conversation = focusedModelId ? conversations[focusedModelId] : null;
  const messages = conversation?.messages || [];

  if (!model) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    let cost = model.baseCreditCost;
    if (model.category === "general" && userProfile.tier !== "free") cost = 0;

    if (model.category === "general") {
      if (!deductMessage()) {
        Alert.alert("Limit Reached", "Upgrade for unlimited messaging.");
        setUpgradeOpen(true);
        return;
      }
    } else {
      if (!deductCredits(cost)) {
        setUpgradeOpen(true);
        return;
      }
    }

    let userMessage = inputText.trim();
    setInputText("");

    let injectedPrefix = "";
    if (isDeepResearch) injectedPrefix += "[Deep Research] ";
    else if (isWebEnabled) injectedPrefix += "[Web Search] ";
    if (isPrivateMode) injectedPrefix += "[Private] ";

    const fullMessage = injectedPrefix ? `${injectedPrefix}\n\n${userMessage}` : userMessage;
    addMessage(model.id, "user", fullMessage);

    if (isSmartGenEnabled && !isPrivateMode && userMessage.length > 10) {
      const frameworkModel = availableModels.find((m) => m.id === "llama-3-8b");
      if (frameworkModel) {
        const sysPrompt = "LOGICAL FRAMEWORK: Extract meaning as JSON or return NOISE.";
        generateResponse(frameworkModel, [
           { role: 'system', content: sysPrompt, id: 'sys', timestamp: Date.now() },
           { role: 'user', content: userMessage, id: 'usr', timestamp: Date.now() }
        ]).catch(() => {});
      }
    }

    setIsGenerating(true);
    try {
      const response = await generateResponse(model, [...messages, { role: 'user', content: fullMessage, id: 'new', timestamp: Date.now() }]);
      addMessage(model.id, "assistant", response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setFocusedModelId(null)} style={styles.iconButton}>
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{model.name}</Text>
              <Text style={styles.subtitle}>{model.provider.toUpperCase()} • {model.tier.toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
               <MoreHorizontal color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
             {messages.length === 0 && (
                <View style={{alignItems: 'center', marginTop: 100, opacity: 0.5}}>
                   <Sparkles color="#fff" size={48} />
                   <Text style={{color: '#fff', marginTop: 10}}>Start a conversation</Text>
                </View>
             )}
             {messages.map((msg, idx) => (
                <View key={idx} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
                   <View style={[styles.messageBubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                      {msg.role === 'assistant' ? <Markdown style={markdownStyles}>{msg.content}</Markdown> : <Text style={styles.userText}>{msg.content}</Text>}
                   </View>
                </View>
             ))}
             {isGenerating && <ActivityIndicator color="#fff" size="small" style={{marginTop: 10}} />}
          </ScrollView>

          <View style={styles.inputArea}>
             <View style={styles.optionsRow}>
                <TouchableOpacity style={[styles.optionPill, isDeepResearch && styles.activePill]} onPress={() => setIsDeepResearch(!isDeepResearch)}>
                   <Zap color={isDeepResearch ? "#4285F4" : "#fff"} size={14} />
                   <Text style={[styles.optionText, isDeepResearch && styles.activeText]}>Research</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionPill, isWebEnabled && styles.activePill]} onPress={() => setIsWebEnabled(!isWebEnabled)}>
                   <Globe color={isWebEnabled ? "#4285F4" : "#fff"} size={14} />
                   <Text style={[styles.optionText, isWebEnabled && styles.activeText]}>Web</Text>
                </TouchableOpacity>
             </View>

             <LinearGradient colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]} style={styles.inputBox}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setFileManagerOpen(true)}>
                   <Paperclip color="rgba(255,255,255,0.7)" size={20} />
                </TouchableOpacity>
                <TextInput
                   style={styles.input}
                   placeholder="Message..."
                   placeholderTextColor="rgba(255,255,255,0.4)"
                   value={inputText}
                   onChangeText={setInputText}
                   multiline
                />
                <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={handleSend}>
                   <Send color="#000" size={18} />
                </TouchableOpacity>
             </LinearGradient>
          </View>
        </SafeAreaView>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  titleContainer: { alignItems: "center" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, gap: 20 },
  messageWrapper: { flexDirection: "row", width: "100%" },
  messageUser: { justifyContent: "flex-end" },
  messageAssistant: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "85%", padding: 15, borderRadius: 20 },
  bubbleUser: { backgroundColor: "rgba(255,255,255,0.15)", borderBottomRightRadius: 5 },
  bubbleAssistant: { backgroundColor: "rgba(0,0,0,0.6)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderBottomLeftRadius: 5 },
  userText: { color: "#fff", fontSize: 16 },
  inputArea: { padding: 15, paddingBottom: 30 },
  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  optionPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  optionText: { color: "#fff", fontSize: 12 },
  activePill: { backgroundColor: "rgba(66, 133, 244, 0.2)", borderColor: "#4285F4", borderWidth: 1 },
  activeText: { color: "#4285F4" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 30, paddingHorizontal: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16, marginLeft: 10, maxHeight: 100, minHeight: 40 },
  actionButton: { padding: 10 },
  sendButton: { backgroundColor: "#fff", borderRadius: 20, marginLeft: 5 }
});

const markdownStyles = StyleSheet.create({
  body: { color: "#fff", fontSize: 16 },
  code_inline: { backgroundColor: "rgba(255,255,255,0.1)", color: "#4285F4" },
  code_block: { backgroundColor: "#000", padding: 10, borderRadius: 8, color: "#4285F4" }
});
