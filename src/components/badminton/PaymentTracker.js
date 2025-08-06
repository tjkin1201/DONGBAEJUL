import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Surface, 
  Card, 
  Button, 
  Avatar, 
  Chip, 
  ProgressBar,
  IconButton,
  Divider,
  Badge
} from 'react-native-paper';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import theme from '../../utils/theme';
import GradientCard from '../premium/GradientCard';

/**
 * 스마트 참석비 관리 시스템
 * - 개인별 참석 횟수 추적
 * - 자동 정산 시스템
 * - 할인 혜택 관리
 */
const PaymentTracker = ({
  members = [],
  gameHistory = [],
  paymentRules = {
    baseAmount: 5000,      // 기본 참석비
    loyaltyDiscount: 0.1,  // 단골 할인율 (10%)
    loyaltyThreshold: 10,  // 단골 기준 (10회 이상)
    penaltyRate: 1.5,      // 노쇼 페널티 (1.5배)
  },
  currentMonth = new Date(),
  onPaymentUpdate,
  style,
}) => {
  const [paymentData, setPaymentData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCollected: 0,
    totalExpected: 0,
    collectionRate: 0,
    totalGames: 0,
  });

  useEffect(() => {
    calculatePayments();
  }, [members, gameHistory, currentMonth]);

  const calculatePayments = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // 이번 달 게임들 필터링
    const monthlyGames = gameHistory.filter(game => {
      const gameDate = new Date(game.date);
      return gameDate >= monthStart && gameDate <= monthEnd;
    });

    const memberPayments = members.map(member => {
      // 개인별 참석 정보 계산
      const attendedGames = monthlyGames.filter(game => 
        game.participants.includes(member.id)
      );
      const noShowGames = monthlyGames.filter(game => 
        game.registered.includes(member.id) && !game.participants.includes(member.id)
      );

      // 참석 횟수별 할인 적용
      const totalAttendance = attendedGames.length;
      const isLoyalMember = totalAttendance >= paymentRules.loyaltyThreshold;
      const baseAmount = paymentRules.baseAmount;
      
      let discountedAmount = baseAmount;
      if (isLoyalMember) {
        discountedAmount = baseAmount * (1 - paymentRules.loyaltyDiscount);
      }

      // 노쇼 페널티 계산
      const penaltyAmount = noShowGames.length * baseAmount * (paymentRules.penaltyRate - 1);
      
      // 총 납부 예정 금액
      const totalAmount = (discountedAmount * totalAttendance) + penaltyAmount;
      
      // 이미 납부한 금액 (실제 데이터에서 가져와야 함)
      const paidAmount = member.monthlyPayments?.[currentMonth.getMonth()] || 0;
      const remainingAmount = Math.max(0, totalAmount - paidAmount);

      return {
        member,
        attendance: {
          attended: attendedGames.length,
          noShow: noShowGames.length,
          rate: attendedGames.length / Math.max(monthlyGames.length, 1) * 100,
        },
        payment: {
          baseAmount,
          discountedAmount,
          penaltyAmount,
          totalAmount,
          paidAmount,
          remainingAmount,
          isLoyalMember,
        },
        games: attendedGames,
        status: remainingAmount === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
      };
    });

    // 전체 통계 계산
    const totalExpected = memberPayments.reduce((sum, mp) => sum + mp.payment.totalAmount, 0);
    const totalPaid = memberPayments.reduce((sum, mp) => sum + mp.payment.paidAmount, 0);
    const collectionRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;

    setPaymentData(memberPayments);
    setStatistics({
      totalCollected: totalPaid,
      totalExpected,
      collectionRate,
      totalGames: monthlyGames.length,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return theme.colors.success;
      case 'partial':
        return theme.colors.warning;
      case 'unpaid':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return '납부완료';
      case 'partial':
        return '부분납부';
      case 'unpaid':
        return '미납';
      default:
        return '확인필요';
    }
  };

  const handlePaymentReminder = (memberData) => {
    Alert.alert(
      '납부 알림',
      `${memberData.member.name}님에게 납부 알림을 보내시겠습니까?\n\n` +
      `납부 예정 금액: ${memberData.payment.remainingAmount.toLocaleString()}원`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '알림 보내기',
          onPress: () => {
            // 실제로는 푸시 알림이나 메시지 전송
            Alert.alert('알림 완료', '납부 알림이 전송되었습니다.');
          }
        }
      ]
    );
  };

  const renderStatistics = () => (
    <GradientCard gradient="primary" style={styles.statsCard}>
      <Text style={styles.statsTitle}>
        {format(currentMonth, 'yyyy년 M월', { locale: ko })} 정산 현황
      </Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {statistics.totalCollected.toLocaleString()}원
          </Text>
          <Text style={styles.statLabel}>수납 완료</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {statistics.totalExpected.toLocaleString()}원
          </Text>
          <Text style={styles.statLabel}>총 예정액</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(statistics.collectionRate)}%
          </Text>
          <Text style={styles.statLabel}>수납률</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.totalGames}회</Text>
          <Text style={styles.statLabel}>총 게임 수</Text>
        </View>
      </View>
      
      <ProgressBar
        progress={statistics.collectionRate / 100}
        color={theme.colors.surface}
        style={styles.progressBar}
      />
    </GradientCard>
  );

  const renderMemberPayment = (memberData, index) => (
    <Card key={memberData.member.id} style={styles.memberCard}>
      <Card.Content>
        <View style={styles.memberHeader}>
          <View style={styles.memberInfo}>
            <Avatar.Image
              size={48}
              source={{ uri: memberData.member.avatar || `https://ui-avatars.com/api/?name=${memberData.member.name}` }}
            />
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{memberData.member.name}</Text>
              <View style={styles.memberChips}>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(memberData.status) }
                  ]}
                  textStyle={{ color: theme.colors.surface, fontSize: 10 }}
                >
                  {getStatusText(memberData.status)}
                </Chip>
                {memberData.payment.isLoyalMember && (
                  <Chip
                    icon="star"
                    style={styles.loyaltyChip}
                    textStyle={{ color: theme.colors.surface, fontSize: 10 }}
                  >
                    단골
                  </Chip>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.paymentActions}>
            <IconButton
              icon="bell"
              size={20}
              onPress={() => handlePaymentReminder(memberData)}
              disabled={memberData.status === 'paid'}
            />
            <IconButton
              icon="cash"
              size={20}
              onPress={() => onPaymentUpdate && onPaymentUpdate(memberData)}
            />
          </View>
        </View>

        <Divider style={styles.cardDivider} />

        {/* 참석 정보 */}
        <View style={styles.attendanceSection}>
          <Text style={styles.sectionTitle}>참석 현황</Text>
          <View style={styles.attendanceStats}>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceNumber}>{memberData.attendance.attended}</Text>
              <Text style={styles.attendanceLabel}>참석</Text>
            </View>
            <View style={styles.attendanceStat}>
              <Text style={[styles.attendanceNumber, { color: theme.colors.error }]}>
                {memberData.attendance.noShow}
              </Text>
              <Text style={styles.attendanceLabel}>노쇼</Text>
            </View>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceNumber}>
                {Math.round(memberData.attendance.rate)}%
              </Text>
              <Text style={styles.attendanceLabel}>참석률</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.cardDivider} />

        {/* 결제 정보 */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>결제 내역</Text>
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>기본 참석비</Text>
              <Text style={styles.paymentAmount}>
                {memberData.payment.baseAmount.toLocaleString()}원 × {memberData.attendance.attended}
              </Text>
            </View>
            
            {memberData.payment.isLoyalMember && (
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: theme.colors.success }]}>
                  단골 할인 (-{Math.round(paymentRules.loyaltyDiscount * 100)}%)
                </Text>
                <Text style={[styles.paymentAmount, { color: theme.colors.success }]}>
                  -{((memberData.payment.baseAmount - memberData.payment.discountedAmount) * memberData.attendance.attended).toLocaleString()}원
                </Text>
              </View>
            )}
            
            {memberData.payment.penaltyAmount > 0 && (
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: theme.colors.error }]}>
                  노쇼 페널티
                </Text>
                <Text style={[styles.paymentAmount, { color: theme.colors.error }]}>
                  +{memberData.payment.penaltyAmount.toLocaleString()}원
                </Text>
              </View>
            )}
            
            <Divider style={styles.paymentDivider} />
            
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>총 금액</Text>
              <Text style={styles.totalAmount}>
                {memberData.payment.totalAmount.toLocaleString()}원
              </Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>기납부</Text>
              <Text style={styles.paymentAmount}>
                {memberData.payment.paidAmount.toLocaleString()}원
              </Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={[styles.totalLabel, { color: getStatusColor(memberData.status) }]}>
                {memberData.payment.remainingAmount > 0 ? '미납액' : '납부완료'}
              </Text>
              <Text style={[styles.totalAmount, { color: getStatusColor(memberData.status) }]}>
                {memberData.payment.remainingAmount > 0 
                  ? `${memberData.payment.remainingAmount.toLocaleString()}원`
                  : '완료'
                }
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Surface style={[styles.container, style]} elevation={1}>
      {renderStatistics()}
      
      <View style={styles.membersSection}>
        <Text style={styles.sectionMainTitle}>멤버별 정산 내역</Text>
        <ScrollView style={styles.membersList}>
          {paymentData.map((memberData, index) => renderMemberPayment(memberData, index))}
        </ScrollView>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsCard: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statsTitle: {
    fontSize: theme.fonts.h4.fontSize,
    fontWeight: theme.fonts.h4.fontWeight,
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.fonts.h3.fontSize,
    fontWeight: theme.fonts.h3.fontWeight,
    color: theme.colors.surface,
  },
  statLabel: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.surface,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  membersSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  sectionMainTitle: {
    fontSize: theme.fonts.h5.fontSize,
    fontWeight: theme.fonts.h5.fontWeight,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  membersList: {
    flex: 1,
  },
  memberCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.card,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDetails: {
    marginLeft: theme.spacing.md,
  },
  memberName: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: theme.fonts.subtitle.fontWeight,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  memberChips: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  statusChip: {
    height: 24,
  },
  loyaltyChip: {
    height: 24,
    backgroundColor: theme.colors.tertiary,
  },
  paymentActions: {
    flexDirection: 'row',
  },
  cardDivider: {
    marginVertical: theme.spacing.md,
  },
  attendanceSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fonts.body.fontSize,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceStat: {
    alignItems: 'center',
  },
  attendanceNumber: {
    fontSize: theme.fonts.h4.fontSize,
    fontWeight: theme.fonts.h4.fontWeight,
    color: theme.colors.primary,
  },
  attendanceLabel: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.xs,
  },
  paymentSection: {
    marginTop: theme.spacing.md,
  },
  paymentDetails: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentLabel: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  paymentAmount: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurface,
  },
  paymentDivider: {
    marginVertical: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: theme.fonts.subtitle.fontWeight,
    color: theme.colors.onSurface,
  },
  totalAmount: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: theme.fonts.subtitle.fontWeight,
    color: theme.colors.primary,
  },
});

export default PaymentTracker;