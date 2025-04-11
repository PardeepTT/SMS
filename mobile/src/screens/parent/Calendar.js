import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  useTheme,
  SegmentedButtons,
  Portal,
  Modal,
  IconButton,
  Chip,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { AuthContext } from '../../context/AuthContext';
import CalendarEvent from '../../components/CalendarEvent';
import { getEvents } from '../../utils/api';
import { formatDate, isToday, isSameDay } from '../../utils/dateUtils';

const Calendar = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('month');
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    schoolEvents: true,
    assignments: true,
    meetings: true,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  useEffect(() => {
    if (events.length > 0) {
      updateMarkedDates();
      filterEventsByDate(selectedDate);
    }
  }, [events, selectedDate, filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await getEvents(user.id, user.role);
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = events.filter(event => {
      if (event.type === 'school' && filters.schoolEvents) return true;
      if (event.type === 'assignment' && filters.assignments) return true;
      if (event.type === 'meeting' && filters.meetings) return true;
      return false;
    });
    setFilteredEvents(filtered);
  };

  const updateMarkedDates = () => {
    const marked = {};
    
    filteredEvents.forEach(event => {
      if (marked[event.date]) {
        // If there's already an event on this date, update the dots
        marked[event.date].dots.push({
          key: event.id,
          color: getEventColor(event.type),
        });
      } else {
        // First event on this date
        marked[event.date] = {
          dots: [
            {
              key: event.id,
              color: getEventColor(event.type),
            },
          ],
        };
      }
    });
    
    // Add special marking for selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = theme.colors.primary + '40'; // With opacity
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary + '40',
        dots: [],
      };
    }
    
    setMarkedDates(marked);
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'school':
        return '#4CAF50'; // green
      case 'assignment':
        return '#FF9800'; // orange
      case 'meeting':
        return '#2196F3'; // blue
      default:
        return '#9E9E9E'; // grey
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'school':
        return 'school';
      case 'assignment':
        return 'book-outline';
      case 'meeting':
        return 'account-group';
      default:
        return 'calendar';
    }
  };

  const filterEventsByDate = (date) => {
    if (!date) return;
    
    // Filter events by selected date
    const filtered = filteredEvents.filter(event => {
      // For month view - exact date match
      if (view === 'month') {
        return event.date === date;
      }
      
      // For week view - events within selected week
      // This would need more sophisticated logic in real implementation
      return true;
    });
    
    setFilteredEvents(filtered);
  };

  const onDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
  };

  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName],
    });
  };

  const renderEventItem = ({ item }) => (
    <CalendarEvent
      event={item}
      onPress={() => handleEventPress(item)}
    />
  );

  const renderEventModal = () => (
    <Portal>
      <Modal
        visible={eventModalVisible}
        onDismiss={() => setEventModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        {selectedEvent && (
          <>
            <View style={styles.modalHeader}>
              <IconButton
                icon={getEventIcon(selectedEvent.type)}
                size={24}
                color={getEventColor(selectedEvent.type)}
                style={styles.eventIcon}
              />
              <Title style={styles.modalTitle}>{selectedEvent.title}</Title>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setEventModalVisible(false)}
                style={styles.closeButton}
              />
            </View>

            <Divider style={styles.modalDivider} />

            <View style={styles.modalBody}>
              <View style={styles.eventDetail}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formatDate(selectedEvent.date)}</Text>
              </View>

              {selectedEvent.time && (
                <View style={styles.eventDetail}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.time}</Text>
                </View>
              )}

              {selectedEvent.location && (
                <View style={styles.eventDetail}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.location}</Text>
                </View>
              )}

              <View style={styles.eventDetail}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Chip
                  style={{
                    backgroundColor: getEventColor(selectedEvent.type) + '20',
                  }}
                  textStyle={{
                    color: getEventColor(selectedEvent.type),
                  }}
                >
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </Chip>
              </View>

              {selectedEvent.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Paragraph style={styles.description}>
                    {selectedEvent.description}
                  </Paragraph>
                </View>
              )}
            </View>

            <Divider style={styles.modalDivider} />

            <View style={styles.modalFooter}>
              {selectedEvent.type === 'meeting' && (
                <Button
                  mode="contained"
                  style={styles.actionButton}
                  onPress={() => {
                    setEventModalVisible(false);
                    // Navigate to messaging with the teacher
                    if (selectedEvent.teacherId) {
                      navigation.navigate('Messaging', {
                        recipientId: selectedEvent.teacherId,
                        recipientName: selectedEvent.teacherName,
                      });
                    }
                  }}
                >
                  Message Teacher
                </Button>
              )}
              
              <Button
                mode="outlined"
                onPress={() => setEventModalVisible(false)}
                style={styles.cancelButton}
              >
                Close
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Calendar" />
        <Appbar.Action icon="refresh" onPress={loadEvents} />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filters:</Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={filters.schoolEvents}
            onPress={() => toggleFilter('schoolEvents')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filters.schoolEvents
                  ? getEventColor('school') + '20'
                  : undefined,
              },
            ]}
            icon="school"
          >
            School Events
          </Chip>
          <Chip
            selected={filters.assignments}
            onPress={() => toggleFilter('assignments')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filters.assignments
                  ? getEventColor('assignment') + '20'
                  : undefined,
              },
            ]}
            icon="book-outline"
          >
            Assignments
          </Chip>
          <Chip
            selected={filters.meetings}
            onPress={() => toggleFilter('meetings')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filters.meetings
                  ? getEventColor('meeting') + '20'
                  : undefined,
              },
            ]}
            icon="account-group"
          >
            Meetings
          </Chip>
        </View>
      </View>

      <SegmentedButtons
        value={view}
        onValueChange={setView}
        buttons={[
          {
            value: 'month',
            label: 'Month',
            icon: 'calendar-month',
          },
          {
            value: 'week',
            label: 'Week',
            icon: 'calendar-week',
          },
        ]}
        style={styles.viewToggle}
      />

      <RNCalendar
        current={selectedDate}
        onDayPress={onDateSelect}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
          dotColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.primary,
        }}
      />

      <View style={styles.eventsContainer}>
        <Title style={styles.eventsTitle}>
          {isToday(selectedDate)
            ? 'Today\'s Events'
            : `Events for ${formatDate(selectedDate)}`}
        </Title>
        
        {filteredEvents.length > 0 ? (
          <FlatList
            data={filteredEvents.filter(event => event.date === selectedDate)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEventItem}
            contentContainerStyle={styles.eventsList}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                No events scheduled for this day
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {renderEventModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  filterLabel: {
    marginLeft: 8,
    marginBottom: 4,
    fontSize: 14,
    color: '#757575',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  viewToggle: {
    margin: 8,
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsTitle: {
    marginBottom: 16,
  },
  eventsList: {
    flexGrow: 1,
  },
  emptyCard: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
  },
  eventIcon: {
    marginRight: 8,
  },
  modalDivider: {
    marginVertical: 12,
  },
  modalBody: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginRight: 8,
  },
  cancelButton: {
    marginLeft: 8,
  },
});

export default Calendar;
