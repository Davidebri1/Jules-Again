import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, User, Shield, CreditCard } from 'lucide-react-native';

export const SettingsPanel: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, currentThemeId, setCurrentThemeId, themes, userProfile, setUpgradeOpen } = useAppStore();

  if (!isSettingsOpen) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <TouchableOpacity onPress={() => setSettingsOpen(false)}><X color="#fff" size={24} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}><User color="#8e8e93" size={20} /><Text style={styles.rowText}>Login / Register (Guest)</Text></View>
          <TouchableOpacity style={styles.row} onPress={() => setUpgradeOpen(true)}><CreditCard color="#8e8e93" size={20} /><Text style={styles.rowText}>View Plans (Tier: {userProfile.tier.toUpperCase()})</Text></TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Themes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {themes.map(t => (
              <TouchableOpacity key={t.id} style={[styles.card, currentThemeId === t.id && styles.activeCard]} onPress={() => setCurrentThemeId(t.id)}>
                 <Text style={styles.cardText}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 100, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  scroll: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#636366', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', padding: 15, borderRadius: 12, gap: 15, marginBottom: 10 },
  rowText: { color: '#fff', fontSize: 16 },
  card: { width: 100, height: 140, backgroundColor: '#1c1c1e', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3a3a3c' },
  activeCard: { borderColor: '#4285F4', backgroundColor: '#1a2633' },
  cardText: { color: '#fff', fontSize: 10, textAlign: 'center', padding: 5 }
});
