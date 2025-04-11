import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Appbar,
  Searchbar,
  List,
  Avatar,
  Text,
  Button,
  Divider,
  FAB,
  Portal,
  Dialog,
  TextInput,
  Chip,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getTeacherStudents, getStudentDetails, addStudentNote } from '../../utils/api';
import AttendanceRow from '../../components/AttendanceRow';

const StudentManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noteDialogVisible, setNoteDialogVisible] = useState(false);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (route.params?.studentId) {
      loadStudentDetails(route.params.studentId);
    }
  }, [route.params]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await getTeacherStudents(user.id);
      setStudents(studentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
  };

  const loadStudentDetails = async (studentId) => {
    try {
      const studentData = await getStudentDetails(studentId);
      setSelectedStudent(studentData);
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleAddNote = async () => {
    if (!note.trim() || !selectedStudent) return;

    try {
      await addStudentNote({
        studentId: selectedStudent.id,
        teacherId: user.id,
        content: note,
        timestamp: new Date().toISOString(),
      });

      // Reload student details to see the new note
      await loadStudentDetails(selectedStudent.id);
      setNote('');
      setNoteDialogVisible(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toString().includes(searchQuery) ||
      student.studentId.toString().includes(searchQuery);

    if (filter === 'all') return matchesSearch;
    if (filter === 'attendance-issues' && student.attendanceRate < 90) return matchesSearch;
    if (filter === 'grade-issues' && student.averageGrade < 70) return matchesSearch;
    
    return false;
  });

  const renderStudentListItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={`Grade ${item.grade} • ID: ${item.studentId}`}
      left={props => (
        <Avatar.Text {...props} label={item.name.substring(0, 2).toUpperCase()} size={40} />
      )}
      right={props => (
        <View style={styles.studentMetrics}>
          <Chip
            mode="outlined"
            style={[
              styles.gradeChip,
              {
                borderColor:
                  item.averageGrade >= 90 ? '#4CAF50' :
                  item.averageGrade >= 80 ? '#8BC34A' :
                  item.averageGrade >= 70 ? '#FFC107' :
                  item.averageGrade >= 60 ? '#FF9800' : '#F44336'
              }
            ]}
          >
            {item.averageGrade}%
          </Chip>
          <Chip
            mode="outlined"
            style={[
              styles.attendanceChip,
              {
                borderColor:
                  item.attendanceRate >= 90 ? '#4CAF50' :
                  item.attendanceRate >= 80 ? '#FFC107' : '#F44336'
              }
            ]}
          >
            {item.attendanceRate}%
          </Chip>
        </View>
      )}
      onPress={() => loadStudentDetails(item.id)}
      style={styles.studentItem}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={selectedStudent ? selectedStudent.name : "Student Management"} />
        {selectedStudent && (
          <Appbar.Action
            icon="keyboard-backspace"
            onPress={() => setSelectedStudent(null)}
          />
        )}
      </Appbar.Header>

      {!selectedStudent ? (
        // Student List View
        <>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search students..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Chip
                selected={filter === 'all'}
                onPress={() => setFilter('all')}
                style={styles.filterChip}
              >
                All Students
              </Chip>
              <Chip
                selected={filter === 'attendance-issues'}
                onPress={() => setFilter('attendance-issues')}
                style={styles.filterChip}
                icon="account-alert"
              >
                Attendance Issues
              </Chip>
              <Chip
                selected={filter === 'grade-issues'}
                onPress={() => setFilter('grade-issues')}
                style={styles.filterChip}
                icon="alert-circle"
              >
                Grade Issues
              </Chip>
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderStudentListItem}
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
        // Student Detail View
        <View style={styles.detailContainer}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadStudentDetails(selectedStudent.id)}
              />
            }
          >
            <View style={styles.studentInfoCard}>
              <View style={styles.studentHeaderInfo}>
                <Avatar.Text
                  label={selectedStudent.name.substring(0, 2).toUpperCase()}
                  size={60}
                  style={styles.studentAvatar}
                />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{selectedStudent.name}</Text>
                  <Text style={styles.studentDetails}>
                    Grade {selectedStudent.grade} • ID: {selectedStudent.studentId}
                  </Text>
                  <View style={styles.chipContainer}>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.infoChip,
                        {
                          borderColor:
                            selectedStudent.averageGrade >= 90 ? '#4CAF50' :
                            selectedStudent.averageGrade >= 80 ? '#8BC34A' :
                            selectedStudent.averageGrade >= 70 ? '#FFC107' :
                            selectedStudent.averageGrade >= 60 ? '#FF9800' : '#F44336'
                        }
                      ]}
                    >
                      {selectedStudent.averageGrade}% Avg. Grade
                    </Chip>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.infoChip,
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
              </View>

              <Divider style={styles.divider} />

              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  icon="message-text"
                  onPress={() => {
                    navigation.navigate('Messaging', {
                      recipientId: selectedStudent.parentId,
                      recipientName: selectedStudent.parentName,
                    });
                  }}
                  style={styles.actionButton}
                >
                  Message Parent
                </Button>
                <Button
                  mode="contained"
                  icon="clipboard-edit"
                  onPress={() => setNoteDialogVisible(true)}
                  style={styles.actionButton}
                >
                  Add Note
                </Button>
              </View>
            </View>

            <List.Section>
              <List.Subheader>Recent Attendance</List.Subheader>
              {selectedStudent.attendance && selectedStudent.attendance.length > 0 ? (
                selectedStudent.attendance.slice(0, 5).map((record) => (
                  <AttendanceRow
                    key={record.date}
                    date={record.date}
                    status={record.status}
                    notes={record.notes}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No attendance records</Text>
              )}
              <Button
                mode="text"
                onPress={() => navigation.navigate('Attendance', { studentId: selectedStudent.id })}
                style={styles.viewAllButton}
              >
                View All Attendance
              </Button>

              <List.Subheader>Recent Grades</List.Subheader>
              {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                selectedStudent.grades.slice(0, 5).map((grade) => (
                  <List.Item
                    key={grade.id}
                    title={grade.title}
                    description={`${grade.subject} • ${grade.date}`}
                    right={() => (
                      <View style={styles.gradeContainer}>
                        <Text
                          style={[
                            styles.gradeValue,
                            {
                              color:
                                grade.score >= 90 ? '#4CAF50' :
                                grade.score >= 80 ? '#8BC34A' :
                                grade.score >= 70 ? '#FFC107' :
                                grade.score >= 60 ? '#FF9800' : '#F44336'
                            }
                          ]}
                        >
                          {grade.score}%
                        </Text>
                      </View>
                    )}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No grade records</Text>
              )}
              <Button
                mode="text"
                onPress={() => navigation.navigate('Grades', { studentId: selectedStudent.id })}
                style={styles.viewAllButton}
              >
                View All Grades
              </Button>

              <List.Subheader>Notes</List.Subheader>
              {selectedStudent.notes && selectedStudent.notes.length > 0 ? (
                selectedStudent.notes.map((note) => (
                  <List.Item
                    key={note.id}
                    title={new Date(note.timestamp).toLocaleDateString()}
                    description={note.content}
                    left={props => <List.Icon {...props} icon="note-text" />}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No notes available</Text>
              )}
            </List.Section>
          </ScrollView>

          <FAB
            icon="clipboard-edit"
            style={styles.fab}
            onPress={() => setNoteDialogVisible(true)}
            label="Add Note"
          />
        </View>
      )}

      <Portal>
        <Dialog visible={noteDialogVisible} onDismiss={() => setNoteDialogVisible(false)}>
          <Dialog.Title>Add Note for {selectedStudent?.name}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Note"
              value={note}
              onChangeText={setNote}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.noteInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNoteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddNote} disabled={!note.trim()}>Save</Button>
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
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
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
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  studentList: {
    flexGrow: 1,
  },
  studentItem: {
    backgroundColor: '#ffffff',
  },
  studentMetrics: {
    flexDirection: 'row',
  },
  gradeChip: {
    marginRight: 4,
  },
  attendanceChip: {
    marginLeft: 4,
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
  detailContainer: {
    flex: 1,
  },
  studentInfoCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentDetails: {
    color: '#757575',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  gradeContainer: {
    justifyContent: 'center',
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  noteInput: {
    marginTop: 8,
  },
});

export default StudentManagement;
