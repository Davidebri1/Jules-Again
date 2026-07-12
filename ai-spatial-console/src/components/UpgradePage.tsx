import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCircle2, Building, Send } from 'lucide-react-native';

export const UpgradePage: React.FC = () => {
  const { isUpgradeOpen, setUpgradeOpen, setUserTier } = useAppStore();
  const [enterpriseMessage, setEnterpriseMessage] = useState('');

  if (!isUpgradeOpen) return null;

  const handleUpgrade = (tier: any) => {
     setUserTier(tier);
     Alert.alert("Success", `Upgraded to ${tier.toUpperCase()}!`);
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
           <Text style={styles.tierName}>PRO</Text>
           <Text style={styles.tierPrice}>9.99/mo</Text>
           <Text style={styles.feature}>- Unlimited General Messages</Text>
           <Text style={styles.feature}>- 1,000 Starting Credits</Text>
           <TouchableOpacity style={[styles.btn, { backgroundColor: '#4285F4' }]} onPress={() => handleUpgrade('pro')}><Text style={styles.btnText}>Upgrade</Text></TouchableOpacity>
        </View>

        <View style={[styles.tierCard, { marginTop: 20 }]}>
           <Text style={[styles.tierName, { color: '#d97757' }]}>ELITE</Text>
           <Text style={styles.tierPrice}>9.99/mo</Text>
           <Text style={styles.feature}>- Unlimited General Messages</Text>
           <Text style={styles.feature}>- 5,000 Starting Credits</Text>
           <TouchableOpacity style={[styles.btn, { backgroundColor: '#d97757' }]} onPress={() => handleUpgrade('elite')}><Text style={styles.btnText}>Upgrade</Text></TouchableOpacity>
        </View>

        <View style={styles.enterpriseSection}>
           <Text style={styles.entTitle}>Enterprise Solutions</Text>
           <TextInput style={styles.input} placeholder="Contact us..." placeholderTextColor="#636366" value={enterpriseMessage} onChangeText={setEnterpriseMessage} multiline />
           <TouchableOpacity style={styles.entBtn} onPress={() => { Alert.alert("Sent", "We will contact you shortly."); setEnterpriseMessage(''); }}>
              <Text style={styles.entBtnText}>Contact Us</Text>
           </TouchableOpacity>
        </View>
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
  tierCard: { backgroundColor: '#161618', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#1c1c1e' },
  tierName: { color: '#4285F4', fontSize: 24, fontWeight: '900' },
  tierPrice: { color: '#fff', fontSize: 28, marginVertical: 10, fontWeight: 'bold' },
  feature: { color: '#8e8e93', fontSize: 14, marginBottom: 5 },
  btn: { padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#000', fontWeight: '800' },
  enterpriseSection: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#1c1c1e', paddingTop: 30 },
  entTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 15 },
  input: { backgroundColor: '#1c1c1e', color: '#fff', padding: 15, borderRadius: 12, height: 100, textAlignVertical: 'top' },
  entBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 15 },
  entBtnText: { color: '#000', fontWeight: '700' }
});
