import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Generic API request function with auth
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-successful responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return { success: true };
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

// Authentication API calls
export const login = async (email, password) => {
  return await apiRequest('/auth/login', 'POST', { email, password });
};

export const register = async (name, email, password, role) => {
  return await apiRequest('/auth/register', 'POST', { name, email, password, role });
};

export const logout = async () => {
  return await apiRequest('/auth/logout', 'POST');
};

export const getUserData = async () => {
  return await apiRequest('/user');
};

// User Profile API calls
export const updateProfile = async (userId, profileData) => {
  return await apiRequest(`/users/${userId}`, 'PUT', profileData);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  return await apiRequest(`/users/${userId}/password`, 'PUT', {
    currentPassword,
    newPassword,
  });
};

// Student API calls
export const getStudentsByParent = async (parentId) => {
  return await apiRequest(`/parents/${parentId}/students`);
};

export const getTeacherStudents = async (teacherId) => {
  return await apiRequest(`/teachers/${teacherId}/students`);
};

export const getStudentDetails = async (studentId) => {
  return await apiRequest(`/students/${studentId}`);
};

export const addStudentNote = async (noteData) => {
  return await apiRequest('/student-notes', 'POST', noteData);
};

// Attendance API calls
export const getStudentAttendance = async (studentId) => {
  return await apiRequest(`/students/${studentId}/attendance`);
};

export const getAttendanceData = async (teacherId, date = null, studentId = null) => {
  let endpoint = `/attendance?teacherId=${teacherId}`;
  if (date) endpoint += `&date=${date}`;
  if (studentId) endpoint += `&studentId=${studentId}`;
  return await apiRequest(endpoint);
};

export const markAttendance = async (attendanceData) => {
  return await apiRequest('/attendance', 'POST', attendanceData);
};

// Grades API calls
export const getStudentGrades = async (studentId) => {
  return await apiRequest(`/students/${studentId}/grades`);
};

export const getGrades = async (teacherId, studentId = null, assignmentId = null) => {
  let endpoint = `/grades?teacherId=${teacherId}`;
  if (studentId) endpoint += `&studentId=${studentId}`;
  if (assignmentId) endpoint += `&assignmentId=${assignmentId}`;
  return await apiRequest(endpoint);
};

export const addGrade = async (gradeData) => {
  return await apiRequest('/grades', 'POST', gradeData);
};

export const updateGrade = async (gradeId, gradeData) => {
  return await apiRequest(`/grades/${gradeId}`, 'PUT', gradeData);
};

// Assignments API calls
export const getStudentAssignments = async (studentId) => {
  return await apiRequest(`/students/${studentId}/assignments`);
};

export const getAssignments = async (teacherId) => {
  return await apiRequest(`/assignments?teacherId=${teacherId}`);
};

export const getUpcomingAssignments = async (teacherId) => {
  return await apiRequest(`/assignments/upcoming?teacherId=${teacherId}`);
};

export const createAssignment = async (assignmentData) => {
  return await apiRequest('/assignments', 'POST', assignmentData);
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  return await apiRequest(`/assignments/${assignmentId}`, 'PUT', assignmentData);
};

export const deleteAssignment = async (assignmentId) => {
  return await apiRequest(`/assignments/${assignmentId}`, 'DELETE');
};

export const getSubmissions = async (assignmentId) => {
  return await apiRequest(`/assignments/${assignmentId}/submissions`);
};

// Messaging API calls
export const getContacts = async (userId) => {
  return await apiRequest(`/messages/contacts?userId=${userId}`);
};

export const getMessages = async (chatId) => {
  return await apiRequest(`/messages?chatId=${chatId}`);
};

export const getRecentMessages = async (userId) => {
  return await apiRequest(`/messages/recent?userId=${userId}`);
};

export const sendMessage = async (messageData) => {
  return await apiRequest('/messages', 'POST', messageData);
};

export const markMessageAsRead = async (messageId) => {
  return await apiRequest(`/messages/${messageId}/read`, 'PUT');
};

// Calendar/Events API calls
export const getEvents = async (userId, role) => {
  return await apiRequest(`/events?userId=${userId}&role=${role}`);
};

// News and Announcements API calls
export const getSchoolNews = async (userId = null, role = null) => {
  let endpoint = '/news';
  if (userId && role) {
    endpoint += `?userId=${userId}&role=${role}`;
  }
  return await apiRequest(endpoint);
};

export const getRecentAnnouncements = async () => {
  return await apiRequest('/news/recent');
};

export const createAnnouncement = async (announcementData) => {
  return await apiRequest('/news', 'POST', announcementData);
};

export const updateAnnouncement = async (announcementId, announcementData) => {
  return await apiRequest(`/news/${announcementId}`, 'PUT', announcementData);
};

export const deleteAnnouncement = async (announcementId) => {
  return await apiRequest(`/news/${announcementId}`, 'DELETE');
};

// Resources API calls
export const getResources = async (userId) => {
  return await apiRequest(`/resources?userId=${userId}`);
};

export const requestResource = async (requestData) => {
  return await apiRequest('/resources/request', 'POST', requestData);
};

// Notifications API calls
export const getNotifications = async (userId) => {
  return await apiRequest(`/notifications?userId=${userId}`);
};

export const markNotificationAsRead = async (notificationId) => {
  return await apiRequest(`/notifications/${notificationId}/read`, 'PUT');
};

export const markAllNotificationsAsRead = async (userId) => {
  return await apiRequest(`/notifications/read-all?userId=${userId}`, 'PUT');
};

export const deleteNotification = async (notificationId) => {
  return await apiRequest(`/notifications/${notificationId}`, 'DELETE');
};

export const deleteAllNotifications = async (userId) => {
  return await apiRequest(`/notifications?userId=${userId}`, 'DELETE');
};
