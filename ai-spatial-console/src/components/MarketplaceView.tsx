import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, Search, Sparkles, Download, Heart, ArrowUpRight } from 'lucide-react-native';

export const MarketplaceView: React.FC = () => {
  const { isMarketplaceOpen, setMarketplaceOpen, selectedTab } = useAppStore();
  const [query, setQuery] = useState('');

  if (!isMarketplaceOpen) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
           <Text style={styles.title}>MARKETPLACE</Text>
           <TouchableOpacity onPress={() => setMarketplaceOpen(false)} style={styles.closeBtn}><X color="#fff" size={24} /></TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
           <View style={styles.searchBar}>
              <Search color="#636366" size={20} />
              <TextInput style={styles.input} placeholder="Search prompts..." placeholderTextColor="#636366" value={query} onChangeText={setQuery} />
           </View>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
           {[1,2,3,4,5,6].map(i => (
              <View key={i} style={styles.item}>
                 <View style={styles.preview}><Sparkles color="#4285F4" size={32} /></View>
                 <View style={styles.info}>
                    <Text style={styles.itemTitle}>Spatial Artifact #{i}</Text>
                    <View style={styles.meta}>
                       <TouchableOpacity style={styles.action}><Heart color="#fff" size={14} /><Text style={styles.metaText}>1.2k</Text></TouchableOpacity>
                       <TouchableOpacity style={styles.action}><Download color="#fff" size={14} /></TouchableOpacity>
                    </View>
                 </View>
              </View>
           ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 700 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  closeBtn: { backgroundColor: '#1c1c1e', padding: 10, borderRadius: 20 },
  searchRow: { padding: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderRadius: 12, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, color: '#fff', marginLeft: 12 },
  grid: { padding: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  item: { width: '47%', backgroundColor: '#161618', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1c1c1e' },
  preview: { height: 120, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  info: { padding: 12 },
  itemTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#fff', fontSize: 11 }
});
