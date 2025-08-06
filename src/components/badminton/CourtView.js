import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Avatar, Chip, Surface } from 'react-native-paper';
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg';
import theme from '../../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * 배드민턴 코트 시각화 컴포넌트
 * - 실제 배드민턴 코트 비율
 * - 플레이어 포지션 표시
 * - 실시간 매칭 상황 표시
 */
const CourtView = ({
  players = [],
  gameType = 'doubles', // singles, doubles, mixed
  courtStatus = 'available', // available, occupied, reserved
  showPlayerNames = true,
  interactive = false,
  onPlayerPress,
  style,
}) => {
  const courtWidth = screenWidth - (theme.spacing.md * 2);
  const courtHeight = courtWidth * 0.55; // 실제 배드민턴 코트 비율 (13.4m x 6.1m)

  const getCourtColor = () => {
    switch (courtStatus) {
      case 'available':
        return theme.colors.badminton.court;
      case 'occupied':
        return theme.colors.game.ongoing;
      case 'reserved':
        return theme.colors.game.scheduled;
      default:
        return theme.colors.badminton.court;
    }
  };

  const getPlayerPosition = (index, gameType) => {
    const positions = {
      singles: [
        { x: courtWidth * 0.25, y: courtHeight * 0.3 }, // Player 1
        { x: courtWidth * 0.75, y: courtHeight * 0.7 }, // Player 2
      ],
      doubles: [
        { x: courtWidth * 0.2, y: courtHeight * 0.25 }, // Player 1
        { x: courtWidth * 0.2, y: courtHeight * 0.45 }, // Player 2
        { x: courtWidth * 0.8, y: courtHeight * 0.55 }, // Player 3
        { x: courtWidth * 0.8, y: courtHeight * 0.75 }, // Player 4
      ],
      mixed: [
        { x: courtWidth * 0.2, y: courtHeight * 0.25 }, // Male 1
        { x: courtWidth * 0.2, y: courtHeight * 0.45 }, // Female 1
        { x: courtWidth * 0.8, y: courtHeight * 0.55 }, // Male 2
        { x: courtWidth * 0.8, y: courtHeight * 0.75 }, // Female 2
      ],
    };

    return positions[gameType][index] || { x: 0, y: 0 };
  };

  const renderPlayer = (player, index) => {
    const position = getPlayerPosition(index, gameType);
    const skillColor = theme.colors.skillLevel[player.skillLevel] || theme.colors.skillLevel.beginner;

    return (
      <View
        key={player.id || index}
        style={[
          styles.playerContainer,
          {
            position: 'absolute',
            left: position.x - 20,
            top: position.y - 20,
          },
        ]}
      >
        <Avatar.Image
          size={40}
          source={{ uri: player.avatar || `https://ui-avatars.com/api/?name=${player.name}&background=${skillColor.substring(1)}&color=fff` }}
          style={{
            borderWidth: 2,
            borderColor: skillColor,
          }}
        />
        {showPlayerNames && (
          <Chip
            style={[
              styles.playerChip,
              { backgroundColor: skillColor }
            ]}
            textStyle={{ color: theme.colors.surface, fontSize: theme.fonts.xs.fontSize }}
          >
            {player.name}
          </Chip>
        )}
      </View>
    );
  };

  const renderShuttlecock = () => (
    <View style={styles.shuttlecockContainer}>
      <Svg width="20" height="20" viewBox="0 0 24 24">
        <Circle
          cx="12"
          cy="12"
          r="3"
          fill={theme.colors.badminton.shuttlecock}
          stroke={theme.colors.badminton.net}
          strokeWidth="1"
        />
        <Path
          d="M12 3 L15 9 L12 12 L9 9 Z"
          fill={theme.colors.badminton.shuttlecock}
          stroke={theme.colors.badminton.net}
          strokeWidth="0.5"
        />
      </Svg>
    </View>
  );

  return (
    <Surface style={[styles.container, style]} elevation={2}>
      <View style={styles.courtContainer}>
        <Svg width={courtWidth} height={courtHeight} style={styles.court}>
          {/* 코트 배경 */}
          <Rect
            x="0"
            y="0"
            width={courtWidth}
            height={courtHeight}
            fill={getCourtColor()}
            rx={theme.borderRadius.base}
          />
          
          {/* 코트 라인들 */}
          {/* 외곽선 */}
          <Rect
            x="5"
            y="5"
            width={courtWidth - 10}
            height={courtHeight - 10}
            fill="none"
            stroke={theme.colors.badminton.courtLines}
            strokeWidth="2"
          />
          
          {/* 중앙선 */}
          <Line
            x1={courtWidth / 2}
            y1="5"
            x2={courtWidth / 2}
            y2={courtHeight - 5}
            stroke={theme.colors.badminton.courtLines}
            strokeWidth="2"
          />
          
          {/* 네트 */}
          <Line
            x1="5"
            y1={courtHeight / 2}
            x2={courtWidth - 5}
            y2={courtHeight / 2}
            stroke={theme.colors.badminton.net}
            strokeWidth="3"
          />
          
          {/* 서비스 라인들 */}
          <Line
            x1={courtWidth * 0.15}
            y1="5"
            x2={courtWidth * 0.15}
            y2={courtHeight - 5}
            stroke={theme.colors.badminton.courtLines}
            strokeWidth="1"
            opacity="0.8"
          />
          <Line
            x1={courtWidth * 0.85}
            y1="5"
            x2={courtWidth * 0.85}
            y2={courtHeight - 5}
            stroke={theme.colors.badminton.courtLines}
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* 단식 사이드라인 (복식일 때만 표시) */}
          {gameType === 'doubles' && (
            <>
              <Line
                x1={courtWidth * 0.1}
                y1={courtHeight * 0.25}
                x2={courtWidth * 0.1}
                y2={courtHeight * 0.75}
                stroke={theme.colors.badminton.courtLines}
                strokeWidth="1"
                opacity="0.6"
              />
              <Line
                x1={courtWidth * 0.9}
                y1={courtHeight * 0.25}
                x2={courtWidth * 0.9}
                y2={courtHeight * 0.75}
                stroke={theme.colors.badminton.courtLines}
                strokeWidth="1"
                opacity="0.6"
              />
            </>
          )}
        </Svg>
        
        {/* 플레이어들 */}
        {players.map((player, index) => renderPlayer(player, index))}
        
        {/* 셔틀콕 (게임 중일 때만) */}
        {courtStatus === 'occupied' && renderShuttlecock()}
      </View>
      
      {/* 코트 정보 */}
      <View style={styles.courtInfo}>
        <Chip
          icon="badminton"
          style={[
            styles.statusChip,
            { backgroundColor: getCourtColor() }
          ]}
          textStyle={{ color: theme.colors.surface }}
        >
          {gameType === 'singles' ? '단식' : gameType === 'doubles' ? '복식' : '혼복'}
        </Chip>
        
        <Chip
          style={[
            styles.statusChip,
            { 
              backgroundColor: courtStatus === 'available' 
                ? theme.colors.success 
                : courtStatus === 'occupied'
                ? theme.colors.warning
                : theme.colors.info
            }
          ]}
          textStyle={{ color: theme.colors.surface }}
        >
          {courtStatus === 'available' ? '사용가능' : 
           courtStatus === 'occupied' ? '게임중' : '예약됨'}
        </Chip>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  courtContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  court: {
    borderRadius: theme.borderRadius.base,
  },
  playerContainer: {
    alignItems: 'center',
  },
  playerChip: {
    marginTop: theme.spacing.xs,
    height: 20,
  },
  shuttlecockContainer: {
    position: 'absolute',
    top: '45%',
    left: '60%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  courtInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
  },
});

export default CourtView;