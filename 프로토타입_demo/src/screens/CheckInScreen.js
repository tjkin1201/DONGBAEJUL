import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import LargeTouchButton from '../components/LargeTouchButton';
import StatusCard from '../components/StatusCard';
import { useGameStore } from '../store/gameStore';
import { colors } from '../utils/theme';
import * as Haptics from 'expo-haptics';

export default function CheckInScreen({ navigation }) {
  const { user, isCheckedIn, participants, checkIn } = useGameStore();
  const [isScanning, setIsScanning] = useState(false);

  const checkedInCount = participants.filter(p => p.checkedIn).length;

  const handleQRScan = () => {
    setIsScanning(true);
    
    // QR 스캔 시뮬레이션 (3초 후 성공)
    setTimeout(() => {
      setIsScanning(false);
      handleCheckInSuccess();
    }, 3000);
  };

  const handleManualCheckIn = () => {
    // 위치 확인 시뮬레이션
    Alert.alert(
      '위치 확인',
      '동탄 체육관 근처에 계신가요?',
      [
        { 
          text: '아니요', 
          style: 'cancel',
          onPress: () => {
            Alert.alert('체크인 실패', '체육관 근처에서만 체크인이 가능합니다.');
          }
        },
        { 
          text: '네, 도착했어요!', 
          onPress: handleCheckInSuccess 
        }
      ]
    );
  };

  const handleCheckInSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkIn();
    
    Alert.alert(
      '🎉 체크인 완료!',
      `${user?.name}님 환영합니다!\n\n현재 ${checkedInCount + 1}명이 도착했어요.\n게임 시작까지 조금만 기다려주세요!`,
      [
        { 
          text: '게임 현황 보기', 
          onPress: () => navigation.navigate('GameBoard') 
        }
      ]
    );
  };

  if (isCheckedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>✅ 체크인 완료!</Text>
            <Text style={styles.heroSubtitle}>환영합니다, {user?.name}님!</Text>
          </View>

          <StatusCard
            title="현재 상황"
            icon="account-check"
            status="success"
            content={
              <View>
                <Text style={styles.infoText}>✅ {checkedInCount}명 체크인 완료</Text>
                <Text style={styles.infoText}>⏰ 곧 게임이 시작됩니다</Text>
                <Text style={styles.infoText}>🏓 A, B 코트 준비 완료</Text>
              </View>
            }
          />

          <View style={styles.buttonContainer}>
            <LargeTouchButton
              title="게임 현황 보기"
              variant="primary"
              onPress={() => navigation.navigate('GameBoard')}
            />
          </View>

          <StatusCard
            title="💡 게임 팁"
            icon="lightbulb"
            content="워밍업을 충분히 하고, 수분 섭취를 잊지 마세요!"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>🏸 체육관 도착!</Text>
          <Text style={styles.heroSubtitle}>체크인을 진행해주세요</Text>
        </View>

        {/* QR 스캔 섹션 */}
        <StatusCard
          title="QR 코드 스캔"
          subtitle="체육관 입구의 QR 코드를 스캔하세요"
          icon="qrcode-scan"
          status="active"
        />

        <View style={styles.buttonContainer}>
          <LargeTouchButton
            title={isScanning ? "스캔 중... 📷" : "QR 코드 스캔하기"}
            variant="primary"
            size="xl"
            onPress={handleQRScan}
            disabled={isScanning}
          />
        </View>

        {/* 구분선 */}
        <View style={styles.divider}>
          <Text style={styles.dividerText}>또는</Text>
        </View>

        {/* 수동 체크인 섹션 */}
        <StatusCard
          title="수동 체크인"
          subtitle="QR 스캔이 어려운 경우 사용하세요"
          icon="map-marker-check"
          content="위치 기반으로 체크인을 진행합니다"
        />

        <View style={styles.buttonContainer}>
          <LargeTouchButton
            title="수동으로 체크인하기"
            variant="secondary"
            onPress={handleManualCheckIn}
          />
        </View>

        {/* 현재 상황 */}
        <StatusCard
          title="실시간 현황"
          icon="account-group"
          content={
            <View>
              <Text style={styles.infoText}>👥 현재 {checkedInCount}명 도착</Text>
              <Text style={styles.infoText}>🕐 게임 시작: 7시 15분 예정</Text>
              <Text style={styles.infoText}>📍 위치: 동탄 체육관 2층</Text>
            </View>
          }
        />

        {/* 도움말 */}
        <StatusCard
          title="❓ 체크인이 안 되나요?"
          icon="help-circle"
          content={
            <View>
              <Text style={styles.infoText}>• QR 코드가 잘 보이는지 확인하세요</Text>
              <Text style={styles.infoText}>• 체육관 Wi-Fi에 연결해보세요</Text>
              <Text style={styles.infoText}>• 문제가 계속되면 운영진에게 문의하세요</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 16,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 16,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 4,
  },
});