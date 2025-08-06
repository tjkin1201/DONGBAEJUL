import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Surface, Chip } from 'react-native-paper';
import Svg, { Circle, Path } from 'react-native-svg';
import theme from '../../utils/theme';

/**
 * 배드민턴 실력 측정기 컴포넌트
 * - 원형 프로그레스 바
 * - 실력 레벨 시각화
 * - 애니메이션 효과
 */
const SkillMeter = ({
  currentRating = 1200,
  maxRating = 2000,
  skillLevel = 'intermediate',
  playerName,
  showDetails = true,
  size = 120,
  animated = true,
  style,
}) => {
  const animatedValue = new Animated.Value(0);
  const progress = Math.min(currentRating / maxRating, 1);
  const circumference = 2 * Math.PI * (size / 2 - 10);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: theme.animation.timing.slower,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, animated]);

  const getSkillInfo = (level) => {
    const skillInfo = {
      beginner: {
        label: '초급',
        color: theme.colors.skillLevel.beginner,
        description: '기본기 습득 단계',
        range: '800-1200',
      },
      intermediate: {
        label: '중급',
        color: theme.colors.skillLevel.intermediate,
        description: '안정적인 랠리 가능',
        range: '1200-1600',
      },
      advanced: {
        label: '고급',
        color: theme.colors.skillLevel.advanced,
        description: '전술적 플레이',
        range: '1600-1800',
      },
      expert: {
        label: '전문가',
        color: theme.colors.skillLevel.expert,
        description: '클럽 대표급',
        range: '1800-2000',
      },
      pro: {
        label: '프로',
        color: theme.colors.skillLevel.pro,
        description: '프로 선수급',
        range: '2000+',
      },
    };

    return skillInfo[level] || skillInfo.beginner;
  };

  const skillInfo = getSkillInfo(skillLevel);
  const radius = size / 2 - 10;
  const center = size / 2;

  const getProgressColor = (progress) => {
    if (progress < 0.3) return theme.colors.skillLevel.beginner;
    if (progress < 0.5) return theme.colors.skillLevel.intermediate;
    if (progress < 0.7) return theme.colors.skillLevel.advanced;
    if (progress < 0.9) return theme.colors.skillLevel.expert;
    return theme.colors.skillLevel.pro;
  };

  return (
    <Surface style={[styles.container, style]} elevation={2}>
      <View style={styles.meterContainer}>
        {/* 원형 프로그레스 */}
        <View style={[styles.progressContainer, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            {/* 배경 원 */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.surfaceVariant}
              strokeWidth="8"
              fill="none"
            />
            
            {/* 프로그레스 원 */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={getProgressColor(progress)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          
          {/* 중앙 정보 */}
          <View style={styles.centerInfo}>
            <Text style={[styles.ratingText, { color: skillInfo.color }]}>
              {currentRating}
            </Text>
            <Text style={styles.ratingLabel}>레이팅</Text>
          </View>
        </View>

        {/* 플레이어 정보 */}
        {playerName && (
          <Text style={styles.playerName}>{playerName}</Text>
        )}

        {/* 스킬 레벨 배지 */}
        <Chip
          icon="trophy"
          style={[
            styles.skillChip,
            { backgroundColor: skillInfo.color }
          ]}
          textStyle={[
            styles.skillChipText,
            { color: theme.colors.surface }
          ]}
        >
          {skillInfo.label}
        </Chip>

        {/* 상세 정보 */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.description}>{skillInfo.description}</Text>
            <Text style={styles.range}>레이팅 범위: {skillInfo.range}</Text>
            
            {/* 진행률 표시 */}
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>진행률</Text>
              <Text style={[styles.progressValue, { color: skillInfo.color }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  meterContainer: {
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: theme.fonts.h3.fontSize,
    fontWeight: theme.fonts.h3.fontWeight,
    textAlign: 'center',
  },
  ratingLabel: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  playerName: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: theme.fonts.subtitle.fontWeight,
    color: theme.colors.onSurface,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  skillChip: {
    marginTop: theme.spacing.sm,
    height: 32,
  },
  skillChipText: {
    fontSize: theme.fonts.button.fontSize,
    fontWeight: theme.fonts.button.fontWeight,
  },
  detailsContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    width: '100%',
  },
  description: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  range: {
    fontSize: theme.fonts.caption.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fonts.body.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  progressValue: {
    fontSize: theme.fonts.body.fontSize,
    fontWeight: '600',
  },
});

export default SkillMeter;