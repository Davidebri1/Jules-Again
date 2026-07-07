import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAppStore, Conversation } from '../store/useAppStore';
import { X, Search, Clock, Hash } from 'lucide-react-native';

export const HistoryDrawer: React.FC = () => {
  const { isHistoryOpen, setHistoryOpen, archivedConversations, availableModels, conversations, archiveConversation } = useAppStore();

  if (!isHistoryOpen) return null;

  // Group conversations by Model ID for display
  const groupedConversations = archivedConversations.reduce((acc, convo) => {
     if (!acc[convo.modelId]) acc[convo.modelId] = [];
     acc[convo.modelId].push(convo);
     return acc;
  }, {} as Record<string, typeof archivedConversations>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.drawer}>

         <View style={styles.header}>
            <Text style={styles.headerTitle}>ARCHIVE</Text>
            <TouchableOpacity onPress={() => setHistoryOpen(false)}>
               <X color="#fff" size={24} />
            </TouchableOpacity>
         </View>

         <View style={styles.searchBox}>
            <Search color="rgba(255,255,255,0.4)" size={18} />
            <Text style={styles.searchPlaceholder}>Search history...</Text>
         </View>

         <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {Object.entries(groupedConversations).length === 0 && (
               <Text style={styles.emptyText}>No archived conversations.</Text>
            )}

            {Object.entries(groupedConversations).map(([modelId, convos]) => {
               const model = availableModels.find(m => m.id === modelId);
               return (
                  <View key={modelId} style={styles.group}>
                     <View style={styles.groupHeader}>
                        <Hash color="#4285F4" size={14} />
                        <Text style={styles.groupTitle}>{model?.name || modelId}</Text>
                     </View>

                     {convos.map(convo => (
                        <TouchableOpacity key={convo.id} style={styles.convoCard}>
                           <Text style={styles.convoTitle} numberOfLines={1}>{convo.title}</Text>
                           <View style={styles.convoMeta}>
                              <Clock color="rgba(255,255,255,0.4)" size={12} />
                              <Text style={styles.convoDate}>
                                 {new Date(convo.updatedAt).toLocaleDateString()}
                              </Text>
                           </View>
                        </TouchableOpacity>
                     ))}
                  </View>
               );
            })}
         </ScrollView>
      </View>

      {/* Click-away backdrop */}
      <TouchableOpacity
         style={styles.backdrop}
         activeOpacity={1}
         onPress={() => setHistoryOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    zIndex: 180,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: 'rgba(15,15,15,0.98)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 15,
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  searchPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 40,
  },
  group: {
    marginBottom: 25,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  groupTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  convoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  convoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  convoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  convoDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  }
});
