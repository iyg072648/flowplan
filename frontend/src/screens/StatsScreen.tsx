import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export const StatsScreen: React.FC = () => {
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  const weeklyData = [
    { day: '일', minutes: 45, isPeak: false },
    { day: '월', minutes: 75, isPeak: false },
    { day: '화', minutes: 60, isPeak: false },
    { day: '수', minutes: 120, isPeak: true },
    { day: '목', minutes: 90, isPeak: false },
    { day: '금', minutes: 35, isPeak: false },
    { day: '토', minutes: 25, isPeak: false },
  ];

  const maxMinutes = 120;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. 상단 타이틀 및 주간/월간 토글 */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.subTag}>LEARNING INSIGHTS</Text>
          <Text style={styles.title}>나의 학습 통계</Text>
          <Text style={styles.desc}>쌓여가는 시간 속에서 나의 성장을 발견해요.</Text>
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, period === 'WEEKLY' && styles.toggleBtnActive]}
            onPress={() => setPeriod('WEEKLY')}
          >
            <Text style={[styles.toggleText, period === 'WEEKLY' && styles.toggleTextActive]}>
              주간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, period === 'MONTHLY' && styles.toggleBtnActive]}
            onPress={() => setPeriod('MONTHLY')}
          >
            <Text style={[styles.toggleText, period === 'MONTHLY' && styles.toggleTextActive]}>
              월간
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. 핵심 요약 카드 2분할 */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.iconText}>⏱</Text>
          </View>
          <Text style={styles.cardLabel}>누적 집중 시간</Text>
          <Text style={styles.cardValue}>0시간 35분</Text>
          <Text style={styles.cardSub}>오늘도 집중한 시간이 쌓이고 있어요</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.iconBadge, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.cardLabel}>완료한 학습</Text>
          <Text style={styles.cardValue}>1개</Text>
          <Text style={styles.cardSub}>차근차근 끝낸 학습의 기록</Text>
        </View>
      </View>

      {/* 3. 오늘의 달성률 카드 */}
      <View style={styles.achievementCard}>
        <View style={[styles.iconBadge, { backgroundColor: '#FFEDD5' }]}>
          <Text style={styles.iconText}>🎯</Text>
        </View>
        <Text style={styles.cardLabel}>오늘의 달성률</Text>
        <Text style={styles.cardValueLarge}>25%</Text>
        <Text style={styles.cardSub}>오늘 계획한 4개의 할 일 중</Text>
      </View>

      {/* 4. 이번 주 집중 시간 바 차트 */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTag}>FOCUS TIME</Text>
            <Text style={styles.chartTitle}>이번 주 집중 시간</Text>
          </View>
          <Text style={styles.unitText}>단위: 분</Text>
        </View>

        <View style={styles.barChartWrapper}>
          {weeklyData.map(item => {
            const barHeight = Math.round((item.minutes / maxMinutes) * 110);
            return (
              <View key={item.day} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: barHeight },
                      item.isPeak ? styles.barFillPeak : styles.barFillNormal,
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, item.isPeak && styles.dayLabelPeak]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 5. 목표 달성률 게이지 카드 */}
      <View style={styles.goalCompletionCard}>
        <Text style={styles.chartTag}>GOAL COMPLETION</Text>
        <Text style={styles.chartTitle}>목표 달성률</Text>

        <View style={styles.donutGaugeWrapper}>
          <View style={styles.donutOuter}>
            <View style={styles.donutInner}>
              <Text style={styles.donutPercent}>25%</Text>
              <Text style={styles.donutSub}>오늘의 달성률</Text>
            </View>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>완료한 학습 1개</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E2E8F0' }]} />
            <Text style={styles.legendText}>남은 학습 3개</Text>
          </View>
        </View>
      </View>

      {/* 6. AI 학습 피드백 카드 */}
      <View style={styles.aiFeedbackCard}>
        <View style={styles.sparkleBadge}>
          <Text style={styles.sparkleIcon}>✨</Text>
        </View>
        <View style={styles.aiFeedbackContent}>
          <Text style={styles.aiFeedbackTag}>AI STUDY FEEDBACK • DEMO</Text>
          <Text style={styles.aiFeedbackTitle}>꾸준함이 가장 큰 실력이에요.</Text>
          <Text style={styles.aiFeedbackBody}>
            현재 1개의 학습을 완료했어요. 집중한 시간을 기록하고 나에게 잘 맞는 학습 패턴을 찾아보세요.
          </Text>
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
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
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
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 4,
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
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardValueLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
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
    marginBottom: 20,
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
    width: 20,
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
  goalCompletionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  donutGaugeWrapper: {
    marginVertical: 18,
  },
  donutOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#10B981',
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  donutInner: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercent: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  donutSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
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

