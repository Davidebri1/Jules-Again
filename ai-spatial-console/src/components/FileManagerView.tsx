import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import { X, FileText, Image as ImageIcon, Video, Upload, Folder, Database, DownloadCloud } from 'lucide-react-native';
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
  const { isFileManagerOpen, setFileManagerOpen, focusedModelId, availableModels } = useAppStore();
  const [activeTab, setActiveTab] = useState<FileCategory>('uploaded');
  const [files, setFiles] = useState<StoredFile[]>([]);

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
     if (isFileManagerOpen && files.length === 0) {
        setFiles([
           { id: 'f1', name: 'project_brief.pdf', uri: '', type: 'application/pdf', size: 1024000, category: 'uploaded' },
           { id: 'f2', name: 'generated_logo.png', uri: '', type: 'image/png', size: 512000, category: 'generated', modelId: 'flux-pro' },
           { id: 'f3', name: 'market_dataset.csv', uri: '', type: 'text/csv', size: 2048000, category: 'collection' },
        ]);
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
                       <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                       <Text style={styles.fileMeta}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1] || 'unknown'}
                       </Text>
                    </View>
                 </View>
              ))
           )}
        </ScrollView>

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
  }
});
