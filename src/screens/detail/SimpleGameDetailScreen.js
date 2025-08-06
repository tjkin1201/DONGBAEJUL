import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const SimpleGameDetailScreen = ({ route, navigation }) => {
  const { gameId } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>게임 상세 정보</Text>
            <Text style={styles.gameId}>게임 ID: {gameId}</Text>
            <Text style={styles.description}>
              프리미엄 게임 상세 화면이 곧 완성됩니다!
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              뒤로가기
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  gameId: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 16,
  },
});

export default SimpleGameDetailScreen;
