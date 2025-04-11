// App Information
export const APP_NAME = 'School Connect';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// Navigation Routes
export const ROUTES = {
  AUTH: 'Auth',
  AUTH_SCREEN: 'AuthScreen',
  PARENT_DASHBOARD: 'ParentDashboard',
  TEACHER_DASHBOARD: 'TeacherDashboard',
  STUDENT_DETAILS: 'StudentDetails',
  MESSAGING: 'Messaging',
  CALENDAR: 'Calendar',
  SCHOOL_NEWS: 'SchoolNews',
  RESOURCES: 'Resources',
  PROFILE: 'Profile',
  NOTIFICATIONS: 'Notifications',
  STUDENT_MANAGEMENT: 'StudentManagement',
  ATTENDANCE: 'Attendance',
  GRADES: 'Grades',
  ASSIGNMENTS: 'Assignments',
  ANNOUNCEMENTS: 'Announcements',
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  GRADE: 'grade',
  ASSIGNMENT: 'assignment',
  ATTENDANCE: 'attendance',
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
};

// Event Types
export const EVENT_TYPES = {
  SCHOOL: 'school',
  ASSIGNMENT: 'assignment',
  MEETING: 'meeting',
  HOLIDAY: 'holiday',
  DEADLINE: 'deadline',
};

// News Categories
export const NEWS_CATEGORIES = {
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
  NEWSLETTER: 'newsletter',
};

// Resource Types
export const RESOURCE_TYPES = {
  DOCUMENT: 'document',
  IMAGE: 'image',
  VIDEO: 'video',
  LINK: 'link',
  ARCHIVE: 'archive',
  PRESENTATION: 'presentation',
  SPREADSHEET: 'spreadsheet',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  TARDY: 'tardy',
  EXCUSED: 'excused',
};

// Grading Scale
export const GRADE_SCALE = {
  A_PLUS: { min: 97, max: 100, label: 'A+' },
  A: { min: 93, max: 96.99, label: 'A' },
  A_MINUS: { min: 90, max: 92.99, label: 'A-' },
  B_PLUS: { min: 87, max: 89.99, label: 'B+' },
  B: { min: 83, max: 86.99, label: 'B' },
  B_MINUS: { min: 80, max: 82.99, label: 'B-' },
  C_PLUS: { min: 77, max: 79.99, label: 'C+' },
  C: { min: 73, max: 76.99, label: 'C' },
  C_MINUS: { min: 70, max: 72.99, label: 'C-' },
  D_PLUS: { min: 67, max: 69.99, label: 'D+' },
  D: { min: 63, max: 66.99, label: 'D' },
  D_MINUS: { min: 60, max: 62.99, label: 'D-' },
  F: { min: 0, max: 59.99, label: 'F' },
};

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8000/api',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  USERS: '/users',
  STUDENTS: '/students',
  PARENTS: '/parents',
  TEACHERS: '/teachers',
  ATTENDANCE: '/attendance',
  GRADES: '/grades',
  ASSIGNMENTS: '/assignments',
  MESSAGES: '/messages',
  EVENTS: '/events',
  NEWS: '/news',
  RESOURCES: '/resources',
  NOTIFICATIONS: '/notifications',
};

// Form Validation
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMMM D, YYYY',
  DISPLAY_TIME: 'h:mm A',
  DISPLAY_DATE_TIME: 'MMMM D, YYYY, h:mm A',
  ISO_FORMAT: 'YYYY-MM-DD',
  API_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please check your credentials.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_INPUT: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTER_SUCCESS: 'Registration successful!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully!',
  DATA_SAVED_SUCCESS: 'Data saved successfully!',
};

// Theme Colors - For reference (actual theme in src/theme/index.js)
export const COLORS = {
  PRIMARY: '#1565C0',
  SECONDARY: '#00796B',
  ERROR: '#B00020',
  BACKGROUND: '#F5F5F5',
  SURFACE: '#FFFFFF',
  TEXT: '#212121',
  DISABLED: '#9E9E9E',
};
