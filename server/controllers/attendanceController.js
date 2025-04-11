// Attendance controller functions

// Example in-memory attendance records
const attendanceRecords = [
  {
    id: 1,
    studentId: 101,
    date: '2023-06-01',
    status: 'present',
    notes: null,
    markedBy: 1,
    createdAt: new Date('2023-06-01T09:00:00Z')
  },
  {
    id: 2,
    studentId: 102,
    date: '2023-06-01',
    status: 'present',
    notes: null,
    markedBy: 1,
    createdAt: new Date('2023-06-01T09:00:00Z')
  },
  {
    id: 3,
    studentId: 101,
    date: '2023-06-02',
    status: 'absent',
    notes: 'Parent called to report illness',
    markedBy: 1,
    createdAt: new Date('2023-06-02T09:00:00Z')
  },
  {
    id: 4,
    studentId: 102,
    date: '2023-06-02',
    status: 'present',
    notes: null,
    markedBy: 1,
    createdAt: new Date('2023-06-02T09:00:00Z')
  },
  {
    id: 5,
    studentId: 101,
    date: '2023-06-05',
    status: 'present',
    notes: null,
    markedBy: 1,
    createdAt: new Date('2023-06-05T09:00:00Z')
  },
  {
    id: 6,
    studentId: 102,
    date: '2023-06-05',
    status: 'tardy',
    notes: 'Arrived 15 minutes late',
    markedBy: 1,
    createdAt: new Date('2023-06-05T09:15:00Z')
  }
];

// Get attendance data
const getAttendanceData = (req, res) => {
  try {
    const teacherId = parseInt(req.query.teacherId);
    const date = req.query.date;
    const studentId = req.query.studentId ? parseInt(req.query.studentId) : null;
    
    // Check if user is authorized
    if (req.user.id !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access this attendance data' });
    }
    
    let filteredRecords = [...attendanceRecords];
    
    // Filter by date if provided
    if (date) {
      filteredRecords = filteredRecords.filter(r => r.date === date);
    }
    
    // Filter by student if provided
    if (studentId) {
      filteredRecords = filteredRecords.filter(r => r.studentId === studentId);
    }
    
    // Sort by date descending
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(filteredRecords);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
};

// Mark attendance
const markAttendance = (req, res) => {
  try {
    const { studentId, date, status, notes } = req.body;
    
    if (!studentId || !date || !status) {
      return res.status(400).json({ message: 'Student ID, date, and status are required' });
    }
    
    // Check if attendance record already exists for this student on this date
    const existingRecord = attendanceRecords.find(r => 
      r.studentId === parseInt(studentId) && r.date === date
    );
    
    if (existingRecord) {
      // Update existing record
      existingRecord.status = status;
      existingRecord.notes = notes;
      existingRecord.markedBy = req.user.id;
      res.json(existingRecord);
    } else {
      // Create new record
      const newRecord = {
        id: attendanceRecords.length + 1,
        studentId: parseInt(studentId),
        date,
        status,
        notes,
        markedBy: req.user.id,
        createdAt: new Date()
      };
      
      attendanceRecords.push(newRecord);
      res.status(201).json(newRecord);
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance' });
  }
};

module.exports = {
  getAttendanceData,
  markAttendance
};