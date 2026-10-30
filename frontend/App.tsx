import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [nickname, setNickname] = useState('열공홍길동');
  const [targetExam, setTargetExam] = useState('수능 수학');
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
      {currentScreen === 'HOME' && token && (
        <View style={{ flex: 1 }}>
          <View style={styles.topBar}>
            <Text style={styles.topLogo}>FlowPlan</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
          <CalendarScreen
            accessToken={token}
            nickname={nickname}
            targetExam={targetExam}
          />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  topLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: -0.5,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
});
