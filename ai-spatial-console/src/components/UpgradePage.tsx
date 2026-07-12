import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCircle2, Building, ShieldCheck } from 'lucide-react-native';

export const UpgradePage: React.FC = () => {
  const { isUpgradeOpen, setUpgradeOpen, setUserTier } = useAppStore();
  const [enterpriseMessage, setEnterpriseMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  if (!isUpgradeOpen) return null;

  const handleUpgrade = async (tier: any) => {
     setIsProcessing(tier);

     // Simulate App Store / Play Store IAP Flow
     // In production, this would call RevenueCat or expo-in-app-purchases
     await new Promise(resolve => setTimeout(resolve, 2000));

     setUserTier(tier);
     setIsProcessing(null);
     Alert.alert("Payment Successful", `Welcome to the ${tier.toUpperCase()} tier! Your spatial limits have been expanded.`);
     setUpgradeOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UPGRADE PLAN</Text>
        <TouchableOpacity onPress={() => setUpgradeOpen(false)}><X color="#fff" size={24} /></TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.tierCard}>
           <View style={styles.tierHeader}>
              <Text style={styles.tierName}>PRO</Text>
              <ShieldCheck color="#4285F4" size={24} />
           </View>
           <Text style={styles.tierPrice}>.99/mo</Text>
           <View style={styles.featureRow}><CheckCircle2 color="#10a37f" size={16} /><Text style={styles.feature}>Unlimited General Messages</Text></View>
           <View style={styles.featureRow}><CheckCircle2 color="#10a37f" size={16} /><Text style={styles.feature}>1,000 Starting Credits</Text></View>
           <View style={styles.featureRow}><CheckCircle2 color="#10a37f" size={16} /><Text style={styles.feature}>High-Res Video Wallpapers</Text></View>

           <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#4285F4' }]}
              onPress={() => handleUpgrade('pro')}
              disabled={!!isProcessing}
           >
              {isProcessing === 'pro' ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Upgrade Now</Text>}
           </TouchableOpacity>
        </View>

        <View style={[styles.tierCard, { marginTop: 20, borderColor: '#d97757' }]}>
           <View style={styles.tierHeader}>
              <Text style={[styles.tierName, { color: '#d97757' }]}>ELITE</Text>
              <ShieldCheck color="#d97757" size={24} />
           </View>
           <Text style={styles.tierPrice}>9.99/mo</Text>
           <View style={styles.featureRow}><CheckCircle2 color="#10a37f" size={16} /><Text style={styles.feature}>Priority Model Access (Sora, Opus)</Text></View>
           <View style={styles.featureRow}><CheckCircle2 color="#10a37f" size={16} /><Text style={styles.feature}>5,000 Starting Credits</Text></View>
           <View style={styles.featureRow}><CheckCircle2 color="#10a37f" size={16} /><Text style={styles.feature}>Early Alpha Features</Text></View>

           <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#d97757' }]}
              onPress={() => handleUpgrade('elite')}
              disabled={!!isProcessing}
           >
              {isProcessing === 'elite' ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Go Elite</Text>}
           </TouchableOpacity>
        </View>

        <View style={styles.enterpriseSection}>
           <Text style={styles.entTitle}>Enterprise Solutions</Text>
           <Text style={styles.entDesc}>Custom spatial clusters and dedicated context windows for large teams.</Text>
           <TextInput
              style={styles.input}
              placeholder="Tell us about your needs..."
              placeholderTextColor="#636366"
              value={enterpriseMessage}
              onChangeText={setEnterpriseMessage}
              multiline
           />
           <TouchableOpacity
              style={styles.entBtn}
              onPress={() => { Alert.alert("Request Sent", "A spatial solutions architect will contact you shortly."); setEnterpriseMessage(''); }}
           >
              <Text style={styles.entBtnText}>Contact Sales</Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.legal}>Subscriptions automatically renew unless cancelled 24h before end of period. Manage in Account Settings.</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0c', zIndex: 300 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1e' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scrollContent: { padding: 20 },
  tierCard: { backgroundColor: '#161618', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#1c1c1e' },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierName: { color: '#4285F4', fontSize: 24, fontWeight: '900' },
  tierPrice: { color: '#fff', fontSize: 32, marginVertical: 15, fontWeight: 'bold' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  feature: { color: '#8e8e93', fontSize: 14, fontWeight: '500' },
  btn: { padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 20, height: 56, justifyContent: 'center' },
  btnText: { color: '#000', fontWeight: '800', fontSize: 16 },
  enterpriseSection: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#1c1c1e', paddingTop: 30 },
  entTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  entDesc: { color: '#636366', fontSize: 13, marginBottom: 20 },
  input: { backgroundColor: '#1c1c1e', color: '#fff', padding: 15, borderRadius: 12, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#3a3a3c' },
  entBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 15 },
  entBtnText: { color: '#000', fontWeight: '800' },
  legal: { color: '#444', fontSize: 10, textAlign: 'center', marginTop: 30, lineHeight: 14 }
});
