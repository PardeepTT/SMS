import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

const MessageItem = ({ message, isOwn, timestamp }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <Surface
        style={[
          styles.messageBubble,
          isOwn ? 
            { backgroundColor: theme.colors.primary + '15', borderBottomRightRadius: 0 } : 
            { backgroundColor: '#fff', borderBottomLeftRadius: 0 }
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#9e9e9e',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});

export default MessageItem;
