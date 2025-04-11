// Format a date string as "Month Day, Year"
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

// Format a date string as "Month Day, Year, HH:MM AM/PM"
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  return `${date.toLocaleDateString(undefined, dateOptions)}, ${date.toLocaleTimeString(undefined, timeOptions)}`;
};

// Format a date string as "h:mm a" (e.g., "2:30 PM")
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return date.toLocaleTimeString(undefined, options);
};

// Check if two dates are the same day
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Check if a date is today
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  return isSameDay(date, today);
};

// Check if a date is in the past
export const isPast = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Set time to beginning of day for both dates
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  return date < now;
};

// Check if a date is overdue (past the due date)
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  const now = new Date();
  
  return dueDate < now;
};

// Get relative time (e.g., "2 days ago", "in 3 hours")
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  const diffInMs = date - now;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHours = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays === 0) {
    if (diffInHours === 0) {
      if (diffInMin === 0) {
        return 'just now';
      }
      
      if (diffInMin > 0) {
        return `in ${diffInMin} minute${diffInMin !== 1 ? 's' : ''}`;
      } else {
        return `${Math.abs(diffInMin)} minute${Math.abs(diffInMin) !== 1 ? 's' : ''} ago`;
      }
    }
    
    if (diffInHours > 0) {
      return `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
    }
  }
  
  if (diffInDays > 0) {
    return `in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
  } else {
    return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
  }
};

// Get the month and year string (e.g., "January 2023")
export const getMonthYearString = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long' };
  return date.toLocaleDateString(undefined, options);
};

// Format a date range (e.g., "January 10-15, 2023" or "January 30 - February 5, 2023")
export const formatDateRange = (startDateString, endDateString) => {
  if (!startDateString || !endDateString) return '';
  
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  
  // Check if both dates are in the same month
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
  } else {
    return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }
};
