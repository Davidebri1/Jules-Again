import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image, Dimensions, Alert } from 'react-native';
import { useAppStore, ModelCategory } from '../store/useAppStore';
import { X, Search, Sparkles, Download, Heart, ArrowUpRight, Copy, Play, Image as ImageIcon, Code, Music, Layers } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface MarketItem {
  id: string;
  title: string;
  description: string;
  category: 'General' | 'Image' | 'Video' | 'Audio' | 'Coding';
  author: string;
  likes: string;
  downloads: string;
  tags: string[];
}

const MOCK_MARKET_ITEMS: MarketItem[] = [
  // General
  { id: 'g1', title: 'Spatial Heuristic Prompt', description: 'Advanced prompt for navigating complex spatial logic in 3D environments.', category: 'General', author: 'NexusCore', likes: '2.4k', downloads: '8.1k', tags: ['spatial', 'logic'] },
  { id: 'g2', title: 'Ethical Alignment Filter', description: 'System prompt to enforce strict Natural Law alignment in model outputs.', category: 'General', author: 'LawGiver', likes: '1.2k', downloads: '3.4k', tags: ['ethics', 'alignment'] },
  { id: 'g3', title: 'Context Optimizer', description: 'Reduces noise and maximizes pattern recognition in 8KB windows.', category: 'General', author: 'SpatialDev', likes: '4.5k', downloads: '12k', tags: ['optimization', 'context'] },

  // Image
  { id: 'i1', title: 'Cybernetic Glass PBR', description: 'Prompt for Flux Pro to generate refractive glass textures with PBR accuracy.', category: 'Image', author: 'VizArt', likes: '8.9k', downloads: '25k', tags: ['pbr', 'glass', 'flux'] },
  { id: 'i2', title: 'Ethereal Neon Dusk', description: 'Cinematic lighting prompt for Midjourney v6 focusing on twilight hues.', category: 'Image', author: 'NeonDream', likes: '5.2k', downloads: '18k', tags: ['neon', 'cinematic'] },
  { id: 'i3', title: 'Hyper-Realistic Portrait', description: 'Settings and seeds for SDXL 1.0 focusing on skin texture and lighting.', category: 'Image', author: 'PixelMaster', likes: '3.1k', downloads: '9k', tags: ['realistic', 'portrait'] },

  // Video
  { id: 'v1', title: 'Liquid Metal Motion', description: 'Runway Gen-3 prompt for realistic fluid dynamics and metallic surfaces.', category: 'Video', author: 'MotionX', likes: '1.5k', downloads: '4k', tags: ['fluid', 'metal', 'runway'] },
  { id: 'v2', title: 'Hyper-Speed Zoom', description: 'Sora compatible prompt for high-velocity spatial transitions.', category: 'Video', author: 'SoraSpec', likes: '2.8k', downloads: '1.2k', tags: ['zoom', 'speed'] },
  { id: 'v3', title: 'Dreamscape Volumetrics', description: 'Luma Dream Machine prompt for thick fog and light beam effects.', category: 'Video', author: 'AtmoSphere', likes: '900', downloads: '2.5k', tags: ['fog', 'lighting'] },

  // Audio
  { id: 'a1', title: 'Lo-Fi Spatial Chill', description: 'Suno v3 prompt for generating deep ambient spatial textures.', category: 'Audio', author: 'BeatBot', likes: '3.3k', downloads: '15k', tags: ['lofi', 'ambient'] },
  { id: 'a2', title: 'Synthetic Cello Solo', description: 'ElevenLabs voice and SFX settings for dramatic string arrangements.', category: 'Audio', author: 'MelodyAI', likes: '1.1k', downloads: '5k', tags: ['strings', 'orchestral'] },
  { id: 'a3', title: 'Future Bass Logic', description: 'Udio prompt for high-energy rhythmic patterns and bass drops.', category: 'Audio', author: 'BassMax', likes: '4.2k', downloads: '22k', tags: ['bass', 'future'] },

  // Coding
  { id: 'c1', title: 'Spatial Grid Controller', description: 'React Three Fiber component for managing 3D grid layouts dynamically.', category: 'Coding', author: 'CodeWizard', likes: '6.7k', downloads: '30k', tags: ['r3f', 'grid', 'react'] },
  { id: 'c2', title: 'Zustand Persistence Hook', description: 'Highly optimized persistence layer with deep merging capabilities.', category: 'Coding', author: 'StatePro', likes: '2.9k', downloads: '14k', tags: ['state', 'zustand'] },
  { id: 'c3', title: 'Python Sandbox Wrapper', description: 'Secure execution environment for untrusted model-generated code.', category: 'Coding', author: 'SecurX', likes: '1.8k', downloads: '6.5k', tags: ['python', 'security'] },
];

