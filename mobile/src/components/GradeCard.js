import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Chip, Paragraph, useTheme } from 'react-native-paper';

const GradeCard = ({ grade, detailed = false, actions }) => {
  const theme = useTheme();

  // Determine color based on grade
  const getGradeColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 80) return '#8BC34A'; // Light Green
    if (score >= 70) return '#FFC107'; // Yellow
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Get letter grade based on numeric score
  const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const gradeColor = getGradeColor(grade.score);
  const letterGrade = getLetterGrade(grade.score);

  return (
    <Card style={styles.card} elevation={1}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{grade.title}</Text>
            {grade.subject && (
              <Chip style={styles.subjectChip}>{grade.subject}</Chip>
            )}
          </View>
          <Paragraph style={styles.details}>
            {grade.date && `Date: ${grade.date}`}
            {grade.type && ` • ${grade.type}`}
            {grade.points && ` • ${grade.score}/${grade.points} points`}
          </Paragraph>
          {detailed && grade.feedback && (
            <Paragraph style={styles.feedback}>
              <Text style={styles.feedbackLabel}>Feedback: </Text>
              {grade.feedback}
            </Paragraph>
          )}
        </View>
        
        <View style={styles.rightContent}>
          <Avatar.Text
            size={detailed ? 50 : 40}
            label={letterGrade}
            style={[styles.gradeAvatar, { backgroundColor: gradeColor + '20' }]}
            labelStyle={{ color: gradeColor }}
          />
          <Text style={[styles.gradeText, { color: gradeColor }]}>
            {grade.score}%
          </Text>
        </View>
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
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginBottom: 4,
  },
  subjectChip: {
    height: 28,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#757575',
  },
  feedback: {
    marginTop: 8,
    fontSize: 14,
    color: '#616161',
  },
  feedbackLabel: {
    fontWeight: 'bold',
  },
  rightContent: {
    alignItems: 'center',
  },
  gradeAvatar: {
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

export default GradeCard;
