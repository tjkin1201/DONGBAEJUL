import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';

// 간단한 상태 관리
const useGameStore = () => {
  const [gameStatus, setGameStatus] = useState('gameDay');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  
  return {
    gameStatus,
    isCheckedIn,
    isParticipating,
    setGameStatus,
    setIsCheckedIn,
    setIsParticipating,
    checkIn: () => setIsCheckedIn(true),
    participate: () => setIsParticipating(true),
  };
};

// 대형 터치 버튼 컴포넌트
const LargeTouchButton = ({ title, onPress, variant = 'primary', style }) => {
  const buttonStyles = [
    styles.largeButton,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'success' && styles.successButton,
    style
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, 
        variant === 'primary' && styles.primaryButtonText,
        variant === 'secondary' && styles.secondaryButtonText,
        variant === 'success' && styles.successButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// 상태 카드 컴포넌트
const StatusCard = ({ title, content, icon, status = 'default' }) => {
  return (
    <View style={[styles.statusCard, 
      status === 'success' && styles.successCard,
      status === 'warning' && styles.warningCard
    ]}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      {content && <Text style={styles.cardContent}>{content}</Text>}
    </View>
  );
};

// 홈 화면 컴포넌트
const HomeScreen = ({ gameStore, onNavigate }) => {
  const { gameStatus, isCheckedIn, isParticipating, participate } = gameStore;

  const renderGameDayContent = () => (
    <>
      <StatusCard
        title="🏸 오늘 게임"
        content="동탄 배드민턴 클럽 정기 게임"
        icon="📅"
        status="success"
      />
      
      {!isParticipating ? (
        <LargeTouchButton
          title="게임에 참가하기"
          onPress={() => {
            participate();
            Alert.alert('참가 완료!', '게임 참가가 확정되었습니다.');
          }}
          variant="primary"
        />
      ) : (
        <StatusCard
          title="✅ 참가 확정"
          content="게임 참가가 완료되었습니다!"
          icon="🎉"
          status="success"
        />
      )}

      {!isCheckedIn ? (
        <LargeTouchButton
          title="체육관 체크인하기"
          onPress={() => onNavigate('CheckIn')}
          variant="secondary"
        />
      ) : (
        <StatusCard
          title="📍 체크인 완료"
          content="체육관 도착을 확인했습니다"
          icon="✅"
          status="success"
        />
      )}

      <StatusCard
        title="⏰ 내 차례까지"
        content="2번째 대기 (약 15분 후)"
        icon="⏱️"
      />
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.screenTitle}>🏸 동배즐</Text>
      {renderGameDayContent()}
    </ScrollView>
  );
};

// 체크인 화면 컴포넌트
const CheckInScreen = ({ gameStore, onNavigate }) => {
  const { checkIn } = gameStore;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.screenTitle}>📱 체크인</Text>
      
      <StatusCard
        title="🏟️ 체육관 도착 확인"
        content="아래 버튼을 눌러 도착을 알려주세요"
        icon="📍"
      />

      <LargeTouchButton
        title="체육관 도착!"
        onPress={() => {
          checkIn();
          Alert.alert('체크인 완료!', '도착이 확인되었습니다.', [
            { text: '홈으로', onPress: () => onNavigate('Home') }
          ]);
        }}
        variant="success"
      />

      <StatusCard
        title="💡 체크인 안내"
        content="게임 시작 30분 전까지 체크인하세요. 늦으면 자동으로 대기 순서가 밀려납니다."
        icon="ℹ️"
      />
    </ScrollView>
  );
};

// 게임 현황 화면 컴포넌트
const GameBoardScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.screenTitle}>🎮 게임 현황</Text>
      
      <StatusCard
        title="🎯 내 차례"
        content="2번째 대기 (약 15분 후)"
        icon="⏱️"
        status="warning"
      />

      <StatusCard
        title="🏸 A코트 (진행 중)"
        content="김철수 & 이영희 vs 박민수 & 정지은\n현재 스코어: 15 - 12"
        icon="🔥"
        status="success"
      />

      <StatusCard
        title="🏸 B코트 (완료)"
        content="최대한 & 한소희 vs 윤상민 & 김나영\n최종 스코어: 21 - 18"
        icon="✅"
      />

      <StatusCard
        title="📊 오늘 진행률"
        content="총 6게임 중 3게임 완료 (50%)"
        icon="📈"
      />
    </ScrollView>
  );
};

// 점수 입력 화면 컴포넌트
const ScoreInputScreen = () => {
  const [teamAScore, setTeamAScore] = useState(15);
  const [teamBScore, setTeamBScore] = useState(12);

  const addScore = (team) => {
    if (team === 'A') {
      setTeamAScore(prev => prev + 1);
    } else {
      setTeamBScore(prev => prev + 1);
    }
    Alert.alert('점수 추가!', `팀 ${team}에 1점이 추가되었습니다.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.screenTitle}>⚡ 점수 입력</Text>
      
      <StatusCard
        title="🏸 A코트 게임"
        content="1세트 • 21점 먼저"
        icon="🎯"
      />

      <View style={styles.scoreContainer}>
        <LargeTouchButton
          title={`팀 A 승리 (${teamAScore}점)`}
          onPress={() => addScore('A')}
          variant="primary"
          style={styles.teamButton}
        />

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.scoreText}>{teamAScore} - {teamBScore}</Text>
        </View>

        <LargeTouchButton
          title={`팀 B 승리 (${teamBScore}점)`}
          onPress={() => addScore('B')}
          variant="secondary"
          style={styles.teamButton}
        />
      </View>

      <StatusCard
        title="💡 점수 입력 팁"
        content="승리한 팀 버튼을 눌러주세요. 실수하면 새로고침 후 다시 입력하세요."
        icon="ℹ️"
      />
    </ScrollView>
  );
};

// 메인 앱 컴포넌트
export default function SimpleApp() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const gameStore = useGameStore();

  const navigateToScreen = (screenName) => {
    setCurrentScreen(screenName);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen gameStore={gameStore} onNavigate={navigateToScreen} />;
      case 'CheckIn':
        return <CheckInScreen gameStore={gameStore} onNavigate={navigateToScreen} />;
      case 'GameBoard':
        return <GameBoardScreen />;
      case 'ScoreInput':
        return <ScoreInputScreen />;
      default:
        return <HomeScreen gameStore={gameStore} onNavigate={navigateToScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        {[
          { key: 'Home', title: '홈', icon: '🏠' },
          { key: 'CheckIn', title: '체크인', icon: '📱' },
          { key: 'GameBoard', title: '게임현황', icon: '🎮' },
          { key: 'ScoreInput', title: '점수입력', icon: '⚡' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, currentScreen === tab.key && styles.activeNavItem]}
            onPress={() => navigateToScreen(tab.key)}
          >
            <Text style={[styles.navIcon, currentScreen === tab.key && styles.activeNavIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.navText, currentScreen === tab.key && styles.activeNavText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // 대형 버튼 스타일
  largeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  successButtonText: {
    color: '#FFFFFF',
  },

  // 상태 카드 스타일
  statusCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  successCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  warningCard: {
    borderLeftColor: '#FFC107',
    backgroundColor: '#FFF8E1',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // 점수 입력 스타일
  scoreContainer: {
    marginVertical: 20,
  },
  teamButton: {
    marginVertical: 8,
    minHeight: 80,
  },
  vsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 8,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
  },

  // 하단 네비게이션 스타일
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#FFF3EF',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeNavText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});