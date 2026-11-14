import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export interface TaskItem {
  id: string;
  title: string;
  duration_minutes: number;
  scheduled_date: string;
  is_done: boolean;
  goal_name?: string;
  goal_color?: string;
}

interface CalendarScreenProps {
  accessToken: string;
  nickname: string;
  targetExam: string;
  onNavigateToGoalCreate?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  accessToken,
  nickname,
  targetExam,
  onNavigateToGoalCreate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 11)); // 2026년 11월 11일 기준
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-11');

  // Task 목록 (다양한 날짜와 목표 색상)
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: '수학 Ⅰ • 지수와 로그 개념 정리',
      duration_minutes: 50,
      scheduled_date: '2026-11-11',
      is_done: true,
      goal_name: '수능 수학 완성',
      goal_color: '#10B981',
    },
    {
      id: 'task-2',
      title: '영어 단어 Day 12 암기',
      duration_minutes: 25,
      scheduled_date: '2026-11-11',
      is_done: false,
      goal_name: '매일 영어 루틴',
      goal_color: '#8B5CF6',
    },
    {
      id: 'task-3',
      title: '수능 국어 독서 기출 분석 1지문',
      duration_minutes: 40,
      scheduled_date: '2026-11-11',
      is_done: false,
      goal_name: '수능 국어 완성',
      goal_color: '#F59E0B',
    },
    {
      id: 'task-4',
      title: '수학 Ⅰ • 지수함수 필수 예제 풀이',
      duration_minutes: 45,
      scheduled_date: '2026-11-12',
      is_done: false,
      goal_name: '수능 수학 완성',
      goal_color: '#10B981',
    },
    {
      id: 'task-5',
      title: '영어 독해 3문항 오답 정리',
      duration_minutes: 30,
      scheduled_date: '2026-11-10',
      is_done: true,
      goal_name: '매일 영어 루틴',
      goal_color: '#8B5CF6',
    },
    {
      id: 'task-6',
      title: '국어 문법 핵심 요약',
      duration_minutes: 35,
      scheduled_date: '2026-11-13',
      is_done: false,
      goal_name: '수능 국어 완성',
      goal_color: '#8B5CF6',
    },
  ]);

  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, is_done: !t.is_done } : t))
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const today = new Date(2026, 10, 11);
    setCurrentDate(today);
    setSelectedDateStr('2026-11-11');
  };

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let d = 1; d <= lastDate; d++) daysArray.push(d);

  const selectedDateTasks = tasks.filter(t => t.scheduled_date === selectedDateStr);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. 상단 타이틀 & + 새 목표 버튼 */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.subTag}>YOUR STUDY SCHEDULE</Text>
          <Text style={styles.title}>학습 캘린더</Text>
          <Text style={styles.desc}>하루하루의 계획이 쌓여 목표를 이뤄요.</Text>
        </View>
        {onNavigateToGoalCreate && (
          <TouchableOpacity
            style={styles.newGoalBtn}
            onPress={onNavigateToGoalCreate}
            activeOpacity={0.85}
          >
            <Text style={styles.newGoalBtnText}>+ 새 목표</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. 미완료 학습 안내 배너 */}
      <View style={styles.rescheduleBanner}>
        <View style={styles.clockBadge}>
          <Text style={styles.clockIcon}>⏱</Text>
        </View>
        <View style={styles.rescheduleContent}>
          <Text style={styles.rescheduleTitle}>완료하지 못한 학습이 1개 있어요</Text>
          <Text style={styles.rescheduleDesc}>
            일정을 다시 나누어 부담 없이 이어가세요.
          </Text>
        </View>
        <TouchableOpacity style={styles.rescheduleAction} activeOpacity={0.8}>
          <Text style={styles.rescheduleActionText}>일정 재조정하기 ➔</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 캘린더 카드 */}
      <View style={styles.calendarCard}>
        {/* 달력 컨트롤 바 */}
        <View style={styles.monthControlRow}>
          <Text style={styles.monthTitle}>
            {year}년 {month + 1}월
          </Text>
          <View style={styles.monthActions}>
            <TouchableOpacity style={styles.todayBtn} onPress={goToday}>
              <Text style={styles.todayBtnText}>오늘</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekHeader}>
          {['일', '월', '화', '수', '목', '금', '토'].map((w, idx) => (
            <Text
              key={w}
              style={[styles.weekDayText, idx === 0 && styles.sundayText]}
            >
              {w}
            </Text>
          ))}
        </View>

        {/* 날짜 그리드 */}
        <View style={styles.datesGrid}>
          {daysArray.map((d, index) => {
            if (d === null) {
              return <View key={`empty-${index}`} style={styles.dateCell} />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDateStr;
            const dateTasks = tasks.filter(t => t.scheduled_date === dateStr);

            return (
              <TouchableOpacity
                key={`day-${d}`}
                style={[styles.dateCell, isSelected && styles.dateCellSelected]}
                onPress={() => setSelectedDateStr(dateStr)}
                activeOpacity={0.7}
              >
                <View style={[styles.dateNumberWrapper, isSelected && styles.dateNumberWrapperSelected]}>
                  <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                    {d}
                  </Text>
                </View>

                {/* Task 컬러 닷 표시 */}
                <View style={styles.dotsRow}>
                  {dateTasks.slice(0, 3).map(t => (
                    <View
                      key={t.id}
                      style={[
                        styles.taskDot,
                        { backgroundColor: t.goal_color || '#4F46E5' },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. 선택한 날의 일정 목록 */}
      <View style={styles.dayTasksSection}>
        <View style={styles.dayTasksHeader}>
          <Text style={styles.dayTasksTitle}>
            {selectedDateStr} 일정 ({selectedDateTasks.length})
          </Text>
        </View>

        {selectedDateTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>이 날짜에 배정된 학습 일정이 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.taskCardList}>
            {selectedDateTasks.map((task, idx) => (
              <View key={task.id}>
                <TouchableOpacity
                  style={styles.taskItem}
                  onPress={() => handleToggleTask(task.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.is_done && styles.checkboxChecked,
                    ]}
                  >
                    {task.is_done && <Text style={styles.checkIcon}>✓</Text>}
                  </View>

                  <View style={styles.taskInfo}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.is_done && styles.taskTitleDone,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      <View
                        style={[
                          styles.goalColorDot,
                          { backgroundColor: task.goal_color || '#4F46E5' },
                        ]}
                      />
                      <Text style={styles.goalNameText}>{task.goal_name}</Text>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.durationText}>⏱ {task.duration_minutes}분</Text>
                    </View>
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                {idx < selectedDateTasks.length - 1 && (
                  <View style={styles.taskDivider} />
                )}
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 18,
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
  newGoalBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  newGoalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rescheduleBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  clockBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
  calendarCard: {
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
    marginBottom: 20,
  },
  monthControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  monthActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    width: 36,
    textAlign: 'center',
  },
  sundayText: {
    color: '#EF4444',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRadius: 10,
  },
  dateCellSelected: {
    backgroundColor: '#EEF2FF',
  },
  dateNumberWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumberWrapperSelected: {
    backgroundColor: '#4F46E5',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dateTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    height: 5,
    alignItems: 'center',
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayTasksSection: {
    marginBottom: 20,
  },
  dayTasksHeader: {
    marginBottom: 10,
  },
  dayTasksTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  taskCardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
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
