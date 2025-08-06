import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';
import { colors } from '../utils/theme';

// 상황별 정보 카드 컴포넌트
export default function StatusCard({ 
  title, 
  subtitle, 
  content, 
  status = 'normal',
  icon,
  onPress,
  style 
}) {
  const getCardStyle = () => {
    const baseStyle = styles.card;
    const statusStyle = styles[`card_${status}`];
    return [baseStyle, statusStyle, style];
  };

  const getIconColor = () => {
    switch (status) {
      case 'active': return colors.primary;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const CardContent = () => (
    <Card.Content style={styles.content}>
      <View style={styles.header}>
        {icon && (
          <Icon 
            source={icon} 
            size={24} 
            color={getIconColor()} 
          />
        )}
        <View style={styles.titleContainer}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMedium" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {content && (
        <View style={styles.contentContainer}>
          {typeof content === 'string' ? (
            <Text variant="bodyLarge" style={styles.contentText}>
              {content}
            </Text>
          ) : (
            content
          )}
        </View>
      )}
    </Card.Content>
  );

  return (
    <Card style={getCardStyle()}>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <CardContent />
        </TouchableOpacity>
      ) : (
        <CardContent />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
    borderRadius: 12,
  },
  card_normal: {
    backgroundColor: colors.surface,
  },
  card_active: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  card_success: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  card_warning: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  card_error: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  contentContainer: {
    marginTop: 8,
  },
  contentText: {
    color: colors.text,
    lineHeight: 20,
  },
});