import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  SegmentedButtons,
  Surface,
  ActivityIndicator,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import theme from '../../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const timeRangeOptions = [
    { value: 'week', label: '주간' },
    { value: 'month', label: '월간' },
    { value: 'year', label: '연간' },
  ];

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getStatistics(timeRange);
      setStatistics(response.data.data);
    } catch (error) {
      console.error('통계 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: () => theme.colors.text,
    style: {
      borderRadius: theme.roundness,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    }
  };

  const renderOverview = () => (
    <Card style={styles.overviewCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>개요</Text>
        <View style={styles.statsGrid}>
          <Surface style={styles.statItem} elevation={1}>
            <Text style={styles.statValue}>{statistics?.gamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>총 게임</Text>
          </Surface>
          <Surface style={styles.statItem} elevation={1}>
            <Text style={styles.statValue}>{statistics?.gamesWon || 0}</Text>
            <Text style={styles.statLabel}>승리</Text>
          </Surface>
          <Surface style={styles.statItem} elevation={1}>
            <Text style={styles.statValue}>
              {statistics?.gamesPlayed > 0 
                ? Math.round((statistics?.gamesWon / statistics?.gamesPlayed) * 100)
                : 0}%
            </Text>
            <Text style={styles.statLabel}>승률</Text>
          </Surface>
          <Surface style={styles.statItem} elevation={1}>
            <Text style={styles.statValue}>{statistics?.totalHours || 0}</Text>
            <Text style={styles.statLabel}>플레이 시간</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGameProgress = () => {
    if (!statistics?.gameHistory?.length) return null;

    const data = {
      labels: statistics.gameHistory.map(item => item.date),
      datasets: [{
        data: statistics.gameHistory.map(item => item.gamesPlayed),
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>게임 활동 추이</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={data}
              width={Math.max(screenWidth - 60, statistics.gameHistory.length * 50)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const renderGameTypes = () => {
    if (!statistics?.gameTypeStats?.length) return null;

    const data = statistics.gameTypeStats.map((item, index) => ({
      name: item.type,
      count: item.count,
      color: ['#1976D2', '#FF5722', '#9C27B0', '#4CAF50'][index % 4],
      legendFontColor: theme.colors.text,
      legendFontSize: 15,
    }));

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>게임 유형별 통계</Text>
          <PieChart
            data={data}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>
    );
  };

  const renderPerformance = () => {
    if (!statistics?.performanceHistory?.length) return null;

    const data = {
      labels: statistics.performanceHistory.map(item => item.date),
      datasets: [{
        data: statistics.performanceHistory.map(item => item.winRate),
      }]
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>승률 변화</Text>
          <BarChart
            data={data}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderAchievements = () => (
    <Card style={styles.achievementCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>업적</Text>
        <View style={styles.achievementContainer}>
          {statistics?.achievements?.map((achievement, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={[
                styles.achievementChip,
                achievement.earned && styles.earnedChip
              ]}
              textStyle={[
                styles.achievementText,
                achievement.earned && styles.earnedText
              ]}
            >
              {achievement.earned ? '🏆' : '🔒'} {achievement.name}
            </Chip>
          )) || (
            <Text style={styles.noAchievements}>아직 획득한 업적이 없습니다</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderLevelProgress = () => {
    const currentLevel = user?.level || 'beginner';
    const levelMapping = {
      beginner: { name: '초급', color: theme.colors.level.beginner, next: '중급' },
      intermediate: { name: '중급', color: theme.colors.level.intermediate, next: '고급' },
      advanced: { name: '고급', color: theme.colors.level.advanced, next: '전문가' },
      expert: { name: '전문가', color: theme.colors.level.expert, next: null },
    };

    const level = levelMapping[currentLevel];
    const progress = statistics?.levelProgress || 0;

    return (
      <Card style={styles.levelCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>레벨 진행도</Text>
          <View style={styles.levelContainer}>
            <View style={styles.currentLevel}>
              <Text style={[styles.levelText, { color: level.color }]}>
                현재: {level.name}
              </Text>
              {level.next && (
                <Text style={styles.nextLevel}>
                  다음: {level.next}
                </Text>
              )}
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progress, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: level.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
          <Text style={styles.progressDescription}>
            {level.next 
              ? `${level.next} 레벨까지 ${100 - progress}% 남았습니다`
              : '최고 레벨에 도달했습니다!'
            }
          </Text>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 시간 범위 선택 */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={timeRangeOptions}
            style={styles.segmentedButtons}
          />
        </View>

        {renderOverview()}
        {renderLevelProgress()}
        {renderGameProgress()}
        {renderGameTypes()}
        {renderPerformance()}
        {renderAchievements()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  segmentedButtons: {
    marginBottom: theme.spacing.sm,
  },
  overviewCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  chartCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  levelCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  levelContainer: {
    marginBottom: theme.spacing.md,
  },
  currentLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
  },
  nextLevel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.outline,
    borderRadius: 4,
    marginRight: theme.spacing.md,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  achievementCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  achievementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  achievementChip: {
    marginBottom: theme.spacing.sm,
    borderColor: theme.colors.outline,
  },
  earnedChip: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  achievementText: {
    color: theme.colors.text,
    opacity: 0.7,
  },
  earnedText: {
    color: theme.colors.primary,
    opacity: 1,
  },
  noAchievements: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default StatisticsScreen;