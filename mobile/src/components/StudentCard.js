import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar, ProgressBar, useTheme } from 'react-native-paper';
import UserAvatar from './UserAvatar';

const StudentCard = ({ student, onPress }) => {
  const theme = useTheme();

  // Determine colors based on grade and attendance
  const getGradeColor = (grade) => {
    if (grade >= 90) return '#4CAF50'; // Green
    if (grade >= 80) return '#8BC34A'; // Light Green
    if (grade >= 70) return '#FFC107'; // Yellow
    if (grade >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return '#4CAF50'; // Green
    if (rate >= 80) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  // Get letter grade based on numeric score
  const getLetterGrade = (grade) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          {student.avatar ? (
            <UserAvatar user={student} size={60} />
          ) : (
            <Avatar.Text
              size={60}
              label={student.name.substring(0, 2).toUpperCase()}
              backgroundColor={theme.colors.primary}
              color="#fff"
            />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Title style={styles.name}>{student.name}</Title>
          <Paragraph style={styles.details}>Grade {student.grade}</Paragraph>
          
          {student.averageGrade !== undefined && (
            <View style={styles.statsRow}>
              <Chip 
                style={[styles.gradeChip, { backgroundColor: getGradeColor(student.averageGrade) + '20' }]}
                textStyle={{ color: getGradeColor(student.averageGrade) }}
              >
                {student.averageGrade}% ({getLetterGrade(student.averageGrade)})
              </Chip>
              
              {student.attendanceRate !== undefined && (
                <Chip 
                  style={[styles.attendanceChip, { backgroundColor: getAttendanceColor(student.attendanceRate) + '20' }]}
                  textStyle={{ color: getAttendanceColor(student.attendanceRate) }}
                >
                  {student.attendanceRate}% Att.
                </Chip>
              )}
            </View>
          )}
          
          {student.recentAssignments !== undefined && (
            <View style={styles.progressContainer}>
              <Paragraph style={styles.progressLabel}>
                {student.recentAssignments.completed}/{student.recentAssignments.total} Recent Assignments
              </Paragraph>
              <ProgressBar 
                progress={student.recentAssignments.total > 0 ? student.recentAssignments.completed / student.recentAssignments.total : 0} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  avatarContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
    marginBottom: 8,
    color: '#757575',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gradeChip: {
    marginRight: 8,
    height: 28,
  },
  attendanceChip: {
    height: 28,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default StudentCard;
