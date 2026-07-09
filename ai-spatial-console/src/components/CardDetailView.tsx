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
  const [searchQuery, setSearchQuery] = useState("");

  const model = availableModels.find((m) => m.id === focusedModelId);
  const conversation = conversationId ? conversations[focusedModelId] : null;
  const messages = conversation?.messages || [];

  if (!model) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    // 1. Calculate Cost
    let cost = model.baseCreditCost;
    if (model.category === "general" && userProfile.tier !== "free") cost = 0;

    // 2. Validate Balance
    if (model.category === "general") {
      if (!deductMessage()) {
        Alert.alert(
          "Message Limit Reached",
          "Please upgrade to Pro or Elite for unlimited general messaging.",
        );
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

    // --- Inject Context ---
    let injectedPrefix = "";
    if (isDeepResearch) injectedPrefix += "[Deep Research Enabled] ";
    else if (isWebEnabled) injectedPrefix += "[Web Search Enabled] ";

    if (isPrivateMode) injectedPrefix += "[Private/Incognito Session] ";

    if (pendingContextFiles.length > 0) {
       injectedPrefix += `[Context Files: ${pendingContextFiles.map(f => f.name).join(', ')}] `;
    }
    if (pendingSourceFile) {
       injectedPrefix += `[Source Context: ${pendingSourceFile.name}] `;
    }

    const fullMessage = injectedPrefix ? `${injectedPrefix}\n\n${userMessage}` : userMessage;

    addMessage(model.id, "user", fullMessage);

    // --- NATIVE LOGICAL FRAMEWORK ENGINE ---
    if (isSmartGenEnabled && !isPrivateMode && userMessage.length > 10) {
      const frameworkModel = availableModels.find((m) => m.id === "llama-3-8b");
      if (frameworkModel) {
        const systemPrompt = `LOGICAL FRAMEWORK DIRECTIVE:
You are the Cognitive Filter Engine. Your purpose is absolute service to Natural Law and Objective Logic.
1. CONTEXT PRUNING: Microscopic window (8KB max). Discard subjective/trivial as "NOISE".
2. PATTERN EXTRACTION: Rolling 3-word clusters. foundational meaning.
3. TIERED ESCALATION: Natural Law -> Absolute Logic -> Context Logic.
Extract meaning: {"type": "memory" | "task" | "reminder", "desc": "..."}.
Otherwise return 'NOISE'.`;

        generateResponse(frameworkModel, [
           { role: 'system', content: systemPrompt, id: 'sys', timestamp: Date.now() },
           { role: 'user', content: userMessage, id: 'usr', timestamp: Date.now() }
        ]).then(res => {
           if (res && res.includes('{')) {
              try {
                 const parsed = JSON.parse(res.substring(res.indexOf('{'), res.lastIndexOf('}') + 1));
                 // Logic to update message with smart event would go here
              } catch(e) {}
           }
        });
      }
    }

    setIsGenerating(true);
    try {
      const response = await generateResponse(model, [...messages, { role: 'user', content: fullMessage, id: 'new', timestamp: Date.now() }]);
      addMessage(model.id, "assistant", response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (content: string) => {
    try {
      await Share.share({ message: content });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async (content: string, fileName: string) => {
     const fileUri = FileSystem.documentDirectory + fileName;
     await FileSystem.writeAsStringAsync(fileUri, content);
     if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
           await MediaLibrary.createAssetAsync(fileUri);
           Alert.alert("Success", "File saved to gallery.");
        }
     } else {
        Alert.alert("Success", "File saved to internal storage.");
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
            <TouchableOpacity
              onPress={() => setFocusedModelId(null)}
              style={styles.iconButton}
            >
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{model.name}</Text>
              <Text style={styles.subtitle}>{model.provider.toUpperCase()} • {model.tier.toUpperCase()}</Text>
            </View>

            <View style={styles.headerRight}>
               <TouchableOpacity style={styles.iconButton}>
                  <MoreHorizontal color="#fff" size={24} />
               </TouchableOpacity>
            </View>
          </View>

          {/* Chat Area */}
          <ScrollView
             style={styles.chatArea}
             contentContainerStyle={styles.chatContent}
             showsVerticalScrollIndicator={false}
          >
             {messages.length === 0 && (
                <View style={{alignItems: 'center', marginTop: 100, opacity: 0.5}}>
                   <Sparkles color="#fff" size={48} />
                   <Text style={{color: '#fff', marginTop: 10}}>Start a conversation with {model.name}</Text>
                </View>
             )}

             {messages.map((msg, idx) => (
                <View key={idx} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
                   <View style={[styles.messageBubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                      {msg.role === 'assistant' && (
                         <Markdown style={markdownStyles}>{msg.content}</Markdown>
                      )}
                      {msg.role === 'user' && (
                         <Text style={styles.userText}>{msg.content}</Text>
                      )}

                      <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 15, opacity: 0.5}}>
                         <TouchableOpacity onPress={() => handleShare(msg.content)}>
                            <Share color="#fff" size={14} />
                         </TouchableOpacity>
                         <TouchableOpacity onPress={() => handleDownload(msg.content, `msg-${idx}.txt`)}>
                            <Plus color="#fff" size={14} />
                         </TouchableOpacity>
                      </View>
                   </View>
                </View>
             ))}

             {isGenerating && (
                <View style={styles.loadingWrapper}>
                   <ActivityIndicator color="#fff" size="small" />
                </View>
             )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
             <View style={styles.optionsRow}>
                <TouchableOpacity
                   style={[styles.optionPill, isDeepResearch && styles.paramPillActive]}
                   onPress={() => setIsDeepResearch(!isDeepResearch)}
                >
                   <Zap color={isDeepResearch ? "#4285F4" : "#fff"} size={14} />
                   <Text style={[styles.optionText, isDeepResearch && styles.paramTextActive]}>Deep Research</Text>
                </TouchableOpacity>
                <TouchableOpacity
                   style={[styles.optionPill, isWebEnabled && styles.paramPillActive]}
                   onPress={() => setIsWebEnabled(!isWebEnabled)}
                >
                   <Globe color={isWebEnabled ? "#4285F4" : "#fff"} size={14} />
                   <Text style={[styles.optionText, isWebEnabled && styles.paramTextActive]}>Web Search</Text>
                </TouchableOpacity>
             </View>

             <LinearGradient
                colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
                style={styles.inputBox}
             >
                <TouchableOpacity style={styles.actionButton} onPress={() => setFileManagerOpen(true)}>
                   <Paperclip color="rgba(255,255,255,0.7)" size={20} />
                </TouchableOpacity>

                <TextInput
                   style={styles.input}
                   placeholder={`Message ${model.name}...`}
                   placeholderTextColor="rgba(255,255,255,0.4)"
                   value={inputText}
                   onChangeText={setInputText}
                   multiline
                />

                {inputText.trim() ? (
                   <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={handleSend}>
                      <Send color="#000" size={18} />
                   </TouchableOpacity>
                ) : (
                   <TouchableOpacity
                      style={[styles.actionButton, isRecording && { backgroundColor: 'rgba(255, 69, 58, 0.2)', borderRadius: 20 }]}
                      onPress={() => setIsRecording(!isRecording)}
                   >
                      <Mic color={isRecording ? "#ff453a" : "rgba(255,255,255,0.7)"} size={20} />
                   </TouchableOpacity>
                )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerRight: { flexDirection: "row" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
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
  loadingWrapper: { padding: 10 },
  inputArea: { padding: 15, paddingBottom: 30 },
  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  optionPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  optionText: { color: "#fff", fontSize: 12 },
  paramPillActive: { backgroundColor: "rgba(66, 133, 244, 0.2)", borderColor: "#4285F4", borderWidth: 1 },
  paramTextActive: { color: "#4285F4" },
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
