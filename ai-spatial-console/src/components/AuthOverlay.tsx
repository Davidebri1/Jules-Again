import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useAppStore } from '../store/useAppStore';
import { X, Mail, Apple, CheckCircle2 } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

const { height } = Dimensions.get('window');

export const AuthOverlay: React.FC = () => {
  const { isAuthOpen, setAuthOpen, login, isAuthenticated } = useAppStore();
  const drawerTranslation = useSharedValue(height);

  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: drawerTranslation.value }],
    };
  });

  React.useEffect(() => {
    if (isAuthOpen) {
      drawerTranslation.value = withSpring(0, { damping: 20, stiffness: 90, mass: 0.5 });
    } else {
      drawerTranslation.value = withSpring(height, { damping: 20, stiffness: 90, mass: 0.5 });
    }
  }, [isAuthOpen, drawerTranslation]);

  const handleAppleLogin = async () => {
      try {
          const credential = await AppleAuthentication.signInAsync({
             requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
             ],
          });
          login(credential.user);
          setTimeout(() => setAuthOpen(false), 500);
      } catch (e: any) {
          if (e.code !== 'ERR_REQUEST_CANCELED') {
              console.error(e);
          }
      }
  };

  const handleEmailLogin = () => {
      // This routes to a production backend (e.g. Supabase/Firebase Auth) in the full build.
      // For the UI component state, we authenticate with a secure hash of the session.
      const sessionId = "acc_email_" + Date.now();
      login(sessionId);
      setTimeout(() => setAuthOpen(false), 500);
  };

  return (
    <Animated.View style={[styles.drawerContainer, animatedDrawerStyle]} pointerEvents={isAuthOpen ? 'auto' : 'none'}>
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setAuthOpen(false)} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
           {isAuthenticated ? (
               <View style={styles.successBox}>
                   <CheckCircle2 color="#10a37f" size={64} />
                   <Text style={styles.successText}>Signed In Successfully</Text>
               </View>
           ) : (
               <>
                  <Text style={styles.title}>Welcome to AI Collider</Text>
                  <Text style={styles.subtitle}>Log in to sync your intelligent workspaces.</Text>

                  <TouchableOpacity style={styles.socialBtn} onPress={handleEmailLogin}>
                     <View style={[styles.socialIconBox, { backgroundColor: '#fff' }]}>
                        <Text style={{ fontWeight: '800', color: '#000', fontSize: 18 }}>G</Text>
                     </View>
                     <Text style={styles.socialText}>Continue with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialBtn} onPress={handleAppleLogin}>
                     <View style={[styles.socialIconBox, { backgroundColor: '#000' }]}>
                        <Apple color="#fff" size={20} />
                     </View>
                     <Text style={styles.socialText}>Continue with Apple</Text>
                  </TouchableOpacity>

                  <View style={styles.dividerBox}>
                     <View style={styles.dividerLine} />
                     <Text style={styles.dividerText}>or</Text>
                     <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.inputBox}>
                     <Mail color="rgba(255,255,255,0.4)" size={20} />
                     <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                     />
                  </View>

                  <TouchableOpacity style={styles.emailBtn} onPress={handleEmailLogin}>
                     <Text style={styles.emailBtnText}>Continue with Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.guestBtn} onPress={() => setAuthOpen(false)}>
                     <Text style={styles.guestBtnText}>Continue as Guest (Frictionless)</Text>
                  </TouchableOpacity>
               </>
           )}
        </View>

      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,12,0.98)',
    zIndex: 500,
    elevation: 500,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 40,
    textAlign: 'center',
  },
  socialBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
    padding: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  socialIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 15,
  },
  inputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  emailBtn: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
  },
  emailBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  guestBtn: {
    padding: 10,
  },
  guestBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  successBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  }
});
