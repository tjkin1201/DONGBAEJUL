import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import LargeTouchButton from '../components/LargeTouchButton';
import StatusCard from '../components/StatusCard';
import { useGameStore } from '../store/gameStore';
import { colors } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const { 
    user, 
    gameStatus, 
    isCheckedIn, 
    participants, 
    currentGame,
    checkIn 
  } = useGameStore();

  // 체크인된 참가자 수 계산
  const checkedInCount = participants.filter(p => p.checkedIn).length;
  const totalParticipants = participants.length;

  // 상황별 홈 화면 렌더링
  const renderContent = () => {
    switch (gameStatus) {
      case 'beforeGame':
        return renderBeforeGameContent();
      case 'gameDay':
        return renderGameDayContent();
      case 'duringGame':
        return renderDuringGameContent();
      case 'afterGame':
        return renderAfterGameContent();
      default:
        return renderGameDayContent();
    }
  };

  // 게임 전 상태
  const renderBeforeGameContent = () => (
    <>
      <StatusCard
        title="이번 주 배드민턴"
        subtitle="수요일 오후 7시"
        icon="calendar"
        status="active"
        content={
          <View>
            <Text style={styles.infoText}>📍 동탄 체육관</Text>
            <Text style={styles.infoText}>👥 {totalParticipants}명 등록</Text>
            <Text style={styles.infoText}>🏸 준비물: 라켓, 셔틀콕</Text>
          </View>
        }
      />
      
      <View style={styles.buttonContainer}>
        <LargeTouchButton
          title="참가 신청하기 🔥"
          variant="primary"
          size="xl"
          onPress={() => {
            Alert.alert(
              '참가 완료!', 
              '수요일 게임 참가가 확정되었습니다.\n시간: 오후 7시\n장소: 동탄 체육관',
              [{ text: '확인', onPress: () => {} }]
            );
          }}
        />
      </View>

      <StatusCard
        title="💭 지난 게임 기록"
        content="3승 1패 • 승률 75%"
        icon="chart-line"
      />

      <StatusCard
        title="🎯 이번 주 목표"
        content="스매시 정확도 향상"
        icon="target"
      />
    </>
  );

  // 게임 당일 상태
  const renderGameDayContent = () => (
    <>
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>🏸 오늘 게임이에요!</Text>
        <Text style={styles.heroSubtitle}>체육관에 도착하셨나요?</Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isCheckedIn ? (
          <LargeTouchButton
            title="체육관 도착! 🎯"
            variant="primary"
            size="xl"
            onPress={() => {
              checkIn();
              Alert.alert(
                '체크인 완료!', 
                `${user?.name}님 환영합니다!\n현재 ${checkedInCount + 1}명이 도착했어요.`,
                [{ text: '확인' }]
              );
            }}
          />
        ) : (
          <LargeTouchButton
            title="체크인 완료 ✅"
            variant="success"
            size="xl"
            onPress={() => navigation.navigate('GameBoard')}
          />
        )}
      </View>

      <StatusCard
        title="실시간 현황"
        icon="account-group"
        status="active"
        content={
          <View>
            <Text style={styles.infoText}>✅ 현재 {checkedInCount}명 체크인 완료</Text>
            <Text style={styles.infoText}>⏰ 7시 15분 게임 시작 예정</Text>
            <Text style={styles.infoText}>🏓 A, B 코트 모두 사용</Text>
          </View>
        }
      />

      <StatusCard
        title="📋 오늘의 준비사항"
        icon="clipboard-list"
        content={
          <View>
            <Text style={styles.infoText}>🏸 셔틀콕 2개 준비됨</Text>
            <Text style={styles.infoText}>🚿 탈의실 이용 가능</Text>
            <Text style={styles.infoText}>☕ 매점 운영 중</Text>
          </View>
        }
      />
    </>
  );

  // 게임 중 상태
  const renderDuringGameContent = () => (
    <>
      <StatusCard
        title="🔥 철수님 차례!"
        subtitle={`약 ${currentGame?.estimatedWaitTime}분 후`}
        icon="clock"
        status="warning"
        content={`다음 상대: ${currentGame?.nextOpponent}님`}
      />

      <View style={styles.buttonContainer}>
        <LargeTouchButton
          title="게임 현황 보기"
          variant="secondary"
          onPress={() => navigation.navigate('GameBoard')}
        />
      </View>

      <StatusCard
        title="🏓 현재 경기 상황"
        icon="scoreboard"
        content={
          <View>
            <Text style={styles.infoText}>A코트: 영희팀 vs 민수팀 (15-12)</Text>
            <Text style={styles.infoText}>B코트: 준호팀 vs 현우팀 (경기 완료)</Text>
          </View>
        }
      />

      <View style={styles.quickActions}>
        <LargeTouchButton
          title="점수 입력"
          variant="outline"
          size="normal"
          onPress={() => navigation.navigate('ScoreInput')}
          style={styles.quickActionButton}
        />
        <LargeTouchButton
          title="🚿 휴식"
          variant="outline"
          size="normal"
          style={styles.quickActionButton}
        />
      </View>
    </>
  );

  // 게임 후 상태
  const renderAfterGameContent = () => (
    <>
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>🎉 오늘 수고했어요!</Text>
        <Text style={styles.heroSubtitle}>즐거운 게임이었습니다</Text>
      </View>

      <StatusCard
        title="📊 오늘의 기록"
        icon="chart-bar"
        status="success"
        content={
          <View>
            <Text style={styles.infoText}>• 경기: 4회</Text>
            <Text style={styles.infoText}>• 승리: 3회 (75%)</Text>
            <Text style={styles.infoText}>• MVP: 철수님 🏆</Text>
          </View>
        }
      />

      <StatusCard
        title="💭 한줄 소감"
        icon="comment"
        content="오늘 정말 재밌었어요! 다음에 또 만나요 😊"
      />

      <StatusCard
        title="📅 다음 모임"
        icon="calendar-plus"
        content="수요일 오후 7시"
        onPress={() => {
          Alert.alert('다음 게임 참가', '수요일 게임에 참가하시겠습니까?');
        }}
      />
    </>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // 탭바 여유공간
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
    marginVertical: 20,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});