import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface LoginScreenProps {
  onLoginSuccess: (token: string, isNewUser: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      // 💡 개발/시뮬레이션 환경용 모의 토큰 또는 실제 카카오 SDK 연동
      const mockKakaoAccessToken = 'mock_kakao_token';

      const response = await fetch('http://localhost:5000/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_token: mockKakaoAccessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // JWT 저장 및 화면 전환
      onLoginSuccess(data.access_token, data.is_new_user);
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || '카카오 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 브랜딩 영역 */}
      <View style={styles.brandSection}>
        <Text style={styles.logoText}>FlowPlan</Text>
        <Text style={styles.tagline}>학습 범위를 일별 일정으로 나누는 스마트 플래너</Text>
      </View>

      {/* 하단 카카오 로그인 버튼 영역 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={handleKakaoLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <View style={styles.buttonContent}>
              {/* 카카오 심볼 아이콘 텍스트 표현 */}
              <Text style={styles.kakaoIcon}>💬</Text>
              <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          시작함으로써 FlowPlan의 이용약관 및 개인정보처리방침에 동의합니다.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  brandSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#4F46E5', // 서비스 메인 인디고 컬러
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
  },
  kakaoButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FEE500', // 카카오 공식 브랜드 옐로우
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191919', // 카카오 공식 텍스트 컬러
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
