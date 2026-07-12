import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, Search, Sparkles, Download, Heart, ArrowUpRight } from 'lucide-react-native';

const MOCK_ARTIFACTS = [
  { id: '1', title: 'Cyberpunk Cityscape', creator: '@neon_dreams', likes: 1205, type: 'image', uri: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=800&auto=format&fit=crop' },
  { id: '2', title: 'Artifacts: Full Artifact and Canvas Generator', creator: '@frontend_ninja', likes: 856, type: 'code', uri: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop' },
  { id: '3', title: 'Cinematic Trailer Audio', creator: '@hans_zimmer_ai', likes: 3402, type: 'audio', uri: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop' },
  { id: '4', title: 'Quantum Computing Explanation', creator: '@science_bot', likes: 412, type: 'text', uri: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop' },
  { id: '5', title: '3D Robot Walk Cycle', creator: '@animator_x', likes: 2100, type: 'video', uri: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800&auto=format&fit=crop' },
  { id: '6', title: 'Dark Mode SaaS UI', creator: '@ui_ux_god', likes: 1540, type: 'code', uri: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=800&auto=format&fit=crop' },
];

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
