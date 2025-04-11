import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Appbar,
  List,
  Avatar,
  Text,
  Divider,
  IconButton,
  Chip,
  Button,
  useTheme,
  ActivityIndicator,
  Menu,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../../utils/api';
import { formatDateTime } from '../../utils/dateUtils';

const Notifications = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [clearAllDialogVisible, setClearAllDialogVisible] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notificationsData = await getNotifications(user.id);
      setNotifications(notificationsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Update the local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
      // Update the local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      setMenuVisible(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      // Update the local state
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAllNotifications(user.id);
      setNotifications([]);
      setClearAllDialogVisible(false);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        navigation.navigate('Messaging', {
          recipientId: notification.data.senderId,
          recipientName: notification.data.senderName,
        });
        break;
      case 'grade':
        if (user.role === 'parent') {
          navigation.navigate('StudentDetails', {
            studentId: notification.data.studentId,
          });
        } else {
          navigation.navigate('Grades', {
            studentId: notification.data.studentId,
          });
        }
        break;
      case 'assignment':
        if (user.role === 'teacher') {
          navigation.navigate('Assignments');
        } else {
          navigation.navigate('StudentDetails', {
            studentId: notification.data.studentId,
          });
        }
        break;
      case 'attendance':
        if (user.role === 'teacher') {
          navigation.navigate('Attendance');
        } else {
          navigation.navigate('StudentDetails', {
            studentId: notification.data.studentId,
          });
        }
        break;
      case 'announcement':
        if (user.role === 'teacher') {
          navigation.navigate('Announcements');
        } else {
          navigation.navigate('SchoolNews');
        }
        break;
      case 'event':
        navigation.navigate('Calendar');
        break;
      default:
        // If unknown type, just return to previous screen
        navigation.goBack();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'message-text';
      case 'grade':
        return 'clipboard-text';
      case 'assignment':
        return 'book-open-variant';
      case 'attendance':
        return 'calendar-check';
      case 'announcement':
        return 'bullhorn';
      case 'event':
        return 'calendar-star';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return '#2196F3'; // Blue
      case 'grade':
        return '#4CAF50'; // Green
      case 'assignment':
        return '#FF9800'; // Orange
      case 'attendance':
        return '#9C27B0'; // Purple
      case 'announcement':
        return '#F44336'; // Red
      case 'event':
        return '#00BCD4'; // Cyan
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const renderNotificationItem = ({ item }) => (
    <List.Item
      title={item.title}
      description={item.message}
      onPress={() => handleNotificationPress(item)}
      left={(props) => (
        <Avatar.Icon
          {...props}
          icon={getNotificationIcon(item.type)}
          size={40}
          style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(item.type) },
          ]}
        />
      )}
      right={(props) => (
        <View style={styles.rightContainer}>
          <Text style={styles.timestamp}>{formatDateTime(item.timestamp)}</Text>
          <IconButton
            {...props}
            icon="delete"
            size={20}
            onPress={() => handleDeleteNotification(item.id)}
          />
        </View>
      )}
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
    />
  );

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.isRead
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notifications" />
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
          {hasUnreadNotifications && (
            <Menu.Item
              title="Mark all as read"
              leadingIcon="check-all"
              onPress={handleMarkAllAsRead}
            />
          )}
          <Menu.Item
            title="Clear all notifications"
            leadingIcon="delete-sweep"
            onPress={() => {
              setMenuVisible(false);
              setClearAllDialogVisible(true);
            }}
          />
        </Menu>
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Portal>
        <Dialog
          visible={clearAllDialogVisible}
          onDismiss={() => setClearAllDialogVisible(false)}
        >
          <Dialog.Title>Clear All Notifications</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete all notifications? This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearAllDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleClearAll}>Clear All</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#757575',
  },
  notificationsList: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
  },
  unreadNotification: {
    backgroundColor: '#e3f2fd',
  },
  notificationIcon: {
    margin: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
});

export default Notifications;
