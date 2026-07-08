import React, { useState } from 'react';

import { Platform } from 'react-native';
let MediaLibrary: any = {};
let FileSystem: any = {};

let Sharing: any = null;
if (Platform.OS !== 'web') {
   try { MediaLibrary = require('expo-media-library'); } catch(e) {}
   try { FileSystem = require('expo-file-system'); } catch(e) {}
   Sharing = require('expo-sharing');
}
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import { X, FileText, Image as ImageIcon, Video, Upload, Folder, Database, DownloadCloud, MoreVertical, Star, Trash2, Maximize2, CopyPlus, Link } from 'lucide-react-native';
import { Alert, Share } from 'react-native';



import * as DocumentPicker from 'expo-document-picker';

const { width, height } = Dimensions.get('window');

type FileCategory = 'uploaded' | 'generated' | 'collection';

interface StoredFile {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  category: FileCategory;
  modelId?: string;
}

export const FileManagerView: React.FC = () => {
  const { isFileManagerOpen, setFileManagerOpen, focusedModelId, availableModels, selectedTab, addContextFile, setSourceFile, toggleStarFile, starredFiles, files, setFiles } = useAppStore();
  const [activeTab, setActiveTab] = useState<FileCategory>('uploaded');
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  const drawerTranslation = useSharedValue(width);

  // Reanimated style for the sliding drawer
  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drawerTranslation.value }],
    };
  });

  // Handle opening and closing animation
  React.useEffect(() => {
    if (isFileManagerOpen) {
      drawerTranslation.value = withSpring(0, { damping: 20, stiffness: 90, mass: 0.5 });
    } else {
      drawerTranslation.value = withSpring(width, { damping: 20, stiffness: 90, mass: 0.5 });
    }
  }, [isFileManagerOpen, drawerTranslation]);

  // Mock data for initial view based on focused model or global
  React.useEffect(() => {
     if (isFileManagerOpen) {
        if (selectedTab !== 'general') {
           setActiveTab('generated');
        } else {
           setActiveTab('uploaded');
        }
     }

  }, [isFileManagerOpen]);

  const handleUpload = async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({
              copyToCacheDirectory: true,
              multiple: false,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
              const file = result.assets[0];
              const newFile: StoredFile = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: file.name,
                  uri: file.uri,
                  type: file.mimeType || 'unknown',
                  size: file.size || 0,
                  category: 'uploaded',
                  modelId: focusedModelId || undefined
              };
              setFiles(prev => [newFile, ...prev]);
          }
      } catch (error) {
          console.error("Error picking document:", error);
      }
  };

  const currentModelName = focusedModelId
    ? availableModels.find(m => m.id === focusedModelId)?.name
    : 'Global View';


  const handleFileOptions = async (file: StoredFile) => {
      Alert.alert(
          "File Options",
          file.name,
          [
              { text: "Open (OS Native)", onPress: async () => {
                  try {
                     if (await Sharing.isAvailableAsync()) {
                         await Sharing.shareAsync(file.uri, { dialogTitle: 'Open File' });
                     } else {
                         Alert.alert('Unsupported', 'Sharing is not available on this device.');
                     }
                  } catch (e) { console.error(e); }
              }},
              { text: "Save / Download", onPress: async () => {
                  try {
                      const { status } = await MediaLibrary.requestPermissionsAsync();
                      if (status === 'granted') {
                          await MediaLibrary.saveToLibraryAsync(file.uri);
                          Alert.alert("Success", "File saved to device.");
                      } else {
                          Alert.alert("Permission Denied", "Cannot save file without storage permissions.");
                      }
                  } catch (e) { console.error(e); }
              }},
              { text: "Share to App", onPress: async () => {
                  try {
                      await Share.share({ url: file.uri, message: `Check out this generated file: ${file.name}` });
                  } catch (e) { console.error(e); }
              }},
              { text: "Add to Smart Gen (Notes)", onPress: () => {
                  // Connects the file to the active Project/Task memory framework
                  Alert.alert("Added to Smart Gen", "File appended to current workspace context.");
              }},
              { text: "Regenerate", onPress: () => {
                  // Re-triggers the model with the exact same seed/prompt
                  Alert.alert("Regenerating", "Triggering model generation again...");
              }},
              { text: "Remix Prompt", onPress: () => console.log("Remix hit") },
              { text: "Insert as Source (Replace)", onPress: () => { setSourceFile(file); setFileManagerOpen(false); } },
              { text: "Insert as Context (Add)", onPress: () => { addContextFile(file); setFileManagerOpen(false); } },
              { text: starredFiles.includes(file.id) ? "Remove Star" : "Favorite / Star", onPress: () => toggleStarFile(file.id) },
              { text: "Delete", onPress: () => setFiles(prev => prev.filter(f => f.id !== file.id)), style: 'destructive' },
              { text: "Cancel", style: "cancel" }
          ]
      );
  };

  const displayFiles = files.filter(f => f.category === activeTab && (!focusedModelId || f.modelId === focusedModelId || !f.modelId));

  const renderFileIcon = (type: string) => {
     if (type.includes('image')) return <ImageIcon color="#4285F4" size={24} />;
     if (type.includes('video')) return <Video color="#d97757" size={24} />;
     return <FileText color="#10a37f" size={24} />;
  };

  return (
    <Animated.View style={[styles.drawerContainer, animatedDrawerStyle]} pointerEvents={isFileManagerOpen ? 'auto' : 'none'}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <View>
             <Text style={styles.title}>File Manager</Text>
             <Text style={styles.subtitle}>{currentModelName} Context</Text>
          </View>
          <TouchableOpacity onPress={() => setFileManagerOpen(false)} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
              <Upload color="#000" size={16} />
              <Text style={styles.uploadText}>Upload File</Text>
           </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
           <TouchableOpacity
             style={[styles.tabBtn, activeTab === 'uploaded' && styles.tabBtnActive]}
             onPress={() => setActiveTab('uploaded')}
           >
              <Folder color={activeTab === 'uploaded' ? "#fff" : "rgba(255,255,255,0.5)"} size={16} />
              <Text style={[styles.tabText, activeTab === 'uploaded' && styles.tabTextActive]}>Uploaded</Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={[styles.tabBtn, activeTab === 'generated' && styles.tabBtnActive]}
             onPress={() => setActiveTab('generated')}
           >
              <Database color={activeTab === 'generated' ? "#fff" : "rgba(255,255,255,0.5)"} size={16} />
              <Text style={[styles.tabText, activeTab === 'generated' && styles.tabTextActive]}>Generated</Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={[styles.tabBtn, activeTab === 'collection' && styles.tabBtnActive]}
             onPress={() => setActiveTab('collection')}
           >
              <DownloadCloud color={activeTab === 'collection' ? "#fff" : "rgba(255,255,255,0.5)"} size={16} />
              <Text style={[styles.tabText, activeTab === 'collection' && styles.tabTextActive]}>Collection</Text>
           </TouchableOpacity>
        </View>

        {/* File List */}
        <ScrollView style={styles.fileList} contentContainerStyle={{ padding: 20 }}>
           {displayFiles.length === 0 ? (
              <View style={styles.emptyState}>
                 <Text style={styles.emptyStateText}>No files in {activeTab}.</Text>
              </View>
           ) : (
              displayFiles.map((file) => (
                 <View key={file.id} style={styles.fileCard}>
                    <View style={styles.fileIconBox}>
                       {renderFileIcon(file.type)}
                    </View>
                    <View style={styles.fileInfo}>
                       <Text style={styles.fileName} numberOfLines={1}>{file.name} {starredFiles.includes(file.id) && <Star color="#FFD700" size={12} fill="#FFD700" />}</Text>
                       <Text style={styles.fileMeta}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1] || 'unknown'}
                       </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleFileOptions(file)} style={{ padding: 10 }}>
                       <MoreVertical color="rgba(255,255,255,0.5)" size={20} />
                    </TouchableOpacity>
                 </View>
              ))
           )}
        </ScrollView>


        {/* Fullscreen Preview Overlay */}
        {previewFile && (
           <View style={styles.previewOverlay}>
              <SafeAreaView style={{ flex: 1 }}>
                 <View style={styles.previewHeader}>
                    <Text style={styles.previewTitle} numberOfLines={1}>{previewFile.name}</Text>
                    <TouchableOpacity onPress={() => setPreviewFile(null)} style={styles.closeBtn}>
                       <X color="#fff" size={24} />
                    </TouchableOpacity>
                 </View>

                 <View style={styles.previewContent}>
                    {previewFile.type.includes('image') ? (
                       <View style={styles.previewImageMock}>
                          <ImageIcon color="#4285F4" size={64} />
                          <Text style={styles.previewMockText}>High-Res Image Render</Text>
                       </View>
                    ) : previewFile.type.includes('video') ? (
                       <View style={styles.previewVideoMock}>
                          <Video color="#d97757" size={64} />
                          <Text style={styles.previewMockText}>Video Player (Playing)</Text>
                       </View>
                    ) : (
                       <View style={styles.previewDocMock}>
                          <FileText color="#10a37f" size={64} />
                          <Text style={styles.previewMockText}>Document Viewer</Text>
                       </View>
                    )}
                 </View>

                 <View style={styles.previewActionRow}>
                    <TouchableOpacity style={styles.previewActionBtn} onPress={async () => {
                        try {
                           const { status } = await MediaLibrary.requestPermissionsAsync();
                           if (status === 'granted') {
                               await MediaLibrary.saveToLibraryAsync(previewFile.uri);
                               Alert.alert("Saved", "Saved to device library.");
                           }
                        } catch(e) {}
                    }}>
                       <Text style={styles.previewActionText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.previewActionBtnSecondary} onPress={() => { setSourceFile(previewFile); setPreviewFile(null); setFileManagerOpen(false); }}>
                       <Text style={styles.previewActionTextSecondary}>Use Source</Text>
                    </TouchableOpacity>
                 </View>
              </SafeAreaView>
           </View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,12,0.95)',
    zIndex: 300,
    elevation: 300,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  actionRow: {
    padding: 20,
    paddingBottom: 10,
  },
  uploadBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    gap: 8,
  },
  uploadText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  fileList: {
    flex: 1,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 400,
    elevation: 400,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 20,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImageMock: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
  previewVideoMock: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 87, 0.3)',
  },
  previewDocMock: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewMockText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  previewActionRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  previewActionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  previewActionText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  },
  previewActionBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewActionTextSecondary: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
