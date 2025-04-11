import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import {
  Appbar,
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
  SegmentedButtons,
  Card,
  Menu,
  RadioButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import NewsCard from '../../components/NewsCard';
import { getSchoolNews, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../utils/api';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const Announcements = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [filter, setFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'announcement',
    publishDate: new Date(),
    targetAudience: 'all',
    important: false,
  });

  const isEditing = !!newAnnouncement.id;

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const announcementsData = await getSchoolNews(user.id, 'teacher');
      setAnnouncements(announcementsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleSaveAnnouncement = async () => {
    try {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        alert('Title and content are required');
        return;
      }

      const announcementData = {
        ...newAnnouncement,
        authorId: user.id,
        authorName: user.name,
        publishDate: newAnnouncement.publishDate.toISOString(),
      };

      if (isEditing) {
        await updateAnnouncement(newAnnouncement.id, announcementData);
      } else {
        await createAnnouncement(announcementData);
      }

      await loadAnnouncements();
      setDialogVisible(false);
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'announcement',
        publishDate: new Date(),
        targetAudience: 'all',
        important: false,
      });
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await deleteAnnouncement(selectedAnnouncement.id);
      await loadAnnouncements();
      setDeleteDialogVisible(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const openEditDialog = (announcement) => {
    setNewAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      publishDate: new Date(announcement.publishDate),
      targetAudience: announcement.targetAudience,
      important: announcement.important,
    });
    setDialogVisible(true);
  };

  const openDateTimePicker = (mode) => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleDateTimeChange = (event, selectedDateTime) => {
    setShowDatePicker(false);
    if (selectedDateTime) {
      setNewAnnouncement({...newAnnouncement, publishDate: selectedDateTime});
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    // Filter by search query
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = filter === 'all' || announcement.category === filter;
    
    return matchesSearch && matchesCategory;
  });

  const renderAnnouncementItem = ({ item }) => (
    <NewsCard
      news={item}
      detailed
      onPress={() => setSelectedAnnouncement(item)}
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
              setSelectedAnnouncement(item);
              setDeleteDialogVisible(true);
            }}
          />
        </View>
      }
    />
  );

  const renderAnnouncementDetail = () => {
    if (!selectedAnnouncement) return null;
    
    return (
      <View style={styles.detailContainer}>
        <Card style={styles.detailCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerContent}>
                <Title style={styles.detailTitle}>{selectedAnnouncement.title}</Title>
                <Paragraph style={styles.detailMeta}>
                  {formatDateTime(selectedAnnouncement.publishDate)} • {selectedAnnouncement.authorName}
                </Paragraph>
              </View>
              <Chip 
                style={[
                  styles.categoryChip,
                  selectedAnnouncement.category === 'announcement' && styles.announcementChip,
                  selectedAnnouncement.category === 'event' && styles.eventChip,
                  selectedAnnouncement.category === 'newsletter' && styles.newsletterChip
                ]}
              >
                {selectedAnnouncement.category.charAt(0).toUpperCase() + selectedAnnouncement.category.slice(1)}
              </Chip>
            </View>
            
            {selectedAnnouncement.important && (
              <Chip icon="alert" style={styles.importantChip}>Important</Chip>
            )}
            
            <Divider style={styles.divider} />
            
            <Paragraph style={styles.detailContent}>
              {selectedAnnouncement.content}
            </Paragraph>
            
            <Divider style={styles.divider} />
            
            <View style={styles.targetContainer}>
              <Text style={styles.targetLabel}>Target Audience:</Text>
              <Chip style={styles.targetChip}>
                {selectedAnnouncement.targetAudience === 'all' 
                  ? 'All Users' 
                  : selectedAnnouncement.targetAudience.charAt(0).toUpperCase() + selectedAnnouncement.targetAudience.slice(1) + 's'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.detailActions}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => openEditDialog(selectedAnnouncement)}
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
          title={selectedAnnouncement ? selectedAnnouncement.title : "Announcements"}
        />
        {selectedAnnouncement ? (
          <Appbar.Action
            icon="keyboard-backspace"
            onPress={() => setSelectedAnnouncement(null)}
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
          </Menu>
        )}
      </Appbar.Header>

      {!selectedAnnouncement && (
        <>
          <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            buttons={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: 'announcement',
                label: 'Announcements',
              },
              {
                value: 'event',
                label: 'Events',
              },
              {
                value: 'newsletter',
                label: 'Newsletters',
              },
            ]}
            style={styles.filterButtons}
          />
          
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search announcements..."
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
              data={filteredAnnouncements}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAnnouncementItem}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No announcements found</Text>
                </View>
              }
            />
          )}

          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setDialogVisible(true)}
            label="Create"
          />
        </>
      )}

      {selectedAnnouncement && (
        <ScrollView style={styles.detailScrollView}>
          {renderAnnouncementDetail()}
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{isEditing ? 'Edit Announcement' : 'Create Announcement'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              <TextInput
                label="Title *"
                value={newAnnouncement.title}
                onChangeText={(text) => setNewAnnouncement({...newAnnouncement, title: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Content *"
                value={newAnnouncement.content}
                onChangeText={(text) => setNewAnnouncement({...newAnnouncement, content: text})}
                mode="outlined"
                multiline
                numberOfLines={6}
                style={styles.input}
              />
              
              <Text style={styles.sectionLabel}>Category:</Text>
              <RadioButton.Group
                onValueChange={(value) => setNewAnnouncement({...newAnnouncement, category: value})}
                value={newAnnouncement.category}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="announcement" />
                  <Text>Announcement</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="event" />
                  <Text>Event</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="newsletter" />
                  <Text>Newsletter</Text>
                </View>
              </RadioButton.Group>
              
              <Text style={styles.sectionLabel}>Target Audience:</Text>
              <RadioButton.Group
                onValueChange={(value) => setNewAnnouncement({...newAnnouncement, targetAudience: value})}
                value={newAnnouncement.targetAudience}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="all" />
                  <Text>All Users</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="parent" />
                  <Text>Parents Only</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="teacher" />
                  <Text>Teachers Only</Text>
                </View>
              </RadioButton.Group>
              
              <View style={styles.dateRow}>
                <Button
                  mode="outlined"
                  onPress={() => openDateTimePicker('date')}
                  style={styles.dateButton}
                >
                  Date: {formatDate(newAnnouncement.publishDate)}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => openDateTimePicker('time')}
                  style={styles.dateButton}
                >
                  Time: {newAnnouncement.publishDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Button>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={newAnnouncement.publishDate}
                  mode={datePickerMode}
                  display="default"
                  onChange={handleDateTimeChange}
                />
              )}
              
              <View style={styles.importantContainer}>
                <Text>Mark as Important</Text>
                <RadioButton.Group
                  onValueChange={(value) => setNewAnnouncement({...newAnnouncement, important: value === 'yes'})}
                  value={newAnnouncement.important ? 'yes' : 'no'}
                >
                  <View style={styles.radioRow}>
                    <View style={styles.radioOption}>
                      <RadioButton value="yes" />
                      <Text>Yes</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="no" />
                      <Text>No</Text>
                    </View>
                  </View>
                </RadioButton.Group>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveAnnouncement} disabled={!newAnnouncement.title || !newAnnouncement.content}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Announcement</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{selectedAnnouncement?.title}"? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteAnnouncement} color="red">Delete</Button>
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
  filterButtons: {
    margin: 8,
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
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
  sectionLabel: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  radioRow: {
    flexDirection: 'row',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  importantContainer: {
    marginTop: 8,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
  },
  detailMeta: {
    color: '#757575',
    fontSize: 14,
  },
  categoryChip: {
    marginLeft: 8,
  },
  announcementChip: {
    backgroundColor: '#E3F2FD',
  },
  eventChip: {
    backgroundColor: '#E8F5E9',
  },
  newsletterChip: {
    backgroundColor: '#FFF8E1',
  },
  importantChip: {
    backgroundColor: '#FFEBEE',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 12,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    marginRight: 8,
  },
  targetChip: {
    backgroundColor: '#F5F5F5',
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

export default Announcements;
