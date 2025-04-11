import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import {
  Appbar,
  List,
  Avatar,
  Text,
  Button,
  Divider,
  Portal,
  Dialog,
  TextInput,
  Chip,
  useTheme,
  ActivityIndicator,
  FAB,
  Searchbar,
  Title,
  DataTable,
  Menu,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import GradeCard from '../../components/GradeCard';
import { getTeacherStudents, getAssignments, getGrades, addGrade, updateGrade } from '../../utils/api';
import { formatDate } from '../../utils/dateUtils';

const Grades = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gradeDialogVisible, setGradeDialogVisible] = useState(false);
  const [currentGrade, setCurrentGrade] = useState({
    studentId: '',
    assignmentId: '',
    score: '',
    feedback: '',
  });
  const [view, setView] = useState('assignments'); // 'assignments', 'students', 'gradebook'
  const [menuVisible, setMenuVisible] = useState(false);
  const [gradesExist, setGradesExist] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (route.params?.studentId) {
      const student = students.find(s => s.id === route.params.studentId);
      if (student) {
        setSelectedStudent(student);
        setView('students');
        loadStudentGrades(student.id);
      }
    }
  }, [route.params, students]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const studentsData = await getTeacherStudents(user.id);
      setStudents(studentsData);
      
      const assignmentsData = await getAssignments(user.id);
      setAssignments(assignmentsData);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(assignmentsData.map(a => a.subject))];
      setSubjects(uniqueSubjects);
      
      const gradesData = await getGrades(user.id);
      setGrades(gradesData);
      setGradesExist(gradesData.length > 0);
      
      setLoading(false);
      
      if (route.params?.studentId) {
        const student = studentsData.find(s => s.id === route.params.studentId);
        if (student) {
          setSelectedStudent(student);
          setView('students');
          loadStudentGrades(student.id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadStudentGrades = async (studentId) => {
    setLoading(true);
    try {
      const gradesData = await getGrades(user.id, studentId);
      setGrades(gradesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading student grades:', error);
      setLoading(false);
    }
  };

  const loadAssignmentGrades = async (assignmentId) => {
    setLoading(true);
    try {
      const gradesData = await getGrades(user.id, null, assignmentId);
      setGrades(gradesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading assignment grades:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleGradeSubmit = async () => {
    if (!currentGrade.score) return;
    
    try {
      const numericScore = parseFloat(currentGrade.score);
      if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        alert('Score must be a number between 0 and 100');
        return;
      }
      
      const gradeData = {
        ...currentGrade,
        score: numericScore,
        teacherId: user.id,
      };
      
      if (currentGrade.id) {
        await updateGrade(currentGrade.id, gradeData);
      } else {
        await addGrade(gradeData);
      }
      
      // Reload grades based on current view
      if (selectedStudent) {
        await loadStudentGrades(selectedStudent.id);
      } else if (selectedAssignment) {
        await loadAssignmentGrades(selectedAssignment.id);
      } else {
        await loadInitialData();
      }
      
      setGradeDialogVisible(false);
    } catch (error) {
      console.error('Error submitting grade:', error);
    }
  };

  const openGradeDialog = (student, assignment, existingGrade = null) => {
    if (existingGrade) {
      setCurrentGrade({
        id: existingGrade.id,
        studentId: student.id,
        assignmentId: assignment.id,
        score: existingGrade.score.toString(),
        feedback: existingGrade.feedback || '',
      });
    } else {
      setCurrentGrade({
        studentId: student.id,
        assignmentId: assignment.id,
        score: '',
        feedback: '',
      });
    }
    
    setGradeDialogVisible(true);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedAssignment(null);
    loadStudentGrades(student.id);
  };

  const handleAssignmentSelect = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedStudent(null);
    loadAssignmentGrades(assignment.id);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toString().includes(searchQuery) ||
    student.studentId.toString().includes(searchQuery)
  );

  const renderAssignmentItem = ({ item }) => {
    const assignmentGrades = grades.filter(g => g.assignmentId === item.id);
    const gradedCount = assignmentGrades.length;
    const averageGrade = gradedCount > 0
      ? (assignmentGrades.reduce((sum, g) => sum + g.score, 0) / gradedCount).toFixed(1)
      : 'N/A';
    
    return (
      <List.Item
        title={item.title}
        description={`${item.subject} • Due: ${formatDate(item.dueDate)}`}
        left={props => (
          <Avatar.Icon
            {...props}
            icon="book-open-variant"
            size={40}
            style={{ backgroundColor: theme.colors.primary }}
          />
        )}
        right={props => (
          <View style={styles.assignmentStats}>
            <Chip style={styles.statsChip}>
              {gradedCount}/{students.length} Graded
            </Chip>
            <Chip
              style={[
                styles.avgGradeChip,
                {
                  backgroundColor:
                    averageGrade === 'N/A' ? '#9e9e9e' :
                    parseFloat(averageGrade) >= 90 ? '#4CAF50' :
                    parseFloat(averageGrade) >= 80 ? '#8BC34A' :
                    parseFloat(averageGrade) >= 70 ? '#FFC107' :
                    parseFloat(averageGrade) >= 60 ? '#FF9800' : '#F44336'
                }
              ]}
            >
              Avg: {averageGrade}
            </Chip>
          </View>
        )}
        onPress={() => handleAssignmentSelect(item)}
        style={styles.assignmentItem}
      />
    );
  };

  const renderStudentItem = ({ item }) => {
    const studentGrades = grades.filter(g => g.studentId === item.id);
    const gradedCount = studentGrades.length;
    const averageGrade = gradedCount > 0
      ? (studentGrades.reduce((sum, g) => sum + g.score, 0) / gradedCount).toFixed(1)
      : 'N/A';
    
    return (
      <List.Item
        title={item.name}
        description={`Grade ${item.grade} • ID: ${item.studentId}`}
        left={props => (
          <Avatar.Text {...props} label={item.name.substring(0, 2).toUpperCase()} size={40} />
        )}
        right={props => (
          <Chip
            style={[
              styles.avgGradeChip,
              {
                backgroundColor:
                  averageGrade === 'N/A' ? '#9e9e9e' :
                  parseFloat(averageGrade) >= 90 ? '#4CAF50' :
                  parseFloat(averageGrade) >= 80 ? '#8BC34A' :
                  parseFloat(averageGrade) >= 70 ? '#FFC107' :
                  parseFloat(averageGrade) >= 60 ? '#FF9800' : '#F44336'
              }
            ]}
          >
            Avg: {averageGrade}
          </Chip>
        )}
        onPress={() => handleStudentSelect(item)}
        style={styles.studentItem}
      />
    );
  };

  const renderAssignmentGrades = () => (
    <>
      <View style={styles.assignmentHeader}>
        <Avatar.Icon
          icon="book-open-variant"
          size={40}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.assignmentInfo}>
          <Title style={styles.assignmentTitle}>{selectedAssignment.title}</Title>
          <Text>
            {selectedAssignment.subject} • Due: {formatDate(selectedAssignment.dueDate)}
          </Text>
          <Text style={styles.assignmentDescription}>
            {selectedAssignment.description}
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Student</DataTable.Title>
          <DataTable.Title numeric>Grade</DataTable.Title>
          <DataTable.Title numeric>Actions</DataTable.Title>
        </DataTable.Header>

        {students.map(student => {
          const grade = grades.find(g => 
            g.studentId === student.id && g.assignmentId === selectedAssignment.id
          );
          
          return (
            <DataTable.Row key={student.id}>
              <DataTable.Cell>{student.name}</DataTable.Cell>
              <DataTable.Cell numeric>
                {grade ? (
                  <Text
                    style={[
                      styles.gradeText,
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
                ) : (
                  <Text style={styles.ungradedText}>Not Graded</Text>
                )}
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <IconButton
                  icon={grade ? "pencil" : "plus"}
                  size={20}
                  onPress={() => openGradeDialog(student, selectedAssignment, grade)}
                />
              </DataTable.Cell>
            </DataTable.Row>
          );
        })}
      </DataTable>
    </>
  );

  const renderStudentGrades = () => (
    <>
      <View style={styles.studentHeader}>
        <Avatar.Text
          label={selectedStudent.name.substring(0, 2).toUpperCase()}
          size={40}
        />
        <View style={styles.studentInfo}>
          <Title style={styles.studentName}>{selectedStudent.name}</Title>
          <Text>Grade {selectedStudent.grade} • ID: {selectedStudent.studentId}</Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      {grades.length > 0 ? (
        <FlatList
          data={grades}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const assignment = assignments.find(a => a.id === item.assignmentId);
            if (!assignment) return null;
            
            return (
              <GradeCard
                grade={{
                  ...item,
                  title: assignment.title,
                  subject: assignment.subject,
                  date: assignment.dueDate,
                }}
                detailed
                actions={
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => openGradeDialog(selectedStudent, assignment, item)}
                  />
                }
              />
            );
          }}
          contentContainerStyle={styles.gradesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No grades recorded for this student</Text>
        </View>
      )}
    </>
  );

  const renderGradebook = () => (
    <ScrollView horizontal>
      <View>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.nameColumn}>Student</DataTable.Title>
            {filteredAssignments.map(assignment => (
              <DataTable.Title 
                key={assignment.id} 
                numeric 
                style={styles.gradeColumn}
              >
                {assignment.title}
              </DataTable.Title>
            ))}
            <DataTable.Title numeric style={styles.avgColumn}>Average</DataTable.Title>
          </DataTable.Header>

          {students.map(student => {
            const studentGrades = grades.filter(g => g.studentId === student.id);
            const averageGrade = studentGrades.length > 0
              ? (studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length).toFixed(1)
              : 'N/A';
            
            return (
              <DataTable.Row key={student.id}>
                <DataTable.Cell style={styles.nameColumn}>{student.name}</DataTable.Cell>
                
                {filteredAssignments.map(assignment => {
                  const grade = grades.find(g => 
                    g.studentId === student.id && g.assignmentId === assignment.id
                  );
                  
                  return (
                    <DataTable.Cell 
                      key={`${student.id}-${assignment.id}`} 
                      numeric
                      style={styles.gradeColumn}
                      onPress={() => {
                        if (grade) {
                          openGradeDialog(student, assignment, grade);
                        } else {
                          openGradeDialog(student, assignment);
                        }
                      }}
                    >
                      {grade ? (
                        <Text
                          style={[
                            styles.gradeText,
                            {
                              color:
                                grade.score >= 90 ? '#4CAF50' :
                                grade.score >= 80 ? '#8BC34A' :
                                grade.score >= 70 ? '#FFC107' :
                                grade.score >= 60 ? '#FF9800' : '#F44336'
                            }
                          ]}
                        >
                          {grade.score}
                        </Text>
                      ) : (
                        <Text style={styles.ungradedText}>-</Text>
                      )}
                    </DataTable.Cell>
                  );
                })}
                
                <DataTable.Cell numeric style={styles.avgColumn}>
                  <Text
                    style={[
                      styles.averageText,
                      {
                        color:
                          averageGrade === 'N/A' ? '#9e9e9e' :
                          parseFloat(averageGrade) >= 90 ? '#4CAF50' :
                          parseFloat(averageGrade) >= 80 ? '#8BC34A' :
                          parseFloat(averageGrade) >= 70 ? '#FFC107' :
                          parseFloat(averageGrade) >= 60 ? '#FF9800' : '#F44336'
                      }
                    ]}
                  >
                    {averageGrade}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
        </DataTable>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={
            selectedStudent
              ? `${selectedStudent.name}'s Grades`
              : selectedAssignment
                ? `${selectedAssignment.title} Grades`
                : "Grades Management"
          }
        />
        {(selectedStudent || selectedAssignment) && (
          <Appbar.Action
            icon="keyboard-backspace"
            onPress={() => {
              setSelectedStudent(null);
              setSelectedAssignment(null);
              loadInitialData();
            }}
          />
        )}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            title="Refresh Data"
            onPress={() => {
              setMenuVisible(false);
              onRefresh();
            }}
            leadingIcon="refresh"
          />
          <Menu.Item
            title="Export Grades (CSV)"
            onPress={() => {
              setMenuVisible(false);
              alert('Grades would be exported in a real app');
            }}
            leadingIcon="file-export"
          />
        </Menu>
      </Appbar.Header>

      {!selectedStudent && !selectedAssignment && (
        <SegmentedButtons
          value={view}
          onValueChange={setView}
          buttons={[
            {
              value: 'assignments',
              label: 'By Assignment',
              icon: 'book-open-variant',
            },
            {
              value: 'students',
              label: 'By Student',
              icon: 'account',
            },
            {
              value: 'gradebook',
              label: 'Gradebook',
              icon: 'table',
              disabled: !gradesExist,
            },
          ]}
          style={styles.viewToggle}
        />
      )}

      {(view === 'assignments' && !selectedAssignment && !selectedStudent) && (
        <>
          <View style={styles.filterContainer}>
            <Searchbar
              placeholder="Search assignments..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectFilters}>
              <Chip
                selected={selectedSubject === 'all'}
                onPress={() => setSelectedSubject('all')}
                style={styles.subjectChip}
              >
                All Subjects
              </Chip>
              {subjects.map(subject => (
                <Chip
                  key={subject}
                  selected={selectedSubject === subject}
                  onPress={() => setSelectedSubject(subject)}
                  style={styles.subjectChip}
                >
                  {subject}
                </Chip>
              ))}
            </ScrollView>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredAssignments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAssignmentItem}
              ItemSeparatorComponent={() => <Divider />}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No assignments found</Text>
                </View>
              }
            />
          )}
        </>
      )}

      {(view === 'students' && !selectedAssignment && !selectedStudent) && (
        <>
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
              renderItem={renderStudentItem}
              ItemSeparatorComponent={() => <Divider />}
              contentContainerStyle={styles.list}
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
      )}

      {view === 'gradebook' && !selectedAssignment && !selectedStudent && (
        <>
          <View style={styles.filterContainer}>
            <Searchbar
              placeholder="Search..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectFilters}>
              <Chip
                selected={selectedSubject === 'all'}
                onPress={() => setSelectedSubject('all')}
                style={styles.subjectChip}
              >
                All Subjects
              </Chip>
              {subjects.map(subject => (
                <Chip
                  key={subject}
                  selected={selectedSubject === subject}
                  onPress={() => setSelectedSubject(subject)}
                  style={styles.subjectChip}
                >
                  {subject}
                </Chip>
              ))}
            </ScrollView>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <View style={styles.gradebookContainer}>
              {renderGradebook()}
            </View>
          )}
        </>
      )}

      {selectedAssignment && (
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => loadAssignmentGrades(selectedAssignment.id)} />
              }
            >
              {renderAssignmentGrades()}
            </ScrollView>
          )}
        </View>
      )}

      {selectedStudent && (
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            renderStudentGrades()
          )}
        </View>
      )}

      <Portal>
        <Dialog visible={gradeDialogVisible} onDismiss={() => setGradeDialogVisible(false)}>
          <Dialog.Title>
            {currentGrade.id ? 'Update Grade' : 'Add Grade'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Score (0-100)"
              value={currentGrade.score}
              onChangeText={(text) => setCurrentGrade({...currentGrade, score: text})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Feedback (optional)"
              value={currentGrade.feedback}
              onChangeText={(text) => setCurrentGrade({...currentGrade, feedback: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGradeDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleGradeSubmit} disabled={!currentGrade.score}>Save</Button>
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewToggle: {
    margin: 8,
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  filterContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    marginBottom: 8,
  },
  subjectFilters: {
    paddingBottom: 8,
  },
  subjectChip: {
    marginRight: 8,
  },
  list: {
    flexGrow: 1,
  },
  assignmentItem: {
    backgroundColor: '#ffffff',
  },
  studentItem: {
    backgroundColor: '#ffffff',
  },
  assignmentStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsChip: {
    marginRight: 8,
    height: 30,
  },
  avgGradeChip: {
    height: 30,
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
  input: {
    marginBottom: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  assignmentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
  },
  assignmentDescription: {
    marginTop: 8,
    color: '#757575',
  },
  studentHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  studentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
  },
  divider: {
    marginHorizontal: 16,
  },
  gradesList: {
    padding: 16,
  },
  gradeText: {
    fontWeight: 'bold',
  },
  ungradedText: {
    color: '#9e9e9e',
  },
  gradebookContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  nameColumn: {
    width: 150,
  },
  gradeColumn: {
    width: 100,
  },
  avgColumn: {
    width: 100,
  },
  averageText: {
    fontWeight: 'bold',
  },
});

export default Grades;
