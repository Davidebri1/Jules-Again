import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, Clock, Hash, ChevronRight } from 'lucide-react-native';

export const HistoryDrawer: React.FC = () => {
  const { isHistoryOpen, setHistoryOpen, archivedConversations, availableModels } = useAppStore();

  if (!isHistoryOpen) return null;

  return (
    <View style={styles.container}>
       <SafeAreaView style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.drawer}>
             <View style={styles.header}>
                <Text style={styles.title}>ARCHIVE</Text>
                <TouchableOpacity onPress={() => setHistoryOpen(false)}><X color="#fff" size={24} /></TouchableOpacity>
             </View>

             <ScrollView contentContainerStyle={{ padding: 15 }}>
                {archivedConversations.length === 0 ? (
                   <Text style={styles.empty}>No archived logs.</Text>
                ) : (
                   archivedConversations.map(convo => (
                      <TouchableOpacity key={convo.id} style={styles.card}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <Hash color="#4285F4" size={12} />
                            <Text style={styles.modelName}>{availableModels.find(m => m.id === convo.modelId)?.name || 'Model'}</Text>
                         </View>
                         <Text style={styles.convoTitle} numberOfLines={1}>{convo.title}</Text>
                         <Text style={styles.date}>{new Date(convo.updatedAt).toLocaleDateString()}</Text>
                      </TouchableOpacity>
                   ))
                )}
             </ScrollView>
          </View>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setHistoryOpen(false)} />
       </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, zIndex: 600 },
  drawer: { width: '80%', backgroundColor: '#0a0a0c', height: '100%', borderRightWidth: 1, borderRightColor: '#1c1c1e' },
  backdrop: { flex: 1, backgroundColor: '#000' }, // Backdrop stays semi-transparent for depth
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  empty: { color: '#636366', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#161618', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1c1c1e' },
  modelName: { color: '#4285F4', fontSize: 10, fontWeight: 'bold' },
  convoTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  date: { color: '#636366', fontSize: 10, marginTop: 8 }
});
