import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useAppStore, StoredFile } from "../store/useAppStore";
import {
  X,
  Upload,
  FileText,
  Search,
  MoreVertical,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const FileManagerView: React.FC = () => {
  const {
    isFileManagerOpen,
    setFileManagerOpen,
    files,
    setFiles,
    selectedTab,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<any>("uploaded");
  const [searchQuery, setSearchQuery] = useState("");

  const transX = useSharedValue(500);
  React.useEffect(() => {
    transX.value = withSpring(isFileManagerOpen ? 0 : 500);
  }, [isFileManagerOpen]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: transX.value }] }));

  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!res.canceled) {
        const file = res.assets[0];
        const newFile: StoredFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          uri: file.uri,
          type: file.mimeType || "application/octet-stream",
          size: file.size || 0,
          category: "uploaded",
        };
        setFiles((prev) => [...prev, newFile]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const displayFiles = files.filter(
    (f) =>
      f.category === activeTab &&
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isFileManagerOpen && transX.value === 500) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
             <Text style={styles.title}>FILE MANAGER</Text>
             <Text style={styles.subtitle}>{selectedTab.toUpperCase()} SCOPE</Text>
          </View>
          <TouchableOpacity onPress={() => setFileManagerOpen(false)} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
           <View style={styles.searchBar}>
              <Search color="#636366" size={18} />
              <TextInput style={styles.searchInput} placeholder="Search files..." placeholderTextColor="#636366" value={searchQuery} onChangeText={setSearchQuery} />
           </View>
           <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}><Upload color="#000" size={20} /></TouchableOpacity>
        </View>

        <View style={styles.tabs}>
           {['uploaded', 'generated', 'collection'].map(t => (
              <TouchableOpacity key={t} style={[styles.tabBtn, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
                 <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
           ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
           {displayFiles.length === 0 ? (
              <Text style={{ color: '#636366', textAlign: 'center', marginTop: 40 }}>No files found.</Text>
           ) : (
              displayFiles.map(file => (
                 <View key={file.id} style={styles.fileCard}>
                    <View style={styles.iconBox}><FileText color="#fff" size={24} /></View>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.fileName}>{file.name}</Text>
                       <Text style={styles.fileMeta}>{(file.size / 1024).toFixed(1)} KB</Text>
                    </View>
                    <TouchableOpacity onPress={() => Alert.alert("File Options", "Download / Delete / Star")}><MoreVertical color="#636366" size={20} /></TouchableOpacity>
                 </View>
              ))
           )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 400 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#4285F4', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  closeBtn: { backgroundColor: '#1c1c1e', padding: 10, borderRadius: 20 },
  searchRow: { flexDirection: 'row', padding: 20, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, height: 44 },
  uploadBtn: { backgroundColor: '#fff', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#1c1c1e', borderRadius: 8 },
  activeTab: { backgroundColor: '#4285F4' },
  tabText: { color: '#636366', fontSize: 10, fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1c1c1e' },
  iconBox: { width: 44, height: 44, backgroundColor: '#1c1c1e', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  fileName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fileMeta: { color: '#636366', fontSize: 12, marginTop: 4 }
});
