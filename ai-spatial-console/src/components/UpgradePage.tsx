import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCircle2, Building, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const UpgradePage: React.FC = () => {
  const { isUpgradeOpen, setUpgradeOpen } = useAppStore();
  const [enterpriseMessage, setEnterpriseMessage] = useState('');

  if (!isUpgradeOpen) return null;

  const handleEnterpriseSubmit = () => {
    if (!enterpriseMessage.trim()) return;
    // In a real app, this sends an email to the admin and CCs the user
    Alert.alert('Inquiry Sent', 'Your enterprise inquiry has been sent to our team. We will be in touch shortly.');
    setEnterpriseMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic backdrop for upgrade page */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(20,20,30,0.95)', 'rgba(0,0,0,1)']}
            style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>UNLOCK SPATIAL INTELLIGENCE</Text>
        <TouchableOpacity onPress={() => setUpgradeOpen(false)}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.heroText}>Choose the tier that matches your cognitive demands.</Text>

        {/* PRO TIER */}
        <View style={[styles.tierCard, { borderColor: '#4285F4' }]}>
           <View style={styles.tierHeader}>
              <Text style={styles.tierName}>PRO</Text>
              <Text style={styles.tierPrice}>$19.99<Text style={styles.tierPeriod}>/mo</Text></Text>
           </View>
           <Text style={styles.tierDesc}>Access to industry-standard models.</Text>

           <View style={styles.featureList}>
              <View style={styles.featureRow}><CheckCircle2 color="#4285F4" size={16} /><Text style={styles.featureText}>GPT-4o, Claude 3.5 Sonnet, Gemini 1.5</Text></View>
              <View style={styles.featureRow}><CheckCircle2 color="#4285F4" size={16} /><Text style={styles.featureText}>2,500 messages per month</Text></View>
              <View style={styles.featureRow}><CheckCircle2 color="#4285F4" size={16} /><Text style={styles.featureText}>Standard Smart Gen features</Text></View>
           </View>

           <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: '#4285F4' }]}>
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
           </TouchableOpacity>
        </View>

        {/* ELITE TIER */}
        <View style={[styles.tierCard, { borderColor: '#d97757', marginTop: 20 }]}>
           <LinearGradient colors={['rgba(217, 119, 87, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
           <View style={styles.tierHeader}>
              <Text style={[styles.tierName, { color: '#d97757' }]}>ELITE</Text>
              <Text style={styles.tierPrice}>$49.99<Text style={styles.tierPeriod}>/mo</Text></Text>
           </View>
           <Text style={styles.tierDesc}>Unrestricted access to the bleeding edge.</Text>

           <View style={styles.featureList}>
              <View style={styles.featureRow}><CheckCircle2 color="#d97757" size={16} /><Text style={styles.featureText}>Claude 3 Opus, DALL-E 3, Sora, Runway Gen-3</Text></View>
              <View style={styles.featureRow}><CheckCircle2 color="#d97757" size={16} /><Text style={styles.featureText}>Unlimited messages & media generation</Text></View>
              <View style={styles.featureRow}><CheckCircle2 color="#d97757" size={16} /><Text style={styles.featureText}>Advanced Canvas & Deep Research modes</Text></View>
           </View>

           <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: '#d97757' }]}>
              <Text style={styles.upgradeButtonText}>Upgrade to Elite</Text>
           </TouchableOpacity>
        </View>

        {/* ENTERPRISE FORM */}
        <View style={styles.enterpriseSection}>
           <View style={styles.entHeader}>
              <Building color="#fff" size={20} />
              <Text style={styles.entTitle}>Enterprise Solutions</Text>
           </View>
           <Text style={styles.entDesc}>Need custom deployments, SOC2 compliance, or massive volume limits? Contact us directly.</Text>

           <View style={styles.entForm}>
              <TextInput
                 style={styles.entInput}
                 placeholder="How can we help your organization?"
                 placeholderTextColor="rgba(255,255,255,0.4)"
                 multiline
                 numberOfLines={4}
                 value={enterpriseMessage}
                 onChangeText={setEnterpriseMessage}
              />
              <TouchableOpacity style={styles.entSubmit} onPress={handleEnterpriseSubmit}>
                 <Text style={styles.entSubmitText}>Contact Us</Text>
                 <Send color="#000" size={16} style={{marginLeft: 5}}/>
              </TouchableOpacity>
           </View>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 300, // Highest level overlay
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  heroText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  tierCard: {
     backgroundColor: 'rgba(255,255,255,0.03)',
     borderRadius: 20,
     padding: 25,
     borderWidth: 1,
     overflow: 'hidden',
  },
  tierHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'flex-end',
     marginBottom: 10,
  },
  tierName: {
     color: '#4285F4',
     fontSize: 24,
     fontWeight: '900',
     letterSpacing: 2,
  },
  tierPrice: {
     color: '#fff',
     fontSize: 32,
     fontWeight: '800',
  },
  tierPeriod: {
     fontSize: 14,
     color: 'rgba(255,255,255,0.5)',
  },
  tierDesc: {
     color: 'rgba(255,255,255,0.6)',
     fontSize: 14,
     marginBottom: 20,
  },
  featureList: {
     gap: 12,
     marginBottom: 30,
  },
  featureRow: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 10,
  },
  featureText: {
     color: '#fff',
     fontSize: 14,
  },
  upgradeButton: {
     paddingVertical: 15,
     borderRadius: 30,
     alignItems: 'center',
  },
  upgradeButtonText: {
     color: '#000',
     fontSize: 16,
     fontWeight: '800',
  },
  enterpriseSection: {
     marginTop: 40,
     paddingTop: 30,
     borderTopWidth: 1,
     borderTopColor: 'rgba(255,255,255,0.1)',
  },
  entHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 10,
     marginBottom: 10,
  },
  entTitle: {
     color: '#fff',
     fontSize: 18,
     fontWeight: '700',
  },
  entDesc: {
     color: 'rgba(255,255,255,0.6)',
     fontSize: 14,
     marginBottom: 20,
     lineHeight: 20,
  },
  entForm: {
     backgroundColor: 'rgba(255,255,255,0.05)',
     borderRadius: 15,
     padding: 15,
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.1)',
  },
  entInput: {
     color: '#fff',
     fontSize: 16,
     height: 100,
     textAlignVertical: 'top',
     marginBottom: 15,
  },
  entSubmit: {
     backgroundColor: '#fff',
     flexDirection: 'row',
     paddingVertical: 12,
     borderRadius: 20,
     alignItems: 'center',
     justifyContent: 'center',
  },
  entSubmitText: {
     color: '#000',
     fontWeight: '700',
     fontSize: 14,
  }
});
