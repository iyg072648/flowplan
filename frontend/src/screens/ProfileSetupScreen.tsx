import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface ProfileSetupScreenProps {
  accessToken: string;
  onComplete: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ accessToken, onComplete }) => {
  const [nickname, setNickname] = useState('열공홍길동');
  const [targetExam, setTargetExam] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해 주세요.');
      return;
    }
    if (!targetExam.trim()) {
      Alert.alert('알림', '목표 시험 또는 공부 과목을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          nickname,
          target_exam: targetExam,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로필 설정 저장에 실패했습니다.');
      }

      Alert.alert('환영합니다!', '프로필 설정이 완료되었습니다.', [
        { text: '확인', onPress: onComplete },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '프로필 설정 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>프로필 설정</Text>
        <Text style={styles.subtitle}>FlowPlan에서 사용할 닉네임과 목표를 알려주세요.</Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임 입력 (예: 열공홍길동)"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>준비 중인 시험 / 목표</Text>
          <TextInput
            style={styles.input}
            value={targetExam}
            onChangeText={setTargetExam}
            placeholder="예: 수능, 토익, 정보처리기사, 공무원"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>시작하기</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
