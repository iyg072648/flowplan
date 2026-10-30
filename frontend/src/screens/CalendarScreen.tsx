import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

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
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ accessToken, nickname, targetExam }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // 목업 및 실서버 겸용 기본 Task 상태
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: '수학Ⅰ: 1단원 지수와 로그 개념 정리',
      duration_minutes: 45,
      scheduled_date: new Date().toISOString().split('T')[0],
      is_done: false,
      goal_name: '수능 수학Ⅰ 정복',
      goal_color: '#4F46E5',
    },
    {
      id: 'task-2',
      title: '수학Ⅰ: 지수함수 필수 예제 10문항 풀이',
      duration_minutes: 60,
      scheduled_date: new Date().toISOString().split('T')[0],
      is_done: true,
      goal_name: '수능 수학Ⅰ 정복',
      goal_color: '#4F46E5',
    },
    {
      id: 'task-3',
      title: '영어: 2025 수능특강 1~2강 단어 암기',
      duration_minutes: 30,
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      is_done: false,
      goal_name: '수능 영어 1등급',
      goal_color: '#10B981',
    },
  ]);

  // Task 완료 토글 처리 (CAL-01 & HOME-01 연동)
  const handleToggleTask = async (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, is_done: !t.is_done } : t))
    );

    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      // 로컬 목업 동작 유지
    }
  };

  // 캘린더 날짜 계산 로직
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 ~ 11
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // 선택 날짜의 Task 필터링
  const selectedDateTasks = tasks.filter(t => t.scheduled_date === selectedDateStr);
  const totalTasksCount = selectedDateTasks.length;
  const completedTasksCount = selectedDateTasks.filter(t => t.is_done).length;
  const progressRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // 날짜 그리드 배열 생성
  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let d = 1; d <= lastDate; d++) daysArray.push(d);

  return (
    <ScrollView style={styles.container}>
      {/* 4.1 인사말 영역 (HOME-01) */}
      <View style={styles.header}>
        <Text style={styles.subBadge}>YOUR LEARNING SPACE</Text>
        <Text style={styles.greetingTitle}>{nickname}님, 오늘도 잘 해낼 거예요</Text>
        <Text style={styles.greetingDesc}>
          목표 시험: <Text style={styles.highlightText}>{targetExam || '목표 설정됨'}</Text>
        </Text>
      </View>

      {/* 4.2 오늘의 집중 카드 (달성률 백분율 표시) */}
      <View style={styles.focusCard}>
        <View style={styles.focusHeader}>
          <Text style={styles.focusTitle}>“오늘의 작은 성취가 내일의 나를 만들어요.”</Text>
          <Text style={styles.focusRate}>{progressRate}%</Text>
        </View>
        <Text style={styles.focusSub}>
          선택한 날짜: {completedTasksCount}/{totalTasksCount}개 완료
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressRate}%` }]} />
        </View>
      </View>

      {/* 6. CAL-01 학습 캘린더 영역 */}
      <View style={styles.calendarCard}>
        {/* 컨트롤러 (이전달, 현재연월, 다음달, 오늘) */}
        <View style={styles.calendarControls}>
          <TouchableOpacity onPress={prevMonth} style={styles.ctrlBtn}>
            <Text style={styles.ctrlBtnText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{year}년 {month + 1}월</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.ctrlBtn}>
            <Text style={styles.ctrlBtnText}>▶</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToday} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>오늘</Text>
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekHeader}>
          {['일', '월', '화', '수', '목', '금', '토'].map((w, idx) => (
            <Text key={idx} style={[styles.weekDayText, idx === 0 && { color: '#EF4444' }]}>{w}</Text>
          ))}
        </View>

        {/* 날짜 셀 그리드 */}
        <View style={styles.grid}>
          {daysArray.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} style={styles.dayCell} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDateStr;
            const dayTasks = tasks.filter(t => t.scheduled_date === dateStr);

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedCell,
                  isToday && !isSelected && styles.todayCell,
                ]}
                onPress={() => setSelectedDateStr(dateStr)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedText]}>{day}</Text>
                {/* 과목별 색상 닷 표시 */}
                <View style={styles.dotContainer}>
                  {dayTasks.map(t => (
                    <View
                      key={t.id}
                      style={[styles.dot, { backgroundColor: t.goal_color || '#4F46E5' }]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4.4 오늘의 할 일 / 선택 날짜 패널 */}
      <View style={styles.taskSection}>
        <Text style={styles.sectionTitle}>
          📋 {selectedDateStr} 학습 일정 ({selectedDateTasks.length}개)
        </Text>

        {selectedDateTasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>“잠시 숨을 고르는 날이에요.” ☕</Text>
          </View>
        ) : (
          selectedDateTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskItem, task.is_done && styles.taskDoneItem]}
              onPress={() => handleToggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, task.is_done && styles.checkedBox]}>
                {task.is_done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.is_done && styles.taskDoneTitle]}>
                  {task.title}
                </Text>
                <Text style={styles.taskMeta}>
                  {task.goal_name} · ⏱️ {task.duration_minutes}분
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingTop: 20 },
  header: { marginBottom: 16 },
  subBadge: { fontSize: 11, fontWeight: '700', color: '#6366F1', letterSpacing: 1 },
  greetingTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  greetingDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },
  highlightText: { color: '#4F46E5', fontWeight: '700' },

  focusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  focusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusTitle: { fontSize: 14, fontWeight: '700', color: '#334155', flex: 1, marginRight: 8 },
  focusRate: { fontSize: 24, fontWeight: '900', color: '#4F46E5' },
  focusSub: { fontSize: 12, color: '#64748B', marginTop: 6, marginBottom: 10 },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 4 },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  ctrlBtn: { padding: 8 },
  ctrlBtnText: { fontSize: 14, color: '#64748B' },
  todayBtn: { backgroundColor: '#EEF2FF', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  todayBtnText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },

  weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDayText: { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#64748B' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  todayCell: { backgroundColor: '#F1F5F9', borderRadius: 8 },
  selectedCell: { backgroundColor: '#4F46E5', borderRadius: 8 },
  dayText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  selectedText: { color: '#FFFFFF' },
  dotContainer: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  taskSection: { marginBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  emptyBox: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { fontSize: 14, color: '#64748B' },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskDoneItem: { backgroundColor: '#F8FAFC', opacity: 0.7 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkedBox: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  taskDoneTitle: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskMeta: { fontSize: 12, color: '#64748B', marginTop: 4 },
});

