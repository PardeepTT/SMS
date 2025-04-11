import React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';

const UserAvatar = ({ user, size = 40, style }) => {
  const theme = useTheme();
  
  // If the user has an avatar image
  if (user && user.avatar) {
    return (
      <Avatar.Image
        source={{ uri: user.avatar }}
        size={size}
        style={[styles.avatar, style]}
      />
    );
  }
  
  // Use initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return '?';
    
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  // Get color based on user role or name
  const getBackgroundColor = () => {
    if (!user) return theme.colors.primary;
    
    if (user.role === 'teacher') return '#4CAF50'; // Green for teachers
    if (user.role === 'parent') return '#2196F3'; // Blue for parents
    if (user.role === 'admin') return '#673AB7'; // Purple for admins
    
    // Generate color based on name if no role
    if (user.name) {
      const charSum = user.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const hue = charSum % 360;
      return `hsl(${hue}, 70%, 60%)`;
    }
    
    return theme.colors.primary;
  };
  
  return (
    <Avatar.Text
      label={getInitials()}
      size={size}
      style={[
        styles.avatar,
        { backgroundColor: getBackgroundColor() },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    // Add any custom styling for all avatars here
  },
});

export default UserAvatar;
