import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, Search, Sparkles, Download, Heart, ArrowUpRight } from './PremiumIcon';

const MOCK_ARTIFACTS = [
  { id: '1', title: 'Cyberpunk Cityscape', creator: '@neon_dreams', likes: 1205, type: 'image' },
  { id: '2', title: 'React Dashboard Boilerplate', creator: '@frontend_ninja', likes: 856, type: 'code' },
  { id: '3', title: 'Cinematic Trailer Audio', creator: '@hans_zimmer_ai', likes: 3402, type: 'audio' },
  { id: '4', title: 'Quantum Computing Explanation', creator: '@science_bot', likes: 412, type: 'text' },
  { id: '5', title: '3D Robot Walk Cycle', creator: '@animator_x', likes: 2100, type: 'video' },
  { id: '6', title: 'Dark Mode SaaS UI', creator: '@ui_ux_god', likes: 1540, type: 'code' },
];

export const MarketplaceView: React.FC = () => {
  const { isMarketplaceOpen, setMarketplaceOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isMarketplaceOpen) return null;

  const categories = ['All', 'Images', 'Code', 'Audio', 'Video', 'Text'];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DISCOVER & MARKETPLACE</Text>
          <TouchableOpacity onPress={() => setMarketplaceOpen(false)} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Search & Categories */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search color="rgba(255,255,255,0.5)" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search artifacts, prompts, and code..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Grid/Masonry layout for Artifacts */}
        <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
          {MOCK_ARTIFACTS.map(artifact => (
            <View key={artifact.id} style={styles.artifactCard}>
              <View style={styles.artifactPreview}>
                <Text style={styles.artifactTypeLabel}>{artifact.type.toUpperCase()}</Text>
                {/* Placeholder for actual 3D/Image preview */}
                <Sparkles color="rgba(255,255,255,0.2)" size={48} />
              </View>
              <View style={styles.artifactInfo}>
                <Text style={styles.artifactTitle} numberOfLines={1}>{artifact.title}</Text>
                <Text style={styles.artifactCreator}>{artifact.creator}</Text>

                <View style={styles.artifactActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Heart color="#fff" size={16} />
                    <Text style={styles.actionText}>{artifact.likes}</Text>
                  </TouchableOpacity>

                  <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity style={styles.iconBtn}>
                      <Download color="#fff" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(66, 133, 244, 0.3)', borderColor: '#4285F4' }]}>
                      <ArrowUpRight color="#4285F4" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Floating Upload Button */}
        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>+ PUBLISH ARTIFACT</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 12, 0.95)', // Very dark frosted glass feel
    zIndex: 200,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  categoryScroll: {
    gap: 10,
  },
  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  artifactCard: {
    width: '48%', // Approx half screen minus padding
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  artifactPreview: {
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  artifactTypeLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  artifactInfo: {
    padding: 12,
  },
  artifactTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  artifactCreator: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 12,
  },
  artifactActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  uploadBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  uploadBtnText: {
    color: '#000',
    fontWeight: '800',
    letterSpacing: 1,
  }
});
