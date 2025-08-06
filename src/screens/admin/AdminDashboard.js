// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { ScrollView, StyleSheet, Alert } from 'react-native';
// eslint-disable-next-line no-unused-vars
import { Card, Title, Paragraph, Button, List, Chip } from 'react-native-paper';
import adminService from '../../services/AdminService';
import boardService from '../../services/BoardService';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentActions, setRecentActions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      await adminService.initialize();
      await boardService.initialize();
      
      const adminStats = await adminService.getStatistics();
      const actions = await adminService.getAdminActions(10);
      
      setStats(adminStats);
      setRecentActions(actions);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Alert.alert('오류', '관리자 데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!adminService.isAdmin(user?.role)) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>접근 권한 없음</Title>
            <Paragraph>관리자 권한이 필요합니다.</Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>관리자 대시보드</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>통계</Title>
          <Paragraph>총 게시글: {stats.totalPosts || 0}</Paragraph>
          <Paragraph>고정 게시글: {stats.pinnedPosts || 0}</Paragraph>
          <Paragraph>오늘 게시글: {stats.todayPosts || 0}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>최근 관리자 작업</Title>
          {recentActions.map((action, index) => (
            <List.Item
              key={index}
              title={action.action}
              description={`${action.details} - ${action.timestamp}`}
              left={() => <Chip mode="outlined">{action.adminName}</Chip>}
            />
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>관리 기능</Title>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('PostManagement')}
            style={styles.button}
          >
            게시글 관리
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('CategoryManagement')}
            style={styles.button}
          >
            카테고리 관리
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('UserManagement')}
            style={styles.button}
          >
            사용자 관리
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  button: {
    marginVertical: 4,
  },
});

export default AdminDashboard;
