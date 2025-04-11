import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Share, Platform } from 'react-native';
import {
  Appbar,
  Searchbar,
  Chip,
  Divider,
  Text,
  Title,
  ActivityIndicator,
  useTheme,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { AuthContext } from '../../context/AuthContext';
import ResourceItem from '../../components/ResourceItem';
import { getResources, requestResource } from '../../utils/api';

const Resources = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    all: true,
    document: false,
    image: false,
    video: false,
    link: false,
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resources, searchQuery, filters]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const resourcesData = await getResources(user.id);
      setResources(resourcesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading resources:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResources();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...resources];
    
    // Apply type filter
    if (!filters.all) {
      filtered = filtered.filter(item => {
        if (filters.document && item.type === 'document') return true;
        if (filters.image && item.type === 'image') return true;
        if (filters.video && item.type === 'video') return true;
        if (filters.link && item.type === 'link') return true;
        return false;
      });
    }
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredResources(filtered);
  };

  const toggleFilter = (filterName) => {
    // If selecting "All", turn off other filters
    if (filterName === 'all') {
      setFilters({
        all: true,
        document: false,
        image: false,
        video: false,
        link: false,
      });
    } else {
      // If selecting a specific filter, turn off "All"
      const newFilters = {
        ...filters,
        [filterName]: !filters[filterName],
        all: false,
      };
      
      // If no specific filters are selected, turn "All" back on
      if (!newFilters.document && !newFilters.image && !newFilters.video && !newFilters.link) {
        newFilters.all = true;
      }
      
      setFilters(newFilters);
    }
  };

  const handleDownload = async (resource) => {
    // In a real app, this would download the file
    // For this demo, we'll just share the resource info
    try {
      await Share.share({
        message: `${resource.title}: ${resource.description} - ${resource.url}`,
        title: resource.title,
      });
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        // In a real app, this would upload the file to the server
        // For this demo, we'll just show a message
        alert(`File selected: ${result.name}`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleRequestSubmit = async () => {
    if (!requestTitle.trim()) return;
    
    setSubmitting(true);
    try {
      await requestResource({
        parentId: user.id,
        title: requestTitle,
        description: requestDescription,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });
      
      setDialogVisible(false);
      setRequestTitle('');
      setRequestDescription('');
      alert('Resource request submitted successfully');
    } catch (error) {
      console.error('Error submitting resource request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderResourceItem = ({ item }) => (
    <ResourceItem
      resource={item}
      onDownload={() => handleDownload(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Resources" />
        <Appbar.Action icon="refresh" onPress={onRefresh} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search resources..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filters:</Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={filters.all}
            onPress={() => toggleFilter('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filters.document}
            onPress={() => toggleFilter('document')}
            style={styles.filterChip}
            icon="file-document"
          >
            Documents
          </Chip>
          <Chip
            selected={filters.image}
            onPress={() => toggleFilter('image')}
            style={styles.filterChip}
            icon="image"
          >
            Images
          </Chip>
          <Chip
            selected={filters.video}
            onPress={() => toggleFilter('video')}
            style={styles.filterChip}
            icon="video"
          >
            Videos
          </Chip>
          <Chip
            selected={filters.link}
            onPress={() => toggleFilter('link')}
            style={styles.filterChip}
            icon="link"
          >
            Links
          </Chip>
        </View>
      </View>

      <Divider />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredResources.length > 0 ? (
        <FlatList
          data={filteredResources}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderResourceItem}
          contentContainerStyle={styles.resourcesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Title style={styles.emptyTitle}>No Resources Found</Title>
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No results matching "${searchQuery}"`
              : 'No resources match the selected filters'}
          </Text>
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
        label="Request"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Request Resource</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={requestTitle}
              onChangeText={setRequestTitle}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Description"
              value={requestDescription}
              onChangeText={setRequestDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleRequestSubmit}
              loading={submitting}
              disabled={!requestTitle.trim() || submitting}
            >
              Submit
            </Button>
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  resourcesList: {
    padding: 16,
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
    padding: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialogInput: {
    marginBottom: 16,
  },
});

export default Resources;
