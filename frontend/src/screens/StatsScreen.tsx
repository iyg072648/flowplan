import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface DailyStatItem {
  day: string;
  date: string;
  minutes: number;
  isPeak: boolean;
}

interface GoalStatItem {
  id: string;
  name: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  progressPercent: number;
}

interface StatsData {
  period: 'WEEKLY' | 'MONTHLY';
  totalFocusedMinutes: number;
  totalFocusedFormatted: string;
  completedTasksCount: number;
  totalTasksCount: number;
  achievementRate: number;
  chartData: DailyStatItem[];
  maxChartMinutes: number;
  goalStats: GoalStatItem[];
  aiFeedback: {
    tag: string;
    title: string;
    body: string;
  };
}

interface StatsScreenProps {
  accessToken?: string;
  nickname?: string;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ accessToken, nickname }) => {
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBar, setSelectedBar] = useState<DailyStatItem | null>(null);

  // 기본 Fallback 데이터 (DB 미연결 또는 오프라인 환경 지원)
  const defaultWeeklyChart: DailyStatItem[] = [
    { day: '일', date: '2026-11-15', minutes: 45, isPeak: false },
    { day: '월', date: '2026-11-16', minutes: 75, isPeak: false },
    { day: '화', date: '2026-11-17', minutes: 60, isPeak: false },
    { day: '수', date: '2026-11-18', minutes: 120, isPeak: true },
    { day: '목', date: '2026-11-19', minutes: 90, isPeak: false },
    { day: '금', date: '2026-11-20', minutes: 35, isPeak: false },
    { day: '토', date: '2026-11-21', minutes: 50, isPeak: false },
  ];

  const defaultMonthlyChart: DailyStatItem[] = [
    { day: '1주', date: '11월 1주차', minutes: 340, isPeak: false },
    { day: '2주', date: '11월 2주차', minutes: 420, isPeak: false },
    { day: '3주', date: '11월 3주차', minutes: 510, isPeak: true },
    { day: '4주', date: '11월 4주차', minutes: 475, isPeak: false },
  ];

  const defaultGoals: GoalStatItem[] = [
    { id: 'g1', name: '수능 수능특강 문학 완독', color: '#4F46E5', totalTasks: 12, completedTasks: 8, remainingTasks: 4, progressPercent: 67 },
    { id: 'g2', name: '토익 850+ 단어 암기', color: '#10B981', totalTasks: 8, completedTasks: 5, remainingTasks: 3, progressPercent: 63 },
    { id: 'g3', name: '정보처리기사 실기 기출', color: '#F59E0B', totalTasks: 6, completedTasks: 2, remainingTasks: 4, progressPercent: 33 },
  ];

  const [stats, setStats] = useState<StatsData>({
    period: 'WEEKLY',
    totalFocusedMinutes: 475,
    totalFocusedFormatted: '7시간 55분',
    completedTasksCount: 15,
    totalTasksCount: 26,
    achievementRate: 58,
    chartData: defaultWeeklyChart,
    maxChartMinutes: 120,
    goalStats: defaultGoals,
    aiFeedback: {
      tag: 'AI STUDY INSIGHT • ON TRACK',
      title: '안정적인 페이스로 목표를 향해 나아가는 중이에요.',
      body: '계획의 절반 이상(58%)을 완수했습니다. 남은 과제들도 뽀모도로 타이머를 활용해 25분씩 나누어 진행하면 충분히 완료할 수 있습니다.',
    },
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stats/summary?period=${period}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStats(result.data);
          const peakItem = result.data.chartData?.find((item: DailyStatItem) => item.isPeak);
          setSelectedBar(peakItem || result.data.chartData?.[0] || null);
          return;
        }
      }
    } catch {
      // 오프라인 / 네트워크 미연결 시 로컬 fallback 반영
    } finally {
      setLoading(false);
    }

    // Fallback 모드 데이터 설정
    const chart = period === 'WEEKLY' ? defaultWeeklyChart : defaultMonthlyChart;
    const maxVal = period === 'WEEKLY' ? 120 : 510;
    const totalMin = period === 'WEEKLY' ? 475 : 1745;
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;

    setStats({
      period,
      totalFocusedMinutes: totalMin,
      totalFocusedFormatted: `${hours}시간 ${mins}분`,
      completedTasksCount: period === 'WEEKLY' ? 15 : 42,
      totalTasksCount: period === 'WEEKLY' ? 26 : 65,
      achievementRate: period === 'WEEKLY' ? 58 : 65,
      chartData: chart,
      maxChartMinutes: maxVal,
      goalStats: defaultGoals,
      aiFeedback: {
        tag: 'AI STUDY INSIGHT • ON TRACK',
        title: `${nickname ? nickname + ' 님, ' : ''}안정적인 페이스로 목표를 달성 중이에요!`,
        body: '꾸준한 뽀모도로 학습이 누적되어 높은 몰입도를 보이고 있습니다. 이번 주 최고 집중일의 흐름을 이어가보세요.',
      },
    });
    const peak = chart.find(c => c.isPeak) || chart[0];
    setSelectedBar(peak);
  }, [period, accessToken, nickname]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const maxMinutes = stats.maxChartMinutes || 60;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. 상단 타이틀 및 주간/월간 토글 */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.subTag}>LEARNING INSIGHTS</Text>
          <Text style={styles.title}>나의 학습 통계</Text>
          <Text style={styles.desc}>
            {nickname ? `${nickname} 님의 ` : ''}쌓여가는 시간 속에서 성장을 발견해요.
          </Text>
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, period === 'WEEKLY' && styles.toggleBtnActive]}
            onPress={() => setPeriod('WEEKLY')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, period === 'WEEKLY' && styles.toggleTextActive]}>
              주간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, period === 'MONTHLY' && styles.toggleBtnActive]}
            onPress={() => setPeriod('MONTHLY')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, period === 'MONTHLY' && styles.toggleTextActive]}>
              월간
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.loadingText}>최신 학습 통계를 집계하고 있습니다...</Text>
        </View>
      )}

      {/* 2. 핵심 요약 카드 2분할 */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.iconText}>⏱</Text>
          </View>
          <Text style={styles.cardLabel}>누적 집중 시간</Text>
          <Text style={styles.cardValue}>{stats.totalFocusedFormatted}</Text>
          <Text style={styles.cardSub}>
            {period === 'WEEKLY' ? '이번 주' : '이번 달'} 총 {stats.totalFocusedMinutes}분 몰입
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.iconBadge, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.cardLabel}>완료한 학습</Text>
          <Text style={styles.cardValue}>
            {stats.completedTasksCount}
            <Text style={styles.cardValueUnit}> / {stats.totalTasksCount}개</Text>
          </Text>
          <Text style={styles.cardSub}>차근차근 완수한 학습 과제들</Text>
        </View>
      </View>

      {/* 3. 목표 달성률 카드 */}
      <View style={styles.achievementCard}>
        <View style={styles.achievementTop}>
          <View style={[styles.iconBadge, { backgroundColor: '#FFEDD5' }]}>
            <Text style={styles.iconText}>🎯</Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.cardLabel}>종합 목표 달성률</Text>
            <Text style={styles.cardValueLarge}>{stats.achievementRate}%</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, stats.achievementRate))}%` },
            ]}
          />
        </View>
        <Text style={styles.cardSubText}>
          총 {stats.totalTasksCount}개의 계획 과제 중 {stats.completedTasksCount}개 완료 달성
        </Text>
      </View>

      {/* 4. 기간별 집중 시간 바 차트 */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTag}>FOCUS TIME TREND</Text>
            <Text style={styles.chartTitle}>
              {period === 'WEEKLY' ? '이번 주 일별 집중 시간' : '월간 주차별 집중 시간'}
            </Text>
          </View>
          <Text style={styles.unitText}>단위: 분 (클릭하여 상세 확인)</Text>
        </View>

        {/* 선택된 바 세부 정보 배너 */}
        {selectedBar && (
          <View style={styles.selectedBarTooltip}>
            <Text style={styles.tooltipDateText}>
              📅 {selectedBar.date} ({selectedBar.day})
            </Text>
            <Text style={styles.tooltipMinutesText}>
              집중 시간: <Text style={styles.tooltipHighlight}>{selectedBar.minutes}분</Text>
              {selectedBar.isPeak ? ' 🔥 (최고 집중일)' : ''}
            </Text>
          </View>
        )}

        <View style={styles.barChartWrapper}>
          {stats.chartData.map(item => {
            const barHeight = Math.max(
              8,
              Math.round((item.minutes / maxMinutes) * 110)
            );
            const isSelected = selectedBar?.date === item.date;

            return (
              <TouchableOpacity
                key={item.date || item.day}
                style={styles.barColumn}
                onPress={() => setSelectedBar(item)}
                activeOpacity={0.7}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: barHeight },
                      item.isPeak ? styles.barFillPeak : styles.barFillNormal,
                      isSelected && styles.barFillSelected,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    item.isPeak && styles.dayLabelPeak,
                    isSelected && styles.dayLabelSelected,
                  ]}
                >
                  {item.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. 목표별 세부 달성 현황 카드 */}
      <View style={styles.goalBreakdownCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTag}>GOAL PROGRESS</Text>
            <Text style={styles.chartTitle}>목표별 달성 현황</Text>
          </View>
          <Text style={styles.unitText}>{stats.goalStats.length}개 목표 진행 중</Text>
        </View>

        {stats.goalStats.map(goal => (
          <View key={goal.id} style={styles.goalItemCard}>
            <View style={styles.goalItemHeader}>
              <View style={styles.goalItemLeft}>
                <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
                <Text style={styles.goalItemName} numberOfLines={1}>
                  {goal.name}
                </Text>
              </View>
              <Text style={styles.goalItemPercent}>{goal.progressPercent}%</Text>
            </View>

            <View style={styles.goalProgressBarBg}>
              <View
                style={[
                  styles.goalProgressBarFill,
                  {
                    width: `${goal.progressPercent}%`,
                    backgroundColor: goal.color || '#4F46E5',
                  },
                ]}
              />
            </View>

            <View style={styles.goalItemFooter}>
              <Text style={styles.goalItemFooterText}>
                완료 {goal.completedTasks}개 / 잔여 {goal.remainingTasks}개
              </Text>
              <Text style={styles.goalItemTotalText}>총 {goal.totalTasks}개 과제</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 6. AI 맞춤 학습 피드백 카드 */}
      <View style={styles.aiFeedbackCard}>
        <View style={styles.sparkleBadge}>
          <Text style={styles.sparkleIcon}>✨</Text>
        </View>
        <View style={styles.aiFeedbackContent}>
          <Text style={styles.aiFeedbackTag}>{stats.aiFeedback.tag}</Text>
          <Text style={styles.aiFeedbackTitle}>{stats.aiFeedback.title}</Text>
          <Text style={styles.aiFeedbackBody}>{stats.aiFeedback.body}</Text>
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
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
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
    letterSpacing: -0.4,
  },
  desc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#4F46E5',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardValueUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  cardValueLarge: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  achievementTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  achievementInfo: {
    marginLeft: 12,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 5,
  },
  cardSubText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  chartTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  unitText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  selectedBarTooltip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  tooltipMinutesText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  tooltipHighlight: {
    fontWeight: '800',
    color: '#4F46E5',
  },
  barChartWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 110,
    width: 22,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barFillNormal: {
    backgroundColor: '#C7D2FE',
  },
  barFillPeak: {
    backgroundColor: '#4F46E5',
  },
  barFillSelected: {
    borderWidth: 2,
    borderColor: '#312E81',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
  },
  dayLabelPeak: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  dayLabelSelected: {
    color: '#312E81',
    fontWeight: '900',
  },
  goalBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  goalItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  goalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  goalItemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  goalItemPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
  goalProgressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalItemFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  goalItemTotalText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  aiFeedbackCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sparkleBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sparkleIcon: {
    fontSize: 18,
  },
  aiFeedbackContent: {
    flex: 1,
  },
  aiFeedbackTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  aiFeedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  aiFeedbackBody: {
    fontSize: 12,
    color: '#14532D',
    lineHeight: 18,
  },
});
