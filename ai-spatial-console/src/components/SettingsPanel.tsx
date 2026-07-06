import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, User, Shield, CreditCard } from 'lucide-react-native';

export const THEMES = [
  { id: 'dark-obsidian', name: 'Obsidian', uri: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2940&auto=format&fit=crop' },
  { id: 'slate-frost', name: 'Slate Frost', uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop' },
  { id: 'neon-dusk', name: 'Neon Dusk', uri: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2940&auto=format&fit=crop' },
];

export const SettingsPanel: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, currentThemeId, setCurrentThemeId } = useAppStore();

  if (!isSettingsOpen) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <TouchableOpacity onPress={() => setSettingsOpen(false)}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Account Stub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.row}>
            <User color="#aaa" size={20} />
            <Text style={styles.rowText}>Login / Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Shield color="#aaa" size={20} />
            <Text style={styles.rowText}>Privacy & Security</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Stub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription (Upgrade)</Text>
          <TouchableOpacity style={styles.row}>
            <CreditCard color="#aaa" size={20} />
            <Text style={styles.rowText}>View Plans (Pro/Elite)</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Themes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeScroll}>
            {THEMES.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeCard, currentThemeId === theme.id && styles.themeCardActive]}
                onPress={() => setCurrentThemeId(theme.id)}
              >
                <ImageBackground source={{ uri: theme.uri }} style={styles.themeImage} resizeMode="cover">
                  <View style={styles.themeLabelContainer}>
                    <Text style={styles.themeLabel}>{theme.name}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 100,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    gap: 30,
  },
  section: {
    gap: 15,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 10,
    gap: 15,
  },
  rowText: {
    color: '#fff',
    fontSize: 16,
  },
  themeScroll: {
    gap: 15,
  },
  themeCard: {
    width: 120,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardActive: {
    borderColor: '#fff',
  },
  themeImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  themeLabelContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  themeLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  }
});
