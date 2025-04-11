import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Only ask if permissions have not been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // If permission granted, get push token
    if (finalStatus === 'granted') {
      const token = await registerForPushNotifications();
      return { status: finalStatus, token };
    }
    
    return { status: finalStatus, token: null };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return { status: 'error', token: null };
  }
};

// Register for push notifications
export const registerForPushNotifications = async () => {
  try {
    // Check if a token is already stored
    const existingToken = await AsyncStorage.getItem('pushToken');
    if (existingToken) {
      return existingToken;
    }
    
    // Get push token
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      experienceId: '@username/school-connect', // Replace with your actual Expo username/projectSlug
    });
    
    // Store the token
    await AsyncStorage.setItem('pushToken', token);
    
    // Configure mobile-specific settings
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Set up notification listeners
export const setupNotifications = async () => {
  // Request permissions and register for push notifications
  const { status, token } = await requestNotificationPermissions();
  
  if (status === 'granted' && token) {
    // Listen for notifications when the app is in the foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      handleForegroundNotification
    );
    
    // Listen for user interactions with notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );
    
    // Store the token on the server for this user
    try {
      // Assuming you have a function to save the push token to your backend
      // updateUserPushToken(userId, token);
      console.log('Push notification token saved:', token);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
    
    // Return cleanup function
    return () => {
      Notifications.removeNotificationSubscription(foregroundSubscription);
      Notifications.removeNotificationSubscription(responseSubscription);
    };
  }
};

// Handle foreground notifications
const handleForegroundNotification = (notification) => {
  // Handle notification when app is in foreground
  console.log('Notification received in foreground:', notification);
  
  // Can update UI or show an in-app alert here
};

// Handle user interaction with notifications
const handleNotificationResponse = (response) => {
  // Get data from notification
  const data = response.notification.request.content.data;
  
  console.log('Notification response:', data);
  
  // Navigate to the appropriate screen based on the notification type
  // You'd typically use a navigation ref to navigate from outside components
  switch (data.type) {
    case 'message':
      // navigateToScreen('Messaging', { recipientId: data.senderId });
      break;
    case 'grade':
      // navigateToScreen('StudentDetails', { studentId: data.studentId, tab: 'grades' });
      break;
    case 'attendance':
      // navigateToScreen('StudentDetails', { studentId: data.studentId, tab: 'attendance' });
      break;
    // Add more cases as needed
  }
};

// Schedule a local notification
export const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: trigger || { seconds: 1 },
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    return null;
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Cancel a specific notification
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Toggle a specific notification setting
export const toggleNotificationSetting = async (userId, settingName, enabled) => {
  try {
    // Get current settings from AsyncStorage
    const settingsStr = await AsyncStorage.getItem('notificationSettings');
    let settings = settingsStr ? JSON.parse(settingsStr) : {};
    
    // Update the specific setting
    settings[settingName] = enabled;
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    // Update on the server as well
    await updateProfile(userId, {
      preferences: {
        notifications: settings,
      },
    });
    
    return settings;
  } catch (error) {
    console.error('Error toggling notification setting:', error);
    throw error;
  }
};

// Get all notification settings
export const getNotificationSettings = async () => {
  try {
    const settingsStr = await AsyncStorage.getItem('notificationSettings');
    return settingsStr ? JSON.parse(settingsStr) : {
      messages: true,
      announcements: true,
      grades: true,
      attendance: true,
      events: true,
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      messages: true,
      announcements: true,
      grades: true,
      attendance: true,
      events: true,
    };
  }
};
