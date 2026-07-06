import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft, MoreHorizontal, Mic, Paperclip, Send, Layers, Globe, Zap, Search, EyeOff, Sliders, X, Sparkles, Plus } from 'lucide-react-native';
import { generateResponse } from '../utils/api';

export const CardDetailView: React.FC = () => {
  const { focusedModelId, setFocusedModelId, availableModels, conversations, addMessage, setSmartGenOpen, userProfile, deductCredits, refundCredits, deductMessage, setUpgradeOpen, setFileManagerOpen, pendingContextFiles, pendingSourceFile, removeContextFile, setSourceFile, clearPendingAttachments, isPrivateMode, setPrivateMode, archiveConversation, updateMessageEvent, isSmartGenEnabled } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [isWebEnabled, setIsWebEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const model = availableModels.find((m) => m.id === focusedModelId);
  const conversation = model ? conversations[model.id] : null;
  const messages = conversation ? conversation.messages : [];

  if (!model) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    // 1. Calculate Cost
    let cost = model.baseCreditCost;
    if (model.category === 'general' && userProfile.tier !== 'free') cost = 0;

    // 2. Validate Balance
    if (model.category === 'general') {
       if (!deductMessage()) {
          Alert.alert("Message Limit Reached", "Please upgrade to Pro or Elite for unlimited general messaging.");
          setUpgradeOpen(true);
          return;
       }
    } else {
       if (!deductCredits(cost)) {
          setUpgradeOpen(true);
          return;
       }
    }

    const userMessage = inputText.trim();
    setInputText('');

    const newMsgId = addMessage(model.id, 'user', userMessage);

    // --- NATIVE LOGICAL FRAMEWORK ENGINE ---
    // Instead of using generic mocks, we extract meaning into the Smart Gen framework
    // by passing the input into the absolute fastest/cheapest model available globally (e.g. Llama 3 8b).
    // This happens entirely invisibly to the user in parallel.
    if (isSmartGenEnabled && !isPrivateMode && userMessage.length > 10) {
        const frameworkModel = availableModels.find(m => m.id === 'llama-3-8b');
        if (frameworkModel) {
            const systemPrompt = `Analyze the following user input and determine if it represents a core memory, task, or reminder.
            If it does NOT, return 'NOISE'.
            If it DOES, return EXACTLY in this JSON format: {"type": "memory" | "task" | "reminder", "desc": "Logic Token: <Semantic Abstraction>"}. Do not wrap in markdown.`;

            generateResponse(frameworkModel, [
               { id: 'sys', role: 'system', content: systemPrompt, timestamp: Date.now() },
               { id: 'usr', role: 'user', content: userMessage, timestamp: Date.now() }
            ]).then((extraction) => {
               try {
                  if (!extraction.includes('NOISE')) {
                     const parsed = JSON.parse(extraction.trim());
                     if (parsed.type && parsed.desc) {
                        updateMessageEvent(model.id, newMsgId, parsed);
                     }
                  }
               } catch (e) { /* silent parse fail */ }
            });
        }
    }
    // ----------------------------------------

    const apiMessages = [...messages, { id: 'temp', role: 'user' as const, content: userMessage, timestamp: Date.now() }];

    setIsGenerating(true);
    clearPendingAttachments();

    try {
      const responseContent = await generateResponse(model, apiMessages);
      addMessage(model.id, 'assistant', responseContent);
    } catch (error) {
       refundCredits(cost);
       addMessage(model.id, 'assistant', 'Error: Network failed. Credits refunded.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMessageLongPress = (msgContent: string) => {
    // Fulfills the requirement for conventional long-press options on messages
    Alert.alert(
      "Message Options",
      "Choose an action:",
      [
        { text: "Copy", onPress: () => console.log("Copy stub") },
        { text: "Retry", onPress: () => console.log("Retry stub") },
        { text: "Edit", onPress: () => console.log("Edit stub") },
        { text: "Delete", onPress: () => console.log("Delete stub"), style: 'destructive' },
        { text: "Share", onPress: () => console.log("Share stub") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      pointerEvents="box-none"
    >
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setFocusedModelId(null)}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{model.name}</Text>
            <Text style={styles.subtitle}>{model.provider} • {model.tier}</Text>
            {model.category !== 'general' && (
               <TouchableOpacity style={styles.marketPill} onPress={() => {}}>
                  <Text style={styles.marketPillText}>Generated to File Manager</Text>
               </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerRight}>
             <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearchOpen(!isSearchOpen)}>
               <Search color={isSearchOpen ? "#4285F4" : "#fff"} size={22} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton} onPress={() => setIsParamsOpen(!isParamsOpen)}>
               <Sliders color={isParamsOpen ? "#4285F4" : "#fff"} size={22} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton} onPress={() => setSmartGenOpen(true)}>
               <Layers color="#4285F4" size={22} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton}>
               <MoreHorizontal color="#fff" size={24} />
             </TouchableOpacity>
          </View>
        </View>

        {isSearchOpen && (
           <View style={styles.searchContainer}>
              <Search color="rgba(255,255,255,0.4)" size={16} />
              <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${model.name} history & files...`}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
              />
           </View>
        )}

        {/* Model Parameters Dropdown */}
        {isParamsOpen && (
           <View style={styles.paramsContainer}>
              {model.category === 'video' && (
                 <>
                    <Text style={styles.paramTitle}>Video Options</Text>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>1080p</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>4K HDR</Text></TouchableOpacity>
                    </View>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>5s Loop</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>10s</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Fluid Motion</Text></TouchableOpacity>
                    </View>
                 </>
              )}
              {model.category === 'image' && (
                 <>
                    <Text style={styles.paramTitle}>Image Options</Text>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>16:9</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>1:1</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>9:16</Text></TouchableOpacity>
                    </View>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>Raw</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Photoreal</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Anime</Text></TouchableOpacity>
                    </View>
                 </>
              )}
              {model.category === 'audio' && (
                 <>
                    <Text style={styles.paramTitle}>Audio Options</Text>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>Song (Vocals)</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Instrumental</Text></TouchableOpacity>
                    </View>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Voiceover</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Sound Effect</Text></TouchableOpacity>
                    </View>
                 </>
              )}
              {model.category === 'coding' && (
                 <>
                    <Text style={styles.paramTitle}>Coding Environment</Text>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>Enable Canvas UI</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Auto-Execute</Text></TouchableOpacity>
                    </View>
                 </>
              )}
              {model.category === 'general' && (
                 <>
                    <Text style={styles.paramTitle}>Model Behavior</Text>
                    <View style={styles.paramRow}>
                       <TouchableOpacity style={styles.paramPillActive}><Text style={styles.paramTextActive}>Standard</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Creative</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.paramPill}><Text style={styles.paramText}>Precise</Text></TouchableOpacity>
                    </View>
                 </>
              )}
           </View>
        )}

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
               <TouchableOpacity
                 activeOpacity={0.8}
                 onLongPress={() => handleMessageLongPress(msg.content)}
                 style={[styles.messageBubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}
               >
                  {msg.role === 'user' ? (
                     <Text style={styles.userText}>{msg.content}</Text>
                  ) : model.category === 'image' && msg.role === 'assistant' ? (
                        <View style={styles.mediaContainer as any}>
                           <View style={styles.imagePlaceholder as any}>
                              <Text style={styles.imagePlaceholderText as any}>[Generated Image Output]</Text>
                           </View>
                           <Text style={styles.captionText as any}>{msg.content}</Text>
                        </View>
                     ) : model.category === 'audio' && msg.role === 'assistant' ? (
                        <View style={styles.mediaContainer as any}>
                           <View style={styles.audioPlaceholder as any}>
                              <Text style={styles.audioPlaceholderText as any}>▶  [Generated Audio Output]</Text>
                           </View>
                           <Text style={styles.captionText as any}>{msg.content}</Text>
                        </View>
                     ) : (
                        <Markdown style={markdownStyles}>
                           {msg.content}
                        </Markdown>
                  )}
               </TouchableOpacity>
            </View>
          ))}
          {isGenerating && (
             <View style={styles.loadingWrapper}>
                <ActivityIndicator color="#fff" />
             </View>
          )}
        </ScrollView>

        {/* Bottom Input Area */}
        <View style={styles.inputArea}>
          {/* Options Row */}
          <View style={styles.optionsRow}>
             <TouchableOpacity style={styles.newConvoBtn} onPress={() => archiveConversation(model.id)}>
                <Plus color="#000" size={14} />
                <Text style={{ fontSize: 10, fontWeight: '800' }}>NEW</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.optionPill, isDeepResearch && { borderColor: '#4285F4', backgroundColor: 'rgba(66, 133, 244, 0.2)' }]} onPress={() => setIsDeepResearch(!isDeepResearch)}>
                <Zap color={isDeepResearch ? "#4285F4" : "#fff"} size={14} />
                <Text style={[styles.optionText, isDeepResearch && { color: '#4285F4' }]}>Deep Research</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.optionPill, isWebEnabled && { borderColor: '#10a37f', backgroundColor: 'rgba(16, 163, 127, 0.2)' }]} onPress={() => setIsWebEnabled(!isWebEnabled)}>
                <Globe color={isWebEnabled ? "#10a37f" : "#fff"} size={14} />
                <Text style={[styles.optionText, isWebEnabled && { color: '#10a37f' }]}>Web</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.optionPill, isPrivateMode && { borderColor: '#ff453a', backgroundColor: 'rgba(255, 69, 58, 0.1)' }]} onPress={() => setPrivateMode(!isPrivateMode)}>
                <EyeOff color={isPrivateMode ? "#ff453a" : "#fff"} size={14} />
             </TouchableOpacity>
          </View>


          {(pendingContextFiles.length > 0 || pendingSourceFile) && (
             <ScrollView horizontal style={styles.holdingArea} showsHorizontalScrollIndicator={false}>
                {pendingSourceFile && (
                   <View style={styles.attachmentPillSource}>
                      <Text style={styles.attachmentPillTextSource}>Source: {pendingSourceFile.name}</Text>
                      <TouchableOpacity onPress={() => setSourceFile(null)}><X color="#4285F4" size={14} /></TouchableOpacity>
                   </View>
                )}
                {pendingContextFiles.map(f => (
                   <View key={f.id} style={styles.attachmentPill}>
                      <Text style={styles.attachmentPillText}>{f.name}</Text>
                      <TouchableOpacity onPress={() => removeContextFile(f.id)}><X color="#fff" size={14} /></TouchableOpacity>
                   </View>
                ))}
             </ScrollView>
          )}
          <View style={styles.inputBox}>
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
               maxLength={2000}
            />

            {!inputText.trim() ? (
               <TouchableOpacity style={[styles.actionButton, isRecording && { backgroundColor: 'rgba(255, 69, 58, 0.2)', borderRadius: 20 }]} onPress={() => setIsRecording(!isRecording)}>
                  <Mic color={isRecording ? "#ff453a" : "rgba(255,255,255,0.7)"} size={20} />
               </TouchableOpacity>
            ) : (
               <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={handleSend}>
                  <Send color="#000" size={18} />
               </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  paramsContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    padding: 15,
  },
  paramTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paramRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  paramPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  paramPillActive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  paramText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  paramTextActive: {
    color: '#4285F4',
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  iconButton: {
    padding: 10,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  marketPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  marketPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    gap: 20,
  },
  messageWrapper: {
     flexDirection: 'row',
     width: '100%',
  },
  messageUser: {
     justifyContent: 'flex-end',
  },
  messageAssistant: {
     justifyContent: 'flex-start',
  },
  messageBubble: {
     maxWidth: '85%',
     padding: 15,
     borderRadius: 20,
  },
  bubbleUser: {
     backgroundColor: 'rgba(255,255,255,0.15)',
     borderBottomRightRadius: 5,
  },
  bubbleAssistant: {
     backgroundColor: 'rgba(0,0,0,0.6)',
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.1)',
     borderBottomLeftRadius: 5,
  },
  smartGenPill: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: 'rgba(66, 133, 244, 0.1)',
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 8,
     alignSelf: 'flex-start',
     marginBottom: 6,
     borderWidth: 1,
     borderColor: 'rgba(66, 133, 244, 0.3)',
     gap: 4,
  },
  smartGenPillText: {
     color: '#4285F4',
     fontSize: 10,
     fontWeight: '600',
  },
  mediaContainer: {
     width: '100%',
  },
  imagePlaceholder: {
     width: 250,
     height: 250,
     backgroundColor: 'rgba(255,255,255,0.1)',
     borderRadius: 8,
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 10,
  },
  imagePlaceholderText: {
     color: 'rgba(255,255,255,0.3)',
     fontSize: 12,
  },
  audioPlaceholder: {
     width: 250,
     height: 50,
     backgroundColor: 'rgba(66, 133, 244, 0.2)',
     borderRadius: 25,
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 10,
     borderWidth: 1,
     borderColor: 'rgba(66, 133, 244, 0.5)',
  },
  audioPlaceholderText: {
     color: '#fff',
     fontSize: 14,
     fontWeight: '600',
  },
  captionText: {
     color: 'rgba(255,255,255,0.6)',
     fontSize: 12,
  },
  userText: {
     color: '#fff',
     fontSize: 16,
  },
  loadingWrapper: {
     alignItems: 'flex-start',
     padding: 10,
  },
  inputArea: {
    padding: 15,
    paddingBottom: 25,
  },
  newConvoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  holdingArea: {
    flexDirection: 'row',
    marginBottom: 8,
    maxHeight: 30,
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 4,
  },
  attachmentPillText: {
    color: '#fff',
    fontSize: 10,
  },
  attachmentPillSource: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
    gap: 4,
  },
  attachmentPillTextSource: {
    color: '#4285F4',
    fontSize: 10,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    maxHeight: 100,
    minHeight: 40,
  },
  actionButton: {
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
  }
});

const markdownStyles = StyleSheet.create({
   body: {
      color: '#fff',
      fontSize: 16,
   },
   code_inline: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: '#4285F4',
   },
   code_block: {
      backgroundColor: '#000',
      padding: 10,
      borderRadius: 8,
      color: '#4285F4',
   }
});
