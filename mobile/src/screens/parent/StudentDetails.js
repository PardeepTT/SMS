import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Appbar,
  Title,
  Subheading,
  Text,
  Card,
  Chip,
  List,
  ProgressBar,
  useTheme,
  Divider,
  Button,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  getStudentDetails,
  getStudentGrades,
  getStudentAttendance,
  getStudentAssignments,
} from '../../utils/api';
import AssignmentCard from '../../components/AssignmentCard';
import GradeCard from '../../components/GradeCard';

const StudentDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { studentId } = route.params;
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      const studentData = await getStudentDetails(studentId);
      setStudent(studentData);

      const gradesData = await getStudentGrades(studentId);
      setGrades(gradesData);

      const attendanceData = await getStudentAttendance(studentId);
      setAttendance(attendanceData);

      const assignmentsData = await getStudentAssignments(studentId);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentData();
    setRefreshing(false);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Student Information</Title>
          <Divider style={styles.divider} />
          {student && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{student.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grade Level:</Text>
                <Text style={styles.infoValue}>{student.grade}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teacher:</Text>
                <Text style={styles.infoValue}>{student.teacher}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Student ID:</Text>
                <Text style={styles.infoValue}>{student.studentId}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Attendance Summary</Title>
          <Divider style={styles.divider} />
          {attendance ? (
            <>
              <View style={styles.attendanceStats}>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceValue}>{attendance.present}</Text>
                  <Text style={styles.attendanceLabel}>Present</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceValue}>{attendance.absent}</Text>
                  <Text style={styles.attendanceLabel}>Absent</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceValue}>{attendance.tardy}</Text>
                  <Text style={styles.attendanceLabel}>Tardy</Text>
                </View>
              </View>
              <View style={styles.attendanceProgress}>
                <Text style={styles.attendancePercentage}>
                  {attendance.percentagePresent}% Attendance Rate
                </Text>
                <ProgressBar
                  progress={attendance.percentagePresent / 100}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
              </View>
            </>
          ) : (
            <Text style={styles.emptyStateText}>No attendance data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Recent Grades</Title>
            <Button
              mode="text"
              onPress={() => setActiveTab('grades')}
            >
              See All
            </Button>
          </View>
          <Divider style={styles.divider} />
          {grades.length > 0 ? (
            grades.slice(0, 3).map((grade) => (
              <GradeCard key={grade.id} grade={grade} />
            ))
          ) : (
            <Text style={styles.emptyStateText}>No grade data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Upcoming Assignments</Title>
            <Button
              mode="text"
              onPress={() => setActiveTab('assignments')}
            >
              See All
            </Button>
          </View>
          <Divider style={styles.divider} />
          {assignments.length > 0 ? (
            assignments
              .filter((assignment) => !assignment.completed)
              .slice(0, 3)
              .map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))
          ) : (
            <Text style={styles.emptyStateText}>No assignments available</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderGrades = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Current Grade Average</Title>
          <Divider style={styles.divider} />
          {grades.length > 0 ? (
            <>
              <View style={styles.gradeAverage}>
                <Avatar.Text
                  label={student.averageGrade}
                  size={70}
                  style={{
                    backgroundColor: 
                      student.averageGrade >= 90 ? '#4CAF50' :
                      student.averageGrade >= 80 ? '#8BC34A' :
                      student.averageGrade >= 70 ? '#FFC107' :
                      student.averageGrade >= 60 ? '#FF9800' : '#F44336'
                  }}
                />
                <View style={styles.gradeInfo}>
                  <Title>
                    {student.averageGrade >= 90 ? 'A' :
                     student.averageGrade >= 80 ? 'B' :
                     student.averageGrade >= 70 ? 'C' :
                     student.averageGrade >= 60 ? 'D' : 'F'}
                  </Title>
                  <Text>Overall Average</Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <List.Subheader>Subject Breakdown</List.Subheader>
              {student.subjectGrades.map((subject) => (
                <View key={subject.name} style={styles.subjectGrade}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <View style={styles.subjectGradeBar}>
                    <ProgressBar
                      progress={subject.average / 100}
                      color={
                        subject.average >= 90 ? '#4CAF50' :
                        subject.average >= 80 ? '#8BC34A' :
                        subject.average >= 70 ? '#FFC107' :
                        subject.average >= 60 ? '#FF9800' : '#F44336'
                      }
                      style={styles.subjectProgressBar}
                    />
                    <Text style={styles.subjectGradeText}>{subject.average}%</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.emptyStateText}>No grade data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Assessments</Title>
          <Divider style={styles.divider} />
          {grades.length > 0 ? (
            grades.map((grade) => (
              <GradeCard key={grade.id} grade={grade} detailed />
            ))
          ) : (
            <Text style={styles.emptyStateText}>No grade data available</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderAssignments = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Assignment Status</Title>
          <Divider style={styles.divider} />
          {assignments.length > 0 ? (
            <>
              <View style={styles.assignmentStats}>
                <View style={styles.assignmentStat}>
                  <Avatar.Text
                    label={assignments.filter(a => a.completed).length.toString()}
                    size={50}
                    style={{ backgroundColor: '#4CAF50' }}
                  />
                  <Text style={styles.assignmentLabel}>Completed</Text>
                </View>
                <View style={styles.assignmentStat}>
                  <Avatar.Text
                    label={assignments.filter(a => !a.completed && !a.overdue).length.toString()}
                    size={50}
                    style={{ backgroundColor: '#FFC107' }}
                  />
                  <Text style={styles.assignmentLabel}>Pending</Text>
                </View>
                <View style={styles.assignmentStat}>
                  <Avatar.Text
                    label={assignments.filter(a => a.overdue).length.toString()}
                    size={50}
                    style={{ backgroundColor: '#F44336' }}
                  />
                  <Text style={styles.assignmentLabel}>Overdue</Text>
                </View>
              </View>
              <Divider style={styles.divider} />
            </>
          ) : null}
        </Card.Content>
      </Card>

      <List.Subheader>Upcoming Assignments</List.Subheader>
      {assignments.length > 0 ? (
        assignments
          .filter((assignment) => !assignment.completed)
          .map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} detailed />
          ))
      ) : (
        <Text style={styles.emptyStateText}>No assignments available</Text>
      )}

      <List.Subheader>Completed Assignments</List.Subheader>
      {assignments.filter(a => a.completed).length > 0 ? (
        assignments
          .filter((assignment) => assignment.completed)
          .map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} detailed />
          ))
      ) : (
        <Text style={styles.emptyStateText}>No completed assignments</Text>
      )}
    </View>
  );

  const renderAttendance = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Attendance Overview</Title>
          <Divider style={styles.divider} />
          {attendance ? (
            <>
              <View style={styles.attendanceStats}>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceValue}>{attendance.present}</Text>
                  <Text style={styles.attendanceLabel}>Present</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceValue}>{attendance.absent}</Text>
                  <Text style={styles.attendanceLabel}>Absent</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <Text style={styles.attendanceValue}>{attendance.tardy}</Text>
                  <Text style={styles.attendanceLabel}>Tardy</Text>
                </View>
              </View>
              <View style={styles.attendanceProgress}>
                <Text style={styles.attendancePercentage}>
                  {attendance.percentagePresent}% Attendance Rate
                </Text>
                <ProgressBar
                  progress={attendance.percentagePresent / 100}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
              </View>
            </>
          ) : (
            <Text style={styles.emptyStateText}>No attendance data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Attendance History</Title>
          <Divider style={styles.divider} />
          {attendance && attendance.history ? (
            attendance.history.map((record) => (
              <List.Item
                key={record.date}
                title={record.date}
                description={record.notes || 'No notes'}
                left={props => (
                  <List.Icon
                    {...props}
                    color={
                      record.status === 'present' ? '#4CAF50' :
                      record.status === 'absent' ? '#F44336' : '#FFC107'
                    }
                    icon={
                      record.status === 'present' ? 'check-circle' :
                      record.status === 'absent' ? 'close-circle' : 'alert-circle'
                    }
                  />
                )}
              />
            ))
          ) : (
            <Text style={styles.emptyStateText}>No detailed attendance records available</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={student ? student.name : 'Student Details'}
          subtitle={student ? `Grade ${student.grade}` : ''}
        />
        <Appbar.Action
          icon="message-reply-text"
          onPress={() =>
            navigation.navigate('Messaging', {
              recipientId: student.teacherId,
              recipientName: student.teacher,
            })
          }
        />
      </Appbar.Header>

      {student ? (
        <>
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Chip
                selected={activeTab === 'overview'}
                onPress={() => setActiveTab('overview')}
                style={styles.tab}
                mode={activeTab === 'overview' ? 'flat' : 'outlined'}
              >
                Overview
              </Chip>
              <Chip
                selected={activeTab === 'grades'}
                onPress={() => setActiveTab('grades')}
                style={styles.tab}
                mode={activeTab === 'grades' ? 'flat' : 'outlined'}
              >
                Grades
              </Chip>
              <Chip
                selected={activeTab === 'assignments'}
                onPress={() => setActiveTab('assignments')}
                style={styles.tab}
                mode={activeTab === 'assignments' ? 'flat' : 'outlined'}
              >
                Assignments
              </Chip>
              <Chip
                selected={activeTab === 'attendance'}
                onPress={() => setActiveTab('attendance')}
                style={styles.tab}
                mode={activeTab === 'attendance' ? 'flat' : 'outlined'}
              >
                Attendance
              </Chip>
            </ScrollView>
          </View>

          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'grades' && renderGrades()}
            {activeTab === 'assignments' && renderAssignments()}
            {activeTab === 'attendance' && renderAttendance()}
          </ScrollView>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading student details...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    flex: 1,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 2,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  attendanceStat: {
    alignItems: 'center',
  },
  attendanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  attendanceLabel: {
    marginTop: 4,
  },
  attendanceProgress: {
    marginVertical: 12,
  },
  attendancePercentage: {
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeAverage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    justifyContent: 'center',
  },
  gradeInfo: {
    marginLeft: 16,
  },
  subjectGrade: {
    marginBottom: 12,
  },
  subjectName: {
    marginBottom: 4,
  },
  subjectGradeBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  subjectGradeText: {
    marginLeft: 8,
    width: 45,
    textAlign: 'right',
  },
  assignmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  assignmentStat: {
    alignItems: 'center',
  },
  assignmentLabel: {
    marginTop: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#757575',
    padding: 16,
  },
});

export default StudentDetails;
