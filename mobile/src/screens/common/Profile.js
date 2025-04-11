import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import {
  Appbar,
  Avatar,
  Title,
  Text,
  List,
  Switch,
  Button,
  Divider,
  Card,
  useTheme,
  Portal,
  Dialog,
  TextInput,
  IconButton,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../utils/api';
import { setupNotifications, toggleNotificationSetting } from '../../utils/notifications';
import UserAvatar from '../../components/UserAvatar';

const Profile = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user, logout, updateUserContext } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    announcements: true,
    grades: true,
    attendance: true,
    events: true,
  });
  
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  
  useEffect(() => {
    if (user) {
      setEditProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      
      // Initialize notification settings from user preferences
      if (user.preferences?.notifications) {
        setNotificationSettings(user.preferences.notifications);
      }
      
      setupNotifications();
    }
  }, [user]);
  
  const handleUpdateProfile = async () => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editProfile.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
      
      const updatedUser = await updateProfile(user.id, editProfile);
      updateUserContext(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', 'Could not update profile. Please try again.');
    }
  };
  
  const handleChangePassword = async () => {
    try {
      // Validate password requirements
      if (passwords.new.length < 6) {
        Alert.alert('Invalid Password', 'New password must be at least 6 characters');
        return;
      }
      
      if (passwords.new !== passwords.confirm) {
        Alert.alert('Password Mismatch', 'New passwords do not match');
        return;
      }
      
      await changePassword(user.id, passwords.current, passwords.new);
      setPasswordDialog(false);
      setPasswords({ current: '', new: '', confirm: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Change Failed', 'Could not change password. Please verify your current password is correct.');
    }
  };
  
  const handleToggleNotification = async (setting) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [setting]: !notificationSettings[setting],
      };
      
      // Update local state
      setNotificationSettings(newSettings);
      
      // Call API to save preferences
      await toggleNotificationSetting(user.id, setting, newSettings[setting]);
      
      // Update user context with new preferences
      updateUserContext({
        ...user,
        preferences: {
          ...user.preferences,
          notifications: newSettings,
        },
      });
    } catch (error) {
      console.error('Error toggling notification setting:', error);
      // Revert to previous state if there was an error
      setNotificationSettings(notificationSettings);
      Alert.alert('Update Failed', 'Could not update notification settings');
    }
  };
  
  const renderProfileSection = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.profileHeader}>
          <UserAvatar
            user={user}
            size={80}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Title>{user.name}</Title>
            <Text>{user.role === 'parent' ? 'Parent' : 'Teacher'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        
        {!isEditing ? (
          <Button 
            mode="outlined" 
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
            icon="account-edit"
          >
            Edit Profile
          </Button>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              label="Name"
              value={editProfile.name}
              onChangeText={(text) => setEditProfile({...editProfile, name: text})}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={editProfile.email}
              onChangeText={(text) => setEditProfile({...editProfile, email: text})}
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={editProfile.phone}
              onChangeText={(text) => setEditProfile({...editProfile, phone: text})}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setIsEditing(false);
                  setEditProfile({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                  });
                }}
                style={[styles.formButton, styles.cancelButton]}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleUpdateProfile}
                style={styles.formButton}
              >
                Save
              </Button>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
  
  const renderNotificationSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Notification Settings</Title>
        <List.Item
          title="Messages"
          description="Get notified when you receive new messages"
          right={props => (
            <Switch
              value={notificationSettings.messages}
              onValueChange={() => handleToggleNotification('messages')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Announcements"
          description="Get notified about school announcements"
          right={props => (
            <Switch
              value={notificationSettings.announcements}
              onValueChange={() => handleToggleNotification('announcements')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Grades"
          description="Get notified about grade updates"
          right={props => (
            <Switch
              value={notificationSettings.grades}
              onValueChange={() => handleToggleNotification('grades')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Attendance"
          description="Get notified about attendance updates"
          right={props => (
            <Switch
              value={notificationSettings.attendance}
              onValueChange={() => handleToggleNotification('attendance')}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Events"
          description="Get notified about upcoming events"
          right={props => (
            <Switch
              value={notificationSettings.events}
              onValueChange={() => handleToggleNotification('events')}
            />
          )}
        />
      </Card.Content>
    </Card>
  );
  
  const renderAccountSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Account Settings</Title>
        <List.Item
          title="Change Password"
          description="Update your account password"
          left={props => <List.Icon {...props} icon="lock-reset" />}
          onPress={() => setPasswordDialog(true)}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Logout"
          description="Sign out of your account"
          left={props => <List.Icon {...props} icon="logout" color="#F44336" />}
          onPress={() => setLogoutConfirmVisible(true)}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profile" />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderProfileSection()}
        {renderNotificationSettings()}
        {renderAccountSettings()}
        
        <Text style={styles.versionText}>School Connect v1.0.0</Text>
      </ScrollView>
      
      <Portal>
        <Dialog visible={passwordDialog} onDismiss={() => setPasswordDialog(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={passwords.current}
              onChangeText={text => setPasswords({...passwords, current: text})}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="New Password"
              value={passwords.new}
              onChangeText={text => setPasswords({...passwords, new: text})}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Confirm New Password"
              value={passwords.confirm}
              onChangeText={text => setPasswords({...passwords, confirm: text})}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialog(false)}>Cancel</Button>
            <Button onPress={handleChangePassword}>Change</Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog visible={logoutConfirmVisible} onDismiss={() => setLogoutConfirmVisible(false)}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutConfirmVisible(false)}>Cancel</Button>
            <Button onPress={() => {
              setLogoutConfirmVisible(false);
              logout();
            }}>Logout</Button>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    color: '#757575',
    marginTop: 4,
  },
  editButton: {
    marginTop: 8,
  },
  editForm: {
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#757575',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  dialogInput: {
    marginBottom: 12,
  },
  versionText: {
    textAlign: 'center',
    color: '#9e9e9e',
    marginTop: 16,
  },
});

export default Profile;
