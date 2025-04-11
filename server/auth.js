const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory user database for this example
const users = [
  {
    id: 1,
    name: 'Jane Smith',
    email: 'teacher@example.com',
    password: '$2a$10$GVV5YsgjWX4fTqVCN0y1xOGTmNhgF8FJpIoAq83Pfx.3QqOzjhW4W', // password: teacher123
    role: 'teacher',
    profilePicture: null,
    createdAt: new Date('2023-01-15'),
    lastActive: new Date(),
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'parent@example.com',
    password: '$2a$10$DU5hpHEvLCvgkrY/a9lV.uWkSPwIVEI7Sr9yOp8pbHzGzYTSJ.f/a', // password: parent123
    role: 'parent',
    profilePicture: null,
    createdAt: new Date('2023-01-20'),
    lastActive: new Date(),
  }
];

function setupAuth(app) {
  // Configure passport local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = users.find(u => u.email === email);
        
        // User not found or password doesn't match
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Update last active time
        user.lastActive = new Date();
        
        // Return authenticated user
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser((id, done) => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Initialize passport in the app
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
        role: role || 'parent', // Default to parent if no role specified
        profilePicture: null,
        createdAt: new Date(),
        lastActive: new Date(),
      };
      
      // Add to users array
      users.push(newUser);
      
      // Log in the new user
      req.logIn(newUser, (err) => {
        if (err) {
          return next(err);
        }
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

module.exports = { setupAuth };