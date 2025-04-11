// Student controller functions

// Example in-memory students for demo
const students = [
  {
    id: 101,
    name: 'Emma Doe',
    grade: 5,
    parentId: 2,
    teacherId: 1,
    profilePicture: null,
    dateOfBirth: '2013-05-12',
    emergencyContact: '+1234567890',
    medicalInfo: null,
    createdAt: new Date('2023-01-15')
  },
  {
    id: 102,
    name: 'Michael Doe',
    grade: 3,
    parentId: 2,
    teacherId: 1,
    profilePicture: null,
    dateOfBirth: '2015-09-22',
    emergencyContact: '+1234567890',
    medicalInfo: 'Allergic to peanuts',
    createdAt: new Date('2023-01-15')
  }
];

// Example in-memory student notes for demo
const studentNotes = [
  {
    id: 1,
    studentId: 101,
    teacherId: 1,
    note: 'Emma is showing great improvement in math this quarter.',
    createdAt: new Date('2023-05-15')
  },
  {
    id: 2,
    studentId: 102,
    teacherId: 1,
    note: 'Michael struggled with the recent science project. Need to follow up with parents.',
    createdAt: new Date('2023-05-20')
  }
];

// Get students for a parent
const getStudentsByParent = (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    
    if (req.user.id !== parentId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these students' });
    }
    
    const parentStudents = students.filter(s => s.parentId === parentId);
    res.json(parentStudents);
  } catch (error) {
    console.error('Error fetching parent students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// Get students for a teacher
const getTeacherStudents = (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    
    if (req.user.id !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these students' });
    }
    
    const teacherStudents = students.filter(s => s.teacherId === teacherId);
    res.json(teacherStudents);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// Get a student's details
const getStudentDetails = (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is authorized to view this student
    if (req.user.id !== student.parentId && req.user.id !== student.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to view this student' });
    }
    
    // Get student notes if user is teacher or admin
    let notes = [];
    if (req.user.id === student.teacherId || req.user.role === 'admin') {
      notes = studentNotes.filter(n => n.studentId === studentId);
    }
    
    res.json({
      ...student,
      notes
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Error fetching student details' });
  }
};

// Get a student's attendance
const getStudentAttendance = (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is authorized to view this student's attendance
    if (req.user.id !== student.parentId && req.user.id !== student.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to view this student\'s attendance' });
    }
    
    // Get student attendance from the attendanceController
    // For this example, we'll return a placeholder
    res.json({
      student: {
        id: student.id,
        name: student.name
      },
      attendance: [
        {
          date: '2023-06-01',
          status: 'present',
          notes: null
        },
        {
          date: '2023-06-02',
          status: 'absent',
          notes: 'Parent called to report illness'
        },
        {
          date: '2023-06-05',
          status: 'present',
          notes: null
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Error fetching student attendance' });
  }
};

// Get a student's grades
const getStudentGrades = (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is authorized to view this student's grades
    if (req.user.id !== student.parentId && req.user.id !== student.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to view this student\'s grades' });
    }
    
    // Get student grades from the gradeController
    // For this example, we'll return a placeholder
    res.json({
      student: {
        id: student.id,
        name: student.name
      },
      grades: [
        {
          id: 1,
          subject: 'Math',
          assignmentName: 'Fractions Quiz',
          score: 90,
          maxScore: 100,
          date: '2023-05-15',
          comments: 'Excellent work!'
        },
        {
          id: 2,
          subject: 'Science',
          assignmentName: 'Plant Life Cycle Project',
          score: 85,
          maxScore: 100,
          date: '2023-05-20',
          comments: 'Good presentation, but missing some details.'
        },
        {
          id: 3,
          subject: 'English',
          assignmentName: 'Book Report',
          score: 95,
          maxScore: 100,
          date: '2023-05-25',
          comments: 'Outstanding analysis and writing!'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Error fetching student grades' });
  }
};

// Get a student's assignments
const getStudentAssignments = (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is authorized to view this student's assignments
    if (req.user.id !== student.parentId && req.user.id !== student.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to view this student\'s assignments' });
    }
    
    // Get student assignments from the assignmentController
    // For this example, we'll return a placeholder
    res.json({
      student: {
        id: student.id,
        name: student.name
      },
      assignments: [
        {
          id: 1,
          subject: 'Math',
          title: 'Multiplication Worksheet',
          description: 'Complete the multiplication tables 1-12',
          dueDate: '2023-06-10',
          status: 'assigned',
          attachments: null
        },
        {
          id: 2,
          subject: 'Science',
          title: 'Weather Journal',
          description: 'Track and record the weather for one week',
          dueDate: '2023-06-15',
          status: 'assigned',
          attachments: null
        },
        {
          id: 3,
          subject: 'English',
          title: 'Vocabulary Quiz',
          description: 'Study the vocabulary words for Friday\'s quiz',
          dueDate: '2023-06-09',
          status: 'assigned',
          attachments: null
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: 'Error fetching student assignments' });
  }
};

// Add a note to a student
const addStudentNote = (req, res) => {
  try {
    const { studentId, note } = req.body;
    
    if (!studentId || !note) {
      return res.status(400).json({ message: 'Student ID and note are required' });
    }
    
    const student = students.find(s => s.id === parseInt(studentId));
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if user is authorized to add notes to this student
    if (req.user.id !== student.teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to add notes to this student' });
    }
    
    // Create new note
    const newNote = {
      id: studentNotes.length + 1,
      studentId: parseInt(studentId),
      teacherId: req.user.id,
      note,
      createdAt: new Date()
    };
    
    studentNotes.push(newNote);
    
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error adding student note:', error);
    res.status(500).json({ message: 'Error adding student note' });
  }
};

module.exports = {
  getStudentsByParent,
  getTeacherStudents,
  getStudentDetails,
  getStudentAttendance,
  getStudentGrades,
  getStudentAssignments,
  addStudentNote
};