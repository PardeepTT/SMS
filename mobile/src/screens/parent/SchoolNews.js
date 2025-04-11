import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Appbar,
  Searchbar,
  Chip,
  Divider,
  Text,
  Title,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import NewsCard from '../../components/NewsCard';
import { getSchoolNews } from '../../utils/api';

const SchoolNews = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    all: true,
    announcement: false,
    event: false,
    newsletter: false,
  });

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [news, searchQuery, filters]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const newsData = await getSchoolNews();
      setNews(newsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading news:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...news];
    
    // Apply category filter
    if (!filters.all) {
      filtered = filtered.filter(item => {
        if (filters.announcement && item.category === 'announcement') return true;
        if (filters.event && item.category === 'event') return true;
        if (filters.newsletter && item.category === 'newsletter') return true;
        return false;
      });
    }
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredNews(filtered);
  };

  const toggleFilter = (filterName) => {
    // If selecting "All", turn off other filters
    if (filterName === 'all') {
      setFilters({
        all: true,
        announcement: false,
        event: false,
        newsletter: false,
      });
    } else {
      // If selecting a specific filter, turn off "All"
      const newFilters = {
        ...filters,
        [filterName]: !filters[filterName],
        all: false,
      };
      
      // If no specific filters are selected, turn "All" back on
      if (!newFilters.announcement && !newFilters.event && !newFilters.newsletter) {
        newFilters.all = true;
      }
      
      setFilters(newFilters);
    }
  };

  const renderNewsItem = ({ item }) => (
    <NewsCard news={item} detailed />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="School News" />
        <Appbar.Action icon="bell" onPress={() => navigation.navigate('Notifications')} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search news..."
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
            selected={filters.announcement}
            onPress={() => toggleFilter('announcement')}
            style={styles.filterChip}
          >
            Announcements
          </Chip>
          <Chip
            selected={filters.event}
            onPress={() => toggleFilter('event')}
            style={styles.filterChip}
          >
            Events
          </Chip>
          <Chip
            selected={filters.newsletter}
            onPress={() => toggleFilter('newsletter')}
            style={styles.filterChip}
          >
            Newsletters
          </Chip>
        </View>
      </View>

      <Divider />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredNews.length > 0 ? (
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNewsItem}
          contentContainerStyle={styles.newsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Title style={styles.emptyTitle}>No News Found</Title>
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No results matching "${searchQuery}"`
              : 'No news articles match the selected filters'}
          </Text>
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
  newsList: {
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
});

export default SchoolNews;
