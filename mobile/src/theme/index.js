import { DefaultTheme } from 'react-native-paper';

// Define your custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1565C0', // Primary blue
    accent: '#00796B', // Teal
    background: '#F5F5F5', // Light grey background
    surface: '#FFFFFF', // White surface
    text: '#212121', // Near black for text
    error: '#B00020', // Standard error red
    notification: '#2196F3', // Light blue for notifications
    placeholder: '#9E9E9E', // Grey for placeholders
    backdrop: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
    onSurface: '#212121', // Text on surface
    disabled: '#BDBDBD', // Disabled state
    
    // Custom colors for the app
    success: '#4CAF50', // Green for success states
    warning: '#FFC107', // Amber for warnings
    info: '#2196F3', // Blue for info
    
    // Role-specific colors
    teacher: '#4CAF50', // Green for teachers
    parent: '#2196F3', // Blue for parents
    admin: '#673AB7', // Purple for admins
    
    // Status colors
    present: '#4CAF50', // Green
    absent: '#F44336', // Red
    tardy: '#FFC107', // Amber
    excused: '#2196F3', // Blue
    
    // Grade colors
    gradeA: '#4CAF50', // Green (≥90%)
    gradeB: '#8BC34A', // Light Green (≥80%)
    gradeC: '#FFC107', // Amber (≥70%)
    gradeD: '#FF9800', // Orange (≥60%)
    gradeF: '#F44336', // Red (<60%)
    
    // Event type colors
    schoolEvent: '#4CAF50', // Green
    assignment: '#FF9800', // Orange
    meeting: '#2196F3', // Blue
    holiday: '#9C27B0', // Purple
    deadline: '#F44336', // Red
  },
  
  // Add custom font configuration
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
  
  // Add custom roundness
  roundness: 8,
  
  // Add custom animation
  animation: {
    scale: 1.0,
  },
  
  // Custom border widths
  borderWidths: {
    thin: 1,
    thick: 2,
  },
  
  // Custom sizes
  sizes: {
    buttonHeight: 48,
    inputHeight: 54,
    iconSize: 24,
    avatarSize: 40,
    smallAvatarSize: 28,
    largeAvatarSize: 64,
  },
};

export default theme;

// Helper functions for theme
export const getGradeColor = (score) => {
  if (score >= 90) return theme.colors.gradeA;
  if (score >= 80) return theme.colors.gradeB;
  if (score >= 70) return theme.colors.gradeC;
  if (score >= 60) return theme.colors.gradeD;
  return theme.colors.gradeF;
};

export const getAttendanceColor = (status) => {
  switch (status) {
    case 'present':
      return theme.colors.present;
    case 'absent':
      return theme.colors.absent;
    case 'tardy':
      return theme.colors.tardy;
    case 'excused':
      return theme.colors.excused;
    default:
      return theme.colors.disabled;
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'teacher':
      return theme.colors.teacher;
    case 'parent':
      return theme.colors.parent;
    case 'admin':
      return theme.colors.admin;
    default:
      return theme.colors.primary;
  }
};

export const getEventColor = (type) => {
  switch (type) {
    case 'school':
      return theme.colors.schoolEvent;
    case 'assignment':
      return theme.colors.assignment;
    case 'meeting':
      return theme.colors.meeting;
    case 'holiday':
      return theme.colors.holiday;
    case 'deadline':
      return theme.colors.deadline;
    default:
      return theme.colors.disabled;
  }
};
