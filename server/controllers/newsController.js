// News controller functions

// Example in-memory news and announcements
const news = [
  {
    id: 1,
    title: 'Summer School Registration Now Open',
    content: 'Registration for summer school programs is now open. Visit the school office or website to sign up.',
    category: 'announcement',
    imageUrl: null,
    publishDate: '2023-05-15',
    author: 'Admin',
    featured: true,
    createdAt: new Date('2023-05-15')
  },
  {
    id: 2,
    title: 'Student Art Exhibition',
    content: 'Join us for the annual student art exhibition in the school gallery. Opening night is June 5th at 6 PM.',
    category: 'event',
    imageUrl: null,
    publishDate: '2023-05-20',
    author: 'Art Department',
    featured: false,
    createdAt: new Date('2023-05-20')
  },
  {
    id: 3,
    title: 'End-of-Year Schedule',
    content: 'Please note the adjusted schedule for the last week of school. Early dismissal on Friday, June 23rd.',
    category: 'announcement',
    imageUrl: null,
    publishDate: '2023-05-25',
    author: 'Principal',
    featured: true,
    createdAt: new Date('2023-05-25')
  },
  {
    id: 4,
    title: 'New Math Curriculum for Next Year',
    content: 'We\'re excited to announce our new math curriculum for the 2023-2024 school year. More information coming soon.',
    category: 'newsletter',
    imageUrl: null,
    publishDate: '2023-06-01',
    author: 'Curriculum Committee',
    featured: false,
    createdAt: new Date('2023-06-01')
  }
];

// Get school news
const getSchoolNews = (req, res) => {
  try {
    // Filter news if needed (e.g., by category, date range)
    const allNews = [...news];
    
    // Sort by publish date descending
    allNews.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    
    res.json(allNews);
  } catch (error) {
    console.error('Error fetching school news:', error);
    res.status(500).json({ message: 'Error fetching school news' });
  }
};

// Get recent announcements
const getRecentAnnouncements = (req, res) => {
  try {
    // Get only announcements
    const announcements = news.filter(n => n.category === 'announcement');
    
    // Sort by publish date descending
    announcements.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    
    // Return only the 3 most recent
    const recentAnnouncements = announcements.slice(0, 3);
    
    res.json(recentAnnouncements);
  } catch (error) {
    console.error('Error fetching recent announcements:', error);
    res.status(500).json({ message: 'Error fetching recent announcements' });
  }
};

// Create a new announcement
const createAnnouncement = (req, res) => {
  try {
    const { title, content, category, imageUrl, featured } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }
    
    // Check if user is authorized (admin or teacher)
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: not authorized to create announcements' });
    }
    
    // Create new announcement
    const newAnnouncement = {
      id: news.length + 1,
      title,
      content,
      category,
      imageUrl: imageUrl || null,
      publishDate: new Date().toISOString().split('T')[0],
      author: req.user.name,
      featured: featured || false,
      createdAt: new Date()
    };
    
    news.push(newAnnouncement);
    
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
};

// Update an existing announcement
const updateAnnouncement = (req, res) => {
  try {
    const announcementId = parseInt(req.params.id);
    const { title, content, category, imageUrl, featured } = req.body;
    
    // Find the announcement
    const announcement = news.find(n => n.id === announcementId);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user is authorized (admin or the author if a teacher)
    if (req.user.role !== 'admin' && (req.user.role !== 'teacher' || announcement.author !== req.user.name)) {
      return res.status(403).json({ message: 'Forbidden: not authorized to update this announcement' });
    }
    
    // Update the announcement
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    announcement.imageUrl = imageUrl; // Allow setting to null
    if (featured !== undefined) announcement.featured = featured;
    
    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Error updating announcement' });
  }
};

// Delete an announcement
const deleteAnnouncement = (req, res) => {
  try {
    const announcementId = parseInt(req.params.id);
    
    // Find the announcement
    const announcementIndex = news.findIndex(n => n.id === announcementId);
    
    if (announcementIndex === -1) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user is authorized (admin or the author if a teacher)
    if (req.user.role !== 'admin' && (req.user.role !== 'teacher' || news[announcementIndex].author !== req.user.name)) {
      return res.status(403).json({ message: 'Forbidden: not authorized to delete this announcement' });
    }
    
    // Remove the announcement
    const deletedAnnouncement = news.splice(announcementIndex, 1)[0];
    
    res.json({ message: 'Announcement deleted successfully', announcement: deletedAnnouncement });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Error deleting announcement' });
  }
};

module.exports = {
  getSchoolNews,
  getRecentAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};