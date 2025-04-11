// Message controller functions

// Example in-memory messages for demo
const messages = [
  {
    id: 1,
    chatId: 101,
    senderId: 1,
    recipientId: 2,
    content: 'Hello, I wanted to discuss your child\'s progress in science class.',
    type: 'text',
    read: true,
    createdAt: new Date('2023-06-01T10:00:00Z')
  },
  {
    id: 2,
    chatId: 101,
    senderId: 2,
    recipientId: 1,
    content: 'Great! I\'ve been wanting to talk about that. How is she doing?',
    type: 'text',
    read: true,
    createdAt: new Date('2023-06-01T10:15:00Z')
  },
  {
    id: 3,
    chatId: 101,
    senderId: 1,
    recipientId: 2,
    content: 'She\'s doing well overall, but I think she could use some extra help with the lab work.',
    type: 'text',
    read: false,
    createdAt: new Date('2023-06-01T10:20:00Z')
  },
  {
    id: 4,
    chatId: 102,
    senderId: 1,
    recipientId: 3,
    content: 'Just a reminder that the permission slips for the field trip are due tomorrow.',
    type: 'text',
    read: false,
    createdAt: new Date('2023-06-02T09:30:00Z')
  }
];

// Example in-memory contacts (simplified for demo)
const contacts = [
  {
    userId: 1, // Teacher
    contacts: [
      {
        id: 2,
        name: 'John Doe',
        role: 'parent',
        lastMessage: 'She\'s doing well overall, but I think she could use some extra help with the lab work.',
        lastMessageTime: new Date('2023-06-01T10:20:00Z'),
        unreadCount: 0
      },
      {
        id: 3,
        name: 'Alice Johnson',
        role: 'parent',
        lastMessage: 'Just a reminder that the permission slips for the field trip are due tomorrow.',
        lastMessageTime: new Date('2023-06-02T09:30:00Z'),
        unreadCount: 1
      }
    ]
  },
  {
    userId: 2, // Parent
    contacts: [
      {
        id: 1,
        name: 'Jane Smith',
        role: 'teacher',
        lastMessage: 'She\'s doing well overall, but I think she could use some extra help with the lab work.',
        lastMessageTime: new Date('2023-06-01T10:20:00Z'),
        unreadCount: 1
      }
    ]
  }
];

// Get contacts for a user
const getContacts = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these contacts' });
    }
    
    const userContacts = contacts.find(c => c.userId === userId);
    
    if (!userContacts) {
      return res.json({ contacts: [] });
    }
    
    res.json({ contacts: userContacts.contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

// Get messages for a chat
const getMessages = (req, res) => {
  try {
    const chatId = parseInt(req.query.chatId);
    
    // Ensure the user is a participant in this chat
    const userMessages = messages.filter(m => m.chatId === chatId);
    
    if (userMessages.length > 0) {
      const isParticipant = userMessages.some(m => 
        m.senderId === req.user.id || m.recipientId === req.user.id
      );
      
      if (!isParticipant) {
        return res.status(403).json({ message: 'Forbidden: not a participant in this chat' });
      }
    }
    
    const chatMessages = messages.filter(m => m.chatId === chatId);
    res.json(chatMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// Get recent messages for a user
const getRecentMessages = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these messages' });
    }
    
    // Get all messages where user is sender or recipient
    const userMessages = messages.filter(m => m.senderId === userId || m.recipientId === userId);
    
    // Sort by created time descending
    userMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Get the most recent message from each chat
    const chatIds = new Set();
    const recentMessages = [];
    
    for (const message of userMessages) {
      if (!chatIds.has(message.chatId)) {
        chatIds.add(message.chatId);
        recentMessages.push(message);
      }
    }
    
    res.json(recentMessages);
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ message: 'Error fetching recent messages' });
  }
};

// Send a message
const sendMessage = (req, res) => {
  try {
    const { recipientId, content, type = 'text', chatId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Generate new chat ID if not provided
    let messageChatId = chatId;
    if (!messageChatId) {
      const existingChat = messages.find(m => 
        (m.senderId === req.user.id && m.recipientId === recipientId) ||
        (m.senderId === recipientId && m.recipientId === req.user.id)
      );
      
      if (existingChat) {
        messageChatId = existingChat.chatId;
      } else {
        messageChatId = Date.now(); // Simple way to generate unique ID
      }
    }
    
    // Create new message
    const newMessage = {
      id: messages.length + 1,
      chatId: messageChatId,
      senderId: req.user.id,
      recipientId: parseInt(recipientId),
      content,
      type,
      read: false,
      createdAt: new Date()
    };
    
    messages.push(newMessage);
    
    // Update contact's last message
    updateLastMessage(req.user.id, recipientId, content, newMessage.createdAt);
    updateLastMessage(recipientId, req.user.id, content, newMessage.createdAt, true);
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Mark a message as read
const markMessageAsRead = (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const message = messages.find(m => m.id === messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.recipientId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: not authorized to mark this message as read' });
    }
    
    message.read = true;
    
    // Update unread count in contacts
    const userContacts = contacts.find(c => c.userId === req.user.id);
    if (userContacts) {
      const contact = userContacts.contacts.find(c => c.id === message.senderId);
      if (contact && contact.unreadCount > 0) {
        contact.unreadCount--;
      }
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
};

// Helper function to update last message in contacts
const updateLastMessage = (userId, contactId, message, timestamp, incrementUnread = false) => {
  const userContacts = contacts.find(c => c.userId === userId);
  
  if (userContacts) {
    const contact = userContacts.contacts.find(c => c.id === contactId);
    
    if (contact) {
      contact.lastMessage = message;
      contact.lastMessageTime = timestamp;
      
      if (incrementUnread) {
        contact.unreadCount = (contact.unreadCount || 0) + 1;
      }
    } else {
      // Contact doesn't exist yet, need to add it
      // In a real implementation, you would fetch user details from the database
      userContacts.contacts.push({
        id: contactId,
        name: `User ${contactId}`, // Placeholder, would be fetched from DB
        role: 'unknown', // Placeholder, would be fetched from DB
        lastMessage: message,
        lastMessageTime: timestamp,
        unreadCount: incrementUnread ? 1 : 0
      });
    }
  } else {
    // User has no contacts yet
    contacts.push({
      userId,
      contacts: [
        {
          id: contactId,
          name: `User ${contactId}`, // Placeholder, would be fetched from DB
          role: 'unknown', // Placeholder, would be fetched from DB
          lastMessage: message,
          lastMessageTime: timestamp,
          unreadCount: incrementUnread ? 1 : 0
        }
      ]
    });
  }
};

module.exports = {
  getContacts,
  getMessages,
  getRecentMessages,
  sendMessage,
  markMessageAsRead
};