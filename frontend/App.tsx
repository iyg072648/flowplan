import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { GoalCreateScreen } from './src/screens/GoalCreateScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { MyPageScreen } from './src/screens/MyPageScreen';

type TabType = 'HOME' | 'CALENDAR' | 'STATS' | 'MY';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860; // 860px 이상이면 데스크톱 PC 레이아웃으로 전환

  const [token, setToken] = useState<string | null>('mock_token_for_preview'); // 기본 로그인 상태
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
        <View style={isDesktop ? styles.desktopLoginFrame : styles.phoneFrame}>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </View>
      </View>
    );
  }

  // 메인 스크린 렌더링 헬퍼
  const renderCurrentScreen = () => {
    if (isGoalCreateModal) {
      return (
        <GoalCreateScreen
          accessToken={token}
          onGoalCreated={() => {
            setIsGoalCreateModal(false);
            setActiveTab('CALENDAR');
          }}
          onCancel={() => setIsGoalCreateModal(false)}
        />
      );
    }

    switch (activeTab) {
      case 'HOME':
        return (
          <HomeScreen
            nickname={nickname}
            targetExam={targetExam}
            onNavigateToCalendar={() => setActiveTab('CALENDAR')}
            onNavigateToGoalCreate={() => setIsGoalCreateModal(true)}
          />
        );
      case 'CALENDAR':
        return (
          <CalendarScreen
            accessToken={token}
            nickname={nickname}
            targetExam={targetExam}
            onNavigateToGoalCreate={() => setIsGoalCreateModal(true)}
          />
        );
      case 'STATS':
        return <StatsScreen />;
      case 'MY':
        return (
          <MyPageScreen
            nickname={nickname}
            onLogout={handleLogout}
            onNavigateToGoalCreate={() => setIsGoalCreateModal(true)}
          />
        );
      default:
        return null;
    }
  };

  // 1. 데스크톱 레이아웃 (좌측 사이드바 + 메인 워크스페이스 그리드)
  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <StatusBar barStyle="dark-content" />

        {/* 좌측 사이드바 네비게이션 */}
        <View style={styles.desktopSidebar}>
          {/* 상단 로고 */}
          <View style={styles.desktopBrandArea}>
            <View style={styles.brandLogoCircle}>
              <Text style={styles.brandLogoIcon}>✦</Text>
            </View>
            <View>
              <Text style={styles.brandLogoText}>flowplan</Text>
              <Text style={styles.desktopSubBrand}>Study Management</Text>
            </View>
          </View>

          {/* 새 목표 추가 액션 버튼 */}
          <TouchableOpacity
            style={styles.desktopAddGoalBtn}
            onPress={() => setIsGoalCreateModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.desktopAddGoalIcon}>＋</Text>
            <Text style={styles.desktopAddGoalText}>새 목표 시작하기</Text>
          </TouchableOpacity>

          {/* 사이드바 메뉴 네비게이션 */}
          <View style={styles.desktopNavList}>
            <TouchableOpacity
              style={[
                styles.desktopNavItem,
                activeTab === 'HOME' && !isGoalCreateModal && styles.desktopNavItemActive,
              ]}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('HOME');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.desktopNavIcon,
                  activeTab === 'HOME' && !isGoalCreateModal && styles.desktopNavIconActive,
                ]}
              >
                ⊞
              </Text>
              <Text
                style={[
                  styles.desktopNavText,
                  activeTab === 'HOME' && !isGoalCreateModal && styles.desktopNavTextActive,
                ]}
              >
                대시보드 홈
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.desktopNavItem,
                activeTab === 'CALENDAR' && !isGoalCreateModal && styles.desktopNavItemActive,
              ]}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('CALENDAR');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.desktopNavIcon,
                  activeTab === 'CALENDAR' && !isGoalCreateModal && styles.desktopNavIconActive,
                ]}
              >
                📅
              </Text>
              <Text
                style={[
                  styles.desktopNavText,
                  activeTab === 'CALENDAR' && !isGoalCreateModal && styles.desktopNavTextActive,
                ]}
              >
                학습 캘린더
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.desktopNavItem,
                activeTab === 'STATS' && !isGoalCreateModal && styles.desktopNavItemActive,
              ]}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('STATS');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.desktopNavIcon,
                  activeTab === 'STATS' && !isGoalCreateModal && styles.desktopNavIconActive,
                ]}
              >
                📊
              </Text>
              <Text
                style={[
                  styles.desktopNavText,
                  activeTab === 'STATS' && !isGoalCreateModal && styles.desktopNavTextActive,
                ]}
              >
                학습 통계 및 분석
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.desktopNavItem,
                activeTab === 'MY' && !isGoalCreateModal && styles.desktopNavItemActive,
              ]}
              onPress={() => {
                setIsGoalCreateModal(false);
                setActiveTab('MY');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.desktopNavIcon,
                  activeTab === 'MY' && !isGoalCreateModal && styles.desktopNavIconActive,
                ]}
              >
                👤
              </Text>
              <Text
                style={[
                  styles.desktopNavText,
                  activeTab === 'MY' && !isGoalCreateModal && styles.desktopNavTextActive,
                ]}
              >
                마이페이지
              </Text>
            </TouchableOpacity>
          </View>

          {/* 사이드바 하단 유저 프로필 카드 */}
          <View style={styles.desktopUserCard}>
            <View style={styles.profileBadge}>
              <Text style={styles.profileText}>{nickname.charAt(0) || '테'}</Text>
            </View>
            <View style={styles.desktopUserInfo}>
              <Text style={styles.desktopUserName}>{nickname} 님</Text>
              <Text style={styles.desktopUserRole}>Pro Learner</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.desktopLogoutBtn}>
              <Text style={styles.desktopLogoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 우측 메인 콘텐츠 영역 */}
        <View style={styles.desktopMainArea}>
          {/* 데스크톱 상단 글로벌 헤더 */}
          <View style={styles.desktopHeader}>
            <View style={styles.desktopHeaderLeft}>
              <Text style={styles.desktopBreadcrumb}>
                워크스페이스 &gt;{' '}
                <Text style={styles.desktopBreadcrumbActive}>
                  {isGoalCreateModal
                    ? '새 목표 생성'
                    : activeTab === 'HOME'
                    ? '대시보드'
                    : activeTab === 'CALENDAR'
                    ? '학습 캘린더'
                    : activeTab === 'STATS'
                    ? '학습 통계'
                    : '마이페이지'}
                </Text>
              </Text>
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

          {/* 대시보드 메인 뷰포트 (최대 너비 1200px 중앙 정렬 컨테이너) */}
          <View style={styles.desktopContentContainer}>
            {renderCurrentScreen()}
          </View>
        </View>
      </View>
    );
  }

  // 2. 모바일 레이아웃 (세로형 스마트폰 & 태블릿 세로 뷰)
  return (
    <View style={styles.webWrapper}>
      <View style={styles.phoneFrame}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* 상단 모바일 헤더 */}
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
              <View style={styles.brandRow}>
                <View style={styles.brandLogoCircle}>
                  <Text style={styles.brandLogoIcon}>✦</Text>
                </View>
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

          {/* 메인 컨텐츠 영역 */}
          <View style={styles.body}>
            {renderCurrentScreen()}
          </View>

          {/* 하단 5버튼 내비게이션 바 */}
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
  // --- 데스크톱 PC 레이아웃 스타일 ---
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  desktopSidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  desktopBrandArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  desktopSubBrand: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  desktopAddGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  desktopAddGoalIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 6,
  },
  desktopAddGoalText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  desktopNavList: {
    flex: 1,
    gap: 6,
  },
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  desktopNavItemActive: {
    backgroundColor: '#EEF2FF',
  },
  desktopNavIcon: {
    fontSize: 18,
    color: '#64748B',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  desktopNavIconActive: {
    color: '#4F46E5',
  },
  desktopNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  desktopNavTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  desktopUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  desktopUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  desktopUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  desktopUserRole: {
    fontSize: 11,
    color: '#94A3B8',
  },
  desktopLogoutBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  desktopLogoutText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  desktopMainArea: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  desktopHeader: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  desktopHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopBreadcrumb: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  desktopBreadcrumbActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  desktopContentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
  },
  desktopLoginFrame: {
    width: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },

  // --- 모바일 프레임 및 공통 스타일 ---
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC', // 검은색 빈 공간을 완전히 제거하고 앱 전체와 동일한 미색 배경으로 통일
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 0, // 상하좌우 불필요한 외부 여백 제거
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 480, // 모바일 뷰포트 최대 너비
    height: '100%',
    maxHeight: '100%', // 브라우저 창 바닥까지 100% 꽉 채움
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderWidth: 0, // 외부 테두리 제거하여 모바일 앱 화면과 완전히 일체화
    borderRadius: 0, // 하단 및 전체 모서리를 직각으로 평평하게 처리하여 빈 공간 발생 방지
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 0,
    overflow: 'hidden',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#F8FAFC', // 바디 배경과 매끄럽게 연결되는 오프화이트 미색
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
  },
  menuIcon: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  brandLogoIcon: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '900',
  },
  brandLogoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
  },
  bellIcon: {
    fontSize: 17,
  },
  bellBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F97316',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
  },
  profileText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B21A8',
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginHorizontal: 0, // 좌우 여백 없이 화면 폭에 100% 밀착
    marginBottom: 0, // 아래쪽 여백 없이 최하단(bottom: 0)에 고정
    paddingHorizontal: 8,
    paddingBottom: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 19,
    color: '#94A3B8',
    marginBottom: 3,
  },
  navIconActive: {
    color: '#4F46E5',
    transform: [{ scale: 1.08 }],
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  navLabelActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  centerFabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24, // 네비게이션 바 위쪽 중앙에 자연스럽게 걸쳐 있는 형태
  },
  centerFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
    marginTop: -2,
  },
});
