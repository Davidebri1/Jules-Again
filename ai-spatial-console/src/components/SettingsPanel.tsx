import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, User, Shield, CreditCard, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const SettingsPanel: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, currentThemeId, setCurrentThemeId, themes, addTheme, userProfile, setAuthOpen, setUpgradeOpen } = useAppStore();

  const handleUploadMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';

        if (isVideo && userProfile.tier === 'free') {
           Alert.alert("Premium Feature", "Live video wallpapers require a Pro or Elite subscription.");
           return;
        }

        const newTheme = {
           id: `custom-${Date.now()}`,
           name: isVideo ? 'Custom Video' : 'Custom Image',
           uri: asset.uri,
           type: isVideo ? 'video' : 'image'
        };

        addTheme(newTheme as any);
        setCurrentThemeId(newTheme.id);
      }
    } catch (e) {
      console.log('Error picking media:', e);
    }
  };

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
          <TouchableOpacity style={styles.row} onPress={() => { setSettingsOpen(false); setAuthOpen(true); }}>
            <User color="#aaa" size={20} />
            <Text style={styles.rowText}>Login / Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Privacy & Security', 'Coming soon.')}>
            <Shield color="#aaa" size={20} />
            <Text style={styles.rowText}>Privacy & Security</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Stub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription (Upgrade)</Text>
          <TouchableOpacity style={styles.row} onPress={() => { setSettingsOpen(false); setUpgradeOpen(true); }}>
            <CreditCard color="#aaa" size={20} />
            <Text style={styles.rowText}>View Plans (Pro/Elite)</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Themes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeScroll}>
            {themes && themes.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeCard, currentThemeId === theme.id && styles.themeCardActive]}
                onPress={() => setCurrentThemeId(theme.id)}
              >
                {theme.type === 'video' ? (
                  <View style={[styles.themeImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                     <Text style={{color: '#fff', fontSize: 10, padding: 5, textAlign: 'center'}}>LIVE WALLPAPER</Text>
                     <View style={[styles.themeLabelContainer, {position: 'absolute', bottom: 0, width: '100%'}]}>
                        <Text style={styles.themeLabel}>{theme.name}</Text>
                     </View>
                  </View>
                ) : (
                  <ImageBackground source={{ uri: theme.uri }} style={styles.themeImage} resizeMode="cover">
                    <View style={styles.themeLabelContainer}>
                      <Text style={styles.themeLabel}>{theme.name}</Text>
                    </View>
                  </ImageBackground>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.row, { justifyContent: 'center', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={handleUploadMedia}>
             <Upload color="#fff" size={20} />
             <Text style={[styles.rowText, {fontWeight: 'bold'}]}>Upload Custom Background</Text>
          </TouchableOpacity>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    padding: 3,
  },
  toggleTrackActive: {
    backgroundColor: '#4285F4',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
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
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.5)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff453a',
    fontWeight: '700',
    fontSize: 16,
  }
});
