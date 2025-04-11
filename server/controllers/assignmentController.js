// Assignment controller functions

// Example in-memory assignments
const assignments = [
  {
    id: 1,
    teacherId: 1,
    subject: 'Math',
    title: 'Multiplication Worksheet',
    description: 'Complete the multiplication tables 1-12',
    dueDate: '2023-06-10',
    createdAt: new Date('2023-06-01'),
    attachments: null
  },
  {
    id: 2,
    teacherId: 1,
    subject: 'Science',
    title: 'Weather Journal',
    description: 'Track and record the weather for one week',
    dueDate: '2023-06-15',
    createdAt: new Date('2023-06-02'),
    attachments: null
  },
  {
    id: 3,
    teacherId: 1,
    subject: 'English',
    title: 'Vocabulary Quiz',
    description: 'Study the vocabulary words for Friday\'s quiz',
    dueDate: '2023-06-09',
    createdAt: new Date('2023-06-01'),
    attachments: null
  }
];

// Example in-memory student assignment status
const assignmentStatus = [
  {
    id: 1,
    assignmentId: 1,
    studentId: 101,
    status: 'in_progress',
    submissionDate: null,
    grade: null,
    feedback: null
  },
  {
    id: 2,
    assignmentId: 1,
    studentId: 102,
    status: 'not_started',
    submissionDate: null,
    grade: null,
    feedback: null
  },
  {
    id: 3,
    assignmentId: 2,
    studentId: 101,
    status: 'not_started',
    submissionDate: null,
    grade: null,
    feedback: null
  },
  {
    id: 4,
    assignmentId: 2,
    studentId: 102,
    status: 'not_started',
    submissionDate: null,
    grade: null,
    feedback: null
  },
  {
    id: 5,
    assignmentId: 3,
    studentId: 101,
    status: 'not_started',
    submissionDate: null,
    grade: null,
    feedback: null
  },
  {
    id: 6,
    assignmentId: 3,
    studentId: 102,
    status: 'not_started',
    submissionDate: null,
    grade: null,
    feedback: null
  }
];

// Get assignments for a teacher
const getAssignments = (req, res) => {
  try {
    const teacherId = parseInt(req.query.teacherId);
    
    // Check if user is authorized
    if (req.user.id !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these assignments' });
    }
    
    const teacherAssignments = assignments.filter(a => a.teacherId === teacherId);
    
    // Sort by due date ascending
    teacherAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.json(teacherAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

// Get upcoming assignments for a teacher
const getUpcomingAssignments = (req, res) => {
  try {
    const teacherId = parseInt(req.query.teacherId);
    
    // Check if user is authorized
    if (req.user.id !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these assignments' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAssignments = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return a.teacherId === teacherId && dueDate >= today;
    });
    
    // Sort by due date ascending
    upcomingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.json(upcomingAssignments);
  } catch (error) {
    console.error('Error fetching upcoming assignments:', error);
    res.status(500).json({ message: 'Error fetching upcoming assignments' });
  }
};

// Create a new assignment
const createAssignment = (req, res) => {
  try {
    const { subject, title, description, dueDate, attachments } = req.body;
    
    if (!subject || !title || !dueDate) {
      return res.status(400).json({ message: 'Subject, title, and due date are required' });
    }
    
    // Create new assignment
    const newAssignment = {
      id: assignments.length + 1,
      teacherId: req.user.id,
      subject,
      title,
      description: description || null,
      dueDate,
      createdAt: new Date(),
      attachments: attachments || null
    };
    
    assignments.push(newAssignment);
    
    // Create assignment status entries for all students taught by this teacher
    // In a real app, would get the students from the database
    const studentIds = [101, 102]; // Hard-coded for this example
    
    studentIds.forEach(studentId => {
      assignmentStatus.push({
        id: assignmentStatus.length + 1,
        assignmentId: newAssignment.id,
        studentId,
        status: 'not_started',
        submissionDate: null,
        grade: null,
        feedback: null
      });
    });
    
    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

// Update an existing assignment
const updateAssignment = (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { subject, title, description, dueDate, attachments } = req.body;
    
    // Find the assignment
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized
    if (assignment.teacherId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to update this assignment' });
    }
    
    // Update the assignment
    if (subject) assignment.subject = subject;
    if (title) assignment.title = title;
    assignment.description = description; // Allow setting to null
    if (dueDate) assignment.dueDate = dueDate;
    assignment.attachments = attachments; // Allow setting to null
    
    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment' });
  }
};

// Delete an assignment
const deleteAssignment = (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    
    // Find the assignment
    const assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
    
    if (assignmentIndex === -1) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized
    if (assignments[assignmentIndex].teacherId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to delete this assignment' });
    }
    
    // Remove the assignment
    const deletedAssignment = assignments.splice(assignmentIndex, 1)[0];
    
    // Remove all assignment status entries for this assignment
    for (let i = assignmentStatus.length - 1; i >= 0; i--) {
      if (assignmentStatus[i].assignmentId === assignmentId) {
        assignmentStatus.splice(i, 1);
      }
    }
    
    res.json({ message: 'Assignment deleted successfully', assignment: deletedAssignment });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
};

// Get submissions for an assignment
const getSubmissions = (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    
    // Find the assignment
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized
    if (assignment.teacherId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to view these submissions' });
    }
    
    // Get all statuses for this assignment
    const submissionStatuses = assignmentStatus.filter(s => s.assignmentId === assignmentId);
    
    // In a real app, would join with student data to include names
    const submissions = submissionStatuses.map(status => ({
      studentId: status.studentId,
      studentName: `Student ${status.studentId}`, // Placeholder, would fetch from DB
      status: status.status,
      submissionDate: status.submissionDate,
      grade: status.grade,
      feedback: status.feedback
    }));
    
    res.json({
      assignment,
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

module.exports = {
  getAssignments,
  getUpcomingAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions
};