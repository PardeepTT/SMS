// Event controller functions

// Example in-memory events
const events = [
  {
    id: 1,
    title: 'Parent-Teacher Conference',
    description: 'Discuss student progress and address any concerns',
    location: 'School Auditorium',
    startTime: '2023-06-15T15:00:00Z',
    endTime: '2023-06-15T19:00:00Z',
    type: 'meeting',
    createdBy: 1,
    createdAt: new Date('2023-05-20'),
    audience: ['teachers', 'parents']
  },
  {
    id: 2,
    title: 'Math Test - Grade 5',
    description: 'Fractions and decimals unit test',
    location: 'Classroom 103',
    startTime: '2023-06-10T09:00:00Z',
    endTime: '2023-06-10T10:30:00Z',
    type: 'assignment',
    createdBy: 1,
    createdAt: new Date('2023-05-25'),
    audience: ['teachers', 'parents']
  },
  {
    id: 3,
    title: 'School Field Trip',
    description: 'Science museum visit',
    location: 'City Science Museum',
    startTime: '2023-06-20T08:00:00Z',
    endTime: '2023-06-20T15:00:00Z',
    type: 'school',
    createdBy: 1,
    createdAt: new Date('2023-05-10'),
    audience: ['teachers', 'parents']
  },
  {
    id: 4,
    title: 'Faculty Meeting',
    description: 'End of year planning and assessment discussion',
    location: 'Staff Room',
    startTime: '2023-06-12T14:00:00Z',
    endTime: '2023-06-12T16:00:00Z',
    type: 'meeting',
    createdBy: 1,
    createdAt: new Date('2023-05-28'),
    audience: ['teachers']
  }
];

// Get events for a user based on their role
const getEvents = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    const role = req.query.role;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these events' });
    }
    
    // Filter events based on user role
    const userEvents = events.filter(e => e.audience.includes(role));
    
    // Sort by start time ascending
    userEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    res.json(userEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

module.exports = {
  getEvents
};