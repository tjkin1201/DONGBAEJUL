import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Button, 
  Chip, 
  Searchbar,
  FAB,
  ActivityIndicator 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clubAPI } from '../../services/api';
import theme from '../../utils/theme';

const ClubsScreen = ({ navigation }) => {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClubs, setFilteredClubs] = useState([]);

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [searchQuery, clubs]);

  const loadClubs = async () => {
    try {
      setIsLoading(true);
      const response = await clubAPI.getClubs();
      setClubs(response.data.data || []);
    } catch (error) {
      console.error('클럽 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClubs();
    setRefreshing(false);
  };

  const filterClubs = () => {
    if (!searchQuery.trim()) {
      setFilteredClubs(clubs);
      return;
    }

    const filtered = clubs.filter(club =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClubs(filtered);
  };

  const renderClubCard = ({ item: club }) => (
    <Card style={styles.clubCard} onPress={() => navigation.navigate('ClubDetail', { clubId: club._id })}>
      <Card.Content>
        <View style={styles.clubHeader}>
          <Avatar.Image
            size={60}
            source={{ uri: club.clubImage || 'https://via.placeholder.com/60' }}
            style={styles.clubAvatar}
          />
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubLocation}>📍 {club.location}</Text>
            <Text style={styles.clubMembers}>멤버 {club.members.length}명</Text>
          </View>
          <View style={styles.clubActions}>
            <Chip
              mode="outlined"
              textStyle={[styles.chipText, { color: theme.colors.level[club.level] }]}
              style={[styles.levelChip, { borderColor: theme.colors.level[club.level] }]}
            >
              {club.level === 'beginner' ? '초급' : 
               club.level === 'intermediate' ? '중급' : 
               club.level === 'advanced' ? '고급' : '전문가'}
            </Chip>
          </View>
        </View>

        <Text style={styles.clubDescription} numberOfLines={2}>
          {club.description}
        </Text>

        <View style={styles.clubFooter}>
          <View style={styles.clubStats}>
            <Text style={styles.statText}>
              활동점수 {club.activityScore || 0}
            </Text>
            <Text style={styles.statText}>
              주 {club.weeklyGames || 0}회 활동
            </Text>
          </View>
          
          <Button
            mode="contained"
            compact
            onPress={() => handleJoinClub(club._id)}
            style={styles.joinButton}
          >
            가입하기
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const handleJoinClub = async (clubId) => {
    try {
      await clubAPI.joinClub(clubId);
      navigation.navigate('ClubDetail', { clubId });
    } catch (error) {
      console.error('클럽 가입 오류:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>클럽을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="클럽 이름, 지역으로 검색..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredClubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '검색 결과가 없습니다' : '등록된 클럽이 없습니다'}
            </Text>
          </View>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ClubCreate')}
      />
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
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  clubCard: {
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  clubAvatar: {
    marginRight: theme.spacing.md,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubLocation: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubMembers: {
    fontSize: 14,
    color: theme.colors.text,
  },
  clubActions: {
    alignItems: 'flex-end',
  },
  levelChip: {
    marginBottom: theme.spacing.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clubDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubStats: {
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default ClubsScreen;