import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

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

  // 컴포넌트 조각들
  const renderFocusHeroCard = () => (
    <View style={[styles.heroCard, isDesktop && styles.heroCardDesktop]}>
      <View style={styles.heroLeft}>
        <View style={styles.focusPill}>
          <View style={styles.focusDot} />
          <Text style={styles.focusPillText}>TODAY'S FOCUS</Text>
        </View>
        <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
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

      {/* 우측 원형 달성률 비주얼 (동심원 레이어) */}
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeRippleRing}>
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
    </View>
  );

  const renderRescheduleBanner = () => (
    delayedCount > 0 ? (
      <View style={[styles.rescheduleBanner, isDesktop && styles.rescheduleBannerDesktop]}>
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
    ) : null
  );

  const renderDailyTasksCard = () => (
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
  );

  // 데스크톱 사이드 패널 보너스 위젯 (주간 통계 및 AI 코칭 팁)
  const renderWeeklySummaryWidget = () => (
    <View style={styles.desktopSideWidget}>
      <View style={styles.sideWidgetHeader}>
        <Text style={styles.sideWidgetTitle}>이번 주 집중 현황</Text>
        <TouchableOpacity onPress={onNavigateToCalendar}>
          <Text style={styles.sideWidgetLink}>상세 분석 ➔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statMetricRow}>
        <View style={styles.statMetricBox}>
          <Text style={styles.statMetricValue}>0h 35m</Text>
          <Text style={styles.statMetricLabel}>오늘 집중 시간</Text>
        </View>
        <View style={styles.statMetricDivider} />
        <View style={styles.statMetricBox}>
          <Text style={styles.statMetricValue}>3일 연속</Text>
          <Text style={styles.statMetricLabel}>학습 스트릭</Text>
        </View>
      </View>

      {/* 요일별 달성 미니 스트릭 뱃지 */}
      <View style={styles.weekStreakRow}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => {
          const isToday = i === 6; // 토요일
          const isPastDone = i >= 3 && i <= 5; // 수, 목, 금 완료
          return (
            <View key={day} style={styles.streakCol}>
              <View
                style={[
                  styles.streakDot,
                  isPastDone && styles.streakDotDone,
                  isToday && styles.streakDotToday,
                ]}
              >
                {isPastDone && <Text style={styles.streakCheck}>✓</Text>}
                {isToday && <View style={styles.streakPulse} />}
              </View>
              <Text style={[styles.streakDayText, isToday && styles.streakDayTextToday]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderAiInsightWidget = () => (
    <View style={styles.aiInsightCard}>
      <View style={styles.aiInsightHeader}>
        <View style={styles.aiSparkleBadge}>
          <Text style={styles.aiSparkleIcon}>✦</Text>
        </View>
        <Text style={styles.aiInsightTitle}>AI 스터디 인사이트</Text>
      </View>
      <Text style={styles.aiInsightText}>
        현재 목표인 <Text style={styles.aiHighlight}>{targetExam}</Text> 진도율이 순조롭습니다.
        지수함수 필수 예제 풀이를 오늘 완료하면 주간 달성률이 85%에 도달해요!
      </Text>
      <TouchableOpacity
        style={styles.aiActionButton}
        onPress={onNavigateToGoalCreate}
        activeOpacity={0.8}
      >
        <Text style={styles.aiActionText}>새 목표 추가하기 ➔</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop,
      ]}
    >
      {/* 1. 상단 환영 섹션 */}
      <View style={[styles.welcomeSection, isDesktop && styles.welcomeSectionDesktop]}>
        <View>
          <Text style={styles.subTag}>YOUR LEARNING SPACE</Text>
          <Text style={[styles.greetingTitle, isDesktop && styles.greetingTitleDesktop]}>
            {nickname}님, 오늘도 잘 해낼 거예요 ✨
          </Text>
          <Text style={styles.greetingDesc}>
            차근차근, 나만의 속도로 목표에 가까워져요.
          </Text>
        </View>
        {isDesktop && (
          <View style={styles.desktopDateBadge}>
            <Text style={styles.desktopDateText}>📅 2026. 11. 14 (토) | 목표 D-27</Text>
          </View>
        )}
      </View>

      {/* 2. 메인 대시보드 레이아웃 (데스크톱: 2열 그리드, 모바일: 1열 스택) */}
      {isDesktop ? (
        <View style={styles.desktopGridRow}>
          {/* 좌측 메인 컬럼 (Focus 카드 + Daily Plan) */}
          <View style={styles.desktopMainCol}>
            {renderFocusHeroCard()}
            {renderDailyTasksCard()}
          </View>

          {/* 우측 사이드 컬럼 (알림 배너 + 주간 위젯 + AI 인사이트) */}
          <View style={styles.desktopSideCol}>
            {renderRescheduleBanner()}
            {renderWeeklySummaryWidget()}
            {renderAiInsightWidget()}
          </View>
        </View>
      ) : (
        /* 모바일 1열 스택 흐름 */
        <View style={styles.mobileStack}>
          {renderFocusHeroCard()}
          {renderRescheduleBanner()}
          {renderDailyTasksCard()}
        </View>
      )}
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
    paddingTop: 12,
    paddingBottom: 110, // 플로팅 하단 네비게이션 바에 가려지지 않도록 넉넉한 하단 스크롤 안전 영역 확보
  },
  contentDesktop: {
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 48,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeSectionDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  desktopDateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  desktopDateText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  desktopGridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  desktopMainCol: {
    flex: 1.55,
    gap: 20,
  },
  desktopSideCol: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },
  mobileStack: {
    gap: 16,
  },
  subTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  greetingTitleDesktop: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  greetingDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 24, // 카드 곡률 통일 (24px)
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  heroCardDesktop: {
    padding: 26,
    marginBottom: 0,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  focusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  focusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E0E7FF',
    letterSpacing: 1.0,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 27,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroTitleDesktop: {
    fontSize: 21,
    lineHeight: 30,
  },
  heroSubtext: {
    fontSize: 12.5,
    color: '#C7D2FE',
    marginBottom: 16,
    lineHeight: 17,
  },
  heroBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  planBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E1B4B',
    marginRight: 6,
  },
  planBtnArrow: {
    fontSize: 12,
    color: '#1E1B4B',
    fontWeight: '800',
  },
  gaugeContainer: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeRippleRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeOuterCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 5,
    borderColor: 'rgba(99, 102, 241, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(49, 46, 129, 0.7)',
  },
  gaugeInnerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#C7D2FE',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  gaugePercent: {
    fontSize: 19,
    fontWeight: '900',
    color: '#34D399',
    marginBottom: 4,
  },
  gaugeBarBackground: {
    width: 44,
    height: 3.5,
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
    borderRadius: 24, // 카드 곡률 통일 (24px)
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  rescheduleBannerDesktop: {
    marginBottom: 0,
  },
  desktopSideWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  sideWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sideWidgetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sideWidgetLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  statMetricBox: {
    alignItems: 'center',
  },
  statMetricValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#4F46E5',
    marginBottom: 2,
  },
  statMetricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  weekStreakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  streakCol: {
    alignItems: 'center',
    gap: 6,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDotDone: {
    backgroundColor: '#4F46E5',
  },
  streakDotToday: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  streakCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  streakPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  streakDayText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  streakDayTextToday: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  aiInsightCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiSparkleBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiSparkleIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  aiInsightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5B21B6',
  },
  aiInsightText: {
    fontSize: 12.5,
    color: '#6D28D9',
    lineHeight: 18,
    marginBottom: 14,
  },
  aiHighlight: {
    fontWeight: '800',
    color: '#4C1D95',
  },
  aiActionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#6D28D9',
  },
  clockBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clockIcon: {
    fontSize: 18,
  },
  rescheduleContent: {
    flex: 1,
  },
  rescheduleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  rescheduleDesc: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  rescheduleAction: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
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
    marginBottom: 14,
  },
  dailyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dailyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
    letterSpacing: -0.3,
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
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    paddingTop: 16,
  },
  taskCardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // 카드 곡률 통일 (24px)
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
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
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.2,
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  goalNameText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  metaSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  durationText: {
    fontSize: 11.5,
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

