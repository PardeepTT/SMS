import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  useTheme,
  Avatar,
  Divider,
  Surface,
  Badge,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import StudentCard from '../../components/StudentCard';
import GradeCard from '../../components/GradeCard';
import { getStudentsByParent, getRecentAnnouncements } from '../../utils/api';
import NewsCard from '../../components/NewsCard';
import CalendarEvent from '../../components/CalendarEvent';
import { formatDate } from '../../utils/dateUtils';

const ParentDashboard = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch students for this parent
      const studentsData = await getStudentsByParent(user.id);
      setStudents(studentsData);

      // Fetch recent announcements
      const announcementsData = await getRecentAnnouncements();
      setAnnouncements(announcementsData);

      // Mock upcoming events data - would come from API in real app
      setUpcomingEvents([
        {
          id: 1,
          title: 'Parent-Teacher Conference',
          date: '2023-06-15',
          time: '15:00 - 17:00',
          location: 'School Auditorium',
        },
        {
          id: 2,
          title: 'Science Fair',
          date: '2023-06-22',
          time: '09:00 - 13:00',
          location: 'School Gym',
        },
        {
          id: 3,
          title: 'End of Year Ceremony',
          date: '2023-06-30',
          time: '10:00 - 12:00',
          location: 'School Grounds',
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Parent Dashboard" />
        <Appbar.Action
          icon="bell"
          onPress={() => navigation.navigate('Notifications')}
        />
        <Appbar.Action
          icon="account"
          onPress={() => navigation.navigate('Profile')}
        />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Title style={styles.sectionTitle}>Your Children</Title>
          {students.length > 0 ? (
            <FlatList
              data={students}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <StudentCard
                  student={item}
                  onPress={() =>
                    navigation.navigate('StudentDetails', { studentId: item.id })
                  }
                />
              )}
              style={styles.studentList}
            />
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content>
                <Text style={styles.emptyStateText}>
                  No students found. Please contact school administration if this is incorrect.
                </Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.quickActions}>
            <Surface style={styles.actionCard}>
              <IconButton
                icon="message-text"
                size={24}
                onPress={() => navigation.navigate('Messaging')}
              />
              <Text style={styles.actionText}>Messages</Text>
              {unreadMessages > 0 && (
                <Badge style={styles.badge}>{unreadMessages}</Badge>
              )}
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="calendar"
                size={24}
                onPress={() => navigation.navigate('Calendar')}
              />
              <Text style={styles.actionText}>Calendar</Text>
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="newspaper-variant"
                size={24}
                onPress={() => navigation.navigate('SchoolNews')}
              />
              <Text style={styles.actionText}>News</Text>
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="file-document"
                size={24}
                onPress={() => navigation.navigate('Resources')}
              />
              <Text style={styles.actionText}>Resources</Text>
            </Surface>
          </View>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Upcoming Events</Title>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <CalendarEvent key={event.id} event={event} />
            ))
          ) : (
            <Text style={styles.emptyStateText}>No upcoming events</Text>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Calendar')}
            style={styles.viewAllButton}
          >
            View Full Calendar
          </Button>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>School News & Announcements</Title>
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <NewsCard key={announcement.id} news={announcement} />
            ))
          ) : (
            <Text style={styles.emptyStateText}>No recent announcements</Text>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('SchoolNews')}
            style={styles.viewAllButton}
          >
            View All News
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginVertical: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentList: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    width: '22%',
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  divider: {
    marginVertical: 16,
  },
  viewAllButton: {
    marginTop: 16,
  },
  emptyStateCard: {
    marginVertical: 10,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#757575',
    padding: 16,
  },
});

export default ParentDashboard;
