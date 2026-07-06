import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft, MoreHorizontal, Mic, Paperclip, Send, Layers } from 'lucide-react-native';
import { generateResponse } from '../utils/api';

export const CardDetailView: React.FC = () => {
  const { focusedModelId, setFocusedModelId, availableModels, conversations, addMessage, setSmartGenOpen } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const model = availableModels.find((m) => m.id === focusedModelId);
  const conversation = model ? conversations[model.id] : null;
  const messages = conversation ? conversation.messages : [];

  if (!model) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add user message to store
    addMessage(model.id, 'user', userMessage);

    // Prepare message history for API (including the one just sent)
    const apiMessages = [...messages, { id: 'temp', role: 'user' as const, content: userMessage, timestamp: Date.now() }];

    setIsGenerating(true);

    try {
      const responseContent = await generateResponse(model, apiMessages);
      addMessage(model.id, 'assistant', responseContent);
    } catch (error) {
       addMessage(model.id, 'assistant', 'Error generating response.');
    } finally {
      setIsGenerating(false);
    }
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
          </View>

          <View style={styles.headerRight}>
             {/* Open Smart Gen Tools Button */}
             <TouchableOpacity style={styles.iconButton} onPress={() => setSmartGenOpen(true)}>
               <Layers color="#4285F4" size={24} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton}>
               <MoreHorizontal color="#fff" size={24} />
             </TouchableOpacity>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
               <View style={[styles.messageBubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                  {msg.role === 'user' ? (
                     <Text style={styles.userText}>{msg.content}</Text>
                  ) : (
                     <Markdown style={markdownStyles}>
                        {msg.content}
                     </Markdown>
                  )}
               </View>
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
          <View style={styles.inputBox}>
            <TouchableOpacity style={styles.actionButton}>
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
               <TouchableOpacity style={styles.actionButton}>
                  <Mic color="rgba(255,255,255,0.7)" size={20} />
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
