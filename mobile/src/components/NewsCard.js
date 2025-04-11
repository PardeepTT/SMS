import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, useTheme, Text, IconButton } from 'react-native-paper';
import { formatDateTime } from '../utils/dateUtils';

const NewsCard = ({ news, detailed = false, onPress, actions }) => {
  const theme = useTheme();

  // Determine category color and icon
  const getCategoryColor = (category) => {
    switch (category) {
      case 'announcement':
        return '#2196F3'; // Blue
      case 'event':
        return '#4CAF50'; // Green
      case 'newsletter':
        return '#FF9800'; // Orange
      default:
        return '#757575'; // Grey
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'announcement':
        return 'bullhorn';
      case 'event':
        return 'calendar-star';
      case 'newsletter':
        return 'newspaper-variant';
      default:
        return 'information';
    }
  };

  const categoryColor = getCategoryColor(news.category);
  const categoryIcon = getCategoryIcon(news.category);

  // Format category title
  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card
      style={[styles.card, onPress && styles.clickable]}
      onPress={onPress}
      elevation={1}
    >
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{news.title}</Title>
          <Chip
            icon={categoryIcon}
            style={[styles.categoryChip, { backgroundColor: categoryColor + '15' }]}
            textStyle={{ color: categoryColor }}
          >
            {formatCategory(news.category)}
          </Chip>
        </View>

        {news.important && (
          <Chip
            icon="alert"
            style={styles.importantChip}
          >
            Important
          </Chip>
        )}

        <View style={styles.metaInfo}>
          <Text style={styles.author}>
            {news.authorName}
          </Text>
          <Text style={styles.date}>
            {formatDateTime(news.publishDate)}
          </Text>
        </View>

        <Paragraph style={styles.content} numberOfLines={detailed ? undefined : 3}>
          {news.content}
        </Paragraph>

        {!detailed && news.content.length > 150 && (
          <Text style={styles.readMore}>Read more...</Text>
        )}
      </Card.Content>

      {actions && (
        <Card.Actions style={styles.actions}>
          {actions}
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  clickable: {
    cursor: 'pointer',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  categoryChip: {
    marginBottom: 4,
  },
  importantChip: {
    backgroundColor: '#FFEBEE',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: '#616161',
  },
  date: {
    fontSize: 14,
    color: '#757575',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    color: '#2196F3',
    marginTop: 4,
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

export default NewsCard;
