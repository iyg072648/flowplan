import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Task {
  id: string;
  title: string;
  goalName: string;
  goalColor: string;
  durationMinutes: number;
  isDone: boolean;
}

interface HomeScreenProps {
  nickname: string;
  targetExam: string;
  onNavigateToCalendar: () => void;
  onNavigateToGoalCreate: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  nickname,
  targetExam,
  onNavigateToCalendar,
  onNavigateToGoalCreate,
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: '수학 Ⅰ • 지수와 로그 개념 정리',
      goalName: '수능 수학 완성',
      goalColor: '#10B981',
      durationMinutes: 50,
      isDone: true,
    },
    {
      id: 'task-2',
      title: '영어 단어 Day 12 암기',
      goalName: '매일 영어 루틴',
      goalColor: '#8B5CF6',
      durationMinutes: 25,
      isDone: false,
    },
    {
      id: 'task-3',
      title: '수능 국어 독서 기출 분석 1지문',
      goalName: '수능 국어 완성',
      goalColor: '#F59E0B',
      durationMinutes: 40,
      isDone: false,
    },
    {
      id: 'task-4',
      title: '수학 Ⅰ • 지수함수 필수 예제 풀이',
      goalName: '수능 수학 완성',
      goalColor: '#10B981',
      durationMinutes: 45,
      isDone: false,
    },
  ]);

  const [delayedCount, setDelayedCount] = useState(1);

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, isDone: !t.isDone } : t))
    );
  };

  const completedCount = tasks.filter(t => t.isDone).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. 상단 환영 섹션 */}
      <View style={styles.welcomeSection}>
        <Text style={styles.subTag}>YOUR LEARNING SPACE</Text>
        <Text style={styles.greetingTitle}>
          {nickname}님, 오늘도 잘 해낼 거예요 ✨
        </Text>
        <Text style={styles.greetingDesc}>
          차근차근, 나만의 속도로 목표에 가까워져요.
        </Text>
      </View>

      {/* 2. Today's Focus 히어로 카드 (보라/인디고 다크 톤) */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <View style={styles.focusPill}>
            <View style={styles.focusDot} />
            <Text style={styles.focusPillText}>TODAY'S FOCUS</Text>
          </View>
          <Text style={styles.heroTitle}>
            오늘의 작은 성취가{'\n'}내일의 나를 만들어요.
          </Text>
          <Text style={styles.heroSubtext}>
            오늘 할 일 <Text style={styles.heroBold}>{totalCount}개</Text> 중{' '}
            <Text style={styles.heroBold}>{completedCount}개</Text>를 완료했어요.
          </Text>

          <TouchableOpacity style={styles.planBtn} onPress={onNavigateToCalendar} activeOpacity={0.85}>
            <Text style={styles.planBtnText}>오늘의 계획 보기</Text>
            <Text style={styles.planBtnArrow}>➔</Text>
          </TouchableOpacity>
        </View>

        {/* 원형 게이지 비주얼 */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeOuterCircle}>
            <View style={styles.gaugeInnerCircle}>
              <Text style={styles.gaugeLabel}>오늘의 달성률</Text>
              <Text style={styles.gaugePercent}>{progressPercent}%</Text>
              <View style={styles.gaugeBarBackground}>
                <View style={[styles.gaugeBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 3. 밀린 학습 알림 배너 */}
      {delayedCount > 0 && (
        <View style={styles.rescheduleBanner}>
          <View style={styles.clockBadge}>
            <Text style={styles.clockIcon}>⏱</Text>
          </View>
          <View style={styles.rescheduleContent}>
            <Text style={styles.rescheduleTitle}>밀린 학습이 {delayedCount}개 있어요</Text>
            <Text style={styles.rescheduleDesc}>
              괜찮아요. 남은 일정에 맞게 다시 계획해 볼까요?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rescheduleAction}
            onPress={onNavigateToCalendar}
            activeOpacity={0.8}
          >
            <Text style={styles.rescheduleActionText}>일정 재조정하기 ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. 오늘의 할 일 (Daily Plan) */}
      <View style={styles.dailySection}>
        <View style={styles.dailyHeader}>
          <View>
            <Text style={styles.subTag}>DAILY PLAN</Text>
            <View style={styles.dailyTitleRow}>
              <Text style={styles.dailyTitle}>오늘의 할 일</Text>
              <View style={styles.taskCountBadge}>
                <Text style={styles.taskCountText}>{totalCount}</Text>
              </View>
            </View>
            <Text style={styles.dailyDesc}>
              하나씩 완료하며 오늘의 흐름을 만들어 보세요.
            </Text>
          </View>
          <TouchableOpacity onPress={onNavigateToCalendar}>
            <Text style={styles.viewAllText}>전체 일정 보기 ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Task 목록 카드 */}
        <View style={styles.taskCardList}>
          {tasks.map((task, idx) => (
            <View key={task.id}>
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    task.isDone && styles.checkboxChecked,
                  ]}
                >
                  {task.isDone && <Text style={styles.checkIcon}>✓</Text>}
                </View>

                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.isDone && styles.taskTitleDone,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <View style={styles.taskMetaRow}>
                    <View
                      style={[
                        styles.goalColorDot,
                        { backgroundColor: task.goalColor },
                      ]}
                    />
                    <Text style={styles.goalNameText}>{task.goalName}</Text>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.durationText}>⏱ {task.durationMinutes}분</Text>
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              {idx < tasks.length - 1 && <View style={styles.taskDivider} />}
            </View>
          ))}
        </View>
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
  welcomeSection: {
    marginBottom: 20,
  },
  subTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  greetingDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  heroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  focusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  focusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E0E7FF',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 12,
    color: '#C7D2FE',
    marginBottom: 14,
  },
  heroBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  planBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E1B4B',
    marginRight: 6,
  },
  planBtnArrow: {
    fontSize: 12,
    color: '#1E1B4B',
    fontWeight: '700',
  },
  gaugeContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeOuterCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(49, 46, 129, 0.6)',
  },
  gaugeInnerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    fontSize: 9,
    color: '#C7D2FE',
    marginBottom: 2,
  },
  gaugePercent: {
    fontSize: 20,
    fontWeight: '900',
    color: '#34D399',
    marginBottom: 4,
  },
  gaugeBarBackground: {
    width: 44,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    backgroundColor: '#34D399',
  },
  rescheduleBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  clockBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clockIcon: {
    fontSize: 16,
  },
  rescheduleContent: {
    flex: 1,
  },
  rescheduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  rescheduleDesc: {
    fontSize: 11,
    color: '#B45309',
  },
  rescheduleAction: {
    marginLeft: 8,
  },
  rescheduleActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  dailySection: {
    marginBottom: 20,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dailyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  taskCountBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  dailyDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    paddingTop: 16,
  },
  taskCardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  goalNameText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metaSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
  },
  chevron: {
    fontSize: 18,
    color: '#CBD5E1',
    marginLeft: 10,
  },
  taskDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
});

