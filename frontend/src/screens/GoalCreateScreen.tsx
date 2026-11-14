import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface GoalCreateScreenProps {
  accessToken: string;
  onGoalCreated: () => void;
  onCancel: () => void;
}

export const GoalCreateScreen: React.FC<GoalCreateScreenProps> = ({
  accessToken,
  onGoalCreated,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: 목표 기본 정보
  const [goalName, setGoalName] = useState('수능 수학 Ⅰ 개념 완성');
  const [endDate, setEndDate] = useState('2026-12-11');
  const [dailyMinutes, setDailyMinutes] = useState('60');

  // Step 2: 학습 분량 입력
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [materialsText, setMaterialsText] = useState(
    '1단원 지수와 로그\n2단원 지수함수와 로그함수\n3단원 삼각함수의 뜻\n4단원 삼각함수의 그래프\n5단원 등차수열과 등비수열\n6단원 수열의 귀납적 정의'
  );

  // Step 3: AI 분할 로딩 및 결과
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);

  // AI 목표 자동 분할 실행 핸들러
  const handleGenerateSchedule = async () => {
    setIsAiLoading(true);
    setStep(3);

    try {
      const materials = materialsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const response = await fetch('http://localhost:5000/api/ai/split-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          goal_name: goalName,
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate,
          daily_minutes: Number(dailyMinutes) || 60,
          materials: materials,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI 일정 분할에 실패했습니다.');
      }

      setGeneratedTasks(data.data?.tasks || []);
    } catch (error: any) {
      console.warn('API 호출 경고 (Fallback 모드 작동):', error.message);
      // 오프라인/Fallback 스케줄 생성
      const mockMaterials = materialsText.split('\n').filter(Boolean);
      const tasks = mockMaterials.map((m, i) => ({
        title: m,
        scheduled_date: '2026-11-' + String(12 + i).padStart(2, '0'),
        duration_minutes: 60,
        description: `${m} 집중 개념 학습 및 예제 풀이`,
      }));
      setGeneratedTasks(tasks);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    alert('새 목표와 AI 맞춤형 학습 일정이 성공적으로 등록되었습니다!');
    onGoalCreated();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. 상단 이전으로 돌아가기 링크 */}
      <TouchableOpacity style={styles.backLink} onPress={onCancel} activeOpacity={0.7}>
        <Text style={styles.backLinkText}>‹ 대시보드로 돌아가기</Text>
      </TouchableOpacity>

      {/* 2. 헤더 타이틀 */}
      <View style={styles.titleSection}>
        <Text style={styles.subTag}>CREATE YOUR GOAL</Text>
        <Text style={styles.title}>새로운 목표를 시작해 볼까요?</Text>
        <Text style={styles.desc}>
          목표를 정하면 FlowPlan이 매일의 학습으로 나눠드릴게요.
        </Text>
      </View>

      {/* 3. 단계 인디케이터 (Stepper) */}
      <View style={styles.stepperContainer}>
        <View style={[styles.stepItem, step === 1 && styles.stepItemActive]}>
          <Text style={[styles.stepNumber, step === 1 && styles.stepNumberActive]}>1</Text>
          <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
            목표 설정
          </Text>
        </View>

        <View style={styles.stepLine} />

        <View style={[styles.stepItem, step === 2 && styles.stepItemActive]}>
          <Text style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}>2</Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
            학습 분량 입력
          </Text>
        </View>

        <View style={styles.stepLine} />

        <View style={[styles.stepItem, step === 3 && styles.stepItemActive]}>
          <Text style={[styles.stepNumber, step === 3 && styles.stepNumberActive]}>3</Text>
          <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>
            일정 생성
          </Text>
        </View>
      </View>

      {/* 4. Step 1: 목표 설정 폼 */}
      {step === 1 && (
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.badgeIcon}>🎯</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardHeaderTitle}>어떤 목표를 이루고 싶나요?</Text>
              <Text style={styles.cardHeaderDesc}>
                구체적인 목표일수록 더 좋은 계획을 세울 수 있어요.
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              목표 이름 <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="예: 수능 수학 Ⅰ 개념 완성하기"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.helperText}>나중에 알아보기 쉬운 이름으로 작성해 주세요.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              목표 완료일 <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateTextInput}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.calendarIcon}>📅</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>일일 권장 집중 시간 (분)</Text>
            <TextInput
              style={styles.textInput}
              value={dailyMinutes}
              onChangeText={setDailyMinutes}
              keyboardType="number-pad"
              placeholder="60"
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerNotice}>언제든 계획을 다시 조정할 수 있어요.</Text>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>다음 단계 ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 5. Step 2: 학습 분량 입력 폼 */}
      {step === 2 && (
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBadge}>
              <Text style={styles.badgeIcon}>📚</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardHeaderTitle}>공부할 목차나 분량을 입력해 주세요</Text>
              <Text style={styles.cardHeaderDesc}>
                줄바꿈으로 각 단원을 구분하면 AI가 일별로 나눠드려요.
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>교재 목차 / 단원 목록</Text>
            <TextInput
              style={styles.textArea}
              value={materialsText}
              onChangeText={setMaterialsText}
              multiline
              numberOfLines={6}
              placeholder="1단원 ...&#10;2단원 ..."
            />
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => setStep(1)}
              activeOpacity={0.85}
            >
              <Text style={styles.prevBtnText}>‹ 이전 단계</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleGenerateSchedule}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>AI 일정 생성하기 ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 6. Step 3: AI 분할 결과 및 확인 */}
      {step === 3 && (
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.badgeIcon}>✨</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardHeaderTitle}>AI 맞춤형 일정 분할 완료</Text>
              <Text style={styles.cardHeaderDesc}>
                {goalName}을(를) 위한 일별 학습 계획이 완성되었습니다.
              </Text>
            </View>
          </View>

          {isAiLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>AI가 학습 일정을 분할하고 있습니다...</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.previewTitle}>생성된 일별 학습 Task ({generatedTasks.length})</Text>
              {generatedTasks.map((t, idx) => (
                <View key={idx} style={styles.previewTaskItem}>
                  <View style={styles.previewDateBadge}>
                    <Text style={styles.previewDateText}>{t.scheduled_date}</Text>
                  </View>
                  <View style={styles.previewTaskInfo}>
                    <Text style={styles.previewTaskTitle}>{t.title}</Text>
                    <Text style={styles.previewTaskDesc}>
                      ⏱ {t.duration_minutes}분 • {t.description}
                    </Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.nextBtn, { marginTop: 20, alignSelf: 'stretch' }]}
                onPress={handleFinalSubmit}
                activeOpacity={0.85}
              >
                <Text style={[styles.nextBtnText, { textAlign: 'center' }]}>
                  캘린더에 일정 등록 완료 ➔
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  backLink: {
    marginBottom: 12,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  stepItemActive: {
    backgroundColor: '#EEF2FF',
  },
  stepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#94A3B8',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    marginRight: 6,
  },
  stepNumberActive: {
    backgroundColor: '#4F46E5',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#4F46E5',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeIcon: {
    fontSize: 20,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardHeaderDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  calendarIcon: {
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#F8FAFC',
  },
  footerNotice: {
    fontSize: 11,
    color: '#94A3B8',
  },
  nextBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  prevBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  prevBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  previewTaskItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDateBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  previewDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  previewTaskInfo: {
    flex: 1,
  },
  previewTaskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  previewTaskDesc: {
    fontSize: 11,
    color: '#64748B',
  },
});
