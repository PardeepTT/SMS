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
  Paragraph,
  IconButton,
  Menu,
  SegmentedButtons,
  ProgressBar,
  Card,
  Switch,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import AssignmentCard from '../../components/AssignmentCard';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getTeacherStudents, getSubmissions } from '../../utils/api';
import { formatDate, isOverdue } from '../../utils/dateUtils';

const Assignments = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignmentDialogVisible, setAssignmentDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [view, setView] = useState('active');
  const [menuVisible, setMenuVisible] = useState(false);
  const [subjects, setSubjects] = useState([
    'Math', 'Science', 'English', 'History', 'Art', 'Physical Education'
  ]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [submissions, setSubmissions] = useState([]);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: 'Math',
    points: '100',
    dueDate: new Date(),
    allowLateSubmissions: false,
  });

  const isEditing = !!newAssignment.id;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [assignmentsData, studentsData] = await Promise.all([
        getAssignments(user.id),
        getTeacherStudents(user.id)
      ]);
      
      setAssignments(assignmentsData);
      setStudents(studentsData);
      
      // Extract unique subjects from assignments
      if (assignmentsData.length > 0) {
        const uniqueSubjects = [...new Set(assignmentsData.map(a => a.subject))];
        setSubjects(prev => [...new Set([...prev, ...uniqueSubjects])]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadAssignmentSubmissions = async (assignmentId) => {
    try {
      const submissionsData = await getSubmissions(assignmentId);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCreateAssignment = async () => {
    try {
      if (!newAssignment.title || !newAssignment.subject) {
        alert('Title and Subject are required');
        return;
      }

      const points = parseInt(newAssignment.points);
      if (isNaN(points) || points <= 0) {
        alert('Points must be a positive number');
        return;
      }

      const assignmentData = {
        ...newAssignment,
        teacherId: user.id,
        points,
        dueDate: newAssignment.dueDate.toISOString(),
      };

      if (isEditing) {
        await updateAssignment(newAssignment.id, assignmentData);
      } else {
        await createAssignment(assignmentData);
      }

      await loadInitialData();
      setAssignmentDialogVisible(false);
      setNewAssignment({
        title: '',
        description: '',
        subject: 'Math',
        points: '100',
        dueDate: new Date(),
        allowLateSubmissions: false,
      });
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      await deleteAssignment(selectedAssignment.id);
      await loadInitialData();
      setDeleteDialogVisible(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const openEditDialog = (assignment) => {
    setNewAssignment({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      points: assignment.points.toString(),
      dueDate: new Date(assignment.dueDate),
      allowLateSubmissions: assignment.allowLateSubmissions,
    });
    setAssignmentDialogVisible(true);
  };

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    await loadAssignmentSubmissions(assignment.id);
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Filter by search query
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by subject
    const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
    
    // Filter by view type
    const isActive = !isOverdue(assignment.dueDate);
    const matchesView = 
      (view === 'active' && isActive) ||
      (view === 'past' && !isActive) ||
      (view === 'all');
    
    return matchesSearch && matchesSubject && matchesView;
  });

  const renderAssignmentItem = ({ item }) => {
    const isLate = isOverdue(item.dueDate);
    
    return (
      <AssignmentCard
        assignment={item}
        detailed
        onPress={() => handleSelectAssignment(item)}
        actions={
          <View style={styles.cardActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditDialog(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => {
                setSelectedAssignment(item);
                setDeleteDialogVisible(true);
              }}
            />
          </View>
        }
      />
    );
  };

  const renderAssignmentDetail = () => {
    if (!selectedAssignment) return null;
    
    const completedCount = submissions.filter(s => s.status === 'submitted').length;
    const lateCount = submissions.filter(s => s.status === 'late').length;
    const missingCount = students.length - completedCount - lateCount;
    
    return (
      <View style={styles.detailContainer}>
        <Card style={styles.detailCard}>
          <Card.Content>
            <View style={styles.assignmentHeaderRow}>
              <Avatar.Icon
                icon="book-open-variant"
                size={40}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.assignmentHeaderInfo}>
                <Title style={styles.assignmentTitle}>{selectedAssignment.title}</Title>
                <Paragraph>{selectedAssignment.subject}</Paragraph>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{formatDate(selectedAssignment.dueDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Points:</Text>
              <Text style={styles.detailValue}>{selectedAssignment.points} pts</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Late Submissions:</Text>
              <Text style={styles.detailValue}>
                {selectedAssignment.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}
              </Text>
            </View>
            
            {selectedAssignment.description && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Paragraph style={styles.description}>
                  {selectedAssignment.description}
                </Paragraph>
              </>
            )}
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Submission Status</Title>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Completed:</Text>
                <Text style={styles.progressValue}>{completedCount}/{students.length}</Text>
              </View>
              <ProgressBar 
                progress={students.length > 0 ? completedCount / students.length : 0} 
                color="#4CAF50"
                style={styles.progressBar}
              />
            </View>
            
            <View style={styles.statusSummary}>
              <View style={styles.statusItem}>
                <Chip icon="check-circle" style={styles.completedChip}>
                  {completedCount} Submitted
                </Chip>
              </View>
              <View style={styles.statusItem}>
                <Chip icon="clock-alert" style={styles.lateChip}>
                  {lateCount} Late
                </Chip>
              </View>
              <View style={styles.statusItem}>
                <Chip icon="alert-circle" style={styles.missingChip}>
                  {missingCount} Missing
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Title style={styles.submissionTitle}>Student Submissions</Title>
        
        {students.map(student => {
          const submission = submissions.find(s => s.studentId === student.id);
          
          return (
            <List.Item
              key={student.id}
              title={student.name}
              description={submission ? `Submitted: ${formatDate(submission.submissionDate)}` : 'Not submitted'}
              left={props => (
                <Avatar.Text 
                  {...props} 
                  label={student.name.substring(0, 2).toUpperCase()} 
                  size={40} 
                />
              )}
              right={props => (
                <Chip
                  style={[
                    styles.statusChip,
                    !submission 
                      ? styles.missingStatusChip 
                      : submission.status === 'late' 
                        ? styles.lateStatusChip 
                        : styles.submittedStatusChip
                  ]}
                >
                  {!submission 
                    ? 'Missing' 
                    : submission.status === 'late' 
                      ? 'Late' 
                      : 'Submitted'}
                </Chip>
              )}
              onPress={() => {
                if (submission) {
                  // In a real app, navigate to view submission details
                  alert(`Submission details for ${student.name}`);
                }
              }}
              style={styles.submissionItem}
            />
          );
        })}
        
        <View style={styles.detailActions}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => openEditDialog(selectedAssignment)}
            style={styles.detailButton}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => setDeleteDialogVisible(true)}
            style={[styles.detailButton, styles.deleteButton]}
          >
            Delete
          </Button>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={selectedAssignment ? selectedAssignment.title : "Assignments"}
        />
        {selectedAssignment ? (
          <Appbar.Action
            icon="keyboard-backspace"
            onPress={() => setSelectedAssignment(null)}
          />
        ) : (
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
              title="Refresh"
              leadingIcon="refresh"
              onPress={() => {
                setMenuVisible(false);
                onRefresh();
              }}
            />
            <Menu.Item
              title="Export to PDF"
              leadingIcon="file-export"
              onPress={() => {
                setMenuVisible(false);
                alert('Export functionality would be implemented in a real app');
              }}
            />
          </Menu>
        )}
      </Appbar.Header>

      {!selectedAssignment && (
        <>
          <SegmentedButtons
            value={view}
            onValueChange={setView}
            buttons={[
              {
                value: 'active',
                label: 'Active',
                icon: 'calendar-clock',
              },
              {
                value: 'past',
                label: 'Past',
                icon: 'calendar-check',
              },
              {
                value: 'all',
                label: 'All',
                icon: 'calendar-blank',
              },
            ]}
            style={styles.viewToggle}
          />
          
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

          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setAssignmentDialogVisible(true)}
            label="Create"
          />
        </>
      )}

      {selectedAssignment && (
        <ScrollView
          style={styles.detailScrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={async () => {
                setRefreshing(true);
                await loadAssignmentSubmissions(selectedAssignment.id);
                setRefreshing(false);
              }} 
            />
          }
        >
          {renderAssignmentDetail()}
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={assignmentDialogVisible} onDismiss={() => setAssignmentDialogVisible(false)}>
          <Dialog.Title>{isEditing ? 'Edit Assignment' : 'Create Assignment'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              <TextInput
                label="Title *"
                value={newAssignment.title}
                onChangeText={(text) => setNewAssignment({...newAssignment, title: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Subject *"
                value={newAssignment.subject}
                onChangeText={(text) => setNewAssignment({...newAssignment, subject: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Points *"
                value={newAssignment.points}
                onChangeText={(text) => setNewAssignment({...newAssignment, points: text})}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              
              <TextInput
                label="Description"
                value={newAssignment.description}
                onChangeText={(text) => setNewAssignment({...newAssignment, description: text})}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />
              
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                Due Date: {formatDate(newAssignment.dueDate)}
              </Button>
              
              {showDatePicker && (
                <DateTimePicker
                  value={newAssignment.dueDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewAssignment({...newAssignment, dueDate: selectedDate});
                    }
                  }}
                />
              )}
              
              <View style={styles.switchContainer}>
                <Text>Allow Late Submissions</Text>
                <Switch
                  value={newAssignment.allowLateSubmissions}
                  onValueChange={(value) => 
                    setNewAssignment({...newAssignment, allowLateSubmissions: value})
                  }
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setAssignmentDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreateAssignment} disabled={!newAssignment.title || !newAssignment.subject}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Assignment</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{selectedAssignment?.title}"? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteAssignment} color="red">Delete</Button>
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
  viewToggle: {
    margin: 8,
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
    padding: 8,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  cardActions: {
    flexDirection: 'row',
  },
  dialogScrollContent: {
    padding: 8,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailScrollView: {
    flex: 1,
  },
  detailContainer: {
    padding: 16,
  },
  detailCard: {
    marginBottom: 16,
  },
  assignmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignmentHeaderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
  },
  divider: {
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 120,
  },
  detailValue: {
    flex: 1,
  },
  descriptionLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#757575',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  completedChip: {
    backgroundColor: '#E8F5E9',
  },
  lateChip: {
    backgroundColor: '#FFF8E1',
  },
  missingChip: {
    backgroundColor: '#FFEBEE',
  },
  submissionTitle: {
    fontSize: 16,
    marginVertical: 8,
  },
  submissionItem: {
    backgroundColor: '#ffffff',
    marginBottom: 4,
    borderRadius: 4,
  },
  statusChip: {
    height: 30,
  },
  submittedStatusChip: {
    backgroundColor: '#E8F5E9',
  },
  lateStatusChip: {
    backgroundColor: '#FFF8E1',
  },
  missingStatusChip: {
    backgroundColor: '#FFEBEE',
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  detailButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
});

export default Assignments;
