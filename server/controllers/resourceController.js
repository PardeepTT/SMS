// Resource controller functions

// Example in-memory resources
const resources = [
  {
    id: 1,
    title: 'Math Worksheets - Grade 5',
    description: 'Practice worksheets for 5th grade math curriculum',
    type: 'document',
    url: 'https://example.com/resources/math-g5.pdf',
    uploadedBy: 1,
    createdAt: new Date('2023-05-10'),
    tags: ['math', 'grade 5', 'practice']
  },
  {
    id: 2,
    title: 'Science Lab Safety Guidelines',
    description: 'Safety procedures for all school science labs',
    type: 'document',
    url: 'https://example.com/resources/lab-safety.pdf',
    uploadedBy: 1,
    createdAt: new Date('2023-05-15'),
    tags: ['science', 'safety', 'lab']
  },
  {
    id: 3,
    title: 'Parent Volunteer Sign-up Form',
    description: 'Form for parents to sign up for volunteer opportunities',
    type: 'document',
    url: 'https://example.com/resources/volunteer-form.pdf',
    uploadedBy: 1,
    createdAt: new Date('2023-05-20'),
    tags: ['parent', 'volunteer', 'form']
  }
];

// Example in-memory resource requests
const resourceRequests = [
  {
    id: 1,
    userId: 2,
    title: 'Reading List for Summer',
    description: 'Could we get a recommended reading list for summer break?',
    status: 'pending',
    createdAt: new Date('2023-06-01'),
    resolvedAt: null,
    resolvedBy: null,
    response: null
  }
];

// Get resources for a user
const getResources = (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not authorized to access these resources' });
    }
    
    // In a real app, would filter resources based on user's role, grade level, etc.
    // For this example, return all resources
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

// Request a resource
const requestResource = (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Create new request
    const newRequest = {
      id: resourceRequests.length + 1,
      userId: req.user.id,
      title,
      description: description || null,
      status: 'pending',
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      response: null
    };
    
    resourceRequests.push(newRequest);
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error requesting resource:', error);
    res.status(500).json({ message: 'Error requesting resource' });
  }
};

module.exports = {
  getResources,
  requestResource
};