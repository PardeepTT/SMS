// User controller functions

// Example in-memory notifications for demo
const notifications = [
  {
    id: 1,
    userId: 1,
    title: 'New Assignment Posted',
    message: 'A new Math assignment has been posted',
    type: 'assignment',
    read: false,
    createdAt: new Date('2023-06-01T10:00:00Z')
  },
  {
    id: 2,
    userId: 2,
    title: 'Student Attendance',
    message: 'Your child was absent today',
    type: 'attendance',
    read: true,
    createdAt: new Date('2023-06-02T09:30:00Z')
  },
  {
    id: 3,
    userId: 1,
    title: 'Faculty Meeting',
    message: 'Reminder: Faculty meeting tomorrow at 3 PM',
    type: 'event',
    read: false,
    createdAt: new Date('2023-06-03T14:45:00Z')
  }
];

// Get current authenticated user
const getCurrentUser = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Return user without password
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
};

// Update user profile
const updateUser = (req, res) => {
  try {
    // In a real implementation, this would update the user in the database
    // For this example, we'll just return the updated profile
    const updatedUser = {
      ...req.user,
      ...req.body,
      password: req.user.password // Don't allow password update via this endpoint
    };
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Change user password
const changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // In a real implementation, validate current password and update with new hashed password
    // For this example, we'll just return success
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

// Get notifications for a user
const getNotifications = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these notifications' });
    }
    
    const userNotifications = notifications.filter(n => n.userId === userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark a notification as read
const markNotificationAsRead = (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (req.user.id !== notification.userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to modify this notification' });
    }
    
    notification.read = true;
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to modify these notifications' });
    }
    
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    
    const userNotifications = notifications.filter(n => n.userId === userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

// Delete a notification
const deleteNotification = (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (req.user.id !== notifications[notificationIndex].userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to delete this notification' });
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    res.json({ message: 'Notification deleted successfully', notification: deletedNotification });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Delete all notifications for a user
const deleteAllNotifications = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to delete these notifications' });
    }
    
    const userNotificationsCount = notifications.filter(n => n.userId === userId).length;
    
    for (let i = notifications.length - 1; i >= 0; i--) {
      if (notifications[i].userId === userId) {
        notifications.splice(i, 1);
      }
    }
    
    res.json({ message: `${userNotificationsCount} notifications deleted successfully` });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Error deleting all notifications' });
  }
};

module.exports = {
  getCurrentUser,
  updateUser,
  changePassword,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
};