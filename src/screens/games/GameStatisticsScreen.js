// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
// eslint-disable-next-line no-unused-vars
import { 
  Text, 
  Card, 
  SegmentedButtons,
  ActivityIndicator,
  Surface,
  Divider
// eslint-disable-next-line no-unused-vars
} from 'react-native-paper';
import GameService from '../../services/GameService';

const GameStatisticsScreen = () => {
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  const timeRangeOptions = [
    { value: 'week', label: '이번주' },
    { value: 'month', label: '이번달' },
    { value: 'year', label: '올해' },
    { value: 'all', label: '전체' }
  ];

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const result = await GameService.getGameStatistics(timeRange);
      
      if (result.success) {
        setStatistics(result.data);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // 오류 처리
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color = '#1976d2' }) => (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statCardContent}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.statSubtitle}>{subtitle}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const OverviewStats = () => {
    if (!statistics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 경기 현황</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="총 경기수"
            value={statistics.totalGames}
            subtitle="경기"
            color="#1976d2"
          />
          <StatCard
            title="활성 사용자"
            value={statistics.activePlayers}
            subtitle="명"
            color="#388e3c"
          />
          <StatCard
            title="평균 점수"
            value={`${statistics.avgScore}점`}
            color="#f57c00"
          />
          <StatCard
            title="완료율"
            value={`${statistics.completionRate}%`}
            color="#7b1fa2"
          />
        </View>
      </View>
    );
  };

  const GameTypeStats = () => {
    if (!statistics?.gameTypes) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏸 경기 유형별 통계</Text>
        {statistics.gameTypes.map((type, index) => (
          <Card key={index} style={styles.gameTypeCard}>
            <Card.Content>
              <View style={styles.gameTypeHeader}>
                <Text style={styles.gameTypeName}>{type.name}</Text>
                <Text style={styles.gameTypeCount}>{type.count}경기</Text>
              </View>
              <View style={styles.gameTypeStats}>
                <View style={styles.gameTypeStat}>
                  <Text style={styles.gameTypeStatLabel}>평균 점수</Text>
                  <Text style={styles.gameTypeStatValue}>{type.avgScore}점</Text>
                </View>
                <View style={styles.gameTypeStat}>
                  <Text style={styles.gameTypeStatLabel}>평균 시간</Text>
                  <Text style={styles.gameTypeStatValue}>{type.avgDuration}분</Text>
                </View>
                <View style={styles.gameTypeStat}>
                  <Text style={styles.gameTypeStatLabel}>완료율</Text>
                  <Text style={styles.gameTypeStatValue}>{type.completionRate}%</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const WeeklyTrend = () => {
    if (!statistics?.weeklyData) return null;

    const maxGames = Math.max(...statistics.weeklyData.map(d => d.games));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 주간 경기 추이</Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chart}>
              {statistics.weeklyData.map((day, index) => (
                <View key={index} style={styles.chartItem}>
                  <View style={styles.chartBar}>
                    <View 
                      style={[
                        styles.chartBarFill,
                        { 
                          height: `${(day.games / maxGames) * 100}%`,
                          backgroundColor: day.games > 0 ? '#1976d2' : '#e0e0e0'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{day.day}</Text>
                  <Text style={styles.chartValue}>{day.games}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const TopPerformers = () => {
    if (!statistics?.topPerformers) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 이 기간 TOP 플레이어</Text>
        {statistics.topPerformers.map((player, index) => (
          <Card key={index} style={styles.performerCard}>
            <Card.Content style={styles.performerContent}>
              <View style={styles.performerRank}>
                <Text style={styles.performerRankText}>{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{player.name}</Text>
                <Text style={styles.performerStats}>
                  {player.wins}승 {player.losses}패 (승률 {player.winRate}%)
                </Text>
              </View>
              <View style={styles.performerScore}>
                <Text style={styles.performerScoreText}>{player.totalPoints}점</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>통계 로딩 중...</Text>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>통계 데이터가 없습니다</Text>
        <Text style={styles.emptySubText}>경기를 진행하면 통계가 집계됩니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <Surface style={styles.header}>
        <Text style={styles.title}>게임 통계</Text>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={timeRangeOptions}
          style={styles.filterButtons}
        />
      </Surface>

      {/* 통계 내용 */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OverviewStats />
        <Divider style={styles.divider} />
        <GameTypeStats />
        <Divider style={styles.divider} />
        <WeeklyTrend />
        <Divider style={styles.divider} />
        <TopPerformers />
        
        {/* 하단 여백 */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterButtons: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: (width - 48) / 2,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  gameTypeCard: {
    marginBottom: 8,
    elevation: 1,
  },
  gameTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameTypeCount: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  gameTypeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameTypeStat: {
    alignItems: 'center',
  },
  gameTypeStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  gameTypeStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartCard: {
    elevation: 2,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    height: 80,
    width: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-end',
    borderRadius: 2,
    marginBottom: 8,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  performerCard: {
    marginBottom: 8,
    elevation: 1,
  },
  performerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  performerRankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  performerStats: {
    fontSize: 12,
    color: '#666',
  },
  performerScore: {
    alignItems: 'flex-end',
  },
  performerScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  bottomSpace: {
    height: 20,
  },
});

export default GameStatisticsScreen;
