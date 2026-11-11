import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface MyPageScreenProps {
  nickname: string;
  onLogout: () => void;
  onNavigateToGoalCreate: () => void;
}

export const MyPageScreen: React.FC<MyPageScreenProps> = ({
  nickname,
  onLogout,
  onNavigateToGoalCreate,
}) => {
  const goals = [
    {
      id: 'g-1',
      title: '수능 수학 완성',
      desc: '수학 Ⅰ • 수학 Ⅱ • 미적분 • 12월 29일까지',
      color: '#10B981',
      bg: '#DCFCE7',
    },
    {
      id: 'g-2',
      title: '매일 영어 루틴',
      desc: '단어 암기 및 독해 연습 • 12월 11일까지',
      color: '#8B5CF6',
      bg: '#EDE9FE',
    },
    {
      id: 'g-3',
      title: '수능 국어 완성',
      desc: '문학 • 비문학 기출 • 1월 10일까지',
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. 상단 타이틀 */}
      <View style={styles.titleSection}>
        <Text style={styles.subTag}>MY SPACE</Text>
        <Text style={styles.title}>마이페이지</Text>
        <Text style={styles.desc}>나의 목표와 학습 정보를 관리해요.</Text>
      </View>

      {/* 2. 프로필 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{nickname.charAt(0) || '테'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.learnerTag}>FLOWPLAN LEARNER</Text>
          <Text style={styles.nickname}>{nickname} 님</Text>
          <Text style={styles.motto}>매일 조금씩, 나만의 속도로 성장 중</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
          <Text style={styles.editBtnText}>✏️ 이름 변경</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 내 목표 목록 */}
      <View style={styles.goalsCard}>
        <View style={styles.goalsHeader}>
          <Text style={styles.goalsTitle}>
            내 목표 <Text style={styles.goalsCount}>{goals.length}</Text>
          </Text>
        </View>

        {goals.map((goal, idx) => (
          <View key={goal.id}>
            <View style={styles.goalItem}>
              <View style={[styles.bookBadge, { backgroundColor: goal.bg }]}>
                <Text style={[styles.bookIcon, { color: goal.color }]}>📖</Text>
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitleText}>{goal.title}</Text>
                <Text style={styles.goalDescText}>{goal.desc}</Text>
              </View>
            </View>
            {idx < goals.length - 1 && <View style={styles.goalDivider} />}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addGoalBtn}
          onPress={onNavigateToGoalCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.addGoalBtnText}>+ 새 목표 추가하기</Text>
        </TouchableOpacity>
      </View>

      {/* 4. 계정 설정 카드 */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>계정 설정</Text>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingRowLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingText}>알림 설정</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingDivider} />

        <TouchableOpacity style={styles.settingRow} onPress={onLogout} activeOpacity={0.7}>
          <View style={styles.settingRowLeft}>
            <Text style={styles.settingIcon}>🚪</Text>
            <Text style={[styles.settingText, { color: '#EF4444' }]}>로그아웃</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  subTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: '#64748B',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
  },
  profileInfo: {
    flex: 1,
  },
  learnerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1,
    marginBottom: 3,
  },
  nickname: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  motto: {
    fontSize: 11,
    color: '#94A3B8',
  },
  editBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  goalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  goalsHeader: {
    marginBottom: 12,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  goalsCount: {
    color: '#4F46E5',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bookBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookIcon: {
    fontSize: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  goalDescText: {
    fontSize: 11,
    color: '#64748B',
  },
  goalDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  addGoalBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  addGoalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  settingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  chevron: {
    fontSize: 18,
    color: '#CBD5E1',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 4,
  },
});

