import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { GoalCreateScreen } from './src/screens/GoalCreateScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { MyPageScreen } from './src/screens/MyPageScreen';

type TabType = 'HOME' | 'CALENDAR' | 'STATS' | 'MY';

export default function App() {
  const [token, setToken] = useState<string | null>('mock_token_for_preview'); // 기본 로그인 상태로 바로 화면 확인 가능
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isGoalCreateModal, setIsGoalCreateModal] = useState(false);
  const [nickname, setNickname] = useState('테스터');
  const [targetExam, setTargetExam] = useState('수능 수학 완성');

  const handleLoginSuccess = (accessToken: string) => {
    setToken(accessToken);
    setActiveTab('HOME');
  };

  const handleLogout = () => {
    setToken(null);
    setActiveTab('HOME');
  };

  if (!token) {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.phoneFrame}>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.webWrapper}>
      <View style={styles.phoneFrame}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* 1. 상단 공통 헤더 (다이나믹 아일랜드 & FlowPlan 로고 & 알림/프로필) */}
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
              <View style={styles.brandRow}>
                <Text style={styles.brandLogoIcon}>☘</Text>
                <Text style={styles.brandLogoText}>flowplan</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellBadge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileBadge}
                onPress={() => {
                  setIsGoalCreateModal(false);
                  setActiveTab('MY');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.profileText}>{nickname.charAt(0) || '테'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. 메인 컨텐츠 영역 */}
          <View style={styles.body}>
            {isGoalCreateModal ? (
              <GoalCreateScreen
                accessToken={token}
                onGoalCreated={() => {
                  setIsGoalCreateModal(false);
                  setActiveTab('CALENDAR');
                }}
                onCancel={() => setIsGoalCreateModal(false)}
              />
            ) : (
              <>
                {activeTab === 'HOME' && (
                  <HomeScreen
                    nickname={nickname}
                    targetExam={targetExam}
                    onNavigateToCalendar={() => setActiveTab('CALENDAR')}
                    onNavigateToGoalCreate={() => setIsGoalCreateModal(true)}
                  />
                )}
                {activeTab === 'CALENDAR' && (
                  <CalendarScreen
                    accessToken={token}
                    nickname={nickname}
                    targetExam={targetExam}
                    onNavigateToGoalCreate={() => setIsGoalCreateModal(true)}
                  />
                )}
                {activeTab === 'STATS' && <StatsScreen />}
                {activeTab === 'MY' && (
                  <MyPageScreen
                    nickname={nickname}
                    onLogout={handleLogout}
                    onNavigateToGoalCreate={() => setIsGoalCreateModal(true)}
                  />
                )}
              </>
            )}
          </View>

          {/* 3. 하단 5버튼 내비게이션 바 */}
          <View style={styles.bottomNav}>
            {/* 탭 1: 홈 */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('HOME');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.navIcon,
                  activeTab === 'HOME' && !isGoalCreateModal && styles.navIconActive,
                ]}
              >
                ⊞
              </Text>
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'HOME' && !isGoalCreateModal && styles.navLabelActive,
                ]}
              >
                홈
              </Text>
            </TouchableOpacity>

            {/* 탭 2: 캘린더 */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('CALENDAR');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.navIcon,
                  activeTab === 'CALENDAR' && !isGoalCreateModal && styles.navIconActive,
                ]}
              >
                📅
              </Text>
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'CALENDAR' && !isGoalCreateModal && styles.navLabelActive,
                ]}
              >
                캘린더
              </Text>
            </TouchableOpacity>

            {/* 중앙 플로팅 버튼: + 새 목표 */}
            <View style={styles.centerFabWrapper}>
              <TouchableOpacity
                style={styles.centerFab}
                onPress={() => setIsGoalCreateModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.fabPlus}>+</Text>
              </TouchableOpacity>
            </View>

            {/* 탭 3: 통계 */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('STATS');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.navIcon,
                  activeTab === 'STATS' && !isGoalCreateModal && styles.navIconActive,
                ]}
              >
                📊
              </Text>
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'STATS' && !isGoalCreateModal && styles.navLabelActive,
                ]}
              >
                통계
              </Text>
            </TouchableOpacity>

            {/* 탭 4: 마이 */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('MY');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.navIcon,
                  activeTab === 'MY' && !isGoalCreateModal && styles.navIconActive,
                ]}
              >
                👤
              </Text>
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'MY' && !isGoalCreateModal && styles.navLabelActive,
                ]}
              >
                마이
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    maxHeight: 920,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Platform.OS === 'web' ? 36 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    paddingRight: 12,
  },
  menuIcon: {
    fontSize: 20,
    color: '#334155',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoIcon: {
    fontSize: 20,
    color: '#4F46E5',
    marginRight: 6,
  },
  brandLogoText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  bellIcon: {
    fontSize: 18,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 6,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 2,
  },
  navIconActive: {
    color: '#4F46E5',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navLabelActive: {
    color: '#4F46E5',
  },
  centerFabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
});
