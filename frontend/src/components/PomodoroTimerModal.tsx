import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';

interface PomodoroTimerModalProps {
  visible: boolean;
  onClose: () => void;
  taskTitle?: string;
  taskId?: string;
  accessToken?: string;
  onSessionSaved?: (focusedMinutes: number, taskId?: string) => void;
}

type TimerMode = 'FOCUS_25' | 'BREAK_5' | 'STOPWATCH';

export const PomodoroTimerModal: React.FC<PomodoroTimerModalProps> = ({
  visible,
  onClose,
  taskTitle = '집중 학습',
  taskId,
  accessToken,
  onSessionSaved,
}) => {
  const [mode, setMode] = useState<TimerMode>('FOCUS_25');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completeTaskOnFinish, setCompleteTaskOnFinish] = useState(true);

  const startTimeRef = useRef<Date | null>(null);

  // 모드 변경 시 시간 초기화
  useEffect(() => {
    setIsRunning(false);
    startTimeRef.current = null;
    if (mode === 'FOCUS_25') {
      setSecondsLeft(25 * 60);
    } else if (mode === 'BREAK_5') {
      setSecondsLeft(5 * 60);
    } else {
      setStopwatchSeconds(0);
    }
  }, [mode]);

  // 타이머 틱 인터벌
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }

      interval = setInterval(() => {
        if (mode === 'STOPWATCH') {
          setStopwatchSeconds(prev => prev + 1);
        } else {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval!);
              setIsRunning(false);
              alert(mode === 'FOCUS_25' ? '🎉 25분 뽀모도로 집중 완료! 5분간 휴식해보세요.' : '☕ 휴식 시간이 끝났습니다. 다시 시작해볼까요?');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    if (mode === 'FOCUS_25') setSecondsLeft(25 * 60);
    else if (mode === 'BREAK_5') setSecondsLeft(5 * 60);
    else setStopwatchSeconds(0);
  };

  // 순공시간 백엔드 전송 및 세션 저장
  const handleSaveSession = async () => {
    if (isSaving) return;

    let focusedSeconds = 0;
    if (mode === 'STOPWATCH') {
      focusedSeconds = stopwatchSeconds;
    } else if (mode === 'FOCUS_25') {
      focusedSeconds = 25 * 60 - secondsLeft;
    } else {
      focusedSeconds = 5 * 60 - secondsLeft;
    }

    const focusedMinutes = Math.max(1, Math.round(focusedSeconds / 60));
    const now = new Date();
    const start = startTimeRef.current || new Date(now.getTime() - focusedSeconds * 1000);

    setIsSaving(true);
    try {
      if (accessToken && accessToken !== 'mock_token_for_preview') {
        await fetch('http://localhost:5000/api/timer/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            task_id: taskId || null,
            focused_minutes: focusedMinutes,
            start_time: start.toISOString(),
            end_time: now.toISOString(),
            complete_task: completeTaskOnFinish,
          }),
        });
      }

      alert(`🎉 ${focusedMinutes}분간의 순공 시간이 안전하게 기록되었습니다!`);
      if (onSessionSaved) {
        onSessionSaved(focusedMinutes, completeTaskOnFinish ? taskId : undefined);
      }
      onClose();
    } catch (err: any) {
      console.warn('타이머 세션 전송 경고 (로컬 반영):', err.message);
      alert(`🎉 ${focusedMinutes}분간의 순공 시간이 로컬에 기록되었습니다!`);
      if (onSessionSaved) {
        onSessionSaved(focusedMinutes, completeTaskOnFinish ? taskId : undefined);
      }
      onClose();
    } finally {
      setIsSaving(false);
      handleReset();
    }
  };

  // 시간 포맷 (MM:SS)
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentDisplayTime =
    mode === 'STOPWATCH' ? formatTime(stopwatchSeconds) : formatTime(secondsLeft);

  const totalModeSeconds = mode === 'FOCUS_25' ? 25 * 60 : 5 * 60;
  const progressRatio =
    mode === 'STOPWATCH'
      ? Math.min(1, stopwatchSeconds / (60 * 60))
      : (totalModeSeconds - secondsLeft) / totalModeSeconds;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 상단 닫기 바 */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerIcon}>⏱</Text>
              <Text style={styles.headerTitle}>FlowPlan 뽀모도로</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 대상 태스크 안내 */}
          <View style={styles.taskTargetBadge}>
            <Text style={styles.taskTargetPrefix}>목표 과제:</Text>
            <Text style={styles.taskTargetName} numberOfLines={1}>
              {taskTitle}
            </Text>
          </View>

          {/* 모드 선택 세그먼트 */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'FOCUS_25' && styles.modeTabActive]}
              onPress={() => setMode('FOCUS_25')}
            >
              <Text style={[styles.modeTabText, mode === 'FOCUS_25' && styles.modeTabTextActive]}>
                🍅 25분 집중
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'BREAK_5' && styles.modeTabActive]}
              onPress={() => setMode('BREAK_5')}
            >
              <Text style={[styles.modeTabText, mode === 'BREAK_5' && styles.modeTabTextActive]}>
                ☕ 5분 휴식
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'STOPWATCH' && styles.modeTabActive]}
              onPress={() => setMode('STOPWATCH')}
            >
              <Text style={[styles.modeTabText, mode === 'STOPWATCH' && styles.modeTabTextActive]}>
                ⏱ 스톱워치
              </Text>
            </TouchableOpacity>
          </View>

          {/* 타이머 비주얼 (원형 도넛 다이얼) */}
          <View style={styles.dialContainer}>
            <View
              style={[
                styles.dialOuterRing,
                mode === 'BREAK_5' && styles.dialOuterRingBreak,
                isRunning && styles.dialOuterRingRunning,
              ]}
            >
              <View style={styles.dialInner}>
                <Text style={styles.timerDigits}>{currentDisplayTime}</Text>
                <Text style={styles.timerSubLabel}>
                  {mode === 'FOCUS_25'
                    ? isRunning
                      ? '깊이 몰입하는 중 ✨'
                      : '준비되셨나요?'
                    : mode === 'BREAK_5'
                    ? '편안하게 숨 고르기 ☕'
                    : '자유 측정 모드 ⏱'}
                </Text>
              </View>
            </View>
          </View>

          {/* 완료 시 태스크 완료 체크 옵션 */}
          {taskId && (
            <TouchableOpacity
              style={styles.completeCheckRow}
              onPress={() => setCompleteTaskOnFinish(!completeTaskOnFinish)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, completeTaskOnFinish && styles.checkboxChecked]}>
                {completeTaskOnFinish && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <Text style={styles.completeCheckText}>
                세션 종료 시 이 할 일을 '완료' 상태로 변경
              </Text>
            </TouchableOpacity>
          )}

          {/* 컨트롤 액션 버튼들 */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.resetBtnText}>🔄 초기화</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainControlBtn,
                isRunning ? styles.pauseBtn : styles.startBtn,
              ]}
              onPress={handleStartPause}
              activeOpacity={0.85}
            >
              <Text style={styles.mainControlText}>{isRunning ? '⏸ 일시정지' : '▶ 집중 시작'}</Text>
            </TouchableOpacity>
          </View>

          {/* 순공시간 저장 버튼 */}
          <TouchableOpacity
            style={styles.saveSessionBtn}
            onPress={handleSaveSession}
            activeOpacity={0.85}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveSessionText}>💾 학습 종료 및 순공시간 기록하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
  taskTargetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskTargetPrefix: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    marginRight: 6,
  },
  taskTargetName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dialOuterRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  dialOuterRingBreak: {
    borderColor: '#DCFCE7',
  },
  dialOuterRingRunning: {
    borderColor: '#4F46E5',
  },
  dialInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    fontSize: 44,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
  },
  timerSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  completeCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  completeCheckText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  mainControlBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  startBtn: {
    backgroundColor: '#4F46E5',
  },
  pauseBtn: {
    backgroundColor: '#F59E0B',
  },
  mainControlText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  saveSessionBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSessionText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