export const MarketplaceView: React.FC = () => {
  const { isMarketplaceOpen, setMarketplaceOpen, selectedTab } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarketTab, setActiveMarketTab] = useState<'All' | 'General' | 'Image' | 'Video' | 'Audio' | 'Coding'>('All');

  // Sync with main dashboard tab on open
  useEffect(() => {
    if (isMarketplaceOpen) {
       const tabMap: Record<string, any> = {
          'general': 'General',
          'image': 'Image',
          'video': 'Video',
          'music': 'Audio',
          'coding': 'Coding'
       };
       setActiveMarketTab(tabMap[selectedTab] || 'All');
    }
  }, [isMarketplaceOpen, selectedTab]);

  const filteredItems = useMemo(() => {
    return MOCK_MARKET_ITEMS.filter(item => {
      const matchesTab = activeMarketTab === 'All' || item.category === activeMarketTab;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [activeMarketTab, searchQuery]);

  if (!isMarketplaceOpen) return null;

  const CategoryIcon = ({ cat }: { cat: string }) => {
     switch(cat) {
        case 'General': return <Sparkles color="#4285F4" size={20} />;
        case 'Image': return <ImageIcon color="#10a37f" size={20} />;
        case 'Video': return <Play color="#d97757" size={20} />;
        case 'Audio': return <Music color="#ffbb33" size={20} />;
        case 'Coding': return <Code color="#4285F4" size={20} />;
        default: return <Layers color="#8e8e93" size={20} />;
     }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
           <View>
              <Text style={styles.title}>SPATIAL MARKET</Text>
              <Text style={styles.subtitle}>{filteredItems.length} ARTIFACTS FOUND</Text>
           </View>
           <TouchableOpacity onPress={() => setMarketplaceOpen(false)} style={styles.closeBtn}><X color="#fff" size={24} /></TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
           <View style={styles.searchBar}>
              <Search color="#636366" size={20} />
              <TextInput style={styles.input} placeholder="Search prompts, components, assets..." placeholderTextColor="#636366" value={searchQuery} onChangeText={setSearchQuery} />
           </View>
        </View>

        <View style={styles.tabsContainer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {['All', 'General', 'Image', 'Video', 'Audio', 'Coding'].map(tab => (
                 <TouchableOpacity key={tab} style={[styles.marketTab, activeMarketTab === tab && styles.marketTabActive]} onPress={() => setActiveMarketTab(tab as any)}>
                    <Text style={[styles.marketTabText, activeMarketTab === tab && styles.marketTabTextActive]}>{tab}</Text>
                 </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
           {filteredItems.map(item => (
              <View key={item.id} style={styles.item}>
                 <View style={styles.preview}>
                    <CategoryIcon cat={item.category} />
                    <View style={styles.badge}><Text style={styles.badgeText}>{item.category.toUpperCase()}</Text></View>
                 </View>
                 <View style={styles.info}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.author}>by @{item.author}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.tagRow}>
                       {item.tags.map(tag => <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>)}
                    </View>

                    <View style={styles.meta}>
                       <View style={styles.statRow}>
                          <TouchableOpacity style={styles.action} onPress={() => Alert.alert("Liked", "Item added to favorites.")}><Heart color="#ff4444" size={14} /><Text style={styles.metaText}>{item.likes}</Text></TouchableOpacity>
                          <TouchableOpacity style={styles.action} onPress={() => Alert.alert("Downloaded", "Artifact copied to clipboard/files.")}><Download color="#fff" size={14} /><Text style={styles.metaText}>{item.downloads}</Text></TouchableOpacity>
                       </View>
                       <TouchableOpacity style={styles.remixBtn} onPress={() => Alert.alert("Remixing", "Loading artifact into active context.")}>
                          <Sparkles color="#000" size={12} />
                          <Text style={styles.remixText}>REMIX</Text>
                       </TouchableOpacity>
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
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: '#4285F4', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  closeBtn: { backgroundColor: '#1c1c1e', padding: 10, borderRadius: 20 },
  searchRow: { padding: 20, paddingBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#1c1c1e' },
  input: { flex: 1, color: '#fff', marginLeft: 12, fontSize: 15 },
  tabsContainer: { marginBottom: 10 },
  tabsScroll: { paddingHorizontal: 20, gap: 10 },
  marketTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1c1c1e', borderWidth: 1, borderColor: '#3a3a3c' },
  marketTabActive: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  marketTabText: { color: '#8e8e93', fontSize: 12, fontWeight: 'bold' },
  marketTabTextActive: { color: '#fff' },
  grid: { padding: 15, gap: 15 },
  item: { width: '100%', backgroundColor: '#161618', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1c1c1e', marginBottom: 5 },
  preview: { height: 100, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  info: { padding: 15 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  author: { color: '#4285F4', fontSize: 12, marginTop: 2 },
  itemDesc: { color: '#8e8e93', fontSize: 13, marginTop: 8, lineHeight: 18 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  tag: { backgroundColor: '#1c1c1e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#636366', fontSize: 10, fontWeight: 'bold' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' },
  statRow: { flexDirection: 'row', gap: 20 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#8e8e93', fontSize: 12, fontWeight: 'bold' },
  remixBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, gap: 6 },
  remixText: { color: '#000', fontSize: 11, fontWeight: '900' }
});
