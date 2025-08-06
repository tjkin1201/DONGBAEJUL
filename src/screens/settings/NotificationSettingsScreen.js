import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import {
  Appbar,
  List,
  Switch,
  useTheme,
  Text,
  Card,
  Button,
  Divider
} from 'react-native-paper';

import { useNotifications } from '../../context/NotificationContext';
import ChatService from '../../services/ChatService';

const NotificationSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { 
    isInitialized, 
    pushToken, 
    areNotificationsEnabled,
    requestPermissions 
  } = useNotifications();

  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    vibration: true,
    mentions: true,
    privateMessages: true,
    groupMessages: false
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await ChatService.getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      // Use default settings
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    const enabled = await areNotificationsEnabled();
    setPermissionGranted(enabled);
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await ChatService.updateNotificationSettings(newSettings);
  };

  const handleRequestPermissions = async () => {
    try {
      const permission = await requestPermissions();
      if (permission.granted) {
        setPermissionGranted(true);
        Alert.alert('알림 권한 허용', '푸시 알림이 활성화되었습니다.');
      } else {
        Alert.alert(
          '알림 권한 거부', 
          '설정에서 알림 권한을 허용해주세요.',
          [
            { text: '확인', style: 'default' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '알림 권한을 요청하는 중 오류가 발생했습니다.');
    }
  };

  const renderPermissionCard = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>
          알림 권한
        </Text>
        <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
          새로운 메시지 알림을 받으려면 권한이 필요합니다.
        </Text>
        <View style={styles.permissionStatus}>
          <Text variant="bodyMedium" style={{ 
            color: permissionGranted ? theme.colors.primary : theme.colors.error 
          }}>
            상태: {permissionGranted ? '허용됨' : '거부됨'}
          </Text>
        </View>
        {!permissionGranted && (
          <Button 
            mode="contained" 
            onPress={handleRequestPermissions}
            style={styles.permissionButton}
          >
            권한 요청
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderTokenCard = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>
          디바이스 정보
        </Text>
        <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
          초기화 상태: {isInitialized ? '완료' : '진행 중'}
        </Text>
        {pushToken && (
          <Text variant="bodySmall" style={[styles.tokenText, { color: theme.colors.outline }]}>
            토큰: {pushToken.slice(0, 50)}...
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="알림 설정" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>설정을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="알림 설정" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {renderPermissionCard()}
        {renderTokenCard()}

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              알림 설정
            </Text>
            
            <List.Item
              title="알림 활성화"
              description="모든 알림을 받습니다"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => updateSetting('enabled', value)}
                />
              )}
            />

            <Divider />

            <List.Item
              title="소리"
              description="알림 소리를 재생합니다"
              left={props => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.sound}
                  onValueChange={(value) => updateSetting('sound', value)}
                  disabled={!settings.enabled}
                />
              )}
            />

            <Divider />

            <List.Item
              title="진동"
              description="알림 시 진동을 합니다"
              left={props => <List.Icon {...props} icon="vibrate" />}
              right={() => (
                <Switch
                  value={settings.vibration}
                  onValueChange={(value) => updateSetting('vibration', value)}
                  disabled={!settings.enabled}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              메시지 알림
            </Text>
            
            <List.Item
              title="개인 메시지"
              description="1:1 개인 채팅 메시지"
              left={props => <List.Icon {...props} icon="message-text" />}
              right={() => (
                <Switch
                  value={settings.privateMessages}
                  onValueChange={(value) => updateSetting('privateMessages', value)}
                  disabled={!settings.enabled}
                />
              )}
            />

            <Divider />

            <List.Item
              title="멘션"
              description="그룹 채팅에서 나를 언급한 메시지"
              left={props => <List.Icon {...props} icon="at" />}
              right={() => (
                <Switch
                  value={settings.mentions}
                  onValueChange={(value) => updateSetting('mentions', value)}
                  disabled={!settings.enabled}
                />
              )}
            />

            <Divider />

            <List.Item
              title="그룹 메시지"
              description="모든 그룹 채팅 메시지"
              left={props => <List.Icon {...props} icon="account-multiple" />}
              right={() => (
                <Switch
                  value={settings.groupMessages}
                  onValueChange={(value) => updateSetting('groupMessages', value)}
                  disabled={!settings.enabled}
                />
              )}
            />
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 16,
  },
  permissionStatus: {
    marginBottom: 16,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  tokenText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 8,
  },
  bottomPadding: {
    height: 32,
  },
});

export default NotificationSettingsScreen;
