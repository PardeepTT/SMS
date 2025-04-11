// Authentication middleware

// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

// Middleware to check if user has specific role
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    
    return next();
  };
};

// Middleware to check if user is the owner of a resource
const ownerMiddleware = (getIdFn) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const resourceId = getIdFn(req);
    if (req.user.id !== resourceId) {
      return res.status(403).json({ message: 'Forbidden: not the owner' });
    }
    
    return next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  ownerMiddleware
};