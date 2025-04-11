import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Appbar,
  List,
  Avatar,
  Text,
  Button,
  Divider,
  Portal,
  Dialog,
  RadioButton,
  TextInput,
  Chip,
  ActivityIndicator,
  FAB,
  useTheme,
  Title,
  Searchbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { AuthContext } from '../../context/AuthContext';
import { getTeacherStudents, getAttendanceData, markAttendance } from '../../utils/api';
import { formatDate, isToday } from '../../utils/dateUtils';
import AttendanceRow from '../../components/AttendanceRow';

const Attendance = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [attendanceDialogVisible, setAttendanceDialogVisible] = useState(false);
  const [currentStudentAttendance, setCurrentStudentAttendance] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [attendanceNote, setAttendanceNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('date'); // 'date' or 'student'
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    tardy: 0,
    total: 0
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (route.params?.studentId) {
      const student = students.find(s => s.id === route.params.studentId);
      if (student) {
        setSelectedStudent(student);
        setViewMode('student');
        loadStudentAttendance(student.id);
      }
    } else if (students.length > 0) {
      loadAttendanceData(selectedDate);
    }
  }, [route.params, students]);

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      loadAttendanceData(selectedDate);
    }
  }, [selectedDate, students]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await getTeacherStudents(user.id);
      setStudents(studentsData);
      setLoading(false);
      
      if (route.params?.studentId) {
        const student = studentsData.find(s => s.id === route.params.studentId);
        if (student) {
          setSelectedStudent(student);
          setViewMode('student');
          loadStudentAttendance(student.id);
        }
      } else {
        loadAttendanceData(selectedDate);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
  };

  const loadAttendanceData = async (date) => {
    setLoading(true);
    try {
      const data = await getAttendanceData(user.id, date);
      setAttendanceData(data.records);
      setMarkedDates(data.markedDates);
      
      // Calculate stats for the selected date
      const stats = {
        present: data.records.filter(r => r.status === 'present').length,
        absent: data.records.filter(r => r.status === 'absent').length,
        tardy: data.records.filter(r => r.status === 'tardy').length,
        total: data.records.length
      };
      setAttendanceStats(stats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setLoading(false);
    }
  };

  const loadStudentAttendance = async (studentId) => {
    setLoading(true);
    try {
      const data = await getAttendanceData(user.id, null, studentId);
      setAttendanceData(data.records);
      setMarkedDates(data.markedDates);
      setLoading(false);
    } catch (error) {
      console.error('Error loading student attendance:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedStudent) {
      await loadStudentAttendance(selectedStudent.id);
    } else {
      await loadAttendanceData(selectedDate);
    }
    setRefreshing(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    setIsMarkingMode(false);
  };

  const startMarkingAttendance = () => {
    setIsMarkingMode(true);
  };

  const cancelMarkingAttendance = () => {
    setIsMarkingMode(false);
  };

  const openAttendanceDialog = (student) => {
    const existingRecord = attendanceData.find(
      record => record.studentId === student.id
    );
    
    setCurrentStudentAttendance(student);
    setAttendanceStatus(existingRecord?.status || 'present');
    setAttendanceNote(existingRecord?.notes || '');
    setAttendanceDialogVisible(true);
  };

  const handleSaveAttendance = async () => {
    if (!currentStudentAttendance) return;

    try {
      await markAttendance({
        teacherId: user.id,
        studentId: currentStudentAttendance.id,
        date: selectedDate,
        status: attendanceStatus,
        notes: attendanceNote,
      });

      // Reload attendance data
      await loadAttendanceData(selectedDate);
      setAttendanceDialogVisible(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const switchViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'date') {
      setSelectedStudent(null);
      loadAttendanceData(selectedDate);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toString().includes(searchQuery) ||
    student.studentId.toString().includes(searchQuery)
  );

  const renderStudentAttendanceItem = ({ item }) => {
    const status = attendanceData.find(record => record.studentId === item.id)?.status || 'unmarked';
    
    return (
      <List.Item
        title={item.name}
        description={`Grade ${item.grade} • ID: ${item.studentId}`}
        left={props => (
          <Avatar.Text {...props} label={item.name.substring(0, 2).toUpperCase()} size={40} />
        )}
        right={props => (
          <View style={styles.statusContainer}>
            {isMarkingMode ? (
              <Button
                mode="contained"
                onPress={() => openAttendanceDialog(item)}
                style={[
                  styles.markButton,
                  status === 'present' && styles.presentButton,
                  status === 'absent' && styles.absentButton,
                  status === 'tardy' && styles.tardyButton,
                  status === 'unmarked' && styles.unmarkedButton
                ]}
              >
                {status === 'unmarked' ? 'Mark' : 
                  status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ) : (
              <Chip
                mode={status === 'unmarked' ? 'outlined' : 'flat'}
                style={[
                  styles.statusChip,
                  status === 'present' && styles.presentChip,
                  status === 'absent' && styles.absentChip,
                  status === 'tardy' && styles.tardyChip
                ]}
              >
                {status === 'unmarked' ? 'Not Marked' : 
                  status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            )}
          </View>
        )}
        onPress={() => {
          if (isMarkingMode) {
            openAttendanceDialog(item);
          }
        }}
        style={styles.studentItem}
      />
    );
  };

  const renderStudentHistoryItem = ({ item }) => (
    <AttendanceRow
      date={item.date}
      status={item.status}
      notes={item.notes}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title={
            selectedStudent 
              ? `${selectedStudent.name}'s Attendance` 
              : "Attendance Management"
          }
          subtitle={
            selectedStudent 
              ? `Grade ${selectedStudent.grade}` 
              : isToday(selectedDate) ? "Today" : formatDate(selectedDate)
          }
        />
        {viewMode === 'date' && !isMarkingMode && (
          <Appbar.Action 
            icon="pencil" 
            onPress={startMarkingAttendance} 
          />
        )}
        {isMarkingMode && (
          <Appbar.Action 
            icon="close" 
            onPress={cancelMarkingAttendance} 
          />
        )}
      </Appbar.Header>

      <View style={styles.viewToggleContainer}>
        <Button
          mode={viewMode === 'date' ? 'contained' : 'outlined'}
          onPress={() => switchViewMode('date')}
          style={styles.viewToggleButton}
        >
          Date View
        </Button>
        <Button
          mode={viewMode === 'student' ? 'contained' : 'outlined'}
          onPress={() => switchViewMode('student')}
          style={styles.viewToggleButton}
          disabled={!selectedStudent}
        >
          Student History
        </Button>
      </View>

      {viewMode === 'date' ? (
        <>
          <Calendar
            current={selectedDate}
            onDayPress={handleDateSelect}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                selected: true,
                selectedColor: theme.colors.primary,
              },
            }}
            theme={{
              todayTextColor: theme.colors.primary,
              arrowColor: theme.colors.primary,
              dotColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
            }}
          />

          {isToday(selectedDate) && !isMarkingMode && (
            <View style={styles.todayPrompt}>
              <Button
                mode="contained"
                icon="pencil"
                onPress={startMarkingAttendance}
                style={styles.takeAttendanceButton}
              >
                Take Today's Attendance
              </Button>
            </View>
          )}

          {/* Attendance Stats Card */}
          {!loading && attendanceData.length > 0 && (
            <View style={styles.statsCard}>
              <Title style={styles.statsTitle}>
                Attendance Summary for {formatDate(selectedDate)}
              </Title>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.present.toString()}
                    style={styles.presentAvatar}
                  />
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.absent.toString()}
                    style={styles.absentAvatar}
                  />
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.tardy.toString()}
                    style={styles.tardyAvatar}
                  />
                  <Text style={styles.statLabel}>Tardy</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Avatar.Text
                    size={40}
                    label={attendanceStats.total.toString()}
                    style={styles.totalAvatar}
                  />
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search students..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStudentAttendanceItem}
              ItemSeparatorComponent={() => <Divider />}
              contentContainerStyle={styles.studentList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No students found</Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        // Student History View
        selectedStudent ? (
          <>
            <View style={styles.studentCard}>
              <View style={styles.studentHeaderInfo}>
                <Avatar.Text
                  label={selectedStudent.name.substring(0, 2).toUpperCase()}
                  size={40}
                  style={styles.studentAvatar}
                />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{selectedStudent.name}</Text>
                  <Text style={styles.studentDetails}>
                    Grade {selectedStudent.grade} • ID: {selectedStudent.studentId}
                  </Text>
                </View>
                <Chip
                  mode="outlined"
                  style={[
                    styles.attendanceRateChip,
                    {
                      borderColor:
                        selectedStudent.attendanceRate >= 90 ? '#4CAF50' :
                        selectedStudent.attendanceRate >= 80 ? '#FFC107' : '#F44336'
                    }
                  ]}
                >
                  {selectedStudent.attendanceRate}% Attendance
                </Chip>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={attendanceData}
                keyExtractor={(item) => item.date}
                renderItem={renderStudentHistoryItem}
                ItemSeparatorComponent={() => <Divider />}
                contentContainerStyle={styles.historyList}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No attendance records found</Text>
                  </View>
                }
              />
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Select a student to view attendance history</Text>
          </View>
        )
      )}

      {isMarkingMode && (
        <FAB
          icon="content-save"
          label="Done"
          onPress={cancelMarkingAttendance}
          style={styles.fab}
        />
      )}

      <Portal>
        <Dialog visible={attendanceDialogVisible} onDismiss={() => setAttendanceDialogVisible(false)}>
          <Dialog.Title>
            Mark Attendance for {currentStudentAttendance?.name}
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setAttendanceStatus(value)}
              value={attendanceStatus}
            >
              <RadioButton.Item label="Present" value="present" />
              <RadioButton.Item label="Absent" value="absent" />
              <RadioButton.Item label="Tardy" value="tardy" />
            </RadioButton.Group>

            <TextInput
              label="Notes (optional)"
              value={attendanceNote}
              onChangeText={setAttendanceNote}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAttendanceDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveAttendance}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
  },
  viewToggleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
  },
  studentList: {
    flexGrow: 1,
  },
  historyList: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  studentItem: {
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    padding: 16,
  },
  statusContainer: {
    justifyContent: 'center',
  },
  statusChip: {
    height: 30,
  },
  presentChip: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  absentChip: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  tardyChip: {
    backgroundColor: '#FFF8E1',
    color: '#FFC107',
  },
  markButton: {
    height: 36,
  },
  presentButton: {
    backgroundColor: '#4CAF50',
  },
  absentButton: {
    backgroundColor: '#F44336',
  },
  tardyButton: {
    backgroundColor: '#FFC107',
  },
  unmarkedButton: {
    backgroundColor: '#757575',
  },
  todayPrompt: {
    padding: 16,
    alignItems: 'center',
  },
  takeAttendanceButton: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  noteInput: {
    marginTop: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  studentHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    color: '#757575',
    fontSize: 14,
  },
  attendanceRateChip: {
    height: 30,
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  presentAvatar: {
    backgroundColor: '#4CAF50',
  },
  absentAvatar: {
    backgroundColor: '#F44336',
  },
  tardyAvatar: {
    backgroundColor: '#FFC107',
  },
  totalAvatar: {
    backgroundColor: '#2196F3',
  },
});

export default Attendance;
