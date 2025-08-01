import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  Chip, 
  List,
  Divider,
  Surface,
  IconButton,
  ActivityIndicator,
  ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { clubAPI, gameAPI } from '../../services/api';
import theme from '../../utils/theme';

const ClubDetailScreen = ({ route, navigation }) => {
  const { clubId } = route.params;
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState(null);

  useEffect(() => {
    loadClubDetails();
  }, [clubId]);

  const loadClubDetails = async () => {
    try {
      setIsLoading(true);
      const [clubRes, gamesRes] = await Promise.all([
        clubAPI.getClubById(clubId),
        gameAPI.getGames({ clubId, limit: 5 })
      ]);

      const clubData = clubRes.data.data;
      setClub(clubData);
      setMembers(clubData.members || []);
      setRecentGames(gamesRes.data.data || []);

      // 내가 멤버인지 확인
      const myMembership = clubData.members?.find(member => member.user._id === user.id);
      setIsMember(!!myMembership);
      setMemberRole(myMembership?.role || null);

    } catch (error) {
      console.error('클럽 상세 정보 로드 오류:', error);
      Alert.alert('오류', '클럽 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClub = async () => {
    try {
      setIsJoining(true);
      await clubAPI.joinClub(clubId);
      
      Alert.alert(
        '가입 신청 완료',
        '클럽 가입 신청이 완료되었습니다. 관리자 승인을 기다려주세요.',
        [{ text: '확인' }]
      );
      
      await loadClubDetails(); // 정보 새로고침
    } catch (error) {
      console.error('클럽 가입 오류:', error);
      Alert.alert('가입 실패', error.response?.data?.error?.message || '가입 신청 중 오류가 발생했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClub = () => {
    Alert.alert(
      '클럽 탈퇴',
      '정말로 이 클럽에서 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await clubAPI.leaveClub(clubId);
              Alert.alert('탈퇴 완료', '클럽에서 탈퇴했습니다.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('탈퇴 실패', '탈퇴 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const getLevelColor = (level) => {
    return theme.colors.level[level] || theme.colors.primary;
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'expert': return '전문가';
      default: return '초급';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'manager': return '매니저';
      case 'member': return '멤버';
      default: return '멤버';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return theme.colors.error;
      case 'manager': return theme.colors.warning;
      case 'member': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  };

  const renderClubHeader = () => (
    <Card style={styles.headerCard}>
      <Card.Content>
        <View style={styles.clubHeader}>
          <Avatar.Image
            size={80}
            source={{ uri: club?.clubImage || 'https://via.placeholder.com/80' }}
            style={styles.clubAvatar}
          />
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club?.name}</Text>
            <View style={styles.clubMeta}>
              <Chip
                mode="outlined"
                textStyle={[styles.chipText, { color: getLevelColor(club?.level) }]}
                style={[styles.levelChip, { borderColor: getLevelColor(club?.level) }]}
              >
                {getLevelText(club?.level)}
              </Chip>
              <Chip mode="outlined" style={styles.memberChip}>
                멤버 {members.length}명
              </Chip>
            </View>
            <Text style={styles.clubLocation}>📍 {club?.location}</Text>
          </View>
        </View>

        <Text style={styles.clubDescription}>{club?.description}</Text>

        {/* 클럽 통계 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{club?.activityScore || 0}</Text>
            <Text style={styles.statLabel}>활동점수</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{club?.weeklyGames || 0}</Text>
            <Text style={styles.statLabel}>주간 게임</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{club?.monthlyGames || 0}</Text>
            <Text style={styles.statLabel}>월간 게임</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{club?.createdAt ? new Date(club.createdAt).getFullYear() : '-'}</Text>
            <Text style={styles.statLabel}>설립년도</Text>
          </View>
        </View>

        {/* 가입/탈퇴 버튼 */}
        <View style={styles.actionContainer}>
          {!isMember ? (
            <Button
              mode="contained"
              onPress={handleJoinClub}
              loading={isJoining}
              disabled={isJoining}
              style={styles.joinButton}
              labelStyle={styles.buttonText}
            >
              클럽 가입하기
            </Button>
          ) : (
            <View style={styles.memberActions}>
              <Chip
                mode="flat"
                textStyle={{ color: getRoleColor(memberRole) }}
                style={[styles.roleChip, { backgroundColor: `${getRoleColor(memberRole)}20` }]}
              >
                {getRoleText(memberRole)}
              </Chip>
              <Button
                mode="outlined"
                onPress={handleLeaveClub}
                style={styles.leaveButton}
                labelStyle={styles.leaveButtonText}
              >
                탈퇴하기
              </Button>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderMembersList = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>멤버 목록</Text>
          <Text style={styles.memberCount}>{members.length}명</Text>
        </View>

        {/* 멤버 역할별 분류 */}
        {['admin', 'manager', 'member'].map(role => {
          const roleMembers = members.filter(member => member.role === role);
          if (roleMembers.length === 0) return null;

          return (
            <View key={role} style={styles.roleSection}>
              <Text style={styles.roleTitle}>
                {getRoleText(role)} ({roleMembers.length}명)
              </Text>
              {roleMembers.map((member, index) => (
                <Surface key={member.user._id} style={styles.memberItem} elevation={1}>
                  <Avatar.Image
                    size={40}
                    source={{ uri: member.user.profileImage || 'https://via.placeholder.com/40' }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.user.name}</Text>
                    <Text style={styles.memberLevel}>
                      {getLevelText(member.user.level)} • 가입일: {new Date(member.joinedAt).toLocaleDateString('ko-KR')}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getRoleColor(role), fontSize: 12 }}
                    style={[styles.memberRoleChip, { borderColor: getRoleColor(role) }]}
                  >
                    {getRoleText(role)}
                  </Chip>
                </Surface>
              ))}
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );

  const renderRecentGames = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 게임</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Games', { clubId })}
            labelStyle={styles.seeAllText}
          >
            전체보기
          </Button>
        </View>

        {recentGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>최근 게임이 없습니다</Text>
            {isMember && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('GameCreate', { clubId })}
                style={styles.createGameButton}
              >
                게임 만들기
              </Button>
            )}
          </View>
        ) : (
          recentGames.map((game) => (
            <Surface 
              key={game._id} 
              style={styles.gameItem} 
              elevation={1}
              onTouchEnd={() => navigation.navigate('GameDetail', { gameId: game._id })}
            >
              <View style={styles.gameHeader}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDate}>
                  {new Date(game.gameDate).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              <Text style={styles.gameInfo}>
                🏸 {game.gameType} • 👥 {game.participants.length}/{game.maxParticipants}명
              </Text>
              {game.results?.isCompleted && (
                <Chip
                  mode="flat"
                  textStyle={{ color: theme.colors.success }}
                  style={styles.completedChip}
                >
                  완료
                </Chip>
              )}
            </Surface>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderClubRules = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>클럽 규칙</Text>
        <View style={styles.rulesContainer}>
          <Text style={styles.ruleText}>• 매너를 지키며 즐겁게 운동해요</Text>
          <Text style={styles.ruleText}>• 게임 참가 후 무단 불참은 금지입니다</Text>
          <Text style={styles.ruleText}>• 클럽 내 갈등은 관리자에게 문의해주세요</Text>
          <Text style={styles.ruleText}>• 회비는 매월 첫째 주에 납부해주세요</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderContactInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>연락처 정보</Text>
        <List.Item
          title="관리자 연락처"
          description={club?.adminContact || '010-1234-5678'}
          left={(props) => <List.Icon {...props} icon="phone" />}
          right={() => (
            <IconButton
              icon="phone"
              onPress={() => {
                if (club?.adminContact) {
                  Linking.openURL(`tel:${club.adminContact}`);
                }
              }}
            />
          )}
        />
        <Divider />
        <List.Item
          title="주요 활동 장소"
          description={club?.mainVenue || '강남 배드민턴 센터'}
          left={(props) => <List.Icon {...props} icon="map-marker" />}
          right={() => (
            <IconButton
              icon="directions"
              onPress={() => {
                // 지도 앱으로 연결 (추후 구현)
                Alert.alert('알림', '지도 연동 기능은 곧 추가될 예정입니다.');
              }}
            />
          )}
        />
        <Divider />
        <List.Item
          title="활동 시간"
          description={club?.activityTime || '매주 토요일 오후 2시-6시'}
          left={(props) => <List.Icon {...props} icon="clock" />}
        />
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>클럽 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>클럽 정보를 찾을 수 없습니다.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          돌아가기
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderClubHeader()}
        {renderMembersList()}
        {renderRecentGames()}
        {renderClubRules()}
        {renderContactInfo()}
        
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  clubAvatar: {
    marginRight: theme.spacing.lg,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  clubMeta: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  levelChip: {
    marginRight: theme.spacing.sm,
  },
  memberChip: {
    borderColor: theme.colors.outline,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clubLocation: {
    fontSize: 14,
    color: theme.colors.text,
  },
  clubDescription: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.roundness,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  actionContainer: {
    marginTop: theme.spacing.md,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleChip: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  leaveButton: {
    borderColor: theme.colors.error,
  },
  leaveButtonText: {
    color: theme.colors.error,
  },
  sectionCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  memberCount: {
    fontSize: 14,
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  roleSection: {
    marginBottom: theme.spacing.lg,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  memberAvatar: {
    marginRight: theme.spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  memberLevel: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  memberRoleChip: {
    marginLeft: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  createGameButton: {
    backgroundColor: theme.colors.secondary,
  },
  gameItem: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  gameDate: {
    fontSize: 14,
    color: theme.colors.text,
  },
  gameInfo: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  completedChip: {
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.success}20`,
  },
  rulesContainer: {
    marginTop: theme.spacing.sm,
  },
  ruleText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});

export default ClubDetailScreen;