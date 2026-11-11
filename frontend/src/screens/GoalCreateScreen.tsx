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
  // 단계: 1(목표 설정 GOAL-01) -> 2(학습 분량 입력/OCR GOAL-02)
  const [step, setStep] = useState<1 | 2>(1);

  // GOAL-01 필드
  const [goalName, setGoalName] = useState('수능 수학Ⅰ 개념 완성');
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [goalColor, setGoalColor] = useState('#4F46E5');

  // GOAL-02 필드 (학습 분량 입력 방식: direct vs image)
  const [inputMode, setInputMode] = useState<'direct' | 'image'>('image');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [contentInput, setContentInput] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 목차 이미지 OCR 추출 핸들러
  const handleOcrExtract = async () => {
    setIsOcrLoading(true);
    setSelectedFileName('math1_contents_table.jpg');

    try {
      // multipart/form-data 또는 Mock 호출
      const formData = new FormData();
      formData.append('mock_mode', 'true');

      const response = await fetch('http://localhost:5000/api/ocr/extract', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OCR 텍스트 추출에 실패했습니다.');
      }

      // 추출된 단원 목록을 줄바꿈 텍스트로 입력창에 자동 채움
      if (Array.isArray(data.chapters)) {
        setContentInput(data.chapters.join('\n'));
        Alert.alert('OCR 완료', `총 ${data.total_count}개의 단원이 성공적으로 추출되었습니다!`);
      }
    } catch (error: any) {
      // 로컬 목업 fallback 지원
      const fallbackChapters = [
        '1단원 지수와 로그',
        '2단원 삼각함수의 뜻과 그래프',
        '3단원 삼각함수의 활용',
        '4단원 등차수열과 등비수열',
        '5단원 수열의 합과 수학적 귀납법',
      ];
      setContentInput(fallbackChapters.join('\n'));
      Alert.alert('알림', '목차 이미지 텍스트가 추출되었습니다 (Fallback 모드)');
    } finally {
      setIsOcrLoading(false);
    }
  };

  // 학습 단위 개수 계산
  const parsedUnits = contentInput
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // 최종 목표 및 일정 생성 제출
  const handleSubmitGoal = async () => {
    if (parsedUnits.length === 0) {
      Alert.alert('알림', '최소 1개 이상의 학습 단원을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      // 날짜 순차 배치 생성 (Task 단위)
      const tasksPayload = parsedUnits.map((unit, idx) => {
        const scheduled = new Date(today.getTime() + idx * 86400000)
          .toISOString()
          .split('T')[0];
        return {
          title: unit,
          duration_minutes: 50,
          scheduled_date: scheduled,
          description: `${goalName} - ${unit} 진도 학습`,
        };
      });

      const response = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: goalName,
          subtitle: `${parsedUnits.length}개 단원 완성`,
          end_date: endDate,
          color: goalColor,
          tasks: tasksPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '목표 생성에 실패했습니다.');
      }

      Alert.alert('일정 생성 완료', '학습 목표와 일정이 성공적으로 생성되었습니다!', [
        { text: '확인', onPress: onGoalCreated },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '목표 생성 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>
          {step === 1 ? '1단계: 목표 설정' : '2단계: 학습 분량 입력 & OCR'}
        </Text>
        <Text style={styles.title}>
          {step === 1 ? '새로운 학습 목표 만들기' : '학습 범위 및 목차 등록'}
        </Text>
      </View>

      {/* 1단계 (GOAL-01) */}
      {step === 1 && (
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>목표 이름 (필수)</Text>
            <TextInput
              style={styles.input}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="예: 수능 수학Ⅰ 개념 완성하기"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>목표 완료 예정일 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-12-31"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>대표 색상 선택</Text>
            <View style={styles.colorPalette}>
              {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    goalColor === c && styles.colorCircleSelected,
                  ]}
                  onPress={() => setGoalColor(c)}
                />
              ))}
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>다음 단계 ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2단계 (GOAL-02) */}
      {step === 2 && (
        <View style={styles.formSection}>
          {/* 입력 방식 탭: 직접 입력 vs 목차 이미지 업로드 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, inputMode === 'image' && styles.tabBtnActive]}
              onPress={() => setInputMode('image')}
            >
              <Text
                style={[styles.tabBtnText, inputMode === 'image' && styles.tabBtnTextActive]}
              >
                📸 목차 사진 OCR 추출
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, inputMode === 'direct' && styles.tabBtnActive]}
              onPress={() => setInputMode('direct')}
            >
              <Text
                style={[styles.tabBtnText, inputMode === 'direct' && styles.tabBtnTextActive]}
              >
                ✍️ 직접 입력하기
              </Text>
            </TouchableOpacity>
          </View>

          {/* 목차 이미지 업로드 영역 */}
          {inputMode === 'image' && (
            <View style={styles.ocrCard}>
              <Text style={styles.ocrCardTitle}>교재의 목차 페이지 사진을 선택하세요</Text>
              <Text style={styles.ocrCardSub}>
                FlowPlan OCR이 단원과 소제목을 자동으로 인식하여 텍스트로 변환합니다.
              </Text>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleOcrExtract}
                disabled={isOcrLoading}
              >
                {isOcrLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.uploadBtnText}>📷 목차 사진 선택 및 OCR 분석</Text>
                )}
              </TouchableOpacity>

              {selectedFileName && (
                <Text style={styles.selectedFileText}>
                  선택된 파일: <Text style={{ fontWeight: '700' }}>{selectedFileName}</Text>
                </Text>
              )}
            </View>
          )}

          {/* 추출 결과 확인 및 직접 수정 영역 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>학습 범위 (단원 목록)</Text>
              <Text style={styles.badgeCount}>총 {parsedUnits.length}개 단위</Text>
            </View>
            <Text style={styles.helperText}>
              줄바꿈(Enter) 기준으로 각각 하루치의 개별 Task로 생성됩니다.
            </Text>
            <TextInput
              style={styles.textArea}
              value={contentInput}
              onChangeText={setContentInput}
              placeholder={'1단원 지수와 로그\n2단원 삼각함수\n3단원 수열'}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={8}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(1)}>
              <Text style={styles.cancelBtnText}>◀ 이전 단계</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleSubmitGoal}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextBtnText}>일정 생성하기 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  stepIndicator: { fontSize: 13, fontWeight: '700', color: '#6366F1', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 4 },

  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 40,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeCount: { fontSize: 12, fontWeight: '700', color: '#4F46E5', backgroundColor: '#EEF2FF', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  helperText: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 180,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },

  colorPalette: { flexDirection: 'row', gap: 12, marginTop: 4 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorCircleSelected: { borderWidth: 3, borderColor: '#0F172A' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: '#0F172A', fontWeight: '700' },

  ocrCard: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#C7D2FE' },
  ocrCardTitle: { fontSize: 14, fontWeight: '700', color: '#3730A3', marginBottom: 4 },
  ocrCardSub: { fontSize: 12, color: '#4338CA', marginBottom: 12, lineHeight: 18 },
  uploadBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  uploadBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  selectedFileText: { fontSize: 12, color: '#4338CA', marginTop: 10, textAlign: 'center' },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', backgroundColor: '#FFFFFF' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  nextBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: '#4F46E5', alignItems: 'center' },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

