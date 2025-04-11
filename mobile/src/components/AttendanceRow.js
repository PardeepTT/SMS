import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Avatar, Text, Chip, useTheme } from 'react-native-paper';
import { formatDate } from '../utils/dateUtils';

const AttendanceRow = ({ date, status, notes }) => {
  const theme = useTheme();

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#4CAF50'; // Green
      case 'absent':
        return '#F44336'; // Red
      case 'tardy':
        return '#FFC107'; // Yellow
      case 'excused':
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Status icons
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return 'check-circle';
      case 'absent':
        return 'close-circle';
      case 'tardy':
        return 'clock-alert';
      case 'excused':
        return 'account-alert';
      default:
        return 'help-circle';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const formattedDate = formatDate(date);

  return (
    <List.Item
      title={formattedDate}
      description={notes ? notes : undefined}
      left={props => (
        <Avatar.Icon
          {...props}
          icon={statusIcon}
          size={40}
          style={[styles.statusIcon, { backgroundColor: statusColor + '20' }]}
          color={statusColor}
        />
      )}
      right={props => (
        <Chip
          {...props}
          style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
          textStyle={{ color: statusColor }}
        >
          {formatStatus(status)}
        </Chip>
      )}
      style={styles.listItem}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  statusIcon: {
    margin: 8,
  },
  statusChip: {
    alignSelf: 'center',
    marginRight: 8,
  },
});

export default AttendanceRow;
