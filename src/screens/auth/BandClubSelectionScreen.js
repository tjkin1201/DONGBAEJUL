import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Chip, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import theme from '../../utils/theme';

const BandClubSelectionScreen = ({ navigation }) => {
  const { getBandClubs, selectBandClub, user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);

  useEffect(() => {
    loadBandClubs();
  }, []);

  const loadBandClubs = async () => {
    try {
      setLoading(true);
      const bandClubs = await getBandClubs();
      setClubs(bandClubs);
    } catch (error) {
      console.error('Band 클럽 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClubSelect = async (clubKey) => {
    try {
      setSelecting(true);
      setSelectedClubId(clubKey);
      
      const clubData = await selectBandClub(clubKey);
      
      // 클럽 선택 완료 후 메인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('클럽 선택 실패:', error);
      setSelectedClubId(null);
    } finally {
      setSelecting(false);
    }
  };

  const handleSkip = () => {
    // 클럽 선택 없이 메인으로 이동 (일반 사용자로)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1976D2', '#42A5F5', '#64B5F6']}
        style={styles.background}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.surface} />
            <Text style={styles.loadingText}>
              네이버 밴드에서 배드민턴 동호회를 찾고 있습니다...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1976D2', '#42A5F5', '#64B5F6']}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              환영합니다, {user?.name}님! 🏸
            </Text>
            <Text style={styles.subtitle}>
              어떤 배드민턴 동호회와 연결하시겠습니까?
            </Text>
          </View>

          {/* 클럽 목록 */}
          <View style={styles.clubListContainer}>
            {clubs.length > 0 ? (
              clubs.map((club) => (
                <Card key={club.band_key} style={styles.clubCard}>
                  <Card.Content>
                    <View style={styles.clubHeader}>
                      <View style={styles.clubInfo}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        <Text style={styles.clubDescription}>
                          {club.description || '배드민턴을 함께 즐기는 동호회'}
                        </Text>
                      </View>
                      <View style={styles.clubMeta}>
                        <Chip
                          icon="account-group"
                          style={styles.memberChip}
                          textStyle={styles.chipText}
                        >
                          {club.member_count || 0}명
                        </Chip>
                      </View>
                    </View>
                    
                    <Button
                      mode="contained"
                      onPress={() => handleClubSelect(club.band_key)}
                      loading={selecting && selectedClubId === club.band_key}
                      disabled={selecting}
                      style={styles.selectButton}
                      labelStyle={styles.selectButtonText}
                    >
                      {selecting && selectedClubId === club.band_key 
                        ? '연결 중...' 
                        : '이 동호회와 연결하기'
                      }
                    </Button>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Surface style={styles.noClubsContainer} elevation={2}>
                <Text style={styles.noClubsIcon}>🔍</Text>
                <Text style={styles.noClubsTitle}>
                  배드민턴 동호회를 찾을 수 없습니다
                </Text>
                <Text style={styles.noClubsDescription}>
                  네이버 밴드에서 배드민턴 관련 동호회에{'\n'}
                  가입하신 후 다시 시도해주세요.
                </Text>
                <Text style={styles.noClubsHint}>
                  💡 '배드민턴', '배민', '셔틀콕' 등의 키워드가{'\n'}
                  포함된 밴드를 자동으로 찾습니다.
                </Text>
              </Surface>
            )}
          </View>

          {/* 건너뛰기 옵션 */}
          <View style={styles.skipContainer}>
            <Text style={styles.skipDescription}>
              지금 동호회를 선택하지 않고{'\n'}
              일반 사용자로 시작할 수도 있습니다.
            </Text>
            <Button
              mode="outlined"
              onPress={handleSkip}
              disabled={selecting}
              style={styles.skipButton}
              labelStyle={styles.skipButtonText}
            >
              나중에 설정하기
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.surface,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.surface,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.surface,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  clubListContainer: {
    marginBottom: theme.spacing.xl,
  },
  clubCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  clubInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  clubDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    lineHeight: 20,
  },
  clubMeta: {
    alignItems: 'flex-end',
  },
  memberChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.onPrimaryContainer,
  },
  selectButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  noClubsContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  noClubsIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
  },
  noClubsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  noClubsDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: theme.spacing.lg,
  },
  noClubsHint: {
    fontSize: 12,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  skipDescription: {
    fontSize: 14,
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  skipButton: {
    borderColor: theme.colors.surface,
    borderWidth: 2,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});

export default BandClubSelectionScreen;