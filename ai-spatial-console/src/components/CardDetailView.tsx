import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import Markdown from "react-native-markdown-display";
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import { useAppStore } from "../store/useAppStore";
import { ChevronLeft, MoreHorizontal, Mic, Paperclip, Send, Globe, Zap, Terminal, LayoutTemplate, Search } from "lucide-react-native";
import { generateResponse } from "../utils/api";
import { processSmartGen } from '../utils/smartGen';

export const CardDetailView: React.FC = () => {
  const { focusedModelId, setFocusedModelId, availableModels, conversations, addMessage, deductMessage, deductCredits, setUpgradeOpen, selectedTab } = useAppStore();
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [isWebEnabled, setIsWebEnabled] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const model = useMemo(() => availableModels.find((m) => m.id === focusedModelId), [focusedModelId, availableModels]);
  const conversation = useMemo(() => focusedModelId ? conversations[focusedModelId] : null, [focusedModelId, conversations]);
  const messages = conversation?.messages || [];

  if (!model) return null;

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
    const uri = recording.getURI();
    Alert.alert("Voice Captured", "Transcribing spatial intent...");
    // In production, send 'uri' to OpenAI Whisper or Google Speech-to-Text
    setInputText("Spatial transition to neon dusk...");
  }

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    const fullPrompt = isWebEnabled ? `[WEB SEARCH ENABLED] ${inputText}` : inputText;

    if (selectedTab === "general") {
       if (!deductMessage()) { setUpgradeOpen(true); return; }
    } else {
       if (!deductCredits(model.baseCreditCost)) { setUpgradeOpen(true); return; }
    }

    let userMsg = inputText.trim();
    setInputText("");
    addMessage(model.id, "user", fullPrompt);
    setIsGenerating(true);

    try {
      const res = await generateResponse(model, [...messages, { role: 'user', content: fullPrompt, id: 'new', timestamp: Date.now() }]);
      const msgId = addMessage(model.id, "assistant", res);
      processSmartGen(model.id, msgId, res);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const handleActionMenu = (msgContent: string) => {
     Alert.alert("Message Actions", "Select an operation.", [
        { text: "Copy Text", onPress: () => Clipboard.setStringAsync(msgContent) },
        { text: "Export (.txt)", onPress: async () => {
            const fileUri = FileSystem.cacheDirectory + 'spatial_export.txt';
            await FileSystem.writeAsStringAsync(fileUri, msgContent);
            await Sharing.shareAsync(fileUri);
        }},
        { text: "Cancel", style: "cancel" }
     ]);
  };

  const showSpecialSuite = () => {
     if (model.provider === 'openai' && selectedTab === 'coding') return <View style={styles.suitePill}><Terminal color="#10a37f" size={14} /><Text style={styles.suiteText}>Python Sandbox Enabled</Text></View>;
     if (model.provider === 'anthropic' && selectedTab === 'coding') return <View style={styles.suitePill}><LayoutTemplate color="#d97757" size={14} /><Text style={styles.suiteText}>Claude Canvas Active</Text></View>;
     if (model.provider === 'xai') return <View style={styles.suitePill}><Search color="#fff" size={14} /><Text style={styles.suiteText}>Real-time X Search</Text></View>;
     return null;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setFocusedModelId(null)} style={styles.iconButton}><ChevronLeft color="#fff" size={24} /></TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{model.name}</Text>
            {showSpecialSuite()}
          </View>
          <TouchableOpacity style={styles.iconButton}><MoreHorizontal color="#fff" size={24} /></TouchableOpacity>
        </View>

        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
           {messages.map((msg, idx) => (
              <TouchableOpacity key={msg.id || idx} onLongPress={() => handleActionMenu(msg.content)} delayLongPress={500}>
                 <View style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
                    <View style={[styles.messageBubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                       {msg.role === 'assistant' ? <Markdown style={markdownStyles}>{msg.content}</Markdown> : <Text style={styles.userText}>{msg.content}</Text>}
                    </View>
                 </View>
              </TouchableOpacity>
           ))}
           {isGenerating && <ActivityIndicator color="#fff" size="small" style={{marginTop: 10}} />}
        </ScrollView>

        <View style={styles.inputArea}>
           <View style={styles.optionsRow}>
              <TouchableOpacity style={[styles.optionPill, isDeepResearch && styles.activePill]} onPress={() => setIsDeepResearch(!isDeepResearch)}>
                 <Zap color={isDeepResearch ? "#4285F4" : "#fff"} size={14} /><Text style={[styles.optionText, isDeepResearch && styles.activeText]}>Research</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionPill, isWebEnabled && styles.activePill]} onPress={() => setIsWebEnabled(!isWebEnabled)}>
                 <Globe color={isWebEnabled ? "#4285F4" : "#fff"} size={14} /><Text style={[styles.optionText, isWebEnabled && styles.activeText]}>Web</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionPill, recording && { borderColor: 'red' }]} onPress={recording ? stopRecording : startRecording}>
                 <Mic color={recording ? "red" : "#fff"} size={14} /><Text style={[styles.optionText, recording && { color: 'red' }]}>{recording ? 'Recording' : 'Voice'}</Text>
              </TouchableOpacity>
           </View>

           <View style={styles.inputBox}>
              <TouchableOpacity style={styles.actionButton}><Paperclip color="#8e8e93" size={20} /></TouchableOpacity>
              <TextInput style={styles.input} placeholder="Message..." placeholderTextColor="#636366" value={inputText} onChangeText={setInputText} multiline />
              <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={handleSend}><Send color="#000" size={18} /></TouchableOpacity>
           </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0c" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, borderBottomWidth: 1, borderBottomColor: "#1c1c1e" },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1c1c1e", justifyContent: "center", alignItems: "center" },
  titleContainer: { alignItems: "center" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  suitePill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, backgroundColor: '#1c1c1e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  suiteText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, gap: 20 },
  messageWrapper: { flexDirection: "row", width: "100%", marginBottom: 15 },
  messageUser: { justifyContent: "flex-end" },
  messageAssistant: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "85%", padding: 15, borderRadius: 20 },
  bubbleUser: { backgroundColor: "#1c1c1e", borderBottomRightRadius: 5 },
  bubbleAssistant: { backgroundColor: "#000", borderWidth: 1, borderColor: "#1c1c1e", borderBottomLeftRadius: 5 },
  userText: { color: "#fff", fontSize: 16 },
  inputArea: { padding: 15, paddingBottom: 30, backgroundColor: '#0a0a0c', borderTopWidth: 1, borderTopColor: '#1c1c1e' },
  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  optionPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#1c1c1e", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  optionText: { color: "#fff", fontSize: 12 },
  activePill: { backgroundColor: "#1a2633", borderColor: "#4285F4", borderWidth: 1 },
  activeText: { color: "#4285F4" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#1c1c1e", borderRadius: 30, paddingHorizontal: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16, marginLeft: 10, maxHeight: 100, minHeight: 40 },
  actionButton: { padding: 10 },
  sendButton: { backgroundColor: "#fff", borderRadius: 20, marginLeft: 5 }
});

const markdownStyles = StyleSheet.create({
  body: { color: "#fff", fontSize: 16 },
  code_inline: { backgroundColor: "#1c1c1e", color: "#4285F4" },
  code_block: { backgroundColor: "#000", padding: 10, borderRadius: 8, color: "#4285F4" }
});
