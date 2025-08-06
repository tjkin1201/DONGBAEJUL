import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  TextInput,
  List,
  Divider,
  Surface,
  IconButton,
  ActivityIndicator,
  RadioButton,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';

/**
 * 동호회 모임비/참가비 납부 관리 화면
 * - 정기 모임비 납부
 * - 게임별 참가비 납부
 * - 납부 내역 조회
 * - 동호회 멤버들의 납부 현황
 */
const PaymentScreen = ({ route, navigation }) => {
  const { gameId, type = 'monthly' } = route.params || {};
  const { user, selectedBand } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    monthlyFee: {
      amount: 50000,
      dueDate: '2024-02-15',
      status: 'paid', // paid, unpaid, overdue
      description: '2월 정기 모임비'
    },
    gameParticipationFee: {
      amount: 10000,
      gameTitle: '주말 정기전',
      gameDate: '2024-02-10',
      status: 'unpaid'
    },
    paymentHistory: [],
    memberPaymentStatus: []
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [transferInfo, setTransferInfo] = useState({
    accountNumber: '농협 123-456-789012',
    accountHolder: '김동호회장',
    amount: 0
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Mock 데이터 - 실제로는 API 호출
      const mockHistory = [
        {
          id: '1',
          type: 'monthly',
          amount: 50000,
          description: '1월 정기 모임비',
          paidAt: '2024-01-15T10:00:00Z',
          method: 'transfer',
          status: 'completed'
        },
        {
          id: '2',
          type: 'game',
          amount: 10000,
          description: '신년 특별전 참가비',
          paidAt: '2024-01-20T14:30:00Z',
          method: 'card',
          status: 'completed'
        }
      ];

      const mockMemberStatus = [
        {
          user: { name: '김배드', profileImage: 'https://via.placeholder.com/50' },
          monthlyStatus: 'paid',
          monthlyAmount: 50000,
          totalGames: 3,
          totalGameFees: 30000
        },
        {
          user: { name: '이민턴', profileImage: 'https://via.placeholder.com/50' },
          monthlyStatus: 'unpaid',
          monthlyAmount: 50000,
          totalGames: 2,
          totalGameFees: 20000
        },
        {
          user: { name: '박셔틀', profileImage: 'https://via.placeholder.com/50' },
          monthlyStatus: 'paid',
          monthlyAmount: 50000,
          totalGames: 4,
          totalGameFees: 40000
        }
      ];

      setPaymentData(prev => ({
        ...prev,
        paymentHistory: mockHistory,
        memberPaymentStatus: mockMemberStatus
      }));

    } catch (error) {
      console.error('결제 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentType, amount) => {
    try {
      Alert.alert(
        '결제 확인',
        `${amount.toLocaleString()}원을 ${selectedPaymentMethod === 'card' ? '카드로' : '계좌이체로'} 결제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '결제', 
            onPress: async () => {
              if (selectedPaymentMethod === 'transfer') {
                showTransferInfo(amount);
              } else {
                // 카드 결제 로직
                processCardPayment(paymentType, amount);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('결제 처리 오류:', error);
      Alert.alert('오류', '결제 처리 중 오류가 발생했습니다.');
    }
  };

  const showTransferInfo = (amount) => {
    Alert.alert(
      '계좌이체 안내',
      `아래 계좌로 ${amount.toLocaleString()}원을 입금해주세요.\n\n${transferInfo.accountNumber}\n예금주: ${transferInfo.accountHolder}\n\n입금 후 동호회장에게 알려주세요.`,
      [{ text: '확인' }]
    );
  };

  const processCardPayment = async (paymentType, amount) => {
    // Mock 카드 결제 처리
    Alert.alert('결제 완료', `${amount.toLocaleString()}원 결제가 완료되었습니다.`);
    
    // 결제 상태 업데이트
    if (paymentType === 'monthly') {
      setPaymentData(prev => ({
        ...prev,
        monthlyFee: { ...prev.monthlyFee, status: 'paid' }
      }));
    } else if (paymentType === 'game') {
      setPaymentData(prev => ({
        ...prev,
        gameParticipationFee: { ...prev.gameParticipationFee, status: 'paid' }
      }));
    }
  };

  const renderPaymentMethods = () => (
    <Card style={styles.methodCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>결제 방법</Text>
        <RadioButton.Group 
          onValueChange={value => setSelectedPaymentMethod(value)} 
          value={selectedPaymentMethod}
        >
          <View style={styles.radioItem}>
            <RadioButton value="card" />
            <Text style={styles.radioLabel}>신용카드/체크카드</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="transfer" />
            <Text style={styles.radioLabel}>계좌이체</Text>
            <Text style={styles.radioSubLabel}>({transferInfo.accountNumber})</Text>
          </View>
        </RadioButton.Group>
      </Card.Content>
    </Card>
  );

  const renderMonthlyFee = () => {
    const { monthlyFee } = paymentData;
    const isOverdue = new Date() > new Date(monthlyFee.dueDate);
    
    return (
      <Card style={styles.feeCard}>
        <Card.Content>
          <View style={styles.feeHeader}>
            <Text style={styles.feeTitle}>💰 정기 모임비</Text>
            <Chip 
              style={[
                styles.statusChip,
                { backgroundColor: 
                  monthlyFee.status === 'paid' ? theme.colors.success : 
                  isOverdue ? theme.colors.error : theme.colors.warning
                }
              ]}
              textStyle={{ color: theme.colors.surface }}
            >
              {monthlyFee.status === 'paid' ? '납부완료' : isOverdue ? '납부지연' : '미납'}
            </Chip>
          </View>
          
          <Text style={styles.feeAmount}>{monthlyFee.amount.toLocaleString()}원</Text>
          <Text style={styles.feeDescription}>{monthlyFee.description}</Text>
          <Text style={styles.feeDueDate}>
            납부 기한: {new Date(monthlyFee.dueDate).toLocaleDateString('ko-KR')}
          </Text>
          
          {monthlyFee.status !== 'paid' && (
            <Button 
              mode="contained" 
              style={styles.payButton}
              onPress={() => handlePayment('monthly', monthlyFee.amount)}
            >
              지금 납부하기
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderGameFee = () => {
    if (!gameId && type !== 'game') return null;
    
    const { gameParticipationFee } = paymentData;
    
    return (
      <Card style={styles.feeCard}>
        <Card.Content>
          <View style={styles.feeHeader}>
            <Text style={styles.feeTitle}>🏸 게임 참가비</Text>
            <Chip 
              style={[
                styles.statusChip,
                { backgroundColor: gameParticipationFee.status === 'paid' ? theme.colors.success : theme.colors.warning }
              ]}
              textStyle={{ color: theme.colors.surface }}
            >
              {gameParticipationFee.status === 'paid' ? '납부완료' : '미납'}
            </Chip>
          </View>
          
          <Text style={styles.feeAmount}>{gameParticipationFee.amount.toLocaleString()}원</Text>
          <Text style={styles.feeDescription}>{gameParticipationFee.gameTitle}</Text>
          <Text style={styles.feeDueDate}>
            경기 일시: {new Date(gameParticipationFee.gameDate).toLocaleDateString('ko-KR')}
          </Text>
          
          {gameParticipationFee.status !== 'paid' && (
            <Button 
              mode="contained" 
              style={styles.payButton}
              onPress={() => handlePayment('game', gameParticipationFee.amount)}
            >
              참가비 납부하기
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderPaymentHistory = () => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>📋 납부 내역</Text>
        
        {paymentData.paymentHistory.length > 0 ? (
          paymentData.paymentHistory.map((payment, index) => (
            <View key={payment.id}>
              <List.Item
                title={payment.description}
                description={`${new Date(payment.paidAt).toLocaleDateString('ko-KR')} • ${payment.method === 'card' ? '카드결제' : '계좌이체'}`}
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon={payment.type === 'monthly' ? 'calendar-month' : 'badminton'} 
                    color={theme.colors.primary}
                  />
                )}
                right={(props) => (
                  <View style={styles.paymentAmount}>
                    <Text style={styles.paymentAmountText}>
                      {payment.amount.toLocaleString()}원
                    </Text>
                    <Chip 
                      style={styles.completedChip}
                      textStyle={{ fontSize: 10 }}
                    >
                      완료
                    </Chip>
                  </View>
                )}
              />
              {index < paymentData.paymentHistory.length - 1 && <Divider />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>납부 내역이 없습니다</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderMemberStatus = () => (
    <Card style={styles.memberCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>👥 동호회 납부 현황</Text>
        
        {paymentData.memberPaymentStatus.map((member, index) => (
          <View key={index}>
            <List.Item
              title={member.user.name}
              description={`게임 ${member.totalGames}회 참여 • ${member.totalGameFees.toLocaleString()}원`}
              left={(props) => (
                <Avatar.Image 
                  {...props} 
                  size={40} 
                  source={{ uri: member.user.profileImage }}
                />
              )}
              right={(props) => (
                <View style={styles.memberPaymentInfo}>
                  <Chip 
                    style={[
                      styles.memberStatusChip,
                      { backgroundColor: member.monthlyStatus === 'paid' ? theme.colors.success : theme.colors.error }
                    ]}
                    textStyle={{ color: theme.colors.surface, fontSize: 10 }}
                  >
                    {member.monthlyStatus === 'paid' ? '모임비 완료' : '모임비 미납'}
                  </Chip>
                  <Text style={styles.memberAmountText}>
                    {member.monthlyAmount.toLocaleString()}원
                  </Text>
                </View>
              )}
            />
            {index < paymentData.memberPaymentStatus.length - 1 && <Divider />}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>결제 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderMonthlyFee()}
        {renderGameFee()}
        {renderPaymentMethods()}
        {renderPaymentHistory()}
        {renderMemberStatus()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  feeCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  methodCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  historyCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  memberCard: {
    marginBottom: theme.spacing.lg,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  feeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statusChip: {
    color: theme.colors.surface,
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  feeDescription: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  feeDueDate: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: theme.spacing.lg,
  },
  payButton: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  radioLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginLeft: theme.spacing.sm,
  },
  radioSubLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginLeft: theme.spacing.xs,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  completedChip: {
    backgroundColor: theme.colors.success,
  },
  memberPaymentInfo: {
    alignItems: 'flex-end',
  },
  memberStatusChip: {
    marginBottom: theme.spacing.xs,
  },
  memberAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.6,
    fontSize: 14,
    marginVertical: theme.spacing.lg,
  },
});

export default PaymentScreen;