// Grade controller functions

// Example in-memory grades
const grades = [
  {
    id: 1,
    studentId: 101,
    teacherId: 1,
    subject: 'Math',
    assignmentName: 'Fractions Quiz',
    score: 90,
    maxScore: 100,
    date: '2023-05-15',
    comments: 'Excellent work!',
    createdAt: new Date('2023-05-15')
  },
  {
    id: 2,
    studentId: 101,
    teacherId: 1,
    subject: 'Science',
    assignmentName: 'Plant Life Cycle Project',
    score: 85,
    maxScore: 100,
    date: '2023-05-20',
    comments: 'Good presentation, but missing some details.',
    createdAt: new Date('2023-05-20')
  },
  {
    id: 3,
    studentId: 101,
    teacherId: 1,
    subject: 'English',
    assignmentName: 'Book Report',
    score: 95,
    maxScore: 100,
    date: '2023-05-25',
    comments: 'Outstanding analysis and writing!',
    createdAt: new Date('2023-05-25')
  },
  {
    id: 4,
    studentId: 102,
    teacherId: 1,
    subject: 'Math',
    assignmentName: 'Fractions Quiz',
    score: 80,
    maxScore: 100,
    date: '2023-05-15',
    comments: 'Good effort, but needs more practice with improper fractions.',
    createdAt: new Date('2023-05-15')
  },
  {
    id: 5,
    studentId: 102,
    teacherId: 1,
    subject: 'Science',
    assignmentName: 'Plant Life Cycle Project',
    score: 70,
    maxScore: 100,
    date: '2023-05-20',
    comments: 'Project was incomplete and missing key components.',
    createdAt: new Date('2023-05-20')
  },
  {
    id: 6,
    studentId: 102,
    teacherId: 1,
    subject: 'English',
    assignmentName: 'Book Report',
    score: 85,
    maxScore: 100,
    date: '2023-05-25',
    comments: 'Good insights, but some grammatical errors.',
    createdAt: new Date('2023-05-25')
  }
];

// Get grades
const getGrades = (req, res) => {
  try {
    const teacherId = parseInt(req.query.teacherId);
    const studentId = req.query.studentId ? parseInt(req.query.studentId) : null;
    const assignmentId = req.query.assignmentId ? parseInt(req.query.assignmentId) : null;
    
    // Check if teacher is authorized
    if (req.user.id !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these grades' });
    }
    
    let filteredGrades = [...grades];
    
    // Filter by teacher
    filteredGrades = filteredGrades.filter(g => g.teacherId === teacherId);
    
    // Filter by student if provided
    if (studentId) {
      filteredGrades = filteredGrades.filter(g => g.studentId === studentId);
    }
    
    // Filter by assignment if provided (not implemented in the example data)
    if (assignmentId) {
      // This would filter by assignment ID in a real implementation
    }
    
    // Sort by date descending
    filteredGrades.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(filteredGrades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Error fetching grades' });
  }
};

// Add a new grade
const addGrade = (req, res) => {
  try {
    const { studentId, subject, assignmentName, score, maxScore, date, comments } = req.body;
    
    if (!studentId || !subject || !assignmentName || score === undefined || !maxScore) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Check if teacher is authorized (in a real app, would check if teacher teaches this student)
    
    // Create new grade
    const newGrade = {
      id: grades.length + 1,
      studentId: parseInt(studentId),
      teacherId: req.user.id,
      subject,
      assignmentName,
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      date: date || new Date().toISOString().split('T')[0],
      comments: comments || null,
      createdAt: new Date()
    };
    
    grades.push(newGrade);
    
    res.status(201).json(newGrade);
  } catch (error) {
    console.error('Error adding grade:', error);
    res.status(500).json({ message: 'Error adding grade' });
  }
};

// Update an existing grade
const updateGrade = (req, res) => {
  try {
    const gradeId = parseInt(req.params.id);
    const { subject, assignmentName, score, maxScore, date, comments } = req.body;
    
    // Find the grade
    const grade = grades.find(g => g.id === gradeId);
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    // Check if teacher is authorized
    if (grade.teacherId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to update this grade' });
    }
    
    // Update the grade
    if (subject) grade.subject = subject;
    if (assignmentName) grade.assignmentName = assignmentName;
    if (score !== undefined) grade.score = parseFloat(score);
    if (maxScore) grade.maxScore = parseFloat(maxScore);
    if (date) grade.date = date;
    grade.comments = comments; // Allow setting to null
    
    res.json(grade);
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Error updating grade' });
  }
};

module.exports = {
  getGrades,
  addGrade,
  updateGrade
};