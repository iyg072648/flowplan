import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'LOGIN' | 'PROFILE_SETUP' | 'HOME'>('LOGIN');

  const handleLoginSuccess = (accessToken: string, newUser: boolean) => {
    setToken(accessToken);
    setIsNewUser(newUser);
    if (newUser) {
      setCurrentScreen('PROFILE_SETUP');
    } else {
      setCurrentScreen('HOME');
    }
  };

  const handleProfileComplete = () => {
    setCurrentScreen('HOME');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentScreen('LOGIN');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {currentScreen === 'LOGIN' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {currentScreen === 'PROFILE_SETUP' && token && (
        <ProfileSetupScreen
          accessToken={token}
          onComplete={handleProfileComplete}
        />
      )}
      {currentScreen === 'HOME' && (
        <View style={styles.homeContainer}>
          <Text style={styles.homeTitle}>🎉 FlowPlan 메인 대시보드</Text>
          <Text style={styles.homeDesc}>카카오 로그인 및 인증이 성공적으로 완료되었습니다!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  homeDesc: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
