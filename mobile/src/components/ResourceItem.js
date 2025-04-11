import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, IconButton, Chip, Button, useTheme, Text } from 'react-native-paper';
import { formatDate } from '../utils/dateUtils';

const ResourceItem = ({ resource, onDownload }) => {
  const theme = useTheme();

  // Determine resource type icon and color
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'document':
        return 'file-document-outline';
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'link':
        return 'link';
      case 'archive':
        return 'zip-box';
      case 'presentation':
        return 'file-presentation-box';
      case 'spreadsheet':
        return 'file-excel';
      default:
        return 'file';
    }
  };

  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'document':
        return '#2196F3'; // Blue
      case 'image':
        return '#4CAF50'; // Green
      case 'video':
        return '#F44336'; // Red
      case 'link':
        return '#9C27B0'; // Purple
      case 'archive':
        return '#FF9800'; // Orange
      case 'presentation':
        return '#FF5722'; // Deep Orange
      case 'spreadsheet':
        return '#4CAF50'; // Green
      default:
        return '#757575'; // Grey
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format resource type
  const formatResourceType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const resourceIcon = getResourceTypeIcon(resource.type);
  const resourceColor = getResourceTypeColor(resource.type);

  return (
    <Card style={styles.card} elevation={1}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: resourceColor + '15' }]}>
          <IconButton
            icon={resourceIcon}
            size={24}
            color={resourceColor}
            style={styles.icon}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Title style={styles.title}>{resource.title}</Title>
          
          <View style={styles.metaRow}>
            <Chip style={styles.typeChip} textStyle={{ fontSize: 12 }}>
              {formatResourceType(resource.type)}
            </Chip>
            
            {resource.fileSize && (
              <Text style={styles.fileSize}>
                {formatFileSize(resource.fileSize)}
              </Text>
            )}
          </View>
          
          {resource.description && (
            <Paragraph style={styles.description} numberOfLines={2}>
              {resource.description}
            </Paragraph>
          )}
          
          <View style={styles.footer}>
            <Text style={styles.uploadInfo}>
              {resource.uploaderName && `Uploaded by ${resource.uploaderName}`}
              {resource.uploadDate && ` • ${formatDate(resource.uploadDate)}`}
            </Text>
            
            <Button
              mode="outlined"
              icon="download"
              onPress={() => onDownload(resource)}
              style={styles.downloadButton}
              labelStyle={{ fontSize: 12 }}
              compact
            >
              Download
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
  },
  iconContainer: {
    borderRadius: 50,
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  icon: {
    margin: 0,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
  },
  description: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadInfo: {
    fontSize: 12,
    color: '#9e9e9e',
    flex: 1,
  },
  downloadButton: {
    borderRadius: 16,
  },
});

export default ResourceItem;
