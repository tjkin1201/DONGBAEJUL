import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Card, Button, Divider } from 'react-native-paper';
import bandAPIConfig from '../../services/bandAPIConfig';
import bandAPI from '../../services/bandAPI';

export default function BandSetupScreen() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkBandAPIStatus();
  }, []);

  const checkBandAPIStatus = async () => {
    setIsConfigured(bandAPIConfig.isConfigured);
    
    // 저장된 토큰으로 세션 복원 시도
    try {
      const session = await bandAPI.restoreSession();
      if (session) {
        setUserInfo(session.userInfo);
      }
    } catch (error) {
      console.log('세션 복원 실패:', error);
    }
  };

  const handleBandLogin = async () => {
    if (!isConfigured) {
      Alert.alert(
        '설정 필요',
        'Band API 설정이 필요합니다. 개발자 가이드를 확인해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '가이드 보기', onPress: openSetupGuide },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await bandAPI.startBandLogin();
      setUserInfo(result.userInfo);
      Alert.alert('성공', 'Band 로그인이 완료되었습니다!');
    } catch (error) {
      Alert.alert('오류', error.message || 'Band 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindBands = async () => {
    if (!userInfo) {
      Alert.alert('알림', '먼저 Band 로그인을 해주세요.');
      return;
    }

    setLoading(true);
    try {
      const badmintonBands = await bandAPI.findBadmintonBands();
      Alert.alert(
        '검색 결과',
        `배드민턴 관련 밴드 ${badmintonBands.length}개를 찾았습니다!`
      );
    } catch (error) {
      Alert.alert('오류', '밴드 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await bandAPI.logout();
      setUserInfo(null);
      Alert.alert('완료', '로그아웃되었습니다.');
    } catch (error) {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  const openSetupGuide = () => {
    Linking.openURL('https://developers.band.us');
  };

  const openDocumentation = () => {
    Alert.alert(
      'Band API 설정 가이드',
      '1. https://developers.band.us 접속\n2. 개발자 등록 및 앱 생성\n3. .env 파일에 API 키 설정\n\n자세한 내용은 docs/band-api-setup.md 파일을 참조하세요.'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="🎵 네이버 밴드 API 연동" />
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.label}>API 설정 상태:</Text>
            <Text style={[styles.status, isConfigured ? styles.success : styles.warning]}>
              {isConfigured ? '✅ 설정 완료' : '⚠️ 설정 필요'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>로그인 상태:</Text>
            <Text style={[styles.status, userInfo ? styles.success : styles.info]}>
              {userInfo ? `✅ ${userInfo.name}` : 'ℹ️ 로그인 필요'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>사용 모드:</Text>
            <Text style={[styles.status, styles.info]}>
              {bandAPIConfig.shouldUseMockAPI() ? '🔧 Mock API' : '🌐 실제 API'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="🔧 기능 테스트" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleBandLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {userInfo ? 'Band 재로그인' : 'Band 로그인'}
          </Button>

          <Button
            mode="outlined"
            onPress={handleFindBands}
            disabled={!userInfo || loading}
            style={styles.button}
          >
            배드민턴 밴드 찾기
          </Button>

          {userInfo && (
            <Button
              mode="text"
              onPress={handleLogout}
              style={styles.button}
            >
              로그아웃
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="📖 설정 가이드" />
        <Card.Content>
          <Text style={styles.description}>
            네이버 밴드 API를 사용하여 동호회 데이터를 가져올 수 있습니다.
          </Text>

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            onPress={openSetupGuide}
            style={styles.button}
          >
            Band 개발자 사이트 열기
          </Button>

          <Button
            mode="text"
            onPress={openDocumentation}
            style={styles.button}
          >
            설정 가이드 보기
          </Button>
        </Card.Content>
      </Card>

      {bandAPIConfig.shouldUseMockAPI() && (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Text style={styles.warningText}>
              ⚠️ 현재 Mock API를 사용 중입니다.{'\n'}
              실제 Band API를 사용하려면 API 키 설정이 필요합니다.
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  success: {
    color: '#4CAF50',
  },
  warning: {
    color: '#FF9800',
  },
  info: {
    color: '#2196F3',
  },
  button: {
    marginVertical: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
  },
});
