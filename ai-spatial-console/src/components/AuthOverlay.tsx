import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, Mail, Lock, LogIn } from 'lucide-react-native';

export const AuthOverlay: React.FC = () => {
  const { isAuthOpen, setAuthOpen, login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isAuthOpen) return null;

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    // Simulate network delay for production feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful auth
    login('user-' + Math.random().toString(36).substring(7));
    setIsLoading(false);
    setAuthOpen(false);
    Alert.alert("Success", isRegistering ? "Account created successfully!" : "Signed in successfully!");
  };

  const handleOAuth = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login(provider.toLowerCase() + '-' + Math.random().toString(36).substring(7));
      setIsLoading(false);
      setAuthOpen(false);
      Alert.alert("Success", `Signed in with ${provider}!`);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
           <Text style={styles.title}>{isRegistering ? 'CREATE ACCOUNT' : 'IDENTITY'}</Text>
           <TouchableOpacity onPress={() => setAuthOpen(false)} style={styles.closeBtn}><X color="#fff" size={24} /></TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
           <Text style={styles.hero}>{isRegistering ? 'Join the spatial revolution.' : 'Access your spatial cloud.'}</Text>

           <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                 <Mail color="#636366" size={20} />
                 <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#636366"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                 />
              </View>
              <View style={styles.inputBox}>
                 <Lock color="#636366" size={20} />
                 <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#636366"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                 />
              </View>
           </View>

           <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isRegistering ? 'Sign Up' : 'Sign In'}</Text>}
           </TouchableOpacity>

           <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={{ marginTop: 20 }}>
              <Text style={styles.toggleText}>
                 {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
           </TouchableOpacity>

           <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>OR</Text><View style={styles.line} /></View>

           <View style={styles.oauthRow}>
              <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('Apple')}><Text style={styles.oauthBtnText}>Apple</Text></TouchableOpacity>
              <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('Google')}><Text style={styles.oauthBtnText}>Google</Text></TouchableOpacity>
           </View>

           <TouchableOpacity style={styles.guestBtn} onPress={() => handleOAuth('Guest')}><Text style={styles.guestBtnText}>Continue as Guest</Text></TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 500 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  closeBtn: { backgroundColor: '#1c1c1e', padding: 10, borderRadius: 20 },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  hero: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 40, textAlign: 'center' },
  inputGroup: { gap: 15, marginBottom: 30 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161618', borderRadius: 12, paddingHorizontal: 15, height: 56, borderWidth: 1, borderColor: '#1c1c1e' },
  input: { flex: 1, color: '#fff', marginLeft: 12, fontSize: 16 },
  mainBtn: { backgroundColor: '#4285F4', padding: 18, borderRadius: 30, alignItems: 'center', height: 60, justifyContent: 'center' },
  mainBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  toggleText: { color: '#4285F4', textAlign: 'center', fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30, gap: 15 },
  line: { flex: 1, height: 1, backgroundColor: '#1c1c1e' },
  or: { color: '#636366', fontSize: 12, fontWeight: 'bold' },
  oauthRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  oauthBtn: { flex: 1, backgroundColor: '#1c1c1e', padding: 15, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#3a3a3c' },
  oauthBtnText: { color: '#fff', fontWeight: '700' },
  guestBtn: { backgroundColor: 'transparent', padding: 15, borderRadius: 30, alignItems: 'center' },
  guestBtnText: { color: '#636366', fontWeight: '700' }
});
