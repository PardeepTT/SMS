import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme, IconButton } from 'react-native-paper';
import { formatDate } from '../utils/dateUtils';

const CalendarEvent = ({ event, onPress }) => {
  const theme = useTheme();

  // Determine event type color
  const getEventColor = (type) => {
    switch (type) {
      case 'school':
        return '#4CAF50'; // Green
      case 'assignment':
        return '#FF9800'; // Orange
      case 'meeting':
        return '#2196F3'; // Blue
      case 'holiday':
        return '#9C27B0'; // Purple
      case 'deadline':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  // Determine event icon
  const getEventIcon = (type) => {
    switch (type) {
      case 'school':
        return 'school';
      case 'assignment':
        return 'book-open-variant';
      case 'meeting':
        return 'account-group';
      case 'holiday':
        return 'beach';
      case 'deadline':
        return 'clock-alert';
      default:
        return 'calendar';
    }
  };

  const eventColor = getEventColor(event.type);
  const eventIcon = getEventIcon(event.type);

  return (
    <Card
      style={[styles.card, onPress && styles.clickable]}
      onPress={onPress}
      elevation={1}
    >
      <Card.Content style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: eventColor + '15' }]}>
          <IconButton
            icon={eventIcon}
            size={24}
            color={eventColor}
            style={styles.icon}
          />
        </View>
        
        <View style={styles.eventDetails}>
          <Title style={styles.title}>{event.title}</Title>
          
          <View style={styles.detailsRow}>
            <IconButton
              icon="calendar"
              size={16}
              color="#757575"
              style={styles.detailIcon}
            />
            <Text style={styles.detailText}>{formatDate(event.date)}</Text>
            
            {event.time && (
              <>
                <IconButton
                  icon="clock-outline"
                  size={16}
                  color="#757575"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{event.time}</Text>
              </>
            )}
          </View>
          
          {event.location && (
            <View style={styles.detailsRow}>
              <IconButton
                icon="map-marker"
                size={16}
                color="#757575"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          )}
          
          {event.description && (
            <Paragraph style={styles.description} numberOfLines={2}>
              {event.description}
            </Paragraph>
          )}
        </View>
      </Card.Content>
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
  cardContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    borderRadius: 50,
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  icon: {
    margin: 0,
  },
  eventDetails: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailIcon: {
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    color: '#616161',
  },
});

export default CalendarEvent;
