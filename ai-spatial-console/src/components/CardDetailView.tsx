import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft, MoreHorizontal, Mic, Paperclip, Send } from 'lucide-react-native';

export const CardDetailView: React.FC = () => {
  const { focusedModelId, setFocusedModelId, activeModels } = useAppStore();

  const model = activeModels.find((m) => m.id === focusedModelId);

  if (!model) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setFocusedModelId(null)}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{model.name}</Text>
          <Text style={styles.subtitle}>{model.provider} • {model.tier}</Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <MoreHorizontal color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Chat Area (Empty for now) */}
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
         {/* Messages would go here. The 3D card sits in the background. */}
      </ScrollView>

      {/* Bottom Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputBox}>
           <TouchableOpacity style={styles.actionButton}>
              <Paperclip color="rgba(255,255,255,0.7)" size={20} />
           </TouchableOpacity>

           <Text style={styles.inputPlaceholder}>Message {model.name}...</Text>

           <TouchableOpacity style={styles.actionButton}>
              <Mic color="rgba(255,255,255,0.7)" size={20} />
           </TouchableOpacity>

           <TouchableOpacity style={[styles.actionButton, styles.sendButton]}>
              <Send color="#000" size={18} />
           </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)', // Darken background to emphasize detail view
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
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
  },
  inputArea: {
    padding: 20,
    paddingBottom: 30,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  inputPlaceholder: {
    flex: 1,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
  }
});
