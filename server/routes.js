const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { authMiddleware } = require('./middleware/auth');
const { validate } = require('./middleware/validation');

// Controllers
const userController = require('./controllers/userController');
const messageController = require('./controllers/messageController');
const studentController = require('./controllers/studentController');
const attendanceController = require('./controllers/attendanceController');
const gradeController = require('./controllers/gradeController');
const assignmentController = require('./controllers/assignmentController');
const eventController = require('./controllers/eventController');
const newsController = require('./controllers/newsController');
const resourceController = require('./controllers/resourceController');

function registerRoutes(app) {
  // User routes
  app.get('/api/user', authMiddleware, userController.getCurrentUser);
  app.put('/api/users/:id', authMiddleware, userController.updateUser);
  app.put('/api/users/:id/password', authMiddleware, userController.changePassword);

  // Parent-Student routes
  app.get('/api/parents/:id/students', authMiddleware, studentController.getStudentsByParent);

  // Teacher-Student routes
  app.get('/api/teachers/:id/students', authMiddleware, studentController.getTeacherStudents);

  // Student routes
  app.get('/api/students/:id', authMiddleware, studentController.getStudentDetails);
  app.get('/api/students/:id/attendance', authMiddleware, studentController.getStudentAttendance);
  app.get('/api/students/:id/grades', authMiddleware, studentController.getStudentGrades);
  app.get('/api/students/:id/assignments', authMiddleware, studentController.getStudentAssignments);
  app.post('/api/student-notes', authMiddleware, studentController.addStudentNote);

  // Attendance routes
  app.get('/api/attendance', authMiddleware, attendanceController.getAttendanceData);
  app.post('/api/attendance', authMiddleware, attendanceController.markAttendance);

  // Grade routes
  app.get('/api/grades', authMiddleware, gradeController.getGrades);
  app.post('/api/grades', authMiddleware, gradeController.addGrade);
  app.put('/api/grades/:id', authMiddleware, gradeController.updateGrade);

  // Assignment routes
  app.get('/api/assignments', authMiddleware, assignmentController.getAssignments);
  app.get('/api/assignments/upcoming', authMiddleware, assignmentController.getUpcomingAssignments);
  app.post('/api/assignments', authMiddleware, assignmentController.createAssignment);
  app.put('/api/assignments/:id', authMiddleware, assignmentController.updateAssignment);
  app.delete('/api/assignments/:id', authMiddleware, assignmentController.deleteAssignment);
  app.get('/api/assignments/:id/submissions', authMiddleware, assignmentController.getSubmissions);

  // Message routes
  app.get('/api/messages/contacts', authMiddleware, messageController.getContacts);
  app.get('/api/messages', authMiddleware, messageController.getMessages);
  app.get('/api/messages/recent', authMiddleware, messageController.getRecentMessages);
  app.post('/api/messages', authMiddleware, messageController.sendMessage);
  app.put('/api/messages/:id/read', authMiddleware, messageController.markMessageAsRead);

  // Event routes
  app.get('/api/events', authMiddleware, eventController.getEvents);

  // News routes
  app.get('/api/news', newsController.getSchoolNews);
  app.get('/api/news/recent', newsController.getRecentAnnouncements);
  app.post('/api/news', authMiddleware, newsController.createAnnouncement);
  app.put('/api/news/:id', authMiddleware, newsController.updateAnnouncement);
  app.delete('/api/news/:id', authMiddleware, newsController.deleteAnnouncement);

  // Resource routes
  app.get('/api/resources', authMiddleware, resourceController.getResources);
  app.post('/api/resources/request', authMiddleware, resourceController.requestResource);

  // Notification routes
  app.get('/api/notifications', authMiddleware, userController.getNotifications);
  app.put('/api/notifications/:id/read', authMiddleware, userController.markNotificationAsRead);
  app.put('/api/notifications/read-all', authMiddleware, userController.markAllNotificationsAsRead);
  app.delete('/api/notifications/:id', authMiddleware, userController.deleteNotification);
  app.delete('/api/notifications', authMiddleware, userController.deleteAllNotifications);

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to School Connect WebSocket server'
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        // Handle different message types
        switch (data.type) {
          case 'chat':
            // Broadcast message to all clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'chat',
                  sender: data.sender,
                  content: data.content,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;
            
          case 'notification':
            // Handle notification - could broadcast to specific users based on data.recipients
            wss.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'notification',
                  title: data.title,
                  message: data.message,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}

module.exports = { registerRoutes };
