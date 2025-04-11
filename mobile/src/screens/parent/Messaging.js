import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Appbar,
  TextInput,
  IconButton,
  Surface,
  Divider,
  List,
  Avatar,
  Text,
  useTheme,
  ActivityIndicator,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import MessageItem from '../../components/MessageItem';
import { getContacts, getMessages, sendMessage, markMessageAsRead } from '../../utils/api';
import { formatDateTime } from '../../utils/dateUtils';

const Messaging = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const flatListRef = useRef(null);

  // If coming from a specific screen with recipient data
  useEffect(() => {
    if (route.params?.recipientId && route.params?.recipientName) {
      const recipient = {
        id: route.params.recipientId,
        name: route.params.recipientName,
        role: 'teacher', // Assuming teacher if coming from student details
      };
      handleSelectChat(recipient);
    }
  }, [route.params]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const contactsData = await getContacts(user.id);
      setContacts(contactsData);
      setIsLoadingContacts(false);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setIsLoadingContacts(false);
    }
  };

  const loadMessages = async (chatId) => {
    setIsLoadingMessages(true);
    try {
      const messagesData = await getMessages(chatId);
      setMessages(messagesData);
      setIsLoadingMessages(false);
      
      // Mark unread messages as read
      const unreadMessages = messagesData.filter(
        (msg) => !msg.isRead && msg.senderId !== user.id
      );
      
      if (unreadMessages.length > 0) {
        for (const msg of unreadMessages) {
          await markMessageAsRead(msg.id);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    
    setIsSendingMessage(true);
    try {
      const messageSent = await sendMessage({
        senderId: user.id,
        receiverId: activeChatUser.id,
        content: newMessage,
        chatId: activeChatId,
        timestamp: new Date().toISOString(),
      });
      
      // Update local messages with the sent message
      setMessages([...messages, messageSent]);
      setNewMessage('');
      setIsSendingMessage(false);
      
      // Scroll to bottom
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSendingMessage(false);
    }
  };

  const handleSelectChat = (selectedContact) => {
    // Generate a chat ID based on both user IDs (ordered to ensure consistency)
    const userIds = [user.id, selectedContact.id].sort();
    const chatId = `chat_${userIds[0]}_${userIds[1]}`;
    
    setActiveChatId(chatId);
    setActiveChatUser(selectedContact);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContactItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.lastMessage ? item.lastMessage.substring(0, 30) + (item.lastMessage.length > 30 ? '...' : '') : ''}
      descriptionNumberOfLines={1}
      left={props => (
        <Avatar.Text
          {...props}
          label={item.name.substring(0, 2).toUpperCase()}
          size={40}
          style={{ backgroundColor: item.unreadCount > 0 ? theme.colors.primary : '#9e9e9e' }}
        />
      )}
      right={props => 
        item.unreadCount > 0 ? (
          <Chip {...props} mode="flat" style={styles.unreadChip}>
            {item.unreadCount}
          </Chip>
        ) : null
      }
      onPress={() => handleSelectChat(item)}
      style={[
        styles.contactItem,
        activeChatUser?.id === item.id && styles.activeContactItem
      ]}
    />
  );

  const renderMessageItem = ({ item }) => (
    <MessageItem
      message={item}
      isOwn={item.senderId === user.id}
      timestamp={formatDateTime(item.timestamp)}
    />
  );

  const renderChatHeader = () => (
    <Appbar.Header>
      {activeChatUser ? (
        <>
          <Appbar.BackAction onPress={() => {
            setActiveChatId(null);
            setActiveChatUser(null);
          }} />
          <Appbar.Content
            title={activeChatUser.name}
            subtitle={`${activeChatUser.role.charAt(0).toUpperCase() + activeChatUser.role.slice(1)}`}
          />
        </>
      ) : (
        <Appbar.Content title="Messages" />
      )}
      <Appbar.Action icon="magnify" onPress={() => {}} />
      <Appbar.Action
        icon="keyboard-backspace"
        onPress={() => navigation.goBack()}
      />
    </Appbar.Header>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      {renderChatHeader()}

      {!activeChatUser ? (
        // Contacts List View
        <View style={styles.contactsContainer}>
          <Searchbar
            placeholder="Search contacts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          {isLoadingContacts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No contacts available</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderContactItem}
              ItemSeparatorComponent={() => <Divider />}
              contentContainerStyle={styles.contactsList}
            />
          )}
        </View>
      ) : (
        // Chat View
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => 
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              onLayout={() => 
                flatListRef.current?.scrollToEnd({ animated: false })
              }
            />
          )}

          <Surface style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              style={styles.input}
              multiline
              disabled={isSendingMessage}
            />
            <IconButton
              icon="send"
              size={28}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isSendingMessage}
              loading={isSendingMessage}
              style={styles.sendButton}
            />
          </Surface>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contactsContainer: {
    flex: 1,
  },
  searchBar: {
    margin: 8,
    elevation: 0,
  },
  contactsList: {
    flexGrow: 1,
  },
  contactItem: {
    backgroundColor: '#ffffff',
  },
  activeContactItem: {
    backgroundColor: '#e3f2fd',
  },
  unreadChip: {
    marginRight: 8,
    alignSelf: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#757575',
  },
});

export default Messaging;
