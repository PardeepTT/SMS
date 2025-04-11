import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Text, useTheme, IconButton } from 'react-native-paper';
import { formatDate, isOverdue } from '../utils/dateUtils';

const AssignmentCard = ({ assignment, detailed = false, onPress, actions }) => {
  const theme = useTheme();

  // Calculate assignment status
  const isLate = isOverdue(assignment.dueDate);
  const isCompleted = assignment.completed;
  
  // Determine status color
  const getStatusColor = () => {
    if (isCompleted) return '#4CAF50'; // Green for completed
    if (isLate) return '#F44336'; // Red for late/overdue
    return '#FF9800'; // Orange for pending
  };

  // Determine status text
  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isLate) return 'Overdue';
    return 'Pending';
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <Card 
      style={[styles.card, onPress && styles.clickable]} 
      onPress={onPress}
      elevation={1}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{assignment.title}</Title>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor }}
            >
              {statusText}
            </Chip>
          </View>
          
          {assignment.points && (
            <Chip style={styles.pointsChip}>
              {assignment.points} pts
            </Chip>
          )}
        </View>
        
        <View style={styles.details}>
          <Paragraph style={styles.subject}>
            {assignment.subject}
          </Paragraph>
          <Text style={styles.dueDate}>
            <IconButton 
              icon="calendar" 
              size={14} 
              style={styles.icon} 
              color="#757575" 
            />
            Due: {formatDate(assignment.dueDate)}
          </Text>
        </View>
        
        {detailed && assignment.description && (
          <Paragraph style={styles.description}>
            {assignment.description}
          </Paragraph>
        )}
        
        {detailed && assignment.attachments && assignment.attachments.length > 0 && (
          <View style={styles.attachments}>
            <Text style={styles.attachmentsLabel}>Attachments:</Text>
            <View style={styles.attachmentChips}>
              {assignment.attachments.map((attachment, index) => (
                <Chip 
                  key={index}
                  style={styles.attachmentChip}
                  icon="file-document-outline"
                >
                  {attachment.name}
                </Chip>
              ))}
            </View>
          </View>
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
    marginBottom: 12,
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
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    marginRight: 8,
    flex: 1,
  },
  statusChip: {
    marginRight: 4,
    height: 26,
  },
  pointsChip: {
    height: 26,
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subject: {
    color: '#757575',
    fontSize: 14,
  },
  dueDate: {
    fontSize: 13,
    color: '#757575',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
    padding: 0,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
  },
  attachments: {
    marginTop: 8,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attachmentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachmentChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

export default AssignmentCard;
