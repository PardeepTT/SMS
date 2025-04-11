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
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getTeacherStudents, getRecentMessages, getUpcomingAssignments } from '../../utils/api';
import CalendarEvent from '../../components/CalendarEvent';
import AssignmentCard from '../../components/AssignmentCard';
import StudentCard from '../../components/StudentCard';
import { formatDate } from '../../utils/dateUtils';

const TeacherDashboard = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 22,
    absent: 3,
    total: 25,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch students for this teacher
      const studentsData = await getTeacherStudents(user.id);
      setStudents(studentsData);

      // Fetch recent messages
      const messagesData = await getRecentMessages(user.id);
      setRecentMessages(messagesData);

      // Fetch upcoming assignments
      const assignmentsData = await getUpcomingAssignments(user.id);
      setUpcomingAssignments(assignmentsData);

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
          title: 'Staff Meeting',
          date: '2023-06-10',
          time: '14:00 - 15:00',
          location: 'Staff Room',
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
        <Appbar.Content title="Teacher Dashboard" subtitle={`Welcome, ${user.name}`} />
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
          <View style={styles.quickActions}>
            <Surface style={styles.actionCard}>
              <IconButton
                icon="account-group"
                size={24}
                onPress={() => navigation.navigate('StudentManagement')}
              />
              <Text style={styles.actionText}>Students</Text>
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="clipboard-check"
                size={24}
                onPress={() => navigation.navigate('Attendance')}
              />
              <Text style={styles.actionText}>Attendance</Text>
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="file-document-edit"
                size={24}
                onPress={() => navigation.navigate('Grades')}
              />
              <Text style={styles.actionText}>Grades</Text>
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="book-open-variant"
                size={24}
                onPress={() => navigation.navigate('Assignments')}
              />
              <Text style={styles.actionText}>Assignments</Text>
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="message-text"
                size={24}
                onPress={() => navigation.navigate('Messaging')}
              />
              <Text style={styles.actionText}>Messages</Text>
              {recentMessages.filter(m => !m.isRead).length > 0 && (
                <Badge style={styles.badge}>
                  {recentMessages.filter(m => !m.isRead).length}
                </Badge>
              )}
            </Surface>

            <Surface style={styles.actionCard}>
              <IconButton
                icon="bullhorn"
                size={24}
                onPress={() => navigation.navigate('Announcements')}
              />
              <Text style={styles.actionText}>Announce</Text>
            </Surface>
          </View>

          <Card style={styles.attendanceCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>Today's Attendance</Title>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Attendance')}
                >
                  Details
                </Button>
              </View>
              <Divider style={styles.divider} />
              
              <View style={styles.attendanceStats}>
                <View style={styles.attendanceStat}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.present.toString()}
                    style={styles.presentAvatar}
                  />
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                
                <View style={styles.attendanceStat}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.absent.toString()}
                    style={styles.absentAvatar}
                  />
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                
                <View style={styles.attendanceStat}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.total.toString()}
                    style={styles.totalAvatar}
                  />
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
              
              <View style={styles.attendanceProgressContainer}>
                <Text style={styles.attendancePercentage}>
                  {Math.round((attendanceStats.present / attendanceStats.total) * 100)}% Present
                </Text>
                <ProgressBar
                  progress={attendanceStats.present / attendanceStats.total}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
              </View>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Attendance')}
                style={styles.attendanceButton}
              >
                Take Attendance
              </Button>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Your Students</Title>
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
                    navigation.navigate('StudentManagement', { studentId: item.id })
                  }
                />
              )}
              style={styles.studentList}
            />
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content>
                <Text style={styles.emptyStateText}>
                  No students assigned yet. Contact administration if this is incorrect.
                </Text>
              </Card.Content>
            </Card>
          )}

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Upcoming Assignments</Title>
          {upcomingAssignments.length > 0 ? (
            upcomingAssignments.slice(0, 3).map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onPress={() => navigation.navigate('Assignments')}
              />
            ))
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content>
                <Text style={styles.emptyStateText}>No upcoming assignments</Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Assignments')}
            style={styles.viewAllButton}
          >
            Manage Assignments
          </Button>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Calendar</Title>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <CalendarEvent key={event.id} event={event} />
            ))
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content>
                <Text style={styles.emptyStateText}>No upcoming events</Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Calendar')}
            style={styles.viewAllButton}
          >
            View Full Calendar
          </Button>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Recent Messages</Title>
          {recentMessages.length > 0 ? (
            recentMessages.slice(0, 3).map((message) => (
              <Card key={message.id} style={styles.messageCard}>
                <Card.Content>
                  <View style={styles.messageHeader}>
                    <Avatar.Text
                      size={40}
                      label={message.senderName.substring(0, 2).toUpperCase()}
                      style={styles.messageAvatar}
                    />
                    <View style={styles.messageInfo}>
                      <Text style={styles.messageSender}>{message.senderName}</Text>
                      <Text style={styles.messageTime}>{formatDate(message.timestamp)}</Text>
                    </View>
                    {!message.isRead && <Badge style={styles.unreadBadge}>New</Badge>}
                  </View>
                  <Text style={styles.messageContent} numberOfLines={2}>
                    {message.content}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content>
                <Text style={styles.emptyStateText}>No recent messages</Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Messaging')}
            style={styles.viewAllButton}
          >
            View All Messages
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    width: '30%',
    marginBottom: 12,
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
  attendanceCard: {
    marginVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  attendanceStat: {
    alignItems: 'center',
  },
  presentAvatar: {
    backgroundColor: '#4CAF50',
  },
  absentAvatar: {
    backgroundColor: '#F44336',
  },
  totalAvatar: {
    backgroundColor: '#2196F3',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  attendanceProgressContainer: {
    marginBottom: 16,
  },
  attendancePercentage: {
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  attendanceButton: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginVertical: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentList: {
    marginBottom: 16,
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
    padding: 8,
  },
  messageCard: {
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAvatar: {
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageSender: {
    fontWeight: 'bold',
  },
  messageTime: {
    fontSize: 12,
    color: '#757575',
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
  },
  messageContent: {
    color: '#424242',
  },
});

export default TeacherDashboard;
